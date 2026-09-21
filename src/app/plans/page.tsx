import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { GRADES } from "@/data/plans";
import { PageHeader, Tag } from "@/components/ui";

export const metadata: Metadata = { title: "แผนการจัดประสบการณ์" };

export default function PlansPage() {
  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader
        emoji="📚"
        title="แผนการจัดประสบการณ์"
        description="เลือกดูตามลำดับ ภาคเรียน → เดือน → หน่วยการเรียนรู้ → สัปดาห์"
      />

      {GRADES.map((grade) => (
        <div key={grade.id} className="space-y-10">
          {grade.semesters.map((sem, si) => (
            <section key={sem.id} className="animate-rise" style={{ animationDelay: `${si * 100}ms` }}>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl">🗓️ {sem.name}</h2>
                <Tag tone="purple">{sem.year}</Tag>
                <Tag tone="pink">{grade.name}</Tag>
              </div>

              <div className="space-y-5">
                {sem.months.map((month) => (
                  <div key={month.id} className="card p-4 sm:p-5">
                    <p className="mb-3 font-display text-lg text-purple-700">📅 {month.name}</p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {month.units.map((unit) => (
                        <Link
                          key={unit.id}
                          href={`/plans/${grade.id}/${sem.id}/${unit.id}`}
                          className="card-hover group flex items-center gap-3 rounded-2xl border border-line bg-cream p-4"
                        >
                          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white text-2xl shadow-soft">{unit.emoji}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-display text-lg text-purple-800">หน่วย “{unit.title}”</span>
                            <span className="block text-[14px] text-ink-soft">{unit.weeks.length} สัปดาห์</span>
                          </span>
                          <ArrowRight size={18} className="text-purple-300 transition group-hover:translate-x-1 group-hover:text-purple-600" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ))}
    </div>
  );
}
