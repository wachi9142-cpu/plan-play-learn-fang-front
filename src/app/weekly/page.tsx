import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { ACTIVITY_META, DAY_META, DAY_ORDER, PLANS, getUnit } from "@/data/plans";
import { PageHeader, Tag } from "@/components/ui";

export const metadata: Metadata = { title: "แผนรายสัปดาห์" };

export default function WeeklyPage() {
  const rows = [...PLANS]
    .sort((a, b) => a.number - b.number)
    .flatMap((plan) => plan.weeks.map((week) => ({ plan, week })));

  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader emoji="🗓️" title="แผนรายสัปดาห์" description="ภาพรวมกิจกรรม จันทร์–ศุกร์ ของแต่ละสัปดาห์ กดเพื่อดูรายละเอียดกิจกรรม" />

      <div className="space-y-4">
        {rows.map(({ plan, week }, i) => {
          const href = `/plans/${plan.id}/${week.id}`;
          const unit = getUnit(plan.unitId);
          const total = week.days.reduce((n, d) => n + d.activities.length, 0);
          return (
            <article key={href} className="card animate-rise overflow-hidden" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
              <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3 sm:px-5">
                <span className="text-2xl">{plan.emoji}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg leading-snug sm:text-xl">
                    เรื่อง “{plan.title}” · สัปดาห์ที่ {week.number}: {week.title}
                  </h2>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Tag tone="purple">เรื่องที่ {plan.number}</Tag>
                    {unit && <Tag tone="yellow">หน่วย {unit.name}</Tag>}
                  </div>
                </div>
                <Link href={href} className="tap inline-flex items-center gap-1 rounded-full bg-purple-600 px-4 py-2 text-[14px] font-medium text-white transition hover:bg-purple-700">
                  ดูรายละเอียด <ArrowRight size={15} />
                </Link>
              </div>

              {total === 0 ? (
                <p className="px-4 py-4 text-[15px] text-ink-soft sm:px-5">🌱 ยังไม่ได้ใส่รายละเอียดกิจกรรมของสัปดาห์นี้</p>
              ) : (
                <div className="grid grid-cols-1 divide-y divide-line sm:grid-cols-5 sm:divide-x sm:divide-y-0">
                  {DAY_ORDER.map((key) => {
                    const day = week.days.find((d) => d.day === key);
                    return (
                      <div key={key} className="px-4 py-3 sm:px-3">
                        <p className="font-display text-[15px] text-purple-700">{DAY_META[key].full}</p>
                        {day?.theme && <p className="mb-1 text-[13px] text-ink-soft">{day.theme}</p>}
                        <ul className="space-y-1">
                          {(day?.activities ?? []).map((a) => (
                            <li key={a.id} className="flex gap-1.5 text-[14px] leading-snug">
                              <span aria-hidden>{ACTIVITY_META[a.type].emoji}</span>
                              <span>{a.title}</span>
                            </li>
                          ))}
                          {(day?.activities.length ?? 0) === 0 && <li className="text-[13px] text-ink-soft">—</li>}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
