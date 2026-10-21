"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Lightbulb } from "lucide-react";
import { GameShell, type GameOutcome } from "@/components/games/GameShell";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;

/** ของ 1 ชิ้นในฉาก — ตำแหน่งเป็น % ของกรอบภาพ */
interface Item { emoji: string; x: number; y: number; size: number; flip?: boolean }

/** ฉาก 1 ด่าน */
export interface Scene {
  id: string;
  title: string;
  titleEn: string;
  sky: string;
  ground: string;
  items: Item[];
  /** ของที่จะถูกเปลี่ยนในภาพขวา (อ้างด้วยลำดับใน items) */
  diffs: { index: number; to?: string; hide?: boolean; grow?: number }[];
}

/** รัศมีพื้นที่คลิก (% ของความกว้างภาพ) — เผื่อไว้ใหญ่ เพราะเด็กเล็กเล็งไม่แม่น */
const HIT = 9;

export function SpotDiffGame({ scenes, timeLimit, onDone }: { scenes: Scene[]; timeLimit?: number; onDone?: Cb }) {
  const [i, setI] = useState(0);
  const [found, setFound] = useState<number[]>([]);
  const [miss, setMiss] = useState(0);
  const [cheer, setCheer] = useState<string | null>(null);
  const [ripple, setRipple] = useState<{ x: number; y: number; k: number } | null>(null);
  const [hint, setHint] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => { setReady(true); }, []);

  const scene = scenes[i];

  const reset = useCallback(() => { setFound([]); setMiss(0); setCheer(null); setHint(null); setRipple(null); }, []);
  const restart = useCallback(() => { setI(0); setDone(false); reset(); }, [reset]);
  useEffect(() => { restart(); }, [scenes, restart]);

  /** ของในภาพขวา = ภาพซ้าย + จุดที่เปลี่ยน */
  const rightItems = useMemo(() => {
    if (!scene) return [];
    const copy = scene.items.map((it) => ({ ...it }));
    scene.diffs.forEach((d) => {
      const it = copy[d.index];
      if (!it) return;
      if (d.hide) it.emoji = "";
      else if (d.to) it.emoji = d.to;
      if (d.grow) it.size = Math.round(it.size * d.grow);
    });
    return copy;
  }, [scene]);

  if (!ready || !scene) return null;

  const total = scene.diffs.length;
  const left = total - found.length;

  const CHEERS = ["ไม่เป็นไรนะ ลองดูใหม่อีกที 💪", "เกือบแล้ว! มองดี ๆ อีกนิด 👀", "ลองเทียบสองภาพช้า ๆ ดูนะ 🙂", "เก่งมากที่ไม่ยอมแพ้ ลองอีกครั้ง 🌟"];

  const click = (e: React.MouseEvent<HTMLDivElement>) => {
    if (done) return;
    const b = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - b.left) / b.width) * 100;
    const y = ((e.clientY - b.top) / b.height) * 100;

    const hitIdx = scene.diffs.findIndex((d, k) => {
      if (found.includes(k)) return false;
      const it = scene.items[d.index];
      if (!it) return false;
      return Math.hypot(it.x - x, (it.y - y) * 0.75) <= HIT;   // คูณ 0.75 เพราะภาพเป็นแนวนอน
    });

    if (hitIdx < 0) {
      setMiss((m) => m + 1);
      setCheer(CHEERS[Math.floor(Math.random() * CHEERS.length)]);
      setRipple({ x, y, k: Date.now() });
      setTimeout(() => setCheer(null), 1400);
      return;
    }
    const next = [...found, hitIdx];
    setFound(next);
    setCheer(null);
    setHint(null);
    if (next.length === total) setTimeout(() => setDone(true), 600);
  };

  const nextScene = () => {
    if (i + 1 >= scenes.length) { setDone(true); return; }
    setI(i + 1); setDone(false); reset();
  };

  const showHint = () => {
    const k = scene.diffs.findIndex((_, idx) => !found.includes(idx));
    if (k >= 0) { setHint(k); setTimeout(() => setHint(null), 2200); }
  };

  const allDone = done && i + 1 >= scenes.length;

  /** วาดภาพ 1 ฝั่ง */
  const Picture = ({ items, side }: { items: Item[]; side: "left" | "right" }) => (
    <div
      onClick={click}
      className={cn(
        "relative aspect-[4/3] w-full cursor-crosshair overflow-hidden rounded-3xl border-4 border-purple-200 shadow-soft",
      )}
      style={{ background: `linear-gradient(${scene.sky} 0%, ${scene.sky} 62%, ${scene.ground} 62%, ${scene.ground} 100%)` }}
      role="img"
      aria-label={`ภาพ${side === "left" ? "ซ้าย" : "ขวา"} — ${scene.title}`}
    >
      {items.map((it, k) =>
        it.emoji ? (
          <span
            key={k}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 leading-none drop-shadow-sm"
            style={{ left: `${it.x}%`, top: `${it.y}%`, fontSize: `${it.size}%`, transform: `translate(-50%,-50%) scaleX(${it.flip ? -1 : 1})` }}
          >
            {it.emoji}
          </span>
        ) : null,
      )}

      {/* วงกลมจุดที่เจอแล้ว */}
      {scene.diffs.map((d, k) => {
        const it = scene.items[d.index];
        if (!it || !found.includes(k)) return null;
        return (
          <span
            key={`f${k}`}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#1f6b4d] bg-[#1f6b4d]/10"
            style={{ left: `${it.x}%`, top: `${it.y}%`, width: `${HIT * 2}%`, aspectRatio: "1" }}
          >
            <span className="absolute -right-1 -top-1 text-[14px]">✅</span>
          </span>
        );
      })}

      {/* ตัวช่วยกะพริบ */}
      {hint !== null && scene.items[scene.diffs[hint].index] && (
        <span
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full border-4 border-yellow-accent"
          style={{
            left: `${scene.items[scene.diffs[hint].index].x}%`,
            top: `${scene.items[scene.diffs[hint].index].y}%`,
            width: `${HIT * 2.4}%`, aspectRatio: "1",
          }}
        />
      )}

      {/* รอยคลิกผิด */}
      {ripple && (
        <span
          key={ripple.k}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-pink-accent opacity-70"
          style={{ left: `${ripple.x}%`, top: `${ripple.y}%`, width: "10%", aspectRatio: "1" }}
        />
      )}

      <span className="absolute left-2 top-2 rounded-full bg-white/85 px-2.5 py-0.5 text-[12px] font-medium text-purple-800">
        {side === "left" ? "ภาพซ้าย" : "ภาพขวา"}
      </span>
    </div>
  );

  return (
    <GameShell
      instruction={
        allDone ? `🎉 เก่งมาก! เล่นครบทุกด่านแล้ว`
          : done ? `🎉 เจอครบ ${total} จุดแล้ว! ไปด่านต่อไปกันเลย`
          : cheer ?? `หาจุดที่ต่างกัน ${total} จุด — เจอแล้ว ${found.length} เหลืออีก ${left} จุด`
      }
      progress={{ current: found.length, total }}
      done={allDone}
      onRestart={restart}
      stats={`ด่าน ${i + 1}/${scenes.length} · ${scene.title}${miss > 0 ? ` · คลิกพลาด ${miss} ครั้ง` : ""}`}
      mistakes={0}
      total={total}
      timeLimit={timeLimit}
      onDone={onDone}
    >
      <p className="mb-3 text-center text-[15px] text-ink-soft">
        🖱️ คลิกตรงจุดที่คิดว่าต่างกัน จะคลิกภาพซ้ายหรือภาพขวาก็ได้
      </p>

      <div className="mx-auto grid max-w-5xl gap-3 lg:grid-cols-2">
        <Picture items={scene.items} side="left" />
        <Picture items={rightItems} side="right" />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={showHint} disabled={done || left === 0}
          className="tap inline-flex items-center gap-1.5 rounded-full bg-yellow-soft px-4 py-2 text-[14px] font-medium text-[#8a6a00] hover:brightness-95 disabled:opacity-40">
          <Lightbulb size={16} /> ขอตัวช่วย 1 จุด
        </button>
        {done && !allDone && (
          <button type="button" onClick={nextScene}
            className="tap inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-5 py-2.5 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700">
            ไปด่านถัดไป <ArrowRight size={16} />
          </button>
        )}
      </div>

      <p className="mt-3 text-center text-[13px] leading-relaxed text-ink-soft">
        คลิกผิดไม่เป็นไร ไม่หักคะแนน — พื้นที่คลิกทำไว้กว้างเป็นพิเศษสำหรับเด็กเล็ก
        <br />เล่นบนคอมด้วยเมาส์ได้ดีที่สุด และแตะบนแท็บเล็ตได้เหมือนกัน
      </p>
    </GameShell>
  );
}
