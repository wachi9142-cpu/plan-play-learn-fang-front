"use client";

import { useState } from "react";
import type { DayPlan } from "@/types";
import { DAY_META, DAY_ORDER } from "@/data/plans";
import { ActivityCard } from "@/components/partials/ActivityCard";
import { EmptyState } from "@/components/ui";
import { cn } from "@/lib/cn";

export function DayTabs({ days }: { days: DayPlan[] }) {
  const [active, setActive] = useState(0);
  const ordered = DAY_ORDER.map((key) => days.find((d) => d.day === key) ?? { day: key, activities: [] });
  const current = ordered[active];

  return (
    <div>
      {/* แถบวัน: บนมือถือกดง่าย 5 ช่องเต็มความกว้าง */}
      <div role="tablist" aria-label="เลือกวัน" className="sticky top-16 z-30 -mx-4 bg-cream/95 px-4 py-2 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:py-0">
        <div className="grid grid-cols-5 gap-1.5 rounded-2xl border border-line bg-white p-1.5 shadow-soft sm:gap-2">
          {ordered.map((d, i) => {
            const meta = DAY_META[d.day];
            const isActive = i === active;
            return (
              <button
                key={d.day}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActive(i)}
                className={cn(
                  "tap flex flex-col items-center justify-center rounded-xl px-1 py-2 leading-tight transition-colors",
                  isActive ? "bg-purple-600 text-white shadow-soft" : "text-ink hover:bg-purple-50",
                )}
              >
                <span className="font-display text-base sm:hidden">{meta.short}</span>
                <span className="hidden font-display text-base sm:block">{meta.full}</span>
                <span className={cn("text-[12px]", isActive ? "text-purple-100" : "text-ink-soft")}>
                  {d.activities.length} กิจกรรม
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5" role="tabpanel">
        <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-xl sm:text-2xl">วัน{DAY_META[current.day].full}</h2>
          {current.theme && <p className="text-[15px] text-ink-soft sm:text-base">หัวข้อ: {current.theme}</p>}
        </div>

        {current.activities.length === 0 ? (
          <EmptyState title="ยังไม่มีกิจกรรมของวันนี้" hint="คุณครูสามารถเพิ่มรายละเอียดกิจกรรมได้ในภายหลัง" />
        ) : (
          <div className="grid gap-5">
            {current.activities.map((a, i) => (
              <ActivityCard key={`${current.day}-${a.id}`} activity={a} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
