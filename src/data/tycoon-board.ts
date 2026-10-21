/**
 * 🏘️ กระดานเกมเศรษฐีไทย — ใช้ภาษาไทยทั้งหมด เงินเป็นเงินจำลองหน่วยบาท
 *
 * ระดับที่ 1 (อายุ 4–6 ปี): กระดานเล็ก 16 ช่อง ราคาถูก ระบบช่วยคำนวณ
 * ระดับที่ 2 (อายุ 6 ปีขึ้นไป): กระดาน 24 ช่อง ราคาหลายระดับ สร้างบ้าน/โรงแรมได้
 */

export type SquareKind = "start" | "land" | "chance" | "tax" | "rest" | "bank";

export interface BoardSquare {
  kind: SquareKind;
  emoji: string;
  /** ชื่อช่องภาษาไทย */
  label: string;
  /** ราคาที่ดิน (เฉพาะช่อง land) */
  price?: number;
  /** ค่าเช่าที่ดินเปล่า */
  rent?: number;
  /** ค่าเช่าเมื่อมีบ้าน */
  rentHouse?: number;
  /** ค่าเช่าเมื่อมีโรงแรม */
  rentHotel?: number;
  /** จำนวนเงินของช่องโบนัส/ค่าบำรุง */
  amount?: number;
  /** ระดับราคา — ใช้แสดงสี */
  tier?: "cheap" | "mid" | "rich";
}

/** การ์ดเหตุการณ์ — ได้เงินหรือเสียเงิน พร้อมคำอธิบายภาษาไทย */
export interface ChanceCard {
  emoji: string;
  text: string;
  /** บวก = ได้เงิน · ลบ = เสียเงิน */
  money: number;
}

export const CHANCE_CARDS: ChanceCard[] = [
  { emoji: "🎁", text: "วันเกิด! เพื่อน ๆ ให้ของขวัญ ได้เงิน 100 บาท", money: 100 },
  { emoji: "⭐", text: "ช่วยครูเก็บของ ได้รางวัลเด็กดี 50 บาท", money: 50 },
  { emoji: "🏆", text: "ชนะการแข่งขันวาดรูป ได้เงินรางวัล 150 บาท", money: 150 },
  { emoji: "🍬", text: "ซื้อขนมเยอะไปหน่อย จ่าย 50 บาท", money: -50 },
  { emoji: "🚑", text: "ไปหาหมอเพราะเป็นหวัด จ่ายค่ายา 80 บาท", money: -80 },
  { emoji: "🧹", text: "ช่วยแม่ทำความสะอาดบ้าน ได้ค่าขนม 80 บาท", money: 80 },
  { emoji: "🚌", text: "ค่ารถไปโรงเรียนทั้งสัปดาห์ จ่าย 60 บาท", money: -60 },
  { emoji: "🐷", text: "เปิดกระปุกออมสิน ได้เงินเก็บคืน 120 บาท", money: 120 },
  { emoji: "📚", text: "ซื้อหนังสือเล่มใหม่ จ่าย 70 บาท", money: -70 },
  { emoji: "🌻", text: "ขายดอกไม้ที่ปลูกเอง ได้เงิน 90 บาท", money: 90 },
];

/** 🟢 ระดับที่ 1 — อายุ 4–6 ปี · กระดานเล็ก 16 ช่อง ราคาน้อย เลขอ่านง่าย */
export const BOARD_EASY: BoardSquare[] = [
  { kind: "start", emoji: "🏁", label: "จุดเริ่มต้น" },
  { kind: "land", emoji: "🍦", label: "ร้านไอศกรีม", price: 100, rent: 20, rentHouse: 50, rentHotel: 100, tier: "cheap" },
  { kind: "land", emoji: "🍞", label: "ร้านขนมปัง", price: 100, rent: 20, rentHouse: 50, rentHotel: 100, tier: "cheap" },
  { kind: "chance", emoji: "🎴", label: "การ์ดโอกาส" },
  { kind: "land", emoji: "🧸", label: "ร้านของเล่น", price: 200, rent: 40, rentHouse: 80, rentHotel: 150, tier: "mid" },
  { kind: "rest", emoji: "🌳", label: "สวนสาธารณะ" },
  { kind: "land", emoji: "📚", label: "ร้านหนังสือ", price: 200, rent: 40, rentHouse: 80, rentHotel: 150, tier: "mid" },
  { kind: "tax", emoji: "🧾", label: "ค่าบำรุงเมือง", amount: 50 },
  { kind: "land", emoji: "🌻", label: "ร้านดอกไม้", price: 200, rent: 40, rentHouse: 80, rentHotel: 150, tier: "mid" },
  { kind: "chance", emoji: "🎴", label: "การ์ดโอกาส" },
  { kind: "land", emoji: "🍜", label: "ร้านก๋วยเตี๋ยว", price: 300, rent: 60, rentHouse: 120, rentHotel: 200, tier: "rich" },
  { kind: "rest", emoji: "🏖️", label: "ไปเที่ยวทะเล" },
  { kind: "land", emoji: "🎨", label: "ร้านศิลปะ", price: 300, rent: 60, rentHouse: 120, rentHotel: 200, tier: "rich" },
  { kind: "bank", emoji: "🏦", label: "ธนาคาร รับเงิน 100 บาท", amount: 100 },
  { kind: "land", emoji: "🏫", label: "โรงเรียน", price: 300, rent: 60, rentHouse: 120, rentHotel: 200, tier: "rich" },
  { kind: "chance", emoji: "🎴", label: "การ์ดโอกาส" },
];

