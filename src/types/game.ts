import type { ActivityType } from "./plan";

/** ประเภทเกม (หมวดในคลังเกม) */
export type GameCategory =
  | "matching"    // 🧩 เกมจับคู่
  | "puzzle"      // 🖼️ เกมภาพตัดต่อ
  | "ordering"    // 🔢 เกมเรียงลำดับ
  | "observe"     // 🔍 เกมสังเกตและค้นหา
  | "color"       // 🎨 เกมจับคู่สี
  | "letter"      // 🔤 เกมจับคู่ภาพ/ตัวอักษร
  | "shadow";     // 🌑 เกมจับคู่กับเงา

/**
 * engine = ตัวเกมที่เขียนไว้แล้ว 1 ครั้ง ใช้ซ้ำได้หลายเกมด้วย config ต่างกัน
 * เพิ่มเกมใหม่ = เพิ่ม object ใน GAMES เลือก engine + ใส่ config
 */
export type GameConfig =
  | { engine: "memory"; pairs: { emoji: string; label: string }[] }
  | { engine: "odd-one-out"; rounds: { items: string[]; odd: string; hint: string }[] }
  | { engine: "sort"; rounds: { title: string; items: { emoji: string; value: number; label: string; count?: number }[] }[] }
  | { engine: "color-match"; rounds: { color: string; name: string; items: { emoji: string; color: string }[] }[] }
  | { engine: "tile-puzzle"; scene: string[]; size: 3 }
  | { engine: "pair-columns"; pairs: { left: string; right: string; label: string }[] }
  | { engine: "shadow-match"; items: { emoji: string; label: string }[] };

export interface Game {
  id: string;
  title: string;
  emoji: string;
  cover: string;            // tailwind bg class สำหรับพื้นการ์ด
  description: string;
  skills: string[];         // 🎯 ทักษะที่เด็กจะได้ฝึก
  gradeId: string;          // 🎯 เหมาะกับ
  category: GameCategory;   // 🧩 ประเภท
  planIds: string[];        // 📖 หน่วย/เรื่องที่เกี่ยวข้อง
  activityType: ActivityType; // 🎈 กิจกรรมหลัก (ปกติ "game")
  config: GameConfig;
}
