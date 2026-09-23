import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";
import { NEWS_CATEGORIES, sortedNews } from "@/data/news";

/** 📢 ประกาศสำคัญ — ข่าวที่ครูปักหมุดไว้ ผู้ปกครองเห็นตั้งแต่หน้าแรก */
export function PinnedNotice() {
  const pinned = sortedNews().filter((n) => n.pinned).slice(0, 2);
  if (pinned.length === 0) return null;
  return (
    <section className="container-page pt-12 pb-10 sm:pt-16 sm:pb-14">
      <div className="grid gap-3 md:grid-cols-2">
        {pinned.map((n, i) => {
          const c = NEWS_CATEGORIES[n.category];
          return (
            <Link
              key={n.id}
              href={`/news/${n.id}`}
              className="animate-rise group flex items-start gap-3 rounded-3xl border-2 border-pink-accent bg-pink-soft p-4 shadow-soft transition hover:brightness-[0.97] sm:p-5"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/85 text-[#a8456c]">
                <Megaphone size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-1.5 text-[12px]">
                  <span className="rounded-full bg-white/85 px-2.5 py-0.5 font-medium text-[#a8456c]">📌 ประกาศสำคัญ</span>
                  <span className="text-ink-soft">{c.emoji} {c.label} · {n.dateLabel}</span>
                </span>
                <span className="mt-1 block font-display text-[17px] leading-snug text-purple-800 sm:text-[18px]">{n.title}</span>
                <span className="mt-1 line-clamp-2 block text-[14px] leading-relaxed text-ink">{n.summary}</span>
              </span>
              <ArrowRight size={18} className="shrink-0 self-center text-[#a8456c] transition group-hover:translate-x-1" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
