"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell, type GameOutcome } from "@/components/games/GameShell";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;
type Who = "me" | "cpu";
type Mode = "cpu" | "friend";

const COLS = 6;
const ROWS = 5;
const LAST = COLS * ROWS;            // 30 ช่อง — กำลังดีสำหรับเด็กอนุบาล

/** 🪜 บันได: ขึ้นจากช่องซ้ายไปช่องขวา */
const LADDERS: Record<number, number> = { 3: 12, 8: 16, 14: 24, 20: 27 };
/** 🐍 งู: ลงจากช่องซ้ายไปช่องขวา */
const SNAKES: Record<number, number> = { 18: 6, 23: 11, 26: 15, 28: 10 };

const DICE = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

/** ช่องหมายเลข n อยู่แถวไหน คอลัมน์ไหน (เดินสลับซ้าย-ขวาแบบกระดานจริง) */
function cellOf(n: number) {
  const idx = n - 1;
  const row = Math.floor(idx / COLS);
  const col = row % 2 === 0 ? idx % COLS : COLS - 1 - (idx % COLS);
  return { row: ROWS - 1 - row, col };
}

/**
 * 🎲 บันไดงู — ทอยลูกเต๋าแล้วเดินตามแต้ม
 * เจอ 🪜 บันไดได้ขึ้น · เจอ 🐍 งูต้องเลื่อนลง · ใครถึงช่อง 30 ก่อนชนะ
 * ฝึกนับเลข 1–30 นับแต้ม และรอคอยตามตา
 */
