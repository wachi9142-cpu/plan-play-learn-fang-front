import Link from "next/link";
import { NewsIcon } from "@/components/ui/NewsIcon";
import type { Metadata } from "next";
import { ArrowRight, CalendarDays, Pin } from "lucide-react";
import { NEWS_CATEGORIES, sortedNews } from "@/data/news";
import { PageHeader, Tag } from "@/components/ui";

export const metadata: Metadata = { title: "ประชาสัมพันธ์" };

export default function NewsPage() {
  const news = sortedNews();
  return (
    <div className="container-page max-w-4xl py-8 sm:py-12">
      <PageHeader emoji="📣" title="ประชาสัมพันธ์" description="ประกาศ ข่าวสาร และเรื่องแจ้งถึงผู้ปกครอง">
        <Tag tone="purple">{news.length} รายการ</Tag>
      </PageHeader>
      <div className="grid gap-3">
        {news.map((n, i) => {
          const c = NEWS_CATEGORIES[n.category];
          return (
            <Link key={n.id} href={`/news/${n.id}`} className="card card-hover animate-rise group flex gap-4 p-4 sm:p-5" style={{ animationDelay: `${i * 60}ms` }}>
              <NewsIcon emoji={c.emoji} image={c.image} label={c.label} className="size-12 rounded-xl text-2xl" />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-1.5">
                  <Tag tone={c.tone}>{c.label}</Tag>
                  <span className="inline-flex items-center gap-1 text-[13px] text-ink-soft"><CalendarDays size={13} /> {n.dateLabel}</span>
                  {n.pinned && <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#a8456c]"><Pin size={12} /> ปักหมุด</span>}
                </span>
                <span className="mt-1 block font-display text-lg leading-snug text-purple-800">{n.title}</span>
                <span className="mt-1 block text-[14px] text-ink-soft">{n.summary}</span>
              </span>
              <ArrowRight size={18} className="shrink-0 self-center text-purple-300 transition group-hover:translate-x-1 group-hover:text-purple-600" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
