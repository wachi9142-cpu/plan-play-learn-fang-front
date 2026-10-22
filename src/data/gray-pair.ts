/**
 * ⬛ เกมจับคู่ภาพขาวดำ — คลังภาพและระดับตามชั้นเรียน
 *
 * เด็กจับคู่ภาพขาวดำฝั่งซ้าย กับภาพสีฝั่งขวาที่เป็นของสิ่งเดียวกัน
 * ระดับสูงขึ้นจะมีภาพที่ "รูปร่างคล้ายกัน" ปนมาเป็นตัวลวง เช่น 🍊 กับ 🍋
 */

export interface PairItem {
  emoji: string;
  name: string;
  nameEn: string;
}

export interface PairSet {
  id: string;
  emoji: string;
  label: string;
  labelEn: string;
  hint: string;
  tint: string;
  items: PairItem[];
  /** กลุ่มภาพที่รูปร่างใกล้เคียงกัน — ใช้สุ่มตัวลวงในระดับยาก */
  similar: string[][];
}

export const PAIR_SETS: PairSet[] = [
  {
    id: "animals",
    emoji: "🐘",
    label: "สัตว์",
    labelEn: "Animals",
    hint: "สัตว์ที่เด็กรู้จัก บางตัวรูปร่างคล้ายกันต้องดูดี ๆ",
    tint: "bg-mint-soft",
    items: [
      { emoji: "🐶", name: "สุนัข", nameEn: "Dog" },
      { emoji: "🐱", name: "แมว", nameEn: "Cat" },
      { emoji: "🐰", name: "กระต่าย", nameEn: "Rabbit" },
      { emoji: "🐘", name: "ช้าง", nameEn: "Elephant" },
      { emoji: "🦒", name: "ยีราฟ", nameEn: "Giraffe" },
      { emoji: "🐢", name: "เต่า", nameEn: "Turtle" },
      { emoji: "🐸", name: "กบ", nameEn: "Frog" },
      { emoji: "🐥", name: "ลูกเจี๊ยบ", nameEn: "Chick" },
      { emoji: "🐴", name: "ม้า", nameEn: "Horse" },
      { emoji: "🐷", name: "หมู", nameEn: "Pig" },
      { emoji: "🦋", name: "ผีเสื้อ", nameEn: "Butterfly" },
      { emoji: "🐟", name: "ปลา", nameEn: "Fish" },
    ],
    similar: [["🐶", "🐺", "🦊"], ["🐱", "🐯", "🦁"], ["🐴", "🦓", "🦌"], ["🐷", "🐮", "🐻"]],
  },
  {
    id: "fruit",
    emoji: "🍎",
    label: "ผลไม้",
    labelEn: "Fruit",
    hint: "ผลไม้หลายอย่างกลมเหมือนกัน ต้องดูรูปร่างและก้านให้ดี",
    tint: "bg-pink-soft",
    items: [
      { emoji: "🍎", name: "แอปเปิล", nameEn: "Apple" },
      { emoji: "🍌", name: "กล้วย", nameEn: "Banana" },
      { emoji: "🍊", name: "ส้ม", nameEn: "Orange" },
      { emoji: "🍉", name: "แตงโม", nameEn: "Watermelon" },
      { emoji: "🍇", name: "องุ่น", nameEn: "Grapes" },
      { emoji: "🍓", name: "สตรอว์เบอร์รี", nameEn: "Strawberry" },
      { emoji: "🥭", name: "มะม่วง", nameEn: "Mango" },
      { emoji: "🍍", name: "สับปะรด", nameEn: "Pineapple" },
      { emoji: "🥝", name: "กีวี", nameEn: "Kiwi" },
      { emoji: "🍐", name: "ลูกแพร์", nameEn: "Pear" },
      { emoji: "🥥", name: "มะพร้าว", nameEn: "Coconut" },
      { emoji: "🍑", name: "ลูกพีช", nameEn: "Peach" },
    ],
    similar: [["🍊", "🍋", "🍎"], ["🍐", "🍏", "🥑"], ["🍑", "🍅", "🍎"], ["🫐", "🍇", "🍒"]],
  },
  {
    id: "vehicle",
    emoji: "🚗",
    label: "ยานพาหนะ",
    labelEn: "Vehicles",
    hint: "รถหลายคันหน้าตาคล้ายกัน ดูขนาดและรูปทรงให้ดี",
    tint: "bg-sky-soft",
    items: [
      { emoji: "🚗", name: "รถยนต์", nameEn: "Car" },
      { emoji: "🚌", name: "รถโรงเรียน", nameEn: "Bus" },
      { emoji: "🚲", name: "จักรยาน", nameEn: "Bicycle" },
      { emoji: "✈️", name: "เครื่องบิน", nameEn: "Airplane" },
      { emoji: "🚂", name: "รถไฟ", nameEn: "Train" },
      { emoji: "⛵", name: "เรือใบ", nameEn: "Sailboat" },
      { emoji: "🚑", name: "รถพยาบาล", nameEn: "Ambulance" },
      { emoji: "🚒", name: "รถดับเพลิง", nameEn: "Fire Truck" },
      { emoji: "🚜", name: "รถแทรกเตอร์", nameEn: "Tractor" },
      { emoji: "🛵", name: "รถมอเตอร์ไซค์", nameEn: "Scooter" },
      { emoji: "🚁", name: "เฮลิคอปเตอร์", nameEn: "Helicopter" },
      { emoji: "🛺", name: "รถตุ๊กตุ๊ก", nameEn: "Tuk-tuk" },
    ],
    similar: [["🚗", "🚙", "🚕"], ["🚌", "🚎", "🚐"], ["🚑", "🚒", "🚓"], ["✈️", "🛩️", "🚁"]],
  },
  {
    id: "things",
    emoji: "🪥",
    label: "สิ่งของรอบตัว",
    labelEn: "Everyday Objects",
    hint: "ของใช้ในบ้านและที่โรงเรียน",
    tint: "bg-yellow-soft",
    items: [
      { emoji: "🪥", name: "แปรงสีฟัน", nameEn: "Toothbrush" },
      { emoji: "🥛", name: "แก้วนม", nameEn: "Glass of Milk" },
      { emoji: "👟", name: "รองเท้า", nameEn: "Shoes" },
      { emoji: "🎒", name: "กระเป๋านักเรียน", nameEn: "Backpack" },
      { emoji: "✏️", name: "ดินสอ", nameEn: "Pencil" },
      { emoji: "📚", name: "หนังสือ", nameEn: "Books" },
      { emoji: "☂️", name: "ร่ม", nameEn: "Umbrella" },
      { emoji: "✂️", name: "กรรไกร", nameEn: "Scissors" },
      { emoji: "🧦", name: "ถุงเท้า", nameEn: "Socks" },
      { emoji: "🪑", name: "เก้าอี้", nameEn: "Chair" },
      { emoji: "🕐", name: "นาฬิกา", nameEn: "Clock" },
      { emoji: "🧸", name: "ตุ๊กตาหมี", nameEn: "Teddy Bear" },
    ],
    similar: [["✏️", "🖊️", "🖍️"], ["📚", "📗", "📘"], ["🥛", "🧃", "🥤"], ["🕐", "⏰", "⌚"]],
  },
  {
    id: "number",
    emoji: "🔢",
    label: "ตัวเลข",
    labelEn: "Numbers",
    hint: "จับคู่ตัวเลขขาวดำกับตัวเลขสี — เลขบางตัวหน้าตาคล้ายกัน",
    tint: "bg-purple-100",
    items: [
      { emoji: "1️⃣", name: "เลขหนึ่ง", nameEn: "One" },
      { emoji: "2️⃣", name: "เลขสอง", nameEn: "Two" },
      { emoji: "3️⃣", name: "เลขสาม", nameEn: "Three" },
      { emoji: "4️⃣", name: "เลขสี่", nameEn: "Four" },
      { emoji: "5️⃣", name: "เลขห้า", nameEn: "Five" },
      { emoji: "6️⃣", name: "เลขหก", nameEn: "Six" },
      { emoji: "7️⃣", name: "เลขเจ็ด", nameEn: "Seven" },
      { emoji: "8️⃣", name: "เลขแปด", nameEn: "Eight" },
      { emoji: "9️⃣", name: "เลขเก้า", nameEn: "Nine" },
      { emoji: "🔟", name: "เลขสิบ", nameEn: "Ten" },
    ],
    similar: [["6️⃣", "9️⃣", "8️⃣"], ["1️⃣", "7️⃣", "4️⃣"], ["2️⃣", "5️⃣", "3️⃣"]],
  },
];

