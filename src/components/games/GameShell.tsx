"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";
import { PRAISE, starsFor } from "@/lib/game-levels";

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export interface GameOutcome { mistakes: number; total: number; seconds: number; timeUp: boolean; stars: number }

/**
 * กรอบเกมที่ใช้ร่วมกันทุก engine: คำสั่ง · ความคืบหน้า · เริ่มใหม่ · ⏱ จับเวลา (นับขึ้นทุกเกม · นับถอยหลังเมื่อกำหนด timeLimit) · หน้าจบเกมแบบให้กำลังใจ
 * mistakes/total → คำนวณดาว 2–5 · onDone ถูกเรียกครั้งเดียวเมื่อจบ
 */
export function GameShell({ instruction, progress, done, onRestart, children, stats, mistakes = 0, total = 1, timeLimit, onDone }: {
  instruction: string;
  progress?: { current: number; total: number };
  done: boolean;
  onRestart: () => void;
  children: React.ReactNode;
  stats?: string;
  mistakes?: number;
  total?: number;
  timeLimit?: number;
  onDone?: (o: GameOutcome) => void;
}) {
  const [left, setLeft] = useState<number | null>(timeLimit ?? null);
  const [elapsed, setElapsed] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  const start = useRef(Date.now());
  const reported = useRef(false);

  const restart = () => { start.current = Date.now(); setLeft(timeLimit ?? null); setElapsed(0); setTimeUp(false); reported.current = false; onRestart(); };

  /* นาฬิกาจับเวลา (นับขึ้น) — ใช้ทุกเกม ไม่กดดันเด็ก แค่ให้เห็นว่าใช้เวลาเท่าไร */
  useEffect(() => {
    if (done || timeUp) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start.current) / 1000)), 500);
    return () => clearInterval(t);
  }, [done, timeUp]);

  useEffect(() => {
    if (timeLimit === undefined || done || timeUp) return;
    const t = setInterval(() => { const l = Math.max(0, timeLimit - Math.floor((Date.now() - start.current) / 1000)); setLeft(l); if (l === 0) setTimeUp(true); }, 500);
    return () => clearInterval(t);
  }, [timeLimit, done, timeUp]);

  const finished = done || timeUp;
  const stars = starsFor(mistakes, total, timeUp && !done);
  useEffect(() => {
    if (!finished || reported.current) return;
    reported.current = true;
    onDone?.({ mistakes, total, seconds: Math.round((Date.now() - start.current) / 1000), timeUp: timeUp && !done, stars });
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const praise = PRAISE[stars];
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-purple-50 px-4 py-3 sm:px-5">
        <p className="min-w-0 basis-full font-display text-base text-purple-800 sm:flex-1 sm:basis-auto sm:text-lg">👉 {instruction}</p>
        {progress && (
          <div className="flex items-center gap-1" aria-label={`ด่านที่ ${progress.current} จาก ${progress.total}`}>
            {Array.from({ length: Math.min(progress.total, 12) }, (_, i) => <span key={i} className={cn("text-lg transition", i < progress.current ? "" : "opacity-25 grayscale")}>⭐</span>)}
          </div>
        )}
        {timeLimit === undefined && !finished && <span className="rounded-full bg-white px-2.5 py-1 font-mono text-[14px] text-purple-700" title="เวลาที่ใช้">⏱ {mmss(elapsed)}</span>}
        {left !== null && !finished && <span className={cn("rounded-full px-2.5 py-1 font-mono text-[14px]", left <= 10 ? "animate-pulse bg-red-50 text-red-600" : "bg-white text-purple-700")}>⏱ {mmss(left)}</span>}
        <button type="button" onClick={restart} className="tap inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-white px-3.5 py-1.5 text-[14px] font-medium text-purple-700 hover:bg-purple-100"><RotateCcw size={15} /> เริ่มใหม่</button>
      </div>

      <div className="relative p-4 sm:p-6">
        {children}
        {finished && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-cream/95 p-6 text-center backdrop-blur-sm">
            <span className="animate-float text-6xl sm:text-7xl">{timeUp && !done ? "⏰" : praise.emoji}</span>
            <p className="font-display text-2xl text-purple-800 sm:text-3xl">{timeUp && !done ? "หมดเวลาแล้ว ลองอีกครั้งนะ" : praise.title}</p>
            <div className="mt-1 flex gap-0.5 text-3xl" aria-label={`${stars} จาก 5 ดาว`}>{Array.from({ length: 5 }, (_, i) => <span key={i} className={i < stars ? "" : "opacity-25 grayscale"}>⭐</span>)}</div>
            <p className="font-display text-lg text-purple-700">{stars} / 5 คะแนน</p>
            <p className="text-base text-ink-soft">“{timeUp && !done ? "ไม่เป็นไรนะ ค่อย ๆ คิดอีกทีนะ" : praise.text}”{stats && ` · ${stats}`} · ⏱ ใช้เวลา {mmss(elapsed)}</p>
            <button type="button" onClick={restart} className="tap mt-2 inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-base font-medium text-white shadow-soft hover:bg-purple-700"><RotateCcw size={18} /> เล่นอีกครั้ง</button>
          </div>
        )}
      </div>
    </div>
  );
}

/** ปุ่มใหญ่สำหรับเด็ก */
export function BigTile({ children, onClick, state = "idle", className, ariaLabel }: { children: React.ReactNode; onClick?: () => void; state?: "idle" | "selected" | "correct" | "wrong" | "disabled"; className?: string; ariaLabel?: string }) {
  return (
    <button
      type="button" onClick={onClick} disabled={state === "disabled"} aria-label={ariaLabel}
      className={cn(
        "flex aspect-square w-full select-none items-center justify-center rounded-2xl border-4 text-4xl transition-all duration-150 active:scale-95 sm:text-5xl",
        state === "idle" && "border-purple-100 bg-white shadow-soft hover:border-purple-300 hover:-translate-y-0.5",
        state === "selected" && "border-purple-500 bg-purple-50 shadow-lift scale-105",
        state === "correct" && "border-[#43a047] bg-mint-soft",
        state === "wrong" && "animate-shake border-red-400 bg-red-50",
        state === "disabled" && "border-line bg-cream opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
