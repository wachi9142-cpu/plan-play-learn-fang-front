"use client";

import { useEffect, useState } from "react";
import { BigTile, GameShell, shuffle } from "@/components/games/GameShell";

type Pair = { left: string; right: string; label: string };

/** 🔤 เกมจับคู่ 2 คอลัมน์ — แตะฝั่งซ้าย (ตัวอักษร) แล้วแตะฝั่งขวา (ภาพ) */
export function PairColumnsGame({ pairs }: { pairs: Pair[] }) {
  const [lefts, setLefts] = useState<Pair[]>([]);
  const [rights, setRights] = useState<Pair[]>([]);
  const [selLeft, setSelLeft] = useState<string | null>(null);
  const [wrongRight, setWrongRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongs, setWrongs] = useState(0);

  const restart = () => {
    setLefts(shuffle(pairs)); setRights(shuffle(pairs));
    setSelLeft(null); setWrongRight(null); setMatched(new Set()); setWrongs(0);
  };
  useEffect(restart, [pairs]); // eslint-disable-line react-hooks/exhaustive-deps

  const tapRight = (p: Pair) => {
    if (!selLeft || matched.has(p.left)) return;
    if (p.left === selLeft) {
      setMatched((s) => new Set(s).add(p.left)); setSelLeft(null);
    } else {
      setWrongs((w) => w + 1); setWrongRight(p.left);
      setTimeout(() => setWrongRight(null), 600);
    }
  };

  const done = lefts.length > 0 && matched.size === pairs.length;
  const matchedLabels = pairs.filter((p) => matched.has(p.left)).map((p) => p.label);

  return (
    <GameShell
      instruction={selLeft ? `เลือก "${selLeft}" แล้ว → แตะภาพที่ขึ้นต้นด้วยตัวนี้` : "แตะตัวอักษรก่อน แล้วแตะภาพที่ตรงกัน"}
      done={done}
      onRestart={restart}
      stats={wrongs === 0 ? "จับคู่ถูกหมดเลย!" : `ผิดไป ${wrongs} ครั้ง`}
    >
      <div className="mx-auto grid max-w-md grid-cols-2 gap-4 sm:gap-8">
        <div className="grid gap-3">
          {lefts.map((p) => (
            <BigTile
              key={p.left}
              onClick={() => !matched.has(p.left) && setSelLeft(p.left)}
              state={matched.has(p.left) ? "correct" : selLeft === p.left ? "selected" : "idle"}
              className="aspect-auto min-h-16 font-display text-3xl sm:min-h-20 sm:text-4xl"
              ariaLabel={`ตัวอักษร ${p.left}`}
            >
              {p.left}
            </BigTile>
          ))}
        </div>
        <div className="grid gap-3">
          {rights.map((p) => (
            <BigTile
              key={p.right}
              onClick={() => tapRight(p)}
              state={matched.has(p.left) ? "correct" : wrongRight === p.left ? "wrong" : selLeft ? "idle" : "disabled"}
              className="aspect-auto min-h-16 sm:min-h-20"
              ariaLabel={p.label}
            >
              {p.right}
            </BigTile>
          ))}
        </div>
      </div>
      {matchedLabels.length > 0 && (
        <p className="mt-4 text-center text-[15px] text-purple-700">✓ {matchedLabels.join(" · ")}</p>
      )}
    </GameShell>
  );
}
