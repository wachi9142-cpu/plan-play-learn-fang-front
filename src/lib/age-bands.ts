/** ช่วงวัยของผู้เล่น — ใช้ได้ทั้งฝั่ง server และ client (ไม่มี "use client") */
export type AgeBandId = "toddler" | "kinder" | "primary" | "lower-sec" | "upper-sec" | "adult";
export interface AgeBand { id: AgeBandId; emoji: string; label: string; range: string; min: number; max: number; games: string[] }

export const AGE_BANDS: AgeBand[] = [
  { id: "toddler", emoji: "🐣", label: "ปฐมวัยเล็ก", range: "2–3 ปี", min: 0, max: 3, games: ["จับคู่สี", "รูปทรง", "จับคู่ภาพ", "ลำดับภาพ"] },
  { id: "kinder", emoji: "🌱", label: "อนุบาล", range: "4–6 ปี", min: 4, max: 6, games: ["จับคู่สี", "รูปทรง", "นับเลข", "ลำดับภาพ", "เกมเลื่อนตัวเลข 3×3"] },
  { id: "primary", emoji: "📚", label: "ประถมศึกษา", range: "7–12 ปี", min: 7, max: 12, games: ["คณิตศาสตร์", "ภาษาไทย", "ภาษาอังกฤษ", "วิทยาศาสตร์", "เกมตรรกะ", "Coding เบื้องต้น", "Puzzle"] },
  { id: "lower-sec", emoji: "🔎", label: "มัธยมต้น", range: "13–15 ปี", min: 13, max: 15, games: ["Coding", "Logic", "คณิตศาสตร์", "วิทยาศาสตร์", "ภาษาอังกฤษ", "Problem Solving"] },
  { id: "upper-sec", emoji: "🎓", label: "มัธยมปลาย", range: "16–18 ปี", min: 16, max: 18, games: ["Coding", "Algorithm", "Logic", "คณิตศาสตร์", "วิทยาศาสตร์", "เกมแก้โจทย์/Challenge"] },
  { id: "adult", emoji: "🧑", label: "ผู้เล่นทั่วไป", range: "18+ ปี", min: 19, max: 150, games: ["ทุกเกม"] },
];
export const bandForAge = (age: number): AgeBand => AGE_BANDS.find((b) => age >= b.min && age <= b.max) ?? AGE_BANDS[5];
/** ช่วงวัยของเกมจาก "4–6 ปี" / "3–5 ปี" */
export const bandsForRange = (range?: string): AgeBandId[] => { const m = range?.match(/(\d+)\s*[–-]\s*(\d+)/); if (!m) return ["kinder"]; const lo = +m[1], hi = +m[2]; return AGE_BANDS.filter((b) => b.max >= lo && b.min <= hi).map((b) => b.id); };

