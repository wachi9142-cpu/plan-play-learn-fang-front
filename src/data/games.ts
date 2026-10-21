import { JIGSAW_CATEGORIES } from "@/data/jigsaw";
import { CODING_GAMES } from "./games-coding";
import type { Game, GameCategory } from "@/types";

export const GAME_CATEGORIES: Record<GameCategory, { emoji: string; label: string }> = {
  matching: { emoji: "🧩", label: "เกมจับคู่" },
  puzzle: { emoji: "🖼️", label: "เกมภาพตัดต่อ" },
  ordering: { emoji: "🔢", label: "เกมเรียงลำดับ" },
  observe: { emoji: "🔍", label: "เกมสังเกตและค้นหา" },
  color: { emoji: "🎨", label: "เกมจับคู่สี" },
  letter: { emoji: "🔤", label: "เกมจับคู่ภาพ/ตัวอักษร" },
  shadow: { emoji: "🌑", label: "เกมจับคู่กับเงา" },
  logic: { emoji: "🧠", label: "ตรรกะและการคิด" },
  board: { emoji: "♟️", label: "เกมกระดาน & วางแผน" },
  reflex: { emoji: "🔨", label: "เกมไว ตอบสนองเร็ว" },
  coding: { emoji: "💻", label: "Coding & Logic" },
  math: { emoji: "➕", label: "คณิตศาสตร์" },
  language: { emoji: "🔤", label: "ภาษา" },
  science: { emoji: "🔬", label: "วิทยาศาสตร์" },
  creative: { emoji: "🎨", label: "Creative" },
};

export { SKILLS } from "./game-skills";

/**
 * 🎮 เกม (fun) กับ 🧩 เกมการศึกษา (edu) แยกกันคนละพื้นที่
 * - 🎮 เกม: เล่นสนุก ผ่อนคลาย สร้างสรรค์ ไม่จำเป็นต้องผูกกับแผนการสอน
 * - 🧩 เกมการศึกษา: มีเป้าหมายทักษะชัดเจน เชื่อม หลักสูตร → แผน → กิจกรรม → ผลการเล่น → Portfolio
 */
const FUN_IDS = new Set(["fruit-match", "animal-match", "tile-puzzle-farm", "shadow-animals", "shadow-things"]);

/** โซนของเกม — ถ้าไม่ระบุไว้ในข้อมูล ถือเป็นเกมการศึกษา */
export function gameZone(g: Game): "fun" | "edu" {
  return g.zone ?? (FUN_IDS.has(g.id) ? "fun" : "edu");
}

export const ZONES = {
  fun: { href: "/play", emoji: "🎮", label: "เกม", tagline: "เกมและกิจกรรมออนไลน์ เล่นสนุก สำรวจ และสร้างสรรค์" },
  edu: { href: "/games", emoji: "🧩", label: "เกมการศึกษา", tagline: "เกมฝึกทักษะ เรียนรู้ผ่านการเล่น และพัฒนาการคิด" },
} as const;

/**
 * คลังเกมออนไลน์ — เพิ่มเกมใหม่ = เพิ่ม object ใหม่ (เลือก engine ที่มีอยู่ + ใส่ config)
 * ทุกเกมเชื่อมกับแผน (planIds) และกิจกรรมหลัก (activityType)
 */
/** 👥 ป้ายบอกว่าเกมนี้เล่นได้กี่คน */
export function playersLabel(g: { players?: number[] }): { emoji: string; label: string } {
  const p = g.players ?? [1];
  if (p.length === 1 && p[0] === 1) return { emoji: "👤", label: "เล่นคนเดียว" };
  if (p.includes(1) && p.includes(2)) return { emoji: "👬", label: "เล่นคนเดียว หรือ 2 คน" };
  if (p.includes(2) && !p.includes(1)) return { emoji: "👬", label: "เล่น 2 คน" };
  return { emoji: "👨‍👩‍👧", label: `เล่น ${Math.min(...p)}–${Math.max(...p)} คน` };
}

