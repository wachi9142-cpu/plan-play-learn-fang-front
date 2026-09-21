"use client";

import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";

/** กรอบเกมที่ใช้ร่วมกันทุก engine: หัวข้อ/คำสั่ง · ดาว · ปุ่มเริ่มใหม่ · หน้าจบเกม */
export function GameShell({
  instruction,
  progress,
  done,
  onRestart,
  children,
  stats,
}: {
  instruction: string;
  progress?: { current: number; total: number };
  done: boolean;
  onRestart: () => void;
  children: React.ReactNode;
  stats?: string;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-purple-50 px-4 py-3 sm:px-5">
        <p className="min-w-0 basis-full font-display text-base text-purple-800 sm:flex-1 sm:basis-auto sm:text-lg">👉 {instruction}</p>
        {progress && (
          <div className="flex items-center gap-1" aria-label={`ด่านที่ ${progress.current} จาก ${progress.total}`}>
            {Array.from({ length: progress.total }, (_, i) => (
              <span key={i} className={cn("text-lg transition", i < progress.current ? "" : "opacity-25 grayscale")}>⭐</span>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={onRestart}
          className="tap inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-white px-3.5 py-1.5 text-[14px] font-medium text-purple-700 hover:bg-purple-100"
        >
          <RotateCcw size={15} /> เริ่มใหม่
        </button>
      </div>

      <div className="relative p-4 sm:p-6">
        {children}

        {done && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-cream/95 p-6 text-center backdrop-blur-sm">
            <span className="animate-float text-6xl sm:text-7xl">🎉</span>
            <p className="font-display text-2xl text-purple-800 sm:text-3xl">เก่งมาก! ทำได้แล้ว</p>
            {stats && <p className="text-base text-ink-soft">{stats}</p>}
            <div className="mt-2 flex gap-1 text-3xl" aria-hidden>⭐⭐⭐</div>
            <button
              type="button"
              onClick={onRestart}
              className="tap mt-2 inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-base font-medium text-white shadow-soft hover:bg-purple-700"
            >
              <RotateCcw size={18} /> เล่นอีกครั้ง
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** ปุ่มใหญ่สำหรับเด็ก */
export function BigTile({
  children,
  onClick,
  state = "idle",
  className,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  state?: "idle" | "selected" | "correct" | "wrong" | "disabled";
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "disabled"}
      aria-label={ariaLabel}
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
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
