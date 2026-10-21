"use client";

import { useCallback, useEffect, useState } from "react";
import { BigTile, GameShell, shuffle, type GameOutcome } from "@/components/games/GameShell";

type Round = { hint: string; group: string[]; odds: string[]; items?: string[]; picked?: string[] };

/**
 * 🔍 เกมสังเกตและค้นหา — แตะสิ่งที่ไม่เข้าพวก
 * รองรับ "ตัวไม่เข้าพวก" ได้หลายตัวในรอบเดียว (ระดับยากมี 3–4 ตัวจาก 10 รูป)
 * ต้องหาให้ครบทุกตัวถึงจะผ่านรอบนั้น
 */
export function OddOneOutGame({ rounds, timeLimit, onDone }: { rounds: Round[]; timeLimit?: number; onDone?: (o: GameOutcome) => void }) {
  const [round, setRound] = useState(0);
  const [items, setItems] = useState<string[]>([]);
  const [found, setFound] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [wrongs, setWrongs] = useState(0);
  const [done, setDone] = useState(false);

  const oddsOf = (r: Round) => r.picked ?? r.odds.slice(0, 1);
  const itemsOf = (r: Round) => r.items ?? [...r.group.slice(0, 3), ...oddsOf(r)];

  const load = useCallback((r: number) => {
    setItems(shuffle(itemsOf(rounds[r])));
    setFound([]); setWrong(null);
  }, [rounds]);

  const restart = useCallback(() => { setRound(0); setWrongs(0); setDone(false); load(0); }, [load]);
  useEffect(() => { restart(); }, [rounds]); // eslint-disable-line react-hooks/exhaustive-deps

  const cur = rounds[round];
  const odds = cur ? oddsOf(cur) : [];
  const left = odds.length - found.length;

  const pick = (i: number) => {
    if (done || found.includes(i) || wrong !== null) return;
    const isOdd = odds.includes(items[i]);
    if (!isOdd) {
      setWrongs((w) => w + 1);
      setWrong(i);
      setTimeout(() => setWrong(null), 650);
      return;
    }
    const next = [...found, i];
    setFound(next);
    // หาครบทุกตัวแล้ว → ไปรอบต่อไป
    if (next.length >= odds.length) {
      setTimeout(() => {
        if (round + 1 >= rounds.length) setDone(true);
        else { setRound(round + 1); load(round + 1); }
      }, 800);
    }
  };

  if (!cur) return null;

  // 10 รูปใช้ 4 คอลัมน์ · 6 รูปใช้ 3 คอลัมน์ · 3 รูปใช้ 3 คอลัมน์
  const cols = items.length >= 9 ? "grid-cols-3 sm:grid-cols-4" : items.length >= 6 ? "grid-cols-3" : "grid-cols-3";
  const totalOdds = rounds.reduce((a, r) => a + oddsOf(r).length, 0);

  return (
    <GameShell
      instruction={
        odds.length > 1
          ? `${cur.hint} — มี ${odds.length} ตัว ${left > 0 ? `(เหลืออีก ${left} ตัว)` : "ครบแล้ว! 🎉"}`
          : cur.hint
      }
      progress={{ current: done ? rounds.length : round, total: rounds.length }}
      done={done}
      onRestart={restart}
      stats={wrongs === 0 ? "ถูกทุกครั้งเลย!" : `แตะผิด ${wrongs} ครั้ง`}
      mistakes={wrongs}
      total={Math.max(rounds.length, totalOdds)}
      timeLimit={timeLimit}
      onDone={onDone}
    >
      <div className={`mx-auto grid max-w-xl gap-2.5 sm:gap-3 ${cols}`}>
        {items.map((it, i) => (
          <BigTile
            key={`${round}-${i}`}
            onClick={() => pick(i)}
            state={found.includes(i) ? "correct" : wrong === i ? "wrong" : "idle"}
            ariaLabel={found.includes(i) ? `${it} — เจอแล้ว` : it}
          >
            {it}
          </BigTile>
        ))}
      </div>

      {odds.length > 1 && (
        <p className="mt-3 text-center text-[14px] text-ink-soft">
          เจอแล้ว <b className="text-purple-700">{found.length}</b> จาก {odds.length} ตัว — แตะให้ครบทุกตัวถึงจะไปข้อต่อไป
        </p>
      )}
    </GameShell>
  );
}
