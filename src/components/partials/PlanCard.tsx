import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LessonPlan } from "@/types";
import { countPlanActivities, getUnit } from "@/data/plans";
import { Tag } from "@/components/ui";
import { cn } from "@/lib/cn";

/** การ์ดแผน 1 เรื่อง — ใช้ซ้ำในหน้า /plans, หน้าโครงการ, หน้าแรก */
export function PlanCard({ plan, compact = false, className }: { plan: LessonPlan; compact?: boolean; className?: string }) {
  const unit = getUnit(plan.unitId);
  const total = countPlanActivities(plan);
  return (
    <Link href={`/plans/${plan.id}`} className={cn("card card-hover group flex items-center gap-4 p-4 sm:p-5", className)}>
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-purple-100 text-3xl sm:size-16 sm:text-4xl">{plan.emoji}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium text-purple-500">📖 เรื่องที่ {plan.number}</span>
        <span className="block font-display text-lg leading-snug text-purple-800 sm:text-xl">{plan.title}</span>
        {!compact && <span className="mt-0.5 block text-[15px] text-ink-soft">{plan.description}</span>}
        <span className="mt-2 flex flex-wrap gap-1.5">
          {unit && <Tag tone="yellow">หน่วย {unit.name}</Tag>}
          <Tag tone="sky">{plan.duration}</Tag>
          {total > 0 && <Tag tone="mint">{total} กิจกรรม</Tag>}
        </span>
      </span>
      <ArrowRight size={20} className="shrink-0 text-purple-300 transition group-hover:translate-x-1 group-hover:text-purple-600" />
    </Link>
  );
}
