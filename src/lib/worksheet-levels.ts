import type { Worksheet } from "@/types";
import { getGrade } from "@/data/plans";

/** 🎒 ระดับชั้นอนุบาล 1–3 พร้อมช่วงอายุ (ตรงกับ GRADES ใน data/plans.ts) */
export const KINDER_LEVELS = [
  { id: "k1", short: "อ.1", name: "อนุบาล 1", min: 3, max: 4, emoji: "💜" },
  { id: "k2", short: "อ.2", name: "อนุบาล 2", min: 4, max: 5, emoji: "🌷" },
  { id: "k3", short: "อ.3", name: "อนุบาล 3", min: 5, max: 6, emoji: "🌈" },
] as const;
export type KinderLevelId = (typeof KINDER_LEVELS)[number]["id"];

/** อายุที่เหมาะ เช่น "4–6 ปี" — ใช้ค่าในใบงาน ถ้าไม่มีใช้ของระดับชั้น */
export const worksheetAges = (w: Worksheet) => w.ages ?? getGrade(w.gradeId)?.ages;

/**
 * ใบงานนี้เหมาะกับอนุบาลชั้นไหน — กำหนดเองได้ด้วย w.levels
 * ถ้าไม่กำหนด คิดจากช่วงอายุ (ต้องทับกันจริง ไม่นับแค่ตรงขอบ เช่น 3–4 ปี = อ.1 เท่านั้น)
 */
export function kinderLevels(w: Worksheet): KinderLevelId[] {
  if (w.levels?.length) return w.levels;
  const m = worksheetAges(w)?.match(/(\d+)\s*[–-]\s*(\d+)/);
  if (!m) return [];
  const lo = +m[1], hi = +m[2];
  return KINDER_LEVELS.filter((l) => l.min < hi && l.max > lo).map((l) => l.id);
}

/** ข้อความสั้น เช่น "อ.1–อ.3" / "อ.2" / "" */
export function kinderLevelLabel(ids: KinderLevelId[]): string {
  const s = KINDER_LEVELS.filter((l) => ids.includes(l.id)).map((l) => l.short);
  return s.length > 2 ? `${s[0]}–${s[s.length - 1]}` : s.join(", ");
}
