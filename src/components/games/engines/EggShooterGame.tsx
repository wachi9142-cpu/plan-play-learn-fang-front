"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { GameShell, type GameOutcome } from "@/components/games/GameShell";
import {
  EGG_LEVELS, EGG_MODES, EGG_TIPS, findEggLevel, findEggMode,
  type EggKind, type EggLevel, type EggMode,
} from "@/data/egg-shooter";
import { key, lowestRow, pushDown, settleEgg, widthOf, type EggMap } from "@/lib/egg-shooter";
import { playSfx, setSfxOn, sfxOn } from "@/lib/sfx";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;

/** ไข่ที่กำลังลอยอยู่ */
interface Shot { x: number; y: number; vx: number; vy: number; kind: string }
/** ไข่ที่กำลังร่วง (เอฟเฟกต์) */
interface Fall { id: number; x: number; y: number; kind: string }

/**
 * 🥚 ยิงไข่ไดโนเสาร์
 *
 * เลื่อนเมาส์เล็ง แล้วคลิกเพื่อยิงไข่ขึ้นไป — ไข่แบบเดียวกันติดกันครบ 3 ฟองจะแตก
 * เปลี่ยนเกณฑ์การจับคู่ได้ 4 โหมด: สี · รูปร่าง · ตัวเลข · พยัญชนะไทย
 */