/** 🔴 ระดับที่ 2 — อายุ 6 ปีขึ้นไป · กระดาน 24 ช่อง ราคาหลายระดับ */
export const BOARD_HARD: BoardSquare[] = [
  { kind: "start", emoji: "🏁", label: "จุดเริ่มต้น" },
  { kind: "land", emoji: "🍦", label: "ร้านไอศกรีม", price: 100, rent: 20, rentHouse: 50, rentHotel: 100, tier: "cheap" },
  { kind: "land", emoji: "🍞", label: "ร้านขนมปัง", price: 100, rent: 20, rentHouse: 50, rentHotel: 100, tier: "cheap" },
  { kind: "chance", emoji: "🎴", label: "การ์ดโอกาส" },
  { kind: "land", emoji: "🧃", label: "ร้านน้ำผลไม้", price: 100, rent: 30, rentHouse: 60, rentHotel: 110, tier: "cheap" },
  { kind: "tax", emoji: "🧾", label: "ค่าบำรุงเมือง", amount: 50 },
  { kind: "land", emoji: "🧸", label: "ร้านของเล่น", price: 200, rent: 40, rentHouse: 80, rentHotel: 150, tier: "mid" },
  { kind: "land", emoji: "📚", label: "ร้านหนังสือ", price: 200, rent: 40, rentHouse: 80, rentHotel: 150, tier: "mid" },
  { kind: "rest", emoji: "🌳", label: "สวนสาธารณะ" },
  { kind: "land", emoji: "🌻", label: "ร้านดอกไม้", price: 200, rent: 50, rentHouse: 90, rentHotel: 160, tier: "mid" },
  { kind: "chance", emoji: "🎴", label: "การ์ดโอกาส" },
  { kind: "land", emoji: "👕", label: "ร้านเสื้อผ้า", price: 200, rent: 50, rentHouse: 90, rentHotel: 160, tier: "mid" },
  { kind: "bank", emoji: "🏦", label: "ธนาคาร รับเงิน 100 บาท", amount: 100 },
  { kind: "land", emoji: "🍜", label: "ร้านก๋วยเตี๋ยว", price: 300, rent: 60, rentHouse: 110, rentHotel: 180, tier: "rich" },
  { kind: "land", emoji: "🎨", label: "ร้านศิลปะ", price: 300, rent: 60, rentHouse: 110, rentHotel: 180, tier: "rich" },
  { kind: "chance", emoji: "🎴", label: "การ์ดโอกาส" },
  { kind: "land", emoji: "🏥", label: "โรงพยาบาล", price: 300, rent: 60, rentHouse: 120, rentHotel: 190, tier: "rich" },
  { kind: "tax", emoji: "🚌", label: "ค่าเดินทาง", amount: 60 },
  { kind: "land", emoji: "🏫", label: "โรงเรียน", price: 300, rent: 60, rentHouse: 120, rentHotel: 200, tier: "rich" },
  { kind: "rest", emoji: "🏖️", label: "ไปเที่ยวทะเล" },
  { kind: "land", emoji: "🎡", label: "สวนสนุก", price: 300, rent: 60, rentHouse: 120, rentHotel: 200, tier: "rich" },
  { kind: "chance", emoji: "🎴", label: "การ์ดโอกาส" },
  { kind: "land", emoji: "🏨", label: "โรงแรมใจกลางเมือง", price: 300, rent: 60, rentHouse: 120, rentHotel: 200, tier: "rich" },
  { kind: "tax", emoji: "🧾", label: "ค่าบำรุงเมือง", amount: 80 },
];

export const TYCOON_RULES = {
  startMoney: 1000,
  passStart: 100,
  housePrice: 100,
  hotelPrice: 200,
  /** ขายทรัพย์สินคืนได้ครึ่งราคา */
  sellBack: 0.5,
};
