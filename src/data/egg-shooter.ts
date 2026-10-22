/**
 * 🥚 เกมยิงไข่ไดโนเสาร์ — โหมดการเรียนรู้และระดับความยาก
 *
 * กติกาเดิมของเกมยิงบอลคือจับคู่ "สี" ให้ครบ 3 ลูก
 * เกมนี้เปลี่ยนเกณฑ์การจับคู่ได้ เป็น รูปร่าง ตัวเลข หรือพยัญชนะไทย
 * เด็กจึงได้ฝึกเนื้อหาไปพร้อมกับความสนุกแบบเดิม
 */

export interface EggKind {
  id: string;
  /** สีของไข่ */
  color: string;
  /** สีจุดบนไข่ */
  spot: string;
  /** สัญลักษณ์กลางไข่ (โหมดสีไม่มี) */
  symbol?: string;
  /** ชื่อสำหรับอ่านออกเสียงและสรุปผล */
  name: string;
}

export interface EggMode {
  id: "color" | "shape" | "number" | "thai";
  emoji: string;
  label: string;
  about: string;
  /** เกณฑ์การจับคู่ที่บอกเด็ก */
  rule: string;
  kinds: EggKind[];
}

export const EGG_MODES: EggMode[] = [
  {
    id: "color",
    emoji: "🎨",
    label: "จับคู่สี",
    about: "แบบดั้งเดิม — ยิงไข่สีเดียวกันให้ครบ 3 ฟอง",
    rule: "ไข่สีเดียวกันครบ 3 ฟองจะแตก",
    kinds: [
      { id: "red", color: "#ef6b6b", spot: "#c7453f", name: "ไข่สีแดง" },
      { id: "blue", color: "#5ab7e8", spot: "#2d84b5", name: "ไข่สีฟ้า" },
      { id: "green", color: "#6cc97f", spot: "#3d9a52", name: "ไข่สีเขียว" },
      { id: "yellow", color: "#f2c94c", spot: "#c99b14", name: "ไข่สีเหลือง" },
      { id: "purple", color: "#b185e0", spot: "#7f52b5", name: "ไข่สีม่วง" },
      { id: "orange", color: "#f09a4e", spot: "#c56a1c", name: "ไข่สีส้ม" },
    ],
  },
  {
    id: "shape",
    emoji: "🔷",
    label: "จับคู่รูปร่าง",
    about: "ยิงไข่ที่มีรูปร่างเหมือนกันให้ครบ 3 ฟอง",
    rule: "ไข่ที่มีรูปร่างเหมือนกันครบ 3 ฟองจะแตก",
    kinds: [
      { id: "circle", color: "#ef6b6b", spot: "#c7453f", symbol: "⬤", name: "วงกลม" },
      { id: "square", color: "#5ab7e8", spot: "#2d84b5", symbol: "◼", name: "สี่เหลี่ยม" },
      { id: "triangle", color: "#6cc97f", spot: "#3d9a52", symbol: "▲", name: "สามเหลี่ยม" },
      { id: "star", color: "#f2c94c", spot: "#c99b14", symbol: "★", name: "ดาว" },
      { id: "heart", color: "#f39ec4", spot: "#cf5f97", symbol: "♥", name: "หัวใจ" },
      { id: "diamond", color: "#b185e0", spot: "#7f52b5", symbol: "◆", name: "ข้าวหลามตัด" },
    ],
  },
  {
    id: "number",
    emoji: "🔢",
    label: "จับคู่ตัวเลข",
    about: "ยิงไข่ที่มีตัวเลขเดียวกันให้ครบ 3 ฟอง",
    rule: "ไข่ที่มีตัวเลขเดียวกันครบ 3 ฟองจะแตก",
    kinds: [
      { id: "n1", color: "#ef6b6b", spot: "#c7453f", symbol: "1", name: "เลขหนึ่ง" },
      { id: "n2", color: "#5ab7e8", spot: "#2d84b5", symbol: "2", name: "เลขสอง" },
      { id: "n3", color: "#6cc97f", spot: "#3d9a52", symbol: "3", name: "เลขสาม" },
      { id: "n4", color: "#f2c94c", spot: "#c99b14", symbol: "4", name: "เลขสี่" },
      { id: "n5", color: "#b185e0", spot: "#7f52b5", symbol: "5", name: "เลขห้า" },
      { id: "n6", color: "#f09a4e", spot: "#c56a1c", symbol: "6", name: "เลขหก" },
    ],
  },
  {
    id: "thai",
    emoji: "🔤",
    label: "จับคู่พยัญชนะไทย",
    about: "ยิงไข่ที่มีพยัญชนะเดียวกันให้ครบ 3 ฟอง",
    rule: "ไข่ที่มีพยัญชนะเดียวกันครบ 3 ฟองจะแตก",
    kinds: [
      { id: "ko", color: "#ef6b6b", spot: "#c7453f", symbol: "ก", name: "กอ ไก่" },
      { id: "kho", color: "#5ab7e8", spot: "#2d84b5", symbol: "ข", name: "ขอ ไข่" },
      { id: "kho2", color: "#6cc97f", spot: "#3d9a52", symbol: "ค", name: "คอ ควาย" },
      { id: "ngo", color: "#f2c94c", spot: "#c99b14", symbol: "ง", name: "งอ งู" },
      { id: "jo", color: "#b185e0", spot: "#7f52b5", symbol: "จ", name: "จอ จาน" },
      { id: "do", color: "#f09a4e", spot: "#c56a1c", symbol: "ด", name: "ดอ เด็ก" },
    ],
  },
];

