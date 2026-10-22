"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { GameShell, type GameOutcome } from "@/components/games/GameShell";
import { PHYS, stackY, step, type Ring, type World } from "@/lib/ring-toss";
import { playSfx, setSfxOn, sfxOn } from "@/lib/sfx";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;

/** สีห่วง — สดใสแบบของเล่นย้อนยุค */
const COLORS = ["#ef5d6b", "#f59f3c", "#f3d250", "#5ec489", "#4fb3e8", "#9b7ae0", "#ef83b8"];

/** ตู้เกม — พิกัดทั้งหมดเป็น cqw (1 = 1% ของความกว้างตู้) */
const W = 100;
const H = 66;
const TOP = 7;
const WORLD: World = {
  w: W, h: H, top: TOP,
  pegs: [{ x: 36, tipY: 34, baseY: 58 }, { x: 64, tipY: 34, baseY: 58 }],
  jets: [{ x: 13, y: 62 }, { x: 87, y: 62 }],
};

interface Level { id: string; emoji: string; label: string; rings: number; seconds: number; about: string }
const LEVELS: Level[] = [
  { id: "free", emoji: "🟢", label: "เล่นอิสระ", rings: 15, seconds: 0, about: "ห่วง 15 วง ไม่จำกัดเวลา ค่อย ๆ ฝึกจังหวะได้เต็มที่" },
  { id: "timed", emoji: "🟡", label: "จับเวลา 90 วินาที", rings: 18, seconds: 90, about: "ห่วง 18 วง ลองดูว่าคล้องได้กี่วงใน 90 วินาที" },
  { id: "rush", emoji: "🔴", label: "ท้าทาย 60 วินาที", rings: 20, seconds: 60, about: "ห่วง 20 วง เวลาสั้น ต้องกะจังหวะให้แม่น" },
];

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;

/**
 * 💧 โยนห่วงใต้น้ำ — Water Ring Toss
 *
 * ตู้น้ำพลาสติกใสแบบของเล่นย้อนยุค · กดปุ่มซ้าย-ขวาค้างไว้เพื่อพ่นน้ำดันห่วงให้ลอยขึ้น
 * ห่วงมีแรงลอย ความเฉื่อย และโดนแรงดันน้ำจริง ไม่ใช่แค่เลื่อนซ้ายขวา
 * ต้องกะจังหวะให้รูห่วงครอบปลายเสาตอนห่วงกำลังตกลงมา จึงจะคล้องได้
 */
