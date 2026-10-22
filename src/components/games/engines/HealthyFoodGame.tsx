"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell, shuffle, type GameOutcome } from "@/components/games/GameShell";
import { FACES, FOODS, HINT_WRONG, PRAISE_GOOD, PRAISE_LESS, goodFoods, lessFoods, type Food } from "@/data/healthy-food";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;
type Target = "mouth" | "bin";

interface Item extends Food { id: number; placed: boolean }

const pickRandom = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

/**
 * 🍎 หนูน้อยเลือกกิน — ลากอาหารไปที่ปากหนูน้อย หรือลากของหวานไปใส่ถังขยะ
 *
 * • ลากด้วยเมาส์ได้ (คลิกค้างแล้วลาก) และคลิกเลือกแล้วคลิกเป้าหมายก็ได้ เด็กเล็กกดง่ายกว่า
 * • วางผิดที่ อาหารกลับไปที่เดิม พร้อมคำแนะนำที่เป็นมิตร ไม่ดุ ไม่หักดาว
 * • อาหารแต่ละชิ้นเลือกได้ครั้งเดียว มีตัวนับความคืบหน้า
 */
export function HealthyFoodGame({ count = 10, timeLimit, onDone }: { count?: number; timeLimit?: number; onDone?: Cb }) {
  const [items, setItems] = useState<Item[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ text: string; tone: "good" | "hint" } | null>(null);
  const [face, setFace] = useState<string>(FACES.wait);
  const [wrongs, setWrongs] = useState(0);
  const [hit, setHit] = useState<Target | null>(null);
  const [done, setDone] = useState(false);

  /** ลากอยู่ตอนนี้ — เก็บใน state เพื่อวาดเงาอาหารตามเมาส์ */
  const [drag, setDrag] = useState<{ id: number; emoji: string; x: number; y: number } | null>(null);
  const dragRef = useRef<{ id: number; moved: boolean } | null>(null);
  const mouthRef = useRef<HTMLDivElement>(null);
  const binRef = useRef<HTMLButtonElement>(null);

  const build = useCallback(() => {
    /** ครึ่งหนึ่งเป็นของมีประโยชน์ อีกครึ่งเป็นของกินแต่น้อย จะได้ไม่เดาจากจำนวน */
    const half = Math.round(count / 2);
    const picked = shuffle([...shuffle(goodFoods()).slice(0, half), ...shuffle(lessFoods()).slice(0, count - half)]);
    setItems(picked.map((f, i) => ({ ...f, id: i + 1, placed: false })));
    setSel(null); setMsg(null); setFace(FACES.wait); setWrongs(0); setHit(null); setDone(false); setDrag(null);
  }, [count]);

  // สร้างชุดอาหารหลังหน้าเว็บพร้อม เพื่อไม่ให้ฝั่งเซิร์ฟเวอร์กับเบราว์เซอร์ต่างกัน
  useEffect(() => { build(); }, [build]);

  /** เป้าหมายที่ถูกต้องของอาหารชิ้นนี้ */
  const rightTarget = (f: Food): Target => (f.kind === "good" ? "mouth" : "bin");

  const resolve = useCallback((id: number, target: Target) => {
    setItems((list) => {
      const f = list.find((x) => x.id === id);
      if (!f || f.placed) return list;
      if (rightTarget(f) === target) {
        const praise = pickRandom(f.kind === "good" ? PRAISE_GOOD : PRAISE_LESS);
        setMsg({ text: `${f.emoji} ${f.name} — ${praise} ${f.why}`, tone: "good" });
        setFace(f.kind === "good" ? FACES.happy : FACES.wait);
        setTimeout(() => setFace(FACES.wait), 1200);
        const next = list.map((x) => (x.id === id ? { ...x, placed: true } : x));
        if (next.every((x) => x.placed)) { setFace(FACES.done); setTimeout(() => setDone(true), 600); }
        return next;
      }
      // วางผิดที่ — กลับที่เดิม บอกใบ้แบบเป็นมิตร
      setWrongs((w) => w + 1);
      setMsg({ text: `${f.emoji} ${f.name} — ${HINT_WRONG[f.kind]}`, tone: "hint" });
      setFace(FACES.think);
      setTimeout(() => setFace(FACES.wait), 1000);
      return list;
    });
    setSel(null);
  }, []);

  /* ---------- ลากด้วยเมาส์หรือนิ้ว ---------- */
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      d.moved = true;
      setDrag((g) => (g ? { ...g, x: e.clientX, y: e.clientY } : g));
      const inRect = (el: Element | null) => {
        if (!el) return false;
        const b = el.getBoundingClientRect();
        return e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom;
      };
      setHit(inRect(mouthRef.current) ? "mouth" : inRect(binRef.current) ? "bin" : null);
    };
    const up = (e: PointerEvent) => {
      const d = dragRef.current;
      dragRef.current = null;
      setDrag(null); setHit(null);
      if (!d) return;
      const inRect = (el: Element | null) => {
        if (!el) return false;
        const b = el.getBoundingClientRect();
        return e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom;
      };
      if (!d.moved) { setSel(d.id); setMsg(null); return; } // คลิกเฉย ๆ = เลือกไว้ก่อน
      if (inRect(mouthRef.current)) resolve(d.id, "mouth");
      else if (inRect(binRef.current)) resolve(d.id, "bin");
      else setSel(null); // ปล่อยนอกเป้า เงียบ ๆ อาหารกลับที่เดิมเอง
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up); };
  }, [resolve]);

  const grab = (e: React.PointerEvent, it: Item) => {
    if (done || it.placed) return;
    dragRef.current = { id: it.id, moved: false };
    setDrag({ id: it.id, emoji: it.emoji, x: e.clientX, y: e.clientY });
    setSel(it.id);
  };

  const left = items.filter((x) => !x.placed).length;
  const eaten = items.filter((x) => x.placed && x.kind === "good").length;
  const binned = items.filter((x) => x.placed && x.kind === "less").length;
  const selItem = items.find((x) => x.id === sel);

  if (items.length === 0) return null;

  return (
    <GameShell
      instruction={
        done ? `🎉 เก่งมาก! เลือกครบ ${items.length} อย่างแล้ว`
          : selItem ? `เลือก ${selItem.emoji} ${selItem.name} อยู่ — ลากไปที่ปากหนูน้อย หรือถังขยะ (จะคลิกที่เป้าหมายก็ได้)`
          : "ลากอาหารที่มีประโยชน์ไปที่ปากหนูน้อย 🧒 · ลากของหวานที่ควรกินแต่น้อยไปใส่ถังขยะ 🗑️"
      }
      progress={{ current: items.length - left, total: items.length }}
      done={done}
      onRestart={build}
      stats={`กินแล้ว ${eaten} อย่าง · ทิ้งถัง ${binned} อย่าง${wrongs > 0 ? ` · วางผิดที่ ${wrongs} ครั้ง` : ""}`}
      mistakes={wrongs}
      total={items.length}
      timeLimit={timeLimit}
      onDone={onDone}
    >
      {/* ───────── ฉาก: หนูน้อย + ถังขยะ ───────── */}
      <div className="mx-auto grid max-w-3xl grid-cols-[1fr_auto] items-end gap-3 rounded-3xl bg-gradient-to-b from-sky-soft to-mint-soft p-4 sm:gap-5 sm:p-6">
        {/* ตัวละคร */}
        <div className="flex flex-col items-center">
          <div
            ref={mouthRef}
            onClick={() => sel !== null && resolve(sel, "mouth")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && sel !== null) resolve(sel, "mouth"); }}
            aria-label="ปากของหนูน้อย — ลากอาหารที่มีประโยชน์มาที่นี่"
            className={cn(
              "tap grid place-items-center rounded-full bg-white/80 p-3 transition sm:p-4",
              hit === "mouth" ? "scale-110 ring-4 ring-mint-soft" : "ring-2 ring-white/70",
              sel !== null && "cursor-pointer hover:scale-105",
            )}
          >
            <span className="text-[clamp(3.5rem,16vw,6rem)] leading-none">{face}</span>
          </div>
          <p className="mt-2 rounded-full bg-white/80 px-3 py-1 text-[13px] font-medium text-purple-700">
            🧒 หนูน้อย — อาหารมีประโยชน์
          </p>
        </div>

        {/* ถังขยะ */}
        <button
          ref={binRef}
          type="button"
          onClick={() => sel !== null && resolve(sel, "bin")}
          aria-label="ถังขยะ — ลากของหวานที่ควรกินแต่น้อยมาที่นี่"
          className={cn(
            "tap grid place-items-center rounded-3xl bg-white/80 p-3 transition sm:p-4",
            hit === "bin" ? "scale-110 ring-4 ring-pink-accent" : "ring-2 ring-white/70",
            sel !== null && "hover:scale-105",
          )}
        >
          <span className="text-[clamp(2.5rem,11vw,4rem)] leading-none">🗑️</span>
          <span className="mt-1 block max-w-[7rem] text-[12px] font-medium leading-tight text-purple-700">
            ของที่ควรกินแต่น้อย
          </span>
        </button>
      </div>

      {/* ───────── คำชม / คำแนะนำ ───────── */}
      <div className="mx-auto mt-3 min-h-[3.25rem] max-w-3xl">
        {msg && (
          <p
            role="status"
            className={cn(
              "animate-rise rounded-2xl px-4 py-2.5 text-center text-[15px] leading-snug",
              msg.tone === "good" ? "bg-mint-soft text-[#1f6b4d]" : "bg-yellow-soft text-[#8a6a00]",
            )}
          >
            {msg.tone === "good" ? "⭐ " : "💡 "}{msg.text}
          </p>
        )}
      </div>

      {/* ───────── กรอบอาหาร ───────── */}
      <p className="mb-2 text-center text-[14px] text-ink-soft">
        🍽️ อาหารรอบนี้ {items.length} อย่าง · เหลืออีก {left} อย่าง — คลิกค้างแล้วลาก หรือคลิกเลือกแล้วคลิกเป้าหมาย
      </p>
      <div className="mx-auto grid max-w-3xl grid-cols-5 gap-2 rounded-3xl bg-cream p-3 sm:grid-cols-5">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            disabled={it.placed || done}
            onPointerDown={(e) => grab(e, it)}
            aria-label={`${it.name}${it.placed ? " — เลือกไปแล้ว" : ""}`}
            aria-pressed={sel === it.id}
            className={cn(
              "tap grid aspect-square touch-none place-items-center rounded-2xl border-2 bg-white transition",
              it.placed
                ? "border-line opacity-25"
                : sel === it.id
                  ? "scale-110 border-purple-500! shadow-lift"
                  : "border-line hover:scale-105 hover:bg-cream-dark cursor-grab active:cursor-grabbing",
              drag?.id === it.id && "opacity-40",
            )}
          >
            <span className="text-[clamp(1.6rem,7vw,2.4rem)] leading-none">{it.emoji}</span>
            <span className="px-0.5 text-center text-[10px] leading-tight text-ink-soft">{it.name}</span>
          </button>
        ))}
      </div>

      <p className="mt-3 text-center text-[13px] leading-relaxed text-ink-soft">
        ของหวานไม่ใช่ของไม่ดีนะ — แค่เป็นของที่ <b>กินแต่น้อย</b> เก็บไว้กินนาน ๆ ที
        <br />ส่วนผัก ผลไม้ ข้าว นม ไข่ และปลา กินได้บ่อย ๆ ทุกวัน
      </p>

      {/* เงาอาหารที่ลากอยู่ — ตามเมาส์ไปทั่วหน้าจอ */}
      {drag && (
        <span
          aria-hidden
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 text-5xl leading-none drop-shadow-lg sm:text-6xl"
          style={{ left: drag.x, top: drag.y }}
        >
          {drag.emoji}
        </span>
      )}
    </GameShell>
  );
}

export { FOODS };
