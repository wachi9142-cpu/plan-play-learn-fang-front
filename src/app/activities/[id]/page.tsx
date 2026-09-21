import { notFound } from "next/navigation";
import { Clock, Baby } from "lucide-react";
import { LEARNING_ACTIVITIES } from "@/data/content";
import { Breadcrumb, PageHeader, Tag } from "@/components/ui";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return LEARNING_ACTIVITIES.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const a = LEARNING_ACTIVITIES.find((x) => x.id === id);
  return { title: a?.title ?? "ไม่พบกิจกรรม" };
}

export default async function ActivityDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const a = LEARNING_ACTIVITIES.find((x) => x.id === id);
  if (!a) notFound();

  return (
    <div className="container-page max-w-4xl py-8 sm:py-12">
      <Breadcrumb items={[{ label: "กิจกรรมการเรียนรู้", href: "/activities" }, { label: a.title }]} />
      <PageHeader emoji={a.emoji} title={`“${a.title}”`} description={a.category}>
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="pink"><Baby size={14} className="mr-1" /> {a.age}</Tag>
          <Tag tone="sky"><Clock size={14} className="mr-1" /> {a.duration}</Tag>
          {a.skills.map((s) => <Tag key={s} tone="mint">{s}</Tag>)}
        </div>
      </PageHeader>

      <p className="animate-rise delay-1 mb-6 text-base sm:text-lg">{a.description}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card animate-rise delay-2 p-5 sm:p-6">
          <h2 className="mb-3 text-lg">🧺 อุปกรณ์</h2>
          <div className="flex flex-wrap gap-1.5">{a.materials.map((m) => <Tag key={m} tone="yellow">{m}</Tag>)}</div>
        </section>
        <section className="card animate-rise delay-3 p-5 sm:p-6">
          <h2 className="mb-3 text-lg">🌟 ทักษะที่ได้</h2>
          <ul className="space-y-1.5">
            {a.skills.map((s) => (
              <li key={s} className="flex gap-2 text-[15px] sm:text-base"><span className="text-purple-400">•</span>{s}</li>
            ))}
          </ul>
        </section>
        <section className="card animate-rise delay-4 p-5 sm:p-6 md:col-span-2">
          <h2 className="mb-3 text-lg">👣 ขั้นตอนกิจกรรม</h2>
          <ol className="space-y-2.5">
            {a.steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-[15px] sm:text-base">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-purple-600 text-sm font-medium text-white">{i + 1}</span>
                <span className="pt-0.5">{s}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
