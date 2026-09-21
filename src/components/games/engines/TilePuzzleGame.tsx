"use client";

import { useEffect, useState } from "react";
import { BigTile, GameShell, shuffle } from "@/components/games/GameShell";

/** 🖼️ เกมภาพตัดต่อ — แตะ 2 ช่องเพื่อสลับที่ จนเหมือนภาพต้นแบบ */
export function TilePuzzleGame({ scene, size }: { scene: string[]; size: number }) {
  const [tiles, setTiles] = useState<number[]>([]);   // tiles[pos] = index ของช่องในภาพต้นแบบ
  const [sel, setSel] = useState<number | null>(null);
  const [swaps, setSwaps] = useState(0);

  const restart = () => {
    let order = shuffle(scene.map((_, i) => i));
    // ห้ามสุ่มได้ภาพที่ถูกอยู่แล้ว
    if (order.every((v, i) => v === i)) order = [...order.slice(1), order[0]];
    setTiles(order); setSel(null); setSwaps(0);
  };
  useEffect(restart, [scene]); // eslint-disable-line react-hooks/exhaustive-deps

  const done = tiles.length > 0 && tiles.every((v, i) => v === i);

  const tap = (pos: number) => {
    if (done) return;
    if (sel === null) { setSel(pos); return; }
    if (sel === pos) { setSel(null); return; }
    const next = [...tiles];
    [next[sel], next[pos]] = [next[pos], next[sel]];
    setTiles(next); setSel(null); setSwaps((s) => s + 1);
  };

  const gridCols = size === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <GameShell instruction="แตะ 2 ช่องเพื่อสลับที่ ต่อภาพให้เหมือนต้นแบบ" done={done} onRestart={restart} stats={`สลับ ${swaps} ครั้ง`}>
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:justify-center sm:gap-8">
        {/* ต้นแบบ */}
        <div className="shrink-0">
          <p className="mb-2 text-center text-[14px] font-medium text-ink-soft">ภาพต้นแบบ</p>
          <div className={`grid ${gridCols} w-32 gap-0.5 rounded-xl border-2 border-purple-200 bg-sky-soft p-1 sm:w-40`}>
            {scene.map((e, i) => (
              <span key={i} className="grid aspect-square place-items-center text-xl sm:text-2xl">{e}</span>
            ))}
          </div>
        </div>

        {/* กระดานเล่น */}
        <div className="w-full max-w-xs sm:max-w-sm">
          <p className="mb-2 text-center text-[14px] font-medium text-ink-soft">ต่อภาพของหนู</p>
          <div className={`grid ${gridCols} gap-2 rounded-2xl bg-sky-soft p-2`}>
            {tiles.map((sceneIdx, pos) => (
              <BigTile
                key={pos}
                onClick={() => tap(pos)}
                state={sel === pos ? "selected" : done || sceneIdx === pos ? "correct" : "idle"}
                ariaLabel={`ช่องที่ ${pos + 1}`}
              >
                {scene[sceneIdx]}
              </BigTile>
            ))}
          </div>
        </div>
      </div>
    </GameShell>
  );
}
