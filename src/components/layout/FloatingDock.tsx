"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { ThemeMenuPanel } from "@/components/theme";

/** รายการในแถบลอย — เพิ่ม/ลดได้ที่นี่ */
const DOCK_ITEMS = [
  { href: "/news", emoji: "📢", label: "ประชาสัมพันธ์" },
  { href: "/worksheets", emoji: "📝", label: "ใบงาน" },
  { href: "/play", emoji: "🎮", label: "เกม" },
  { href: "/gallery/works", emoji: "🏆", label: "ผลงานเด็ก" },
  { href: "/search", emoji: "🔍", label: "ค้นหา" },
];

/** แถบลอยด้านขวา (แท็บเล็ต/desktop) — ทางลัดไปส่วนที่ใช้บ่อย */
export function FloatingDock() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="ทางลัด"
      className="no-print fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-0.5 rounded-3xl border border-line bg-white/90 p-1.5 shadow-lift backdrop-blur md:flex xl:right-5"
    >
      {DOCK_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={cn(
              "group flex w-[80px] flex-col items-center gap-0.5 rounded-2xl px-1 py-2.5 text-center transition-all",
              active ? "bg-purple-100 text-purple-800" : "text-ink-soft hover:bg-purple-50 hover:text-purple-700",
            )}
          >
            <span className={cn("text-2xl leading-none transition-transform group-hover:-translate-y-0.5", active && "scale-110")}>{item.emoji}</span>
            <span className={cn("text-[11px] leading-tight", active && "font-medium")}>{item.label}</span>
          </Link>
        );
      })}
      <DockSettings />
    </nav>
  );
}

/** ⚙️ เมนูตั้งค่าในแถบลอย — เปลี่ยนธีม ☀️ 🌙 ⚙️ ได้จากตรงนี้เลย */
function DockSettings() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = pathname === "/settings";

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="ตั้งค่า · ธีมการแสดงผล"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "group flex w-[80px] flex-col items-center gap-0.5 rounded-2xl px-1 py-2.5 text-center transition-all",
          active || open ? "bg-purple-100 text-purple-800" : "text-ink-soft hover:bg-purple-50 hover:text-purple-700",
        )}
      >
        <span className={cn("text-2xl leading-none transition-transform group-hover:-translate-y-0.5", (active || open) && "scale-110")}>⚙️</span>
        <span className={cn("text-[11px] leading-tight", (active || open) && "font-medium")}>ตั้งค่า</span>
      </button>
      {/* เปิดออกทางซ้าย เพราะแถบลอยชิดขอบขวา */}
      <div
        role="menu"
        className={cn(
          "absolute right-full top-1/2 z-50 w-64 -translate-y-1/2 pr-2 transition-all duration-150",
          open ? "visible translate-x-0 opacity-100" : "invisible translate-x-1 opacity-0",
        )}
      >
        <div className="card overflow-hidden p-1.5">
          <ThemeMenuPanel onPicked={() => setOpen(false)} />
        </div>
      </div>
    </div>
  );
}
