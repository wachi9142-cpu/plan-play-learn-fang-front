/**
 * 🎆 ตารางเปิดเอฟเฟกต์เทศกาลอัตโนมัติ
 *
 * - เทศกาลแต่ละงาน = เอฟเฟกต์ 1 ตัว + วันเทศกาล + ช่วงเปิด (วันเริ่ม–วันสิ้นสุด รวมทั้งสองวัน)
 * - ค่าเริ่มต้นของช่วงเปิด = ก่อนวันงาน 1 วัน · วันงาน · หลังวันงาน 1 วัน (รวม 3 วันปฏิทิน)
 * - เทียบวันที่ตามเวลาไทย (Asia/Bangkok) เสมอ ไม่ว่าเครื่องผู้ใช้ตั้งโซนเวลาไหน
 * - ใช้วันที่ที่ผู้ดูแลกำหนดจริง ไม่คำนวณวันเทศกาลไทยจากสูตร — ปีใหม่ให้ผู้ดูแลเพิ่มรายการของปีนั้นเอง
 * - หลายงานตรงกัน → เปิดเฉพาะงานที่ลำดับความสำคัญสูงสุด (เลขน้อย = สำคัญกว่า) ทีละ 1 เอฟเฟกต์
 *
 * ผู้ดูแลแก้ได้ที่ /admin · เก็บในเครื่อง (localStorage) จนกว่าจะมีระบบหลังบ้านจริง
 * Activity Mode ยังปิดเอฟเฟกต์ในหน้าเกม/ใบงาน/Studio/ห้องเรียนออนไลน์เหมือนเดิม (ดู Ambient.tsx)
 */

import type { EffectId } from "./ambient-effects";

export const FESTIVAL_TZ = "Asia/Bangkok";

export interface Festival {
  id: string;
  effectId: EffectId;
  name: string;
  /** วันเทศกาล YYYY-MM-DD */
  date: string;
  /** วันแรกที่เปิดเอฟเฟกต์ YYYY-MM-DD */
  start: string;
  /** วันสุดท้ายที่เปิดเอฟเฟกต์ YYYY-MM-DD (รวมวันนี้ด้วย) */
  end: string;
  enabled: boolean;
  /** ลำดับความสำคัญเมื่อหลายงานตรงกัน — เลขน้อยชนะ */
  priority: number;
  /** ผู้ดูแลยังไม่ได้ยืนยันว่าเป็นวันจัดงานจริงของปีนั้น */
  unconfirmed?: boolean;
}

/** เลื่อนวันที่ YYYY-MM-DD ไป n วัน (คิดแบบปฏิทิน ไม่ขึ้นกับโซนเวลา) */
export function shiftDate(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return t.toISOString().slice(0, 10);
}

/** ช่วงเปิดค่าเริ่มต้น: ก่อน 1 วัน · วันงาน · หลัง 1 วัน */
export function defaultWindow(date: string) {
  return { start: shiftDate(date, -1), end: shiftDate(date, 1) };
}

const make = (id: string, effectId: EffectId, name: string, date: string, priority: number, unconfirmed = false): Festival => ({
  id, effectId, name, date, ...defaultWindow(date), enabled: true, priority, unconfirmed,
});

/**
 * ค่าตั้งต้นจากโค้ด — วันเทศกาลตามจันทรคติ (ออกพรรษา ลอยกระทง ยี่เป็ง) ใส่ไว้เป็นค่าประมาณ
 * ต้องให้ผู้ดูแลตรวจวันจัดงานจริงก่อน (ขึ้นป้าย "รอยืนยันวันที่" ในหน้าผู้ดูแล)
 */
export const BUILT_IN_FESTIVALS: Festival[] = [
  make("halloween-2026", "halloween", "ฮาโลวีน 2569", "2026-10-31", 40),
  make("loykrathong-2026", "loykrathong", "วันลอยกระทง 2569", "2026-11-24", 10, true),
  make("lanternfest-2026", "lanternfest", "ยี่เป็ง เทศกาลโคมลอย 2569", "2026-11-24", 20, true),
  make("christmas-2026", "christmas", "คริสต์มาส 2569", "2026-12-25", 30),
  make("newyear-2027", "newyear", "ปีใหม่ 2570", "2027-01-01", 5),
  make("nagafire-2027", "nagafire", "ออกพรรษา · ลูกไฟพญานาค 2570", "2027-10-15", 10, true),
];

