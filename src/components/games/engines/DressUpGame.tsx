"use client";

import { useCallback, useEffect, useState } from "react";
import { GameShell, shuffle, type GameOutcome } from "@/components/games/GameShell";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;

export interface Job {
  emoji: string;
  name: string;
  nameEn: string;
  /** ของที่ใช่ของอาชีพนี้ */
  items: { emoji: string; label: string }[];
  /** ประโยคอธิบายหลังแต่งเสร็จ */
  about: string;
}

/**
 * 👩‍⚕️ เกมแต่งตัวตามอาชีพ — เลือกของให้ตรงกับอาชีพที่โจทย์บอก
 * ของที่ไม่เกี่ยวจะปนมาด้วย เด็กต้องคิดว่าอาชีพนี้ใช้อะไรบ้าง
 */
export function DressUpGame({ jobs, pickCount = 3, decoys = 5, timeLimit, onDone }: {
  jobs: Job[]; pickCount?: number; decoys?: number; timeLimit?: number; onDone?: Cb;
}) {
  const [i, setI] = useState(0);
  const [tray, setTray] = useState<{ emoji: string; label: string; ok: boolean }[]>([]);
  const [worn, setWorn] = useState<string[]>([]);
  const [wrongs, setWrongs] = useState(0);
  const [bad, setBad] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const job = jobs[i];

  const load = useCallback((idx: number) => {
    const j = jobs[idx];
    if (!j) return;
    const right = j.items.slice(0, pickCount).map((x) => ({ ...x, ok: true }));
    // ของหลอก = ของของอาชีพอื่น
    const others = jobs.filter((_, k) => k !== idx).flatMap((o) => o.items);
    const wrong = shuffle(others).filter((o) => !right.some((r) => r.emoji === o.emoji))
      .slice(0, decoys).map((x) => ({ ...x, ok: false }));
    setTray(shuffle([...right, ...wrong]));
    setWorn([]); setBad(null);
  }, [jobs, pickCount, decoys]);

  const restart = useCallback(() => { setI(0); setWrongs(0); setDone(false); load(0); }, [load]);
  useEffect(() => { restart(); }, [restart]);

  if (!job || tray.length === 0) return null;

  const need = Math.min(pickCount, job.items.length);
  const got = worn.length;

  const take = (emoji: string) => {
    if (done) return;
    const it = tray.find((t) => t.emoji === emoji);
    if (!it || worn.includes(emoji)) return;
    if (!it.ok) {
      setWrongs((w) => w + 1);
      setBad(emoji);
      setTimeout(() => setBad(null), 650);
      return;
    }
    const next = [...worn, emoji];
    setWorn(next);
    if (next.length >= need) {
      setTimeout(() => {
        if (i + 1 >= jobs.length) setDone(true);
        else { setI(i + 1); load(i + 1); }
      }, 1400);
    }
  };

  const remove = (emoji: string) => !done && setWorn((w) => w.filter((x) => x !== emoji));
  const finished = got >= need;

  return (
    <GameShell
      instruction={
        done ? "🎉 เก่งมาก! แต่งตัวครบทุกอาชีพแล้ว"
          : finished ? `✅ ครบแล้ว! ${job.about}`
          : `แต่งตัวให้ “${job.name}” — เลือกของที่ใช่ ${need} อย่าง (ได้แล้ว ${got})`
      }
      progress={{ current: done ? jobs.length : i, total: jobs.length }}
      done={done}
      onRestart={restart}
      stats={wrongs === 0 ? "ยังไม่หยิบผิดเลย!" : `หยิบผิด ${wrongs} ครั้ง`}
      mistakes={wrongs}
      total={jobs.length * need}
      timeLimit={timeLimit}
      onDone={onDone}
    >
      {/* ตัวละครอาชีพ */}
      <div className="card mx-auto mb-4 max-w-md p-5 text-center">
        <p className="text-[clamp(3.5rem,18vw,5.5rem)] leading-none">{job.emoji}</p>
        <p className="mt-1 font-display text-xl text-purple-800">{job.name}</p>
        <p className="text-[14px] text-purple-500">{job.nameEn}</p>

        {/* ของที่ใส่ไปแล้ว */}
        <div className="mt-3 flex min-h-[3.5rem] flex-wrap items-center justify-center gap-2 rounded-2xl bg-mint-soft px-3 py-2">
          {worn.length === 0
            ? <span className="text-[14px] text-ink-soft">ยังไม่ได้เลือกของเลย</span>
            : worn.map((e) => {
              const it = tray.find((t) => t.emoji === e);
              return (
                <button key={e} type="button" onClick={() => remove(e)}
                  aria-label={`${it?.label ?? e} — แตะเพื่อเอาออก`}
                  className="tap flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 text-[15px] shadow-soft hover:brightness-95">
                  <span className="text-[clamp(1.2rem,5vw,1.6rem)] leading-none">{e}</span>
                  <span className="text-[13px] text-purple-800">{it?.label}</span>
                </button>
              );
            })}
        </div>
        {worn.length > 0 && !finished && <p className="mt-1 text-[12px] text-ink-soft">แตะของที่ใส่ไว้เพื่อเอาออกได้</p>}
      </div>

      {/* ถาดของ */}
      <p className="mb-2 text-center text-[14px] text-ink-soft">👕 เลือกของที่ {job.name} ต้องใช้</p>
      <div className="mx-auto grid max-w-2xl grid-cols-4 gap-2 sm:grid-cols-8">
        {tray.map((t) => {
          const used = worn.includes(t.emoji);
          return (
            <button
              key={t.emoji}
              type="button"
              onClick={() => take(t.emoji)}
              disabled={used}
              aria-label={t.label}
              className={cn(
                "tap flex aspect-square flex-col items-center justify-center gap-0.5 rounded-2xl border-2 bg-white p-1 transition",
                used ? "border-mint-soft! bg-mint-soft opacity-60"
                  : bad === t.emoji ? "border-pink-accent! bg-pink-soft"
                  : "border-line hover:scale-105 hover:bg-cream",
              )}
            >
              <span className="text-[clamp(1.4rem,6vw,2rem)] leading-none">{t.emoji}</span>
              <span className="text-[10px] leading-tight text-ink-soft">{t.label}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-[13px] leading-relaxed text-ink-soft">
        ของบางอย่างเป็นของอาชีพอื่นที่ปนมา — คิดก่อนว่าอาชีพนี้ใช้อะไรบ้าง
      </p>
    </GameShell>
  );
}
