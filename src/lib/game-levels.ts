import type { GameConfig } from "@/types";

/** 🌱 ระดับความยากของเกม */
export type Difficulty = "easy" | "medium" | "hard";
export const LEVELS: { id: Difficulty; emoji: string; label: string; en: string; hint: string; cls: string }[] = [
  { id: "easy", emoji: "🟢", label: "ง่าย", en: "Easy", hint: "เริ่มฝึกทักษะ ตัวเลือกน้อย ภาพต่างกันชัด", cls: "border-green-300 bg-green-50 text-green-800" },
  { id: "medium", emoji: "🟡", label: "ปานกลาง", en: "Medium", hint: "เพิ่มตัวเลือกและความซับซ้อนของโจทย์", cls: "border-yellow-300 bg-yellow-50 text-yellow-800" },
  { id: "hard", emoji: "🔴", label: "ยาก", en: "Hard", hint: "ท้าทายขึ้น ต้องคิด จำหลายขั้น และมีเวลาจำกัด", cls: "border-red-300 bg-red-50 text-red-700" },
];
export const levelOf = (d: Difficulty) => LEVELS.find((l) => l.id === d)!;

export interface LevelInfo { questions: number; timeLimit?: number; note: string; scramble?: number; hints?: boolean }

/**
 * แปลง config ของเกมตามระดับ — เกมทุกตัวได้ 3 ระดับอัตโนมัติจากข้อมูลชุดเดียว
 * (ถ้าต้องการกำหนดเองรายเกม ใส่ game.levels[level] ทับได้)
 */
