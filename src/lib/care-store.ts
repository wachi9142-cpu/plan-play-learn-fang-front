"use client";

import type {
  Allergy, CareDB, DailyReport, LeaveKind, LeaveRequest, LunchWeek, MealAmount, MoodId,
  PickupChange, PickupPerson,
} from "@/types/care";

/**
 * 🧸 คลังข้อมูลการดูแลรายวัน — เก็บใน localStorage `lpg-care-v1`
 * ครอบคลุม: สมุดสื่อสารประจำวัน · เมนูอาหาร · ของแพ้ · แจ้งลา · คนมารับเด็ก
 *
 * ⚠️ ตอนนี้เก็บในเครื่องเดียว (เหมือนระบบอื่นในเว็บ) — ต้องย้ายขึ้นเซิร์ฟเวอร์
 *    ถึงจะให้ครูกับผู้ปกครองเห็นข้อมูลชุดเดียวกันได้จริง (รายการรอทำข้อ 6.2)
 */
const KEY = "lpg-care-v1";
export const CARE_EVENT = "lpg-care-change";

const EMPTY: CareDB = { reports: [], weeks: [], allergies: [], leaves: [], pickups: [], changes: [] };

const db = (): CareDB => {
  if (typeof window === "undefined") return EMPTY;
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    return v ? { ...EMPTY, ...v } : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
};

const write = (d: CareDB) => {
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* โหมดส่วนตัวเขียนไม่ได้ */ }
  window.dispatchEvent(new Event(CARE_EVENT));
};

const now = () => new Date().toISOString();
export const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
/**
 * วันที่แบบ YYYY-MM-DD ตาม "เวลาเครื่อง" ไม่ใช่เวลาสากล
 * (toISOString() เป็นเวลา UTC — ไทยเร็วกว่า 7 ชม. ช่วงเที่ยงคืนถึง 7 โมงเช้าจะได้วันที่ผิดไป 1 วัน)
 */
const pad = (n: number) => String(n).padStart(2, "0");
export const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => toISODate(new Date());

/* ───────── ป้ายกำกับสำหรับหน้าจอ ───────── */

export const MEAL_AMOUNTS: { id: MealAmount; emoji: string; label: string; tint: string }[] = [
  { id: "all", emoji: "😋", label: "หมดจาน", tint: "bg-mint-soft" },
  { id: "most", emoji: "🙂", label: "เกือบหมด", tint: "bg-sky-soft" },
  { id: "some", emoji: "😐", label: "กินได้นิดหน่อย", tint: "bg-yellow-soft" },
  { id: "none", emoji: "😣", label: "ไม่กินเลย", tint: "bg-pink-soft" },
];

export const MOODS: { id: MoodId; emoji: string; label: string }[] = [
  { id: "happy", emoji: "😄", label: "ร่าเริง สดใส" },
  { id: "normal", emoji: "🙂", label: "ปกติดี" },
  { id: "quiet", emoji: "😌", label: "เงียบ ๆ เรียบร้อย" },
  { id: "cry", emoji: "🥲", label: "งอแงบ้าง" },
  { id: "tired", emoji: "😴", label: "ง่วง เพลีย" },
  { id: "sick", emoji: "🤒", label: "ไม่ค่อยสบาย" },
];

export const MEAL_SLOTS: { id: keyof DailyReport["meals"]; emoji: string; label: string }[] = [
  { id: "snackAm", emoji: "🍎", label: "ว่างเช้า" },
  { id: "lunch", emoji: "🍚", label: "อาหารกลางวัน" },
  { id: "snackPm", emoji: "🥛", label: "ว่างบ่าย" },
];

/** กิจกรรมที่ครูกดเลือกได้เลย ไม่ต้องพิมพ์ */
export const ACTIVITY_CHIPS = [
  "ร้องเพลง", "เคลื่อนไหวตามจังหวะ", "ฟังนิทาน", "วาดรูป", "ปั้นดินน้ำมัน",
  "เล่นตามมุม", "เล่นกลางแจ้ง", "เกมการศึกษา", "ฝึกช่วยเหลือตัวเอง", "ทำงานศิลปะ",
];

/** ของที่ให้เตรียมมาพรุ่งนี้ */
export const BRING_CHIPS = ["ชุดสำรอง", "ผ้าอ้อม", "ขวดนม", "ยาประจำตัว", "ผ้าเช็ดตัว", "แปรงสีฟัน"];

export const LEAVE_KINDS: { id: LeaveKind; emoji: string; label: string }[] = [
  { id: "sick", emoji: "🤒", label: "ลาป่วย" },
  { id: "personal", emoji: "🏠", label: "ลากิจ" },
];

export const DAY_NAMES = ["", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];

/* ───────── 📔 สมุดสื่อสารประจำวัน ───────── */

export const listReports = (roomId: string, date?: string) =>
  db().reports.filter((r) => r.roomId === roomId && (!date || r.date === date));

export const reportOf = (roomId: string, childId: string, date: string) =>
  db().reports.find((r) => r.roomId === roomId && r.childId === childId && r.date === date);

/** ประวัติของเด็กคนหนึ่ง ใหม่ไปเก่า */
export const historyOf = (childId: string, limit = 30) =>
  db().reports.filter((r) => r.childId === childId).sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);

export function saveReport(input: Omit<DailyReport, "id" | "at"> & { id?: string }): DailyReport {
  const d = db();
  const exist = d.reports.find((r) => r.id === input.id)
    ?? d.reports.find((r) => r.roomId === input.roomId && r.childId === input.childId && r.date === input.date);
  const rep: DailyReport = { ...input, id: exist?.id ?? uid(), at: now() };
  d.reports = exist ? d.reports.map((r) => (r.id === rep.id ? rep : r)) : [...d.reports, rep];
  write(d);
  return rep;
}

