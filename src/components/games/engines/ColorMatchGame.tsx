"use client";

import { useEffect, useState } from "react";
import { BigTile, GameShell, shuffle, type GameOutcome } from "@/components/games/GameShell";

type Item = { emoji: string; color: string };
type Round = { color: string; name: string; items: Item[] };

/** 🎨 เกมจับคู่สี — แตะสิ่งของที่มีสีตรงกับสีที่กำหนด */
export function ColorMatchGame({ rounds, timeLimit, onDone }: { rounds: Round[]; timeLimit?: number; onDone?: (o: GameOutcome) => void }) {
  const [round, setRound] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [wrongs, setWrongs] = useState(0);

  const load = (r: number) => { setItems(shuffle(rounds[r].items)); setPicked(null); };
  const restart = () => { setRound(0); setDone(false); setWrongs(0); load(0); };
  useEffect(restart, [rounds]); // eslint-disable-line react-hooks/exhaustive-deps

  const cur = rounds[round];
  const pick = (i: number) => {
    if (picked !== null || done) return;
    setPicked(i);
    if (items[i].color !== cur.color) { setWrongs((w) => w + 1); setTimeout(() => setPicked(null), 700); return; }
    setTimeout(() => {
      if (round + 1 >= rounds.length) setDone(true);
      else { setRound(round + 1); load(round + 1); }
    }, 800);
  };

  return (
    <GameShell
      instruction={`แตะสิ่งที่เป็น ${cur.name}`}
      progress={{ current: done ? rounds.length : round, total: rounds.length }}
      done={done}
      onRestart={restart}
      mistakes={wrongs} total={rounds.length} timeLimit={timeLimit} onDone={onDone}
    >
      <div className="mb-5 flex items-center justify-center gap-3">
        <span className="size-16 rounded-full border-4 border-white shadow-lift sm:size-20" style={{ background: cur.color }} aria-hidden />
        <span className="font-display text-2xl text-purple-800 sm:text-3xl">{cur.name}</span>
      </div>
      <div className="mx-auto grid max-w-md grid-cols-2 gap-3 sm:gap-4">
        {items.map((it, i) => (
          <BigTile
            key={`${round}-${i}`}
            onClick={() => pick(i)}
            state={picked === i ? (it.color === cur.color ? "correct" : "wrong") : "idle"}
            className="text-6xl sm:text-7xl"
          >
            {it.emoji}
          </BigTile>
        ))}
      </div>
    </GameShell>
  );
}
