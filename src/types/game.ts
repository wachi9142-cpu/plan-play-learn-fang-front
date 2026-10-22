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
  | "logic"       // 🧠 ตรรกะและการคิด (เกมเลื่อน)
  | "board"       // ♟️ เกมกระดานและการวางแผน
  | "reflex"      // 🔨 เกมไว ตอบสนองเร็ว
  | "coding"      // 💻 Coding & Logic — โค้ดดิ้งและการคิดเชิงตรรกะ
  | "math"        // ➕ คณิตศาสตร์
  | "language"    // 🔤 ภาษา
  | "science"     // 🔬 วิทยาศาสตร์
  | "creative";   // 🎨 Creative

/**
 * engine = ตัวเกมที่เขียนไว้แล้ว 1 ครั้ง ใช้ซ้ำได้หลายเกมด้วย config ต่างกัน
 * เพิ่มเกมใหม่ = เพิ่ม object ใน GAMES เลือก engine + ใส่ config
 */
export type GameConfig =
  | { engine: "memory"; pairs: { emoji: string; label: string }[] }
  | {
      engine: "odd-one-out";
      rounds: {
        hint: string;
        /** คลังรูปที่ "เข้าพวก" */
        group: string[];
        /** คลังรูปที่ "ไม่เข้าพวก" */
        odds: string[];
        /** รูปที่ใช้จริงในรอบนี้ (ระบบสร้างให้ตามระดับความยาก) */
        items?: string[];
        /** ตัวไม่เข้าพวกของรอบนี้ (ระบบสร้างให้ตามระดับความยาก) */
        picked?: string[];
      }[];
    }
  | { engine: "sort"; rounds: { title: string; items: { emoji: string; value: number; label: string; count?: number }[]; missing?: boolean }[] }
  | { engine: "color-match"; rounds: { color: string; name: string; items: { emoji: string; color: string }[] }[] }
  | { engine: "tile-puzzle"; scene: string[]; size: 3 }
  | { engine: "pair-columns"; pairs: { left: string; right: string; label: string }[] }
  | { engine: "color-pair"; pairs: { left: string; right: string; label: string }[] }
  | { engine: "shadow-match"; items: { emoji: string; label: string }[] }
  | { engine: "gray-match"; items: { emoji: string; label: string }[] }
  | { engine: "sliding"; items: string[]; size?: 3 | 4; theme?: "purple" | "pink" | "green" | "yellow" }
  /* 💻 Coding & Logic */
  | { engine: "grid-path"; actor: string; goal: string; hint?: string; levels: Record<"easy" | "medium" | "hard", GridLevelCfg> }
  | { engine: "direction"; rounds: { actor: string; goal: string; dir: "up" | "down" | "left" | "right" }[] }
  | { engine: "pattern"; rounds: { seq: string[]; options: string[]; answer: string; level?: "easy" | "medium" | "hard" }[] }
  | { engine: "condition"; rounds: { rule: string; item: string; branches: { label: string; emoji: string }[]; answer: number }[] }
  /* ♟️ เกมกระดาน — ฝึกคิดล่วงหน้าและวางแผน */
  | { engine: "tic-tac-toe"; marks?: [string, string] }
  | { engine: "connect-four" }
  | { engine: "checkers" }
  | { engine: "hanoi"; discs?: number }
  | { engine: "flash-memory"; pairs?: number }
  | { engine: "whack"; items?: string[]; prompt?: string }
  | { engine: "block-journey"; cols?: number; rows?: number }
  | { engine: "dominoes"; max?: number }
  | { engine: "snakes-ladders" }
  | { engine: "tycoon"; level?: "easy" | "hard"; rounds?: number }
  | { engine: "color-paint"; size?: number; colors?: number; task?: boolean }
  | { engine: "cake-decor" }
  | { engine: "spot-diff"; categoryId?: string; diffs?: number }
  | { engine: "shadow-quiz"; categoryId?: string; choices?: number; count?: number; tricky?: boolean }
  | { engine: "scene-builder"; sceneId?: string }
  | { engine: "healthy-food"; count?: number }
  | { engine: "fishing"; pondId?: string; seconds?: number; target?: number; fishCount?: number }
  | { engine: "egg-catch"; seconds?: number; lives?: number; target?: number; fallSpeed?: number; gapMs?: number; rottenRate?: number }
  | { engine: "fruit-farm"; plots?: number; fruitIds?: string[]; orders?: number; maxPerLine?: number; withRipeness?: boolean; withPests?: boolean; withShop?: boolean; startMoney?: number }
  | {
      engine: "dress-up";
      pickCount?: number;
      decoys?: number;
      jobs: { emoji: string; name: string; nameEn: string; about: string; items: { emoji: string; label: string }[] }[];
    }
  | { engine: "sort-basket"; pick?: number; rounds: { title: string; baskets: { emoji: string; label: string; accept: string[] }[]; pick?: number }[] }
  | {
      engine: "trace-line";
      actor: string;
      goal: string;
      /** แต่ละระดับคือเขาวงกตคนละอัน — ยากขึ้น = ถนนเยอะขึ้นและมีทางตันมากขึ้น */
      levels: Record<"easy" | "medium" | "hard", { size: number; road: [number, number][]; path: [number, number][] }>;
    }
  | { engine: "spell"; count?: number; maxLen?: number }
  | { engine: "math-quiz"; mode?: "add5" | "add10" | "addsub20"; count?: number }
  | { engine: "iq"; rounds: { q: string; seq?: string[]; options: string[]; answer: number; explain?: string; level?: "easy" | "medium" | "hard" }[] }
  | { engine: "quiz"; title: string; rounds: { q: string; code?: string; options: string[]; answer: number; explain?: string; level?: "easy" | "medium" | "hard" }[] };

