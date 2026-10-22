"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { GameShell, shuffle, type GameOutcome } from "@/components/games/GameShell";
import { SpeakButton } from "@/components/ui/SpeakButton";
import {
  DECOYS, DRESS_LEVELS, DRESS_SCORE, findDressLevel, jobsOfTier,
  type DressItem, type DressLevel, type Job,
} from "@/data/dress-jobs";
import { playSfx, setSfxOn, sfxOn } from "@/lib/sfx";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;

interface Round {
  job: Job;
  /** ของที่ต้องเลือกในรอบนี้ */
  need: DressItem[];
  /** ของทั้งหมดในถาด (ของจริง + ของหลอก) สลับแล้ว */
  tray: DressItem[];
  /** โจทย์สถานการณ์ (ถ้ามี) */
  situation?: string;
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;
const keyOf = (it: DressItem) => `${it.emoji}|${it.label}`;

/**
 * 👩‍🚒 แต่งตัวตามอาชีพ
 *
 * เลือกของที่คนทำอาชีพนั้นใช้จริงให้ครบ — คลิกเลือกได้เลย ไม่ต้องลากก็ได้
 * ระดับสูงขึ้นจะมีของหลอกเยอะขึ้น และมีโหมดแต่งตามสถานการณ์ เช่น หมอกำลังจะเข้าห้องผ่าตัด
 */
export function DressUpProGame({ levelId, onDone }: { levelId?: string; onDone?: Cb }) {
  const [phase, setPhase] = useState<"menu" | "play" | "over">("menu");
  const [lv, setLv] = useState<DressLevel>(() => findDressLevel(levelId ?? "k1"));

  const [rounds, setRounds] = useState<Round[]>([]);
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [wrongs, setWrongs] = useState(0);
  const [time, setTime] = useState(0);
  const [msg, setMsg] = useState<{ text: string; tone: "good" | "oops" } | null>(null);
  const [sound, setSound] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => { setReady(true); setSound(sfxOn()); }, []);

  /* ---------- สร้างรอบ ---------- */
  const build = useCallback((L: DressLevel) => {
    const pool = shuffle(jobsOfTier(L.tier));
    const made: Round[] = [];
    for (let i = 0; i < Math.min(L.jobs, pool.length); i++) {
      const job = pool[i];
      /* โหมดสถานการณ์ — ใช้เมื่อระดับเปิดไว้และอาชีพนั้นมีโจทย์ */
      const sit = L.situation && job.situations?.length
        ? job.situations[Math.floor(Math.random() * job.situations.length)]
        : null;

      const need = sit ? sit.need : job.items.slice(0, Math.min(L.need, job.items.length));

      /* ของหลอก — ครึ่งหนึ่งเป็นของจากอาชีพอื่น (คล้ายของจริง) อีกครึ่งเป็นของที่ไม่เกี่ยวเลย */
      const otherStuff = shuffle(
        jobsOfTier(L.tier)
          .filter((j) => j.id !== job.id)
          .flatMap((j) => j.items)
          .filter((it) => !need.some((n) => n.emoji === it.emoji)),
      );
      const silly = shuffle(DECOYS).filter((d) => !need.some((n) => n.emoji === d.emoji));
      const half = Math.ceil(L.decoys / 2);
      const fakes: DressItem[] = [];
      const seen = new Set(need.map((n) => n.emoji));
      for (const it of [...otherStuff.slice(0, half), ...silly.slice(0, L.decoys - half)]) {
        if (seen.has(it.emoji)) continue;
        seen.add(it.emoji);
        fakes.push(it);
      }

      made.push({ job, need, tray: shuffle([...need, ...fakes]), situation: sit?.title });
    }
    setRounds(made);
    setAt(0); setPicked([]); setWrongKey(null);
    setScore(0); setWrongs(0); setTime(L.seconds);
    setMsg(null);
  }, []);

  const start = (L: DressLevel) => { setLv(L); build(L); setPhase("play"); playSfx("pop"); };
  const restart = useCallback(() => { if (phase === "menu") return; build(lv); setPhase("play"); }, [build, lv, phase]);

  /* ---------- นาฬิกา ---------- */
  useEffect(() => {
    if (phase !== "play" || lv.seconds === 0) return;
    const t = setInterval(() => setTime((v) => { if (v <= 1) { setPhase("over"); return 0; } return v - 1; }), 1000);
    return () => clearInterval(t);
  }, [phase, lv.seconds]);

