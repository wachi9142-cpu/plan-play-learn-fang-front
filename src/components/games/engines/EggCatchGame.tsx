"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { GameShell, type GameOutcome } from "@/components/games/GameShell";
import { starsFor } from "@/lib/game-levels";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;

/** ของที่ตกลงมา — ไข่ดีเก็บ · ไข่เสียกับขี้ไก่ต้องหลบ */
type DropKind = "egg" | "rotten" | "poop";

interface Drop {
  id: number;
  kind: DropKind;
  /** % ของความกว้างฉาก */
  x: number;
  /** % ของความสูงฉาก */
  y: number;
  /** ความเร็วตก %/วินาที */
  vy: number;
  /** องศาหมุนขณะตก */
  rot: number;
  spin: number;
}

const HENS = 5;
/** แม่ไก่อยู่แถวบน ไข่จึงเริ่มตกจากใต้คอน */
const HEN_Y = 16;
/** ตะกร้าอยู่แถวล่าง */
const BASKET_Y = 86;
/** ไข่ที่เลยเส้นนี้ถือว่าตกพื้น */
const FLOOR_Y = 96;

const EMOJI: Record<DropKind, string> = { egg: "🥚", rotten: "🥚", poop: "💩" };
const LABEL: Record<DropKind, string> = { egg: "ไข่ดี", rotten: "ไข่เสีย", poop: "ขี้ไก่" };

/** ตำแหน่งแม่ไก่ทั้ง 5 ตัว — ไข่ตกจากหลายจุด ไม่ใช่จุดเดียว */
const henX = (i: number) => 12 + i * 19;

/**
 * 🥚 เก็บไข่ให้คุณยาย
 *
 * แม่ไก่ 5 ตัวบนคอนผลัดกันออกไข่ เด็กเลื่อนตะกร้าด้วยเมาส์หรือปุ่มลูกศรไปรับ
 * ไข่ดี = เก็บ · ไข่เสีย (มีจุดเขียว) และขี้ไก่ = ต้องหลบ
 * พลาดไข่ดีไม่ลงโทษ แค่ไม่ได้คะแนน · รับของที่ต้องหลบจะเสียหัวใจ
 */
