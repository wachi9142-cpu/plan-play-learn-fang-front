"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { LessonPlan, Unit } from "@/types";
import { PlanCard } from "@/components/partials/PlanCard";
import { EmptyState } from "@/components/ui";
import { cn } from "@/lib/cn";

interface Props {
  plans: LessonPlan[];
  units: Unit[];
}

/** ค้นหาแผน: เรื่อง / หน่วย / คำสำคัญ + กรองตามหน่วย */
export function PlanSearch({ plans, units }: Props) {
  const [q, setQ] = useState("");
  const [unitId, setUnitId] = useState<string | null>(null);

  const usedUnits = units.filter((u) => plans.some((p) => p.unitId === u.id));

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    return plans.filter((p) => {
      if (unitId && p.unitId !== unitId) return false;
      if (!query) return true;
      const unit = units.find((u) => u.id === p.unitId)?.name ?? "";
      const hay = [p.title, unit, p.strand ?? "", p.description, ...p.keywords, ...p.weeks.map((w) => w.title)].join(" ").toLowerCase();
      return hay.includes(query);
    });
  }, [q, unitId, plans, units]);

  return (
    <div>
      <label className="card flex items-center gap-3 px-4 py-2.5 focus-within:border-purple-300 sm:px-5">
        <Search size={20} className="shrink-0 text-purple-400" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ค้นหาเรื่อง / หน่วย / คำสำคัญ เช่น อาหาร, ร่างกาย, ครอบครัว"
          className="min-w-0 flex-1 bg-transparent py-1.5 text-base outline-none placeholder:text-ink-soft/70"
          aria-label="ค้นหาแผน"
        />
        {q && (
          <button type="button" onClick={() => setQ("")} aria-label="ล้างคำค้น" className="tap grid place-items-center rounded-full text-ink-soft hover:bg-purple-50">
            <X size={18} />
          </button>
        )}
      </label>

      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip active={unitId === null} onClick={() => setUnitId(null)}>ทุกหน่วย</Chip>
        {usedUnits.map((u) => (
          <Chip key={u.id} active={unitId === u.id} onClick={() => setUnitId(unitId === u.id ? null : u.id)}>
            {u.emoji} {u.name}
          </Chip>
        ))}
      </div>

      <p className="mt-5 mb-3 text-[15px] text-ink-soft">
        พบ <span className="font-medium text-purple-700">{results.length}</span> แผน
        {q && <> สำหรับ “{q}”</>}
      </p>

      {results.length === 0 ? (
        <EmptyState emoji="🔍" title="ไม่พบแผนที่ตรงกับคำค้น" hint="ลองใช้คำอื่น เช่น ชื่อหน่วย หรือคำสั้น ๆ" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {results.map((p) => (
            <PlanCard key={p.id} plan={p} className="animate-rise" />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "tap shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-[15px] transition-colors",
        active ? "border-purple-600 bg-purple-600 text-white shadow-soft" : "border-line bg-white text-ink hover:border-purple-200 hover:bg-purple-50",
      )}
    >
      {children}
    </button>
  );
}
