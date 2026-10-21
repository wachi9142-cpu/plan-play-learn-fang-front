"use client";

import { useCallback, useEffect, useState } from "react";
import { GameShell, type GameOutcome } from "@/components/games/GameShell";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;
export type MathMode = "add5" | "add10" | "addsub20";

interface Q { text: string; answer: number; options: number[]; picture?: string }

const CHOICE = ["ก", "ข", "ค", "ง", "จ", "ฉ"];
const rnd = (n: number) => Math.floor(Math.random() * n);

/** สร้างโจทย์ตามระดับ */
function makeQuestion(mode: MathMode): Q {
  let a = 0, b = 0, op: "+" | "-" = "+", answer = 0;
  if (mode === "add5") {
    a = 1 + rnd(4); b = 1 + rnd(5 - a + 1); answer = a + b;
  } else if (mode === "add10") {
    a = 1 + rnd(8); b = 1 + rnd(10 - a); answer = a + b;
  } else {
    op = rnd(2) === 0 ? "+" : "-";
    if (op === "+") { a = 2 + rnd(14); b = 2 + rnd(20 - a); answer = a + b; }
    else { a = 5 + rnd(15); b = 1 + rnd(a - 1); answer = a - b; }
  }
  // ตัวเลือกหลอก — ใกล้เคียงคำตอบ เด็กจะได้ต้องคิดจริง
  const set = new Set<number>([answer]);
  let guard = 0;
  while (set.size < 6 && guard++ < 60) {
    const d = 1 + rnd(4);
    const v = rnd(2) === 0 ? answer + d : answer - d;
    if (v >= 0) set.add(v);
  }
  while (set.size < 6) set.add(set.size + answer + 1);
  const options = [...set].sort(() => Math.random() - 0.5);
  const picture = mode === "add5" ? "🍎".repeat(a) + " + " + "🍎".repeat(b) : undefined;
  return { text: `${a} ${op} ${b} = ?`, answer, options, picture };
}

/**
 * ➕ เกมคิดเลข — ขึ้นโจทย์แล้วเลือกคำตอบจาก 6 ข้อ (ก–ฉ)
 * ง่าย: บวกไม่เกิน 5 มีภาพช่วยนับ · ปานกลาง: บวกไม่เกิน 10 · ยาก: บวก–ลบ ไม่เกิน 20
 */
export function MathQuizGame({ mode = "add5", count = 8, timeLimit, onDone }: {
  mode?: MathMode; count?: number; timeLimit?: number; onDone?: Cb;
}) {
  const [qs, setQs] = useState<Q[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrongs, setWrongs] = useState(0);
  const [done, setDone] = useState(false);

  const restart = useCallback(() => {
    setQs(Array.from({ length: count }, () => makeQuestion(mode)));
    setI(0); setPicked(null); setWrongs(0); setDone(false);
  }, [mode, count]);

  // สร้างโจทย์หลังหน้าเว็บพร้อม เพื่อไม่ให้ฝั่งเซิร์ฟเวอร์กับเบราว์เซอร์ต่างกัน
  useEffect(() => { restart(); }, [restart]);

  const q = qs[i];
  if (!q) return null;

  const pick = (k: number) => {
    if (picked !== null || done) return;
    setPicked(k);
    if (q.options[k] !== q.answer) {
      setWrongs((w) => w + 1);
      setTimeout(() => setPicked(null), 800);
      return;
    }
    setTimeout(() => {
      if (i + 1 >= qs.length) setDone(true);
      else { setI(i + 1); setPicked(null); }
    }, 800);
  };

  return (
    <GameShell
      instruction={done ? `🎉 เก่งมาก! ทำครบ ${qs.length} ข้อแล้ว` : "คิดแล้วแตะคำตอบที่ถูก"}
      progress={{ current: done ? qs.length : i, total: qs.length }}
      done={done}
      onRestart={restart}
      stats={wrongs === 0 ? "ถูกทุกข้อเลย!" : `ตอบผิด ${wrongs} ครั้ง`}
      mistakes={wrongs}
      total={qs.length}
      timeLimit={timeLimit}
      onDone={onDone}
    >
      {/* โจทย์ */}
      <div className="card mx-auto mb-4 max-w-xl p-5 text-center">
        {q.picture && <p className="mb-2 text-[clamp(1.2rem,5vw,1.8rem)] leading-relaxed">{q.picture}</p>}
        <p className="font-display text-[clamp(2.2rem,11vw,3.6rem)] leading-none text-purple-800">{q.text}</p>
      </div>

      {/* ตัวเลือก ก–ฉ */}
      <div className="mx-auto grid max-w-xl grid-cols-3 gap-3">
        {q.options.map((v, k) => {
          const show = picked !== null;
          const ok = v === q.answer;
          return (
            <button
              key={`${i}-${k}`}
              type="button"
              onClick={() => pick(k)}
              aria-label={`ข้อ ${CHOICE[k]} คำตอบ ${v}`}
              className={cn(
                "card tap flex flex-col items-center gap-1 py-4 transition",
                show && ok && "border-mint-soft! bg-mint-soft",
                show && !ok && picked === k && "border-pink-accent! bg-pink-soft",
              )}
            >
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 font-display text-[13px] text-purple-800">{CHOICE[k]}</span>
              <span className="font-display text-[clamp(1.8rem,9vw,2.6rem)] leading-none text-purple-800">{v}</span>
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}