export const findEggMode = (id: string) => EGG_MODES.find((m) => m.id === id) ?? EGG_MODES[0];

/* ───────────── ระดับความยาก ───────────── */

export interface EggLevel {
  id: "easy" | "medium" | "hard";
  emoji: string;
  label: string;
  ages: string;
  /** จำนวนช่องแนวนอน */
  cols: number;
  /** แถวไข่ตอนเริ่ม */
  rows: number;
  /** ใช้ไข่กี่ชนิด */
  kinds: number;
  /** ยิงพลาดกี่ครั้งแล้วไข่เลื่อนลงมา 1 แถว */
  pushEvery: number;
  /** ไข่ลงมาถึงแถวไหนแล้วแพ้ */
  maxRows: number;
  about: string;
}

export const EGG_LEVELS: EggLevel[] = [
  { id: "easy", emoji: "🟢", label: "ง่าย", ages: "4–5 ปี", cols: 7, rows: 3, kinds: 3, pushEvery: 9, maxRows: 9, about: "ไข่ 3 สี ช่องกว้าง เล็งง่าย ไข่เลื่อนลงช้า" },
  { id: "medium", emoji: "🟡", label: "ปานกลาง", ages: "5–6 ปี", cols: 8, rows: 4, kinds: 4, pushEvery: 7, maxRows: 9, about: "ไข่ 4 แบบ เริ่มต้องเล็งให้แม่นขึ้น" },
  { id: "hard", emoji: "🔴", label: "ยาก", ages: "6 ปีขึ้นไป", cols: 9, rows: 5, kinds: 6, pushEvery: 5, maxRows: 10, about: "ไข่ 6 แบบ ช่องแคบลง และไข่เลื่อนลงเร็ว" },
];

export const findEggLevel = (id: string) => EGG_LEVELS.find((l) => l.id === id) ?? EGG_LEVELS[0];

export const EGG_TIPS = [
  "ไข่ไดโนเสาร์ของจริงมีเปลือกแข็งและมีลายจุด ช่วยพรางตัวจากศัตรู",
  "ยิงเฉียงให้ไข่สะท้อนขอบข้างได้นะ บางทีเป็นทางเดียวที่เข้าถึงมุมบน",
  "ถ้ายิงไข่จนกลุ่มด้านบนขาด ไข่ที่ลอยอยู่จะร่วงลงมาเองและได้คะแนนเพิ่ม",
  "ลองมองก่อนยิงว่าไข่ในมือเป็นแบบไหน แล้วหากลุ่มที่มีแบบเดียวกันอยู่แล้ว 2 ฟอง",
];
