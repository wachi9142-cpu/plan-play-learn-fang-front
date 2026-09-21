"use client";

import { useEffect, useState } from "react";
import { BigTile, GameShell, shuffle } from "@/components/games/GameShell";

type Item = { emoji: string; value: number; label: string; count?: number };
type Round = { title: string; items: Item[] };

/** 🔢 เกมเรียงลำดับ — แตะทีละอันจากน้อยไปมาก */
export function SortGame({ rounds }: { rounds: Round[] }) {
  const [round, setRound] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [chosen, setChosen] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const load = (r: number) => { setItems(shuffle(rounds[r].items)); setChosen([]); setWrong(null); };
  const restart = () => { setRound(0); setDone(false); load(0); };
  useEffect(restart, [rounds]); // eslint-disable-line react-hooks/exhaustive-deps

  const sorted = [...(rounds[round]?.items ?? [])].sort((a, b) => a.value - b.value);
  const expected = sorted[chosen.length];

  const pick = (i: number) => {
    if (done || chosen.includes(i) || wrong !== null) return;
    if (items[i].value !== expected.value) { setWrong(i); setTimeout(() => setWrong(null), 600); return; }
    const next = [...chosen, i];
    setChosen(next);
    if (next.length === items.length) {
      setTimeout(() => {
        if (round + 1 >= rounds.length) setDone(true);
        else { setRound(round + 1); load(round + 1); }
      }, 800);
    }
  };

  return (
    <GameShell
      instruction={rounds[round].title}
      progress={{ current: done ? rounds.length : round, total: rounds.length }}
      done={done}
      onRestart={restart}
    >
      {/* แถวที่เรียงแล้ว */}
      <div className="mb-5 flex min-h-16 flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-purple-200 bg-cream p-3">
        {chosen.length === 0 && <span className="text-[15px] text-ink-soft">แตะเรียงตามลำดับที่นี่ →</span>}
        {chosen.map((i, n) => (
          <span key={i} className="flex flex-col items-center rounded-xl bg-white px-3 py-1.5 shadow-soft">
            <span className="text-xl leading-none">{items[i].count ? items[i].emoji.repeat(Math.min(items[i].count!, 3)) : items[i].emoji}</span>
            <span className="text-[12px] text-purple-600">{n + 1}</span>
          </span>
        ))}
      </div>

      <div className={`mx-auto grid max-w-lg gap-3 ${items.length <= 3 ? "grid-cols-3" : items.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3 sm:grid-cols-5"}`}>
        {items.map((it, i) => (
          <BigTile
            key={`${round}-${i}`}
            onClick={() => pick(i)}
            state={chosen.includes(i) ? "disabled" : wrong === i ? "wrong" : "idle"}
            className="text-2xl sm:text-3xl"
            ariaLabel={it.label}
          >
            <Pile item={it} />
          </BigTile>
        ))}
      </div>
    </GameShell>
  );
}

/** แสดง emoji ซ้ำตามจำนวน (count) หรือขนาดต่างกัน (ไม่มี count) */
function Pile({ item }: { item: Item }) {
  if (!item.count) return <span className="text-5xl sm:text-6xl">{item.emoji}</span>;
  const size = item.count <= 2 ? "text-3xl sm:text-4xl" : item.count <= 4 ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl";
  return (
    <span className={`flex max-w-[85%] flex-wrap items-center justify-center gap-0.5 leading-none ${size}`}>
      {Array.from({ length: item.count }, (_, i) => <span key={i}>{item.emoji}</span>)}
    </span>
  );
}
