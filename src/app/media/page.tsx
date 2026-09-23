import type { Metadata } from "next";
import { TEACHING_MEDIA } from "@/data/content";
import { PageHeader, Tag } from "@/components/ui";

export const metadata: Metadata = { title: "สื่อการเรียนการสอน" };

export default function MediaPage() {
  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader emoji="🎨" image="/menu/media.webp" title="สื่อการเรียนการสอน" description="บัตรภาพ เพลง นิทาน ของเล่น และสื่อทำมือที่ใช้ประกอบกิจกรรม" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEACHING_MEDIA.map((m, i) => (
          <article key={m.id} id={m.id} className="card card-hover animate-rise scroll-mt-24 p-5" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="flex items-start gap-3">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-yellow-soft text-3xl">{m.emoji}</span>
              <div className="min-w-0">
                <Tag tone="purple">{m.kind}</Tag>
                <h2 className="mt-1 text-lg sm:text-xl">{m.title}</h2>
              </div>
            </div>
            <p className="mt-3 text-[15px] text-ink-soft">{m.description}</p>
            <p className="mt-4 mb-1.5 font-display text-[15px] text-purple-700">✨ นำไปใช้</p>
            <ul className="space-y-1">
              {m.usage.map((u, j) => (
                <li key={j} className="flex gap-2 text-[15px]"><span className="text-purple-400">•</span>{u}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
