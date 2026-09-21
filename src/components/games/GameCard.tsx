import Link from "next/link";
import { Play } from "lucide-react";
import type { Game } from "@/types";
import { GAME_CATEGORIES } from "@/data/games";
import { getPlan } from "@/data/plans";
import { Tag } from "@/components/ui";
import { cn } from "@/lib/cn";

/** การ์ดเกม: รูป/ชื่อ/คำอธิบาย/ทักษะ/เริ่มเล่น */
export function GameCard({ game, className, style }: { game: Game; className?: string; style?: React.CSSProperties }) {
  const cat = GAME_CATEGORIES[game.category];
  const plans = game.planIds.map(getPlan).filter((p) => p !== undefined);
  return (
    <article className={cn("card card-hover group flex flex-col overflow-hidden", className)} style={style}>
      <Link href={`/games/${game.id}`} className={cn("grid h-36 place-items-center text-7xl transition-transform group-hover:scale-105 sm:h-40", game.cover)} aria-label={`เล่น ${game.title}`}>
        <span className="drop-shadow-sm">{game.emoji}</span>
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-[13px] font-medium text-purple-500">{cat.emoji} {cat.label}</p>
        <h2 className="text-lg sm:text-xl">{game.title}</h2>
        <p className="mt-1 flex-1 text-[15px] text-ink-soft">{game.description}</p>
        <p className="mt-3 text-[13px] font-medium text-purple-700">🎯 ทักษะที่ได้ฝึก</p>
        <div className="mt-1 flex flex-wrap gap-1.5">{game.skills.map((s) => <Tag key={s} tone="mint">{s}</Tag>)}</div>
        {plans.length > 0 && (
          <p className="mt-2 truncate text-[13px] text-ink-soft">📖 {plans.map((p) => p.title).join(" · ")}</p>
        )}
        <Link href={`/games/${game.id}`} className="tap mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-base font-medium text-white shadow-soft transition hover:bg-purple-700">
          <Play size={18} fill="currentColor" /> เริ่มเล่น
        </Link>
      </div>
    </article>
  );
}
