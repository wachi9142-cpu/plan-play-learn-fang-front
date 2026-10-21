"use client";

import { useCallback, useEffect, useState } from "react";
import { GameShell, shuffle, type GameOutcome } from "@/components/games/GameShell";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;

export interface IQRound {
  /** คำถาม เช่น "อันไหนใหญ่ที่สุด?" */
  q: string;
  /** โจทย์เป็นภาพ (ถ้ามี) เช่น ["🔴", "🔵", "🔴", "🔵", "❓"] */
  seq?: string[];
  /** ตัวเลือก (อีโมจิหรือข้อความสั้น) */
  options: string[];
  /** ลำดับของคำตอบที่ถูกใน options */
  answer: number;
  /** อธิบายให้ครูอ่านให้เด็กฟังหลังตอบ */
  explain?: string;
  level?: "easy" | "medium" | "hard";
}

const CHOICE = ["ก", "ข", "ค", "ง"];

/**
 * 🧠 เกมฝึกเชาว์ปัญญา — อ่านโจทย์แล้วเลือก ก ข ค
 * ฝึกการให้เหตุผล การจัดกลุ่ม และการมองความสัมพันธ์ของสิ่งต่าง ๆ
 */
export function IQGame({ rounds, timeLimit, onDone }: { rounds: IQRound[]; timeLimit?: number; onDone?: Cb }) {
  const [list, setList] = useState<{ r: IQRound; opts: { label: string; ok: boolean }[] }[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrongs, setWrongs] = useState(0);
  const [done, setDone] = useState(false);

  const restart = useCallback(() => {
    setList(rounds.map((r) => ({
      r,
      // สลับตำแหน่งตัวเลือกทุกครั้ง เด็กจะได้ไม่จำว่า "ข้อ ข ถูกเสมอ"
      opts: shuffle(r.options.map((label, k) => ({ label, ok: k === r.answer }))),
    })));
    setI(0); setPicked(null); setWrongs(0); setDone(false);
  }, [rounds]);

  useEffect(() => { restart(); }, [restart]);

  const cur = list[i];

  const pick = (k: number) => {
    if (picked !== null || done || !cur) return;
    setPicked(k);
    if (!cur.opts[k].ok) {
      setWrongs((w) => w + 1);
      setTimeout(() => setPicked(null), 900);
      return;
    }
    setTimeout(() => {
      if (i + 1 >= list.length) setDone(true);
      else { setI(i + 1); setPicked(null); }
    }, cur.r.explain ? 1700 : 900);
  };

  if (!cur) return null;
  const answered = picked !== null && cur.opts[picked].ok;

  return (
    <GameShell
      instruction={cur.r.q}
      progress={{ current: done ? list.length : i, total: list.length }}
      done={done}
      onRestart={restart}
      stats={wrongs === 0 ? "ตอบถูกทุกข้อเลย!" : `ตอบผิด ${wrongs} ครั้ง`}
      mistakes={wrongs}
      total={list.length}
      timeLimit={timeLimit}
      onDone={onDone}
    >
      {/* โจทย์ที่เป็นภาพ */}
      {cur.r.seq && cur.r.seq.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2 rounded-3xl bg-cream-dark px-4 py-4">
          {cur.r.seq.map((e, k) => (
            <span key={k} className={cn("text-[clamp(2rem,10vw,3rem)] leading-none", e === "❓" && "text-purple-500")}>{e}</span>
          ))}
        </div>
      )}

      {/* ตัวเลือก ก ข ค */}
      <div className={cn("mx-auto grid max-w-xl gap-3", cur.opts.length >= 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3")}>
        {cur.opts.map((o, k) => {
          const show = picked !== null;
          return (
            <button
              key={k}
              type="button"
              onClick={() => pick(k)}
              aria-label={`ข้อ ${CHOICE[k]} ${o.label}`}
              className={cn(
                "card tap flex flex-col items-center gap-1 p-3 transition",
                show && o.ok && "border-mint-soft! bg-mint-soft",
                show && !o.ok && picked === k && "border-pink-accent! bg-pink-soft",
              )}
            >
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 font-display text-[14px] text-purple-800">{CHOICE[k]}</span>
              <span className="text-[clamp(2rem,11vw,3.2rem)] leading-none">{o.label}</span>
              {show && o.ok && <span className="text-[13px] font-medium text-[#1f6b4d]">✅ ถูกต้อง</span>}
              {show && !o.ok && picked === k && <span className="text-[13px] font-medium text-[#a8456c]">ยังไม่ใช่นะ</span>}
            </button>
          );
        })}
      </div>

      {answered && cur.r.explain && (
        <p className="mx-auto mt-4 max-w-xl rounded-2xl bg-mint-soft px-4 py-3 text-center text-[15px] leading-relaxed text-ink">
          💡 {cur.r.explain}
        </p>
      )}
    </GameShell>
  );
}
