import type { ActivityType } from "./plan";

/** ประเภทเกม (หมวดในคลังเกม) */
export type GameCategory =
  | "matching"    // 🧩 เกมจับคู่
  | "puzzle"      // 🖼️ เกมภาพตัดต่อ
  | "ordering"    // 🔢 เกมเรียงลำดับ
  | "observe"     // 🔍 เกมสังเกตและค้นหา
  | "color"       // 🎨 เกมจับคู่สี
  | "letter"      // 🔤 เกมจับคู่ภาพ/ตัวอักษร
  | "shadow"      // 🌑 เกมจับคู่กับเงา
  | "logic";      // 🧠 ตรรกะและการคิด (เกมเลื่อน)

/**
 * engine = ตัวเกมที่เขียนไว้แล้ว 1 ครั้ง ใช้ซ้ำได้หลายเกมด้วย config ต่างกัน
 * เพิ่มเกมใหม่ = เพิ่ม object ใน GAMES เลือก engine + ใส่ config
 */
export type GameConfig =
  | { engine: "memory"; pairs: { emoji: string; label: string }[] }
  | { engine: "odd-one-out"; rounds: { items: string[]; odd: string; hint: string }[] }
  | { engine: "sort"; rounds: { title: string; items: { emoji: string; value: number; label: string; count?: number }[]; missing?: boolean }[] }
  | { engine: "color-match"; rounds: { color: string; name: string; items: { emoji: string; color: string }[] }[] }
  | { engine: "tile-puzzle"; scene: string[]; size: 3 }
  | { engine: "pair-columns"; pairs: { left: string; right: string; label: string }[] }
  | { engine: "shadow-match"; items: { emoji: string; label: string }[] }
  | { engine: "sliding"; items: string[]; size?: 3 | 4; theme?: "purple" | "pink" | "green" | "yellow" };

/** ตัวเลือกร่วมที่ทุก engine รับจากระบบระดับความยาก */
export interface EngineExtras { timeLimit?: number; hints?: boolean; scramble?: number; onDone?: (o: { mistakes: number; total: number; seconds: number; timeUp: boolean; stars: number }) => void }

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
  ages?: string;              // 👶 อายุที่เหมาะสม (ถ้าไม่ใส่ใช้ของระดับชั้น)
  points?: number;            // ⭐ คะแนนเต็ม (ค่าเริ่มต้น 5 ดาว)
  config: GameConfig;
}
