/**
 * 👩‍🚒 เกมแต่งตัวตามอาชีพ — คลังอาชีพ เครื่องแต่งกาย และอุปกรณ์
 *
 * เด็กเลือกของที่ "คนทำอาชีพนี้ใช้จริง" ให้ครบ
 * ระดับสูงขึ้นจะมีของหลอกที่ดูคล้ายกันปนมา และมีโหมดแต่งตามสถานการณ์
 */

export interface DressItem {
  emoji: string;
  label: string;
}

export interface Job {
  id: string;
  emoji: string;
  name: string;
  nameEn: string;
  /** คำอธิบายสั้น ๆ ว่าอาชีพนี้ทำอะไร */
  about: string;
  /** ของที่อาชีพนี้ใช้จริง เรียงจากชิ้นหลักไปชิ้นรอง */
  items: DressItem[];
  /** เหมาะกับช่วงชั้นไหนขึ้นไป */
  tier: 1 | 2 | 3;
  /** โหมดแต่งตามสถานการณ์ (ระดับประถม) */
  situations?: { title: string; need: DressItem[] }[];
}

export const JOBS: Job[] = [
  /* ───── ชั้นที่ 1 — อนุบาล 1–2 รู้จักดี ───── */
  {
    id: "doctor", emoji: "👨‍⚕️", name: "หมอ", nameEn: "Doctor", tier: 1,
    about: "ตรวจและรักษาคนป่วยให้หายดี",
    items: [
      { emoji: "🥼", label: "เสื้อกาวน์" },
      { emoji: "🩺", label: "หูฟังตรวจโรค" },
      { emoji: "💊", label: "ยา" },
      { emoji: "😷", label: "หน้ากากอนามัย" },
      { emoji: "🧤", label: "ถุงมือ" },
    ],
    situations: [
      { title: "หมอกำลังจะเข้าห้องผ่าตัด ต้องใส่อะไรบ้าง", need: [{ emoji: "🥼", label: "ชุดผ่าตัด" }, { emoji: "😷", label: "หน้ากากอนามัย" }, { emoji: "🧤", label: "ถุงมือ" }] },
    ],
  },
  {
    id: "police", emoji: "👮", name: "ตำรวจ", nameEn: "Police Officer", tier: 1,
    about: "ดูแลความปลอดภัยและช่วยเหลือประชาชน",
    items: [
      { emoji: "👕", label: "เครื่องแบบ" },
      { emoji: "🧢", label: "หมวก" },
      { emoji: "📣", label: "โทรโข่ง" },
      { emoji: "🚓", label: "รถตำรวจ" },
      { emoji: "🦺", label: "เสื้อสะท้อนแสง" },
    ],
  },
  {
    id: "chef", emoji: "👨‍🍳", name: "เชฟ", nameEn: "Chef", tier: 1,
    about: "ทำอาหารอร่อย ๆ ให้ทุกคนกิน",
    items: [
      { emoji: "👨‍🍳", label: "หมวกเชฟ" },
      { emoji: "🥄", label: "ทัพพี" },
      { emoji: "🍳", label: "กระทะ" },
      { emoji: "🔪", label: "มีดทำครัว" },
      { emoji: "🧑‍🍳", label: "ผ้ากันเปื้อน" },
    ],
  },
  {
    id: "teacher", emoji: "👩‍🏫", name: "ครู", nameEn: "Teacher", tier: 1,
    about: "สอนและดูแลเด็ก ๆ ที่โรงเรียน",
    items: [
      { emoji: "📚", label: "หนังสือ" },
      { emoji: "✏️", label: "ดินสอ" },
      { emoji: "🖍️", label: "ชอล์กสี" },
      { emoji: "🎒", label: "กระเป๋า" },
      { emoji: "🧮", label: "ลูกคิด" },
    ],
  },
  {
    id: "firefighter", emoji: "🧑‍🚒", name: "นักดับเพลิง", nameEn: "Firefighter", tier: 1,
    about: "ดับไฟและช่วยคนออกจากที่อันตราย",
    items: [
      { emoji: "⛑️", label: "หมวกนิรภัย" },
      { emoji: "🧯", label: "ถังดับเพลิง" },
      { emoji: "🚒", label: "รถดับเพลิง" },
      { emoji: "🪜", label: "บันได" },
      { emoji: "🧤", label: "ถุงมือกันความร้อน" },
    ],
  },

  /* ───── ชั้นที่ 2 — อนุบาล 3 ───── */
  {
    id: "pilot", emoji: "🧑‍✈️", name: "นักบิน", nameEn: "Pilot", tier: 2,
    about: "ขับเครื่องบินพาคนเดินทางไกล",
    items: [
      { emoji: "🧢", label: "หมวกนักบิน" },
      { emoji: "👔", label: "เครื่องแบบ" },
      { emoji: "✈️", label: "เครื่องบิน" },
      { emoji: "🕶️", label: "แว่นกันแดด" },
      { emoji: "🧭", label: "เข็มทิศ" },
    ],
  },
  {
    id: "nurse", emoji: "👩‍⚕️", name: "พยาบาล", nameEn: "Nurse", tier: 2,
    about: "ดูแลคนไข้อย่างใกล้ชิด",
    items: [
      { emoji: "🥼", label: "ชุดพยาบาล" },
      { emoji: "💉", label: "เข็มฉีดยา" },
      { emoji: "🌡️", label: "ปรอทวัดไข้" },
      { emoji: "🩹", label: "พลาสเตอร์" },
      { emoji: "😷", label: "หน้ากากอนามัย" },
    ],
  },
  {
    id: "builder", emoji: "👷", name: "ช่างก่อสร้าง", nameEn: "Builder", tier: 2,
    about: "สร้างบ้านและอาคารให้เราอยู่",
    items: [
      { emoji: "⛑️", label: "หมวกนิรภัย" },
      { emoji: "🔨", label: "ค้อน" },
      { emoji: "🧱", label: "อิฐ" },
      { emoji: "📏", label: "ไม้บรรทัด" },
      { emoji: "🦺", label: "เสื้อสะท้อนแสง" },
    ],
  },
  {
    id: "farmer", emoji: "🧑‍🌾", name: "เกษตรกร", nameEn: "Farmer", tier: 2,
    about: "ปลูกข้าวและผักให้เราได้กิน",
    items: [
      { emoji: "👒", label: "หมวกฟาง" },
      { emoji: "🌾", label: "ต้นข้าว" },
      { emoji: "🪣", label: "บัวรดน้ำ" },
      { emoji: "🚜", label: "รถแทรกเตอร์" },
      { emoji: "🧤", label: "ถุงมือทำสวน" },
    ],
  },

  /* ───── ชั้นที่ 3 — ประถมขึ้นไป ───── */
  {
    id: "scientist", emoji: "🧑‍🔬", name: "นักวิทยาศาสตร์", nameEn: "Scientist", tier: 3,
    about: "ทดลองและค้นหาคำตอบของสิ่งต่าง ๆ",
    items: [
      { emoji: "🥼", label: "เสื้อกาวน์" },
      { emoji: "🥽", label: "แว่นตานิรภัย" },
      { emoji: "🔬", label: "กล้องจุลทรรศน์" },
      { emoji: "🧪", label: "หลอดทดลอง" },
      { emoji: "🧤", label: "ถุงมือ" },
      { emoji: "📓", label: "สมุดจดผล" },
    ],
    situations: [
      { title: "นักวิทยาศาสตร์กำลังจะทำการทดลองกับสารเคมี ต้องใส่อะไรบ้าง", need: [{ emoji: "🥼", label: "เสื้อกาวน์" }, { emoji: "🥽", label: "แว่นตานิรภัย" }, { emoji: "🧤", label: "ถุงมือ" }] },
    ],
  },
  {
    id: "engineer", emoji: "🧑‍🔧", name: "วิศวกร", nameEn: "Engineer", tier: 3,
    about: "ออกแบบและซ่อมเครื่องจักรกับสิ่งก่อสร้าง",
    items: [
      { emoji: "⛑️", label: "หมวกนิรภัย" },
      { emoji: "🔧", label: "ประแจ" },
      { emoji: "📐", label: "ไม้ฉาก" },
      { emoji: "💻", label: "คอมพิวเตอร์" },
      { emoji: "🦺", label: "เสื้อสะท้อนแสง" },
      { emoji: "📋", label: "แบบแปลน" },
    ],
  },
  {
    id: "astronaut", emoji: "👨‍🚀", name: "นักบินอวกาศ", nameEn: "Astronaut", tier: 3,
    about: "เดินทางไปสำรวจนอกโลก",
    items: [
      { emoji: "🪖", label: "หมวกอวกาศ" },
      { emoji: "🧑‍🚀", label: "ชุดอวกาศ" },
      { emoji: "🚀", label: "จรวด" },
      { emoji: "🛰️", label: "ดาวเทียม" },
      { emoji: "🔦", label: "ไฟฉาย" },
      { emoji: "🧭", label: "เข็มทิศ" },
    ],
  },
  {
    id: "reporter", emoji: "🧑‍💼", name: "นักข่าว", nameEn: "Reporter", tier: 3,
    about: "เก็บข้อมูลและรายงานข่าวให้คนอื่นรู้",
    items: [
      { emoji: "🎤", label: "ไมโครโฟน" },
      { emoji: "📷", label: "กล้องถ่ายรูป" },
      { emoji: "📝", label: "สมุดจด" },
      { emoji: "📺", label: "กล้องวิดีโอ" },
      { emoji: "🪪", label: "บัตรนักข่าว" },
      { emoji: "🎧", label: "หูฟัง" },
    ],
  },
  {
    id: "athlete", emoji: "🏃", name: "นักกีฬา", nameEn: "Athlete", tier: 3,
    about: "ฝึกซ้อมและแข่งกีฬา",
    items: [
      { emoji: "👟", label: "รองเท้ากีฬา" },
      { emoji: "🎽", label: "เสื้อแข่ง" },
      { emoji: "🏅", label: "เหรียญรางวัล" },
      { emoji: "⏱️", label: "นาฬิกาจับเวลา" },
      { emoji: "🥤", label: "ขวดน้ำ" },
      { emoji: "🧦", label: "ถุงเท้า" },
    ],
  },
];

