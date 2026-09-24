import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CalendarDays } from "lucide-react";
import { EVENT_CATEGORIES, SCHOOL_EVENTS } from "@/data/school-events";
import { PageHeader, Tag } from "@/components/ui";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "กิจกรรมโรงเรียน" };

export default function SchoolEventsPage() {
  const events = [...SCHOOL_EVENTS].sort((a, b) => b.date.localeCompare(a.date));
  const cats = Object.entries(EVENT_CATEGORIES);
  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader emoji="🎉" title="กิจกรรมโรงเรียน" description="รวมกิจกรรมที่เกิดขึ้นในโรงเรียน ศิลปะ ปลูกต้นไม้ โครงการ เทศกาล กิจกรรมกับผู้ปกครอง และกลางแจ้ง">
        <div className="flex flex-wrap gap-2">
          {cats.map(([k, c]) => <Tag key={k} tone="purple">{c.emoji} {c.label}</Tag>)}
          <Link href="/gallery/photos" className="inline-flex items-center rounded-full bg-sky-soft px-3 py-0.5 text-[13px] font-medium leading-6 text-[#2b5c8a] hover:underline">📷 คลังภาพกิจกรรม</Link>
        </div>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e, i) => {
          const c = EVENT_CATEGORIES[e.category];
          return (
            <Link key={e.id} href={`/school-events/${e.id}`} className="card card-hover animate-rise group flex flex-col overflow-hidden" style={{ animationDelay: `${i * 60}ms` }}>
              {e.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.image} alt={e.title} className="aspect-[16/10] w-full object-cover" />
              ) : (
                <div className={cn("grid aspect-[16/10] place-items-center overflow-hidden text-6xl transition-transform group-hover:scale-105", c.tint)}>
                  {e.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.icon} alt="" className="h-[74%]! w-auto object-contain" />
                  ) : (
                    e.emoji
                  )}
                </div>
              )}
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <p className="text-[13px] font-medium text-purple-500">{c.emoji} {c.label}</p>
                <h2 className="text-lg leading-snug sm:text-xl">{e.title}</h2>
                <p className="mt-1 inline-flex items-center gap-1 text-[13px] text-ink-soft"><CalendarDays size={13} /> {e.dateLabel}</p>
                <p className="mt-2 flex-1 text-[14px] text-ink-soft">{e.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[14px] font-medium text-purple-600">ดูรายละเอียด <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
