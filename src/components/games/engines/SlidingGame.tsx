"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { GameShell, type GameOutcome } from "@/components/games/GameShell";

/**
 * 🔢 เกมเลื่อนตัวเลข (Sliding Puzzle) — ตาราง n×n มีช่องว่าง 1 ช่อง แตะชิ้นที่ติดกับช่องว่างเพื่อเลื่อน
 * ใช้ได้กับตัวเลข ตัวอักษร ก–ฮ / A–Z รูปภาพ สี รูปทรง (items = ลำดับที่ถูกต้อง ยาว n²−1)
 * scramble = จำนวนครั้งที่สุ่มเลื่อนจากภาพที่ถูกต้อง (รับประกันว่าแก้ได้เสมอ) — ง่าย/ปานกลาง/ยาก
 */
export function SlidingGame({ items, size = 3, scramble = 6, timeLimit, onDone, theme = "purple" }: { items: string[]; size?: number; scramble?: number; timeLimit?: number; onDone?: (o: GameOutcome) => void; theme?: string }) {
  const N = size * size;
  const [board, setBoard] = useState<number[]>([]); // board[pos] = index ของชิ้น (N-1 = ช่องว่าง)
  const [moves, setMoves] = useState(0);
  const [lastMoved, setLastMoved] = useState<number | null>(null);

  const neighbors = (pos: number) => { const r = Math.floor(pos / size), c = pos % size; return [r > 0 && pos - size, r < size - 1 && pos + size, c > 0 && pos - 1, c < size - 1 && pos + 1].filter((x): x is number => x !== false); };

  const restart = () => {
    let b = Array.from({ length: N }, (_, i) => i); let prev = -1;
    for (let k = 0; k < scramble; k++) {
      const blank = b.indexOf(N - 1); const opts = neighbors(blank).filter((p) => p !== prev);
      const p = opts[Math.floor(Math.random() * opts.length)];
      [b[blank], b[p]] = [b[p], b[blank]]; prev = blank;
    }
    if (b.every((v, i) => v === i)) { const blank = b.indexOf(N - 1); const p = neighbors(blank)[0]; b = [...b]; [b[blank], b[p]] = [b[p], b[blank]]; }
    setBoard(b); setMoves(0); setLastMoved(null);
  };
  useEffect(restart, [items, size, scramble]); // eslint-disable-line react-hooks/exhaustive-deps

  const done = board.length > 0 && board.every((v, i) => v === i);
  const tap = (pos: number) => {
    if (done) return;
    const blank = board.indexOf(N - 1);
    if (!neighbors(blank).includes(pos)) return;
    const b = [...board]; [b[blank], b[pos]] = [b[pos], b[blank]];
    setBoard(b); setMoves((m) => m + 1); setLastMoved(blank);
  };

  const ideal = Math.max(1, scramble);
  const colors = ["bg-pink-soft", "bg-yellow-soft", "bg-mint-soft", "bg-sky-soft", "bg-purple-100"];
  return (
    <GameShell instruction={`แตะชิ้นที่อยู่ติดช่องว่างเพื่อเลื่อน เรียงให้เป็น ${items.slice(0, 3).join(" → ")} → …`} done={done} onRestart={restart} stats={`เลื่อน ${moves} ครั้ง`} mistakes={Math.max(0, moves - ideal)} total={ideal * 2} timeLimit={timeLimit} onDone={onDone}>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center sm:gap-8">
        <div className={cn("grid gap-1.5 rounded-3xl border-8 p-2 shadow-lift", theme === "pink" ? "border-pink-300 bg-pink-100" : theme === "green" ? "border-green-300 bg-green-100" : theme === "yellow" ? "border-yellow-300 bg-yellow-100" : "border-purple-300 bg-purple-100")} style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, width: "min(88vw, 360px)" }}>
          {board.map((idx, pos) => {
            const blank = idx === N - 1;
            const canMove = !blank && neighbors(board.indexOf(N - 1)).includes(pos);
            return (
              <button key={pos} type="button" onClick={() => tap(pos)} disabled={blank || done} aria-label={blank ? "ช่องว่าง" : `${items[idx]}${canMove ? " เลื่อนได้" : ""}`}
                className={cn("flex aspect-square select-none items-center justify-center rounded-2xl border-4 font-display text-3xl transition-all duration-150 sm:text-4xl", blank ? "border-transparent bg-black/5" : cn("border-white shadow-soft", colors[idx % colors.length], idx === pos && "ring-2 ring-green-400"), canMove && "hover:-translate-y-0.5 active:scale-95", lastMoved === pos && "animate-rise")}
              >
                {!blank && <span className={items[idx].length > 2 ? "text-[13px] sm:text-[15px]" : ""}>{items[idx]}</span>}
              </button>
            );
          })}
        </div>
        <div className="text-center text-[13px] text-ink-soft sm:text-left">
          <p className="font-display text-[15px] text-purple-800">เป้าหมาย</p>
          <div className="mt-1 grid gap-1 rounded-2xl bg-cream p-2" style={{ gridTemplateColumns: `repeat(${size}, 2rem)` }}>
            {Array.from({ length: N }, (_, i) => <span key={i} className="grid h-8 place-items-center rounded-lg bg-white text-[13px]">{i === N - 1 ? "" : items[i]}</span>)}
          </div>
          <p className="mt-2">เลื่อน {moves} ครั้ง</p>
        </div>
      </div>
    </GameShell>
  );
}
