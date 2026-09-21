import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CalendarDays } from "lucide-react";
import { SCHEDULES, currentWeekIndex } from "@/data/schedules";
import { ACTIVITY_META, getGrade, getPlan, getUnit } from "@/data/plans";
import { getGamesForPlan } from "@/data/games";
import { getWorksheetsForPlan } from "@/data/worksheets";
import { getProjectsForPlan } from "@/data/projects";
import { TEACHING_MEDIA } from "@/data/content";
import { sortedNews } from "@/data/news";
import { PageHeader, Tag } from "@/components/ui";
import { GameCard } from "@/components/games";
import { WorksheetCard } from "@/components/worksheets/WorksheetLibrary";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "ห้องเรียนของเรา" };
export const dynamic = "force-dynamic"; // ให้ "สัปดาห์นี้" อัปเดตตามวันจริง

export default function ClassroomPage() {
  const schedule = SCHEDULES[0];
  const idx = currentWeekIndex(schedule);
  const row = schedule.rows[idx];
  const plan = row.planId ? getPlan(row.planId) : undefined;
  const unit = plan ? getUnit(plan.unitId) : undefined;
  const grade = getGrade(schedule.gradeId);
  const nextRow = schedule.rows[idx + 1];
  const nextPlan = nextRow?.planId ? getPlan(nextRow.planId) : undefined;
  const today = new Date();
  const beforeTerm = schedule.startDate ? today < new Date(schedule.startDate + "T00:00:00") : false;

  const games = plan ? getGamesForPlan(plan.id) : [];
  const worksheets = plan ? getWorksheetsForPlan(plan.id) : [];
  const projects = plan ? getProjectsForPlan(plan.id) : [];
  const media = plan ? TEACHING_MEDIA.filter((m) => plan.related?.mediaIds?.includes(m.id)) : [];
  const news = sortedNews().slice(0, 3);

  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader emoji="📚" title="ห้องเรียนของเรา" description="รวมสิ่งที่กำลังเรียนสัปดาห์นี้ หน่วยการเรียนรู้ เรื่องประจำสัปดาห์ และสื่อที่เกี่ยวข้อง">
        <div className="flex flex-wrap gap-2">
          {grade && <Tag tone="pink">{grade.name}</Tag>}
          <Tag tone="sky">{schedule.semester} {schedule.year}</Tag>
          {beforeTerm && <Tag tone="yellow">ยังไม่เปิดเทอม — แสดงสัปดาห์ที่ 1</Tag>}
        </div>
      </PageHeader>

      {/* สัปดาห์นี้ */}
      <section className="animate-rise card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 bg-purple-600 px-5 py-4 text-white sm:px-6">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/15 text-3xl">{plan?.emoji ?? "📅"}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] opacity-80">📅 สัปดาห์ที่ {row.week} · {row.dates}</p>
            <h2 className="font-display text-xl leading-snug text-white sm:text-2xl">{plan ? `เรื่อง ${plan.title}` : row.title ?? "—"}</h2>
            {(unit || row.strand) && <p className="text-[14px] opacity-90">{unit ? `หน่วย ${unit.name}` : ""}{unit && row.strand ? " · " : ""}{row.strand ?? ""}</p>}
          </div>
          {plan && (
            <Link href={`/plans/${plan.id}`} className="tap inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[14px] font-medium text-purple-700 shadow-soft hover:bg-purple-50">
              📖 ดูแผน <ArrowRight size={15} />
            </Link>
          )}
        </div>

        {plan ? (
          <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-lg">🎯 จุดประสงค์</h3>
              {plan.objectives.length === 0 ? <p className="text-[15px] text-ink-soft">— ยังไม่ได้ระบุ —</p> : (
                <ul className="space-y-1.5">{plan.objectives.map((o) => <li key={o} className="flex gap-2 text-[15px]"><span className="text-purple-400">•</span>{o}</li>)}</ul>
              )}
            </div>
            <div>
              <h3 className="mb-2 text-lg">🧸 กิจกรรมในสัปดาห์นี้</h3>
              {plan.weeks.length === 0 || plan.weeks.every((w) => w.days.every((d) => d.activities.length === 0)) ? (
                <p className="text-[15px] text-ink-soft">ยังไม่ได้ใส่รายละเอียดกิจกรรม</p>
              ) : (
                <div className="grid gap-1.5">
                  {plan.weeks.map((w) => (
                    <Link key={w.id} href={`/plans/${plan.id}/${w.id}`} className="tap flex items-center gap-2 rounded-xl bg-cream px-3 py-2 text-[15px] hover:bg-purple-50">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-purple-600 font-display text-sm text-white">{w.number}</span>
                      <span className="min-w-0 flex-1 truncate">{w.title}</span>
                      <span className="text-[12px] text-ink-soft" aria-hidden>{Array.from(new Set(w.days.flatMap((d) => d.activities.map((a) => a.type)))).map((t) => ACTIVITY_META[t].emoji).join(" ")}</span>
                      <ArrowRight size={14} className="text-purple-300" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="p-5 text-[15px] text-ink-soft sm:p-6">สัปดาห์นี้ไม่มีแผนการจัดประสบการณ์ ({row.title})</p>
        )}
      </section>

      {/* สื่อ/เกม/ใบงาน/โครงการ ที่เกี่ยวข้อง */}
      {plan && (media.length + games.length + worksheets.length + projects.length) > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl sm:text-2xl">🔗 สื่อที่เกี่ยวข้องกับเรื่องนี้</h2>
          {games.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-lg">🎮 เกมออนไลน์</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{games.slice(0, 3).map((g) => <GameCard key={g.id} game={g} />)}</div>
            </div>
          )}
          {worksheets.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-lg">📝 ใบงาน</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{worksheets.slice(0, 3).map((w, i) => <WorksheetCard key={w.id} w={w} delay={i} />)}</div>
            </div>
          )}
          {(media.length > 0 || projects.length > 0) && (
            <div className="grid gap-4 md:grid-cols-2">
              {media.length > 0 && (
                <div className="card p-4 sm:p-5">
                  <h3 className="mb-2 text-lg">🎨 สื่อการเรียนการสอน</h3>
                  <div className="grid gap-1.5">{media.map((m) => <Link key={m.id} href={`/media#${m.id}`} className="tap flex items-center gap-3 rounded-xl bg-cream px-3 py-2 text-[15px] hover:bg-purple-50"><span className="text-xl">{m.emoji}</span><span className="flex-1">{m.title}</span><ArrowRight size={14} className="text-purple-300" /></Link>)}</div>
                </div>
              )}
              {projects.length > 0 && (
                <div className="card p-4 sm:p-5">
                  <h3 className="mb-2 text-lg">🌱 โครงการที่เกี่ยวข้อง</h3>
                  <div className="grid gap-1.5">{projects.map((p) => <Link key={p.id} href={`/projects/${p.id}`} className="tap flex items-center gap-3 rounded-xl bg-cream px-3 py-2 text-[15px] hover:bg-purple-50"><span className="text-xl">{p.emoji}</span><span className="flex-1">{p.title}</span><ArrowRight size={14} className="text-purple-300" /></Link>)}</div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {/* สัปดาห์ถัดไป */}
        <section className="card p-5">
          <h2 className="mb-2 text-lg sm:text-xl">⏭️ สัปดาห์ถัดไป</h2>
          {nextRow ? (
            <div className="flex items-center gap-3 rounded-xl bg-cream px-3 py-2.5">
              <span className="text-2xl">{nextPlan?.emoji ?? "📅"}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] text-ink-soft">สัปดาห์ที่ {nextRow.week} · {nextRow.dates}</span>
                <span className="block font-display text-purple-800">{nextPlan ? `เรื่อง ${nextPlan.title}` : nextRow.title}</span>
              </span>
              {nextPlan && <Link href={`/plans/${nextPlan.id}`} className="text-[14px] font-medium text-purple-600 hover:underline">ดูแผน</Link>}
            </div>
          ) : <p className="text-[15px] text-ink-soft">สัปดาห์สุดท้ายของภาคเรียนแล้ว</p>}
          <Link href={`/schedules/${schedule.id}`} className="mt-3 inline-flex items-center gap-1 text-[14px] font-medium text-purple-700 hover:underline"><CalendarDays size={14} /> ดูกำหนดการสอนทั้งภาคเรียน</Link>
        </section>

        {/* ข่าวล่าสุด */}
        <section className="card p-5">
          <h2 className="mb-2 text-lg sm:text-xl">📣 ประชาสัมพันธ์ล่าสุด</h2>
          <div className="grid gap-1.5">
            {news.map((n) => (
              <Link key={n.id} href={`/news/${n.id}`} className={cn("tap block rounded-xl px-3 py-2 text-[15px] hover:bg-purple-50", n.pinned ? "bg-purple-50" : "bg-cream")}>
                <span className="block truncate text-purple-800">{n.pinned ? "📌 " : ""}{n.title}</span>
                <span className="block text-[12px] text-ink-soft">{n.dateLabel}</span>
              </Link>
            ))}
          </div>
          <Link href="/news" className="mt-3 inline-flex items-center gap-1 text-[14px] font-medium text-purple-700 hover:underline">ดูทั้งหมด <ArrowRight size={14} /></Link>
        </section>
      </div>
    </div>
  );
}
