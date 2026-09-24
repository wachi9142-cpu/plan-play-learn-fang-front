/**
 * ✨ ทะเบียนเอฟเฟกต์บรรยากาศของ Little Purple Garden
 *
 * เพิ่มเอฟเฟกต์ใหม่ = เพิ่ม 1 object ในอาร์เรย์นี้ + เพิ่มตัวแสดงผลใน AmbientScenes.tsx
 * ไม่ต้องแก้ระบบธีมหรือหน้าตั้งค่า — ทุกหน้าที่ใช้ทะเบียนนี้จะเห็นเอฟเฟกต์ใหม่เอง
 *
 * ผู้ดูแลระบบแก้ชื่อ / คำอธิบาย / เปิด-ปิด / ลำดับ / ฤดูที่แนะนำ ได้จากหน้า /admin
 * โดยค่าที่แก้จะเก็บทับไว้ใน localStorage (ไม่แตะโค้ด)
 */

export type EffectId = string;

export type EffectSeason = "all" | "rainy" | "winter" | "spring" | "summer" | "autumn" | "festival" | "night";

export const SEASONS: Record<EffectSeason, string> = {
  all: "ใช้ได้ทั้งปี",
  rainy: "ฤดูฝน",
  winter: "ฤดูหนาว",
  spring: "ฤดูใบไม้ผลิ",
  summer: "ฤดูร้อน",
  autumn: "ฤดูใบไม้ร่วง",
  festival: "ช่วงเทศกาล",
  night: "ยามค่ำคืน",
};

export interface EffectDef {
  id: EffectId;
  emoji: string;
  label: string;
  hint: string;
  season: EffectSeason;
  /** ลำดับการแสดงในรายการ (น้อย = อยู่บน) */
  order: number;
  /** ปิดไว้ = ไม่แสดงให้ผู้ใช้เลือก (แต่ยังอยู่ในระบบ) */
  enabled: boolean;
  /** ช่วงเวลาที่แนะนำ เช่น "18:00–06:00" — เป็นคำแนะนำเท่านั้น ไม่ปิดเอฟเฟกต์อัตโนมัติ */
  time?: string;
  /** ใช้ได้เฉพาะ 🌙 โหมดมืด (ระบบไม่เปลี่ยนธีมให้เอง ผู้ใช้ต้องเลือกเอง) */
  darkOnly?: boolean;
}