/* ---------- ค่าที่ผู้ดูแลแก้/เพิ่ม (เก็บในเครื่อง) ---------- */

export const FESTIVAL_KEY = "lpg-festival-schedule-v1";
export const FESTIVAL_EVENT = "lpg-festival-schedule";
/** ผู้ใช้ปิดเอฟเฟกต์เทศกาลอัตโนมัติเฉพาะเครื่องตัวเอง ("off") */
export const FESTIVAL_USER_KEY = "lpg-festival-auto-v1";

interface Stored {
  /** แก้ทับรายการจากโค้ด */
  overrides: Record<string, Partial<Festival>>;
  /** รายการที่ผู้ดูแลเพิ่มเอง เช่น ลอยกระทงปีหน้า */
  added: Festival[];
  /** id ของรายการจากโค้ดที่ผู้ดูแลลบ */
  removed: string[];
}

function readStored(): Stored {
  const empty: Stored = { overrides: {}, added: [], removed: [] };
  if (typeof window === "undefined") return empty;
  try {
    return { ...empty, ...(JSON.parse(localStorage.getItem(FESTIVAL_KEY) || "{}") as Partial<Stored>) };
  } catch {
    return empty;
  }
}

function writeStored(s: Stored) {
  try { localStorage.setItem(FESTIVAL_KEY, JSON.stringify(s)); } catch { /* */ }
  window.dispatchEvent(new CustomEvent(FESTIVAL_EVENT));
}

/** รายการเทศกาลทั้งหมด (รวมค่าที่ผู้ดูแลแก้) เรียงตามวันเริ่ม */
export function listFestivals(): Festival[] {
  const s = readStored();
  const builtIn = BUILT_IN_FESTIVALS.filter((f) => !s.removed.includes(f.id)).map((f) => ({ ...f, ...s.overrides[f.id] }));
  return [...builtIn, ...s.added].sort((a, b) => a.start.localeCompare(b.start) || a.priority - b.priority);
}

export function updateFestival(id: string, patch: Partial<Festival>) {
  const s = readStored();
  const i = s.added.findIndex((f) => f.id === id);
  if (i >= 0) s.added[i] = { ...s.added[i], ...patch };
  else s.overrides[id] = { ...s.overrides[id], ...patch };
  writeStored(s);
}

export function addFestival(f: Omit<Festival, "id">): Festival {
  const s = readStored();
  const item: Festival = { ...f, id: `${f.effectId}-${Date.now().toString(36)}` };
  s.added.push(item);
  writeStored(s);
  return item;
}

export function removeFestival(id: string) {
  const s = readStored();
  s.added = s.added.filter((f) => f.id !== id);
  if (BUILT_IN_FESTIVALS.some((f) => f.id === id)) s.removed = [...new Set([...s.removed, id])];
  writeStored(s);
}

export function resetFestivals() {
  try { localStorage.removeItem(FESTIVAL_KEY); } catch { /* */ }
  window.dispatchEvent(new CustomEvent(FESTIVAL_EVENT));
}

/* ---------- เวลาไทย + เทศกาลที่เปิดอยู่ ---------- */

/** วันนี้ตามเวลาไทย YYYY-MM-DD */
export function todayInThailand(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: FESTIVAL_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** งานที่อยู่ในช่วงเปิดวันนี้ เรียงตามความสำคัญ (ตัวแรก = ตัวที่ได้แสดง) */
export function festivalsToday(list: Festival[] = listFestivals(), now: Date = new Date()): Festival[] {
  const today = todayInThailand(now);
  return list.filter((f) => f.enabled && f.start <= today && today <= f.end).sort((a, b) => a.priority - b.priority);
}

export function activeFestival(list?: Festival[], now?: Date): Festival | null {
  return festivalsToday(list, now)[0] ?? null;
}

/* ---------- การตั้งค่าส่วนตัวของผู้ใช้ ---------- */

export function festivalAutoOn(): boolean {
  if (typeof window === "undefined") return true;
  try { return localStorage.getItem(FESTIVAL_USER_KEY) !== "off"; } catch { return true; }
}

export function setFestivalAuto(on: boolean) {
  try { localStorage.setItem(FESTIVAL_USER_KEY, on ? "on" : "off"); } catch { /* */ }
  window.dispatchEvent(new CustomEvent(FESTIVAL_EVENT));
}
