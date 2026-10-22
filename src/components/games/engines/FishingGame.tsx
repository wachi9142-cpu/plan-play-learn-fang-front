"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Sparkles } from "lucide-react";
import { GameShell, type GameOutcome } from "@/components/games/GameShell";
import { starsFor } from "@/lib/game-levels";
import { CATCH_WORDS, FISH_TYPES, PONDS, findPond, fishType, type FishKind, type Pond } from "@/data/fishing";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;

interface Fish {
  id: number;
  kind: FishKind;
  /** ตำแหน่งคิดเป็น % ของบ่อ */
  x: number;
  y: number;
  /** ความเร็วแนวนอน %/วินาที (ลบ = ว่ายไปทางซ้าย) */
  vx: number;
  phase: number;
}

/** ผิวน้ำอยู่ที่ 26% ของความสูงฉาก เหนือขึ้นไปเป็นท้องฟ้า */
const SURFACE = 26;
/** ปลาอยู่ได้ตั้งแต่ใต้ผิวน้ำลงไปถึงก่อนพื้นบ่อ */
const FISH_TOP = SURFACE + 8;
const FISH_BOTTOM = 88;
/** ความเร็วเบ็ดขึ้น–ลง (%/วินาที) */
const HOOK_SPEED = 95;

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;

/** สุ่มชนิดปลาตามน้ำหนักโอกาส — ปลาพิเศษจึงออกน้อยที่สุด */
function rollKind(): FishKind {
  const total = FISH_TYPES.reduce((n, f) => n + f.weight, 0);
  let r = Math.random() * total;
  for (const f of FISH_TYPES) { r -= f.weight; if (r <= 0) return f.kind; }
  return "small";
}

function makeFish(id: number): Fish {
  const t = fishType(rollKind());
  const dir = Math.random() < 0.5 ? -1 : 1;
  const speed = t.speed[0] + Math.random() * (t.speed[1] - t.speed[0]);
  return {
    id,
    kind: t.kind,
    x: dir === 1 ? -10 : 110,
    y: FISH_TOP + Math.random() * (FISH_BOTTOM - FISH_TOP),
    vx: speed * dir,
    phase: Math.random() * Math.PI * 2,
  };
}

/**
 * 🎣 เกมตกปลาเก็บคะแนน
 *
 * เลื่อนเมาส์เพื่อบังคับเบ็ดซ้าย–ขวา แล้วคลิกเพื่อหย่อนเบ็ดลงน้ำ
 * เบ็ดแตะตัวปลา = เกี่ยวติดแล้วดึงขึ้น ได้คะแนนตามชนิดปลา
 * ปลาพิเศษสีรุ้งเรืองแสง +10 คะแนน · ปิดเอฟเฟกต์แสงได้สำหรับเด็กที่ไม่ชอบแสงกะพริบ
 */
