"use client";

import { useEffect, useState } from "react";
import { BigTile, GameShell, shuffle } from "@/components/games/GameShell";

type Pair = { emoji: string; label: string };
type Card = { key: number; emoji: string; label: string };

/** 🧩 เกมจับคู่ (memory) — เปิดการ์ด 2 ใบให้เหมือนกัน */
export function MemoryGame({ pairs }: { pairs: Pair[] }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);

  const restart = () => {
    setCards(shuffle(pairs.flatMap((p, i) => [{ key: i * 2, ...p }, { key: i * 2 + 1, ...p }])));
    setOpen([]); setMatched(new Set()); setMoves(0); setLock(false);
  };
  // สุ่มไพ่หลัง mount เพื่อไม่ให้ SSR/CSR ต่างกัน
  useEffect(restart, [pairs]); // eslint-disable-line react-hooks/exhaustive-deps

  const flip = (idx: number) => {
    if (lock || open.includes(idx) || matched.has(cards[idx].emoji)) return;
    const next = [...open, idx];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((i) => cards[i]);
      if (a.emoji === b.emoji) {
        setMatched((s) => new Set(s).add(a.emoji));
        setOpen([]);
      } else {
        setLock(true);
        setTimeout(() => { setOpen([]); setLock(false); }, 800);
      }
    }
  };

  const done = cards.length > 0 && matched.size === pairs.length;
  const cols = pairs.length <= 4 ? "grid-cols-4" : "grid-cols-3 sm:grid-cols-4";

  return (
    <GameShell instruction="แตะการ์ด 2 ใบ หาคู่ที่เหมือนกัน" done={done} onRestart={restart} stats={`ใช้ ${moves} ครั้ง`}>
      <div className={`mx-auto grid max-w-lg gap-2.5 sm:gap-3 ${cols}`}>
        {cards.map((c, i) => {
          const isOpen = open.includes(i) || matched.has(c.emoji);
          return (
            <BigTile
              key={c.key}
              onClick={() => flip(i)}
              state={matched.has(c.emoji) ? "correct" : open.includes(i) ? "selected" : "idle"}
              ariaLabel={isOpen ? c.label : "การ์ดคว่ำ"}
              className={isOpen ? "bg-white!" : "bg-purple-600! border-purple-400! text-white hover:bg-purple-700!"}
            >
              {isOpen ? c.emoji : "💜"}
            </BigTile>
          );
        })}
      </div>
      <p className="mt-4 text-center text-[15px] text-ink-soft">จับคู่ได้ {matched.size} / {pairs.length} · เปิดแล้ว {moves} ครั้ง</p>
    </GameShell>
  );
}