export function RingTossGame({ onDone }: { onDone?: Cb }) {
  const [phase, setPhase] = useState<"menu" | "play" | "pause" | "over">("menu");
  const [lv, setLv] = useState<Level>(LEVELS[0]);
  const [caught, setCaught] = useState(0);
  const [total, setTotal] = useState(15);
  const [time, setTime] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [sound, setSound] = useState(true);
  const [ready, setReady] = useState(false);
  const [, force] = useState(0);

  const rings = useRef<Ring[]>([]);
  const els = useRef<Map<number, HTMLDivElement>>(new Map());
  const held = useRef({ left: false, right: false });
  const phaseRef = useRef(phase);
  const bubbles = useRef<{ id: number; side: 0 | 1; x: number; y: number; r: number }[]>([]);
  const bubbleId = useRef(1);
  const sparkRef = useRef<HTMLDivElement>(null);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { setReady(true); setSound(sfxOn()); }, []);

  /* ---------- ตั้งห่วงใหม่ ---------- */
  const build = useCallback((L: Level) => {
    const list: Ring[] = [];
    for (let i = 0; i < L.rings; i++) {
      list.push({
        id: i + 1,
        x: 10 + (i % 7) * 13 + (Math.random() - 0.5) * 4,
        y: 14 + Math.floor(i / 7) * 9 + (Math.random() - 0.5) * 3,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 10,
        r: 3.5,
        color: COLORS[i % COLORS.length],
        onPeg: null,
        stack: 0,
        spin: Math.random() * 360,
      });
    }
    rings.current = list;
    els.current.clear();
    bubbles.current = [];
    setCaught(0); setTotal(L.rings); setTime(L.seconds); setMsg(null);
    force((n) => n + 1);
  }, []);

  const start = (L: Level) => { setLv(L); build(L); setPhase("play"); playSfx("pop"); };
  const restart = useCallback(() => { if (phase === "menu") return; build(lv); setPhase("play"); }, [build, lv, phase]);

  /* ---------- นาฬิกา ---------- */
  useEffect(() => {
    if (phase !== "play" || lv.seconds === 0) return;
    const t = setInterval(() => setTime((v) => { if (v <= 1) { setPhase("over"); return 0; } return v - 1; }), 1000);
    return () => clearInterval(t);
  }, [phase, lv.seconds]);

  /* ---------- สลับแท็บแล้วพักเอง ---------- */
  useEffect(() => {
    const onHide = () => { if (document.hidden && phaseRef.current === "play") setPhase("pause"); };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  /* ---------- ปุ่มลูกศร / A D / Space ---------- */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") { held.current.left = true; e.preventDefault(); }
      if (k === "arrowright" || k === "d") { held.current.right = true; e.preventDefault(); }
      if (k === " ") {
        e.preventDefault();
        if (phaseRef.current === "pause") setPhase("play");
        else if (phaseRef.current === "play") setPhase("pause");
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") held.current.left = false;
      if (k === "arrowright" || k === "d") held.current.right = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  /* ---------- ลูปฟิสิกส์ ---------- */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.035, (t - last) / 1000);
      last = t;
      const running = phaseRef.current === "play";

      if (running) {
        const { caught: got } = step({
          rings: rings.current, world: WORLD, dt,
          jetLeft: held.current.left, jetRight: held.current.right,
        });
        if (got.length) {
          playSfx("coin");
          setCaught((n) => n + got.length);
          setMsg(`✨ คล้องได้! รวม ${rings.current.filter((r) => r.onPeg !== null).length} วง`);
          if (sparkRef.current) {
            sparkRef.current.style.left = `${got[0].ring.x}cqw`;
            sparkRef.current.style.top = `${WORLD.pegs[got[0].peg].tipY}cqw`;
            sparkRef.current.style.opacity = "1";
            sparkRef.current.animate(
              [{ transform: "translate(-50%,-50%) scale(0.5)", opacity: 1 }, { transform: "translate(-50%,-50%) scale(2.2)", opacity: 0 }],
              { duration: 600, easing: "ease-out" },
            );
          }
          if (rings.current.every((r) => r.onPeg !== null)) { playSfx("win"); setPhase("over"); }
        }

        /* ฟองอากาศจากหัวฉีดที่กดอยู่ */
        for (let j = 0; j < 2; j++) {
          const on = j === 0 ? held.current.left : held.current.right;
          if (on && Math.random() < 0.45) {
            bubbles.current.push({
              id: bubbleId.current++, side: j as 0 | 1,
              x: WORLD.jets[j].x + (Math.random() - 0.5) * 7,
              y: WORLD.jets[j].y,
              r: 0.5 + Math.random() * 1.1,
            });
          }
        }
        for (const b of bubbles.current) b.y -= (28 + b.r * 9) * dt;
        bubbles.current = bubbles.current.filter((b) => b.y > TOP - 2).slice(-60);
      }

      /* วาด */
      for (const r of rings.current) {
        const el = els.current.get(r.id);
        if (!el) continue;
        el.style.transform = `translate3d(${r.x}cqw, ${r.y}cqw, 0) translate(-50%,-50%) rotate(${r.spin}deg)`;
        el.style.zIndex = r.onPeg !== null ? "1" : "3";
      }
      force((n) => (n + 1) % 1000000);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 1400);
    return () => clearTimeout(t);
  }, [msg]);

  /* ---------- รายงานผล ---------- */
  const reported = useRef(false);
  useEffect(() => {
    if (phase !== "over" || reported.current) return;
    reported.current = true;
    const miss = Math.max(0, total - caught);
    onDone?.({ mistakes: miss, total, seconds: lv.seconds - time, timeUp: lv.seconds > 0 && time === 0, stars: 0 });
  }, [phase, caught, total, lv.seconds, time, onDone]);
  useEffect(() => { if (phase === "play") reported.current = false; }, [phase]);

  const hold = (side: "left" | "right", on: boolean) => { held.current[side] = on; };
  const toggleSound = () => { const on = !sound; setSound(on); setSfxOn(on); if (on) playSfx("pop"); };

  if (!ready) return null;

  /* ───────────── เมนู ───────────── */
  if (phase === "menu") {
    return (
      <GameShell instruction="เลือกรูปแบบการเล่น แล้วเริ่มได้เลย" done={false} onRestart={() => setPhase("menu")} mistakes={0} total={1} hideClock>
        <div className="mx-auto grid max-w-xl gap-2">
          {LEVELS.map((L) => (
            <button key={L.id} type="button" onClick={() => start(L)}
              className="tap rounded-2xl bg-cream px-3.5 py-3 text-left hover:bg-purple-50">
              <span className="block text-[15px] text-purple-800">{L.emoji} {L.label}</span>
              <span className="block text-[12px] leading-snug text-ink-soft">{L.about}</span>
            </button>
          ))}
          <div className="mt-2 rounded-2xl bg-sky-soft px-4 py-3 text-[13px] leading-relaxed text-purple-800">
            <p className="mb-1 font-display text-[15px]">🎮 วิธีเล่น</p>
            กดปุ่ม <b>◀ ซ้าย</b> หรือ <b>▶ ขวา</b> <b>ค้างไว้</b> น้ำจะพุ่งขึ้นดันห่วงให้ลอย
            <br />ใช้ปุ่มลูกศร <b>← →</b> หรือ <b>A / D</b> บนคีย์บอร์ดก็ได้ · <b>Space</b> = หยุดพัก/เล่นต่อ
            <br />กะจังหวะให้รูห่วงครอบปลายเสาตอนห่วง <b>กำลังตกลงมา</b> จึงจะคล้องติด
          </div>
        </div>
      </GameShell>
    );
  }

  const done = phase === "over";
  const onBoard = rings.current.filter((r) => r.onPeg !== null).length;

  return (
    <GameShell
      instruction={
        done ? `🎉 จบรอบ! คล้องห่วงได้ ${onBoard} จาก ${total} วง`
          : phase === "pause" ? "⏸ พักอยู่ — กดเล่นต่อหรือเคาะ Space"
          : "กดปุ่มซ้าย-ขวาค้างไว้เพื่อพ่นน้ำ · กะจังหวะให้ห่วงตกลงมาคล้องเสา"
      }
      progress={{ current: onBoard, total }}
      done={done}
      onRestart={restart}
      stats={`คล้องได้ ${onBoard}/${total} วง`}
      mistakes={Math.max(0, total - onBoard)}
      total={total}
      hideClock
    >
      {/* แถบสถานะ */}
      <div className="mx-auto mb-3 flex max-w-3xl flex-wrap items-center justify-center gap-2">
        <span className="rounded-full bg-purple-100 px-3 py-1.5 text-[14px] text-purple-800">{lv.emoji} {lv.label}</span>
        <span className="rounded-full bg-mint-soft px-3 py-1.5 font-display text-[15px] text-[#1f6b4d]">⭕ คล้องได้ {onBoard}/{total}</span>
        {lv.seconds > 0 && (
          <span className={cn("rounded-full px-3 py-1.5 font-mono text-[15px]", time <= 10 && !done ? "animate-pulse bg-red-50 text-red-600" : "bg-sky-soft text-purple-800")}>
            ⏱ {mmss(time)}
          </span>
        )}
        {phase === "play" && (
          <button type="button" onClick={() => setPhase("pause")}
            className="tap inline-flex items-center gap-1 rounded-full bg-cream-dark px-3 py-1.5 text-[13px] font-medium text-purple-700 hover:brightness-95">
            <Pause size={14} /> หยุดพัก
          </button>
        )}
        <button type="button" onClick={restart}
          className="tap inline-flex items-center gap-1 rounded-full bg-cream-dark px-3 py-1.5 text-[13px] font-medium text-purple-700 hover:brightness-95">
          <RotateCcw size={14} /> เล่นใหม่
        </button>
        <button type="button" onClick={toggleSound} aria-pressed={sound}
          className="tap inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-purple-700 hover:bg-cream">
          {sound ? <Volume2 size={14} /> : <VolumeX size={14} />} {sound ? "เสียง: เปิด" : "เสียง: ปิด"}
        </button>
        <button type="button" onClick={() => { playSfx("pop"); setPhase("menu"); }}
          className="tap rounded-full bg-cream-dark px-3 py-1.5 text-[13px] font-medium text-purple-700 hover:brightness-95">
          ← เปลี่ยนโหมด
        </button>
      </div>

      {/* ───────── ตู้เกม ───────── */}
      <div className="mx-auto w-full max-w-2xl rounded-[2rem] bg-gradient-to-b from-[#7fd3ef] to-[#3aa3cf] p-2.5 shadow-lift sm:p-3">
        <div
          className="relative overflow-hidden rounded-[1.4rem] ring-2 ring-white/70"
          style={{ containerType: "inline-size", aspectRatio: `${W} / ${H}`, background: "linear-gradient(#e9fbff 0%, #bfeeff 10%, #8fd9f5 45%, #4fb6dd 100%)" }}
          role="application"
          aria-label="ตู้โยนห่วงใต้น้ำ"
        >
          {/* ผิวน้ำ */}
          <div className="pointer-events-none absolute inset-x-0" style={{ top: `${TOP}cqw`, height: "0.8cqw", background: "rgba(255,255,255,0.65)" }} />
          {/* แสงสะท้อนบนกระจก */}
          <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(115deg, rgba(255,255,255,0.35) 0 14%, transparent 22% 100%)" }} />

          {/* เสา 2 ต้น */}
          {WORLD.pegs.map((p, i) => (
            <div key={i} className="pointer-events-none absolute" style={{ left: `${p.x}cqw`, top: `${p.tipY}cqw`, transform: "translateX(-50%)", zIndex: 2 }}>
              <div style={{ width: "1.6cqw", height: `${p.baseY - p.tipY}cqw`, background: "linear-gradient(90deg,#f2f6f9,#c7d3dc)", borderRadius: "0.8cqw" }} />
              <div style={{ position: "absolute", top: "-0.9cqw", left: "50%", transform: "translateX(-50%)", width: "2.6cqw", height: "1.8cqw", background: "#ff8fab", borderRadius: "50%" }} />
            </div>
          ))}
          {/* ฐานเสา */}
          <div className="pointer-events-none absolute inset-x-0" style={{ top: `${WORLD.pegs[0].baseY}cqw`, height: "3cqw", background: "linear-gradient(#cfe6f2,#9ec6db)" }} />

          {/* ฟองอากาศ */}
          {bubbles.current.map((b) => (
            <span key={b.id} aria-hidden className="pointer-events-none absolute rounded-full"
              style={{ left: `${b.x}cqw`, top: `${b.y}cqw`, width: `${b.r}cqw`, height: `${b.r}cqw`, transform: "translate(-50%,-50%)", background: "rgba(255,255,255,0.72)", border: "0.12cqw solid rgba(255,255,255,0.9)", zIndex: 1 }} />
          ))}

          {/* ห่วง */}
          {rings.current.map((r) => (
            <div key={r.id} ref={(el) => { if (el) els.current.set(r.id, el); else els.current.delete(r.id); }}
              aria-hidden className="pointer-events-none absolute left-0 top-0 rounded-full will-change-transform"
              style={{
                width: `${r.r * 2}cqw`, height: `${r.r * 2}cqw`,
                border: `${r.r * (1 - PHYS.holeRatio)}cqw solid ${r.color}`,
                boxShadow: `inset 0 0 0.6cqw rgba(0,0,0,0.18), 0 0.3cqw 0.6cqw rgba(0,0,0,0.12)`,
              }} />
          ))}

          {/* ประกายตอนคล้องได้ */}
          <div ref={sparkRef} aria-hidden className="pointer-events-none absolute text-3xl"
            style={{ left: "50cqw", top: "34cqw", transform: "translate(-50%,-50%)", opacity: 0, zIndex: 5 }}>✨</div>

          {/* หัวฉีด */}
          {WORLD.jets.map((j, i) => (
            <div key={i} className="pointer-events-none absolute rounded-t-full"
              style={{ left: `${j.x}cqw`, top: `${j.y}cqw`, transform: "translate(-50%,-50%)", width: "5cqw", height: "2.4cqw", background: "#ffd166", border: "0.3cqw solid #e0a93a", zIndex: 2 }} />
          ))}

          {/* ก่อนเริ่ม / พัก */}
          {phase === "pause" && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-white/55 backdrop-blur-[2px]">
              <button type="button" onClick={() => setPhase("play")}
                className="tap inline-flex items-center gap-2 rounded-full bg-purple-600 px-7 py-3.5 font-display text-xl text-white shadow-lift hover:bg-purple-700">
                <Play size={22} /> เล่นต่อ
              </button>
            </div>
          )}
        </div>

        {/* ปุ่มกดซ้าย-ขวา */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(["left", "right"] as const).map((side) => (
            <button
              key={side}
              type="button"
              disabled={phase !== "play"}
              onPointerDown={(e) => { e.preventDefault(); hold(side, true); }}
              onPointerUp={() => hold(side, false)}
              onPointerLeave={() => hold(side, false)}
              onPointerCancel={() => hold(side, false)}
              aria-label={side === "left" ? "พ่นน้ำฝั่งซ้าย (กดค้าง)" : "พ่นน้ำฝั่งขวา (กดค้าง)"}
              className="tap grid select-none place-items-center rounded-3xl bg-[#ffd166] py-4 text-[#8a6a00] shadow-soft ring-2 ring-[#e0a93a] transition active:scale-95 active:bg-[#ffbe3d] disabled:opacity-50"
            >
              {side === "left" ? <ArrowLeft size={26} /> : <ArrowRight size={26} />}
              <span className="mt-0.5 text-[13px] font-medium">{side === "left" ? "ซ้าย / A" : "ขวา / D"}</span>
            </button>
          ))}
        </div>
      </div>

      {msg && (
        <p role="status" className="animate-rise mx-auto mt-3 max-w-md rounded-2xl bg-mint-soft px-4 py-2 text-center text-[15px] text-[#1f6b4d]">
          {msg}
        </p>
      )}

      <p className="mt-3 text-center text-[13px] leading-relaxed text-ink-soft">
        💡 <b>กดค้าง</b> น้ำจะพุ่งขึ้นเรื่อย ๆ · <b>กดสลับซ้าย-ขวา</b> ทำให้ห่วงแกว่งเป็นจังหวะ
        <br />ห่วงจะคล้องติดก็ต่อเมื่อรูห่วงครอบปลายเสาขณะ <b>กำลังตกลงมา</b> — ลอยขึ้นผ่านเสาไม่นับนะ
      </p>
    </GameShell>
  );
}
