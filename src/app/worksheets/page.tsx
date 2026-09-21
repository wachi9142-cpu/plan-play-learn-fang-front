import type { Metadata } from "next";
import { WORKSHEETS } from "@/data/content";
import { PageHeader, Tag } from "@/components/ui";

export const metadata: Metadata = { title: "ใบงาน" };

export default function WorksheetsPage() {
  const units = Array.from(new Set(WORKSHEETS.map((w) => w.unit)));
  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader emoji="📝" title="ใบงาน" description="ใบงานฝึกทักษะสำหรับอนุบาล 1 แยกตามหน่วยการเรียนรู้" />
      <div className="space-y-10">
        {units.map((unit, ui) => (
          <section key={unit} className="animate-rise" style={{ animationDelay: `${ui * 90}ms` }}>
            <h2 className="mb-4 text-xl sm:text-2xl">📚 หน่วย “{unit}”</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {WORKSHEETS.filter((w) => w.unit === unit).map((w) => (
                <article key={w.id} className="card card-hover p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-mint-soft text-3xl">{w.emoji}</span>
                    <div className="min-w-0">
                      <Tag tone="mint">{w.skill}</Tag>
                      <h3 className="mt-1 text-lg">{w.title}</h3>
                    </div>
                  </div>
                  <p className="mt-3 text-[15px] text-ink-soft">{w.description}</p>
                  <p className="mt-4 mb-1.5 font-display text-[15px] text-purple-700">📌 วิธีใช้</p>
                  <ol className="space-y-1">
                    {w.instructions.map((s, i) => (
                      <li key={i} className="flex gap-2 text-[15px]">
                        <span className="font-medium text-purple-500">{i + 1}.</span>{s}
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