export interface GridLevelCfg { size: number; start: [number, number]; target: [number, number]; obstacles?: [number, number][]; maxCmds?: number; repeat?: boolean; mode?: "free" | "trace" | "debug"; preset?: { dir: "up" | "down" | "left" | "right"; times: number }[] }

/** ตัวเลือกร่วมที่ทุก engine รับจากระบบระดับความยาก */
export interface EngineExtras { timeLimit?: number; hints?: boolean; scramble?: number; level?: "easy" | "medium" | "hard"; holes?: number; lifeMs?: number; gapMs?: number; rounds?: number; onDone?: (o: { mistakes: number; total: number; seconds: number; timeUp: boolean; stars: number }) => void }

export interface Game {
  id: string;
  title: string;
  /** ชื่อเกมภาษาอังกฤษ — แสดงคู่กับชื่อไทยทุกที่ และค้นหาได้ทั้งสองภาษา */
  titleEn?: string;
  emoji: string;
  cover: string;            // tailwind bg class สำหรับพื้นการ์ด
  description: string;
  skills: string[];         // 🎯 ทักษะที่เด็กจะได้ฝึก
  gradeId: string;          // 🎯 เหมาะกับ
  category: GameCategory;   // 🧩 ประเภท
  /** 🎮 fun = เล่นสนุก/ผ่อนคลาย · 🧩 edu = ฝึกทักษะมีเป้าหมายชัดเจน (ค่าเริ่มต้น edu) */
  zone?: "fun" | "edu";
  planIds: string[];        // 📖 หน่วย/เรื่องที่เกี่ยวข้อง
  activityType: ActivityType; // 🎈 กิจกรรมหลัก (ปกติ "game")
  ages?: string;              // 👶 อายุที่เหมาะสม (ถ้าไม่ใส่ใช้ของระดับชั้น)
  /**
   * 👥 เล่นได้กี่คน — ใส่จำนวนที่รองรับ เช่น [1] เล่นคนเดียว · [1, 2] เล่นคนเดียวหรือสองคน
   * ไม่ใส่ = [1] (เล่นคนเดียว)
   */
  players?: number[];
  /** ลิงก์ปลายทางเอง — ใช้กับเกมที่อยู่นอก /games เช่น จิ๊กซอว์ */
  href?: string;
  /** true = ไม่มีให้เลือก ง่าย/ปานกลาง/ยาก เพราะเกมจะยากขึ้นเองระหว่างเล่น */
  noLevels?: boolean;
  points?: number;            // ⭐ คะแนนเต็ม (ค่าเริ่มต้น 5 ดาว)
  config: GameConfig;
}
