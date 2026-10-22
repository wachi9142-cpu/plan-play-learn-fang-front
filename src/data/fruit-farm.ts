/**
 * 🌳 เกมเจ้าของสวนผลไม้ — ข้อมูลผลไม้ ปุ๋ย ของในร้าน และสัตว์ที่เข้ามารบกวน
 *
 * ⚠️ หมายเหตุสำคัญ (แสดงในเกมด้วย)
 *   • ตารางรดน้ำและใส่ปุ๋ยในเกมเป็นตารางของเกมเท่านั้น ไม่ใช่คำแนะนำการปลูกพืชจริง
 *   • ไม่บอกว่าปุ๋ยชนิดใดดีที่สุด เพราะขึ้นกับสภาพดินและชนิดพืช
 *   • สัตว์ที่เข้ามาเป็นแค่ตัวรบกวนในเกม เด็กแค่ "ไล่" ไม่มีการทำร้ายสัตว์
 */

/* ───────────── ผลไม้ ───────────── */

export interface Fruit {
  id: string;
  emoji: string;
  /** ผลที่ยังไม่สุก — ใช้ตอนโจทย์ขอผลดิบ */
  rawEmoji: string;
  name: string;
  nameEn: string;
  /** ราคาขายผลสุก (บาทจำลอง) */
  price: number;
  /** ราคาขายผลดิบ */
  rawPrice: number;
  /** ได้ผลกี่ลูกต่อการเก็บ 1 ครั้ง */
  yield: number;
  /** ราคาเมล็ด */
  seedPrice: number;
  fact: string;
}

export const FRUITS: Fruit[] = [
  { id: "mango", emoji: "🥭", rawEmoji: "🥑", name: "มะม่วง", nameEn: "Mango", price: 5, rawPrice: 3, yield: 3, seedPrice: 0, fact: "มะม่วงดิบรสเปรี้ยว พอสุกแล้วจะหวานและเปลี่ยนเป็นสีเหลือง" },
  { id: "orange", emoji: "🍊", rawEmoji: "🟢", name: "ส้ม", nameEn: "Orange", price: 6, rawPrice: 3, yield: 3, seedPrice: 10, fact: "ส้มมีวิตามินซีสูง ช่วยให้ร่างกายแข็งแรง" },
  { id: "banana", emoji: "🍌", rawEmoji: "🟩", name: "กล้วย", nameEn: "Banana", price: 4, rawPrice: 2, yield: 4, seedPrice: 10, fact: "กล้วยออกเป็นหวี หวีหนึ่งมีหลายลูก" },
  { id: "watermelon", emoji: "🍉", rawEmoji: "🫒", name: "แตงโม", nameEn: "Watermelon", price: 8, rawPrice: 4, yield: 2, seedPrice: 18, fact: "แตงโมมีน้ำเยอะมาก กินแล้วสดชื่นในหน้าร้อน" },
  { id: "pineapple", emoji: "🍍", rawEmoji: "🌵", name: "สับปะรด", nameEn: "Pineapple", price: 9, rawPrice: 4, yield: 2, seedPrice: 22, fact: "สับปะรดไม่ได้ออกบนต้นสูง แต่ขึ้นจากกอเตี้ย ๆ ติดดิน" },
  { id: "apple", emoji: "🍎", rawEmoji: "🍏", name: "แอปเปิล", nameEn: "Apple", price: 7, rawPrice: 4, yield: 3, seedPrice: 20, fact: "แอปเปิลชอบอากาศเย็น บ้านเราจึงปลูกได้ดีบนดอยสูง" },
];

export const findFruit = (id: string) => FRUITS.find((f) => f.id === id)!;

/* ───────────── ปุ๋ย ───────────── */

export interface Fertilizer {
  id: string;
  emoji: string;
  name: string;
  price: number;
  /** คำอธิบายที่แสดงในเกม — เขียนกลาง ๆ ไม่บอกว่าชนิดไหนดีที่สุด */
  about: string;
}

export const FERTILIZERS: Fertilizer[] = [
  { id: "basic", emoji: "🧪", name: "ปุ๋ยทั่วไป", price: 4, about: "ช่วยเติมธาตุอาหารให้พืช ใช้ดูแลต้นไม้ตามคำแนะนำ" },
  { id: "cow", emoji: "🐄", name: "ปุ๋ยคอกวัว", price: 5, about: "มูลวัวที่ผ่านการหมักอย่างเหมาะสม ช่วยเพิ่มอินทรียวัตถุและปรับปรุงดิน" },
  { id: "buffalo", emoji: "🐃", name: "ปุ๋ยคอกควาย", price: 5, about: "มูลควายที่ผ่านการจัดการอย่างเหมาะสม ช่วยเพิ่มอินทรียวัตถุให้ดิน" },
  { id: "compost", emoji: "🍂", name: "ปุ๋ยหมัก", price: 6, about: "ทำจากเศษใบไม้และวัสดุอินทรีย์ที่ย่อยสลายแล้ว ช่วยปรับปรุงโครงสร้างดิน" },
];

/* ───────────── ของในร้านค้า ───────────── */

export type ShopKind = "bag" | "dog" | "hawk" | "picker" | "guard";

