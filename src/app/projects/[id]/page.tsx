import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { PROJECTS, getProject } from "@/data/projects";
import { getGrade, getPlan } from "@/data/plans";
import { Breadcrumb, PageHeader, Tag } from "@/components/ui";
import { BackButton } from "@/components/ui/BackButton";
import { PlanCard } from "@/components/partials/PlanCard";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return PROJECTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return { title: getProject(id)?.title ?? "ไม่พบโครงการ" };
}

export default async function ProjectDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  const grade = getGrade(project.gradeId);
  const relatedPlans = (project.relatedPlanIds ?? []).map(getPlan).filter((p) => p !== undefined);
  const idx = PROJECTS.findIndex((p) => p.id === project.id);
  const prev = PROJECTS[idx - 1];
  const next = PROJECTS[idx + 1];

  return (
    <div className="container-page py-8 sm:py-12">
      <BackButton className="mb-1" />
      <Breadcrumb items={[{ label: "โครงการ", href: "/projects" }, { label: project.title }]} />

      <PageHeader emoji={project.emoji} image={project.icon ?? project.image} title={`โครงการ${project.title}`} description={project.subtitle}>
        <div className="flex flex-wrap gap-2">
          {grade && <Tag tone="pink">{grade.name}</Tag>}
          <Tag tone="sky"><Clock size={13} className="mr-1" /> {project.duration}</Tag>
          <Tag tone="yellow">Project Approach</Tag>
        </div>
      </PageHeader>

      {project.image && (
        <figure className="animate-rise delay-1 mx-auto mb-6 w-fit max-w-full overflow-hidden rounded-3xl border border-line shadow-soft">
          {/* ใช้สัดส่วนจริงของภาพ จึงเห็นเต็มภาพ ไม่โดนตัดหัวหรือขอบ */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.image}
            alt={`ภาพบรรยากาศโครงการ${project.title}`}
            className="block h-auto max-h-[420px] w-auto max-w-full object-contain"
          />
        </figure>
      )}

      <p className="animate-rise delay-1 mb-8 text-base sm:text-lg">{project.description}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card animate-rise delay-2 p-5 sm:p-6">
          <h2 className="mb-3 text-lg sm:text-xl">🎯 เป้าหมายของโครงการ</h2>
          <ul className="space-y-1.5">
            {project.goals.map((g, i) => <li key={i} className="flex gap-2 text-[15px] sm:text-base"><span className="text-purple-400">•</span><span>{g}</span></li>)}
          </ul>
        </section>
        <section className="card animate-rise delay-3 p-5 sm:p-6">
          <h2 className="mb-3 text-lg sm:text-xl">🧺 สื่อ / อุปกรณ์</h2>
          <div className="flex flex-wrap gap-1.5">{project.materials.map((m) => <Tag key={m} tone="yellow">{m}</Tag>)}</div>
          <h2 className="mt-5 mb-2 text-lg sm:text-xl">🌟 ผลงาน / สิ่งที่ได้</h2>
          <ul className="space-y-1.5">
            {project.outcomes.map((o, i) => <li key={i} className="flex gap-2 text-[15px] sm:text-base"><span className="text-purple-400">✓</span><span>{o}</span></li>)}
          </ul>
        </section>
      </div>

      <section className="animate-rise delay-4 mt-10">
        <h2 className="mb-4 text-xl sm:text-2xl">🧩 ขั้นตอนการดำเนินโครงการ</h2>
        <ol className="grid gap-4 lg:grid-cols-3">
          {project.phases.map((ph, i) => (
            <li key={i} className="card relative p-5 pt-6">
              <span className="absolute -top-3 left-5 grid size-8 place-items-center rounded-full bg-purple-600 font-display text-base text-white shadow-soft">{i + 1}</span>
              <h3 className="text-lg">{ph.title}</h3>
              <p className="mb-3 text-[15px] text-ink-soft">{ph.description}</p>
              <ul className="space-y-1.5">
                {ph.activities.map((a, j) => <li key={j} className="flex gap-2 text-[15px]"><span className="text-purple-400">•</span><span>{a}</span></li>)}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      {relatedPlans.length > 0 && (
        <section className="animate-rise delay-5 mt-10">
          <h2 className="mb-4 text-xl sm:text-2xl">🔗 แผนการจัดประสบการณ์ที่เกี่ยวข้อง</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {relatedPlans.map((p) => <PlanCard key={p.id} plan={p} compact />)}
          </div>
        </section>
      )}

      <nav className="mt-10 flex items-stretch justify-between gap-3" aria-label="โครงการก่อนหน้า / ถัดไป">
        {prev ? (
          <Link href={`/projects/${prev.id}`} className="card card-hover tap flex flex-1 items-center gap-2 px-4 py-3 text-[15px] text-purple-700">
            <ChevronLeft size={18} /> <span className="truncate">{prev.emoji} {prev.title}</span>
          </Link>
        ) : <span className="flex-1" />}
        {next ? (
          <Link href={`/projects/${next.id}`} className="card card-hover tap flex flex-1 items-center justify-end gap-2 px-4 py-3 text-right text-[15px] text-purple-700">
            <span className="truncate">{next.emoji} {next.title}</span> <ChevronRight size={18} />
          </Link>
        ) : <span className="flex-1" />}
      </nav>
    </div>
  );
}
