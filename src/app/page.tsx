import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NAV_ITEMS, SITE } from "@/lib/site";
import { GRADES, countActivities } from "@/data/plans";
import { LEARNING_ACTIVITIES, TEACHING_MEDIA, WORKSHEETS } from "@/data/content";
import { cn } from "@/lib/cn";

export default function HomePage() {
  const k1 = GRADES[0];
  const units = k1.semesters.flatMap((s) => s.months.flatMap((m) => m.units.map((u) => ({ ...u, semesterId: s.id }))));

  const stats = [
    { emoji: "📚", label: "หน่วยการเรียนรู้", value: units.length },
    { emoji: "🧸", label: "กิจกรรมในแผน", value: countActivities() },
    { emoji: "🎨", label: "สื่อการสอน", value: TEACHING_MEDIA.length },
    { emoji: "📝", label: "ใบงาน", value: WORKSHEETS.length },
  ];

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="bg-dots pointer-events-none absolute inset-0" aria-hidden />
        <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-purple-100 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 -right-16 size-64 rounded-full bg-pink-soft blur-3xl" aria-hidden />

        <div className="container-page relative py-14 text-center sm:py-20 lg:py-24">
          <div className="animate-rise mx-auto max-w-3xl">
            <span className="animate-float inline-grid size-20 place-items-center rounded-3xl bg-white text-5xl shadow-soft sm:size-24 sm:text-6xl">
              💜
            </span>
            <h1 className="mt-6 text-[2rem] leading-tight sm:text-5xl lg:text-6xl">{SITE.name}</h1>
            <p className="mt-2 font-display text-lg text-purple-500 sm:text-2xl">{SITE.nameEn}</p>
            <p className="mt-1 text-[15px] text-ink-soft sm:text-base">{SITE.credit}</p>

            <p className="mt-8 text-xl font-medium text-purple-800 sm:text-2xl">{SITE.tagline}</p>
            <p className="mt-2 text-base text-ink-soft sm:text-lg">{SITE.description}</p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/plans"
                className="tap inline-flex w-full items-center justify-center gap-2 rounded-full bg-purple-600 px-7 py-3 text-base font-medium text-white shadow-soft transition hover:bg-purple-700 hover:shadow-lift sm:w-auto"
              >
                📚 ดูแผนการจัดประสบการณ์ <ArrowRight size={18} />
              </Link>
              <Link
                href="/activities"
                className="tap inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-purple-200 bg-white px-7 py-3 text-base font-medium text-purple-700 transition hover:border-purple-300 hover:bg-purple-50 sm:w-auto"
              >
                🧸 ดูไอเดียกิจกรรม
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Welcome ---------- */}
      <section className="container-page -mt-4 sm:-mt-8">
        <div className="animate-rise delay-1 card flex flex-col items-center gap-3 px-5 py-5 text-center sm:flex-row sm:text-left">
          <span className="text-4xl">🌷</span>
          <div className="min-w-0">
            <p className="font-display text-lg text-purple-800 sm:text-xl">{SITE.welcome}</p>
            <p className="text-[15px] text-ink-soft">“{SITE.concept}”</p>
          </div>
        </div>
      </section>

      {/* ---------- Menu cards ---------- */}
      <section className="container-page py-12 sm:py-16">
        <h2 className="mb-6 text-center text-2xl sm:text-3xl">เลือกสิ่งที่อยากดู ✨</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
          {NAV_ITEMS.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("card card-hover animate-rise group flex items-center gap-4 p-5 sm:flex-col sm:items-start sm:p-6", `delay-${i + 1}`)}
            >
              <span
                className={cn(
                  "grid size-14 shrink-0 place-items-center rounded-2xl text-3xl transition-transform group-hover:-rotate-6 group-hover:scale-105 sm:size-16 sm:text-4xl",
                  item.tint,
                )}
              >
                {item.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg text-purple-800 sm:text-xl">{item.label}</span>
                <span className="mt-0.5 block text-[15px] text-ink-soft">{item.description}</span>
              </span>
              <ArrowRight size={20} className="shrink-0 text-purple-300 transition group-hover:translate-x-1 group-hover:text-purple-600 sm:self-end" />
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Stats ---------- */}
      <section className="container-page">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card flex items-center gap-3 px-4 py-4 sm:px-5">
              <span className="text-2xl sm:text-3xl">{s.emoji}</span>
              <div>
                <p className="font-display text-2xl leading-none text-purple-700 sm:text-3xl">{s.value}</p>
                <p className="text-[13px] text-ink-soft sm:text-sm">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Units ---------- */}
      <section className="container-page py-12 sm:py-16">
        <div className="mb-5 flex items-end justify-between gap-3">
          <h2 className="text-2xl sm:text-3xl">📚 หน่วยการเรียนรู้ อนุบาล 1</h2>
          <Link href="/plans" className="tap hidden items-center gap-1 text-[15px] font-medium text-purple-700 hover:underline sm:inline-flex">
            ดูทั้งหมด <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {units.map((u) => (
            <Link
              key={`${u.semesterId}-${u.id}`}
              href={`/plans/${k1.id}/${u.semesterId}/${u.id}`}
              className="card card-hover flex flex-col items-center gap-2 p-4 text-center"
            >
              <span className="text-4xl">{u.emoji}</span>
              <span className="font-display text-base text-purple-800 sm:text-lg">{u.title}</span>
              <span className="text-[13px] text-ink-soft">{u.weeks.length} สัปดาห์</span>
            </Link>
          ))}
        </div>
        <Link href="/plans" className="tap mt-4 inline-flex items-center gap-1 text-[15px] font-medium text-purple-700 hover:underline sm:hidden">
          ดูทั้งหมด <ArrowRight size={16} />
        </Link>
      </section>

      {/* ---------- Featured activities ---------- */}
      <section className="container-page pb-4">
        <div className="mb-5 flex items-end justify-between gap-3">
          <h2 className="text-2xl sm:text-3xl">🧸 กิจกรรมแนะนำ</h2>
          <Link href="/activities" className="tap inline-flex items-center gap-1 text-[15px] font-medium text-purple-700 hover:underline">
            ดูทั้งหมด <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LEARNING_ACTIVITIES.slice(0, 3).map((a) => (
            <Link key={a.id} href={`/activities/${a.id}`} className="card card-hover flex gap-4 p-5">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-pink-soft text-3xl">{a.emoji}</span>
              <span className="min-w-0">
                <span className="block text-[13px] font-medium text-purple-500">{a.category}</span>
                <span className="block font-display text-lg text-purple-800">{a.title}</span>
                <span className="mt-0.5 block text-[15px] text-ink-soft">{a.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
