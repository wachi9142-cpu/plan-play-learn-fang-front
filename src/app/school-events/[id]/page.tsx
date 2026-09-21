import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { EVENT_CATEGORIES, SCHOOL_EVENTS, getSchoolEvent } from "@/data/school-events";
import { getPlan } from "@/data/plans";
import { getProject } from "@/data/projects";
import { Breadcrumb, PageHeader, Tag } from "@/components/ui";
import { cn } from "@/lib/cn";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return SCHOOL_EVENTS.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return { title: getSchoolEvent(id)?.title ?? "ไม่พบกิจกรรม" };
}

export default async function SchoolEventPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const e = getSchoolEvent(id);
  if (!e) notFound();
  const c = EVENT_CATEGORIES[e.category];
  const plan = e.planId ? getPlan(e.planId) : undefined;
  const project = e.projectId ? getProject(e.projectId) : undefined;
  const sorted = [...SCHOOL_EVENTS].sort((a, b) => b.date.localeCompare(a.date));
  const idx = sorted.findIndex((x) => x.id === e.id);
  const prev = sorted[idx - 1];
  const next = sorted[idx + 1];

  return (
    <div className="container-page max-w-4xl py-8 sm:py-12">
      <Breadcrumb items={[{ label: "กิจกรรมโรงเรียน", href: "/school-events" }, { label: e.title }]} />
      <PageHeader emoji={e.emoji} title={e.title}>
        <div className="flex flex-wrap gap-2">
          <Tag tone="purple">{c.emoji} {c.label}</Tag>
          <Tag tone="sky"><CalendarDays size={13} className="mr-1" /> {e.dateLabel}</Tag>
        </div>
      </PageHeader>

      {e.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={e.image} alt={e.title} className="card animate-rise delay-1 aspect-[16/9] w-full object-cover" />
      ) : (
        <div className={cn("card animate-rise delay-1 grid aspect-[16/9] place-items-center text-8xl", c.tint)}>
          <span>{e.emoji}</span>
        </div>
      )}

      <section className="card animate-rise delay-2 mt-6 p-5 sm:p-6">
        <p className="text-base leading-relaxed sm:text-lg">{e.description}</p>
        {e.highlights && (
          <ul className="mt-3 flex flex-wrap gap-1.5">{e.highlights.map((h) => <Tag key={h} tone="yellow">{h}</Tag>)}</ul>
        )}
        {(plan || project) && (
          <div className="mt-4 grid gap-1.5">
            {project && (
              <Link href={`/projects/${project.id}`} className="tap flex items-center gap-3 rounded-xl bg-cream px-3 py-2 text-[15px] hover:bg-purple-50">
                <span className="text-xl">{project.emoji}</span><span className="flex-1">🌱 โครงการ {project.title}</span><ArrowRight size={16} className="text-purple-300" />
              </Link>
            )}
            {plan && (
              <Link href={`/plans/${plan.id}`} className="tap flex items-center gap-3 rounded-xl bg-cream px-3 py-2 text-[15px] hover:bg-purple-50">
                <span className="text-xl">{plan.emoji}</span><span className="flex-1">📖 แผน เรื่อง {plan.title}</span><ArrowRight size={16} className="text-purple-300" />
              </Link>
            )}
          </div>
        )}
        <Link href="/gallery/photos" className="mt-4 inline-flex items-center gap-1 text-[15px] font-medium text-purple-700 hover:underline">📷 ดูคลังภาพกิจกรรม <ArrowRight size={14} /></Link>
      </section>

      <nav className="mt-8 flex items-stretch justify-between gap-3" aria-label="กิจกรรมก่อนหน้า / ถัดไป">
        {prev ? (
          <Link href={`/school-events/${prev.id}`} className="card card-hover tap flex flex-1 items-center gap-2 px-4 py-3 text-[15px] text-purple-700"><ChevronLeft size={18} /> <span className="truncate">{prev.emoji} {prev.title}</span></Link>
        ) : <span className="flex-1" />}
        {next ? (
          <Link href={`/school-events/${next.id}`} className="card card-hover tap flex flex-1 items-center justify-end gap-2 px-4 py-3 text-right text-[15px] text-purple-700"><span className="truncate">{next.emoji} {next.title}</span> <ChevronRight size={18} /></Link>
        ) : <span className="flex-1" />}
      </nav>
    </div>
  );
}