export const jobsOfTier = (max: 1 | 2 | 3) => JOBS.filter((j) => j.tier <= max);
export const findJob = (id: string) => JOBS.find((j) => j.id === id);

/** ของหลอก — ของที่ไม่เกี่ยวกับอาชีพไหนในเกมนี้เลย */
export const DECOYS: DressItem[] = [
  { emoji: "🧸", label: "ตุ๊กตาหมี" },
  { emoji: "🍦", label: "ไอศกรีม" },
  { emoji: "🪁", label: "ว่าว" },
  { emoji: "🎸", label: "กีตาร์" },
  { emoji: "🎈", label: "ลูกโป่ง" },
  { emoji: "🪀", label: "ลูกข่าง" },
  { emoji: "🍿", label: "ป๊อปคอร์น" },
  { emoji: "🧦", label: "ถุงเท้าลายการ์ตูน" },
  { emoji: "🪥", label: "แปรงสีฟัน" },
  { emoji: "🛼", label: "โรลเลอร์สเกต" },
  { emoji: "🪆", label: "ตุ๊กตาแม่ลูกดก" },
  { emoji: "🎻", label: "ไวโอลิน" },
];

/* ───────────── ระดับตามชั้นเรียน ───────────── */

export interface DressLevel {
  id: "k1" | "k2" | "k3" | "primary";
  emoji: string;
  grade: string;
  ages: string;
  label: string;
  /** จำนวนชิ้นที่ต้องเลือกต่ออาชีพ */
  need: number;
  /** จำนวนของหลอกในถาด */
  decoys: number;
  /** กี่อาชีพต่อรอบ */
  jobs: number;
  /** เวลาต่อรอบ (วินาที) — 0 = ไม่จำกัด */
  seconds: number;
  /** ใช้อาชีพถึงชั้นไหน */
  tier: 1 | 2 | 3;
  /** เปิดโหมดแต่งตามสถานการณ์ไหม */
  situation: boolean;
  about: string;
}

