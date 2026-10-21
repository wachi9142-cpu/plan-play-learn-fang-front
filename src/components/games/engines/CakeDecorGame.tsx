"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, Shuffle, Trash2 } from "lucide-react";
import { GameShell, type GameOutcome } from "@/components/games/GameShell";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;

/** คลังของแต่งหน้าเค้ก — สุ่มมาใช้รอบละ 12 อย่าง แต่ละรอบจึงไม่เหมือนกัน */
const TOPPINGS = [
  "🍓", "🍒", "🫐", "🥝", "🍊", "🍇", "🍑", "🍉", "🍌", "🥭",
  "⭐", "💗", "🌸", "🌼", "🍬", "🍭", "🍫", "🍪", "🧁", "🍩",
  "🎀", "✨", "🌈", "🦋", "🐝", "🕯️", "🎈", "💎", "🍦", "🥨",
];

/** สีเค้กให้สุ่มด้วย จะได้ไม่ซ้ำกันทุกรอบ */
const CAKES = [
  { id: "pink", cream: "#fff6e3", drip: "#f9a8d4", plate: "#bfe6f5", label: "ครีมชมพู" },
  { id: "mint", cream: "#f3fff8", drip: "#7bd1a8", plate: "#ffe1ef", label: "ครีมเขียวมิ้นต์" },
  { id: "purple", cream: "#fdf6ff", drip: "#c084fc", plate: "#ffe9bf", label: "ครีมม่วงลาเวนเดอร์" },
  { id: "choco", cream: "#fff3e0", drip: "#a9714b", plate: "#d8f0ff", label: "ครีมช็อกโกแลต" },
];

interface Placed { id: number; emoji: string; x: number; y: number }

const pickSome = <T,>(arr: T[], n: number): T[] => {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r.slice(0, n);
};

/** 🎂 เค้กวาดด้วย SVG — เปลี่ยนสีครีมได้ */
function Cake({ cream, drip, plate }: { cream: string; drip: string; plate: string }) {
  return (
    <svg viewBox="0 0 300 260" className="h-full w-full" aria-hidden>
      {/* จาน */}
      <ellipse cx="150" cy="232" rx="132" ry="20" fill={plate} />
      <ellipse cx="150" cy="226" rx="132" ry="18" fill="#ffffff" opacity="0.6" />
      {/* ชั้นล่าง */}
      <rect x="34" y="138" width="232" height="86" rx="14" fill={cream} />
      <path d="M34 150c12 0 12 16 24 16s12-16 24-16 12 16 24 16 12-16 24-16 12 16 24 16 12-16 24-16 12 16 24 16 12-16 24-16 12 16 24 16V152c0-8-6-14-14-14H48c-8 0-14 6-14 14z" fill={drip} />
      <path d="M34 196c14 0 14 12 28 12s14-12 28-12 14 12 28 12 14-12 28-12 14 12 28 12 14-12 28-12 14 12 28 12v-8c-14 0-14-12-28-12s-14 12-28 12-14-12-28-12-14 12-28 12-14-12-28-12-14 12-28 12-14-12-28-12z" fill={drip} opacity="0.85" />
      {/* ชั้นบน */}
      <rect x="74" y="56" width="152" height="84" rx="12" fill={cream} />
      <path d="M74 68c10 0 10 14 20 14s10-14 20-14 10 14 20 14 10-14 20-14 10 14 20 14 10-14 20-14 10 14 20 14V70c0-8-6-14-14-14H88c-8 0-14 6-14 14z" fill={drip} />
      <ellipse cx="150" cy="58" rx="76" ry="14" fill={drip} />
      <ellipse cx="150" cy="54" rx="68" ry="11" fill={cream} opacity="0.55" />
    </svg>
  );
}

/**
 * 🎂 เกมแต่งหน้าเค้ก — เลือกของแต่งจากถาด แล้วแตะบนเค้กเพื่อวาง
 * ไม่มีระดับง่าย/ยาก · ของแต่งและสีเค้กสุ่มใหม่ทุกรอบ จึงไม่เหมือนเดิมสักครั้ง
 */
