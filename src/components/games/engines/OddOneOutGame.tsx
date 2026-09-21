"use client";

import { useEffect, useState } from "react";
import { BigTile, GameShell, shuffle } from "@/components/games/GameShell";

type Round = { items: string[]; odd: string; hint: string };

/** 🔍 เกมสังเกตและค้นหา — แตะสิ่งที่ไม่เข้าพวก */
export function OddOneOutGame({ rounds }: { rounds: Round[] }) {
  const [round, setRound] = useState(0);
  const [items, setItems] = useState<string[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrongs, setWrongs] = useState(0);
  const [done, setDone] = useState(false);

  const load = (r: number) => { setItems(shuffle(rounds[r].items)); setPicked(null); };
  const restart = () => { setRound(0); setWrongs(0); setDone(false); load(0); };
  useEffect(restart, [rounds]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (i: number) => {
    if (picked !== null || done) return;
    setPicked(i);
    const ok = items[i] === rounds[round].odd;
    if (!ok) { setWrongs((w) => w + 1); setTimeout(() => setPicked(null), 700); return; }
    setTimeout(() => {
      if (round + 1 >= rounds.length) setDone(true);
      else { setRound(round + 1); load(round + 1); }
    }, 800);
  };

  const cur = rounds[round];
  return (
    <GameShell
      instruction={cur.hint}
      progress={{ current: done ? rounds.length : round, total: rounds.length }}
      done={done}
      onRestart={restart}
      stats={wrongs === 0 ? "ถูกทุกข้อเลย!" : `ผิดไป ${wrongs} ครั้ง ไม่เป็นไรนะ`}
    >
      <div className="mx-auto grid max-w-md grid-cols-2 gap-3 sm:gap-4">
        {items.map((it, i) => (
          <BigTile
            key={`${round}-${i}`}
            onClick={() => pick(i)}
            state={picked === i ? (it === cur.odd ? "correct" : "wrong") : "idle"}
            className="text-6xl sm:text-7xl"
          >
            {it}
          </BigTile>
        ))}
      </div>
    </GameShell>
  );
}