export function applyDifficulty(config: GameConfig, level: Difficulty): { config: GameConfig; info: LevelInfo; extras?: Record<string, number> } {
  const take = <T>(arr: T[], n: number) => arr.slice(0, Math.max(1, Math.min(n, arr.length)));
  switch (config.engine) {
    case "memory": {
      const n = level === "easy" ? 3 : level === "medium" ? 6 : Math.max(8, config.pairs.length);
      const pairs = take(config.pairs, n);
      return { config: { ...config, pairs }, info: { questions: pairs.length, timeLimit: level === "hard" ? 20 * pairs.length : undefined, note: `จับคู่ ${pairs.length} คู่${level === "hard" ? " · จำตำแหน่ง · จับเวลา" : level === "easy" ? " · ตัวเลือกน้อย" : ""}` } };
    }
    case "odd-one-out": {
      /** ง่าย 3 รูป/1 ตัวแปลก · ปานกลาง 6 รูป/2 ตัว · ยาก 10 รูป/3–4 ตัว */
      const plan = level === "easy" ? { total: 3, odds: 1 } : level === "medium" ? { total: 6, odds: 2 } : { total: 10, odds: 0 };
      const picked = take(config.rounds, level === "easy" ? 3 : config.rounds.length).map((r, i) => {
        const nOdd = level === "hard" ? 3 + (i % 2) : plan.odds;          // ยาก: สลับ 3 กับ 4 ตัว
        const odds = r.odds.slice(0, Math.min(nOdd, r.odds.length));
        const group = r.group.slice(0, Math.max(1, plan.total - odds.length));
        return { ...r, picked: odds, items: [...group, ...odds] };
      });
      const totalOdds = picked.reduce((a, r) => a + (r.picked?.length ?? 1), 0);
      return {
        config: { ...config, rounds: picked },
        info: {
          questions: picked.length,
          timeLimit: level === "hard" ? 20 * picked.length : undefined,
          note: level === "easy" ? `${picked.length} ข้อ · 3 รูป หาตัวแปลก 1 ตัว`
            : level === "medium" ? `${picked.length} ข้อ · 6 รูป หาตัวแปลก 2 ตัว`
            : `${picked.length} ข้อ · 10 รูป หาตัวแปลก 3–4 ตัว (รวม ${totalOdds} ตัว) · จับเวลา`,
        },
      };
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
      return { config, info: { questions: config.scene.length, timeLimit: level === "hard" ? 120 : undefined, hints: level === "easy", note: level === "easy" ? "มีเลขบอกตำแหน่งช่วย" : level === "hard" ? "ไม่มีตัวช่วย · จับเวลา" : "ต่อภาพ 3×3" } };
    }
    case "color-pair": {
      const pairs = take(config.pairs, level === "easy" ? 3 : level === "medium" ? 5 : config.pairs.length);
      return { config: { ...config, pairs }, info: { questions: pairs.length, timeLimit: level === "hard" ? 15 * pairs.length : undefined, note: `จับคู่สี ${pairs.length} คู่${level === "hard" ? " · จับเวลา" : ""}` } };
    }
    case "pair-columns": {
      const pairs = take(config.pairs, level === "easy" ? 3 : level === "medium" ? 5 : config.pairs.length);
      return { config: { ...config, pairs }, info: { questions: pairs.length, timeLimit: level === "hard" ? 15 * pairs.length : undefined, note: `จับคู่ ${pairs.length} คู่${level === "hard" ? " · จับเวลา" : ""}` } };
    }
    case "sliding": {
      const n = (config.size ?? 3) ** 2;
      const sc = level === "easy" ? 4 : level === "medium" ? 14 : 40;
      return { config, info: { questions: n - 1, scramble: sc, timeLimit: level === "hard" ? 300 : undefined, note: level === "easy" ? "สลับตำแหน่งเพียงเล็กน้อย · จับเวลา (ไม่จำกัด)" : level === "medium" ? "ต้องคิดลำดับการเลื่อนมากขึ้น · จับเวลา (ไม่จำกัด)" : "กระจัดกระจาย ต้องวางแผนหลายขั้น · จำกัด 5 นาที" } };
    }
    case "grid-path": {
      const L = config.levels[level];
      return { config, info: { questions: 1, note: `กระดาน ${L.size}×${L.size}${L.obstacles?.length ? ` · สิ่งกีดขวาง ${L.obstacles.length}` : ""}${L.repeat ? " · ใช้ 🔁 ทำซ้ำได้" : ""}${L.mode === "debug" ? " · หาคำสั่งที่ผิด" : L.mode === "trace" ? " · มีเส้นทางให้ดู" : ""}` } };
    }
    case "direction": {
      const rounds = take(config.rounds, level === "easy" ? 4 : level === "medium" ? 6 : config.rounds.length);
      return { config: { ...config, rounds }, info: { questions: rounds.length, timeLimit: level === "hard" ? 8 * rounds.length : undefined, note: `${rounds.length} ข้อ${level === "hard" ? " · จับเวลา" : ""}` } };
    }
    case "pattern": {
      const pool = config.rounds.filter((r) => !r.level || r.level === level); const rounds = pool.length ? pool : config.rounds;
      return { config: { ...config, rounds }, info: { questions: rounds.length, timeLimit: level === "hard" ? 15 * rounds.length : undefined, note: level === "easy" ? "แบบแผน AB สั้น ๆ" : level === "medium" ? "แบบแผน ABB / ABC" : "แบบแผนยาวและซับซ้อน · จับเวลา" } };
    }
    case "condition": {
      const rounds = take(config.rounds, level === "easy" ? 4 : level === "medium" ? 6 : config.rounds.length);
      return { config: { ...config, rounds }, info: { questions: rounds.length, timeLimit: level === "hard" ? 10 * rounds.length : undefined, note: `${rounds.length} สถานการณ์${level === "hard" ? " · จับเวลา" : ""}` } };
    }
    case "quiz": {
      const pool = config.rounds.filter((r) => !r.level || r.level === level); const rounds = pool.length ? pool : config.rounds;
      return { config: { ...config, rounds }, info: { questions: rounds.length, timeLimit: level === "hard" ? 45 * rounds.length : undefined, note: `${rounds.length} ข้อ${level === "hard" ? " · จับเวลา" : ""}` } };
    }
    case "gray-match": {
      const items = take(config.items, level === "easy" ? 3 : level === "medium" ? 5 : config.items.length);
      return { config: { ...config, items }, info: { questions: items.length, timeLimit: level === "hard" ? 15 * items.length : undefined, note: `จับคู่ภาพสีกับภาพขาวดำ ${items.length} คู่${level === "hard" ? " · จับเวลา" : ""}` } };
    }
    case "shadow-match": {
      const items = take(config.items, level === "easy" ? 3 : level === "medium" ? 5 : config.items.length);
      return { config: { ...config, items }, info: { questions: items.length, timeLimit: level === "hard" ? 15 * items.length : undefined, note: `จับคู่เงา ${items.length} คู่${level === "hard" ? " · จับเวลา" : ""}` } };
    }

    /* ♟️ เกมกระดาน — ระดับความยากอยู่ที่ "คู่แข่ง" ซึ่งเด็กเลือกเองในเกม จึงไม่ตัดข้อ */
    case "tic-tac-toe":
      return { config, info: { questions: 1, note: "เลือกเล่นกับเครื่อง (ง่าย/เก่ง) หรือเล่นกับเพื่อนได้ในเกม" } };
    case "connect-four":
      return { config, info: { questions: 1, note: "เรียงให้ครบ 4 เม็ด — เลือกคู่แข่งได้ในเกม" } };
    case "checkers":
      return { config, info: { questions: 1, note: "กระดาน 6×6 สำหรับเด็ก — เลือกคู่แข่งได้ในเกม" } };
    case "hanoi": {
      const discs = level === "easy" ? 3 : level === "medium" ? 4 : 5;
      return { config: { ...config, discs }, info: { questions: Math.pow(2, discs) - 1, note: `${discs} จาน · ย้ายน้อยที่สุด ${Math.pow(2, discs) - 1} ครั้ง` } };
    }
    case "block-journey":
      return { config, info: { questions: 1, note: "ไม่มีระดับให้เลือก — เกมจะเร็วขึ้นเองเมื่อเล่นไปเรื่อย ๆ" } };
    case "trace-line": {
      const lv = config.levels[level];
      return { config, info: { questions: lv.path.length, timeLimit: level === "hard" ? 150 : undefined, note: `เขาวงกต ${lv.size}×${lv.size} · ถนน ${lv.road.length} ช่อง · เส้นทางที่ถูก ${lv.path.length} ช่อง${level === "hard" ? " · จับเวลา" : ""}` } };
    }
    case "math-quiz": {
      const cfg = level === "easy" ? { mode: "add5" as const, count: 8 }
        : level === "medium" ? { mode: "add10" as const, count: 10 }
        : { mode: "addsub20" as const, count: 12 };
      return {
        config: { ...config, ...cfg },
        info: {
          questions: cfg.count,
          timeLimit: level === "hard" ? 15 * cfg.count : undefined,
          note: level === "easy" ? `${cfg.count} ข้อ · บวกไม่เกิน 5 มีภาพช่วยนับ`
            : level === "medium" ? `${cfg.count} ข้อ · บวกไม่เกิน 10`
            : `${cfg.count} ข้อ · บวกและลบ ไม่เกิน 20 · จับเวลา`,
        },
      };
    }
    case "spell": {
      const cfg = level === "easy" ? { count: 5, maxLen: 4 } : level === "medium" ? { count: 7, maxLen: 6 } : { count: 10, maxLen: 9 };
      return {
        config: { ...config, ...cfg },
        info: { questions: cfg.count, timeLimit: level === "hard" ? 40 * cfg.count : undefined, note: `${cfg.count} คำ · ไม่เกิน ${cfg.maxLen} ตัวอักษร${level === "hard" ? " · จับเวลา" : ""}` },
      };
    }
    case "iq": {
      const rounds = config.rounds.filter((r) => (r.level ?? "easy") === level);
      const use = rounds.length ? rounds : config.rounds;
      return {
        config: { ...config, rounds: use },
        info: {
          questions: use.length,
          timeLimit: level === "hard" ? 25 * use.length : undefined,
          note: `${use.length} ข้อ · ${level === "easy" ? "ของใกล้ตัว เลือก 3 ข้อ" : level === "medium" ? "ต้องคิดเชื่อมโยง" : "แบบแผนและการให้เหตุผล · จับเวลา"}`,
        },
      };
    }
    case "sort-basket": {
      const two = config.rounds.filter((r) => r.baskets.length === 2);
      const rounds = level === "easy" ? two.slice(0, 2) : level === "medium" ? config.rounds.slice(0, 4) : config.rounds;
      const pick = level === "easy" ? 6 : level === "medium" ? 10 : 14;
      return {
        config: { ...config, rounds: rounds.length ? rounds : config.rounds, pick },
        info: { questions: (rounds.length || config.rounds.length) * pick, timeLimit: level === "hard" ? 40 * (rounds.length || 1) : undefined, note: `${rounds.length || config.rounds.length} ชุด · ชุดละ ${pick} ชิ้น${level === "easy" ? " · ตะกร้า 2 ใบ" : level === "hard" ? " · มีตะกร้า 3 ใบ · จับเวลา" : ""}` },
      };
    }
    case "dress-up": {
      const cfg = level === "easy" ? { jobs: config.jobs.slice(0, 3), pickCount: 2, decoys: 3 }
        : level === "medium" ? { jobs: config.jobs.slice(0, 5), pickCount: 3, decoys: 5 }
        : { jobs: config.jobs, pickCount: 3, decoys: 7 };
      return {
        config: { ...config, ...cfg },
        info: { questions: cfg.jobs.length * cfg.pickCount, timeLimit: level === "hard" ? 30 * cfg.jobs.length : undefined, note: `${cfg.jobs.length} อาชีพ · เลือก ${cfg.pickCount} อย่าง · ของหลอก ${cfg.decoys} ชิ้น${level === "hard" ? " · จับเวลา" : ""}` },
      };
    }
    case "spot-diff": {
      const diffs = level === "easy" ? 3 : level === "medium" ? 4 : 5;
      return {
        config: { ...config, diffs },
        info: { questions: diffs, timeLimit: level === "hard" ? 180 : undefined, note: `หาจุดต่าง ${diffs} จุดต่อด่าน${level === "hard" ? " · จับเวลา" : ""}` },
      };
    }
    case "shadow-quiz": {
      // ระดับ 1 (4–6 ปี) = 3 เงา รูปร่างต่างกันชัด · ระดับ 2 (6 ปีขึ้นไป) = 4–6 เงา และเงาเอียงด้วย
      const cfg = level === "easy" ? { choices: 3, count: 8, tricky: false }
        : level === "medium" ? { choices: 4, count: 10, tricky: false }
        : { choices: 6, count: 12, tricky: true };
      return {
        config: { ...config, ...cfg },
        info: {
          questions: cfg.count,
          timeLimit: level === "hard" ? 15 * cfg.count : undefined,
          note: `เลือกจากเงา ${cfg.choices} อัน${level === "hard" ? " · เงาเอียงและคล้ายกันมาก · จับเวลา" : ""}`,
        },
      };
    }
    case "fruit-farm": {
      // ไล่ระดับตามวัย — อนุบาลไม่มีสัตว์รบกวนและไม่แยกผลดิบ/สุก · ยากต้องบริหารเงินและหลายชนิด
      const cfg = level === "easy"
        ? { plots: 4, fruitIds: ["mango"], orders: 4, maxPerLine: 3, withRipeness: false, withPests: false, withShop: false, startMoney: 20 }
        : level === "medium"
          ? { plots: 6, fruitIds: ["mango", "orange"], orders: 5, maxPerLine: 4, withRipeness: true, withPests: true, withShop: true, startMoney: 25 }
          : { plots: 9, fruitIds: ["mango", "orange", "banana", "watermelon"], orders: 7, maxPerLine: 5, withRipeness: true, withPests: true, withShop: true, startMoney: 30 };
      return {
        config: { ...config, ...cfg },
        info: {
          questions: cfg.orders,
          note: `${cfg.plots} แปลง · ผลไม้ ${cfg.fruitIds.length} ชนิด · ออเดอร์ ${cfg.orders} ใบ · เริ่มที่ ${cfg.startMoney} บาท${cfg.withRipeness ? " · แยกผลดิบ-ผลสุก" : ""}${cfg.withPests ? " · มีลิงและนกมาป่วน" : ""}${cfg.withShop ? " · มีร้านพัฒนาสวน" : ""}`,
        },
      };
    }
    case "egg-catch": {
      // ง่าย: ไข่ตกช้า ของที่ต้องหลบน้อย หัวใจเยอะ · ยาก: ตกเร็ว ถี่ และของหลบเยอะขึ้น
      const cfg = level === "easy" ? { seconds: 60, lives: 5, target: 12, fallSpeed: 22, gapMs: 1300, rottenRate: 0.18 }
        : level === "medium" ? { seconds: 60, lives: 3, target: 20, fallSpeed: 28, gapMs: 1050, rottenRate: 0.3 }
        : { seconds: 75, lives: 3, target: 28, fallSpeed: 35, gapMs: 820, rottenRate: 0.4 };
      return {
        config: { ...config, ...cfg },
        info: { questions: cfg.target, note: `${cfg.seconds} วินาที · ${cfg.lives} หัวใจ · เป้าหมาย ${cfg.target} ฟอง` },
      };
    }
    case "fishing": {
      // เวลาต่อรอบและความหนาแน่นของปลา — ง่ายให้เวลาเยอะ ปลาเยอะ เล็งง่าย
      const cfg = level === "easy" ? { seconds: 90, target: 20, fishCount: 10 }
        : level === "medium" ? { seconds: 60, target: 30, fishCount: 9 }
        : { seconds: 45, target: 35, fishCount: 8 };
      return {
        config: { ...config, ...cfg },
        info: { questions: cfg.target, note: `${cfg.seconds} วินาที · ปลาในบ่อ ${cfg.fishCount} ตัว · เป้าหมาย ${cfg.target} คะแนน` },
      };
    }
    case "healthy-food": {
      // จำนวนอาหารต่อรอบ — ครึ่งหนึ่งมีประโยชน์ อีกครึ่งกินแต่น้อยเสมอ
      const c = level === "easy" ? 6 : level === "medium" ? 10 : 12;
      return {
        config: { ...config, count: c },
        info: { questions: c, timeLimit: level === "hard" ? 12 * c : undefined, note: `อาหาร ${c} อย่างต่อรอบ${level === "hard" ? " · จับเวลา" : ""}` },
      };
    }
    case "scene-builder":
      return { config, info: { questions: 1, note: "ไม่มีระดับ ไม่มีผิดถูก — วาง ย้าย ย่อขยาย และลบสติกเกอร์ได้ตามใจ" } };
    case "cake-decor":
      return { config, info: { questions: 1, note: "ไม่มีระดับ ไม่มีผิดถูก — ของแต่งและสีเค้กสุ่มใหม่ทุกรอบ" } };
    case "color-paint": {
      const cfg = level === "easy" ? { size: 4, colors: 4 } : level === "medium" ? { size: 5, colors: 6 } : { size: 6, colors: 8 };
      return {
        config: { ...config, ...cfg },
        info: { questions: cfg.size * cfg.size, timeLimit: level === "hard" ? 180 : undefined, note: `ตาราง ${cfg.size}×${cfg.size} · ${cfg.colors} สี${level === "hard" ? " · จับเวลา" : ""}` },
      };
    }
    case "tycoon": {
      // ระดับ 1 = อายุ 4–6 ปี (กระดาน 16 ช่อง ช่วยคำนวณ) · ระดับ 2 = 6 ปีขึ้นไป (24 ช่อง สร้างบ้าน/โรงแรมได้)
      const cfg = level === "easy" ? { level: "easy" as const, rounds: 8 }
        : level === "medium" ? { level: "easy" as const, rounds: 12 }
        : { level: "hard" as const, rounds: 14 };
      return {
        config: { ...config, ...cfg },
        info: {
          questions: cfg.rounds,
          note: cfg.level === "easy"
            ? `อายุ 4–6 ปี · กระดาน 16 ช่อง · เล่นคนละ ${cfg.rounds} ตา · ระบบช่วยคำนวณให้`
            : `อายุ 6 ปีขึ้นไป · กระดาน 24 ช่อง · สร้างบ้านและโรงแรมได้ · เล่นคนละ ${cfg.rounds} ตา`,
        },
      };
    }
    case "snakes-ladders":
      return { config, info: { questions: 1, note: "กระดาน 30 ช่อง · มีบันได 4 จุด งู 4 จุด — เล่นคนเดียวหรือ 2 คนก็ได้" } };
    case "dominoes":
      return { config, info: { questions: 1, note: "มีโหมดเดียว — ต่อเลขให้ตรงกันจนหมดมือก่อนอีกฝ่าย" } };
    case "whack": {
      // ยากขึ้น = รูเยอะขึ้น ตุ่นโผล่ถี่ขึ้น และมุดเร็วขึ้น
      const cfg = level === "easy" ? { holes: 4, lifeMs: 2000, gapMs: 1100, rounds: 15 }
        : level === "medium" ? { holes: 6, lifeMs: 1500, gapMs: 800, rounds: 20 }
        : { holes: 9, lifeMs: 1050, gapMs: 600, rounds: 28 };
      return {
        config, extras: cfg,
        info: { questions: cfg.rounds, note: `${cfg.holes} รู · ตุ่น ${cfg.rounds} ตัว · ${level === "easy" ? "โผล่ช้า จับง่าย" : level === "medium" ? "ความเร็วปกติ" : "โผล่ไว มุดเร็ว"}` },
      };
    }
    case "flash-memory": {
      const pairs = level === "easy" ? 4 : level === "medium" ? 6 : 8;
      return { config: { ...config, pairs }, info: { questions: pairs, timeLimit: level === "hard" ? 20 * pairs : undefined, note: `จับคู่ ${pairs} คู่ จากคลังแฟลชการ์ด${level === "hard" ? " · จับเวลา" : ""}` } };
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
