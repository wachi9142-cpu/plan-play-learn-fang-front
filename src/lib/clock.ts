"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 🕐 นาฬิกาเวลาไทย (Asia/Bangkok) — โครงสร้างรองรับหลาย timezone ตั้งแต่แรก
 * ค่าเริ่มต้นของ Little Purple Garden = 🇹🇭 ประเทศไทย · เพิ่มโซนใหม่ = เพิ่ม object ใน TIMEZONES
 * เวลาไม่อิงนาฬิกาเครื่องอย่างเดียว: ซิงก์ส่วนต่างจากเวลาเซิร์ฟเวอร์ (header `Date`) แล้วชดเชยตลอด
 */
export interface Zone { id: string; tz: string; flag: string; label: string; short: string }

export const TIMEZONES: Zone[] = [
  { id: "th", tz: "Asia/Bangkok", flag: "🇹🇭", label: "ประเทศไทย", short: "เวลาไทย" },
  // เพิ่มในอนาคตได้ทันทีโดยไม่ต้องแก้ระบบหลัก เช่น
  // { id: "jp", tz: "Asia/Tokyo", flag: "🇯🇵", label: "ญี่ปุ่น", short: "เวลาญี่ปุ่น" },
  // { id: "uk", tz: "Europe/London", flag: "🇬🇧", label: "อังกฤษ", short: "เวลาอังกฤษ" },
  // { id: "us", tz: "America/New_York", flag: "🇺🇸", label: "สหรัฐฯ (ตะวันออก)", short: "เวลาสหรัฐฯ" },
];
export const DEFAULT_ZONE = TIMEZONES[0];

const fmt = (tz: string, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("th-TH", { timeZone: tz, ...opts });
/** เวลา 24 ชั่วโมง เช่น 08:30 · 19:45 */
export const timeIn = (d: Date, tz: string) => fmt(tz, { hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
export const timeWithSeconds = (d: Date, tz: string) => fmt(tz, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(d);
export const dayIn = (d: Date, tz: string) => fmt(tz, { weekday: "long" }).format(d);
/** วันที่แบบไทย เช่น 22 กันยายน 2569 (พ.ศ.) */
export const dateIn = (d: Date, tz: string) => fmt(tz, { day: "numeric", month: "long", year: "numeric" }).format(d);
/** ส่วนต่างจาก UTC ของโซนนั้น เช่น "UTC+7" */
export function utcOffset(d: Date, tz: string) {
  const s = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "longOffset" }).formatToParts(d).find((p) => p.type === "timeZoneName")?.value ?? "GMT+00:00";
  const m = s.match(/([+-])(\d{2}):(\d{2})/);
  if (!m) return "UTC+0";
  const h = Number(m[2]), mi = Number(m[3]);
  return `UTC${m[1]}${h}${mi ? `:${String(mi).padStart(2, "0")}` : ""}`;
}

/**
 * เวลาปัจจุบันที่ชดเชยแล้ว + สถานะการซิงก์
 * ซิงก์ครั้งแรกตอน mount และทุก 30 นาที · ถ้าออฟไลน์/ซิงก์ไม่ได้จะใช้นาฬิกาเครื่องแทน
 */
export function useNow(tickMs = 1000) {
  const [now, setNow] = useState<Date | null>(null);   // null = ยังไม่ mount (กัน hydration ไม่ตรงกัน)
  const [synced, setSynced] = useState(false);
  const offset = useRef(0);                            // เวลาเซิร์ฟเวอร์ − เวลาเครื่อง (ms)

  useEffect(() => {
    let alive = true;
    const sync = async () => {
      try {
        const t0 = Date.now();
        const res = await fetch("/manifest.webmanifest", { method: "HEAD", cache: "no-store" });
        const date = res.headers.get("date");
        if (!date || !alive) return;
        const rtt = Date.now() - t0;
        offset.current = new Date(date).getTime() + rtt / 2 - Date.now();
        setSynced(true);
      } catch { /* ออฟไลน์ → ใช้เวลาเครื่อง */ }
    };
    sync();
    const resync = setInterval(sync, 30 * 60 * 1000);
    const tick = setInterval(() => setNow(new Date(Date.now() + offset.current)), tickMs);
    setNow(new Date(Date.now() + offset.current));
    window.addEventListener("online", sync);
    return () => { alive = false; clearInterval(resync); clearInterval(tick); window.removeEventListener("online", sync); };
  }, [tickMs]);

  return { now, synced };
}
