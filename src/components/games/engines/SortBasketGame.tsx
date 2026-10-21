"use client";

import { useCallback, useEffect, useState } from "react";
import { GameShell, shuffle, type GameOutcome } from "@/components/games/GameShell";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;

export interface SortRound {
  title: string;
  baskets: { emoji: string; label: string; accept: string[] }[];
  /** จำนวนชิ้นที่หยิบมาใช้ต่อรอบ (ระบบจะสุ่มจากของในตะกร้าทุกใบ) */
  pick?: number;
}

/**
 * 🧺 เกมคัดแยกใส่ตะกร้า — แตะของ แล้วแตะตะกร้าที่ใช่
 * เป็นเวอร์ชันออนไลน์ของใบงาน "ตัดแล้วแปะ" แบบเดิม ไม่ต้องพิมพ์ ไม่ต้องตัด ใช้ซ้ำได้ไม่จำกัด
 */
export function SortBasketGame({ rounds, pick = 10, timeLimit, onDone }: {
  rounds: SortRound[]; pick?: number; timeLimit?: number; onDone?: Cb;
}) {
  const [r, setR] = useState(0);
  const [items, setItems] = useState<string[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [inBasket, setInBasket] = useState<string[][]>([]);
  const [wrongs, setWrongs] = useState(0);
  const [bad, setBad] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const cur = rounds[r];

  const load = useCallback((idx: number) => {
    const round = rounds[idx];
    if (!round) return;
    const pool = round.baskets.flatMap((b) => b.accept);
    const n = round.pick ?? pick;
    // สุ่มของให้ครบจำนวน โดยวนของในตะกร้าให้ทั่ว
    const list: string[] = [];
    while (list.length < n) list.push(...shuffle(pool));
    setItems(shuffle(list.slice(0, n)));
    setInBasket(round.baskets.map(() => []));
    setSel(null); setBad(null);
  }, [rounds, pick]);

  const restart = useCallback(() => { setR(0); setWrongs(0); setDone(false); load(0); }, [load]);
  useEffect(() => { restart(); }, [restart]);

  if (!cur || items.length === 0) return null;

  const left = items.length;

  const drop = (b: number) => {
    if (sel === null || done) return;
    const it = items[sel];
    if (!cur.baskets[b].accept.includes(it)) {
      setWrongs((w) => w + 1);
      setBad(b);
      setTimeout(() => setBad(null), 600);
      return;
    }
    const rest = items.filter((_, i) => i !== sel);
    setItems(rest);
    setInBasket((prev) => prev.map((x, i) => (i === b ? [...x, it] : x)));
    setSel(null);
    if (rest.length === 0) {
      setTimeout(() => {
        if (r + 1 >= rounds.length) setDone(true);
        else { setR(r + 1); load(r + 1); }
      }, 800);
    }
  };

  return (
    <GameShell
      instruction={done ? `🎉 เก่งมาก! คัดแยกครบทุกชุดแล้ว` : cur.title}
      progress={{ current: done ? rounds.length : r, total: rounds.length }}
      done={done}
      onRestart={restart}
      stats={wrongs === 0 ? "ยังไม่ใส่ผิดเลย!" : `ใส่ผิด ${wrongs} ครั้ง`}
      mistakes={wrongs}
      total={rounds.length * 4}
      timeLimit={timeLimit}
      onDone={onDone}
    >
      {/* ตะกร้า */}
      <div className={cn("mx-auto grid max-w-2xl gap-3", cur.baskets.length >= 3 ? "grid-cols-3" : "grid-cols-2")}>
        {cur.baskets.map((b, i) => (
          <button
            key={i}
            type="button"
            onClick={() => drop(i)}
            aria-label={`ตะกร้า ${b.label} มี ${inBasket[i]?.length ?? 0} ชิ้น`}
            className={cn(
              "tap flex min-h-[9rem] flex-col items-center gap-1 rounded-3xl border-4 p-3 transition",
              bad === i ? "border-pink-accent! bg-pink-soft"
                : sel !== null ? "border-[#3fae7a]! bg-mint-soft ring-4 ring-[#7bd1a8]"
                : "border-[#caa86f] bg-[#f0dcb4]",
            )}
          >
            <span className="text-[clamp(1.8rem,8vw,2.6rem)] leading-none">{b.emoji}</span>
            <span className="font-display text-[15px] text-purple-800">{b.label}</span>
            <span className="mt-1 flex flex-wrap justify-center gap-0.5">
              {(inBasket[i] ?? []).map((it, k) => (
                <span key={k} className="text-[clamp(1rem,4vw,1.4rem)] leading-none">{it}</span>
              ))}
            </span>
            {bad === i && <span className="text-[13px] font-medium text-[#a8456c]">ยังไม่ใช่ตะกร้านี้นะ</span>}
          </button>
        ))}
      </div>

      {/* ของที่ต้องคัดแยก */}
      <p className="mt-4 mb-2 text-center text-[14px] text-ink-soft">
        {sel === null ? `แตะของด้านล่างก่อน แล้วแตะตะกร้าที่ใช่ (เหลืออีก ${left} ชิ้น)` : "แตะตะกร้าที่คิดว่าใช่ได้เลย"}
      </p>
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-2 rounded-3xl bg-cream-dark p-3">
        {items.map((it, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSel(sel === i ? null : i)}
            aria-label={`ของชิ้นที่ ${i + 1} ${it}`}
            aria-pressed={sel === i}
            className={cn(
              "tap grid size-14 place-items-center rounded-2xl border-2 bg-white text-[clamp(1.6rem,7vw,2.2rem)] transition sm:size-16",
              sel === i ? "scale-110 border-purple-500! shadow-lift" : "border-line hover:scale-105",
            )}
          >
            {it}
          </button>
        ))}
      </div>

      <p className="mt-3 text-center text-[13px] leading-relaxed text-ink-soft">
        🧺 เหมือนใบงาน &ldquo;ตัดแล้วแปะ&rdquo; แต่ไม่ต้องพิมพ์ ไม่ต้องตัด ใส่ผิดก็แก้ได้ทันที เล่นซ้ำได้ไม่จำกัด
      </p>
    </GameShell>
  );
}