export interface ShopItem {
  id: ShopKind;
  emoji: string;
  name: string;
  price: number;
  about: string;
  /** ผลที่ได้รับ เขียนให้เด็กและครูเห็นก่อนตัดสินใจซื้อ */
  effect: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: "bag", emoji: "🛍️", name: "ถุงห่อผลไม้", price: 20, about: "ห่อผลไม้ไว้ไม่ให้นกและแมลงจิก", effect: "สัตว์ทำผลไม้เสียหายน้อยลงครึ่งหนึ่ง" },
  { id: "dog", emoji: "🐕", name: "สุนัขเฝ้าสวน", price: 35, about: "เห่าเตือนและไล่สัตว์ที่เข้ามาในพื้นที่สวน แต่ปีนต้นไม้ไม่ได้", effect: "ไล่ลิงให้เองบางครั้ง" },
  { id: "hawk", emoji: "🦅", name: "เหยี่ยวเฝ้าสวน", price: 45, about: "บินวนเหนือสวน ช่วยไล่นกที่เข้ามารบกวน", effect: "ไล่นกให้เองบางครั้ง" },
  { id: "picker", emoji: "🧑‍🌾", name: "คนเก็บผลไม้", price: 40, about: "ช่วยเก็บผลไม้ที่สุกแล้วให้อัตโนมัติ", effect: "เก็บผลสุกให้เองเป็นระยะ" },
  { id: "guard", emoji: "💂", name: "คนเฝ้าสวน", price: 50, about: "เดินตรวจสวนแทนเรา ช่วยลดภาระการไล่สัตว์", effect: "สัตว์เข้ามาน้อยลง" },
];

export const findShopItem = (id: ShopKind) => SHOP_ITEMS.find((s) => s.id === id)!;

/* ───────────── สัตว์ที่เข้ามารบกวน ───────────── */

export interface Pest {
  id: "monkey" | "bird";
  emoji: string;
  name: string;
  sound: string;
  /** เวลาที่เด็กมีให้ไล่ (มิลลิวินาที) */
  grace: number;
  about: string;
}

export const PESTS: Pest[] = [
  { id: "monkey", emoji: "🐒", name: "ลิง", sound: "เจี๊ยก ๆ", grace: 3200, about: "ลิงปีนขึ้นต้นไม้มาขโมยผลไม้ คลิกที่ลิงเพื่อไล่" },
  { id: "bird", emoji: "🐦", name: "นก", sound: "จิ๊บ ๆ", grace: 2600, about: "นกบินมาจิกผลไม้ คลิกที่นกเพื่อไล่" },
];

/* ───────────── ขั้นการเติบโต ───────────── */

export type Stage = "empty" | "seed" | "sprout" | "tree" | "flower" | "fruit" | "ripe";

/** สิ่งที่ต้องทำกับแปลงในแต่ละขั้น — เด็กเลือกเครื่องมือให้ตรงแล้วคลิกที่แปลง */
export type Need = "seed" | "water" | "fert" | "wait" | "harvest";

export interface StageInfo {
  stage: Stage;
  emoji: string;
  label: string;
  need: Need;
  /** คำบอกใบ้ที่ลอยอยู่เหนือแปลง */
  bubble: string;
}

export const STAGES: Record<Stage, StageInfo> = {
  empty: { stage: "empty", emoji: "🟫", label: "แปลงว่าง", need: "seed", bubble: "🌰" },
  seed: { stage: "seed", emoji: "🌰", label: "หยอดเมล็ดแล้ว", need: "water", bubble: "💧" },
  sprout: { stage: "sprout", emoji: "🌱", label: "ต้นกล้า", need: "water", bubble: "💧" },
  tree: { stage: "tree", emoji: "🌳", label: "ต้นโต", need: "fert", bubble: "🧪" },
  flower: { stage: "flower", emoji: "🌸", label: "ออกดอก", need: "water", bubble: "💧" },
  fruit: { stage: "fruit", emoji: "🫒", label: "ติดผล ยังไม่สุก", need: "wait", bubble: "⏳" },
  ripe: { stage: "ripe", emoji: "🥭", label: "ผลสุกพร้อมเก็บ", need: "harvest", bubble: "🧺" },
};

/** ขั้นถัดไปเมื่อทำถูกต้องแล้ว */
export const NEXT_STAGE: Record<Stage, Stage> = {
  empty: "seed",
  seed: "sprout",
  sprout: "tree",
  tree: "flower",
  flower: "fruit",
  fruit: "ripe",
  /** เก็บผลแล้วต้นยังอยู่ กลับไปเป็นต้นโตรอใส่ปุ๋ยรอบใหม่ */
  ripe: "tree",
};

/** ชื่อเครื่องมือที่เด็กเลือกได้ */
export const TOOLS: { id: Need; emoji: string; label: string; hint: string }[] = [
  { id: "seed", emoji: "🌰", label: "เมล็ด", hint: "หยอดลงแปลงว่าง" },
  { id: "water", emoji: "💧", label: "บัวรดน้ำ", hint: "รดต้นที่ขอน้ำ" },
  { id: "fert", emoji: "🧪", label: "ปุ๋ย", hint: "ใส่ให้ต้นโตออกดอก" },
  { id: "harvest", emoji: "🧺", label: "เก็บผล", hint: "เก็บผลที่สุกแล้ว" },
];

export const toolOf = (n: Need) => TOOLS.find((t) => t.id === n);

/* ───────────── เกร็ดสวนผลไม้ ───────────── */

export const FARM_TIPS = [
  "ต้นไม้ต้องการน้ำ แสงแดด และดินดี จึงจะโตและออกผล",
  "ผลดิบกับผลสุกราคาไม่เท่ากัน ลองสังเกตสีของผลให้ดี",
  "ปุ๋ยคอกมาจากมูลสัตว์ที่หมักจนไม่มีกลิ่นแล้ว ช่วยทำให้ดินร่วนซุย",
  "ปุ๋ยหมักทำจากเศษใบไม้และเศษอาหารในครัว เป็นการใช้ของเหลือให้มีประโยชน์",
  "ลิงกับนกไม่ได้ร้าย เขาแค่หิว ชาวสวนจึงใช้วิธีห่อผลไม้หรือทำที่ไล่แทนการทำร้าย",
];
