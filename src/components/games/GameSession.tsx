"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Game } from "@/types";
import { cn } from "@/lib/cn";
import { LEVELS, applyDifficulty, levelOf, type Difficulty } from "@/lib/game-levels";
import { GAME_EVENT, addResult, bestStars, fixedLevel, resultsOf, suggestLevel } from "@/lib/game-store";
import { Avatar } from "@/components/profile/Avatar";
import { listOffline } from "@/lib/offline";
import { PLAYER_EVENT, bandForAge, getCurrentPlayer, setCurrentPlayer, touchPlayer, type PlayerProfile } from "@/lib/players";
import { PlayerPicker } from "./PlayerPicker";
import { GamePlayer } from "./GamePlayer";
import type { GameOutcome } from "./GameShell";

/**
 * รอบการเล่น 1 เกม: ชื่อผู้เล่น → เลือกระดับ (หรือครูกำหนด) → เล่น → บันทึกผล → แนะนำปรับระดับอัตโนมัติ
 * ไม่มีการจัดอันดับ — แสดงเฉพาะพัฒนาการของเด็กคนนั้น
 */
export function GameSession({ game }: { game: Game }) {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const player = profile?.name ?? "";
  const [level, setLevel] = useState<Difficulty | null>(null);
  const [runKey, setRunKey] = useState(0);
  const [tick, setTick] = useState(0);
  const [suggest, setSuggest] = useState<{ to: Difficulty; text: string } | null>(null);
  const [last, setLast] = useState<GameOutcome | null>(null);

  useEffect(() => { setProfile(getCurrentPlayer()); const l = () => setTick((t) => t + 1); const pl = () => setProfile(getCurrentPlayer()); window.addEventListener(GAME_EVENT, l); window.addEventListener(PLAYER_EVENT, pl); return () => { window.removeEventListener(GAME_EVENT, l); window.removeEventListener(PLAYER_EVENT, pl); }; }, []);
  const fixed = useMemo(() => (player ? fixedLevel(player, game.id) : null), [player, game.id, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (level) return; if (fixed) setLevel(fixed.level); else { const o = listOffline().find((g) => g.gameId === game.id); if (o?.level) setLevel(o.level); } }, [fixed, level, game.id]);

  const prepared = useMemo(() => (level ? applyDifficulty(game.config, level) : null), [game.config, level]);
  const history = player ? resultsOf(player, game.id) : [];

  const onDone = (o: GameOutcome) => {
    if (!level) return;
    setLast(o);
    addResult({ gameId: game.id, player: player || "หนู", level, stars: o.stars, mistakes: o.mistakes, total: o.total, seconds: o.seconds, timeUp: o.timeUp });
    if (profile) touchPlayer(profile.id);
    setSuggest(suggestLevel(player || "หนู", game.id, level));
  };
  const play = (l: Difficulty) => { setLevel(l); setSuggest(null); setLast(null); setRunKey((k) => k + 1); };

  /* ---- 1) โปรไฟล์ผู้เล่น (หลายคนต่อครอบครัว) ---- */
  if (!profile) return <PlayerPicker emoji={game.emoji} onPick={setProfile} />;
  const band = bandForAge(profile.age);

  /* ---- 2) เลือกระดับ ---- */
  if (!level || !prepared) {
    return (
      <div className="card p-5 sm:p-8">
        <div className="flex items-center gap-3"><Avatar name={player} size={40} /><div><p className="font-display text-[16px] text-purple-800">สวัสดี {player} 👋 <span className="text-[12px] font-normal text-ink-soft">{profile.age} ปี · {band.emoji} {band.label}</span></p><p className="text-[12px] text-ink-soft"><button type="button" onClick={() => { setCurrentPlayer(null); setProfile(null); }} className="underline">เปลี่ยนผู้เล่น</button></p></div></div>
        <h2 className="mt-4 text-center text-xl">🎮 เลือกระดับเกม</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {LEVELS.map((l) => {
            const info = applyDifficulty(game.config, l.id).info; const best = bestStars(player, game.id, l.id);
            return (
              <button key={l.id} type="button" onClick={() => play(l.id)} className={cn("tap rounded-2xl border-2 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lift", l.cls)}>
                <span className="text-[22px]">{l.emoji}</span>
                <span className="block font-display text-[18px]">{l.label} <span className="text-[12px] font-normal opacity-70">{l.en}</span></span>
                <span className="block text-[12px] opacity-80">{l.hint}</span>
                <span className="mt-2 block text-[12px]">📝 {info.note}{info.timeLimit ? ` · ⏱ ${Math.round(info.timeLimit / 60 * 10) / 10} นาที` : ""}</span>
                {best > 0 && <span className="mt-1 block text-[13px]">ดีที่สุด {"⭐".repeat(best)}</span>}
              </button>
            );
          })}
        </div>
        {fixed && <p className="mt-3 rounded-xl bg-purple-50 px-3 py-2 text-center text-[13px] text-purple-800">👩‍🏫 ครูกำหนดระดับ <b>{levelOf(fixed.level).label}</b> สำหรับ{fixed.by === "child" ? player : "ห้องนี้"} — กดเริ่มได้เลย หรือเลือกระดับอื่นเพื่อลองเล่น</p>}
        {history.length > 0 && <p className="mt-3 text-center text-[12px] text-ink-soft">เล่นเกมนี้แล้ว {history.length} ครั้ง</p>}
      </div>
    );
  }

  /* ---- 3) เล่น ---- */
  const lv = levelOf(level);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-[13px]">
        <Avatar name={player} size={28} /><span>{player}</span>
        <span className={cn("rounded-full border px-2.5 py-0.5", lv.cls)}>{lv.emoji} {lv.label}</span>
        <span className="text-ink-soft">{prepared.info.note}</span>
        <button type="button" onClick={() => setLevel(null)} className="ml-auto rounded-full border border-line bg-white px-3 py-1 text-purple-700 hover:bg-purple-50">เปลี่ยนระดับ</button>
      </div>
      <GamePlayer key={`${level}-${runKey}`} config={prepared.config} extras={{ timeLimit: prepared.info.timeLimit, hints: prepared.info.hints, scramble: prepared.info.scramble, level, onDone }} />
      {last && (
        <div className="card flex flex-wrap items-center gap-3 p-3 text-[13px]">
          <span>📊 บันทึกผลแล้ว: {lv.label} {"⭐".repeat(last.stars)} · {last.seconds} วินาที</span>
          {suggest && <button type="button" onClick={() => play(suggest.to)} className="tap rounded-full bg-purple-600 px-4 py-1.5 font-medium text-white">{suggest.text} → ไปเลย</button>}
          <Link href="/games/progress" className="ml-auto text-purple-700 underline">ดูพัฒนาการ</Link>
        </div>
      )}
    </div>
  );
}