export function removeReport(id: string) {
  const d = db();
  d.reports = d.reports.filter((r) => r.id !== id);
  write(d);
}

/* ───────── 🍚 เมนูอาหาร ───────── */

export const listWeeks = (): LunchWeek[] =>
  db().weeks.sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? ""));

export const getWeek = (id: string) => db().weeks.find((w) => w.id === id);

/** สัปดาห์ที่ใช้อยู่ตอนนี้ — อันที่วันจันทร์ใกล้วันนี้ที่สุดและไม่เกินวันนี้ */
export function currentWeek(): LunchWeek | undefined {
  const t = todayISO();
  const ws = listWeeks().filter((w) => w.startDate);
  return ws.find((w) => (w.startDate ?? "") <= t) ?? listWeeks()[0];
}

export function saveWeek(w: Omit<LunchWeek, "updatedAt" | "id"> & { id?: string }): LunchWeek {
  const d = db();
  const week: LunchWeek = { ...w, id: w.id ?? uid(), updatedAt: now() };
  d.weeks = d.weeks.some((x) => x.id === week.id) ? d.weeks.map((x) => (x.id === week.id ? week : x)) : [...d.weeks, week];
  write(d);
  return week;
}

export function removeWeek(id: string) {
  const d = db();
  d.weeks = d.weeks.filter((w) => w.id !== id);
  write(d);
}

/* ───────── ⚠️ ของแพ้ ───────── */

export const listAllergies = (roomId?: string) =>
  db().allergies.filter((a) => (!roomId || a.roomId === roomId) && a.items.length > 0);

export const allergyOf = (childId: string) => db().allergies.find((a) => a.childId === childId);

export function saveAllergy(a: Omit<Allergy, "updatedAt">) {
  const d = db();
  const rec: Allergy = { ...a, updatedAt: now() };
  d.allergies = d.allergies.some((x) => x.childId === a.childId)
    ? d.allergies.map((x) => (x.childId === a.childId ? rec : x))
    : [...d.allergies, rec];
  write(d);
}

/* ───────── 🏠 แจ้งลา ───────── */

export const listLeaves = (roomId?: string) =>
  db().leaves.filter((l) => !roomId || l.roomId === roomId).sort((a, b) => b.at.localeCompare(a.at));

/** คนที่ลาในวันนั้น */
export const leavesOn = (roomId: string, date: string) =>
  db().leaves.filter((l) => l.roomId === roomId && l.dates.includes(date));

export function addLeave(l: Omit<LeaveRequest, "id" | "at">): LeaveRequest {
  const d = db();
  const rec: LeaveRequest = { ...l, id: uid(), at: now() };
  d.leaves = [rec, ...d.leaves];
  write(d);
  return rec;
}

export function ackLeave(id: string) {
  const d = db();
  d.leaves = d.leaves.map((l) => (l.id === id ? { ...l, ack: true } : l));
  write(d);
}

export function removeLeave(id: string) {
  const d = db();
  d.leaves = d.leaves.filter((l) => l.id !== id);
  write(d);
}

/* ───────── 🚸 คนมารับเด็ก ───────── */

export const listPickups = (childId?: string, roomId?: string) =>
  db().pickups.filter((p) => (!childId || p.childId === childId) && (!roomId || p.roomId === roomId));

export function savePickup(p: Omit<PickupPerson, "id"> & { id?: string }): PickupPerson {
  const d = db();
  const rec: PickupPerson = { ...p, id: p.id ?? uid() };
  d.pickups = d.pickups.some((x) => x.id === rec.id) ? d.pickups.map((x) => (x.id === rec.id ? rec : x)) : [...d.pickups, rec];
  write(d);
  return rec;
}

export function removePickup(id: string) {
  const d = db();
  d.pickups = d.pickups.filter((p) => p.id !== id);
  write(d);
}

export const listChanges = (roomId?: string, date?: string) =>
  db().changes.filter((c) => (!roomId || c.roomId === roomId) && (!date || c.date === date)).sort((a, b) => b.date.localeCompare(a.date));

export function addChange(c: Omit<PickupChange, "id" | "at">): PickupChange {
  const d = db();
  const rec: PickupChange = { ...c, id: uid(), at: now() };
  d.changes = [rec, ...d.changes];
  write(d);
  return rec;
}

export function ackChange(id: string) {
  const d = db();
  d.changes = d.changes.map((c) => (c.id === id ? { ...c, ack: true } : c));
  write(d);
}

export function removeChange(id: string) {
  const d = db();
  d.changes = d.changes.filter((c) => c.id !== id);
  write(d);
}

/* ───────── 💾 สำรอง / นำกลับเข้ามา ───────── */

export const exportCare = () => JSON.stringify({ version: 1, savedAt: now(), data: db() }, null, 2);

export function downloadCareBackup() {
  const name = `care-${todayISO()}.json`;
  const url = URL.createObjectURL(new Blob([exportCare()], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return name;
}

export function importCare(text: string): { ok: boolean; message: string } {
  try {
    const v = JSON.parse(text);
    const data = v?.data ?? v;
    if (!data || typeof data !== "object" || !Array.isArray(data.reports)) {
      return { ok: false, message: "ไฟล์นี้ไม่ใช่ไฟล์สำรองข้อมูลการดูแลค่ะ" };
    }
    write({ ...EMPTY, ...data });
    return { ok: true, message: `นำเข้าสำเร็จ — บันทึกประจำวัน ${data.reports.length} รายการ` };
  } catch {
    return { ok: false, message: "อ่านไฟล์ไม่ได้ ลองเลือกไฟล์ .json ที่กดสำรองไว้อีกครั้งนะคะ" };
  }
}