export function EggShooterGame({ modeId, levelId, onDone }: { modeId?: string; levelId?: string; onDone?: Cb }) {
  const [phase, setPhase] = useState<"menu" | "play" | "pause" | "over">("menu");
  const [mode, setMode] = useState<EggMode>(() => findEggMode(modeId ?? "color"));
  const [lv, setLv] = useState<EggLevel>(() => findEggLevel(levelId ?? "easy"));

  const [eggs, setEggs] = useState<EggMap>({});
  const [shot, setShot] = useState<Shot | null>(null);
  const [falls, setFalls] = useState<Fall[]>([]);
  const [current, setCurrent] = useState<string>("");
  const [nextKind, setNextKind] = useState<string>("");
  const [aim, setAim] = useState(-Math.PI / 2);
  const [score, setScore] = useState(0);
  const [popped, setPopped] = useState(0);
  const [shots, setShots] = useState(0);
  const [missStreak, setMissStreak] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [won, setWon] = useState(false);
  const [sound, setSound] = useState(true);
  const [tip, setTip] = useState(0);
  const [ready, setReady] = useState(false);

  const board = useRef<HTMLDivElement>(null);
  const shotRef = useRef<Shot | null>(null);
  const eggsRef = useRef<EggMap>({});
  const fallId = useRef(1);
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { eggsRef.current = eggs; }, [eggs]);
  useEffect(() => { shotRef.current = shot; }, [shot]);

  useEffect(() => { setReady(true); setSound(sfxOn()); }, []);

  /* ---------- ขนาดช่อง (หน่วย cqw = 1% ของความกว้างกระดาน) ---------- */
  const COLS = lv.cols;
  const CW = 100 / (COLS + 0.5);
  const R = CW / 2;
  const ROW_H = CW * 0.87;
  const cx = (r: number, c: number) => (c + (r % 2 === 1 ? 0.5 : 0)) * CW + R;
  const cy = (r: number) => r * ROW_H + R;
  /** ความสูงกระดานในหน่วย cqw */
  const BOARD_H = lv.maxRows * ROW_H + R * 2 + 14;
  const SHOOT_Y = BOARD_H - 7;

  const kinds = mode.kinds.slice(0, lv.kinds);
  const kindOf = (id: string): EggKind => kinds.find((k) => k.id === id) ?? kinds[0];
  const randKind = useCallback((pool: string[]) => {
    const list = pool.length ? pool : kinds.map((k) => k.id);
    return list[Math.floor(Math.random() * list.length)];
  }, [kinds]);

  /* ---------- สร้างด่าน ---------- */
  const build = useCallback((m: EggMode, L: EggLevel) => {
    const ks = m.kinds.slice(0, L.kinds).map((k) => k.id);
    const next: EggMap = {};
    for (let r = 0; r < L.rows; r++) {
      for (let c = 0; c < widthOf(L.cols, r); c++) next[key(r, c)] = { r, c, kind: ks[Math.floor(Math.random() * ks.length)] };
    }
    setEggs(next);
    eggsRef.current = next;
    setShot(null); shotRef.current = null;
    setFalls([]);
    setCurrent(ks[Math.floor(Math.random() * ks.length)]);
    setNextKind(ks[Math.floor(Math.random() * ks.length)]);
    setScore(0); setPopped(0); setShots(0); setMissStreak(0);
    setMsg(null); setWon(false);
    setAim(-Math.PI / 2);
  }, []);

  const start = (m: EggMode, L: EggLevel) => { setMode(m); setLv(L); build(m, L); setPhase("play"); playSfx("pop"); };
  const restart = useCallback(() => { if (phase === "menu") return; build(mode, lv); setPhase("play"); }, [build, mode, lv, phase]);

  /* ---------- รายงานผล ---------- */
  const reported = useRef(false);
  useEffect(() => {
    if (phase !== "over" || reported.current) return;
    reported.current = true;
    onDone?.({ mistakes: won ? 0 : 1, total: 2, seconds: 0, timeUp: false, stars: won ? 5 : 3 });
  }, [phase, won, onDone]);
  useEffect(() => { if (phase === "play") reported.current = false; }, [phase]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 1800);
    return () => clearTimeout(t);
  }, [msg]);

  /* ---------- ติดไข่ลงกระดาน แล้วเช็กการแตก ---------- */
  const settle = useCallback((sx: number, sy: number, kind: string) => {
    const out = settleEgg(
      eggsRef.current, kind, { x: sx, y: sy }, COLS, lv.maxRows,
      (r, c) => ({ x: cx(r, c), y: cy(r) }),
    );

    if (out.popped.length) {
      const all = [...out.popped, ...out.dropped];
      const gained = out.popped.length * 10 + out.dropped.length * 15;
      const drops: Fall[] = all.map((e) => ({ id: fallId.current++, x: cx(e.r, e.c), y: cy(e.r), kind: e.kind }));
      setPopped((n) => n + all.length);
      setScore((s2) => s2 + gained);
      setMissStreak(0);
      playSfx(out.dropped.length ? "win" : "correct");
      setMsg(out.dropped.length
        ? `💥 แตก ${out.popped.length} ฟอง และไข่ร่วงเพิ่มอีก ${out.dropped.length} ฟอง! +${gained} คะแนน`
        : `💥 ไข่${kindOf(kind).name}แตก ${out.popped.length} ฟอง! +${gained} คะแนน`);
      setFalls((f) => [...f, ...drops]);
      setTimeout(() => setFalls((f) => f.filter((x) => !drops.some((d) => d.id === x.id))), 700);
    } else {
      playSfx("step");
      setMissStreak((n) => n + 1);
    }

    setEggs(out.map);
    eggsRef.current = out.map;

    if (Object.keys(out.map).length === 0) { playSfx("win"); setWon(true); setPhase("over"); return; }
    if (lowestRow(out.map) >= lv.maxRows - 1) { playSfx("wrong"); setWon(false); setPhase("over"); }
  }, [COLS, CW, R, ROW_H, lv.maxRows, kinds]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- ดันไข่ลงมา 1 แถวเมื่อยิงพลาดติดกันหลายครั้ง ---------- */
  useEffect(() => {
    if (phase !== "play" || missStreak < lv.pushEvery) return;
    setMissStreak(0);
    const moved = pushDown(eggsRef.current, COLS, kinds.map((x) => x.id));
    setEggs(moved);
    eggsRef.current = moved;
    playSfx("snake");
    setMsg("⚠️ ไข่เลื่อนลงมาอีกแถวแล้ว รีบยิงให้แตกนะ");
    if (lowestRow(moved) >= lv.maxRows - 1) { setWon(false); setPhase("over"); }
  }, [missStreak, lv.pushEvery, lv.maxRows, phase, COLS, kinds]);

  /* ---------- ลูกที่กำลังลอย ---------- */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.04, (t - last) / 1000);
      last = t;
      const s = shotRef.current;
      if (!s || phaseRef.current !== "play") return;

      const speed = 165; // cqw ต่อวินาที
      let { x, y, vx, vy } = s;
      /* เดินทีละก้าวเล็ก ๆ จะได้ไม่ทะลุไข่ */
      const steps = 6;
      for (let i = 0; i < steps; i++) {
        x += (vx * speed * dt) / steps;
        y += (vy * speed * dt) / steps;
        if (x < R) { x = R; vx = Math.abs(vx); }
        if (x > 100 - R) { x = 100 - R; vx = -Math.abs(vx); }
        if (y <= R) { shotRef.current = null; setShot(null); settle(x, R, s.kind); return; }
        /* ชนไข่ */
        for (const k in eggsRef.current) {
          const e = eggsRef.current[k];
          const dx = cx(e.r, e.c) - x;
          const dy = cy(e.r) - y;
          if (dx * dx + dy * dy <= (CW * 0.92) ** 2) {
            shotRef.current = null; setShot(null); settle(x, y, s.kind); return;
          }
        }
      }
      shotRef.current = { x, y, vx, vy, kind: s.kind };
      setShot(shotRef.current);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [settle, CW, R]); // eslint-disable-line react-hooks/exhaustive-deps

  /* สลับแท็บแล้วพักเอง — ไม่เด้งกลับเมนู ความคืบหน้ายังอยู่ */
  useEffect(() => {
    const onHide = () => { if (document.hidden && phaseRef.current === "play") setPhase("pause"); };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  /* ---------- เล็งและยิง ---------- */
  const point = (e: React.PointerEvent) => {
    const el = board.current;
    if (!el || phase !== "play") return;
    const b = el.getBoundingClientRect();
    const px = ((e.clientX - b.left) / b.width) * 100;
    const py = ((e.clientY - b.top) / b.width) * 100; // ใช้ความกว้างเป็นหน่วยเดียวกัน
    const a = Math.atan2(py - SHOOT_Y, px - 50);
    /* จำกัดให้ยิงขึ้นเท่านั้น */
    setAim(Math.max(-Math.PI + 0.25, Math.min(-0.25, a)));
  };

  const fire = (e: React.PointerEvent) => {
    if (phase !== "play" || shotRef.current) return;
    point(e);
    const a = (() => {
      const el = board.current;
      if (!el) return aim;
      const b = el.getBoundingClientRect();
      const px = ((e.clientX - b.left) / b.width) * 100;
      const py = ((e.clientY - b.top) / b.width) * 100;
      return Math.max(-Math.PI + 0.25, Math.min(-0.25, Math.atan2(py - SHOOT_Y, px - 50)));
    })();
    const s: Shot = { x: 50, y: SHOOT_Y, vx: Math.cos(a), vy: Math.sin(a), kind: current };
    shotRef.current = s;
    setShot(s);
    setShots((n) => n + 1);
    setCurrent(nextKind);
    setNextKind(randKind(Object.values(eggsRef.current).map((x) => x.kind)));
    playSfx("pop");
  };

  const toggleSound = () => { const on = !sound; setSound(on); setSfxOn(on); if (on) playSfx("pop"); };

  if (!ready) return null;

  /* ───────────── เมนู ───────────── */
  if (phase === "menu") {
    return (
      <GameShell instruction="เลือกว่าจะจับคู่แบบไหน แล้วเลือกระดับ" done={false} onRestart={() => setPhase("menu")} mistakes={0} total={1} hideClock>
        <div className="mx-auto grid max-w-2xl gap-4">
          <div>
            <p className="mb-2 font-display text-[16px] text-purple-800">🎯 เกณฑ์การจับคู่</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {EGG_MODES.map((m) => (
                <button key={m.id} type="button" onClick={() => { setMode(m); playSfx("pop"); }} aria-pressed={mode.id === m.id}
                  className={cn("tap rounded-2xl border-2 px-3 py-2.5 text-left transition", mode.id === m.id ? "border-purple-500! bg-purple-50" : "border-line bg-white hover:bg-cream")}>
                  <span className="block text-[15px] text-purple-800">{m.emoji} {m.label}</span>
                  <span className="block text-[12px] leading-snug text-ink-soft">{m.about}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 font-display text-[16px] text-purple-800">🎚️ ระดับ</p>
            <div className="grid gap-2">
              {EGG_LEVELS.map((L) => (
                <button key={L.id} type="button" onClick={() => start(mode, L)}
                  className="tap rounded-2xl bg-cream px-3.5 py-2.5 text-left hover:bg-purple-50">
                  <span className="block text-[15px] text-purple-800">{L.emoji} {L.label} <span className="text-[13px] text-ink-soft">· {L.ages}</span></span>
                  <span className="block text-[12px] leading-snug text-ink-soft">{L.about}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </GameShell>
    );
  }

  const done = phase === "over";

  /* ───────────── เกม ───────────── */
  const Egg = ({ x, y, kind, big }: { x: number; y: number; kind: string; big?: boolean }) => {
    const k = kindOf(kind);
    return (
      <span
        aria-hidden
        className="absolute grid place-items-center rounded-full"
        style={{
          left: `${x}cqw`, top: `${y}cqw`,
          width: `${CW * 0.92}cqw`, height: `${CW * 1.06}cqw`,
          transform: "translate(-50%,-50%)",
          background: `radial-gradient(circle at 35% 30%, #fff8, transparent 55%), ${k.color}`,
          boxShadow: `inset 0 -${CW * 0.12}cqw 0 ${k.spot}33`,
          border: `${CW * 0.05}cqw solid ${k.spot}`,
          fontSize: `${CW * (big ? 0.5 : 0.46)}cqw`,
          color: "#fff",
          fontWeight: 700,
          textShadow: "0 1px 2px #0005",
        }}
      >
        {k.symbol ?? ""}
      </span>
    );
  };

  return (
    <GameShell
      instruction={
        done ? (won ? `🎉 เคลียร์ไข่หมดแล้ว! ได้ ${score} คะแนน` : `ไข่ลงมาถึงด้านล่างแล้ว — ได้ ${score} คะแนน ลองใหม่อีกครั้งนะ`)
          : `${mode.rule} — เลื่อนเมาส์เล็ง แล้วคลิกเพื่อยิง`
      }
      done={done}
      onRestart={restart}
      stats={`${score} คะแนน · ไข่แตก ${popped} ฟอง · ยิงไป ${shots} ครั้ง`}
      mistakes={won ? 0 : 1}
      total={2}
      hideClock
    >
      {/* แถบสถานะ */}
      <div className="mx-auto mb-3 flex max-w-3xl flex-wrap items-center justify-center gap-2">
        <span className="rounded-full bg-purple-100 px-3 py-1.5 text-[14px] text-purple-800">{mode.emoji} {mode.label} · {lv.emoji} {lv.label}</span>
        <span className="rounded-full bg-yellow-soft px-3 py-1.5 font-display text-[15px] text-[#8a6a00]">⭐ {score}</span>
        <span className="rounded-full bg-mint-soft px-3 py-1.5 font-display text-[15px] text-[#1f6b4d]">💥 {popped} ฟอง</span>
        <span className="rounded-full bg-sky-soft px-3 py-1.5 text-[14px] text-purple-800">🥚 เหลือ {Object.keys(eggs).length}</span>
        <button type="button" onClick={toggleSound} aria-pressed={sound}
          className="tap inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-purple-700 hover:bg-cream">
          {sound ? <Volume2 size={14} /> : <VolumeX size={14} />} {sound ? "เสียง: เปิด" : "เสียง: ปิด"}
        </button>
        {phase === "play" && (
          <button type="button" onClick={() => { playSfx("pop"); setPhase("pause"); }}
            className="tap rounded-full bg-cream-dark px-3 py-1.5 text-[13px] font-medium text-purple-700 hover:brightness-95">
            ⏸ หยุดพัก
          </button>
        )}
        <button type="button" onClick={() => { playSfx("pop"); setPhase("menu"); }}
          className="tap rounded-full bg-cream-dark px-3 py-1.5 text-[13px] font-medium text-purple-700 hover:brightness-95">
          ← เปลี่ยนโหมด
        </button>
      </div>

      {/* กระดาน */}
      <div
        ref={board}
        onPointerMove={point}
        onPointerDown={fire}
        className={cn("relative mx-auto w-full max-w-xl touch-none select-none overflow-hidden rounded-3xl shadow-soft ring-1 ring-line", phase === "play" && "cursor-crosshair")}
        style={{
          containerType: "inline-size",
          aspectRatio: `100 / ${BOARD_H}`,
          background: "linear-gradient(#d8f0ff 0%, #bfe6c9 62%, #e7d9b4 100%)",
        }}
        role="application"
        aria-label="สนามยิงไข่ — เลื่อนเมาส์เล็งแล้วคลิกเพื่อยิง"
      >
        {/* เส้นแดงบอกขอบอันตราย */}
        <div className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-red-400/70"
          style={{ top: `${cy(lv.maxRows - 1)}cqw` }} />

        {/* ไข่บนกระดาน */}
        {Object.values(eggs).map((e) => <Egg key={key(e.r, e.c)} x={cx(e.r, e.c)} y={cy(e.r)} kind={e.kind} />)}

        {/* ไข่ที่กำลังร่วง */}
        {falls.map((f) => (
          <span key={f.id} aria-hidden className="absolute animate-ping"
            style={{ left: `${f.x}cqw`, top: `${f.y}cqw`, width: `${CW}cqw`, height: `${CW}cqw`, transform: "translate(-50%,-50%)", borderRadius: "50%", background: kindOf(f.kind).color, opacity: 0.6 }} />
        ))}

        {/* เส้นเล็ง */}
        {phase === "play" && !shot && (
          <div className="pointer-events-none absolute origin-left"
            style={{
              left: "50cqw", top: `${SHOOT_Y}cqw`,
              width: `${BOARD_H * 0.55}cqw`, height: "0.6cqw",
              background: "repeating-linear-gradient(90deg, #ffffffcc 0 2.4cqw, transparent 2.4cqw 5cqw)",
              transform: `translateY(-50%) rotate(${aim}rad)`,
            }} />
        )}

        {/* ไข่ที่กำลังลอย */}
        {shot && <Egg x={shot.x} y={shot.y} kind={shot.kind} />}

        {/* พักอยู่ */}
        {phase === "pause" && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-white/60 backdrop-blur-[2px]">
            <button type="button" onPointerDown={(e) => { e.stopPropagation(); setPhase("play"); }}
              className="tap rounded-full bg-purple-600 px-7 py-3.5 font-display text-xl text-white shadow-lift hover:bg-purple-700">
              ▶ เล่นต่อ
            </button>
          </div>
        )}

        {/* แม่ไดโนเสาร์ + ไข่ในมือ */}
        <span aria-hidden className="absolute" style={{ left: "50cqw", top: `${SHOOT_Y + 5}cqw`, transform: "translate(-50%,-50%)", fontSize: `${CW * 1.5}cqw`, lineHeight: 1 }}>🦕</span>
        {!shot && <Egg x={50} y={SHOOT_Y} kind={current} big />}
        <span aria-hidden className="absolute text-white"
          style={{ left: `${100 - CW * 1.2}cqw`, top: `${SHOOT_Y + 3}cqw`, transform: "translate(-50%,-50%)", fontSize: `${CW * 0.34}cqw` }}>
          ถัดไป
        </span>
        <Egg x={100 - CW * 1.2} y={SHOOT_Y} kind={nextKind} />
      </div>

      {msg && (
        <p role="status" className="animate-rise mx-auto mt-3 max-w-lg rounded-2xl bg-white px-4 py-2.5 text-center text-[15px] leading-snug text-purple-800 shadow-soft">
          {msg}
        </p>
      )}

      <button type="button" onClick={() => setTip((i) => (i + 1) % EGG_TIPS.length)}
        className="tap mx-auto mt-3 block rounded-2xl bg-cream px-4 py-2.5 text-center text-[13px] leading-relaxed text-ink-soft hover:brightness-95">
        💡 {EGG_TIPS[tip]} <span className="text-purple-500">(กดดูเคล็ดลับถัดไป)</span>
      </button>
    </GameShell>
  );
}
