import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { SCHEDULES } from "@/data/schedules";
import { getGrade, getPlan } from "@/data/plans";
import { PageHeader, Tag } from "@/components/ui";

export const metadata: Metadata = { title: "กำหนดการสอน" };

export default function SchedulesPage() {
  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader
        emoji="📅"
        image="/menu/schedules.webp"
        title="กำหนดการสอน"
        description="เลือกชุดกำหนดการสอน แล้วกดที่ชื่อเรื่องในตารางเพื่อไปยังแผนการจัดประสบการณ์ที่ตรงกัน"
      />

      <div className="grid gap-4 md:grid-cols-2">
        {SCHEDULES.map((s, i) => {
          const grade = getGrade(s.gradeId);
          return (
            <Link key={s.id} href={`/schedules/${s.id}`} className="card card-hover animate-rise group flex flex-col p-5 sm:p-6" style={{ animationDelay: `${i * 90}ms` }}>
              <div className="flex items-start gap-3">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-sky-soft text-3xl">📅</span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl">{s.title}</h2>
                  <p className="text-[15px] text-ink-soft">{s.semester} {s.year}</p>
                </div>
                <ArrowRight size={20} className="shrink-0 text-purple-300 transition group-hover:translate-x-1 group-hover:text-purple-600" />
              </div>
              {s.description && <p className="mt-3 text-[15px] text-ink-soft">{s.description}</p>}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {grade && <Tag tone="pink">{grade.name}</Tag>}
                <Tag tone="purple">{s.rows.length} สัปดาห์</Tag>
              </div>
              <ol className="mt-4 grid grid-cols-1 gap-x-4 gap-y-1 border-t border-line pt-3 text-[15px] sm:grid-cols-2">
                {s.rows.slice(0, 8).map((r) => {
                  const p = r.planId ? getPlan(r.planId) : undefined;
                  return (
                    <li key={r.week} className="flex gap-2">
                      <span className="w-6 shrink-0 text-right font-medium text-purple-500">{r.week}.</span>
                      <span className="truncate">{p ? `${p.emoji} ${p.title}` : r.title ?? "—"}</span>
                    </li>
                  );
                })}
                {s.rows.length > 8 && <li className="text-[13px] text-ink-soft sm:col-span-2">… และอีก {s.rows.length - 8} สัปดาห์</li>}
              </ol>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
