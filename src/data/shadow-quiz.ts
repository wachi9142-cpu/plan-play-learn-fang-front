/**
 * 🌑 เกมจับคู่ภาพกับเงา — ข้อมูลภาพแยกตามหมวด
 *
 * ภายในหมวดเดียวกันเงาจะคล้ายกันพอให้ต้องสังเกตจริง ไม่ใช่เดาจากสี
 * เพิ่มภาพใหม่ = เพิ่ม 1 บรรทัดในหมวดที่ใช่
 */

export interface ShadowItem {
  emoji: string;
  /** ชื่อภาษาไทย — ใช้อ่านออกเสียงและเฉลย */
  name: string;
  nameEn: string;
}

export interface ShadowCategory {
  id: string;
  emoji: string;
  label: string;
  labelEn: string;
  hint: string;
  tint: string;
  items: ShadowItem[];
}

export const SHADOW_CATEGORIES: ShadowCategory[] = [
  {
    id: "animals",
    emoji: "🐘",
    label: "สัตว์",
    labelEn: "Animals",
    hint: "สังเกตรูปร่าง ลำตัว หู ขา และลักษณะเฉพาะของสัตว์",
    tint: "bg-mint-soft",
    items: [
      { emoji: "🐱", name: "แมว", nameEn: "Cat" },
      { emoji: "🐶", name: "สุนัข", nameEn: "Dog" },
      { emoji: "🐘", name: "ช้าง", nameEn: "Elephant" },
      { emoji: "🦒", name: "ยีราฟ", nameEn: "Giraffe" },
      { emoji: "🐰", name: "กระต่าย", nameEn: "Rabbit" },
      { emoji: "🐟", name: "ปลา", nameEn: "Fish" },
      { emoji: "🐦", name: "นก", nameEn: "Bird" },
      { emoji: "🐯", name: "เสือ", nameEn: "Tiger" },
      { emoji: "🐢", name: "เต่า", nameEn: "Turtle" },
      { emoji: "🐔", name: "ไก่", nameEn: "Chicken" },
      { emoji: "🦋", name: "ผีเสื้อ", nameEn: "Butterfly" },
      { emoji: "🐸", name: "กบ", nameEn: "Frog" },
    ],
  },
  {
    id: "things",
    emoji: "🪥",
    label: "สิ่งของ",
    labelEn: "Everyday Objects",
    hint: "จำแนกรูปร่างของใช้ในชีวิตประจำวัน",
    tint: "bg-purple-100",
    items: [
      { emoji: "🥛", name: "แก้วน้ำ", nameEn: "Glass" },
      { emoji: "🥄", name: "ช้อน", nameEn: "Spoon" },
      { emoji: "☂️", name: "ร่ม", nameEn: "Umbrella" },
      { emoji: "✂️", name: "กรรไกร", nameEn: "Scissors" },
      { emoji: "🎒", name: "กระเป๋า", nameEn: "Backpack" },
      { emoji: "👟", name: "รองเท้า", nameEn: "Shoes" },
      { emoji: "🪑", name: "เก้าอี้", nameEn: "Chair" },
      { emoji: "🕐", name: "นาฬิกา", nameEn: "Clock" },
      { emoji: "🪥", name: "แปรงสีฟัน", nameEn: "Toothbrush" },
      { emoji: "🧦", name: "ถุงเท้า", nameEn: "Socks" },
      { emoji: "🔑", name: "กุญแจ", nameEn: "Key" },
      { emoji: "📚", name: "หนังสือ", nameEn: "Books" },
    ],
  },
  {
    id: "jobs",
    emoji: "👩‍⚕️",
    label: "อาชีพ",
    labelEn: "Jobs",
    hint: "สังเกตเครื่องแต่งกายและอุปกรณ์ของแต่ละอาชีพ",
    tint: "bg-sky-soft",
    items: [
      { emoji: "👩‍🏫", name: "ครู", nameEn: "Teacher" },
      { emoji: "👨‍⚕️", name: "แพทย์", nameEn: "Doctor" },
      { emoji: "👩‍⚕️", name: "พยาบาล", nameEn: "Nurse" },
      { emoji: "👮", name: "ตำรวจ", nameEn: "Police Officer" },
      { emoji: "🧑‍🚒", name: "นักดับเพลิง", nameEn: "Firefighter" },
      { emoji: "👨‍🍳", name: "เชฟ", nameEn: "Chef" },
      { emoji: "🧑‍🌾", name: "ชาวนา", nameEn: "Farmer" },
      { emoji: "👷", name: "ช่างก่อสร้าง", nameEn: "Builder" },
      { emoji: "🧑‍✈️", name: "นักบิน", nameEn: "Pilot" },
      { emoji: "🧑‍🔧", name: "ช่างซ่อม", nameEn: "Mechanic" },
    ],
  },
  {
    id: "nature",
    emoji: "🌳",
    label: "ธรรมชาติ",
    labelEn: "Nature",
    hint: "สังเกตรูปร่างของสิ่งที่พบในธรรมชาติ",
    tint: "bg-yellow-soft",
    items: [
      { emoji: "🌳", name: "ต้นไม้", nameEn: "Tree" },
      { emoji: "🌻", name: "ดอกไม้", nameEn: "Flower" },
      { emoji: "🍃", name: "ใบไม้", nameEn: "Leaf" },
      { emoji: "⛰️", name: "ภูเขา", nameEn: "Mountain" },
      { emoji: "☀️", name: "ดวงอาทิตย์", nameEn: "Sun" },
      { emoji: "☁️", name: "ก้อนเมฆ", nameEn: "Cloud" },
      { emoji: "🍄", name: "เห็ด", nameEn: "Mushroom" },
      { emoji: "🌵", name: "กระบองเพชร", nameEn: "Cactus" },
      { emoji: "🌙", name: "ดวงจันทร์", nameEn: "Moon" },
      { emoji: "⭐", name: "ดวงดาว", nameEn: "Star" },
      { emoji: "🌈", name: "รุ้งกินน้ำ", nameEn: "Rainbow" },
      { emoji: "🪨", name: "ก้อนหิน", nameEn: "Rock" },
    ],
  },
  {
    id: "around",
    emoji: "🏫",
    label: "สิ่งรอบตัวเด็ก",
    labelEn: "Around the Child",
    hint: "เชื่อมโยงภาพกับสถานที่และของใกล้ตัวเด็ก",
    tint: "bg-pink-soft",
    items: [
      { emoji: "🏠", name: "บ้าน", nameEn: "House" },
      { emoji: "🏫", name: "โรงเรียน", nameEn: "School" },
      { emoji: "🚌", name: "รถโรงเรียน", nameEn: "School Bus" },
      { emoji: "🛝", name: "สไลเดอร์", nameEn: "Slide" },
      { emoji: "🧺", name: "ตะกร้า", nameEn: "Basket" },
      { emoji: "🍱", name: "กล่องข้าว", nameEn: "Lunch Box" },
      { emoji: "🧃", name: "ขวดน้ำ", nameEn: "Drink Bottle" },
      { emoji: "⚽", name: "ลูกบอล", nameEn: "Ball" },
      { emoji: "🪁", name: "ว่าว", nameEn: "Kite" },
      { emoji: "🧸", name: "ตุ๊กตาหมี", nameEn: "Teddy Bear" },
    ],
  },
];

export const findShadowCategory = (id: string) => SHADOW_CATEGORIES.find((c) => c.id === id);
export const allShadowItems = () => SHADOW_CATEGORIES.flatMap((c) => c.items);
