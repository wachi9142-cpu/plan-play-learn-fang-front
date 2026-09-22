import type { GameConfig } from "@/types";

/** 🌱 ระดับความยากของเกม */
export type Difficulty = "easy" | "medium" | "hard";
export const LEVELS: { id: Difficulty; emoji: string; label: string; en: string; hint: string; cls: string }[] = [
  { id: "easy", emoji: "🟢", label: "ง่าย", en: "Easy", hint: "เริ่มฝึกทักษะ ตัวเลือกน้อย ภาพต่างกันชัด", cls: "border-green-300 bg-green-50 text-green-800" },
  { id: "medium", emoji: "🟡", label: "ปานกลาง", en: "Medium", hint: "เพิ่มตัวเลือกและความซับซ้อนของโจทย์", cls: "border-yellow-300 bg-yellow-50 text-yellow-800" },
  { id: "hard", emoji: "🔴", label: "ยาก", en: "Hard", hint: "ท้าทายขึ้น ต้องคิด จำหลายขั้น และมีเวลาจำกัด", cls: "border-red-300 bg-red-50 text-red-700" },
];
export const levelOf = (d: Difficulty) => LEVELS.find((l) => l.id === d)!;

export interface LevelInfo { questions: number; timeLimit?: number; note: string }

/**
 * แปลง config ของเกมตามระดับ — เกมทุกตัวได้ 3 ระดับอัตโนมัติจากข้อมูลชุดเดียว
 * (ถ้าต้องการกำหนดเองรายเกม ใส่ game.levels[level] ทับได้)
 */
export function applyDifficulty(config: GameConfig, level: Difficulty): { config: GameConfig; info: LevelInfo } {
  const take = <T>(arr: T[], n: number) => arr.slice(0, Math.max(1, Math.min(n, arr.length)));
  switch (config.engine) {
    case "memory": {
      const n = level === "easy" ? 3 : level === "medium" ? 6 : Math.max(8, config.pairs.length);
      const pairs = take(config.pairs, n);
      return { config: { ...config, pairs }, info: { questions: pairs.length, timeLimit: level === "hard" ? 20 * pairs.length : undefined, note: `จับคู่ ${pairs.length} คู่${level === "hard" ? " · จำตำแหน่ง · จับเวลา" : level === "easy" ? " · ตัวเลือกน้อย" : ""}` } };
    }
    case "odd-one-out": {
      const rounds = take(config.rounds, level === "easy" ? 3 : config.rounds.length).map((r) => ({ ...r, items: level === "easy" ? [r.odd, ...r.items.filter((i) => i !== r.odd).slice(0, 2)] : r.items }));
      return { config: { ...config, rounds }, info: { questions: rounds.length, timeLimit: level === "hard" ? 15 * rounds.length : undefined, note: `${rounds.length} ข้อ${level === "easy" ? " · 3 ตัวเลือก" : level === "hard" ? " · จับเวลา" : ""}` } };
    }
    case "sort": {
      const rounds = take(config.rounds, level === "easy" ? 2 : config.rounds.length).map((r) => {
        const items = [...r.items].sort((a, b) => a.value - b.value);
        if (level === "easy") return { ...r, items: items.slice(0, 5) };
        if (level === "hard") return { ...r, items, missing: true as const, title: `เติมตัวเลขที่หายไป: ${r.title}` };
        return { ...r, items };
      });
      const q = rounds.reduce((a, r) => a + r.items.length, 0);
      return { config: { ...config, rounds }, info: { questions: rounds.length, timeLimit: level === "hard" ? 20 * rounds.length : undefined, note: level === "easy" ? "เรียง 1 → 2 → 3 → 4 → 5" : level === "medium" ? `เรียงลำดับ ${q} ชิ้น` : "เติมตัวเลขที่หายไป 1 → 2 → ❓ → 4 → ❓" } };
    }
    case "color-match": {
      const rounds = take(config.rounds, level === "easy" ? 3 : config.rounds.length).map((r) => (level === "easy" ? { ...r, items: [r.items.find((i) => i.color === r.color)!, ...r.items.filter((i) => i.color !== r.color).slice(0, 1)] } : r));
      return { config: { ...config, rounds }, info: { questions: rounds.length, timeLimit: level === "hard" ? 12 * rounds.length : undefined, note: `${rounds.length} สี${level === "easy" ? " · 2 ตัวเลือก" : level === "hard" ? " · จับเวลา" : ""}` } };
    }
    case "tile-puzzle": {
      return { config, info: { questions: config.scene.length, timeLimit: level === "hard" ? 120 : undefined, note: level === "easy" ? "มีเลขบอกตำแหน่งช่วย" : level === "hard" ? "ไม่มีตัวช่วย · จับเวลา" : "ต่อภาพ 3×3" } };
    }
    case "pair-columns": {
      const pairs = take(config.pairs, level === "easy" ? 3 : level === "medium" ? 5 : config.pairs.length);
      return { config: { ...config, pairs }, info: { questions: pairs.length, timeLimit: level === "hard" ? 15 * pairs.length : undefined, note: `จับคู่ ${pairs.length} คู่${level === "hard" ? " · จับเวลา" : ""}` } };
    }
    case "shadow-match": {
      const items = take(config.items, level === "easy" ? 3 : level === "medium" ? 5 : config.items.length);
      return { config: { ...config, items }, info: { questions: items.length, timeLimit: level === "hard" ? 15 * items.length : undefined, note: `จับคู่เงา ${items.length} คู่${level === "hard" ? " · จับเวลา" : ""}` } };
    }
  }
}

/** ดาว 2–5 จากจำนวนผิดเทียบกับจำนวนข้อ (ไม่มี 0–1 ดาว — เด็กเล็กควรได้กำลังใจเสมอ) */
export function starsFor(mistakes: number, total: number, timeUp = false): number {
  if (timeUp) return 2;
  if (mistakes <= 0) return 5;
  const r = mistakes / Math.max(1, total);
  return r <= 0.34 ? 4 : r <= 0.75 ? 3 : 2;
}
export const PRAISE: Record<number, { emoji: string; title: string; text: string }> = {
  5: { emoji: "🎉", title: "เยี่ยมเลย!", text: "หนูทำได้ถูกต้องทั้งหมดเลย!" },
  4: { emoji: "⭐", title: "ทำได้ดีมาก", text: "เก่งมาก อีกนิดเดียวก็ครบเลย" },
  3: { emoji: "💪", title: "เกือบแล้ว", text: "ดีขึ้นเรื่อย ๆ นะ ลองอีกทีไหม" },
  2: { emoji: "🌱", title: "ลองอีกครั้ง", text: "ไม่เป็นไรนะ ค่อย ๆ ฝึกไปด้วยกัน" },
};