export function SnakesLaddersGame({ onDone }: { onDone?: Cb }) {
  const [mode, setMode] = useState<Mode>("cpu");
  const [pos, setPos] = useState<Record<Who, number>>({ me: 0, cpu: 0 });
  const [turn, setTurn] = useState<Who>("me");
  const [dice, setDice] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [winner, setWinner] = useState<Who | null>(null);
  const [ready, setReady] = useState(false);
  const timers = useRef<number[]>([]);

  const restart = useCallback(() => {
    timers.current.forEach(clearTimeout); timers.current = [];
    setPos({ me: 0, cpu: 0 }); setTurn("me"); setDice(0);
    setRolling(false); setMsg(null); setWinner(null);
  }, []);

  useEffect(() => { setReady(true); restart(); }, [restart, mode]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const nameOf = (w: Who) => (mode === "friend" ? (w === "me" ? "ผู้เล่น 1 🔴" : "ผู้เล่น 2 🔵") : w === "me" ? "หนู 🔴" : "เครื่อง 🔵");

  const roll = (who: Who) => {
    if (rolling || winner) return;
    setRolling(true);
    setMsg(null);
    const n = 1 + Math.floor(Math.random() * 6);

    // หมุนลูกเต๋าให้เห็นก่อน
    let spins = 0;
    const spin = window.setInterval(() => {
      setDice(1 + Math.floor(Math.random() * 6));
      if (++spins >= 6) {
        clearInterval(spin);
        setDice(n);
        step(who, n);
      }
    }, 90);
    timers.current.push(spin);
  };

  const step = (who: Who, n: number) => {
    const from = pos[who];
    let to = from + n;
    if (to > LAST) {
      setMsg(`ทอยได้ ${n} แต้ม — เกินช่อง ${LAST} ต้องทอยให้พอดี ลองใหม่รอบหน้า`);
      finishTurn(who, from);
      return;
    }
    let note = `${nameOf(who)} ทอยได้ ${n} แต้ม → ช่อง ${to}`;
    if (LADDERS[to]) { note += ` · 🪜 เจอบันได ขึ้นไปช่อง ${LADDERS[to]}!`; to = LADDERS[to]; }
    else if (SNAKES[to]) { note += ` · 🐍 เจองู เลื่อนลงช่อง ${SNAKES[to]}`; to = SNAKES[to]; }
    setMsg(note);
    setPos((p) => ({ ...p, [who]: to }));
    if (to === LAST) { setWinner(who); setRolling(false); return; }
    finishTurn(who, to);
  };

  const finishTurn = (who: Who, _to: number) => {
    const t = window.setTimeout(() => {
      setRolling(false);
      setTurn(who === "me" ? "cpu" : "me");
    }, 700);
    timers.current.push(t);
  };

  // เครื่องทอยเอง
  useEffect(() => {
    if (!ready || winner || mode !== "cpu" || turn !== "cpu" || rolling) return;
    const t = window.setTimeout(() => roll("cpu"), 800);
    timers.current.push(t);
    return () => clearTimeout(t);
  }, [turn, ready, winner, mode, rolling]); // eslint-disable-line react-hooks/exhaustive-deps

  const myTurn = mode === "friend" || turn === "me";

  return (
    <GameShell
      instruction={
        winner ? (winner === "me" ? `🎉 ${nameOf("me")} ถึงช่อง ${LAST} ก่อน ชนะแล้ว!` : mode === "friend" ? `🎉 ${nameOf("cpu")} ชนะ!` : "เครื่องถึงก่อนรอบนี้ ลองใหม่นะ 💪")
          : msg ?? (myTurn ? `ตาของ ${nameOf(turn)} — กดทอยลูกเต๋า` : "เครื่องกำลังทอย…")
      }
      done={!!winner}
      onRestart={restart}
      stats={`${nameOf("me")} ช่อง ${pos.me} · ${nameOf("cpu")} ช่อง ${pos.cpu}`}
      mistakes={winner === "cpu" && mode === "cpu" ? 1 : 0}
      total={1}
      onDone={onDone}
    >
      {/* เลือกโหมด */}
      <div className="mb-3">
        <p className="mb-1.5 text-center text-[13px] text-ink-soft">👥 เลือกโหมดการเล่น</p>
        <div className="flex flex-wrap justify-center gap-2">
          {([["cpu", "👤 เล่นคนเดียว"], ["friend", "👬 เล่น 2 คน"]] as const).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setMode(id)} aria-pressed={mode === id}
              className={cn("tap rounded-full px-4 py-2 text-[14px] font-medium transition",
                mode === id ? "bg-purple-600 text-white! shadow-soft" : "bg-cream-dark text-purple-700 hover:brightness-95")}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* กระดาน */}
      <div className="mx-auto w-full max-w-[28rem] rounded-3xl bg-mint-soft p-2">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
          {Array.from({ length: LAST }, (_, i) => {
            // วาดจากแถวบนลงล่าง แต่เลขเดินจากล่างขึ้นบน
            const row = Math.floor(i / COLS);
            const col = i % COLS;
            const rowFromBottom = ROWS - 1 - row;
            const n = rowFromBottom % 2 === 0
              ? rowFromBottom * COLS + col + 1
              : rowFromBottom * COLS + (COLS - col);
            const up = LADDERS[n];
            const down = SNAKES[n];
            const here: Who[] = (["me", "cpu"] as Who[]).filter((w) => pos[w] === n);
            return (
              <div
                key={i}
                className={cn(
                  "relative grid aspect-square place-items-center rounded-lg text-[11px] font-medium transition",
                  n === LAST ? "bg-yellow-accent text-[#5a4600]"
                    : up ? "bg-[#bdf0cf] text-[#1f6b4d]"
                    : down ? "bg-pink-soft text-[#a8456c]"
                    : (row + col) % 2 === 0 ? "bg-white" : "bg-cream",
                )}
              >
                <span className="absolute left-1 top-0.5 opacity-70">{n}</span>
                <span className="text-[clamp(0.9rem,3.6vw,1.3rem)] leading-none">
                  {n === LAST ? "🏁" : up ? "🪜" : down ? "🐍" : ""}
                </span>
                {here.length > 0 && (
                  <span className="absolute bottom-0.5 flex gap-0.5">
                    {here.map((w) => (
                      <span key={w} className={cn("size-2.5 rounded-full ring-2 ring-white", w === "me" ? "bg-red-500" : "bg-blue-500")} />
                    ))}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ลูกเต๋า */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <span className="grid size-20 place-items-center rounded-2xl bg-white text-[3.2rem] leading-none shadow-soft ring-2 ring-purple-200">
          {dice ? DICE[dice] : "🎲"}
        </span>
        <button
          type="button"
          onClick={() => roll(turn)}
          disabled={!!winner || rolling || !myTurn}
          className="tap rounded-full bg-purple-600 px-6 py-3 text-[16px] font-medium text-white shadow-soft transition hover:bg-purple-700 disabled:opacity-40"
        >
          🎲 {rolling ? "กำลังทอย…" : `ทอยลูกเต๋า (${nameOf(turn)})`}
        </button>
      </div>

      <p className="mt-3 text-center text-[13px] leading-relaxed text-ink-soft">
        ทอยลูกเต๋าแล้วเดินตามแต้ม · 🪜 เจอบันไดได้ขึ้น · 🐍 เจองูต้องเลื่อนลง · ใครถึงช่อง {LAST} 🏁 ก่อนชนะ
        <br />ต้องทอยให้พอดีช่อง {LAST} ถ้าเกินต้องรอรอบหน้า
      </p>
    </GameShell>
  );
}