export function FishingGame({ pondId, seconds = 60, target = 30, fishCount = 9, onDone }: {
  pondId?: string;
  /** เวลาต่อรอบ (วินาที) */
  seconds?: number;
  /** คะแนนเป้าหมาย — ใช้คิดดาว ไม่ได้บังคับให้ถึง */
  target?: number;
  /** จำนวนปลาในบ่อพร้อมกัน */
  fishCount?: number;
  onDone?: Cb;
}) {
  const pond: Pond = (pondId ? findPond(pondId) : undefined) ?? PONDS[0];

  const [phase, setPhase] = useState<"ready" | "play" | "pause" | "over">("ready");
  const [score, setScore] = useState(0);
  const [caught, setCaught] = useState(0);
  const [left, setLeft] = useState(seconds);
  const [fx, setFx] = useState(true);
  const [toast, setToast] = useState<{ text: string; big: boolean } | null>(null);
  /** รายชื่อปลาที่ต้อง mount — ตำแหน่งจริงอัปเดตผ่าน ref ทุกเฟรม จะได้ลื่นไม่กระตุก */
  const [ids, setIds] = useState<{ id: number; kind: FishKind }[]>([]);

  const wrap = useRef<HTMLDivElement>(null);
  const fish = useRef<Fish[]>([]);
  const els = useRef<Map<number, HTMLSpanElement>>(new Map());
  const nextId = useRef(1);
  const box = useRef({ w: 0, h: 0 });

  /** เบ็ด: x เป็น % ของบ่อ · y เป็น % · state บอกว่ากำลังหย่อนหรือดึงขึ้น */
  const hook = useRef<{ x: number; y: number; state: "idle" | "down" | "up"; has: Fish | null }>({ x: 50, y: SURFACE, state: "idle", has: null });
  const hookEl = useRef<HTMLDivElement>(null);
  const lineEl = useRef<HTMLDivElement>(null);
  const rodEl = useRef<HTMLDivElement>(null);

  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  /* ---------- เริ่มรอบใหม่ ---------- */
  const start = useCallback(() => {
    fish.current = Array.from({ length: fishCount }, () => {
      const f = makeFish(nextId.current++);
      f.x = 5 + Math.random() * 90; // รอบแรกกระจายทั่วบ่อ ไม่ต้องรอว่ายเข้ามา
      return f;
    });
    setIds(fish.current.map((f) => ({ id: f.id, kind: f.kind })));
    hook.current = { x: 50, y: SURFACE, state: "idle", has: null };
    setScore(0); setCaught(0); setLeft(seconds); setToast(null);
    setPhase("play");
  }, [fishCount, seconds]);

  const reset = useCallback(() => {
    fish.current = []; els.current.clear(); setIds([]);
    hook.current = { x: 50, y: SURFACE, state: "idle", has: null };
    setScore(0); setCaught(0); setLeft(seconds); setToast(null); setPhase("ready");
  }, [seconds]);

  // เตรียมบ่อหลังหน้าเว็บพร้อม เพื่อไม่ให้ฝั่งเซิร์ฟเวอร์กับเบราว์เซอร์ต่างกัน
  useEffect(() => { reset(); }, [reset]);

  /* ---------- ขนาดบ่อ (ใช้แปลง % เป็น px ตอนวาด) ---------- */
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const read = () => { const b = el.getBoundingClientRect(); box.current = { w: b.width, h: b.height }; };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ---------- นาฬิกาถอยหลัง (หยุดได้ตอนกดพัก) ---------- */
  useEffect(() => {
    if (phase !== "play") return;
    const t = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) { setPhase("over"); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  /* ---------- จบเกมแล้วรายงานผล ---------- */
  const reported = useRef(false);
  useEffect(() => {
    if (phase !== "over" || reported.current) return;
    reported.current = true;
    const miss = Math.max(0, target - score);
    onDone?.({ mistakes: miss, total: target, seconds: seconds - left, timeUp: false, stars: starsFor(miss, target, false) });
  }, [phase, score, target, seconds, left, onDone]);
  useEffect(() => { if (phase === "play") reported.current = false; }, [phase]);

  /* สลับแท็บหรือย่อหน้าต่าง = เกมหยุดเดินเอง ให้พักอัตโนมัติ เวลาจะได้ไม่เดินทิ้ง */
  useEffect(() => {
    const onHide = () => { if (document.hidden && phaseRef.current === "play") setPhase("pause"); };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  /* ---------- ลูปเกม ---------- */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const { w, h } = box.current;
      if (!w || !h) return;

      const running = phaseRef.current === "play";
      const hk = hook.current;

      if (running) {
        /* ปลาว่าย */
        for (const f of fish.current) {
          f.x += f.vx * dt;
          f.phase += dt * 2;
          if (f.x < -12) f.x = 112;
          if (f.x > 112) f.x = -12;
        }

        /* เบ็ดหย่อนลง / ดึงขึ้น */
        if (hk.state === "down") {
          hk.y += HOOK_SPEED * dt;
          if (hk.y >= FISH_BOTTOM + 4) { hk.y = FISH_BOTTOM + 4; hk.state = "up"; }
          else {
            /* เกี่ยวปลา — ใช้ระยะจริงเป็น px จะได้แม่นทั้งจอเล็กจอใหญ่ */
            for (let i = 0; i < fish.current.length; i++) {
              const f = fish.current[i];
              const ft = fishType(f.kind);
              const dx = (f.x - hk.x) / 100 * w;
              const dy = (f.y - hk.y) / 100 * h;
              const r = (ft.size / 100 * w) * 0.62;
              if (dx * dx + dy * dy <= r * r) {
                hk.has = f; hk.state = "up";
                fish.current.splice(i, 1);
                break;
              }
            }
          }
        } else if (hk.state === "up") {
          hk.y -= HOOK_SPEED * dt;
          if (hk.y <= SURFACE) {
            hk.y = SURFACE;
            if (hk.has) {
              const ft = fishType(hk.has.kind);
              const got = hk.has;
              setScore((s) => s + ft.score);
              setCaught((c) => c + 1);
              setToast({ text: `${CATCH_WORDS[got.kind]} ${ft.emoji} ${ft.label} +${ft.score} คะแนน`, big: got.kind === "special" });
              /* ปล่อยปลาใหม่ลงบ่อแทนตัวที่ตกได้ */
              const nf = makeFish(nextId.current++);
              fish.current.push(nf);
              setIds((list) => [...list.filter((x) => x.id !== got.id), { id: nf.id, kind: nf.kind }]);
              els.current.delete(got.id);
              hk.has = null;
            }
            hk.state = "idle";
          }
        }
      }

      /* วาด — เขียน transform ตรง ๆ ไม่ผ่าน state จึงไม่กระตุก */
      for (const f of fish.current) {
        const el = els.current.get(f.id);
        if (!el) continue;
        const bob = Math.sin(f.phase) * (h * 0.012);
        el.style.transform = `translate3d(${(f.x / 100) * w}px, ${(f.y / 100) * h + bob}px, 0) translate(-50%, -50%) scaleX(${f.vx < 0 ? -1 : 1})`;
      }
      if (hookEl.current) {
        hookEl.current.style.transform = `translate3d(${(hk.x / 100) * w}px, ${(hk.y / 100) * h}px, 0) translate(-50%, -40%)`;
      }
      if (lineEl.current) {
        lineEl.current.style.transform = `translate3d(${(hk.x / 100) * w}px, 0, 0)`;
        lineEl.current.style.height = `${(hk.y / 100) * h}px`;
      }
      if (rodEl.current) {
        rodEl.current.style.transform = `translate3d(${(hk.x / 100) * w}px, 0, 0) translateX(-50%)`;
      }
      /* ปลาที่เกี่ยวติดเบ็ด เดินทางขึ้นมาพร้อมเบ็ด */
      if (hk.has) {
        const el = els.current.get(hk.has.id);
        if (el) el.style.transform = `translate3d(${(hk.x / 100) * w}px, ${(hk.y / 100) * h + h * 0.035}px, 0) translate(-50%, -50%)`;
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ---------- ข้อความชมหายไปเอง ---------- */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.big ? 1800 : 1200);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---------- เมาส์บังคับเบ็ด ---------- */
  const aim = (e: React.PointerEvent) => {
    const el = wrap.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    hook.current.x = Math.min(96, Math.max(4, ((e.clientX - b.left) / b.width) * 100));
  };
  const drop = () => {
    if (phaseRef.current !== "play") return;
    if (hook.current.state === "idle") hook.current.state = "down";
  };

  const pond2 = pond;
  const done = phase === "over";

  return (
    <GameShell
      instruction={
        done ? `🎉 หมดเวลา! ได้ ${score} คะแนน จากปลา ${caught} ตัว`
          : phase === "ready" ? `${pond2.hint} — กด ▶ เริ่มเกม แล้วเลื่อนเมาส์บังคับเบ็ด`
          : phase === "pause" ? "⏸ พักอยู่ — กดเล่นต่อได้เลย"
          : "เลื่อนเมาส์ซ้าย–ขวาเพื่อเล็ง แล้วคลิกเพื่อหย่อนเบ็ดลงไปตกปลา"
      }
      done={done}
      onRestart={reset}
      stats={`${score} คะแนน · ตกได้ ${caught} ตัว`}
      mistakes={Math.max(0, target - score)}
      total={target}
      hideClock
      onDone={undefined}
    >
      {/* ───────── แถบคะแนน ───────── */}
      <div className="mx-auto mb-3 flex max-w-3xl flex-wrap items-center justify-center gap-2">
        <span className="rounded-full bg-yellow-soft px-3.5 py-1.5 font-display text-[16px] text-[#8a6a00]">⭐ {score} คะแนน</span>
        <span className="rounded-full bg-mint-soft px-3.5 py-1.5 font-display text-[16px] text-[#1f6b4d]">🐟 {caught} ตัว</span>
        <span className={cn("rounded-full px-3.5 py-1.5 font-mono text-[16px]", left <= 10 && phase === "play" ? "animate-pulse bg-red-50 text-red-600" : "bg-sky-soft text-purple-800")}>
          ⏱ {mmss(left)}
        </span>
      </div>

      {/* ───────── บ่อน้ำ ───────── */}
      <div
        ref={wrap}
        onPointerMove={aim}
        onPointerDown={(e) => { aim(e); drop(); }}
        className={cn(
          "relative mx-auto aspect-[4/3] w-full max-w-3xl touch-none select-none overflow-hidden rounded-3xl shadow-soft ring-1 ring-line",
          !fx && "fx-off",
          phase === "play" && "cursor-crosshair",
        )}
        /* containerType ทำให้หน่วย cqw ของตัวปลาอิงความกว้างบ่อ — ตัวปลาจึงย่อขยายตามจอ */
        style={{ background: `linear-gradient(${pond2.sky[0]}, ${pond2.sky[1]})`, containerType: "inline-size" }}
        role="application"
        aria-label={`${pond2.label} — เลื่อนเมาส์เล็งแล้วคลิกเพื่อหย่อนเบ็ด`}
      >
        {/* ของเหนือน้ำ */}
        <div className="pointer-events-none absolute inset-x-0 top-1 flex justify-around opacity-80">
          {pond2.above.map((a, i) => <span key={i} className="text-[clamp(1.1rem,3.4vw,1.9rem)] leading-none">{a}</span>)}
        </div>

        {/* น้ำ */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0"
          style={{ top: `${SURFACE}%`, background: `linear-gradient(${pond2.water[0]}, ${pond2.water[1]})` }}
        />
        {/* ผิวน้ำ */}
        <div className="pointer-events-none absolute inset-x-0 h-1.5 bg-white/45" style={{ top: `${SURFACE}%` }} />

        {/* พื้นบ่อ */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-around opacity-85">
          {pond2.decor.map((d, i) => <span key={i} className="text-[clamp(1.1rem,4vw,2.1rem)] leading-none">{d}</span>)}
        </div>

        {/* คันเบ็ดของเด็ก */}
        <div ref={rodEl} className="pointer-events-none absolute left-0 top-0 will-change-transform">
          <span className="block text-[clamp(1.8rem,7vw,3rem)] leading-none">🧒</span>
        </div>

        {/* สายเบ็ด */}
        <div ref={lineEl} className="pointer-events-none absolute left-0 top-0 w-px bg-[#5b4636]/70 will-change-transform" />

        {/* ตัวเบ็ด */}
        <div ref={hookEl} className="pointer-events-none absolute left-0 top-0 will-change-transform">
          <span className="block text-[clamp(0.9rem,3.2vw,1.4rem)] leading-none">🪝</span>
        </div>

        {/* ปลา */}
        {ids.map((f) => {
          const t = fishType(f.kind);
          return (
            <span
              key={f.id}
              ref={(el) => { if (el) els.current.set(f.id, el); else els.current.delete(f.id); }}
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 grid place-items-center leading-none will-change-transform"
              style={{ fontSize: `${t.size}cqw` }}
            >
              {f.kind === "special" && (
                <>
                  <span className="fish-aura absolute left-1/2 top-1/2 size-[2.2em] rounded-full" />
                  {[0, 1, 2, 3].map((k) => (
                    <span
                      key={k}
                      className="fish-spark absolute left-1/2 top-1/2 text-[0.45em] leading-none"
                      style={{
                        ["--sx" as string]: `${[-1.4, 1.3, -1.1, 1.5][k]}em`,
                        ["--sy" as string]: `${[-1.3, -1.1, 1.2, 1.0][k]}em`,
                        animationDelay: `${k * 0.37}s`,
                      }}
                    >
                      ✨
                    </span>
                  ))}
                </>
              )}
              <span
                className={cn("relative leading-none", f.kind === "gold" && "fish-gold", f.kind === "special" && "fish-special")}
              >
                {t.emoji}
              </span>
            </span>
          );
        })}

        {/* ข้อความชมตอนตกปลาได้ */}
        {toast && (
          <p
            role="status"
            className={cn(
              "animate-rise pointer-events-none absolute inset-x-4 top-[30%] mx-auto max-w-sm rounded-2xl px-4 py-2 text-center font-display leading-snug shadow-lift",
              toast.big ? "bg-yellow-soft text-[17px] text-[#8a6a00] sm:text-xl" : "bg-white/90 text-[15px] text-purple-800",
            )}
          >
            {toast.big && "🌈 "}{toast.text}
          </p>
        )}

        {/* ฉากก่อนเริ่ม / ตอนพัก */}
        {(phase === "ready" || phase === "pause") && (
          <div className="absolute inset-0 grid place-items-center bg-white/55 backdrop-blur-[2px]">
            <button
              type="button"
              onPointerDown={(e) => { e.stopPropagation(); phase === "ready" ? start() : setPhase("play"); }}
              className="tap inline-flex items-center gap-2 rounded-full bg-purple-600 px-7 py-3.5 font-display text-xl text-white shadow-lift hover:bg-purple-700"
            >
              <Play size={22} /> {phase === "ready" ? "เริ่มเกม" : "เล่นต่อ"}
            </button>
          </div>
        )}
      </div>

      {/* ───────── ปุ่มควบคุม ───────── */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {phase === "play" && (
          <button type="button" onClick={() => setPhase("pause")}
            className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-4 py-2 text-[14px] font-medium text-purple-700 hover:brightness-95">
            <Pause size={16} /> หยุดพัก
          </button>
        )}
        <button type="button" onClick={reset}
          className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-4 py-2 text-[14px] font-medium text-purple-700 hover:brightness-95">
          <RotateCcw size={16} /> เล่นใหม่
        </button>
        <button type="button" onClick={() => setFx((v) => !v)} aria-pressed={fx}
          className={cn("tap inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-medium transition",
            fx ? "bg-yellow-soft text-[#8a6a00]" : "bg-cream-dark text-purple-700")}>
          <Sparkles size={16} /> {fx ? "เอฟเฟกต์แสง: เปิด" : "เอฟเฟกต์แสง: ปิด"}
        </button>
      </div>

      {/* ───────── ตารางคะแนนปลา ───────── */}
      <div className="mx-auto mt-4 grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4">
        {FISH_TYPES.map((t) => (
          <div key={t.kind} className={cn("flex items-center gap-2 rounded-2xl bg-cream px-3 py-2", !fx && "fx-off")}>
            <span className={cn("text-2xl leading-none", t.kind === "gold" && "fish-gold", t.kind === "special" && "fish-special")}>{t.emoji}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] leading-tight text-purple-800">{t.label}</span>
              <span className="block text-[11px] leading-tight text-ink-soft">{t.hint}</span>
            </span>
            <span className="font-display text-[15px] text-purple-700">+{t.score}</span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-[13px] leading-relaxed text-ink-soft">
        🖱️ เลื่อนเมาส์ซ้าย–ขวาเพื่อเล็ง แล้วคลิกเพื่อหย่อนเบ็ด · เบ็ดแตะตัวปลาคือเกี่ยวติด
        <br />ถ้าเด็กไม่ชอบแสงกะพริบ กดปุ่ม “เอฟเฟกต์แสง: ปิด” ได้
      </p>
    </GameShell>
  );
}