export function EggCatchGame({ seconds = 60, lives = 3, target = 20, fallSpeed = 26, gapMs = 1100, rottenRate = 0.3, onDone }: {
  seconds?: number;
  /** จำนวนหัวใจ หมดแล้วจบเกม */
  lives?: number;
  /** จำนวนไข่เป้าหมาย ใช้คิดดาว */
  target?: number;
  /** ความเร็วตกตอนเริ่ม (%/วินาที) — จะค่อย ๆ เร็วขึ้นเอง */
  fallSpeed?: number;
  /** เว้นระยะเวลาระหว่างของที่ตก (มิลลิวินาที) */
  gapMs?: number;
  /** สัดส่วนของที่ต้องหลบ */
  rottenRate?: number;
  onDone?: Cb;
}) {
  const [phase, setPhase] = useState<"ready" | "play" | "pause" | "over">("ready");
  const [eggs, setEggs] = useState(0);
  const [broken, setBroken] = useState(0);
  const [dodged, setDodged] = useState(0);
  const [hp, setHp] = useState(lives);
  const [left, setLeft] = useState(seconds);
  const [toast, setToast] = useState<{ text: string; tone: "good" | "oops" } | null>(null);
  const [drops, setDrops] = useState<{ id: number; kind: DropKind }[]>([]);
  const [layIdx, setLayIdx] = useState<number | null>(null);
  /** ไข่แตกบนพื้น — โชว์สั้น ๆ แล้วหายไป */
  const [splats, setSplats] = useState<{ id: number; x: number }[]>([]);

  const wrap = useRef<HTMLDivElement>(null);
  const items = useRef<Drop[]>([]);
  const els = useRef<Map<number, HTMLSpanElement>>(new Map());
  const basketEl = useRef<HTMLDivElement>(null);
  const basketX = useRef(50);
  const nextId = useRef(1);
  const box = useRef({ w: 0, h: 0 });
  const sinceDrop = useRef(0);
  const elapsed = useRef(0);
  /** ปุ่มลูกศรค้างไว้ได้ */
  const keys = useRef({ left: false, right: false });
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const reset = useCallback(() => {
    items.current = []; els.current.clear(); setDrops([]); setSplats([]);
    basketX.current = 50; sinceDrop.current = 0; elapsed.current = 0;
    setEggs(0); setBroken(0); setDodged(0); setHp(lives); setLeft(seconds);
    setToast(null); setLayIdx(null); setPhase("ready");
  }, [lives, seconds]);

  // เตรียมฉากหลังหน้าเว็บพร้อม เพื่อไม่ให้ฝั่งเซิร์ฟเวอร์กับเบราว์เซอร์ต่างกัน
  useEffect(() => { reset(); }, [reset]);

  /* ---------- ขนาดฉาก ---------- */
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const read = () => { const b = el.getBoundingClientRect(); box.current = { w: b.width, h: b.height }; };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ---------- นาฬิกาถอยหลัง (หยุดได้ตอนพัก) ---------- */
  useEffect(() => {
    if (phase !== "play") return;
    const t = setInterval(() => setLeft((v) => { if (v <= 1) { setPhase("over"); return 0; } return v - 1; }), 1000);
    return () => clearInterval(t);
  }, [phase]);

  /* ---------- หัวใจหมด = จบเกม ---------- */
  useEffect(() => { if (hp <= 0 && phase === "play") setPhase("over"); }, [hp, phase]);

  /* ---------- รายงานผลตอนจบ ---------- */
  const reported = useRef(false);
  useEffect(() => {
    if (phase !== "over" || reported.current) return;
    reported.current = true;
    const miss = Math.max(0, target - eggs);
    onDone?.({ mistakes: miss, total: target, seconds: seconds - left, timeUp: false, stars: starsFor(miss, target, false) });
  }, [phase, eggs, target, seconds, left, onDone]);
  useEffect(() => { if (phase === "play") reported.current = false; }, [phase]);

  /* ---------- ปุ่มลูกศร / A D ---------- */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { keys.current.left = true; e.preventDefault(); }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { keys.current.right = true; e.preventDefault(); }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.current.right = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

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

      if (running) {
        elapsed.current += dt;
        /* ตะกร้าเลื่อนด้วยปุ่มลูกศร (เมาส์จัดการแยกใน onPointerMove) */
        const k = keys.current;
        if (k.left !== k.right) basketX.current = Math.min(92, Math.max(8, basketX.current + (k.left ? -62 : 62) * dt));

        /* ปล่อยของใหม่ — ยิ่งเล่นนานยิ่งถี่และเร็วขึ้นทีละน้อย */
        sinceDrop.current += dt * 1000;
        const ramp = 1 + Math.min(0.6, elapsed.current / 90);
        if (sinceDrop.current >= gapMs / ramp) {
          sinceDrop.current = 0;
          const hen = Math.floor(Math.random() * HENS);
          const r = Math.random();
          const kind: DropKind = r < rottenRate ? (Math.random() < 0.5 ? "rotten" : "poop") : "egg";
          const d: Drop = {
            id: nextId.current++,
            kind,
            x: henX(hen),
            y: HEN_Y + 4,
            vy: fallSpeed * ramp * (0.9 + Math.random() * 0.25),
            rot: 0,
            spin: (Math.random() < 0.5 ? -1 : 1) * (40 + Math.random() * 70),
          };
          items.current.push(d);
          setDrops((list) => [...list, { id: d.id, kind: d.kind }]);
          setLayIdx(hen);
          setTimeout(() => setLayIdx((v) => (v === hen ? null : v)), 420);
        }

        /* ของตกลงมา + ตรวจการรับ */
        for (let i = items.current.length - 1; i >= 0; i--) {
          const d = items.current[i];
          d.y += d.vy * dt;
          d.rot += d.spin * dt;

          const nearBasket = Math.abs(d.x - basketX.current) < 9;
          if (d.y >= BASKET_Y - 3 && d.y <= BASKET_Y + 5 && nearBasket) {
            items.current.splice(i, 1);
            setDrops((list) => list.filter((x) => x.id !== d.id));
            els.current.delete(d.id);
            if (d.kind === "egg") {
              setEggs((n) => n + 1);
              setToast({ text: "ได้ไข่แล้ว! +1 ฟอง", tone: "good" });
            } else {
              setHp((n) => n - 1);
              setToast({ text: d.kind === "poop" ? "อุ๊ย! โดนขี้ไก่ ลองหลบดูนะ" : "อันนี้ไข่เสียนะ คราวหน้าหลบทัน", tone: "oops" });
            }
            continue;
          }

          if (d.y >= FLOOR_Y) {
            items.current.splice(i, 1);
            setDrops((list) => list.filter((x) => x.id !== d.id));
            els.current.delete(d.id);
            if (d.kind === "egg") {
              setBroken((n) => n + 1);
              const sid = d.id;
              setSplats((s) => [...s, { id: sid, x: d.x }]);
              setTimeout(() => setSplats((s) => s.filter((x) => x.id !== sid)), 900);
            } else {
              setDodged((n) => n + 1); // หลบของที่ไม่ควรรับได้สำเร็จ
            }
          }
        }
      }

      /* วาด */
      for (const d of items.current) {
        const el = els.current.get(d.id);
        if (!el) continue;
        el.style.transform = `translate3d(${(d.x / 100) * w}px, ${(d.y / 100) * h}px, 0) translate(-50%, -50%) rotate(${d.rot}deg)`;
      }
      if (basketEl.current) {
        basketEl.current.style.transform = `translate3d(${(basketX.current / 100) * w}px, ${(BASKET_Y / 100) * h}px, 0) translate(-50%, -50%)`;
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [fallSpeed, gapMs, rottenRate]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1100);
    return () => clearTimeout(t);
  }, [toast]);

  const aim = (e: React.PointerEvent) => {
    if (phaseRef.current !== "play") return;
    const el = wrap.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    basketX.current = Math.min(92, Math.max(8, ((e.clientX - b.left) / b.width) * 100));
  };

  const done = phase === "over";

  return (
    <GameShell
      instruction={
        done
          ? hp <= 0
            ? `👵 ขอบใจจ้ะ เก็บไข่ได้ ${eggs} ฟอง — คราวหน้าหลบขี้ไก่ให้ทันนะจ๊ะ`
            : `👵 ขอบใจมากจ้ะหลาน เก็บไข่ให้ยายได้ตั้ง ${eggs} ฟอง!`
          : phase === "ready" ? "👵 ช่วยยายเก็บไข่หน่อยนะจ๊ะ — กด ▶ เริ่มเกม แล้วเลื่อนเมาส์ขยับตะกร้า"
          : phase === "pause" ? "⏸ พักอยู่ — กดเล่นต่อได้เลย"
          : "เลื่อนเมาส์ (หรือกดปุ่ม ← →) ขยับตะกร้ารับไข่ดี 🥚 และหลบขี้ไก่ 💩 กับไข่เสีย"
      }
      done={done}
      onRestart={reset}
      stats={`เก็บได้ ${eggs} ฟอง · ไข่แตก ${broken} ฟอง · หลบได้ ${dodged} ครั้ง`}
      mistakes={Math.max(0, target - eggs)}
      total={target}
      hideClock
      onDone={undefined}
    >
      {/* ───────── แถบคะแนน ───────── */}
      <div className="mx-auto mb-3 flex max-w-3xl flex-wrap items-center justify-center gap-2">
        <span className="rounded-full bg-yellow-soft px-3.5 py-1.5 font-display text-[16px] text-[#8a6a00]">🥚 เก็บได้ {eggs}</span>
        <span className="rounded-full bg-pink-soft px-3.5 py-1.5 font-display text-[16px] text-[#a8456c]">💔 ไข่แตก {broken}</span>
        <span className="rounded-full bg-mint-soft px-3.5 py-1.5 font-display text-[16px] text-[#1f6b4d]">🙌 หลบได้ {dodged}</span>
        <span className="rounded-full bg-white px-3.5 py-1.5 text-[16px] leading-none" aria-label={`เหลือ ${hp} หัวใจ`}>
          {Array.from({ length: lives }, (_, i) => <span key={i} className={cn(i >= hp && "opacity-25 grayscale")}>❤️</span>)}
        </span>
        <span className={cn("rounded-full px-3.5 py-1.5 font-mono text-[16px]", left <= 10 && phase === "play" ? "animate-pulse bg-red-50 text-red-600" : "bg-sky-soft text-purple-800")}>
          ⏱ {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
        </span>
      </div>

      {/* ───────── ฟาร์ม ───────── */}
      <div
        ref={wrap}
        onPointerMove={aim}
        className={cn("relative mx-auto aspect-[4/3] w-full max-w-3xl touch-none select-none overflow-hidden rounded-3xl shadow-soft ring-1 ring-line", phase === "play" && "cursor-none")}
        style={{ background: "linear-gradient(#cfeaff 0%, #e9f7d8 55%, #f3e3bd 100%)", containerType: "inline-size" }}
        role="application"
        aria-label="ฟาร์มไก่ของคุณยาย — เลื่อนเมาส์หรือกดลูกศรเพื่อขยับตะกร้า"
      >
        {/* เล้าไก่ + แม่ไก่ 5 ตัว */}
        <div className="pointer-events-none absolute inset-x-0 top-0" style={{ height: `${HEN_Y + 6}%`, background: "linear-gradient(#b5793f, #8d5a2b)", borderBottomLeftRadius: "14px", borderBottomRightRadius: "14px" }} />
        {Array.from({ length: HENS }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className={cn("pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 leading-none transition-transform", layIdx === i && "scale-125")}
            style={{ left: `${henX(i)}%`, top: `${HEN_Y - 3}%`, fontSize: "9cqw" }}
          >
            🐔
          </span>
        ))}
        {/* รังฟาง */}
        {Array.from({ length: HENS }, (_, i) => (
          <span key={`n${i}`} aria-hidden className="pointer-events-none absolute -translate-x-1/2 leading-none" style={{ left: `${henX(i)}%`, top: `${HEN_Y + 1}%`, fontSize: "5cqw" }}>🪹</span>
        ))}

        {/* รั้วไม้และหญ้า */}
        <div className="pointer-events-none absolute inset-x-0 flex justify-around opacity-70" style={{ bottom: "2%" }}>
          {["🌿", "🪵", "🌾", "🪵", "🌿", "🪵", "🌾"].map((d, i) => <span key={i} className="leading-none" style={{ fontSize: "4.5cqw" }}>{d}</span>)}
        </div>

        {/* คุณยาย */}
        <span aria-hidden className="pointer-events-none absolute leading-none" style={{ left: "3%", bottom: "4%", fontSize: "11cqw" }}>👵</span>

        {/* ของที่กำลังตก */}
        {drops.map((d) => (
          <span
            key={d.id}
            ref={(el) => { if (el) els.current.set(d.id, el); else els.current.delete(d.id); }}
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 leading-none will-change-transform"
            style={{ fontSize: "7cqw" }}
          >
            {d.kind === "rotten" ? (
              /* ไข่เสีย — สีคล้ำและมีจุดเขียว ให้เด็กสังเกตเห็นต่างจากไข่ดีชัด ๆ */
              <span className="relative inline-block" style={{ filter: "sepia(0.8) saturate(1.6) hue-rotate(45deg) brightness(0.72)" }}>
                {EMOJI.rotten}
                <span className="absolute left-[18%] top-[34%] size-[0.16em] rounded-full bg-[#4a7c1f]" />
                <span className="absolute left-[52%] top-[52%] size-[0.2em] rounded-full bg-[#4a7c1f]" />
                <span className="absolute left-[34%] top-[66%] size-[0.13em] rounded-full bg-[#4a7c1f]" />
              </span>
            ) : EMOJI[d.kind]}
          </span>
        ))}

        {/* ไข่แตกบนพื้น */}
        {splats.map((s) => (
          <span key={s.id} aria-hidden className="animate-rise pointer-events-none absolute -translate-x-1/2 leading-none" style={{ left: `${s.x}%`, top: `${FLOOR_Y - 3}%`, fontSize: "7cqw" }}>🍳</span>
        ))}

        {/* ตะกร้า */}
        <div ref={basketEl} className="pointer-events-none absolute left-0 top-0 leading-none will-change-transform">
          <span className="block leading-none" style={{ fontSize: "12cqw" }}>🧺</span>
        </div>

        {/* ข้อความตอบรับ */}
        {toast && (
          <p
            role="status"
            className={cn(
              "animate-rise pointer-events-none absolute inset-x-4 mx-auto max-w-xs rounded-2xl px-4 py-2 text-center font-display text-[15px] leading-snug shadow-lift",
              toast.tone === "good" ? "bg-mint-soft text-[#1f6b4d]" : "bg-yellow-soft text-[#8a6a00]",
            )}
            style={{ top: "40%" }}
          >
            {toast.text}
          </p>
        )}

        {/* ก่อนเริ่ม / ตอนพัก */}
        {(phase === "ready" || phase === "pause") && (
          <div className="absolute inset-0 grid place-items-center gap-3 bg-white/60 backdrop-blur-[2px]">
            {phase === "ready" && (
              <p className="mx-auto max-w-xs rounded-2xl bg-white/90 px-4 py-2.5 text-center font-display text-[17px] leading-snug text-purple-800">
                👵 “ช่วยยายเก็บไข่หน่อยนะจ๊ะ”
              </p>
            )}
            <button
              type="button"
              onClick={() => (phase === "ready" ? setPhase("play") : setPhase("play"))}
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
      </div>

      {/* ───────── ของที่ต้องเก็บและหลบ ───────── */}
      <div className="mx-auto mt-4 grid max-w-3xl gap-2 sm:grid-cols-3">
        {([
          { k: "egg" as const, title: "ไข่ดี — เก็บให้ได้!", hint: "เลื่อนตะกร้าไปรับ ได้เพิ่มฟองละ 1" },
          { k: "rotten" as const, title: "ไข่เสีย — ต้องหลบ!", hint: "สีคล้ำและมีจุดเขียว รับแล้วเสียหัวใจ" },
          { k: "poop" as const, title: "ขี้ไก่ — ต้องหลบ!", hint: "อย่าให้ตกลงตะกร้านะ" },
        ]).map((r) => (
          <div key={r.k} className="flex items-center gap-2.5 rounded-2xl bg-cream px-3 py-2">
            <span className="text-2xl leading-none" style={r.k === "rotten" ? { filter: "sepia(0.8) saturate(1.6) hue-rotate(45deg) brightness(0.72)" } : undefined}>{EMOJI[r.k]}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] leading-tight text-purple-800">{r.title}</span>
              <span className="block text-[11px] leading-tight text-ink-soft">{r.hint}</span>
            </span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-[13px] leading-relaxed text-ink-soft">
        🖱️ เลื่อนเมาส์ซ้าย–ขวาเพื่อขยับตะกร้า · ⌨️ หรือกดปุ่ม ← → ค้างไว้ก็ได้
        <br />พลาดไข่ดีไม่เป็นไร ไม่เสียหัวใจ — เสียหัวใจเฉพาะตอนรับ {LABEL.rotten}หรือ{LABEL.poop}เท่านั้น
      </p>
    </GameShell>
  );
}
