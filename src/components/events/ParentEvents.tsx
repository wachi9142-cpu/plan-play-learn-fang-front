import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { EVENT_CATEGORIES, EVENT_STATUS, daysUntil, eventStatus, prepareSoon, upcomingEvents, type SchoolEvent } from "@/data/school-events";
import { cn } from "@/lib/cn";

/**
 * ⭐📅 กิจกรรมที่กำลังจะมาถึง — ข้อมูลครบสำหรับผู้ปกครอง
 * ชื่อ · วันที่ · เวลา · สถานที่ · ระดับชั้น · รายละเอียด · สิ่งที่ต้องเตรียม · กำหนดเตรียม
 */
export function UpcomingEvents({ limit = 3 }: { limit?: number }) {
  const events = upcomingEvents(limit);
  if (events.length === 0) return null;
  return (
    <section className="container-page pb-12 sm:pb-16">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl leading-normal sm:text-3xl">⭐ 📅 กิจกรรมที่กำลังจะมาถึง</h2>
          <p className="mt-1 text-[14px] text-ink-soft sm:text-[15px]">ดูล่วงหน้าว่าต้องเตรียมอะไรให้ลูกบ้าง จะได้ไม่ต้องรีบ 💜</p>
        </div>
        <Link href="/school-events" className="tap hidden shrink-0 items-center gap-1 text-[15px] font-medium text-purple-700 hover:underline sm:inline-flex">
          ดูกิจกรรมทั้งหมด <ArrowRight size={16} />
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {events.map((e, i) => <EventCard key={e.id} event={e} delay={i * 70} />)}
      </div>
      <Link href="/school-events" className="tap mt-4 inline-flex items-center gap-1 text-[15px] font-medium text-purple-700 hover:underline sm:hidden">
        ดูกิจกรรมทั้งหมด <ArrowRight size={16} />
      </Link>
    </section>
  );
}

export function EventCard({ event: e, delay = 0 }: { event: SchoolEvent; delay?: number }) {
  const cat = EVENT_CATEGORIES[e.category];
  const st = EVENT_STATUS[eventStatus(e)];
  const left = daysUntil(e.date);
  const needs = (e.prepare?.length ?? 0) > 0;
  const urgent = needs && left <= 3;

  return (
    <article className={cn("card animate-rise flex flex-col p-5", urgent && "border-yellow-accent! ring-2 ring-yellow-soft")} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start gap-3">
        <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl text-2xl", cat.tint)}>{e.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-medium", st.tint, st.text)}>{st.emoji} {st.label}</span>
            <span className="text-[12px] text-ink-soft">{left === 0 ? "วันนี้" : `อีก ${left} วัน`}</span>
          </div>
          <h3 className="mt-1 font-display text-[18px] leading-snug text-purple-800">{e.title}</h3>
        </div>
      </div>

      <dl className="mt-3 grid gap-1.5 text-[13px] text-ink-soft">
        <div className="flex items-center gap-2"><CalendarDays size={15} className="shrink-0 text-purple-400" /><span>{e.dateLabel}</span></div>
        {e.time && <div className="flex items-center gap-2"><Clock size={15} className="shrink-0 text-purple-400" /><span>{e.time}</span></div>}
        {e.place && <div className="flex items-center gap-2"><MapPin size={15} className="shrink-0 text-purple-400" /><span>{e.place}</span></div>}
        {e.grades && e.grades.length > 0 && (
          <div className="flex items-start gap-2"><Users size={15} className="mt-0.5 shrink-0 text-purple-400" /><span>{e.grades.join(" · ")}</span></div>
        )}
      </dl>

      <p className="mt-3 line-clamp-3 text-[14px] leading-relaxed text-ink">{e.description}</p>

      <div className={cn("mt-3 rounded-2xl px-4 py-3 text-[13px]", needs ? "bg-yellow-soft" : "bg-mint-soft")}>
        {needs ? (
          <>
            <p className="font-medium text-[#8a6a00]">🎒 สิ่งที่ต้องเตรียม</p>
            <ul className="mt-1 list-inside list-disc leading-relaxed text-ink">
              {e.prepare!.map((p) => <li key={p}>{p}</li>)}
            </ul>
            {e.prepareByLabel && <p className="mt-1.5 font-medium text-[#8a6a00]">⏰ เตรียมให้เสร็จภายใน {e.prepareByLabel}</p>}
          </>
        ) : (
          <p className="text-[#1f6b4d]">✅ ไม่ต้องเตรียมอุปกรณ์เพิ่มเติม</p>
        )}
      </div>

      {e.parentNote && <p className="mt-2 text-[12px] leading-snug text-ink-soft">💬 {e.parentNote}</p>}

      <Link href={`/school-events/${e.id}`} className="tap mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-purple-600 px-5 py-2 text-[14px] font-medium text-white shadow-soft transition hover:bg-purple-700">
        ดูรายละเอียด <ArrowRight size={16} />
      </Link>
    </article>
  );
}

/** 🎒 สรุปสั้น ๆ ว่าช่วงนี้ต้องเตรียมอะไรให้ลูกบ้าง */
export function PrepThisWeek({ days = 10 }: { days?: number }) {
  const items = prepareSoon(days);
  return (
    <section className="container-page pb-12 sm:pb-16">
      <div className="card border-yellow-accent! p-5 sm:p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl leading-normal sm:text-3xl">🎒 สัปดาห์นี้ต้องเตรียมอะไร?</h2>
            <p className="mt-1 text-[14px] text-ink-soft">สรุปของที่ต้องเตรียมให้ลูกใน {days} วันข้างหน้า</p>
          </div>
          <Link href="/school-events" className="tap hidden shrink-0 items-center gap-1 text-[15px] font-medium text-purple-700 hover:underline sm:inline-flex">
            ดูทั้งหมด <ArrowRight size={16} />
          </Link>
        </div>

        {items.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-mint-soft px-4 py-3 text-[14px] text-[#1f6b4d]">
            ✅ ช่วงนี้ยังไม่มีกิจกรรมที่ต้องเตรียมของเพิ่มเติมค่ะ
          </p>
        ) : (
          <ul className="mt-4 grid gap-2.5">
            {items.map((e) => {
              const left = daysUntil(e.date);
              const urgent = left <= 3;
              return (
                <li key={e.id}>
                  <Link href={`/school-events/${e.id}`} className={cn("flex items-start gap-3 rounded-2xl px-4 py-3 transition hover:brightness-95", urgent ? "bg-yellow-soft" : "bg-cream-dark")}>
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/80 text-xl">{e.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="font-display text-[15px] text-purple-800">{e.dateLabel} — {e.title}</span>
                        {urgent && <span className="rounded-full bg-pink-soft px-2 py-0.5 text-[11px] font-medium text-[#a8456c]">⏰ ใกล้ถึงกำหนด</span>}
                      </span>
                      <span className="mt-0.5 block text-[13px] leading-snug text-ink">
                        เตรียม: {e.prepare!.join(" + ")}
                        {e.prepareByLabel && <span className="text-ink-soft"> · ภายใน {e.prepareByLabel}</span>}
                      </span>
                    </span>
                    <ArrowRight size={18} className="shrink-0 self-center text-purple-300" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