export const GAMES: Game[] = [
  /* 🧩 จิ๊กซอว์ — แต่ละหมวดเป็นเกมหนึ่งเกม กดแล้วไปหน้าต่อภาพของหมวดนั้น */
  ...JIGSAW_CATEGORIES.map((c): Game => ({
    id: `jigsaw-${c.id}`,
    title: `จิ๊กซอว์ · ${c.label}`,
    emoji: "🧩",
    cover: c.tint,
    description: `${c.hint} — ภาพมีช่องว่าง ลากชิ้นจากด้านข้างมาวางให้ตรงช่อง มี ${c.pictures.length} ภาพ และ 3 ระดับ`,
    skills: ["การสังเกต", "จับคู่รูปทรง", "กล้ามเนื้อมือ", "ความอดทน"],
    gradeId: "k1",
    ages: "2–6 ปี",
    players: [1],
    category: "puzzle",
    zone: "edu",
    planIds: [],
    activityType: "game",
    href: `/jigsaw/${c.id}`,
    config: { engine: "tile-puzzle", scene: ["🧩"], size: 3 },
  })),

  /* 🔨 เกมตีตุ่น — ฝึกการตอบสนอง สมาธิ และการยับยั้งใจ */
  {
    id: "whack-mole",
    title: "ตีตุ่น",
    emoji: "🔨",
    cover: "bg-yellow-soft",
    description: "ตุ่นโผล่ขึ้นมาจากรู แตะให้ทันก่อนมันมุดลงไป ฝึกสายตา มือ และสมาธิให้ไว",
    skills: ["การตอบสนองเร็ว", "สมาธิ", "ประสานมือกับตา", "การสังเกต"],
    gradeId: "k0",
    ages: "2–6 ปี",
    players: [1],
    category: "reflex",
    zone: "fun",
    planIds: [],
    activityType: "game",
    config: { engine: "whack" },
  },
  {
    id: "whack-thai",
    title: "ตีตุ่นตัวอักษรไทย",
    emoji: "🔤",
    cover: "bg-mint-soft",
    description: "ครูบอกตัวอักษรที่ต้องตี แล้วตีเฉพาะตัวนั้น ตัวอื่นห้ามตี — ฝึกจำพยัญชนะและฝึกยับยั้งใจไปพร้อมกัน",
    skills: ["จำพยัญชนะไทย", "การยับยั้งใจ", "สมาธิ", "การตอบสนองเร็ว"],
    gradeId: "k2",
    ages: "4–6 ปี",
    players: [1],
    category: "reflex",
    zone: "edu",
    planIds: [],
    activityType: "game",
    config: {
      engine: "whack",
      prompt: "ตีเฉพาะตัวอักษร",
      items: ["ก", "ข", "ค", "ง", "จ", "ฉ", "ช", "ด", "ต", "น", "บ", "ป", "ม", "ย", "ร", "ล", "ว", "ส", "ห", "อ"],
    },
  },
  {
    id: "whack-number",
    title: "ตีตุ่นตัวเลข",
    emoji: "🔢",
    cover: "bg-sky-soft",
    description: "ตีเฉพาะตัวเลขที่กำหนด ตัวอื่นปล่อยไป — ฝึกจำตัวเลขและความไวในการสังเกต",
    skills: ["จำตัวเลข 1–10", "การยับยั้งใจ", "สมาธิ", "การตอบสนองเร็ว"],
    gradeId: "k1",
    ages: "3–6 ปี",
    players: [1],
    category: "reflex",
    zone: "edu",
    planIds: [],
    activityType: "game",
    config: {
      engine: "whack",
      prompt: "ตีเฉพาะตัวเลข",
      items: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    },
  },

  /* ♟️ เกมกระดาน & วางแผน — ฝึกคิดล่วงหน้า วางแผน และยอมรับการแพ้ชนะ */
  {
    id: "flash-memory",
    title: "จับคู่ความจำ ไทย–อังกฤษ",
    emoji: "🃏",
    cover: "bg-purple-100",
    description: "เปิดการ์ด 2 ใบให้เป็นของสิ่งเดียวกัน ใบหนึ่งคำไทย อีกใบคำอังกฤษ — คำศัพท์ดึงมาจากคลังแฟลชการ์ดโดยตรง ครูเพิ่มบัตรเอง เกมก็มีคำใหม่ให้เล่นทันที",
    skills: ["ความจำ", "สมาธิ", "คำศัพท์ไทย–อังกฤษ", "การเชื่อมโยงภาพกับคำ"],
    gradeId: "k1",
    ages: "3–6 ปี",
    players: [1],
    category: "board",
    zone: "edu",
    planIds: [],
    activityType: "game",
    config: { engine: "flash-memory", pairs: 6 },
  },
  {
    id: "tic-tac-toe",
    title: "โอเอ็กซ์",
    emoji: "⭕",
    cover: "bg-mint-soft",
    description: "วางเครื่องหมายให้เรียงกัน 3 ช่องก่อนอีกฝ่าย เล่นกับเครื่องหรือเล่นกับเพื่อนก็ได้ — เกมแรกที่สอนให้เด็กคิดล่วงหน้าว่าอีกฝ่ายจะทำอะไร",
    skills: ["คิดล่วงหน้า", "การวางแผน", "การสังเกตแนวเรียง", "ยอมรับการแพ้ชนะ"],
    gradeId: "k1",
    ages: "3–6 ปี",
    players: [1, 2],
    category: "board",
    zone: "edu",
    planIds: [],
    activityType: "game",
    config: { engine: "tic-tac-toe", marks: ["❌", "⭕"] },
  },
  {
    id: "connect-four",
    title: "เรียงสี่",
    emoji: "🔴",
    cover: "bg-sky-soft",
    description: "หย่อนเม็ดลงหลักให้เรียงกัน 4 เม็ด ทั้งแนวนอน แนวตั้ง หรือแนวทแยง ต้องมองให้ออกว่าอีกฝ่ายกำลังจะเรียงตรงไหน",
    skills: ["การวางแผน", "มองหาแนวทแยง", "การคาดเดาล่วงหน้า", "สมาธิ"],
    gradeId: "k2",
    ages: "4–6 ปี",
    players: [1, 2],
    category: "board",
    zone: "edu",
    planIds: [],
    activityType: "game",
    config: { engine: "connect-four" },
  },
  {
    id: "checkers-mini",
    title: "หมากฮอสจิ๋ว",
    emoji: "⚫",
    cover: "bg-yellow-soft",
    description: "หมากฮอสกระดาน 6×6 ย่อขนาดให้เด็กเล่นไหว เดินทแยงไปข้างหน้า กระโดดข้ามเพื่อกิน ไปถึงแถวสุดท้ายได้เป็นคิง",
    skills: ["วางแผนหลายตา", "การตัดสินใจ", "ยอมเสียเพื่อได้เปรียบ", "ความอดทน"],
    gradeId: "k3",
    ages: "5–6 ปี",
    players: [1, 2],
    category: "board",
    zone: "edu",
    planIds: [],
    activityType: "game",
    config: { engine: "checkers" },
  },
  {
    id: "hanoi-tower",
    title: "หอคอยฮานอย",
    emoji: "🗼",
    cover: "bg-pink-soft",
    description: "ย้ายจานทั้งหมดไปหอขวาสุด ทีละจาน ห้ามวางจานใหญ่ทับจานเล็ก — ฝึกแก้ปัญหาเป็นขั้นตอน พื้นฐานของการเขียนโปรแกรม",
    skills: ["แก้ปัญหาเป็นขั้นตอน", "การวางแผน", "ความอดทน", "คิดย้อนกลับ"],
    gradeId: "k3",
    ages: "5–6 ปี",
    players: [1],
    category: "board",
    zone: "edu",
    planIds: [],
    activityType: "game",
    config: { engine: "hanoi", discs: 3 },
  },
  {
    id: "fruit-match",
    title: "จับคู่ผลไม้",
    emoji: "🍎",
    cover: "bg-pink-soft",
    description: "เปิดการ์ดทีละ 2 ใบ หาผลไม้ที่เหมือนกันให้ครบทุกคู่",
    skills: ["ความจำ", "การสังเกต", "สมาธิ"],
    gradeId: "k1",
    category: "matching",
    planIds: ["food", "vegetables"],
    activityType: "game",
    config: {
      engine: "memory",
      pairs: [
        { emoji: "🍎", label: "แอปเปิล" }, { emoji: "🍌", label: "กล้วย" }, { emoji: "🍇", label: "องุ่น" },
        { emoji: "🍉", label: "แตงโม" }, { emoji: "🍊", label: "ส้ม" }, { emoji: "🥭", label: "มะม่วง" },
      ],
    },
  },
  {
    id: "animal-match",
    title: "จับคู่สัตว์น่ารัก",
    emoji: "🐶",
    cover: "bg-yellow-soft",
    description: "หาสัตว์ตัวเหมือนกันให้เจอ เปิดการ์ดได้ทีละ 2 ใบ",
    skills: ["ความจำ", "การสังเกต"],
    gradeId: "k1",
    category: "matching",
    planIds: ["animals"],
    activityType: "game",
    config: {
      engine: "memory",
      pairs: [
        { emoji: "🐶", label: "หมา" }, { emoji: "🐱", label: "แมว" }, { emoji: "🐰", label: "กระต่าย" },
        { emoji: "🐸", label: "กบ" }, { emoji: "🐥", label: "ลูกเจี๊ยบ" }, { emoji: "🐟", label: "ปลา" },
      ],
    },
  },
  {
    id: "color-hunt",
    title: "หาสีให้ถูก",
    emoji: "🎨",
    cover: "bg-purple-100",
    description: "ครูบอกสี หนูช่วยแตะสิ่งของที่มีสีนั้นให้ถูกนะ",
    skills: ["การจำแนกสี", "การฟัง", "การสังเกต"],
    gradeId: "k1",
    category: "color",
    planIds: ["myself", "shapes"],
    activityType: "game",
    config: {
      engine: "color-match",
      rounds: [
        { color: "#e53935", name: "สีแดง", items: [{ emoji: "🍎", color: "#e53935" }, { emoji: "🍌", color: "#fdd835" }, { emoji: "🍇", color: "#8e24aa" }, { emoji: "🥦", color: "#43a047" }] },
        { color: "#fdd835", name: "สีเหลือง", items: [{ emoji: "🐸", color: "#43a047" }, { emoji: "🌻", color: "#fdd835" }, { emoji: "🍓", color: "#e53935" }, { emoji: "🫐", color: "#1e88e5" }] },
        { color: "#43a047", name: "สีเขียว", items: [{ emoji: "🍊", color: "#fb8c00" }, { emoji: "🥝", color: "#43a047" }, { emoji: "🍆", color: "#8e24aa" }, { emoji: "🌞", color: "#fdd835" }] },
        { color: "#1e88e5", name: "สีฟ้า", items: [{ emoji: "🐳", color: "#1e88e5" }, { emoji: "🍅", color: "#e53935" }, { emoji: "🐤", color: "#fdd835" }, { emoji: "🥕", color: "#fb8c00" }] },
        { color: "#8e24aa", name: "สีม่วง", items: [{ emoji: "🍋", color: "#fdd835" }, { emoji: "🍇", color: "#8e24aa" }, { emoji: "🥬", color: "#43a047" }, { emoji: "🍒", color: "#e53935" }] },
      ],
    },
  },
  {
    id: "count-order",
    title: "เรียงตัวเลข 1–5",
    emoji: "🔢",
    cover: "bg-sky-soft",
    description: "แตะกลุ่มผลไม้จากน้อยไปหามาก 1 2 3 4 5",
    skills: ["การนับ", "การเรียงลำดับ", "คณิตศาสตร์เบื้องต้น"],
    gradeId: "k1",
    category: "ordering",
    planIds: ["food", "shapes"],
    activityType: "game",
    config: {
      engine: "sort",
      rounds: [
        { title: "แตะจากน้อยไปมาก", items: [{ emoji: "🍎", count: 1, value: 1, label: "1" }, { emoji: "🍎", count: 2, value: 2, label: "2" }, { emoji: "🍎", count: 3, value: 3, label: "3" }, { emoji: "🍎", count: 4, value: 4, label: "4" }, { emoji: "🍎", count: 5, value: 5, label: "5" }] },
        { title: "แตะจากเล็กไปใหญ่", items: [{ emoji: "🐜", value: 1, label: "มด" }, { emoji: "🐭", value: 2, label: "หนู" }, { emoji: "🐱", value: 3, label: "แมว" }, { emoji: "🐘", value: 4, label: "ช้าง" }] },
        { title: "แตะจากน้อยไปมาก", items: [{ emoji: "⭐", count: 1, value: 1, label: "1" }, { emoji: "⭐", count: 2, value: 2, label: "2" }, { emoji: "⭐", count: 3, value: 3, label: "3" }] },
      ],
    },
  },
  {
    id: "odd-one-out",
    title: "ตัวไหนไม่เข้าพวก",
    emoji: "🔍",
    cover: "bg-mint-soft",
    description: "สังเกตดี ๆ แล้วแตะสิ่งที่ไม่เข้าพวกกับเพื่อน",
    skills: ["การสังเกต", "การจำแนก", "การคิดวิเคราะห์"],
    gradeId: "k1",
    category: "observe",
    planIds: ["animals", "food", "insects"],
    activityType: "game",
    config: {
      engine: "odd-one-out",
      // คลังรูปของแต่ละรอบ — ระบบหยิบมาใช้ตามระดับ (ง่าย 3 รูป/1 ตัวแปลก · ปานกลาง 6/2 · ยาก 10/3–4)
      rounds: [
        { hint: "หาตัวที่ไม่ใช่สัตว์", group: ["🐶", "🐱", "🐰", "🐻", "🐼", "🦊", "🐯", "🐮"], odds: ["🍎", "🚗", "📚", "🌸", "🎈"] },
        { hint: "หาตัวที่ไม่ใช่ผลไม้", group: ["🍌", "🍇", "🍉", "🍓", "🍎", "🍊", "🍍", "🥭"], odds: ["🐸", "🚲", "📏", "🧢", "⚽"] },
        { hint: "หาตัวที่ไม่ใช่แมลง", group: ["🐝", "🦋", "🐞", "🐜", "🦗", "🕷️", "🪲", "🐛"], odds: ["🐟", "🐶", "🍰", "🚌", "🌙"] },
        { hint: "หาตัวที่ไม่ใช่ยานพาหนะ", group: ["🚗", "🚌", "🚲", "🚂", "✈️", "🚢", "🛵", "🚚"], odds: ["🍓", "🐱", "🌳", "📖", "🧦"] },
        { hint: "หาตัวที่ไม่ใช่อุปกรณ์การเรียน", group: ["✏️", "📚", "✂️", "📏", "🖍️", "📒", "🎒", "🖌️"], odds: ["🐤", "🍉", "🚗", "🌈", "⛅"] },
        { hint: "หาตัวที่กินไม่ได้", group: ["🍚", "🍜", "🍞", "🥚", "🍗", "🥛", "🍲", "🥗"], odds: ["🚗", "🐶", "📕", "🌻", "🧸"] },
      ],
    },
  },
  {
    id: "tile-puzzle-farm",
    title: "ภาพตัดต่อ ฟาร์มแสนสุข",
    emoji: "🖼️",
    cover: "bg-yellow-soft",
    description: "แตะช่อง 2 ช่องเพื่อสลับที่ ต่อภาพให้เหมือนต้นแบบ",
    skills: ["การสังเกต", "มิติสัมพันธ์", "การแก้ปัญหา"],
    gradeId: "k1",
    category: "puzzle",
    planIds: ["animals", "happy-home"],
    activityType: "game",
    config: {
      engine: "tile-puzzle",
      size: 3,
      scene: ["☀️", "☁️", "🐦", "🌳", "🏠", "🌳", "🐄", "🐔", "🐷"],
    },
  },
  {
    id: "letter-match",
    title: "จับคู่ ก ไก่ กับภาพ",
    emoji: "🔤",
    cover: "bg-purple-100",
    description: "แตะตัวอักษร แล้วแตะภาพที่ขึ้นต้นด้วยตัวอักษรนั้น",
    skills: ["ภาษา", "การจำตัวอักษร", "การเชื่อมโยง"],
    gradeId: "k1",
    category: "letter",
    planIds: ["myself", "animals"],
    activityType: "game",
    config: {
      engine: "pair-columns",
      pairs: [
        { left: "ก", right: "🐔", label: "ก ไก่" },
        { left: "ข", right: "🥚", label: "ข ไข่" },
        { left: "ค", right: "🐃", label: "ค ควาย" },
        { left: "ง", right: "🐍", label: "ง งู" },
        { left: "จ", right: "🍽️", label: "จ จาน" },
      ],
    },
  },
  {
    id: "shadow-animals",
    title: "จับคู่กับเงา",
    emoji: "🌑",
    cover: "bg-sky-soft",
    description: "แตะสัตว์ แล้วแตะเงาที่มีรูปร่างเหมือนกัน",
    skills: ["การสังเกตรูปร่าง", "มิติสัมพันธ์", "การเชื่อมโยง"],
    gradeId: "k1",
    category: "shadow",
    planIds: ["animals", "shapes"],
    activityType: "game",
    config: {
      engine: "shadow-match",
      items: [
        { emoji: "🐘", label: "ช้าง" }, { emoji: "🦒", label: "ยีราฟ" }, { emoji: "🐢", label: "เต่า" },
        { emoji: "🦋", label: "ผีเสื้อ" }, { emoji: "🐟", label: "ปลา" },
      ],
    },
  },
  {
    id: "shadow-things",
    title: "เงาของฉันคืออะไร",
    emoji: "🌓",
    cover: "bg-mint-soft",
    description: "ของใช้และผลไม้รอบตัว จับคู่กับเงาให้ถูกนะ",
    skills: ["การสังเกตรูปร่าง", "การจำแนก"],
    gradeId: "k1",
    category: "shadow",
    planIds: ["food", "shapes", "myself"],
    activityType: "game",
    config: {
      engine: "shadow-match",
      items: [
        { emoji: "🍌", label: "กล้วย" }, { emoji: "☂️", label: "ร่ม" }, { emoji: "✂️", label: "กรรไกร" },
        { emoji: "🧸", label: "ตุ๊กตาหมี" }, { emoji: "🚲", label: "จักรยาน" },
      ],
    },
  },
  {
    id: "body-match",
    title: "จับคู่อวัยวะ",
    emoji: "🧒",
    cover: "bg-pink-soft",
    description: "หาคู่อวัยวะที่เหมือนกัน ตา หู จมูก ปาก มือ เท้า",
    skills: ["ความจำ", "รู้จักอวัยวะ"],
    gradeId: "k1",
    category: "matching",
    planIds: ["myself", "senses"],
    activityType: "game",
    config: {
      engine: "memory",
      pairs: [
        { emoji: "👁️", label: "ตา" }, { emoji: "👂", label: "หู" }, { emoji: "👃", label: "จมูก" },
        { emoji: "👄", label: "ปาก" }, { emoji: "✋", label: "มือ" }, { emoji: "🦶", label: "เท้า" },
      ],
    },
  },
  /* 🧠 ตรรกะและการคิด — เกมเลื่อน (Sliding Puzzle) ใช้กลไกเดียวกันกับตัวเลข ตัวอักษร รูปภาพ สี รูปทรง */
  {
    id: "slide-numbers", title: "เกมเลื่อนตัวเลข 1–8", emoji: "🔢", cover: "bg-purple-100",
    description: "แตะตัวเลขที่อยู่ติดช่องว่างเพื่อเลื่อน เรียงให้เป็น 1 → 8 ฝึกการคิด สังเกต และวางแผน",
    skills: ["เรียงลำดับตัวเลข", "การวางแผน", "การสังเกต", "สมาธิ"], gradeId: "k2", ages: "4–6 ปี", category: "logic", planIds: ["myself"], activityType: "game",
    config: { engine: "sliding", items: ["1", "2", "3", "4", "5", "6", "7", "8"], size: 3, theme: "purple" },
  },
  {
    id: "slide-thai", title: "เกมเลื่อนตัวอักษร ก–ซ", emoji: "🔤", cover: "bg-pink-soft",
    description: "เลื่อนตัวอักษรไทยให้เรียงตามลำดับ ก ข ฃ ค ฅ ฆ ง จ",
    skills: ["ลำดับตัวอักษร", "การวางแผน", "การสังเกต"], gradeId: "k2", ages: "4–6 ปี", category: "logic", planIds: ["myself"], activityType: "game",
    config: { engine: "sliding", items: ["ก", "ข", "ฃ", "ค", "ฅ", "ฆ", "ง", "จ"], size: 3, theme: "pink" },
  },
  {
    id: "slide-abc", title: "เกมเลื่อนตัวอักษร A–H", emoji: "🅰️", cover: "bg-sky-soft",
    description: "เลื่อนตัวอักษรอังกฤษให้เรียง A → H",
    skills: ["ลำดับตัวอักษร A–Z", "การวางแผน"], gradeId: "k2", ages: "4–6 ปี", category: "logic", planIds: ["myself"], activityType: "game",
    config: { engine: "sliding", items: ["A", "B", "C", "D", "E", "F", "G", "H"], size: 3, theme: "yellow" },
  },
  {
    id: "slide-animals", title: "เกมเลื่อนภาพสัตว์", emoji: "🐾", cover: "bg-mint-soft",
    description: "เลื่อนชิ้นภาพสัตว์ให้เรียงตามภาพเป้าหมาย (ดูภาพเป้าหมายด้านข้าง)",
    skills: ["การสังเกต", "การจำตำแหน่ง", "การวางแผน"], gradeId: "k1", ages: "3–5 ปี", category: "logic", planIds: ["animals"], activityType: "game",
    config: { engine: "sliding", items: ["🐶", "🐱", "🐰", "🐻", "🐼", "🐸", "🐥", "🐷"], size: 3, theme: "green" },
  },
  {
    id: "slide-colors", title: "เกมเลื่อนสี", emoji: "🎨", cover: "bg-yellow-soft",
    description: "เลื่อนช่องสีให้เรียงตามสายรุ้ง 🔴 🟠 🟡 🟢 🔵 🟣 🟤 ⚫",
    skills: ["จำแนกสี", "ลำดับ", "การวางแผน"], gradeId: "k1", ages: "3–5 ปี", category: "logic", planIds: ["myself"], activityType: "game",
    config: { engine: "sliding", items: ["🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "🟤", "⚫"], size: 3, theme: "pink" },
  },
  {
    id: "slide-shapes", title: "เกมเลื่อนรูปทรง", emoji: "🔷", cover: "bg-purple-100",
    description: "เลื่อนรูปทรงให้เรียงตามภาพเป้าหมาย ฝึกจำแนกรูปทรงเรขาคณิต",
    skills: ["รูปทรงเรขาคณิต", "การสังเกต", "การวางแผน"], gradeId: "k2", ages: "4–6 ปี", category: "logic", planIds: ["myself"], activityType: "game",
    config: { engine: "sliding", items: ["🔺", "🟦", "🟢", "⭐", "💜", "🔶", "🟥", "🔵"], size: 3, theme: "purple" },
  },
  ...CODING_GAMES,
];


export const getGame = (id: string) => GAMES.find((g) => g.id === id);
export const getGamesForPlan = (planId: string) => GAMES.filter((g) => g.planIds.includes(planId));
export const getGamesByCategory = (c: GameCategory) => GAMES.filter((g) => g.category === c);

/** 🎮 เกมเล่นสนุก */
export const funGames = () => GAMES.filter((g) => gameZone(g) === "fun");
/** 🧩 เกมการศึกษา (ฝึกทักษะ) */
export const eduGames = () => GAMES.filter((g) => gameZone(g) === "edu");
