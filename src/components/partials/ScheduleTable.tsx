import Link from "next/link";
import { ArrowRight, Link2 } from "lucide-react";
import type { Schedule, ScheduleRow } from "@/types";
import { getGrade, getPlan } from "@/data/plans";
import { cn } from "@/lib/cn";

/**
 * ตารางกำหนดการสอน (ตามแบบต้นฉบับ)
 * สัปดาห์ที่ | วัน เดือน ปี | สาระการเรียนรู้ | หน่วยการจัดประสบการณ์ | หมายเหตุ
 * ช่อง "หน่วยการจัดประสบการณ์" กดแล้วไปยัง /plans/[planId]
 * desktop: ตาราง | มือถือ: การ์ดแถวละใบ
 */
export function ScheduleTable({ schedule }: { schedule: Schedule }) {
  const grade = getGrade(schedule.gradeId);
  const rows = schedule.rows.map((r) => {
    const plan = r.planId ? getPlan(r.planId) : undefined;
    return {
      ...r,
      plan,
      kind: r.kind ?? "plan",
      strand: r.strand ?? plan?.strand ?? "",
      label: plan?.title ?? r.title ?? "—",
    };
  });

  return (
    <div className="card overflow-hidden">
      {/* หัวตาราง */}
      <div className="border-b border-line bg-purple-50 px-4 py-4 text-center sm:px-6">
        <p className="font-display text-lg text-purple-800 sm:text-xl">
          กำหนดการสอน{grade ? `ชั้น${grade.name}` : ""} {schedule.semester} {schedule.year}
        </p>
        {schedule.school && <p className="text-[15px] text-ink">{schedule.school}</p>}
        {schedule.teacher && (
          <p className="text-[15px] text-ink">ครูผู้สอน <span className="font-medium">{schedule.teacher}</span></p>
        )}
      </div>

      {/* Desktop / tablet */}
      <table className="hidden w-full border-collapse text-left md:table">
        <thead>
          <tr className="bg-purple-600 text-white">
            <Th className="w-24 text-center">สัปดาห์ที่</Th>
            <Th className="w-40">วัน เดือน ปี</Th>
            <Th className="w-56">สาระการเรียนรู้</Th>
            <Th>หน่วยการจัดประสบการณ์</Th>
            <Th className="w-44">หมายเหตุ</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r) => (
            <tr key={r.week} className={cn("transition-colors", rowTone(r.kind), r.plan && "hover:bg-purple-50")}>
              <td className="px-4 py-3 text-center">
                <span className="inline-grid size-9 place-items-center rounded-full bg-purple-100 font-display text-lg text-purple-800">{r.week}</span>
              </td>
              <td className="px-4 py-3 text-[15px] whitespace-nowrap">{r.dates}</td>
              <td className="px-4 py-3 text-[15px] text-ink-soft">{r.strand || "—"}</td>
              <td className="px-4 py-3">
                <UnitCell row={r} />
              </td>
              <td className="px-4 py-3 text-[14px] text-ink-soft">{r.note ?? ""}</td>
            </tr>
          ))}
        </tbody>
        {schedule.footer && (
          <tfoot>
            <tr>
              <td colSpan={5} className="bg-sky-soft px-4 py-2.5 text-center font-display text-base text-[#2b5c8a]">{schedule.footer}</td>
            </tr>
          </tfoot>
        )}
      </table>

      {/* Mobile */}
      <div className="grid gap-2 p-3 md:hidden">
        {rows.map((r) => {
          const inner = (
            <>
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-purple-100 font-display text-xl text-purple-800">{r.week}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] text-ink-soft">{r.dates}{r.strand ? ` · ${r.strand}` : ""}</span>
                <span className={cn("block font-display text-lg leading-snug", r.kind === "assessment" ? "text-red-600" : "text-purple-800")}>
                  {r.plan ? `${r.plan.emoji} ${r.plan.title}` : r.label}
                </span>
                {r.note && <span className="block text-[13px] text-ink-soft">หมายเหตุ: {r.note}</span>}
                {r.plan && <span className="mt-1 inline-flex items-center gap-1 text-[14px] font-medium text-purple-600">🔗 ดูแผน <ArrowRight size={14} /></span>}
              </span>
            </>
          );
          return r.plan ? (
            <Link key={r.week} href={`/plans/${r.plan.id}`} className="card-hover flex items-center gap-3 rounded-2xl border border-line bg-white p-3">{inner}</Link>
          ) : (
            <div key={r.week} className={cn("flex items-center gap-3 rounded-2xl border border-line p-3", rowTone(r.kind))}>{inner}</div>
          );
        })}
        {schedule.footer && (
          <p className="rounded-xl bg-sky-soft px-4 py-2 text-center font-display text-base text-[#2b5c8a]">{schedule.footer}</p>
        )}
      </div>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th scope="col" className={cn("px-4 py-3 font-display text-base font-medium", className)}>{children}</th>;
}

function rowTone(kind: ScheduleRow["kind"]) {
  switch (kind) {
    case "assessment": return "bg-red-50/70";
    case "holiday": return "bg-sky-soft/60";
    case "event": return "bg-yellow-soft/60";
    default: return "odd:bg-white even:bg-cream/60";
  }
}

function UnitCell({ row }: { row: { plan?: { id: string; title: string; emoji: string }; label: string; kind: ScheduleRow["kind"] } }) {
  if (row.plan) {
    return (
      <Link
        href={`/plans/${row.plan.id}`}
        className="group inline-flex items-center gap-2 text-base font-medium text-purple-800 underline decoration-purple-200 decoration-2 underline-offset-4 transition hover:decoration-purple-500"
      >
        <span className="text-xl">{row.plan.emoji}</span>
        {row.plan.title}
        <Link2 size={15} className="text-purple-300 transition group-hover:text-purple-600" />
        <span className="ml-1 rounded-full bg-purple-600 px-2.5 py-0.5 text-[12px] text-white opacity-0 transition group-hover:opacity-100">ดูแผน</span>
      </Link>
    );
  }
  if (row.kind === "assessment") return <span className="font-medium text-red-600">{row.label}</span>;
  return <span className="text-ink-soft">{row.label}</span>;
}
