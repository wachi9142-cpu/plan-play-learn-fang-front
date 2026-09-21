import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { GRADES, getGrade, getPlansByGrade } from "@/data/plans";
import { SCHEDULES } from "@/data/schedules";
import { PROJECTS } from "@/data/projects";
import { GAMES } from "@/data/games";
import { WORKSHEETS } from "@/data/worksheets";
import { Breadcrumb, EmptyState, PageHeader, Tag } from "@/components/ui";
import { PlanCard } from "@/components/partials/PlanCard";
import { GameCard } from "@/components/games";
import { WorksheetCard } from "@/components/worksheets/WorksheetLibrary";
import { cn } from "@/lib/cn";

type Params = { grade: string };

export function generateStaticParams(): Params[] {
  return GRADES.map((g) => ({ grade: g.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { grade } = await params;
  return { title: getGrade(grade)?.name ?? "ไม่พบระดับชั้น" };
}

export default async function GradePage({ params }: { params: Promise<Params> }) {
  const { grade: id } = await params;
  const g = getGrade(id);
  if (!g) notFound();

  const plans = getPlansByGrade(g.id);
  const schedules = SCHEDULES.filter((s) => s.gradeId === g.id);
  const projects = PROJECTS.filter((p) => p.gradeId === g.id);
  const games = GAMES.filter((x) => x.gradeId === g.id);
  const worksheets = WORKSHEETS.filter((w) => w.gradeId === g.id);
  const total = plans.length + schedules.length + projects.length + games.length + worksheets.length;

  const idx = GRADES.findIndex((x) => x.id === g.id);
  const prev = GRADES[idx - 1];
  const next = GRADES[idx + 1];

  const counters = [
    { emoji: "📅", label: "กำหนดการสอน", n: schedules.length, href: "/schedules" },
    { emoji: "📖", label: "แผนการจัดประสบการณ์", n: plans.length, href: "/plans" },
    { emoji: "🌱", label: "โครงการ", n: projects.length, href: "/projects" },
    { emoji: "🎮", label: "เกมการศึกษา", n: games.length, href: "/games" },
    { emoji: "📝", label: "ใบงาน", n: worksheets.length, href: "/worksheets" },
  ];

  return (
    <div className="container-page py-8 sm:py-12">
      <Breadcrumb items={[{ label: "เกี่ยวกับ", href: "/about" }, { label: g.name }]} />

      <PageHeader emoji={g.emoji} title={g.name} description={g.description}>
        <div className="flex flex-wrap gap-2">
          <Tag tone="pink">อายุ {g.ages}</Tag>
          <Tag tone="purple">{total > 0 ? `${total} รายการ` : "กำลังเตรียมเนื้อหา"}</Tag>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card animate-rise delay-1 p-5 sm:p-6">
          <h2 className="mb-3 text-lg sm:text-xl">🎯 จุดเน้นพัฒนาการ</h2>
          <ul className="space-y-1.5">
            {g.focus.map((f) => <li key={f} className="flex gap-2 text-[15px] sm:text-base"><span className="text-purple-400">•</span>{f}</li>)}
          </ul>
        </section>
        <section className="card animate-rise delay-2 p-5 sm:p-6">
          <h2 className="mb-3 text-lg sm:text-xl">📦 เนื้อหาในเว็บสำหรับ{g.name}</h2>
          <ul className="grid gap-1.5">
            {counters.map((c) => (
              <li key={c.label}>
                <Link href={c.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-[15px]", c.n > 0 ? "bg-cream hover:bg-purple-50" : "text-ink-soft")}>
                  <span className="text-xl">{c.emoji}</span>
                  <span className="flex-1">{c.label}</span>
                  <span className={cn("font-display", c.n > 0 ? "text-purple-700" : "text-ink-soft")}>{c.n > 0 ? c.n : "เร็ว ๆ นี้"}</span>
                  {c.n > 0 && <ArrowRight size={16} className="text-purple-300" />}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {total === 0 ? (
        <div className="mt-10">
          <EmptyState emoji={g.emoji} title={`เนื้อหาสำหรับ${g.name}กำลังจะมาเร็ว ๆ นี้`} hint="โครงสร้างเว็บรองรับแล้ว เพียงเพิ่มแผน เกม หรือใบงานที่ระบุระดับชั้นนี้" />
        </div>
      ) : (
        <>
          {plans.length > 0 && (
            <section className="animate-rise delay-3 mt-10">
              <h2 className="mb-4 text-xl sm:text-2xl">📖 แผนการจัดประสบการณ์</h2>
              <div className="grid gap-4 lg:grid-cols-2">{plans.slice(0, 4).map((p) => <PlanCard key={p.id} plan={p} compact />)}</div>
              {plans.length > 4 && <Link href="/plans" className="mt-3 inline-flex items-center gap-1 text-[15px] font-medium text-purple-700 hover:underline">ดูทั้งหมด {plans.length} แผน <ArrowRight size={16} /></Link>}
            </section>
          )}
          {games.length > 0 && (
            <section className="animate-rise delay-4 mt-10">
              <h2 className="mb-4 text-xl sm:text-2xl">🎮 เกมการศึกษา</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{games.slice(0, 3).map((x) => <GameCard key={x.id} game={x} />)}</div>
            </section>
          )}
          {worksheets.length > 0 && (
            <section className="animate-rise delay-5 mt-10">
              <h2 className="mb-4 text-xl sm:text-2xl">📝 ใบงาน</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{worksheets.slice(0, 3).map((w, i) => <WorksheetCard key={w.id} w={w} delay={i} />)}</div>
            </section>
          )}
        </>
      )}

      <nav className="mt-10 flex items-stretch justify-between gap-3" aria-label="ระดับชั้นก่อนหน้า / ถัดไป">
        {prev ? (
          <Link href={`/about/${prev.id}`} className="card card-hover tap flex flex-1 items-center gap-2 px-4 py-3 text-[15px] text-purple-700">
            <ChevronLeft size={18} /> <span className="truncate">{prev.emoji} {prev.name}</span>
          </Link>
        ) : <span className="flex-1" />}
        {next ? (
          <Link href={`/about/${next.id}`} className="card card-hover tap flex flex-1 items-center justify-end gap-2 px-4 py-3 text-right text-[15px] text-purple-700">
            <span className="truncate">{next.emoji} {next.name}</span> <ChevronRight size={18} />
          </Link>
        ) : <span className="flex-1" />}
      </nav>
    </div>
  );
}
