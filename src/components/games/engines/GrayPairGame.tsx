"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { GameShell, shuffle, type GameOutcome } from "@/components/games/GameShell";
import { SpeakButton } from "@/components/ui/SpeakButton";
import {
  GRAY_LEVELS, PAIR_SETS, SCORE, findGrayLevel, findPairSet,
  type GrayLevel, type PairItem, type PairSet,
} from "@/data/gray-pair";
import { playSfx, setSfxOn, sfxOn } from "@/lib/sfx";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;

interface Card extends PairItem { key: string; decoy?: boolean }

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;

/**
 * ⬛ จับคู่ภาพขาวดำ
 *
 * ฝั่งซ้ายเป็นภาพขาวดำ ฝั่งขวาเป็นภาพสี — คลิกฝั่งซ้าย 1 ภาพ แล้วคลิกฝั่งขวาที่เป็นของสิ่งเดียวกัน
 * ระดับสูงขึ้นจะมีภาพที่รูปร่างคล้ายกันปนมาเป็นตัวลวง และจับคู่ผิดจะหักคะแนนเล็กน้อย
 */
export function GrayPairGame({ setId, levelId, onDone }: {
  /** หมวดภาพ — ไม่ใส่ = ให้เลือกในเกม */
  setId?: string;
  /** ระดับเริ่มต้น */
  levelId?: string;
  onDone?: Cb;
}) {
  const [phase, setPhase] = useState<"menu" | "play" | "over">("menu");
  const [set, setSet] = useState<PairSet>(() => (setId ? findPairSet(setId) ?? PAIR_SETS[0] : PAIR_SETS[0]));
  const [lv, setLv] = useState<GrayLevel>(() => findGrayLevel(levelId ?? "k1"));

  const [left, setLeft] = useState<Card[]>([]);
  const [right, setRight] = useState<Card[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [pickL, setPickL] = useState<string | null>(null);
  const [missed, setMissed] = useState<string[]>([]);
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [wrongs, setWrongs] = useState(0);
  const [time, setTime] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [sound, setSound] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => { setReady(true); setSound(sfxOn()); }, []);

  /* ---------- สร้างด่าน ---------- */
  const build = useCallback((s: PairSet, L: GrayLevel) => {
    const picks = shuffle(s.items).slice(0, Math.min(L.pairs, s.items.length));
    const used = new Set(picks.map((p) => p.emoji));

    /* ตัวลวง — ระดับยากใช้ภาพที่รูปร่างคล้ายกับภาพที่เลือกไว้ */
    const decoys: Card[] = [];
    if (L.decoys > 0) {
      const pool: PairItem[] = [];
      if (L.similar) {
        for (const grp of s.similar) {
          for (const e of grp) {
            if (used.has(e) || pool.some((p) => p.emoji === e)) continue;
            /* ใช้ชื่อกลาง ๆ เพราะเป็นภาพลวงที่ไม่มีคู่ */
            pool.push({ emoji: e, name: "ภาพคล้าย", nameEn: "Look-alike" });
          }
        }
      }
      for (const it of s.items) {
        if (!used.has(it.emoji) && !pool.some((p) => p.emoji === it.emoji)) pool.push(it);
      }
      decoys.push(...shuffle(pool).slice(0, L.decoys).map((p, i) => ({ ...p, key: `d${i}`, decoy: true })));
    }

    const pairs: Card[] = picks.map((p) => ({ ...p, key: p.emoji }));
    setLeft(shuffle(pairs));
    setRight(shuffle([...pairs, ...decoys]));
    setMatched([]); setPickL(null); setMissed([]); setWrongKey(null);
    setScore(0); setStreak(0); setBestStreak(0); setWrongs(0);
    setTime(L.seconds);
    setMsg(null);
  }, []);

  const start = (s: PairSet, L: GrayLevel) => {
    setSet(s); setLv(L);
    build(s, L);
    setPhase("play");
    playSfx("pop");
  };

  const restart = useCallback(() => {
    if (phase === "menu") return;
    build(set, lv);
    setPhase("play");
  }, [build, set, lv, phase]);

  /* ---------- นาฬิกา ---------- */
  useEffect(() => {
    if (phase !== "play" || lv.seconds === 0) return;
    const t = setInterval(() => {
      setTime((v) => {
        if (v <= 1) { setPhase("over"); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, lv.seconds]);

  /* ---------- จบเมื่อจับคู่ครบ ---------- */
  useEffect(() => {
    if (phase !== "play" || left.length === 0) return;
    if (matched.length >= left.length) {
      /* โบนัสเวลาที่เหลือ */
      if (lv.seconds > 0) setScore((s) => s + time * SCORE.timeBonus);
      playSfx("win");
      setPhase("over");
    }
  }, [matched, left.length, phase, lv.seconds, time]);

  /* ---------- รายงานผล ---------- */
  const reported = useRef(false);
  useEffect(() => {
    if (phase !== "over" || reported.current) return;
    reported.current = true;
    const total = left.length || 1;
    const miss = Math.max(0, total - matched.length);
    onDone?.({ mistakes: miss + Math.min(wrongs, total), total: total * 2, seconds: lv.seconds - time, timeUp: lv.seconds > 0 && time === 0, stars: 0 });
  }, [phase, matched.length, left.length, wrongs, lv.seconds, time, onDone]);
  useEffect(() => { if (phase === "play") reported.current = false; }, [phase]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 1800);
    return () => clearTimeout(t);
  }, [msg]);

  /* ---------- จับคู่ ---------- */
  const clickRight = (c: Card) => {
    if (phase !== "play" || matched.includes(c.key)) return;
    if (!pickL) { setMsg("เลือกภาพขาวดำฝั่งซ้ายก่อนนะ แล้วค่อยมาหาคู่ฝั่งขวา"); playSfx("pop"); return; }

    if (!c.decoy && c.key === pickL) {
      const first = !missed.includes(c.key);
      const gain = first ? SCORE.first : SCORE.retry;
      const st = streak + 1;
      const bonus = st >= 3 ? SCORE.streak : 0;
      setScore((s) => s + gain + bonus);
      setStreak(st);
      setBestStreak((b) => Math.max(b, st));
      setMatched((m) => [...m, c.key]);
      setPickL(null);
      playSfx("correct");
      setMsg(`✅ ${c.name} ถูกต้อง! +${gain}${bonus ? ` และโบนัสต่อเนื่อง +${bonus}` : ""} คะแนน`);
      return;
    }

    /* ผิด */
    setWrongs((n) => n + 1);
    setStreak(0);
    setMissed((l) => (l.includes(pickL) ? l : [...l, pickL]));
    setWrongKey(c.key);
    setTimeout(() => setWrongKey(null), 500);
    playSfx("wrong");
    if (lv.penalty) setScore((s) => Math.max(0, s + SCORE.wrong));
    setMsg(c.decoy
      ? "ภาพนี้ไม่มีคู่นะ เป็นภาพลวง ลองดูภาพอื่น"
      : lv.penalty ? `ยังไม่ใช่คู่กัน ลองใหม่นะ (${SCORE.wrong} คะแนน)` : "ยังไม่ใช่คู่กัน ลองใหม่ได้เลย");
  };

  const toggleSound = () => { const on = !sound; setSound(on); setSfxOn(on); if (on) playSfx("pop"); };

  if (!ready) return null;

  /* ───────────── เมนูเลือกหมวดและระดับ ───────────── */
  if (phase === "menu") {
    return (
      <GameShell instruction="เลือกหมวดภาพและระดับชั้น แล้วเริ่มเล่นได้เลย" done={false} onRestart={() => setPhase("menu")} mistakes={0} total={1} hideClock>
        <div className="mx-auto grid max-w-2xl gap-4">
          <div>
            <p className="mb-2 font-display text-[16px] text-purple-800">🗂️ หมวดภาพ</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {PAIR_SETS.map((s) => (
                <button key={s.id} type="button" onClick={() => { setSet(s); playSfx("pop"); }} aria-pressed={set.id === s.id}
                  className={cn("tap rounded-2xl border-2 px-3 py-2.5 text-left transition", set.id === s.id ? "border-purple-500! bg-purple-50" : "border-line bg-white hover:bg-cream")}>
                  <span className="block text-[15px] text-purple-800">{s.emoji} {s.label} <span className="text-[12px] text-ink-soft">· {s.items.length} ภาพ</span></span>
                  <span className="block text-[12px] leading-snug text-ink-soft">{s.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 font-display text-[16px] text-purple-800">🎚️ ระดับตามชั้นเรียน</p>
            <div className="grid gap-2">
              {GRAY_LEVELS.map((L) => (
                <button key={L.id} type="button" onClick={() => start(set, L)}
                  className="tap rounded-2xl bg-cream px-3.5 py-2.5 text-left hover:bg-purple-50">
                  <span className="block text-[15px] text-purple-800">
                    {L.emoji} {L.grade} <span className="text-[13px] text-ink-soft">· {L.ages} · {L.label}</span>
                  </span>
                  <span className="block text-[12px] leading-snug text-ink-soft">{L.about}</span>
                  <span className="mt-0.5 block text-[12px] text-purple-700">
                    {L.pairs} คู่{L.decoys > 0 ? ` · ตัวลวง ${L.decoys} ภาพ` : ""} · {L.seconds > 0 ? `${L.seconds} วินาที` : "ไม่จำกัดเวลา"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </GameShell>
    );
  }

  /* ───────────── เล่น ───────────── */
  const done = phase === "over";
  const passed = matched.length >= lv.need;

  return (
    <GameShell
      instruction={
        done
          ? passed
            ? `🎉 เก่งมาก! จับคู่ได้ ${matched.length} คู่ · ${score} คะแนน`
            : `หมดเวลาแล้ว จับคู่ได้ ${matched.length} คู่ — ลองใหม่อีกครั้งนะ`
          : pickL
            ? `เลือก ${left.find((c) => c.key === pickL)?.name ?? ""} แล้ว — หาภาพสีที่เป็นของสิ่งเดียวกันฝั่งขวา`
            : "คลิกภาพขาวดำฝั่งซ้าย 1 ภาพ แล้วคลิกภาพสีฝั่งขวาที่เป็นของสิ่งเดียวกัน"
      }
      progress={{ current: matched.length, total: left.length }}
      done={done}
      onRestart={restart}
      stats={`จับคู่ได้ ${matched.length}/${left.length} คู่ · ${score} คะแนน${bestStreak >= 3 ? ` · ต่อเนื่องสูงสุด ${bestStreak}` : ""}`}
      mistakes={wrongs}
      total={Math.max(1, left.length * 2)}
      hideClock
    >
      {/* แถบสถานะ */}
      <div className="mx-auto mb-3 flex max-w-3xl flex-wrap items-center justify-center gap-2">
        <span className="rounded-full bg-purple-100 px-3 py-1.5 text-[14px] text-purple-800">{lv.emoji} {lv.grade} · {set.emoji} {set.label}</span>
        <span className="rounded-full bg-yellow-soft px-3 py-1.5 font-display text-[15px] text-[#8a6a00]">⭐ {score} คะแนน</span>
        <span className="rounded-full bg-mint-soft px-3 py-1.5 font-display text-[15px] text-[#1f6b4d]">🧩 {matched.length}/{left.length} คู่</span>
        {streak >= 2 && <span className="rounded-full bg-pink-soft px-3 py-1.5 text-[14px] text-[#a8456c]">🔥 ต่อเนื่อง {streak}</span>}
        {lv.seconds > 0 && (
          <span className={cn("rounded-full px-3 py-1.5 font-mono text-[15px]", time <= 10 && !done ? "animate-pulse bg-red-50 text-red-600" : "bg-sky-soft text-purple-800")}>
            ⏱ {mmss(time)}
          </span>
        )}
        <button type="button" onClick={toggleSound} aria-pressed={sound}
          className="tap inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-purple-700 hover:bg-cream">
          {sound ? <Volume2 size={14} /> : <VolumeX size={14} />} {sound ? "เสียง: เปิด" : "เสียง: ปิด"}
        </button>
        <button type="button" onClick={() => { playSfx("pop"); setPhase("menu"); }}
          className="tap rounded-full bg-cream-dark px-3 py-1.5 text-[13px] font-medium text-purple-700 hover:brightness-95">
          ← เปลี่ยนหมวด/ระดับ
        </button>
      </div>

      {/* กระดาน 2 ฝั่ง */}
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:gap-5">
        {/* ฝั่งซ้าย — ภาพขาวดำ */}
        <div>
          <p className="mb-2 text-center text-[14px] font-medium text-purple-700">⬛ ภาพขาวดำ</p>
          <div className="grid grid-cols-2 gap-2">
            {left.map((c) => {
              const ok = matched.includes(c.key);
              return (
                <button
                  key={c.key}
                  type="button"
                  disabled={ok || done}
                  onClick={() => { if (!ok) { setPickL(c.key === pickL ? null : c.key); playSfx("pop"); setMsg(null); } }}
                  aria-label={`ภาพขาวดำ${ok ? " จับคู่แล้ว" : ""}`}
                  aria-pressed={pickL === c.key}
                  className={cn(
                    "card tap grid aspect-square place-items-center p-2 transition",
                    ok ? "border-mint-soft! bg-mint-soft opacity-70" : pickL === c.key ? "scale-105 border-purple-500! shadow-lift" : "hover:scale-105",
                  )}
                >
                  <span className="emoji-gray text-[clamp(1.8rem,9vw,3rem)] leading-none">{c.emoji}</span>
                  {ok && <span className="text-[11px] text-[#1f6b4d]">✅ {c.name}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* ฝั่งขวา — ภาพสี */}
        <div>
          <p className="mb-2 text-center text-[14px] font-medium text-purple-700">🎨 ภาพสี</p>
          <div className="grid grid-cols-2 gap-2">
            {right.map((c) => {
              const ok = !c.decoy && matched.includes(c.key);
              return (
                <button
                  key={c.key}
                  type="button"
                  disabled={ok || done}
                  onClick={() => clickRight(c)}
                  aria-label={ok ? `${c.name} จับคู่แล้ว` : "ภาพสีให้เลือก"}
                  className={cn(
                    "card tap grid aspect-square place-items-center p-2 transition",
                    ok ? "border-mint-soft! bg-mint-soft opacity-70"
                      : wrongKey === c.key ? "border-pink-accent! bg-pink-soft"
                      : pickL ? "hover:scale-105 hover:border-purple-300" : "",
                  )}
                >
                  <span className="text-[clamp(1.8rem,9vw,3rem)] leading-none">{c.emoji}</span>
                  {ok && <span className="text-[11px] text-[#1f6b4d]">✅</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {msg && (
        <p role="status" className="animate-rise mx-auto mt-3 max-w-lg rounded-2xl bg-white px-4 py-2.5 text-center text-[15px] leading-snug text-purple-800 shadow-soft">
          {msg}
        </p>
      )}

      {/* ชื่อภาพที่จับคู่ได้ — ได้คำศัพท์ไปด้วย */}
      {matched.length > 0 && (
        <div className="mx-auto mt-4 max-w-3xl rounded-2xl bg-cream p-3">
          <p className="mb-1.5 text-center text-[13px] text-ink-soft">🗣️ ภาพที่จับคู่ได้แล้ว — กดฟังเสียงอ่านได้</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {matched.map((k) => {
              const c = left.find((x) => x.key === k);
              if (!c) return null;
              return (
                <span key={k} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[14px] text-purple-800">
                  {c.emoji} {c.name}
                  <SpeakButton text={`${c.name} ${c.nameEn}`} size="sm" label="" />
                </span>
              );
            })}
          </div>
        </div>
      )}

      <p className="mt-3 text-center text-[13px] leading-relaxed text-ink-soft">
        ⬛ ภาพขาวดำบอกแค่รูปร่างกับแสงเงา ไม่บอกสี — ต้องดูเค้าโครงให้ดี
        {lv.decoys > 0 && <><br />ระดับนี้มีภาพลวงที่ไม่มีคู่ปนอยู่ {lv.decoys} ภาพ ดูให้ดีนะ</>}
      </p>
    </GameShell>
  );
}
