/**
 * 🍎 เกมหนูน้อยเลือกกิน — คลังอาหาร
 *
 * ⚠️ ถ้อยคำสำคัญ: แบ่งเป็น "กินได้บ่อย" กับ "กินแต่น้อย" เท่านั้น
 *    ไม่เขียนว่าขนมเป็นของไม่ดี เป็นพิษ หรือกินแล้วป่วยทันที
 *    เด็กปฐมวัยควรเรียนรู้เรื่องปริมาณและความถี่ ไม่ใช่ความกลัวอาหาร
 */

export type FoodKind = "good" | "less";

export interface Food {
  emoji: string;
  name: string;
  nameEn: string;
  kind: FoodKind;
  /** เหตุผลสั้น ๆ ภาษาเด็ก — ขึ้นตอนเลือกถูก */
  why: string;
}

/** 🥦 กินได้บ่อย ๆ — อาหารหลักและผักผลไม้ */
const GOOD: Food[] = [
  { emoji: "🥦", name: "บรอกโคลี", nameEn: "Broccoli", kind: "good", why: "ผักสีเขียวช่วยให้ร่างกายแข็งแรง" },
  { emoji: "🥕", name: "แครอท", nameEn: "Carrot", kind: "good", why: "แครอทมีวิตามินช่วยบำรุงสายตา" },
  { emoji: "🍎", name: "แอปเปิล", nameEn: "Apple", kind: "good", why: "ผลไม้มีกากใย ช่วยให้ท้องไม่ผูก" },
  { emoji: "🍌", name: "กล้วย", nameEn: "Banana", kind: "good", why: "กล้วยให้พลังงาน วิ่งเล่นได้นาน" },
  { emoji: "🍚", name: "ข้าว", nameEn: "Rice", kind: "good", why: "ข้าวเป็นอาหารหลัก ให้พลังงานทั้งวัน" },
  { emoji: "🥛", name: "นม", nameEn: "Milk", kind: "good", why: "นมมีแคลเซียม ช่วยให้กระดูกและฟันแข็งแรง" },
  { emoji: "🐟", name: "ปลา", nameEn: "Fish", kind: "good", why: "ปลามีโปรตีน ช่วยให้ร่างกายเติบโต" },
  { emoji: "🥚", name: "ไข่", nameEn: "Egg", kind: "good", why: "ไข่มีโปรตีน กินได้ทุกวัน" },
  { emoji: "🍊", name: "ส้ม", nameEn: "Orange", kind: "good", why: "ส้มมีวิตามินซี ช่วยให้ไม่เป็นหวัดง่าย" },
  { emoji: "🥬", name: "ผักใบเขียว", nameEn: "Leafy Greens", kind: "good", why: "ผักใบเขียวมีวิตามินและแร่ธาตุเยอะ" },
  { emoji: "🍅", name: "มะเขือเทศ", nameEn: "Tomato", kind: "good", why: "มะเขือเทศสีแดงสด มีวิตามินดีต่อผิว" },
  { emoji: "🌽", name: "ข้าวโพด", nameEn: "Corn", kind: "good", why: "ข้าวโพดให้พลังงานและมีกากใย" },
  { emoji: "🍠", name: "มันเทศ", nameEn: "Sweet Potato", kind: "good", why: "มันเทศหวานธรรมชาติ และมีกากใย" },
  { emoji: "🥒", name: "แตงกวา", nameEn: "Cucumber", kind: "good", why: "แตงกวามีน้ำเยอะ กินแล้วสดชื่น" },
  { emoji: "🍉", name: "แตงโม", nameEn: "Watermelon", kind: "good", why: "แตงโมมีน้ำเยอะ ช่วยดับร้อน" },
  { emoji: "🫘", name: "ถั่ว", nameEn: "Beans", kind: "good", why: "ถั่วมีโปรตีน ช่วยให้ร่างกายเติบโต" },
  { emoji: "🍲", name: "แกงจืด", nameEn: "Clear Soup", kind: "good", why: "แกงจืดมีผักและเนื้อ กินง่ายสบายท้อง" },
  { emoji: "💧", name: "น้ำเปล่า", nameEn: "Water", kind: "good", why: "น้ำเปล่าดีที่สุด ดื่มได้ทั้งวัน" },
];

