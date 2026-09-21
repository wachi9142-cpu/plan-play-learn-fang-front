import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SCHEDULES, getSchedule } from "@/data/schedules";
import { getGrade } from "@/data/plans";
import { Breadcrumb, PageHeader, Tag } from "@/components/ui";
import { ScheduleTable } from "@/components/partials/ScheduleTable";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return SCHEDULES.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return { title: getSchedule(id)?.title ?? "ไม่พบกำหนดการสอน" };
}

export default async function ScheduleDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const schedule = getSchedule(id);
  if (!schedule) notFound();
  const grade = getGrade(schedule.gradeId);

  const idx = SCHEDULES.findIndex((s) => s.id === schedule.id);
  const prev = SCHEDULES[idx - 1];
  const next = SCHEDULES[idx + 1];

  return (
    <div className="container-page py-8 sm:py-12">
      <Breadcrumb items={[{ label: "กำหนดการสอน", href: "/schedules" }, { label: schedule.title }]} />

      <PageHeader emoji="📅" title={schedule.title} description={schedule.description ?? `${schedule.semester} ${schedule.year}`}>
        <div className="flex flex-wrap gap-2">
          {grade && <Tag tone="pink">{grade.name}</Tag>}
          <Tag tone="sky">{schedule.semester} {schedule.year}</Tag>
          <Tag tone="purple">{schedule.rows.length} สัปดาห์</Tag>
        </div>
      </PageHeader>

      <p className="animate-rise mb-4 rounded-2xl bg-yellow-soft px-4 py-3 text-[15px]">
        💡 กดที่ชื่อในช่อง <span className="font-medium">หน่วยการจัดประสบการณ์</span> เพื่อเปิดแผนการจัดประสบการณ์ของหน่วยนั้น
      </p>

      <div className="animate-rise delay-1">
        <ScheduleTable schedule={schedule} />
      </div>

      <nav className="mt-10 flex items-stretch justify-between gap-3" aria-label="ชุดก่อนหน้า / ถัดไป">
        {prev ? (
          <Link href={`/schedules/${prev.id}`} className="card card-hover tap flex flex-1 items-center gap-2 px-4 py-3 text-[15px] text-purple-700">
            <ChevronLeft size={18} /> <span className="truncate">{prev.title}</span>
          </Link>
        ) : <span className="flex-1" />}
        {next ? (
          <Link href={`/schedules/${next.id}`} className="card card-hover tap flex flex-1 items-center justify-end gap-2 px-4 py-3 text-right text-[15px] text-purple-700">
            <span className="truncate">{next.title}</span> <ChevronRight size={18} />
          </Link>
        ) : <span className="flex-1" />}
      </nav>
    </div>
  );
}
