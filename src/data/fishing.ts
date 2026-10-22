/**
 * 🎣 เกมตกปลาเก็บคะแนน — ชนิดปลาและฉาก
 *
 * ปลาตัวเล็กจับง่ายคะแนนน้อย · ตัวใหญ่ว่ายเร็วคะแนนมาก
 * ปลาพิเศษเป็นปลาสีรุ้งเรืองแสง โอกาสออกน้อยที่สุด
 */

export type FishKind = "small" | "medium" | "gold" | "special";

export interface FishType {
  kind: FishKind;
  emoji: string;
  label: string;
  labelEn: string;
  /** คะแนนเมื่อตกได้ */
  score: number;
  /** ความเร็วว่าย (% ของความกว้างบ่อ ต่อวินาที) */
  speed: [number, number];
  /** ขนาดตัว คิดเป็น % ของความกว้างบ่อ */
  size: number;
  /** โอกาสออกเทียบกัน ยิ่งมากยิ่งเจอบ่อย */
  weight: number;
  hint: string;
}

export const FISH_TYPES: FishType[] = [
  { kind: "small", emoji: "🐟", label: "ปลาตัวเล็ก", labelEn: "Small Fish", score: 1, speed: [7, 11], size: 7, weight: 50, hint: "จับง่าย · คะแนนน้อย" },
  { kind: "medium", emoji: "🐠", label: "ปลาตัวกลาง", labelEn: "Medium Fish", score: 3, speed: [12, 17], size: 9, weight: 30, hint: "ว่ายเร็วขึ้นเล็กน้อย" },
  { kind: "gold", emoji: "🐟", label: "ปลาสีทอง", labelEn: "Golden Fish", score: 5, speed: [18, 24], size: 8, weight: 14, hint: "หายาก · คะแนนสูง" },
  { kind: "special", emoji: "🐠", label: "ปลาพิเศษ", labelEn: "Rainbow Fish", score: 10, speed: [22, 28], size: 10, weight: 6, hint: "พบได้น้อย · โบนัสพิเศษ" },
];

export const fishType = (k: FishKind) => FISH_TYPES.find((f) => f.kind === k)!;

export interface Pond {
  id: string;
  emoji: string;
  label: string;
  labelEn: string;
  hint: string;
  tint: string;
  /** สีน้ำบน–ล่าง */
  water: [string, string];
  /** สีฟ้าเหนือผิวน้ำ */
  sky: [string, string];
  /** ของตกแต่งใต้น้ำ วางเรียงตามพื้น */
  decor: string[];
  /** ของตกแต่งเหนือน้ำ */
  above: string[];
}

export const PONDS: Pond[] = [
  {
    id: "garden",
    emoji: "🪷",
    label: "บ่อน้ำในสวน",
    labelEn: "Garden Pond",
    hint: "บ่อน้ำใสในสวนดอกไม้ มีปลาหลายขนาดว่ายไปมา",
    tint: "bg-mint-soft",
    water: ["#8fd3f4", "#3f8fc4"],
    sky: ["#dff3ff", "#bfe6c9"],
    decor: ["🪨", "🌿", "🪷", "🌱", "🪨", "🌿"],
    above: ["🌳", "🌻", "🦋", "🌷"],
  },
  {
    id: "sea",
    emoji: "🪸",
    label: "ทะเลใต้น้ำ",
    labelEn: "Under the Sea",
    hint: "ใต้ทะเลลึกมีปะการังและปลาหลากสี ปลาพิเศษชอบซ่อนอยู่แถวนี้",
    tint: "bg-sky-soft",
    water: ["#4fc3e8", "#1b5e8f"],
    sky: ["#cdeeff", "#8fd3f4"],
    decor: ["🪸", "🐚", "🌿", "🪸", "⭐", "🪨"],
    above: ["☁️", "⛵", "☀️", "🪽"],
  },
];

export const findPond = (id: string) => PONDS.find((p) => p.id === id);

/** คำชมตอนตกปลาได้ — เลือกตามชนิดปลา */
export const CATCH_WORDS: Record<FishKind, string> = {
  small: "ได้แล้ว!",
  medium: "เก่งมาก!",
  gold: "ว้าว ปลาสีทอง!",
  special: "สุดยอด! จับปลาพิเศษได้",
};
