"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { DEFAULT_ZONE, TIMEZONES, dateIn, dayIn, timeIn, timeWithSeconds, useNow, utcOffset } from "@/lib/clock";

/**
 * 🌱 “เวลาของสวนวันนี้” — นาฬิกาเวลาไทยใน Header (แสดงทุกหน้า · 24 ชม. · อัปเดตทุกวินาที)
 * เดสก์ท็อป/แท็บเล็ต: 🌱 19:20 น. + คำว่า “เวลาของสวนวันนี้” ใต้เวลา — มือถือ: 🌱 19:20 เท่านั้น
 * กดเพื่อดูรายละเอียด: วัน · วันที่ · เวลาพร้อมวินาที · โซนเวลา (รองรับเพิ่มประเทศอื่นในอนาคต)
 */
export function ThaiClock({ className }: { className?: string }) {
  const { now, synced } = useNow();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const zone = DEFAULT_ZONE;

  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("mousedown", off); window.addEventListener("keydown", esc);
    return () => { window.removeEventListener("mousedown", off); window.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={now ? `เวลาของสวนวันนี้ ${timeIn(now, zone.tz)} น. (เวลาประเทศไทย) กดเพื่อดูรายละเอียด` : "เวลาของสวนวันนี้"}
        className="tap inline-flex flex-col items-end whitespace-nowrap rounded-2xl px-2.5 py-1 leading-tight transition-colors hover:bg-purple-50"
      >
        <span className="inline-flex items-baseline gap-1 text-[15px] font-medium text-purple-800">
          <span aria-hidden>🌱</span>
          <span className="font-mono tabular-nums">{now ? timeIn(now, zone.tz) : "--:--"}</span>
          <span className="hidden text-[13px] sm:inline">น.</span>
        </span>
        <span className="hidden text-[11px] text-ink-soft md:block">เวลาของสวนวันนี้</span>
      </button>

      {open && now && (
        <div className="absolute right-0 z-50 mt-1.5 w-64 rounded-2xl border border-line bg-white p-3 text-[13px] shadow-lg animate-rise">
          <p className="font-display text-[15px] text-purple-800">🌱 เวลาของสวนวันนี้</p>
          <p className="text-[12px] text-ink-soft">{zone.flag} เวลาใน{zone.label}</p>
          <p className="mt-1 font-mono text-3xl tabular-nums text-purple-700">{timeWithSeconds(now, zone.tz)}</p>
          <p className="mt-1 text-ink-soft">{dayIn(now, zone.tz)}ที่ {dateIn(now, zone.tz)}</p>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-[12px] text-ink-soft">
            <dt>โซนเวลา</dt><dd className="text-ink">{zone.tz} ({utcOffset(now, zone.tz)})</dd>
            <dt>รูปแบบ</dt><dd className="text-ink">24 ชั่วโมง</dd>
            <dt>อ้างอิง</dt><dd className="text-ink">{synced ? "🟢 เวลาจากเซิร์ฟเวอร์" : "🟡 เวลาจากเครื่องนี้"}</dd>
          </dl>
          {TIMEZONES.length > 1 && (
            <ul className="mt-2 space-y-1 border-t border-line pt-2 text-[12px]">
              {TIMEZONES.filter((z) => z.id !== zone.id).map((z) => (
                <li key={z.id} className="flex items-center justify-between"><span>{z.flag} {z.label}</span><span className="font-mono tabular-nums">{timeIn(now, z.tz)}</span></li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
