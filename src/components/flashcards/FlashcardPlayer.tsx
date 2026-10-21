"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, RotateCcw, Shuffle, Volume2 } from "lucide-react";
import type { FlashCard, FlashMode } from "@/types/flashcard";
import { canSpeak, onVoicesReady, speak, stopSpeaking } from "@/lib/speak";
import { cn } from "@/lib/cn";

/**
 * 🃏 เครื่องเล่นแฟลชการ์ด — ภาพเดียวกันทั้งสองด้าน
 * 📖 โหมดเรียนรู้ : ด้านหน้า = ภาพ + คำไทย → พลิกดู = ภาพเดิม + คำอังกฤษ
 * 🎯 โหมดทบทวน  : ด้านหน้า = ภาพอย่างเดียว ให้เด็กลองพูดเอง → พลิกดูเฉลย ไทย + อังกฤษ
 */
export function FlashcardPlayer({ cards, backHref }: { cards: FlashCard[]; backHref: string }) {
  const [order, setOrder] = useState<number[]>(() => cards.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState<FlashMode>("learn");
  const [voices, setVoices] = useState(0);
  // รอให้หน้าเว็บพร้อมก่อนค่อยแสดงปุ่มเสียง เพื่อให้ HTML ฝั่งเซิร์ฟเวอร์กับเบราว์เซอร์ตรงกัน
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  useEffect(() => onVoicesReady(() => setVoices((v) => v + 1)), []);
  useEffect(() => () => stopSpeaking(), []);

  const thOK = useMemo(() => ready && canSpeak("th"), [ready, voices]);
  const enOK = useMemo(() => ready && canSpeak("en"), [ready, voices]);

  const card = cards[order[pos]];
  const total = order.length;

  const go = useCallback((d: -1 | 1) => {
    stopSpeaking();
    setFlipped(false);
    setPos((p) => (p + d + total) % total);
  }, [total]);

  const shuffle = () => {
    stopSpeaking();
    const a = [...order];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    setOrder(a); setPos(0); setFlipped(false);
  };

  const restart = () => {
    stopSpeaking();
    setOrder(cards.map((_, i) => i)); setPos(0); setFlipped(false);
  };

  // ลูกศรซ้าย–ขวาเปลี่ยนบัตร · เว้นวรรคพลิกบัตร
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
      else if (e.key === " " || e.key === "Enter") { e.preventDefault(); setFlipped((f) => !f); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [go]);

  if (!card) return null;

  const showTh = mode === "learn" ? !flipped : flipped;
  const showEn = flipped;

  return (
    <div className="mx-auto max-w-2xl">
      {/* โหมดการใช้งาน */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        {([
          { id: "learn" as const, emoji: "📖", label: "โหมดเรียนรู้", hint: "เห็นคำไทยก่อน แล้วพลิกดูอังกฤษ" },
          { id: "review" as const, emoji: "🎯", label: "โหมดทบทวน", hint: "เห็นแต่ภาพ ให้ลองพูดก่อนเฉลย" },
        ]).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => { setMode(m.id); setFlipped(false); stopSpeaking(); }}
            aria-pressed={mode === m.id}
            className={cn(
              "tap rounded-2xl border-2 px-3 py-2.5 text-left transition",
              mode === m.id ? "border-purple-400! bg-purple-50" : "border-line bg-white hover:bg-cream",
            )}
          >
            <span className="block font-display text-[15px] text-purple-800">{m.emoji} {m.label}</span>
            <span className="mt-0.5 block text-[12px] leading-snug text-ink-soft">{m.hint}</span>
          </button>
        ))}
      </div>

      {/* แถบความคืบหน้า */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-[13px] text-ink-soft">
          <span>ใบที่ <b className="text-purple-700">{pos + 1}</b> จาก {total} ใบ</span>
          <span>{Math.round(((pos + 1) / total) * 100)}%</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-cream-dark">
          <div className="h-full rounded-full bg-purple-400 transition-all" style={{ width: `${((pos + 1) / total) * 100}%` }} />
        </div>
      </div>

      {/* บัตร — กดที่บัตรเพื่อพลิก */}
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "พลิกกลับด้านหน้า" : "พลิกดูอีกด้าน"}
        className="card tap w-full overflow-hidden p-0 text-center"
      >
        <span className="grid aspect-[4/3] max-h-[42vh] w-full place-items-center bg-gradient-to-br from-purple-50 to-cream p-4">
          {card.image
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={card.image} alt={card.th} className="max-h-full! w-auto rounded-2xl object-contain" />
            : <span className="text-[clamp(5rem,28vw,10rem)] leading-none">{card.emoji}</span>}
        </span>

        <span className="block px-4 py-5">
          {showTh && (
            <span className="block font-display text-[clamp(1.6rem,7vw,2.4rem)] leading-tight text-purple-800">{card.th}</span>
          )}
          {showEn && (
            <span className="mt-1 block font-display text-[clamp(1.4rem,6vw,2rem)] leading-tight text-[#2b5c8a]">{card.en}</span>
          )}
          {showEn && <span className="mt-0.5 block text-[14px] text-ink-soft">อ่านว่า {card.read}</span>}

          {!flipped && mode === "review" && (
            <span className="block text-[15px] text-ink-soft">ลองพูดเป็นภาษาอังกฤษดูสิ แล้วกดที่บัตรเพื่อดูเฉลย 👀</span>
          )}
          {!flipped && mode === "learn" && (
            <span className="mt-1 block text-[14px] text-ink-soft">กดที่บัตรเพื่อดูคำภาษาอังกฤษ 🔄</span>
          )}
          {flipped && card.note && (
            <span className="mx-auto mt-3 block max-w-md rounded-2xl bg-mint-soft px-4 py-2.5 text-[14px] leading-relaxed text-ink">
              💡 {card.note}
            </span>
          )}
        </span>
      </button>

      {/* ปุ่มฟังเสียง — แยกไทย/อังกฤษ */}
      {(thOK || enOK) && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {thOK && (
            <button type="button" onClick={() => speak(card.th, "th")}
              className="tap inline-flex items-center justify-center gap-2 rounded-full bg-purple-600 px-4 py-3 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700">
              <Volume2 size={18} /> ฟังภาษาไทย
            </button>
          )}
          {enOK && (
            <button type="button" onClick={() => speak(card.en, "en")}
              className="tap inline-flex items-center justify-center gap-2 rounded-full bg-[#2b5c8a] px-4 py-3 text-[15px] font-medium text-white! shadow-soft hover:brightness-110">
              <Volume2 size={18} /> ฟังภาษาอังกฤษ
            </button>
          )}
        </div>
      )}

      {/* ปุ่มเปลี่ยนบัตร */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button type="button" onClick={() => go(-1)}
          className="tap inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-4 py-3 text-[15px] font-medium text-purple-700 shadow-soft hover:bg-cream">
          <ArrowLeft size={18} /> ก่อนหน้า
        </button>
        <button type="button" onClick={() => setFlipped((f) => !f)}
          className="tap inline-flex items-center justify-center gap-1.5 rounded-full bg-yellow-accent px-4 py-3 text-[15px] font-medium text-[#5a4600] shadow-soft hover:brightness-95">
          <RotateCcw size={18} /> พลิกบัตร
        </button>
        <button type="button" onClick={() => go(1)}
          className="tap inline-flex items-center justify-center gap-1.5 rounded-full bg-purple-600 px-4 py-3 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700">
          ถัดไป <ArrowRight size={18} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={shuffle}
          className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-4 py-2 text-[14px] font-medium text-purple-700 hover:brightness-95">
          <Shuffle size={16} /> สลับบัตรแบบสุ่ม
        </button>
        <button type="button" onClick={restart}
          className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-4 py-2 text-[14px] font-medium text-purple-700 hover:brightness-95">
          <RotateCcw size={16} /> เริ่มใหม่ตั้งแต่ใบแรก
        </button>
        <Link href={backHref} className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-4 py-2 text-[14px] font-medium text-purple-700 hover:brightness-95">
          <ArrowLeft size={16} /> กลับไปเลือกชุด
        </Link>
      </div>

      <p className="mt-3 text-center text-[12px] text-ink-soft">
        💻 บนคอมพิวเตอร์กดลูกศร ← → เพื่อเปลี่ยนบัตร และเคาะ Space เพื่อพลิกบัตรได้
      </p>
    </div>
  );
}
