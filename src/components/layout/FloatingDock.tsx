"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { WorksheetCategory } from "@/types";
import { WORKSHEET_CATEGORIES } from "@/data/worksheets";
import { cn } from "@/lib/cn";

/** ชื่อสั้นของหมวดใบงานสำหรับแถบลอย */
const SHORT: Record<WorksheetCategory, string> = {
  language: "ภาษา",
  math: "คณิต",
  color: "สี/รูปทรง",
  thinking: "การคิด",
  unit: "ตามหน่วย",
};

/** แถบลอยด้านขวา (แท็บเล็ต/desktop) — ทางลัดไปคลังใบงานและหมวดใบงาน */
export function FloatingDock() {
  return (
    <Suspense fallback={null}>
      <Dock />
    </Suspense>
  );
}

function Dock() {
  const pathname = usePathname();
  const cat = useSearchParams().get("cat");
  const onWorksheets = pathname.startsWith("/worksheets");
  const cats = Object.keys(WORKSHEET_CATEGORIES) as WorksheetCategory[];

  return (
    <nav
      aria-label="ทางลัดใบงาน"
      className="no-print fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-0.5 rounded-3xl border border-line bg-white/90 p-1.5 shadow-lift backdrop-blur md:flex xl:right-5"
    >
      <DockLink href="/worksheets" emoji="📝" label="ใบงาน" active={onWorksheets && !cat} highlight />
      <div className="mx-2 my-0.5 h-px bg-line" />
      {cats.map((c) => (
        <DockLink key={c} href={`/worksheets?cat=${c}`} emoji={WORKSHEET_CATEGORIES[c].emoji} label={SHORT[c]} active={onWorksheets && cat === c} />
      ))}
    </nav>
  );
}

function DockLink({ href, emoji, label, active, highlight = false }: { href: string; emoji: string; label: string; active: boolean; highlight?: boolean }) {
  return (
    <Link
      href={href}
      title={label}
      className={cn(
        "group flex w-[68px] flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-center transition-all",
        active ? "bg-purple-100 text-purple-800" : highlight ? "text-purple-700 hover:bg-purple-50" : "text-ink-soft hover:bg-purple-50 hover:text-purple-700",
      )}
    >
      <span className={cn("text-2xl leading-none transition-transform group-hover:-translate-y-0.5", active && "scale-110")}>{emoji}</span>
      <span className={cn("text-[11px] leading-tight", (active || highlight) && "font-medium")}>{label}</span>
    </Link>
  );
}
