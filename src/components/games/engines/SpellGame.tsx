"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Delete, Eraser, Lightbulb, Volume2 } from "lucide-react";
import { GameShell, shuffle, type GameOutcome } from "@/components/games/GameShell";
import { useFlashCategories } from "@/components/flashcards/useFlashcards";
import { canSpeak, onVoicesReady, speak, stopSpeaking } from "@/lib/speak";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;
type Lang = "th" | "en";

/** พยัญชนะไทย ก–ฮ */
const THAI_CONSONANTS = "กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ".split("");
/** สระและวรรณยุกต์ที่เด็กเจอบ่อย */
const THAI_VOWELS = "ะัาำิีึืุูเแโใไ็่้๊๋์ฺๆ".split("");
const EN_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/**
 * 🔤 เกมสะกดคำ — ดูภาพแล้วเลือกตัวอักษรมาใส่เอง
 * คำศัพท์ดึงมาจากคลังแฟลชการ์ดโดยตรง ครูเพิ่มบัตรเอง เกมก็มีคำใหม่ให้เล่นทันที
 * เลือกภาษาได้ทั้งไทยและอังกฤษ · หยิบตัวอักษรผิดลบออกได้
 */
export function SpellGame({ count = 5, maxLen = 6, timeLimit, onDone }: {
  count?: number; maxLen?: number; timeLimit?: number; onDone?: Cb;
}) {
  const cats = useFlashCategories();
  const [lang, setLang] = useState<Lang>("th");
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState<string[]>([]);
  const [wrongs, setWrongs] = useState(0);
  const [hinted, setHinted] = useState(false);
  const [bad, setBad] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const [round, setRound] = useState(0);

  useEffect(() => { setReady(true); }, []);
  useEffect(() => onVoicesReady(() => setReady(true)), []);
  useEffect(() => () => stopSpeaking(), []);
  const canHear = useMemo(() => ready && canSpeak(lang), [ready, lang]);

  const keys = lang === "th" ? [...THAI_CONSONANTS, ...THAI_VOWELS] : EN_LETTERS;
  const keySet = useMemo(() => new Set(keys), [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  /** คำที่สะกดได้ด้วยแป้นที่มี และไม่ยาวเกินไป */
  const words = useMemo(() => {
    if (!ready) return [];
    const all = cats.flatMap((c) => c.sets.flatMap((s) => s.cards));
    const ok = all.filter((c) => {
      const w = lang === "th" ? c.th : c.en.toUpperCase();
      const chars = w.replace(/\s/g, "").split("");
      return chars.length >= 2 && chars.length <= maxLen && chars.every((ch) => keySet.has(ch));
    });
    return shuffle(ok).slice(0, count);
  }, [cats, lang, maxLen, count, ready, round, keySet]);

  const card = words[i];
  const answer = card ? (lang === "th" ? card.th : card.en.toUpperCase()).replace(/\s/g, "").split("") : [];

  const reset = useCallback(() => { setI(0); setTyped([]); setWrongs(0); setHinted(false); setBad(false); setDone(false); }, []);
  useEffect(() => { reset(); }, [lang, round, reset]);

  const press = (ch: string) => {
    if (done || !card || typed.length >= answer.length) return;
    const next = [...typed, ch];
    if (ch !== answer[typed.length]) {
      setWrongs((w) => w + 1);
      setBad(true);
      setTimeout(() => setBad(false), 500);
      setTyped(next);              // ใส่ลงไปก่อน เด็กจะได้เห็นว่าผิดแล้วลบออกเอง
      return;
    }
    setTyped(next);
    if (next.length === answer.length) {
      if (canHear) speak(lang === "th" ? card.th : card.en, lang);
      setTimeout(() => {
        if (i + 1 >= words.length) setDone(true);
        else { setI(i + 1); setTyped([]); setHinted(false); }
      }, 1100);
    }
  };

  const back = () => { if (!done) { setTyped((t) => t.slice(0, -1)); setBad(false); } };
  const clear = () => { if (!done) { setTyped([]); setBad(false); } };
  const hint = () => {
    if (done || !card) return;
    setHinted(true);
    setTyped(answer.slice(0, Math.max(1, typed.length + 1)));
  };

  if (ready && words.length === 0) {
    return (
      <p className="card p-6 text-center text-[15px] leading-relaxed text-ink-soft">
        ยังไม่มีคำศัพท์ที่สะกดได้ในภาษานี้ — ลองสลับภาษา หรือเพิ่มบัตรที่หน้าจัดการแฟลชการ์ดค่ะ
      </p>
    );
  }
  if (!card) return null;

  const correctSoFar = typed.every((ch, k) => ch === answer[k]);

  return (
    <GameShell
      instruction={done ? `🎉 เก่งมาก! สะกดครบ ${words.length} คำแล้ว` : `สะกดคำนี้ให้ถูก — แตะตัวอักษรด้านล่างทีละตัว`}
      progress={{ current: done ? words.length : i, total: words.length }}
      done={done}
      onRestart={() => setRound((r) => r + 1)}
      stats={wrongs === 0 ? "ยังไม่หยิบผิดเลย!" : `หยิบผิด ${wrongs} ครั้ง`}
      mistakes={wrongs}
      total={words.length}
      timeLimit={timeLimit}
      onDone={onDone}
    >
      {/* เลือกภาษา */}
      <div className="mb-4 flex items-center justify-center gap-2">
        <span className="text-[14px] text-ink-soft">เล่นภาษา</span>
        {([["th", "🇹🇭 ไทย"], ["en", "🇬🇧 English"]] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setLang(id)} aria-pressed={lang === id}
            className={cn("tap rounded-full px-4 py-1.5 text-[14px] font-medium transition",
              lang === id ? "bg-purple-600 text-white! shadow-soft" : "bg-cream-dark text-purple-700 hover:brightness-95")}>
            {label}
          </button>
        ))}
      </div>

      {/* ภาพ + ช่องเติมตัวอักษร */}
      <div className="card mx-auto mb-4 max-w-xl p-4 text-center">
        <span className="block text-[clamp(3.5rem,18vw,5.5rem)] leading-none">
          {card.image
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={card.image} alt="" className="mx-auto h-[clamp(4rem,20vw,6rem)]! w-auto object-contain" />
            : card.emoji}
        </span>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          {answer.map((ch, k) => {
            const v = typed[k];
            const ok = v !== undefined && v === ch;
            const no = v !== undefined && v !== ch;
            return (
              <span key={k}
                className={cn("grid h-14 min-w-12 place-items-center rounded-xl border-b-4 px-2 font-display text-[clamp(1.4rem,6vw,2rem)] transition",
                  ok ? "border-[#1f6b4d] bg-mint-soft text-purple-800"
                    : no ? "border-pink-accent bg-pink-soft text-[#a8456c]"
                    : "border-purple-300 bg-cream text-ink-soft")}>
                {v ?? ""}
              </span>
            );
          })}
        </div>

        {/* คำใบ้ภาษาอีกฝั่ง เพื่อให้เด็กเชื่อมโยงสองภาษา */}
        <p className="mt-2 text-[14px] text-ink-soft">
          {lang === "th" ? `ภาษาอังกฤษคือ ${card.en}` : `ภาษาไทยคือ ${card.th}`}
        </p>

        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {canHear && (
            <button type="button" onClick={() => speak(lang === "th" ? card.th : card.en, lang)}
              className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-4 py-1.5 text-[14px] font-medium text-purple-700 hover:brightness-95">
              <Volume2 size={15} /> ฟังเสียง
            </button>
          )}
          <button type="button" onClick={hint}
            className="tap inline-flex items-center gap-1.5 rounded-full bg-yellow-soft px-4 py-1.5 text-[14px] font-medium text-[#8a6a00] hover:brightness-95">
            <Lightbulb size={15} /> ขอตัวใบ้
          </button>
          <button type="button" onClick={back} disabled={typed.length === 0}
            className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-4 py-1.5 text-[14px] font-medium text-purple-700 hover:brightness-95 disabled:opacity-40">
            <Delete size={15} /> ลบตัวสุดท้าย
          </button>
          <button type="button" onClick={clear} disabled={typed.length === 0}
            className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-4 py-1.5 text-[14px] font-medium text-[#a8456c] hover:brightness-95 disabled:opacity-40">
            <Eraser size={15} /> ลบทั้งหมด
          </button>
        </div>

        {bad && !correctSoFar && (
          <p className="mt-2 text-[14px] font-medium text-[#a8456c]">ตัวนี้ยังไม่ใช่นะ — กดลบแล้วลองใหม่ได้เลย</p>
        )}
        {hinted && <p className="mt-1 text-[13px] text-ink-soft">💡 ใช้ตัวใบ้ไปแล้ว ไม่เป็นไรนะ ค่อย ๆ ฝึกไปด้วยกัน</p>}
      </div>

      {/* แป้นตัวอักษร */}
      <div className="mx-auto max-w-2xl">
        {lang === "th" && <p className="mb-1 text-center text-[13px] text-ink-soft">พยัญชนะ ก–ฮ</p>}
        <div className={cn("grid gap-1.5", lang === "th" ? "grid-cols-7 sm:grid-cols-11" : "grid-cols-6 sm:grid-cols-9")}>
          {(lang === "th" ? THAI_CONSONANTS : EN_LETTERS).map((ch) => (
            <Key key={ch} ch={ch} onPress={press} />
          ))}
        </div>

        {lang === "th" && (
          <>
            <p className="mt-3 mb-1 text-center text-[13px] text-ink-soft">สระและวรรณยุกต์</p>
            <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-11">
              {THAI_VOWELS.map((ch) => <Key key={ch} ch={ch} onPress={press} vowel />)}
            </div>
          </>
        )}
      </div>
    </GameShell>
  );
}

function Key({ ch, onPress, vowel }: { ch: string; onPress: (c: string) => void; vowel?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => onPress(ch)}
      aria-label={`ตัวอักษร ${ch}`}
      className={cn(
        "tap grid h-11 place-items-center rounded-xl border-b-4 font-display text-[18px] transition active:translate-y-0.5 sm:h-12 sm:text-[20px]",
        vowel ? "border-sky-soft bg-sky-soft text-[#2b5c8a] hover:brightness-95"
          : "border-purple-200 bg-white text-purple-800 hover:bg-purple-50",
      )}
    >
      {vowel ? `–${ch}` : ch}
    </button>
  );
}
