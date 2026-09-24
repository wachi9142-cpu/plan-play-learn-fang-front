"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

/** รายการในแถบลอย — เพิ่ม/ลดได้ที่นี่ */
const DOCK_ITEMS: { href: string; emoji: string; label: string; image?: string }[] = [
  { href: "/calendar", emoji: "📅", label: "ปฏิทิน", image: "/nav/calendar.webp" },
  { href: "/school-events", emoji: "🎈", label: "กิจกรรม" },
  { href: "/news", emoji: "📢", label: "ประชาสัมพันธ์", image: "/news/announce.webp" },
  { href: "/worksheets", emoji: "📝", label: "ใบงาน" },
  { href: "/play", emoji: "🎮", label: "เกม" },
  { href: "/gallery/works", emoji: "🏆", label: "ผลงานเด็ก", image: "/nav/trophy.webp" },
  { href: "/search", emoji: "🔍", label: "ค้นหา", image: "/nav/search.webp" },
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
            <span className={cn("grid h-7 place-items-center text-2xl leading-none transition-transform group-hover:-translate-y-0.5", active && "scale-110")}>
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt="" className="h-7! w-auto object-contain" />
              ) : (
                item.emoji
              )}
            </span>
            <span className={cn("text-[11px] leading-tight", active && "font-medium")}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
