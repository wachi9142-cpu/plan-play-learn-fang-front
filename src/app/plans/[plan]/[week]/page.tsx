import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PLANS, findWeek, getGrade, getUnit } from "@/data/plans";
import { Breadcrumb, PageHeader, Tag } from "@/components/ui";
import { DayTabs } from "@/components/partials";

type Params = { plan: string; week: string };

export function generateStaticParams(): Params[] {
  return PLANS.flatMap((p) => p.weeks.map((w) => ({ plan: p.id, week: w.id })));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const p = await params;
  const found = findWeek(p.plan, p.week);
  return { title: found ? `${found.plan.title} · สัปดาห์ที่ ${found.week.number}` : "ไม่พบสัปดาห์" };
}

export default async function WeekPage({ params }: { params: Promise<Params> }) {
  const p = await params;
  const found = findWeek(p.plan, p.week);
  if (!found) notFound();
  const { plan, week } = found;
  const grade = getGrade(plan.gradeId);
  const unit = getUnit(plan.unitId);

  const base = `/plans/${plan.id}`;
  const idx = plan.weeks.findIndex((w) => w.id === week.id);
  const prev = plan.weeks[idx - 1];
  const next = plan.weeks[idx + 1];

  return (
    <div className="container-page py-8 sm:py-12">
      <Breadcrumb
        items={[
          { label: "แผนการจัดประสบการณ์", href: "/plans" },
          { label: `เรื่อง ${plan.title}`, href: base },
          { label: `สัปดาห์ที่ ${week.number}` },
        ]}
      />

      <PageHeader emoji={plan.emoji} title={`สัปดาห์ที่ ${week.number} · ${week.title}`} description={week.summary}>
        <div className="flex flex-wrap gap-2">
          <Tag tone="purple">เรื่อง “{plan.title}”</Tag>
          {unit && <Tag tone="yellow">หน่วย {unit.name}</Tag>}
          {grade && <Tag tone="pink">{grade.name}</Tag>}
        </div>
      </PageHeader>

      <DayTabs days={week.days} />

      <nav className="mt-10 flex items-stretch justify-between gap-3" aria-label="สัปดาห์ก่อนหน้า / ถัดไป">
        {prev ? (
          <Link href={`${base}/${prev.id}`} className="card card-hover tap flex flex-1 items-center gap-2 px-4 py-3 text-[15px] text-purple-700">
            <ChevronLeft size={18} /> <span className="truncate">สัปดาห์ที่ {prev.number}: {prev.title}</span>
          </Link>
        ) : <span className="flex-1" />}
        {next ? (
          <Link href={`${base}/${next.id}`} className="card card-hover tap flex flex-1 items-center justify-end gap-2 px-4 py-3 text-right text-[15px] text-purple-700">
            <span className="truncate">สัปดาห์ที่ {next.number}: {next.title}</span> <ChevronRight size={18} />
          </Link>
        ) : <span className="flex-1" />}
      </nav>
    </div>
  );
}
