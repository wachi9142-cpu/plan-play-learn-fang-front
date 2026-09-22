"use client";

import { useState } from "react";
import type { Game, GameCategory } from "@/types";
import { GAME_CATEGORIES } from "@/data/games";
import { GameCard } from "@/components/games/GameCard";
import { EmptyState } from "@/components/ui";
import { cn } from "@/lib/cn";
import { AGE_BANDS, bandsForRange, type AgeBandId } from "@/lib/age-bands";
import { getGrade } from "@/data/plans";

/** คลังเกม + กรองตามประเภท */
export function GameLibrary({ games }: { games: Game[] }) {
  const [cat, setCat] = useState<GameCategory | null>(null);
  const [band, setBand] = useState<AgeBandId | null>(null);
  const agesOf = (g: Game) => g.ages ?? getGrade(g.gradeId)?.ages;
  const inBand = (g: Game) => !band || bandsForRange(agesOf(g)).includes(band);
  const cats = (Object.keys(GAME_CATEGORIES) as GameCategory[]).filter((c) => games.some((g) => g.category === c));
  const list = games.filter((g) => (!cat || g.category === cat) && inBand(g));

  return (
    <div>
      <div className="no-scrollbar -mx-4 mb-2 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip active={band === null} onClick={() => setBand(null)}>👶 ทุกวัย</Chip>
        {AGE_BANDS.filter((b) => b.id !== "adult").map((b) => <Chip key={b.id} active={band === b.id} onClick={() => setBand(band === b.id ? null : b.id)}>{b.emoji} {b.label} ({games.filter((g) => bandsForRange(agesOf(g)).includes(b.id)).length})</Chip>)}
      </div>
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip active={cat === null} onClick={() => setCat(null)}>🎮 ทุกเกม ({games.filter(inBand).length})</Chip>
        {cats.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(cat === c ? null : c)}>
            {GAME_CATEGORIES[c].emoji} {GAME_CATEGORIES[c].label} ({games.filter((g) => g.category === c && inBand(g)).length})
          </Chip>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState emoji="🎮" title="ยังไม่มีเกมในหมวดนี้" hint="เกมใหม่กำลังจะมาเร็ว ๆ นี้" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((g, i) => <GameCard key={g.id} game={g} className="animate-rise" style={{ animationDelay: `${i * 60}ms` }} />)}
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "tap shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-[15px] transition-colors",
        active ? "border-purple-600 bg-purple-600 text-white shadow-soft" : "border-line bg-white text-ink hover:border-purple-200 hover:bg-purple-50",
      )}
    >
      {children}
    </button>
  );
}