export const DRESS_LEVELS: DressLevel[] = [
  {
    id: "k1", emoji: "🟢", grade: "อนุบาล 1", ages: "3–4 ปี", label: "ง่ายมาก",
    need: 3, decoys: 2, jobs: 2, seconds: 0, tier: 1, situation: false,
    about: "เลือกของหลัก 3 ชิ้น ของหลอกน้อย ไม่จำกัดเวลา",
  },
  {
    id: "k2", emoji: "🔵", grade: "อนุบาล 2", ages: "4–5 ปี", label: "ง่าย",
    need: 4, decoys: 4, jobs: 3, seconds: 90, tier: 1, situation: false,
    about: "เพิ่มอุปกรณ์ประกอบอาชีพ มีของหลอกเล็กน้อย เวลา 90 วินาที",
  },
  {
    id: "k3", emoji: "🟡", grade: "อนุบาล 3", ages: "5–6 ปี", label: "ปานกลาง",
    need: 5, decoys: 6, jobs: 3, seconds: 60, tier: 2, situation: false,
    about: "ของหลอกมากขึ้น อาชีพหลากหลายขึ้น ต้องเลือกให้ครบและถูกทั้งหมด",
  },
  {
    id: "primary", emoji: "🔴", grade: "ประถมขึ้นไป", ages: "6 ปีขึ้นไป", label: "ยาก",
    need: 6, decoys: 8, jobs: 4, seconds: 45, tier: 3, situation: true,
    about: "หลายอาชีพในด่านเดียว ของหลอกเยอะ และมีโหมดแต่งตามสถานการณ์",
  },
];

export const findDressLevel = (id: string) => DRESS_LEVELS.find((l) => l.id === id) ?? DRESS_LEVELS[0];

export const DRESS_SCORE = { right: 10, wrong: -2, jobBonus: 15, speedBonus: 1 };
