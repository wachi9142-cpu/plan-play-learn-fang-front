"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GameShell, shuffle, type GameOutcome } from "@/components/games/GameShell";
import { useFlashCategories } from "@/components/flashcards/useFlashcards";
import { canSpeak, onVoicesReady, speak, stopSpeaking } from "@/lib/speak";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;

interface Card { key: number; id: string; th: string; en: string; emoji: string; image?: string }

/**
 * 🃏 เกมจับคู่ความจำจากแฟลชการ์ด
 * ดึงคำศัพท์จากคลังแฟลชการ์ดมาเล่นโดยตรง — ครูเพิ่มบัตรเอง เกมก็มีคำใหม่ให้เล่นทันที
 * จับคู่ "ภาพ + คำไทย" กับ "ภาพเดียวกัน + คำอังกฤษ" เด็กจึงได้ทบทวนสองภาษาไปด้วย
 */
export function FlashMemoryGame({ pairs = 6, timeLimit, onDone }: { pairs?: number; timeLimit?: number; onDone?: Cb }) {
  const cats = useFlashCategories();
  const [catId, setCatId] = useState<string>("all");
  const [cards, setCards] = useState<Card[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [miss, setMiss] = useState(0);
  const [lock, setLock] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);
  useEffect(() => onVoicesReady(() => setReady(true)), []);
  useEffect(() => () => stopSpeaking(), []);
  const canHear = useMemo(() => ready && canSpeak("en"), [ready]);

  /** คำศัพท์ที่เลือกมาเล่นรอบนี้ */
  const pool = useMemo(() => {
    const from = catId === "all" ? cats : cats.filter((c) => c.id === catId);
    return from.flatMap((c) => c.sets.flatMap((s) => s.cards));
  }, [cats, catId]);

  const restart = useCallback(() => {
    const picked = shuffle(pool).slice(0, Math.min(pairs, pool.length));
    setCards(shuffle(picked.flatMap((c, i) => [
      { key: i * 2, id: c.id, th: c.th, en: c.en, emoji: c.emoji, image: c.image },
      { key: i * 2 + 1, id: c.id, th: c.th, en: c.en, emoji: c.emoji, image: c.image },
    ])));
    setOpen([]); setMatched(new Set()); setMoves(0); setMiss(0); setLock(false);
  }, [pool, pairs]);

  // สุ่มหลังหน้าเว็บพร้อม เพื่อไม่ให้ฝั่งเซิร์ฟเวอร์กับเบราว์เซอร์ต่างกัน
  useEffect(() => { restart(); }, [restart]);

  const total = cards.length / 2;
  const done = total > 0 && matched.size === total;

  const flip = (i: number) => {
    if (lock || open.includes(i) || matched.has(cards[i].id)) return;
    const next = [...open, i];
    setOpen(next);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = next.map((k) => cards[k]);
    if (a.id === b.id) {
      setMatched((s) => new Set(s).add(a.id));
      setOpen([]);
      if (canHear) speak(a.en, "en");
    } else {
      setMiss((n) => n + 1);
      setLock(true);
      setTimeout(() => { setOpen([]); setLock(false); }, 850);
    }
  };

  if (pool.length < 2) {
    return <p className="card p-6 text-center text-[15px] text-ink-soft">ยังไม่มีคำศัพท์พอให้เล่น — เพิ่มบัตรได้ที่หน้าจัดการแฟลชการ์ดค่ะ</p>;
  }

  return (
    <GameShell
      instruction={done ? `🎉 เก่งมาก! จับคู่ครบ ${total} คู่ ใน ${moves} ครั้ง` : "เปิดการ์ด 2 ใบให้เป็นของสิ่งเดียวกัน — ใบหนึ่งคำไทย อีกใบคำอังกฤษ"}
      progress={{ current: matched.size, total: Math.max(total, 1) }}
      done={done}
      onRestart={restart}
      stats={`เปิดไปแล้ว ${moves} ครั้ง`}
      mistakes={miss}
      total={Math.max(total, 1)}
      timeLimit={timeLimit}
      onDone={onDone}
    >
      {/* เลือกหมวดคำศัพท์ */}
      <div className="mb-3 flex flex-wrap justify-center gap-1.5">
        {[{ id: "all", emoji: "🗂️", label: "ทุกหมวด" }, ...cats.map((c) => ({ id: c.id, emoji: c.emoji, label: c.label }))].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCatId(c.id)}
            aria-pressed={catId === c.id}
            className={cn(
              "tap rounded-full px-3 py-1.5 text-[13px] font-medium transition",
              catId === c.id ? "bg-purple-600 text-white! shadow-soft" : "bg-cream-dark text-purple-700 hover:brightness-95",
            )}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      <div className="mx-auto grid w-full max-w-[40rem] grid-cols-3 gap-2 sm:grid-cols-4">
        {cards.map((c, i) => {
          const isOpen = open.includes(i);
          const isDone = matched.has(c.id);
          // ใบคู่แรกของแต่ละคำโชว์ภาษาไทย ใบที่สองโชว์ภาษาอังกฤษ
          const word = c.key % 2 === 0 ? c.th : c.en;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => flip(i)}
              disabled={isDone}
              aria-label={isOpen || isDone ? word : "การ์ดคว่ำ"}
              className={cn(
                "tap grid aspect-[3/4] place-items-center rounded-2xl border-2 p-1.5 text-center transition",
                isDone ? "border-mint-soft! bg-mint-soft opacity-80"
                  : isOpen ? "border-purple-400! bg-white"
                  : "border-line bg-gradient-to-br from-purple-100 to-purple-50 hover:brightness-95",
              )}
            >
              {isOpen || isDone ? (
                <span className="flex flex-col items-center gap-0.5">
                  <span className="text-[clamp(1.6rem,8vw,2.6rem)] leading-none">
                    {c.image
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={c.image} alt="" className="h-[clamp(2rem,9vw,3rem)]! w-auto object-contain" />
                      : c.emoji}
                  </span>
                  <span className="font-display text-[clamp(0.7rem,3vw,0.95rem)] leading-tight text-purple-800">{word}</span>
                </span>
              ) : (
                <span className="text-[clamp(1.4rem,7vw,2.2rem)] leading-none opacity-60">🃏</span>
              )}
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}
