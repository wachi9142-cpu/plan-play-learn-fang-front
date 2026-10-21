"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Lightbulb } from "lucide-react";
import { GameShell, shuffle, type GameOutcome } from "@/components/games/GameShell";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { SHADOW_CATEGORIES, allShadowItems, findShadowCategory, type ShadowItem } from "@/data/shadow-quiz";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;

interface Q { answer: ShadowItem; options: ShadowItem[]; spin: number[] }

/**
 * 🌑 เกมจับคู่ภาพกับเงา — ดูภาพสีด้านบน แล้วคลิกเงาที่ตรงกัน
 * ระดับ 1 (4–6 ปี): 3 ตัวเลือก รูปร่างต่างกันชัด ไม่จำกัดเวลา
 * ระดับ 2 (6 ปีขึ้นไป): 4–6 ตัวเลือก รูปร่างใกล้เคียงกัน และเงาบางอันหมุน/เปลี่ยนขนาด
 */
export function ShadowQuizGame({ categoryId, choices = 3, count = 8, tricky = false, timeLimit, onDone }: {
  categoryId?: string;
  /** จำนวนเงาให้เลือก */
  choices?: number;
  /** จำนวนข้อ */
  count?: number;
  /** true = หมุน/ย่อขยายเงาให้ยากขึ้น */
  tricky?: boolean;
  timeLimit?: number;
  onDone?: Cb;
}) {
  const pool = useMemo(
    () => (categoryId ? findShadowCategory(categoryId)?.items ?? allShadowItems() : allShadowItems()),
    [categoryId],
  );

  const [qs, setQs] = useState<Q[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [wrongs, setWrongs] = useState(0);
  const [out, setOut] = useState<number[]>([]);   // ตัวเลือกที่ถูกตัดทิ้งด้วยคำใบ้
  const [done, setDone] = useState(false);

  const build = useCallback(() => {
    const picks = shuffle(pool).slice(0, Math.min(count, pool.length));
    const made = picks.map((answer) => {
      const others = shuffle(pool.filter((x) => x.emoji !== answer.emoji)).slice(0, Math.max(2, choices - 1));
      const options = shuffle([answer, ...others]);
      // องศาหมุน/ขนาดของเงาแต่ละตัว (เฉพาะระดับยาก)
      const spin = options.map(() => (tricky ? [-12, -6, 0, 6, 12][Math.floor(Math.random() * 5)] : 0));
      return { answer, options, spin };
    });
    setQs(made); setI(0); setPicked(null); setScore(0); setWrongs(0); setOut([]); setDone(false);
  }, [pool, choices, count, tricky]);

  // สร้างข้อหลังหน้าเว็บพร้อม เพื่อไม่ให้ฝั่งเซิร์ฟเวอร์กับเบราว์เซอร์ต่างกัน
  useEffect(() => { build(); }, [build]);

  const q = qs[i];
  if (!q) return null;

  const pick = (k: number) => {
    if (picked !== null || done) return;
    setPicked(k);
    if (q.options[k].emoji === q.answer.emoji) {
      setScore((s) => s + 1);
      setTimeout(() => {
        if (i + 1 >= qs.length) setDone(true);
        else { setI(i + 1); setPicked(null); setOut([]); }
      }, 1000);
    } else {
      setWrongs((w) => w + 1);
      setTimeout(() => setPicked(null), 900);
    }
  };

  const hint = () => {
    if (done || picked !== null) return;
    const wrongIdx = q.options.map((o, k) => (o.emoji !== q.answer.emoji && !out.includes(k) ? k : -1)).filter((k) => k >= 0);
    if (wrongIdx.length <= 1) return;     // เหลือ 2 ตัวเลือกแล้ว ไม่ตัดต่อ
    setOut((o) => [...o, wrongIdx[Math.floor(Math.random() * wrongIdx.length)]]);
  };

  const cols = q.options.length <= 3 ? "grid-cols-3" : q.options.length <= 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3 sm:grid-cols-6";

  return (
    <GameShell
      instruction={done ? `🎉 เก่งมาก! ตอบถูก ${score} จาก ${qs.length} ข้อ` : `ภาพนี้คือ “${q.answer.name}” — คลิกเงาที่ตรงกับภาพนี้`}
      progress={{ current: done ? qs.length : i, total: qs.length }}
      done={done}
      onRestart={build}
      stats={`ตอบถูก ${score} ข้อ${wrongs > 0 ? ` · ตอบผิด ${wrongs} ครั้ง` : ""}`}
      mistakes={wrongs}
      total={qs.length}
      timeLimit={timeLimit}
      onDone={onDone}
    >
      {/* ภาพต้นแบบ */}
      <div className="card mx-auto mb-4 max-w-sm p-5 text-center">
        <span className="block text-[clamp(4rem,20vw,6rem)] leading-none">{q.answer.emoji}</span>
        <p className="mt-1 font-display text-xl text-purple-800">{q.answer.name}</p>
        <p className="text-[14px] text-purple-500">{q.answer.nameEn}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <SpeakButton text={q.answer.name} size="sm" label="ฟังชื่อภาพ" />
          <SpeakButton text={q.answer.nameEn} lang="en" size="sm" label="ฟังภาษาอังกฤษ" />
          <button type="button" onClick={hint} disabled={picked !== null}
            className="tap inline-flex items-center gap-1.5 rounded-full bg-yellow-soft px-3 py-1 text-[13px] font-medium text-[#8a6a00] hover:brightness-95 disabled:opacity-40">
            <Lightbulb size={14} /> ขอคำใบ้
          </button>
        </div>
      </div>

      {/* เงาให้เลือก */}
      <p className="mb-2 text-center text-[14px] text-ink-soft">🖱️ คลิกเงาที่ตรงกับภาพด้านบน</p>
      <div className={cn("mx-auto grid max-w-3xl gap-3", cols)}>
        {q.options.map((o, k) => {
          const show = picked !== null;
          const isAns = o.emoji === q.answer.emoji;
          const removed = out.includes(k);
          return (
            <button
              key={k}
              type="button"
              onClick={() => pick(k)}
              disabled={removed}
              aria-label={show && isAns ? `เงาของ ${o.name} — ถูกต้อง` : "เงาให้เลือก"}
              className={cn(
                "card tap grid aspect-square place-items-center p-3 transition",
                removed && "opacity-25",
                show && isAns && "border-mint-soft! bg-mint-soft",
                show && !isAns && picked === k && "border-pink-accent! bg-pink-soft",
                !show && !removed && "hover:scale-105",
              )}
            >
              <span
                className="emoji-shadow text-[clamp(2.4rem,12vw,4rem)] leading-none"
                style={{ transform: `rotate(${q.spin[k]}deg)` }}
              >
                {o.emoji}
              </span>
              {show && isAns && <span className="mt-1 text-[13px] font-medium text-[#1f6b4d]">✅ {o.name}</span>}
              {show && !isAns && picked === k && <span className="mt-1 text-[13px] font-medium text-[#a8456c]">ยังไม่ใช่นะ</span>}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-[13px] leading-relaxed text-ink-soft">
        ดู <b>รูปร่างของเงา</b> เป็นหลักนะ — ไม่ต้องดูสีหรือรายละเอียดข้างใน
        {tricky && <><br />ระดับนี้เงาบางอันเอียงหรือมีรูปร่างใกล้เคียงกัน ต้องสังเกตให้ดี</>}
      </p>
    </GameShell>
  );
}

export { SHADOW_CATEGORIES };