  /* ---------- รายงานผล ---------- */
  const reported = useRef(false);
  const totalNeed = rounds.reduce((n, r) => n + r.need.length, 0);
  useEffect(() => {
    if (phase !== "over" || reported.current) return;
    reported.current = true;
    const doneCount = rounds.slice(0, at).reduce((n, r) => n + r.need.length, 0) + picked.length;
    onDone?.({
      mistakes: Math.max(0, totalNeed - doneCount) + Math.min(wrongs, totalNeed),
      total: Math.max(1, totalNeed * 2),
      seconds: lv.seconds - time,
      timeUp: lv.seconds > 0 && time === 0,
      stars: 0,
    });
  }, [phase, rounds, at, picked.length, wrongs, totalNeed, lv.seconds, time, onDone]);
  useEffect(() => { if (phase === "play") reported.current = false; }, [phase]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2000);
    return () => clearTimeout(t);
  }, [msg]);

  const round = rounds[at];

  /* ---------- เลือกของ ---------- */
  const pick = (it: DressItem) => {
    if (phase !== "play" || !round) return;
    const k = keyOf(it);
    if (picked.includes(k)) return;

    const isRight = round.need.some((n) => n.emoji === it.emoji);
    if (!isRight) {
      setWrongs((n) => n + 1);
      setWrongKey(k);
      setTimeout(() => setWrongKey(null), 500);
      playSfx("wrong");
      if (lv.id !== "k1") setScore((s) => Math.max(0, s + DRESS_SCORE.wrong));
      setMsg({ text: `${it.emoji} ${it.label} ไม่ใช่ของที่${round.job.name}ใช้นะ ลองดูชิ้นอื่น`, tone: "oops" });
      return;
    }

    const next = [...picked, k];
    setPicked(next);
    setScore((s) => s + DRESS_SCORE.right);
    playSfx("correct");

    if (next.length >= round.need.length) {
      /* แต่งครบอาชีพนี้แล้ว */
      playSfx("win");
      setScore((s) => s + DRESS_SCORE.jobBonus);
      setMsg({ text: `🎉 แต่งตัวเป็น${round.job.name}ครบแล้ว! +${DRESS_SCORE.jobBonus} คะแนนโบนัส`, tone: "good" });
      setTimeout(() => {
        if (at + 1 >= rounds.length) {
          if (lv.seconds > 0) setScore((s) => s + time * DRESS_SCORE.speedBonus);
          setPhase("over");
        } else {
          setAt((i) => i + 1);
          setPicked([]);
        }
      }, 1200);
    } else {
      setMsg({ text: `✅ ${it.label} ถูกต้อง! เหลืออีก ${round.need.length - next.length} ชิ้น`, tone: "good" });
    }
  };

  const toggleSound = () => { const on = !sound; setSound(on); setSfxOn(on); if (on) playSfx("pop"); };

  if (!ready) return null;

  /* ───────────── เมนูเลือกระดับ ───────────── */
  if (phase === "menu") {
    return (
      <GameShell instruction="เลือกระดับตามชั้นของเด็ก แล้วเริ่มเล่นได้เลย" done={false} onRestart={() => setPhase("menu")} mistakes={0} total={1} hideClock>
        <div className="mx-auto grid max-w-2xl gap-2">
          {DRESS_LEVELS.map((L) => (
            <button key={L.id} type="button" onClick={() => start(L)}
              className="tap rounded-2xl bg-cream px-3.5 py-3 text-left hover:bg-purple-50">
              <span className="block text-[15px] text-purple-800">
                {L.emoji} {L.grade} <span className="text-[13px] text-ink-soft">· {L.ages} · {L.label}</span>
              </span>
              <span className="block text-[12px] leading-snug text-ink-soft">{L.about}</span>
              <span className="mt-0.5 block text-[12px] text-purple-700">
                {L.jobs} อาชีพ · เลือก {L.need} ชิ้น · ของหลอก {L.decoys} ชิ้น · {L.seconds > 0 ? `${L.seconds} วินาที` : "ไม่จำกัดเวลา"}
                {L.situation ? " · มีโหมดแต่งตามสถานการณ์" : ""}
              </span>
            </button>
          ))}
          <p className="mt-1 rounded-2xl bg-cream px-3.5 py-2.5 text-[13px] leading-snug text-ink-soft">
            💡 ของหลอกครึ่งหนึ่งเป็นของจากอาชีพอื่นที่ดูคล้ายกัน อีกครึ่งเป็นของที่ไม่เกี่ยวเลย เด็กจึงต้องคิดจริง ๆ ไม่ใช่เดา
          </p>
        </div>
      </GameShell>
    );
  }

  if (!round) return null;

  const done = phase === "over";
  const left = round.need.length - picked.length;

  return (
    <GameShell
      instruction={
        done ? `🎉 จบรอบแล้ว! ได้ ${score} คะแนน`
          : round.situation
            ? round.situation
            : `แต่งตัวให้เป็น ${round.job.emoji} ${round.job.name} — เลือกของที่${round.job.name}ใช้ ${round.need.length} ชิ้น`
      }
      progress={{ current: at, total: rounds.length }}
      done={done}
      onRestart={restart}
      stats={`${score} คะแนน · อาชีพที่ ${Math.min(at + 1, rounds.length)}/${rounds.length}${wrongs ? ` · เลือกผิด ${wrongs} ครั้ง` : ""}`}
      mistakes={wrongs}
      total={Math.max(1, totalNeed * 2)}
      hideClock
    >
      {/* แถบสถานะ */}
      <div className="mx-auto mb-3 flex max-w-3xl flex-wrap items-center justify-center gap-2">
        <span className="rounded-full bg-purple-100 px-3 py-1.5 text-[14px] text-purple-800">{lv.emoji} {lv.grade}</span>
        <span className="rounded-full bg-yellow-soft px-3 py-1.5 font-display text-[15px] text-[#8a6a00]">⭐ {score} คะแนน</span>
        <span className="rounded-full bg-mint-soft px-3 py-1.5 font-display text-[15px] text-[#1f6b4d]">👔 อาชีพที่ {at + 1}/{rounds.length}</span>
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
          ← เปลี่ยนระดับ
        </button>
      </div>

      {/* ตัวละคร + ของที่ใส่แล้ว */}
      <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-b from-sky-soft to-cream p-4 text-center shadow-soft ring-1 ring-line">
        <div className="flex items-center justify-center gap-2">
          <p className="font-display text-xl text-purple-800">{round.job.emoji} {round.job.name}</p>
          <SpeakButton text={`${round.job.name} ${round.job.nameEn} — ${round.job.about}`} size="sm" label="" />
        </div>
        <p className="text-[13px] text-ink-soft">{round.job.about}</p>
        {round.situation && (
          <p className="mx-auto mt-2 max-w-md rounded-2xl bg-yellow-soft px-3 py-2 text-[14px] leading-snug text-[#8a6a00]">
            🎬 สถานการณ์: {round.situation}
          </p>
        )}

        {/* ช่องใส่ของ */}
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {round.need.map((n, i) => {
            const on = picked.includes(keyOf(n));
            return (
              <div key={i}
                className={cn(
                  "grid size-[4.5rem] place-items-center rounded-2xl border-2 border-dashed transition sm:size-20",
                  on ? "animate-rise border-mint-soft! border-solid bg-mint-soft" : "border-purple-200 bg-white/70",
                )}
              >
                {on ? (
                  <>
                    <span className="text-3xl leading-none">{n.emoji}</span>
                    <span className="px-0.5 text-center text-[10px] leading-tight text-[#1f6b4d]">{n.label}</span>
                  </>
                ) : (
                  <span className="text-2xl leading-none text-purple-300">?</span>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[14px] text-purple-700">
          {left > 0 ? `เหลืออีก ${left} ชิ้น` : "ครบแล้ว!"}
        </p>
      </div>

      {msg && (
        <p role="status"
          className={cn("animate-rise mx-auto mt-3 max-w-lg rounded-2xl px-4 py-2.5 text-center text-[15px] leading-snug",
            msg.tone === "good" ? "bg-mint-soft text-[#1f6b4d]" : "bg-yellow-soft text-[#8a6a00]")}>
          {msg.text}
        </p>
      )}

      {/* ถาดของ */}
      <p className="mb-2 mt-4 text-center text-[14px] text-ink-soft">
        🧰 เลือกของจากถาดนี้ — คลิกได้เลย · มีของหลอกปนอยู่ {lv.decoys} ชิ้น
      </p>
      <div className="mx-auto grid max-w-3xl grid-cols-4 gap-2 sm:grid-cols-6">
        {round.tray.map((it, i) => {
          const k = keyOf(it);
          const used = picked.includes(k);
          return (
            <button
              key={`${k}-${i}`}
              type="button"
              disabled={used || done}
              onClick={() => pick(it)}
              aria-label={it.label}
              className={cn(
                "card tap grid aspect-square place-items-center p-1.5 transition",
                used ? "border-mint-soft! bg-mint-soft opacity-40"
                  : wrongKey === k ? "border-pink-accent! bg-pink-soft"
                  : "hover:scale-105 hover:border-purple-300",
              )}
            >
              <span className="text-[clamp(1.5rem,7vw,2.2rem)] leading-none">{it.emoji}</span>
              <span className="px-0.5 text-center text-[10px] leading-tight text-ink-soft">{it.label}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-[13px] leading-relaxed text-ink-soft">
        คิดดูว่าของชิ้นนี้ <b>{round.job.name}</b> ใช้ทำงานจริงไหม
        <br />เลือกผิดไม่เป็นไรนะ แค่ลองใหม่ ของจะยังอยู่ในถาดเหมือนเดิม
      </p>
    </GameShell>
  );
}