export function CakeDecorGame({ onDone }: { onDone?: Cb }) {
  const [cake, setCake] = useState(CAKES[0]);
  const [tray, setTray] = useState<string[]>([]);
  const [pick, setPick] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [erase, setErase] = useState(false);
  const [done, setDone] = useState(false);
  const area = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  const reroll = useCallback(() => {
    setCake(CAKES[Math.floor(Math.random() * CAKES.length)]);
    setTray(pickSome(TOPPINGS, 12));
    setPick(null); setPlaced([]); setErase(false); setDone(false);
    nextId.current = 1;
  }, []);

  // สุ่มหลังหน้าเว็บพร้อม เพื่อไม่ให้ฝั่งเซิร์ฟเวอร์กับเบราว์เซอร์ต่างกัน
  useEffect(() => { reroll(); }, [reroll]);

  const drop = (e: React.PointerEvent) => {
    if (done || erase || !pick) return;
    const el = area.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    const x = ((e.clientX - b.left) / b.width) * 100;
    const y = ((e.clientY - b.top) / b.height) * 100;
    if (x < 4 || x > 96 || y < 4 || y > 96) return;
    setPlaced((p) => [...p, { id: nextId.current++, emoji: pick, x, y }]);
  };

  const removeAt = (id: number) => setPlaced((p) => p.filter((x) => x.id !== id));

  return (
    <GameShell
      instruction={
        done ? `🎉 เค้กสวยมาก! ใส่ของแต่งไป ${placed.length} ชิ้น`
          : erase ? "🧽 แตะของแต่งบนเค้กเพื่อเอาออก"
          : pick ? `เลือก ${pick} แล้ว — แตะบนเค้กตรงที่อยากวางได้เลย`
          : "เลือกของแต่งจากถาดด้านล่างก่อน แล้วแตะบนเค้ก"
      }
      done={done}
      onRestart={reroll}
      stats={`${cake.label} · ใส่ไปแล้ว ${placed.length} ชิ้น`}
      mistakes={0}
      total={1}
      onDone={onDone}
    >
      {/* เค้ก */}
      <div
        ref={area}
        onPointerDown={drop}
        className={cn(
          "relative mx-auto aspect-[300/260] w-full max-w-[26rem] touch-none select-none rounded-3xl bg-white shadow-soft ring-1 ring-line",
          !done && !erase && pick && "cursor-copy",
        )}
      >
        <Cake cream={cake.cream} drip={cake.drip} plate={cake.plate} />

        {placed.map((p) => (
          <button
            key={p.id}
            type="button"
            onPointerDown={(e) => { e.stopPropagation(); if (erase) removeAt(p.id); }}
            aria-label={`ของแต่ง ${p.emoji}${erase ? " แตะเพื่อเอาออก" : ""}`}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 text-[clamp(1.3rem,6vw,2rem)] leading-none drop-shadow transition",
              erase && "hover:scale-110 hover:brightness-75",
            )}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            {p.emoji}
          </button>
        ))}
      </div>

      {/* ถาดของแต่ง — สุ่มใหม่ทุกรอบ */}
      <p className="mt-4 mb-2 text-center text-[14px] text-ink-soft">
        🧁 ของแต่งรอบนี้ (สุ่มมา 12 อย่าง) — แตะเลือกก่อน แล้วไปแตะบนเค้ก
      </p>
      <div className="mx-auto grid max-w-xl grid-cols-6 gap-2">
        {tray.map((t, i) => (
          <button
            key={`${t}-${i}`}
            type="button"
            onClick={() => { setPick(t); setErase(false); }}
            aria-label={`ของแต่ง ${t}`}
            aria-pressed={pick === t && !erase}
            className={cn(
              "tap grid aspect-square place-items-center rounded-2xl border-2 bg-white text-[clamp(1.4rem,6vw,2rem)] transition",
              pick === t && !erase ? "scale-110 border-purple-500! shadow-lift" : "border-line hover:scale-105 hover:bg-cream",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ปุ่มเครื่องมือ */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => { setErase((v) => !v); setPick(null); }}
          aria-pressed={erase}
          className={cn("tap inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-medium transition",
            erase ? "bg-[#a8456c] text-white! shadow-soft" : "bg-cream-dark text-purple-700 hover:brightness-95")}>
          <Eraser size={16} /> {erase ? "กำลังเอาออก" : "เอาของแต่งออก"}
        </button>
        <button type="button" onClick={() => setPlaced([])} disabled={placed.length === 0}
          className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-4 py-2 text-[14px] font-medium text-purple-700 hover:brightness-95 disabled:opacity-40">
          <Trash2 size={16} /> ล้างเค้กใหม่
        </button>
        <button type="button" onClick={reroll}
          className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-4 py-2 text-[14px] font-medium text-purple-700 hover:brightness-95">
          <Shuffle size={16} /> สุ่มของแต่งและสีเค้กใหม่
        </button>
        <button type="button" onClick={() => setDone(true)} disabled={placed.length === 0 || done}
          className="tap inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-5 py-2 text-[14px] font-medium text-white shadow-soft hover:bg-purple-700 disabled:opacity-40">
          🎉 แต่งเสร็จแล้ว
        </button>
      </div>

      <p className="mt-3 text-center text-[13px] leading-relaxed text-ink-soft">
        ⚡ เกมนี้ไม่มีผิดถูก ไม่มีระดับ — แต่งได้ตามใจชอบเลย
        <br />ของแต่งและสีเค้ก <b>สุ่มใหม่ทุกรอบ</b> เล่นกี่ครั้งก็ไม่เหมือนเดิม
      </p>
    </GameShell>
  );
}