/** 🍬 กินแต่น้อย — ของหวานและของทอด กินได้ แต่ไม่ควรกินทุกวัน */
const LESS: Food[] = [
  { emoji: "🍬", name: "ลูกอม", nameEn: "Candy", kind: "less", why: "ลูกอมหวานมาก กินบ่อยฟันผุได้" },
  { emoji: "🍭", name: "อมยิ้ม", nameEn: "Lollipop", kind: "less", why: "อมนาน ๆ น้ำตาลติดฟัน ควรกินนาน ๆ ที" },
  { emoji: "🧁", name: "คัพเค้ก", nameEn: "Cupcake", kind: "less", why: "ของหวานอร่อย แต่เก็บไว้เป็นของพิเศษดีกว่า" },
  { emoji: "🍩", name: "โดนัท", nameEn: "Donut", kind: "less", why: "ทอดและหวาน กินนาน ๆ ครั้งพอ" },
  { emoji: "🍟", name: "มันฝรั่งทอด", nameEn: "French Fries", kind: "less", why: "ของทอดมีน้ำมันเยอะ ไม่ควรกินทุกวัน" },
  { emoji: "🥤", name: "น้ำอัดลม", nameEn: "Soft Drink", kind: "less", why: "น้ำหวานมีน้ำตาลมาก ดื่มน้ำเปล่าดีกว่า" },
  { emoji: "🍪", name: "คุกกี้", nameEn: "Cookie", kind: "less", why: "คุกกี้หวาน กินแต่น้อยนะ" },
  { emoji: "🍫", name: "ช็อกโกแลต", nameEn: "Chocolate", kind: "less", why: "ช็อกโกแลตหวาน กินชิ้นเล็ก ๆ ก็พอ" },
  { emoji: "🧋", name: "ชานมไข่มุก", nameEn: "Bubble Tea", kind: "less", why: "น้ำตาลเยอะและไข่มุกเหนียว เด็กเล็กต้องระวังติดคอ" },
  { emoji: "🍰", name: "เค้ก", nameEn: "Cake", kind: "less", why: "เก็บไว้กินวันพิเศษ เช่น วันเกิด" },
  { emoji: "🍦", name: "ไอศกรีม", nameEn: "Ice Cream", kind: "less", why: "เย็นและหวาน กินนาน ๆ ที" },
  { emoji: "🍿", name: "ป๊อปคอร์นปรุงรส", nameEn: "Flavored Popcorn", kind: "less", why: "ปรุงรสเค็มหวาน กินแต่น้อย" },
];

export const FOODS: Food[] = [...GOOD, ...LESS];
export const goodFoods = () => GOOD;
export const lessFoods = () => LESS;

/** คำชมตอนเลือกถูก — สุ่มให้ไม่ซ้ำเดิม */
export const PRAISE_GOOD = [
  "เก่งมาก เลือกอาหารที่มีประโยชน์!",
  "ใช่เลย กินแล้วแข็งแรง",
  "เยี่ยม! หนูเลือกเก่งจัง",
  "ถูกต้องนะ อาหารนี้กินได้บ่อย ๆ",
];

export const PRAISE_LESS = [
  "ถูกแล้ว อันนี้กินแต่น้อยพอ",
  "เก่งมาก รู้จักแยกของหวานได้",
  "ใช่เลย เก็บไว้กินนาน ๆ ที",
  "ดีมาก! รู้ว่าอันไหนไม่ควรกินทุกวัน",
];

/** คำแนะนำตอนวางผิดที่ — เป็นมิตร ไม่ดุ ไม่หักคะแนน */
export const HINT_WRONG: Record<FoodKind, string> = {
  good: "อันนี้มีประโยชน์นะ ลองลากไปให้หนูน้อยกินดูไหม",
  less: "อันนี้หวานไปหน่อย ลองลากไปใส่ถังขยะดูนะ",
};

/** 🧒 สีหน้าตัวละครตามสถานการณ์ */
export const FACES = {
  wait: "😋",
  happy: "😄",
  think: "🤔",
  done: "🥰",
} as const;

/**
 * 📌 หมายเหตุสำหรับครู — แสดงในแฟ้มข้อมูลเกม ไม่ขึ้นระหว่างเล่น
 * • ขนมหวานไม่ใช่ของที่กินแล้วป่วยทันที แต่เป็นของที่ควรกินแต่น้อย
 * • หมากฝรั่งและไข่มุกไม่เหมาะกับเด็กเล็ก เพราะเสี่ยงติดคอ จึงไม่ใส่หมากฝรั่งในเกม
 * • เด็กบางคนมีข้อจำกัดด้านอาหาร ครูควรเชื่อมโยงกับเรื่องของแพ้ในหน้าเมนูอาหาร
 */