/** ค่าตั้งต้นจากโค้ด — ผู้ดูแลระบบแก้ทับได้ */
export const BUILT_IN_EFFECTS: EffectDef[] = [
  { id: "none", emoji: "⭕", label: "ไม่มีเอฟเฟกต์", hint: "หน้าเว็บสะอาดตา ไม่มีอะไรเคลื่อนไหว", season: "all", order: 0, enabled: true },
  { id: "winter", emoji: "❄️", label: "Winter — โหมดหิมะ", hint: "หิมะขาว ฟ้าอ่อน และลาเวนเดอร์ตกเบา ๆ พร้อมเกล็ดคริสตัล", season: "winter", order: 10, enabled: true },
  { id: "sakura", emoji: "🌸", label: "Sakura — โหมดซากุระ", hint: "กลีบซากุระชมพูอ่อนปลิวตามลม เหมือนอยู่ในสวนฤดูใบไม้ผลิ", season: "spring", order: 20, enabled: true },
  { id: "autumn", emoji: "🍂", label: "Autumn — โหมดใบไม้ร่วง", hint: "ใบแปะก๊วยสีทองและใบเมเปิลส้มร่วงช้า ๆ ใต้แสงแดดอุ่น", season: "autumn", order: 30, enabled: true },
  { id: "starlight", emoji: "🌠", label: "Starlight — โหมดดาวตก", hint: "ดาวกระพริบ ดาวตกหางแสงสั้น และประกายดอกไม้เล็ก ๆ", season: "night", order: 40, enabled: true, time: "18:00–06:00" },
  { id: "rainy", emoji: "🌧️", label: "Rainy Garden — ฝนตกเบา ๆ", hint: "เม็ดฝนบาง ๆ ละอองฝน และหยดน้ำกระทบพื้น สดชื่นและสงบ", season: "rainy", order: 50, enabled: true },
  { id: "spring", emoji: "🌼", label: "Spring Garden — ดอกไม้ผลิบาน", hint: "ดอกไม้เล็ก ๆ ค่อย ๆ ผลิบานทีละดอก พร้อมใบไม้เขียวอ่อน", season: "spring", order: 60, enabled: true },
  { id: "butterfly", emoji: "🦋", label: "Butterfly Garden — ผีเสื้อบินผ่าน", hint: "ผีเสื้อสีพาสเทลบินผ่านหน้าจอเป็นครั้งคราว เส้นทางไม่ซ้ำกัน", season: "all", order: 70, enabled: true },
  { id: "magic", emoji: "✨", label: "Magic Garden — ประกายวิบวับ", hint: "จุดแสงเล็ก ๆ ปรากฏและจางหาย เหมือนสวนมีเวทมนตร์", season: "all", order: 80, enabled: true },
  { id: "halloween", emoji: "🎃", label: "Halloween Garden — ฮาโลวีนน่ารัก", hint: "ผีน้อยน่ารักลอยผ่าน ฟักทองยิ้ม โคมไฟอุ่น ๆ และพระจันทร์เสี้ยว (ไม่น่ากลัว)", season: "festival", order: 90, enabled: true },
  { id: "christmas", emoji: "🎄", label: "Christmas Garden — คริสต์มาส", hint: "หิมะตกเบา ๆ ไฟประดับกะพริบ ต้นสนเล็ก ๆ และดาวสีทอง", season: "festival", order: 100, enabled: true },
  { id: "newyear", emoji: "🎆", label: "New Year Garden — ฉลองปีใหม่", hint: "ดอกไม้ไฟดวงเล็กนาน ๆ ครั้ง และประกายแสงลอยขึ้นนุ่ม ๆ", season: "festival", order: 110, enabled: true },
  { id: "firefly", emoji: "🌌", label: "Firefly Garden — สวนหิ่งห้อย", hint: "หิ่งห้อยตัวเล็ก ๆ เรืองแสงทองอ่อน บินช้า ๆ รอบสวนยามค่ำคืน", season: "night", order: 115, enabled: true, time: "18:00–06:00", darkOnly: true },
  { id: "purplenight", emoji: "💜", label: "Purple Night Garden — สวนกลางคืน", hint: "ม่านม่วงนวล พระจันทร์ ดาวกระพริบ และหิ่งห้อยบินผ่าน", season: "night", order: 120, enabled: true, time: "18:00–06:00" },
];

/* ---------- ค่าที่ผู้ดูแลระบบแก้ทับ (เก็บในเครื่อง) ---------- */

export const EFFECT_CONFIG_KEY = "lpg-effect-config-v1";
export const EFFECT_CONFIG_EVENT = "lpg-effect-config";

export type EffectOverride = Partial<Pick<EffectDef, "label" | "hint" | "season" | "order" | "enabled" | "time">>;
export type EffectConfig = Record<EffectId, EffectOverride>;

export function readEffectConfig(): EffectConfig {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(EFFECT_CONFIG_KEY) || "{}") as EffectConfig;
  } catch {
    return {};
  }
}

export function writeEffectConfig(cfg: EffectConfig) {
  localStorage.setItem(EFFECT_CONFIG_KEY, JSON.stringify(cfg));
  window.dispatchEvent(new CustomEvent(EFFECT_CONFIG_EVENT));
}

export function updateEffect(id: EffectId, patch: EffectOverride) {
  const cfg = readEffectConfig();
  writeEffectConfig({ ...cfg, [id]: { ...cfg[id], ...patch } });
}

export function resetEffectConfig() {
  localStorage.removeItem(EFFECT_CONFIG_KEY);
  window.dispatchEvent(new CustomEvent(EFFECT_CONFIG_EVENT));
}

/** รายการเอฟเฟกต์หลังรวมค่าที่ผู้ดูแลระบบแก้ไว้ (เรียงตามลำดับที่ตั้ง) */
export function listEffects(cfg: EffectConfig = readEffectConfig()): EffectDef[] {
  return BUILT_IN_EFFECTS.map((e) => ({ ...e, ...cfg[e.id] })).sort((a, b) => a.order - b.order);
}

/** เฉพาะที่เปิดใช้งาน — "ไม่มีเอฟเฟกต์" แสดงเสมอ เพื่อให้ปิดได้ตลอด */
export function activeEffects(cfg?: EffectConfig): EffectDef[] {
  return listEffects(cfg).filter((e) => e.enabled || e.id === "none");
}

export function findEffect(id: EffectId, cfg?: EffectConfig): EffectDef {
  return listEffects(cfg).find((e) => e.id === id) ?? BUILT_IN_EFFECTS[0];
}

export const EFFECT_IDS = BUILT_IN_EFFECTS.map((e) => e.id);
