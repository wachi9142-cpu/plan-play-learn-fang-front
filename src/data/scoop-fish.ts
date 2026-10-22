/**
 * 🥅 เกมช้อนปลางานวัด — ข้อมูลปลา สีปลา ช้อนกระดาษ และคนรับซื้อ
 *
 * จำลองซุ้มช้อนปลาตามงานวัดไทย — ช้อนทำจากกระดาษบาง ๆ จุ่มน้ำนานก็เปื่อย
 * ตักปลาตัวใหญ่หรือยกเร็วเกินไปกระดาษก็ขาด ต้องซื้อช้อนใหม่ด้วยเงินในเกม
 *
 * ⚠️ แยกให้ชัด 2 อย่าง
 *   • คะแนนช้อนปลา — ได้จากการช้อนปลาขึ้นมาได้
 *   • เงิน — ได้จากการเอาปลาในแก้วไปขายให้คนรับซื้อ
 */

export type FishKind = "guppy" | "medium" | "fancy";

/** สีปลา — ใช้หมุนสี (hue) ของอีโมจิ จึงได้ปลาหลายสีโดยไม่ต้องรอภาพจริง */
export interface FishColor {
  id: string;
  name: string;
  /** องศาหมุนสี */
  hue: number;
}

export const FISH_COLORS: FishColor[] = [
  { id: "red", name: "สีแดง", hue: -35 },
  { id: "orange", name: "สีส้ม", hue: -15 },
  { id: "yellow", name: "สีเหลือง", hue: 25 },
  { id: "green", name: "สีเขียว", hue: 80 },
  { id: "blue", name: "สีฟ้า", hue: 0 },
  { id: "purple", name: "สีม่วง", hue: 55 },
  { id: "pink", name: "สีชมพู", hue: -60 },
];

export interface FishKindInfo {
  kind: FishKind;
  emoji: string;
  /** ชื่อนำหน้า เช่น "ปลาหางนกยูง" + สี */
  baseName: string;
  nameEn: string;
  /** ขนาดตัว คิดเป็น % ของความกว้างอ่าง */
  size: number;
  /** ความเร็วว่าย %/วินาที */
  speed: [number, number];
  /** โอกาสดิ้นหลุดต่อวินาทีขณะอยู่บนช้อน */
  wriggle: number;
  /** ยิ่งตัวใหญ่ยิ่งหนัก กระดาษเปื่อยเร็ว */
  weight: number;
  /** คะแนนตอนช้อนได้ */
  score: number;
  /** ราคาขายให้คนรับซื้อ (บาทจำลอง) */
  price: number;
  /** โอกาสออก ยิ่งมากยิ่งเจอบ่อย */
  weight_spawn: number;
  hint: string;
}

export const FISH_KINDS: FishKindInfo[] = [
  {
    kind: "guppy",
    emoji: "🐟",
    baseName: "ปลาหางนกยูง",
    nameEn: "Guppy",
    size: 6,
    speed: [14, 22],
    wriggle: 0.35,
    weight: 1,
    score: 1,
    price: 2,
    weight_spawn: 56,
    hint: "ตัวเล็ก ว่ายเร็วและเปลี่ยนทิศบ่อย · ขายได้ราคาน้อย",
  },
  {
    kind: "medium",
    emoji: "🐠",
    baseName: "ปลาตัวกลาง",
    nameEn: "Medium Fish",
    size: 9,
    speed: [10, 16],
    wriggle: 0.55,
    weight: 2.1,
    score: 3,
    price: 5,
    weight_spawn: 32,
    hint: "ตัวใหญ่ขึ้น มองเห็นง่ายกว่า แต่ว่ายหลบช้อนเก่งและดิ้นแรง",
  },
  {
    kind: "fancy",
    emoji: "🐠",
    baseName: "ปลาหางสวย",
    nameEn: "Fancy Guppy",
    size: 10,
    speed: [18, 26],
    wriggle: 0.75,
    weight: 2.6,
    score: 5,
    price: 12,
    weight_spawn: 12,
    hint: "หางยาว ลวดลายเด่น หายาก · ขายได้ราคาสูงที่สุด",
  },
];

export const fishKind = (k: FishKind) => FISH_KINDS.find((f) => f.kind === k)!;

/** สุ่มชนิดปลาตามน้ำหนักโอกาส */
export function rollFishKind(): FishKind {
  const total = FISH_KINDS.reduce((n, f) => n + f.weight_spawn, 0);
  let r = Math.random() * total;
  for (const f of FISH_KINDS) { r -= f.weight_spawn; if (r <= 0) return f.kind; }
  return "guppy";
}

/* ───────────── ช้อนกระดาษ ───────────── */

export interface ScoopType {
  id: string;
  emoji: string;
  name: string;
  price: number;
  /** ความทนของกระดาษ — ยิ่งมากยิ่งใช้ได้นาน */
  strength: number;
  about: string;
}

export const SCOOPS: ScoopType[] = [
  { id: "paper", emoji: "🥅", name: "ช้อนกระดาษธรรมดา", price: 5, strength: 100, about: "กระดาษบาง ๆ แบบที่ใช้กันตามงานวัด จุ่มน้ำนานก็เปื่อย" },
  { id: "thick", emoji: "🥍", name: "ช้อนกระดาษหนา", price: 12, strength: 180, about: "กระดาษหนาขึ้น ทนกว่าเดิมเกือบเท่าตัว แต่ราคาแพงกว่า" },
];

export const findScoop = (id: string) => SCOOPS.find((s) => s.id === id)!;

/** สถานะกระดาษที่แสดงให้เด็กเห็น */
export function scoopState(pct: number) {
  if (pct > 85) return { label: "ใหม่เอี่ยม", emoji: "✨", tone: "good" as const };
  if (pct > 60) return { label: "เริ่มเปียก", emoji: "💧", tone: "good" as const };
  if (pct > 30) return { label: "เปื่อยแล้ว ระวังนะ", emoji: "⚠️", tone: "warn" as const };
  if (pct > 0) return { label: "จะขาดแล้ว!", emoji: "🚨", tone: "bad" as const };
  return { label: "กระดาษขาด", emoji: "✂️", tone: "bad" as const };
}

/* ───────────── คนรับซื้อปลา ───────────── */

export const BUYER = {
  emoji: "🧑‍🦱",
  name: "พี่คนรับซื้อปลา",
  greet: "มีปลาสวย ๆ มาขายไหมจ๊ะ พี่รับซื้อหมดเลย",
  thanks: "ขอบใจมากจ้ะ ได้ปลาสวยไปเลี้ยงต่อแล้ว",
};

/* ───────────── เกร็ดงานวัด ───────────── */

export const FAIR_TIPS = [
  "ช้อนตักปลางานวัดทำจากกระดาษบาง ๆ ยิ่งจุ่มน้ำนานยิ่งเปื่อยเร็ว",
  "ยกช้อนขึ้นช้า ๆ จะทนกว่า แต่ปลาก็มีเวลาดิ้นหลุดมากขึ้น ต้องหาจังหวะให้พอดี",
  "ปลาหางนกยูงตัวผู้มักมีสีสดและหางสวยกว่าตัวเมีย",
  "ปลาที่ตักได้ต้องมีน้ำสะอาดและที่อยู่เหมาะสม ไม่ควรเลี้ยงรวมกันแน่นเกินไป",
  "เล่นเสร็จแล้วถ้าไม่พร้อมเลี้ยง ควรคืนปลาให้เจ้าของซุ้ม ดีกว่าเอาไปแล้วเลี้ยงไม่รอด",
];
