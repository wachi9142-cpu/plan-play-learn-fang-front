import type { Game, GameCategory } from "@/types";

export const GAME_CATEGORIES: Record<GameCategory, { emoji: string; label: string }> = {
  matching: { emoji: "🧩", label: "เกมจับคู่" },
  puzzle: { emoji: "🖼️", label: "เกมภาพตัดต่อ" },
  ordering: { emoji: "🔢", label: "เกมเรียงลำดับ" },
  observe: { emoji: "🔍", label: "เกมสังเกตและค้นหา" },
  color: { emoji: "🎨", label: "เกมจับคู่สี" },
  letter: { emoji: "🔤", label: "เกมจับคู่ภาพ/ตัวอักษร" },
  shadow: { emoji: "🌑", label: "เกมจับคู่กับเงา" },
};

/**
 * คลังเกมออนไลน์ — เพิ่มเกมใหม่ = เพิ่ม object ใหม่ (เลือก engine ที่มีอยู่ + ใส่ config)
 * ทุกเกมเชื่อมกับแผน (planIds) และกิจกรรมหลัก (activityType)
 */
export const GAMES: Game[] = [
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
      rounds: [
        { items: ["🐶", "🐱", "🍎", "🐰"], odd: "🍎", hint: "อันไหนไม่ใช่สัตว์" },
        { items: ["🍌", "🍇", "🐸", "🍉"], odd: "🐸", hint: "อันไหนไม่ใช่ผลไม้" },
        { items: ["🐝", "🦋", "🐞", "🐟"], odd: "🐟", hint: "อันไหนไม่ใช่แมลง" },
        { items: ["🚗", "🚌", "🍓", "🚲"], odd: "🍓", hint: "อันไหนกินได้" },
        { items: ["🔴", "🔴", "🔵", "🔴"], odd: "🔵", hint: "สีไหนต่างจากเพื่อน" },
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
];

export const getGame = (id: string) => GAMES.find((g) => g.id === id);
export const getGamesForPlan = (planId: string) => GAMES.filter((g) => g.planIds.includes(planId));
export const getGamesByCategory = (c: GameCategory) => GAMES.filter((g) => g.category === c);
