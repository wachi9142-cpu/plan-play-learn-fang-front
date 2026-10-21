"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Volume2 } from "lucide-react";
import type { FlashCard } from "@/types/flashcard";
import { canSpeak, onVoicesReady, speak, stopSpeaking } from "@/lib/speak";
import { cn } from "@/lib/cn";

/** สุ่มลำดับใหม่ (ไม่แก้ array เดิม) */
function shuffled<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

const PER_ROUND = 5;

/**
 * 🧩 เกมจับคู่ภาพกับคำศัพท์
 * เล่นรอบละ 5 คู่ — กดภาพ แล้วกดคำที่คิดว่าใช่ ถูกแล้วคู่นั้นจะติดกันไว้
 */
export function MatchGame({ cards, lang, backHref }: { cards: FlashCard[]; lang: "th" | "en"; backHref: string }) {
  const rounds = useMemo(() => {
    const all = shuffled(cards);
    const out: FlashCard[][] = [];
    for (let i = 0; i < all.length; i += PER_ROUND) {
      const chunk = all.slice(i, i + PER_ROUND);
      if (chunk.length >= 2) out.push(chunk);
    }
    return out;
  }, [cards]);

  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  const [voices, setVoices] = useState(0);
  // รอให้หน้าเว็บพร้อมก่อนค่อยแสดงปุ่มเสียง เพื่อให้ HTML ฝั่งเซิร์ฟเวอร์กับเบราว์เซอร์ตรงกัน
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  useEffect(() => onVoicesReady(() => setVoices((v) => v + 1)), []);
  useEffect(() => () => stopSpeaking(), []);
  const canHear = useMemo(() => ready && canSpeak(lang), [ready, lang, voices]);

  const group = rounds[round] ?? [];
  const words = useMemo(() => shuffled(group), [group]);
  const finished = group.length > 0 && done.length === group.length;
  const allFinished = finished && round >= rounds.length - 1;

  const reset = useCallback(() => { setPicked(null); setDone([]); setWrong(null); }, []);

  const pickWord = (id: string) => {
    if (!picked || done.includes(id)) return;
    setTries((t) => t + 1);
    if (picked === id) {
      setDone((d) => [...d, id]);
      setPicked(null);
      const c = group.find((x) => x.id === id);
      if (c && canHear) speak(lang === "th" ? c.th : c.en, lang);
    } else {
      setWrong(id);
      setTimeout(() => setWrong(null), 600);
    }
  };

  if (rounds.length === 0) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[14px]">
        <span className="text-ink-soft">รอบที่ <b className="text-purple-700">{round + 1}</b> จาก {rounds.length}</span>
        <span className="text-ink-soft">จับคู่ได้แล้ว <b className="text-purple-700">{done.length}</b>/{group.length} คู่ · กดไปแล้ว {tries} ครั้ง</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* ฝั่งภาพ */}
        <div className="card p-3">
          <p className="mb-2 text-center font-display text-[15px] text-purple-700">🖼️ ภาพ</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
            {group.map((c) => {
              const ok = done.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={ok}
                  onClick={() => setPicked(c.id)}
                  className={cn(
                    "tap flex items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-left transition",
                    ok ? "border-mint-soft! bg-mint-soft opacity-70"
                      : picked === c.id ? "border-purple-400! bg-purple-50"
                      : "border-line bg-cream hover:brightness-95",
                  )}
                >
                  <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/80 text-3xl">
                    {c.image
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={c.image} alt="" className="h-full! w-full! object-contain" />
                      : c.emoji}
                  </span>
                  <span className="min-w-0 flex-1 text-[14px] text-ink-soft">{ok ? "✅ จับคู่แล้ว" : picked === c.id ? "👉 เลือกคำที่ตรงกัน" : "กดเพื่อเลือก"}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ฝั่งคำศัพท์ */}
        <div className="card p-3">
          <p className="mb-2 text-center font-display text-[15px] text-purple-700">
            {lang === "th" ? "🇹🇭 คำภาษาไทย" : "🇬🇧 คำภาษาอังกฤษ"}
          </p>
          <div className="grid gap-2">
            {words.map((c) => {
              const ok = done.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={ok}
                  onClick={() => pickWord(c.id)}
                  className={cn(
                    "tap flex items-center justify-between gap-2 rounded-2xl border-2 px-4 py-3 text-left transition",
                    ok ? "border-mint-soft! bg-mint-soft opacity-70"
                      : wrong === c.id ? "border-pink-accent! bg-pink-soft"
                      : "border-line bg-cream hover:brightness-95",
                  )}
                >
                  <span className="font-display text-[18px] text-purple-800">{lang === "th" ? c.th : c.en}</span>
                  {ok && <span className="text-[14px] text-[#1f6b4d]">✅</span>}
                  {wrong === c.id && <span className="text-[14px] text-[#a8456c]">ลองใหม่นะ</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {finished && (
        <div className="card mt-4 border-mint-soft! p-5 text-center">
          <p className="font-display text-xl text-purple-800">🎉 {allFinished ? "เก่งมาก! จับคู่ครบทุกรอบแล้ว" : "เยี่ยมมาก! จบรอบนี้แล้ว"}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {!allFinished && (
              <button type="button" onClick={() => { setRound((r) => r + 1); reset(); }}
                className="tap rounded-full bg-purple-600 px-5 py-2.5 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700">
                ไปรอบต่อไป →
              </button>
            )}
            <button type="button" onClick={() => { setRound(0); reset(); setTries(0); }}
              className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-5 py-2.5 text-[15px] font-medium text-purple-700 hover:brightness-95">
              <RotateCcw size={16} /> เล่นใหม่ตั้งแต่ต้น
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {canHear && picked && (
          <button type="button" onClick={() => {
            const c = group.find((x) => x.id === picked);
            if (c) speak(lang === "th" ? c.th : c.en, lang);
          }}
            className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-4 py-2 text-[14px] font-medium text-purple-700 hover:brightness-95">
            <Volume2 size={16} /> ฟังเสียงใบที่เลือก
          </button>
        )}
        <Link href={backHref} className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-4 py-2 text-[14px] font-medium text-purple-700 hover:brightness-95">
          <ArrowLeft size={16} /> กลับไปหน้าชุดบัตร
        </Link>
      </div>
    </div>
  );
}
