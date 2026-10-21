"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Volume2 } from "lucide-react";
import type { FlashCard } from "@/types/flashcard";
import { canSpeak, onVoicesReady, speak, stopSpeaking } from "@/lib/speak";
import { cn } from "@/lib/cn";

function shuffled<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

const CHOICES = 4;
const QUESTIONS = 10;

/**
 * 🎯 เกมทายคำ — ขึ้นคำศัพท์ (ไทยหรืออังกฤษ) แล้วให้เด็กเลือกภาพที่ตรงกัน
 */
export function QuizGame({ cards, lang, backHref }: { cards: FlashCard[]; lang: "th" | "en"; backHref: string }) {
  const quiz = useMemo(() => {
    const pick = shuffled(cards).slice(0, Math.min(QUESTIONS, cards.length));
    return pick.map((answer) => {
      const others = shuffled(cards.filter((c) => c.id !== answer.id)).slice(0, CHOICES - 1);
      return { answer, options: shuffled([answer, ...others]) };
    });
  }, [cards]);

  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0); // เปลี่ยนค่าเพื่อเริ่มเกมใหม่
  const [voices, setVoices] = useState(0);
  // รอให้หน้าเว็บพร้อมก่อนค่อยแสดงปุ่มเสียง เพื่อให้ HTML ฝั่งเซิร์ฟเวอร์กับเบราว์เซอร์ตรงกัน
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  useEffect(() => onVoicesReady(() => setVoices((v) => v + 1)), []);
  useEffect(() => () => stopSpeaking(), []);
  const canHear = useMemo(() => ready && canSpeak(lang), [ready, lang, voices]);

  const q = quiz[i];
  const finished = i >= quiz.length;

  // อ่านคำถามให้ฟังอัตโนมัติเมื่อขึ้นข้อใหม่
  useEffect(() => {
    if (q && canHear) speak(lang === "th" ? q.answer.th : q.answer.en, lang);
  }, [q, canHear, lang, round]);

  const choose = (id: string) => {
    if (chosen) return;
    setChosen(id);
    if (id === q.answer.id) setScore((s) => s + 1);
    setTimeout(() => { setChosen(null); setI((n) => n + 1); }, 1100);
  };

  const restart = () => { setI(0); setChosen(null); setScore(0); setRound((r) => r + 1); };

  if (quiz.length === 0) return null;

  if (finished) {
    const full = score === quiz.length;
    return (
      <div className="mx-auto max-w-xl">
        <div className="card border-mint-soft! p-6 text-center">
          <p className="text-6xl">{full ? "🏆" : score >= quiz.length / 2 ? "🎉" : "💪"}</p>
          <p className="mt-2 font-display text-2xl text-purple-800">
            ตอบถูก {score} จาก {quiz.length} ข้อ
          </p>
          <p className="mt-1 text-[15px] text-ink-soft">
            {full ? "เก่งมากเลย ถูกหมดทุกข้อ!" : score >= quiz.length / 2 ? "เก่งมาก! ลองอีกรอบให้ถูกครบนะ" : "ไม่เป็นไรนะ ลองทบทวนบัตรอีกครั้งแล้วมาเล่นใหม่"}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={restart}
              className="tap inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-5 py-2.5 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700">
              <RotateCcw size={16} /> เล่นอีกรอบ
            </button>
            <Link href={backHref} className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-5 py-2.5 text-[15px] font-medium text-purple-700 hover:brightness-95">
              <ArrowLeft size={16} /> กลับไปหน้าชุดบัตร
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3">
        <div className="flex items-center justify-between text-[13px] text-ink-soft">
          <span>ข้อที่ <b className="text-purple-700">{i + 1}</b> จาก {quiz.length}</span>
          <span>ตอบถูก {score} ข้อ</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-cream-dark">
          <div className="h-full rounded-full bg-purple-400 transition-all" style={{ width: `${(i / quiz.length) * 100}%` }} />
        </div>
      </div>

      <div className="card p-5 text-center">
        <p className="text-[15px] text-ink-soft">เลือกภาพที่ตรงกับคำนี้</p>
        <p className="mt-1 font-display text-[clamp(1.8rem,8vw,2.6rem)] leading-tight text-purple-800">
          {lang === "th" ? q.answer.th : q.answer.en}
        </p>
        {lang === "en" && <p className="text-[14px] text-ink-soft">อ่านว่า {q.answer.read}</p>}
        {canHear && (
          <button type="button" onClick={() => speak(lang === "th" ? q.answer.th : q.answer.en, lang)}
            className="tap mt-2 inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-4 py-2 text-[14px] font-medium text-purple-700 hover:brightness-95">
            <Volume2 size={16} /> ฟังอีกครั้ง
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {q.options.map((o) => {
          const isAnswer = o.id === q.answer.id;
          const show = chosen !== null;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => choose(o.id)}
              className={cn(
                "card tap grid place-items-center p-4 transition",
                show && isAnswer && "border-mint-soft! bg-mint-soft",
                show && !isAnswer && chosen === o.id && "border-pink-accent! bg-pink-soft",
              )}
            >
              <span className="grid aspect-square w-full place-items-center overflow-hidden rounded-2xl">
                {o.image
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={o.image} alt="" className="h-full! w-full! object-contain" />
                  : <span className="text-[clamp(3rem,16vw,5rem)] leading-none">{o.emoji}</span>}
              </span>
              {show && isAnswer && <span className="mt-1 text-[14px] font-medium text-[#1f6b4d]">✅ ถูกต้อง</span>}
              {show && !isAnswer && chosen === o.id && <span className="mt-1 text-[14px] font-medium text-[#a8456c]">ยังไม่ใช่นะ</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <Link href={backHref} className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-4 py-2 text-[14px] font-medium text-purple-700 hover:brightness-95">
          <ArrowLeft size={16} /> กลับไปหน้าชุดบัตร
        </Link>
      </div>
    </div>
  );
}
