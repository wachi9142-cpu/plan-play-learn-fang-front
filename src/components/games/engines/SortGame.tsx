"use client";

import { useEffect, useState } from "react";
import { BigTile, GameShell, shuffle, type GameOutcome } from "@/components/games/GameShell";

type Item = { emoji: string; value: number; label: string; count?: number };
type Round = { title: string; items: Item[]; missing?: boolean };

/**
 * 🔢 เกมเรียงลำดับ — แตะทีละอันจากน้อยไปมาก
 * โหมด missing (ระดับยาก): แสดงลำดับที่มีช่อง ❓ แล้วให้เด็กเติมตัวที่หายไปตามลำดับ
 */
export function SortGame({ rounds, timeLimit, onDone }: { rounds: Round[]; timeLimit?: number; onDone?: (o: GameOutcome) => void }) {
  const [round, setRound] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [hidden, setHidden] = useState<number[]>([]);
  const [chosen, setChosen] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [wrongs, setWrongs] = useState(0);
  const [done, setDone] = useState(false);

  const load = (r: number) => {
    const sorted = [...rounds[r].items].sort((a, b) => a.value - b.value);
    if (rounds[r].missing) {
      const h = sorted.map((_, i) => i).filter((i) => i % 2 === 0 && i > 0).slice(0, 3); // ซ่อนตำแหน่ง 3, 5, 7 (ไม่เกิน 3 ช่อง)
      setHidden(h); setItems(shuffle(h.map((i) => sorted[i])));
    } else { setHidden([]); setItems(shuffle(sorted)); }
    setChosen([]); setWrong(null);
  };
  const restart = () => { setRound(0); setDone(false); setWrongs(0); load(0); };
  useEffect(restart, [rounds]); // eslint-disable-line react-hooks/exhaustive-deps

  const cur = rounds[round];
  const sorted = [...(cur?.items ?? [])].sort((a, b) => a.value - b.value);
  const targets = cur?.missing ? hidden.map((i) => sorted[i]) : sorted;
  const expected = targets[chosen.length];

  const pick = (i: number) => {
    if (done || chosen.includes(i) || wrong !== null || !expected) return;
    if (items[i].value !== expected.value) { setWrong(i); setWrongs((w) => w + 1); setTimeout(() => setWrong(null), 600); return; }
    const next = [...chosen, i];
    setChosen(next);
    if (next.length === items.length) {
      setTimeout(() => { if (round + 1 >= rounds.length) setDone(true); else { setRound(round + 1); load(round + 1); } }, 800);
    }
  };
  const show = (it: Item) => (it.count ? it.emoji.repeat(Math.min(it.count, 3)) : it.emoji);
  const total = rounds.reduce((a, r) => a + (r.missing ? Math.min(3, Math.max(1, Math.floor((r.items.length - 1) / 2))) : r.items.length), 0);

  return (
    <GameShell instruction={cur.title} progress={{ current: done ? rounds.length : round, total: rounds.length }} done={done} onRestart={restart} mistakes={wrongs} total={total} timeLimit={timeLimit} onDone={onDone}>
      {cur.missing ? (
        <div className="mb-5 flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-purple-200 bg-cream p-3">
          {sorted.map((it, i) => {
            const hIdx = hidden.indexOf(i); const filled = hIdx >= 0 && hIdx < chosen.length;
            return (
              <span key={i} className={`flex min-w-12 flex-col items-center rounded-xl px-3 py-1.5 shadow-soft ${hIdx >= 0 ? (filled ? "bg-mint-soft" : "bg-yellow-soft") : "bg-white"}`}>
                <span className="text-xl leading-none">{hIdx >= 0 && !filled ? "❓" : show(it)}</span>
                <span className="text-[12px] text-purple-600">{i + 1}</span>
              </span>
            );
          })}
        </div>
      ) : (
        <div className="mb-5 flex min-h-16 flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-purple-200 bg-cream p-3">
          {chosen.length === 0 && <span className="text-[15px] text-ink-soft">แตะเรียงตามลำดับที่นี่ →</span>}
          {chosen.map((i, n) => <span key={i} className="flex flex-col items-center rounded-xl bg-white px-3 py-1.5 shadow-soft"><span className="text-xl leading-none">{show(items[i])}</span><span className="text-[12px] text-purple-600">{n + 1}</span></span>)}
        </div>
      )}
      <div className={`mx-auto grid max-w-lg gap-3 ${items.length <= 3 ? "grid-cols-3" : items.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3 sm:grid-cols-5"}`}>
        {items.map((it, i) => (
          <BigTile key={`${round}-${i}`} onClick={() => pick(i)} state={chosen.includes(i) ? "disabled" : wrong === i ? "wrong" : "idle"} ariaLabel={it.label} className={it.count ? "text-2xl! sm:text-3xl!" : ""}>
            {show(it)}
          </BigTile>
        ))}
      </div>
    </GameShell>
  );
}