export const findPairSet = (id: string) => PAIR_SETS.find((s) => s.id === id);

/* ───────────── ระดับตามชั้นเรียน ───────────── */

export interface GrayLevel {
  id: "k1" | "k2" | "k3" | "primary";
  emoji: string;
  label: string;
  grade: string;
  ages: string;
  /** จำนวนคู่ที่ต้องจับ */
  pairs: number;
  /** เวลา (วินาที) — 0 = ไม่จำกัด */
  seconds: number;
  /** ภาพลวงที่ไม่มีคู่ ฝั่งขวา */
  decoys: number;
  /** ใช้ภาพที่รูปร่างคล้ายกันเป็นตัวลวงไหม */
  similar: boolean;
  /** จับคู่ผิดหักคะแนนไหม */
  penalty: boolean;
  /** ต้องจับคู่ถูกกี่คู่ถึงผ่าน */
  need: number;
  about: string;
}

export const GRAY_LEVELS: GrayLevel[] = [
  {
    id: "k1", emoji: "🟢", label: "ง่ายมาก", grade: "อนุบาล 1", ages: "3–4 ปี",
    pairs: 3, seconds: 0, decoys: 0, similar: false, penalty: false, need: 1,
    about: "ภาพน้อย ชัดเจน ไม่จำกัดเวลา จับคู่ถูกครั้งเดียวก็ผ่านแล้ว",
  },
  {
    id: "k2", emoji: "🔵", label: "ง่าย", grade: "อนุบาล 2", ages: "4–5 ปี",
    pairs: 5, seconds: 90, decoys: 0, similar: false, penalty: false, need: 3,
    about: "ภาพมากขึ้น มีเวลาแบบยืดหยุ่น 90 วินาที ต้องจับคู่ถูกอย่างน้อย 3 คู่",
  },
  {
    id: "k3", emoji: "🟡", label: "ปานกลาง", grade: "อนุบาล 3", ages: "5–6 ปี",
    pairs: 7, seconds: 60, decoys: 1, similar: true, penalty: true, need: 5,
    about: "เริ่มมีภาพตัวลวงที่คล้ายกัน จำกัดเวลา 60 วินาที จับคู่ผิดลดคะแนนเล็กน้อย",
  },
  {
    id: "primary", emoji: "🔴", label: "ยาก", grade: "ประถมขึ้นไป", ages: "6 ปีขึ้นไป",
    pairs: 10, seconds: 45, decoys: 3, similar: true, penalty: true, need: 7,
    about: "ภาพเยอะและคล้ายกันสูง ตัวลวง 3 ภาพ เวลา 45 วินาที มีโบนัสเมื่อจับคู่ถูกติดต่อกัน",
  },
];

export const findGrayLevel = (id: string) => GRAY_LEVELS.find((l) => l.id === id) ?? GRAY_LEVELS[0];

/* ───────────── คะแนน ───────────── */
export const SCORE = {
  /** จับคู่ถูกครั้งแรกของภาพนั้น */
  first: 10,
  /** จับคู่ถูกหลังเคยพลาดมาก่อน */
  retry: 5,
  /** จับคู่ผิด (เฉพาะระดับที่หักคะแนน) */
  wrong: -2,
  /** โบนัสต่อวินาทีที่เหลือ */
  timeBonus: 1,
  /** โบนัสเมื่อจับคู่ถูกติดต่อกัน ตั้งแต่ครั้งที่ 3 ขึ้นไป */
  streak: 3,
};
