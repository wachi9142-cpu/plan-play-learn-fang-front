"use client";

import { uid } from "./studio-store";

/**
 * 📈 บันทึกพัฒนาการ 4 ด้าน — ร่างกาย · อารมณ์-จิตใจ · สังคม · สติปัญญา
 * เก็บใน localStorage `lpg-development-v1` · ผู้ปกครองเห็นเฉพาะบุตรหลาน (กรองด้วยชื่อเด็ก)
 */
export type Domain = "physical" | "emotional" | "social" | "cognitive";
export type Level = "start" | "progress" | "good";

export interface DevRecord {
  id: string;
  childName: string;
  roomId?: string;
  domain: Domain;
  date: string;          // ISO
  note: string;
  level: Level;
  by: string;
  planId?: string;
  indicator?: string;    // ตัวบ่งชี้/สภาพที่พึงประสงค์จากหลักสูตร
  curriculumId?: string;
}

export const DOMAINS: { id: Domain; emoji: string; label: string; hint: string; tint: string }[] = [
  { id: "physical", emoji: "💪", label: "ด้านร่างกาย", hint: "การเจริญเติบโต สุขนิสัย กล้ามเนื้อใหญ่–เล็ก ความปลอดภัย", tint: "bg-mint-soft" },
  { id: "emotional", emoji: "💛", label: "ด้านอารมณ์ จิตใจ", hint: "สุขภาพจิต การแสดงออกทางอารมณ์ สุนทรียภาพ คุณธรรม", tint: "bg-yellow-soft" },
  { id: "social", emoji: "🤝", label: "ด้านสังคม", hint: "ช่วยเหลือตนเอง วินัย อยู่ร่วมกับผู้อื่น รักธรรมชาติและความเป็นไทย", tint: "bg-sky-soft" },
  { id: "cognitive", emoji: "🧠", label: "ด้านสติปัญญา", hint: "ภาษา การคิด จินตนาการ เจตคติต่อการเรียนรู้", tint: "bg-purple-100" },
];
export const LEVELS: Record<Level, { emoji: string; label: string; cls: string }> = {
  start: { emoji: "🌱", label: "เริ่มพัฒนา", cls: "bg-cream text-ink-soft" },
  progress: { emoji: "🌿", label: "กำลังพัฒนา", cls: "bg-yellow-soft text-yellow-800" },
  good: { emoji: "🌳", label: "พัฒนาตามวัย", cls: "bg-mint-soft text-green-800" },
};

const KEY = "lpg-development-v1";
export const DEV_EVENT = "lpg-development-change";
const read = (): DevRecord[] => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const write = (v: DevRecord[]) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* */ } window.dispatchEvent(new Event(DEV_EVENT)); };

export const listDev = (): DevRecord[] => read().sort((a, b) => b.date.localeCompare(a.date));
export const devOf = (childName: string) => listDev().filter((r) => r.childName === childName);
export function addDev(r: Omit<DevRecord, "id" | "date"> & { date?: string }): DevRecord {
  const rec: DevRecord = { ...r, id: uid(), date: r.date ?? new Date().toISOString() };
  write([...read(), rec]); return rec;
}
export function updateDev(id: string, patch: Partial<DevRecord>) { write(read().map((r) => (r.id === id ? { ...r, ...patch } : r))); }
export function removeDev(id: string) { write(read().filter((r) => r.id !== id)); }
export const devChildren = () => Array.from(new Set(read().map((r) => r.childName)));

/** สรุปต่อเด็ก: จำนวนบันทึกและระดับล่าสุดของแต่ละด้าน */
export function summary(childName: string) {
  const rs = devOf(childName);
  return DOMAINS.map((d) => { const mine = rs.filter((r) => r.domain === d.id); return { domain: d, count: mine.length, latest: mine[0] }; });
}
