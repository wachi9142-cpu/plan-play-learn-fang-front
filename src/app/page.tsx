import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NAV_ITEMS, SITE } from "@/lib/site";
import { GRADES, PLANS, countActivities, getPlansByGrade } from "@/data/plans";
import { PROJECTS } from "@/data/projects";
import { SCHEDULES } from "@/data/schedules";
import { TEACHING_MEDIA, WORKSHEETS } from "@/data/content";
import { PlanCard } from "@/components/partials/PlanCard";
import { cn } from "@/lib/cn";

export default function HomePage() {
  const k1 = GRADES[0];
  const plans = getPlansByGrade(k1.id);
  const mainMenu = NAV_ITEMS.slice(0, 3);
  const library = NAV_ITEMS.slice(3);

  const stats = [
    { emoji: "📚", label: "โครงการ", value: PROJECTS.length },
    { emoji: "📖", label: "แผน (เรื่อง)", value: PLANS.length },
    { emoji: "🧸", label: "กิจกรรมในแผน", value: countActivities() },
    { emoji: "🎨", label: "สื่อ + ใบงาน", value: TEACHING_MEDIA.length + WORKSHEETS.length },
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
            <span className="animate-float inline-grid size-20 place-items-center rounded-3xl bg-white text-5xl shadow-soft sm:size-24 sm:text-6xl">💜</span>
            <h1 className="mt-6 text-[2rem] leading-tight sm:text-5xl lg:text-6xl">{SITE.name}</h1>
            <p className="mt-2 font-display text-lg text-purple-500 sm:text-2xl">{SITE.nameEn}</p>
            <p className="mt-1 text-[15px] text-ink-soft sm:text-base">{SITE.credit}</p>

            <p className="mt-8 text-xl font-medium text-purple-800 sm:text-2xl">{SITE.tagline}</p>
            <p className="mt-2 text-base text-ink-soft sm:text-lg">{SITE.description}</p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/plans" className="tap inline-flex w-full items-center justify-center gap-2 rounded-full bg-purple-600 px-7 py-3 text-base font-medium text-white shadow-soft transition hover:bg-purple-700 hover:shadow-lift sm:w-auto">
                📖 ดูแผนการจัดประสบการณ์ <ArrowRight size={18} />
              </Link>
              <Link href="/schedules" className="tap inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-purple-200 bg-white px-7 py-3 text-base font-medium text-purple-700 transition hover:border-purple-300 hover:bg-purple-50 sm:w-auto">
                📅 กำหนดการสอน
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

      {/* ---------- 3 เมนูหลัก ---------- */}
      <section className="container-page py-12 sm:py-16">
        <h2 className="mb-6 text-center text-2xl sm:text-3xl">เลือกสิ่งที่อยากดู ✨</h2>
        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
          {mainMenu.map((item, i) => (
            <Link key={item.href} href={item.href} className={cn("card card-hover animate-rise group flex items-center gap-4 p-5 lg:flex-col lg:items-start lg:p-6", `delay-${i + 1}`)}>
              <span className={cn("grid size-16 shrink-0 place-items-center rounded-2xl text-4xl transition-transform group-hover:-rotate-6 group-hover:scale-105 lg:size-20 lg:text-5xl", item.tint)}>{item.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-xl text-purple-800 lg:text-2xl">{item.label}</span>
                <span className="mt-0.5 block text-[15px] text-ink-soft">{item.description}</span>
                {item.children && (
                  <span className="mt-2 block text-[13px] text-purple-500">{item.children.length} รายการ</span>
                )}
              </span>
              <ArrowRight size={22} className="shrink-0 text-purple-300 transition group-hover:translate-x-1 group-hover:text-purple-600 lg:self-end" />
            </Link>
          ))}
        </div>

        {/* ความสัมพันธ์ของระบบ */}
        <div className="animate-rise delay-4 mt-6 card flex flex-col items-center gap-2 bg-purple-50 px-5 py-4 text-center text-[15px] sm:flex-row sm:justify-center sm:gap-3">
          <span className="font-medium text-purple-800">📅 กำหนดการสอน</span>
          <ArrowRight size={16} className="rotate-90 text-purple-300 sm:rotate-0" />
          <span className="font-medium text-purple-800">📖 แผน (เรื่อง)</span>
          <ArrowRight size={16} className="rotate-90 text-purple-300 sm:rotate-0" />
          <span className="font-medium text-purple-800">🧸 กิจกรรมรายวัน</span>
          <ArrowRight size={16} className="rotate-90 text-purple-300 sm:rotate-0" />
          <span className="font-medium text-purple-800">🎨 สื่อ · ใบงาน · โครงการ</span>
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

      {/* ---------- แผนล่าสุด ---------- */}
      <section className="container-page py-12 sm:py-16">
        <div className="mb-5 flex items-end justify-between gap-3">
          <h2 className="text-2xl sm:text-3xl">📖 แผนการจัดประสบการณ์ {k1.name}</h2>
          <Link href="/plans" className="tap inline-flex items-center gap-1 text-[15px] font-medium text-purple-700 hover:underline">
            ดูทั้งหมด <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {plans.slice(0, 4).map((p) => <PlanCard key={p.id} plan={p} compact />)}
        </div>
      </section>

      {/* ---------- โครงการ ---------- */}
      <section className="container-page pb-4">
        <div className="mb-5 flex items-end justify-between gap-3">
          <h2 className="text-2xl sm:text-3xl">📚 โครงการของเด็ก ๆ</h2>
          <Link href="/projects" className="tap inline-flex items-center gap-1 text-[15px] font-medium text-purple-700 hover:underline">
            ดูทั้งหมด <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
          {PROJECTS.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`} className="card card-hover flex flex-col items-center gap-2 p-4 text-center">
              <span className="text-4xl">{p.emoji}</span>
              <span className="font-display text-[15px] leading-snug text-purple-800">{p.title}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- กำหนดการสอน + คลัง ---------- */}
      <section className="container-page py-12 sm:py-16">
        <h2 className="mb-5 text-2xl sm:text-3xl">🧺 คลังความรู้</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 sm:gap-4">
          {SCHEDULES.length > 0 && (
            <Link href="/schedules" className="card card-hover flex items-center gap-3 p-4 sm:col-span-2 lg:col-span-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-sky-soft text-2xl">📅</span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg text-purple-800">กำหนดการสอน {SCHEDULES.length} ชุด</span>
                <span className="block text-[14px] text-ink-soft">{SCHEDULES.map((s) => s.title).join(" · ")}</span>
              </span>
              <ArrowRight size={18} className="text-purple-300" />
            </Link>
          )}
          {library.map((item) => (
            <Link key={item.href} href={item.href} className="card card-hover flex items-center gap-3 p-4">
              <span className={cn("grid size-12 shrink-0 place-items-center rounded-xl text-2xl", item.tint)}>{item.emoji}</span>
              <span className="min-w-0 flex-1 font-display text-[15px] leading-snug text-purple-800">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
