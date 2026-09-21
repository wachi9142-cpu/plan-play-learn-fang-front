import { PROJECTS } from "@/data/projects";
import { SCHEDULES } from "@/data/schedules";

export const SITE = {
  name: "แผนเล่นเรียน อนุบาล 1",
  nameEn: "Play & Learn Plan | Kindergarten 1",
  credit: "by Teacher Kaowfang",
  tagline: "เรียนรู้ผ่านการเล่น เติบโตผ่านประสบการณ์ 🌱",
  description: "รวมแผน กิจกรรม และสื่อการเรียนรู้สำหรับเด็กปฐมวัย",
  concept: "พื้นที่เล็ก ๆ ที่เปลี่ยนการเรียนรู้ให้เป็นเรื่องสนุก ผ่านการเล่นและประสบการณ์ของเด็ก ๆ",
  welcome: "สวัสดีค่ะ ครูฟ่างฟ่างยินดีต้อนรับ",
};

export interface NavLink {
  href: string;
  emoji?: string;
  label: string;
}

export interface NavItem extends NavLink {
  emoji: string;
  description: string;
  tint: string;          // tailwind bg class for the icon bubble
  children?: NavLink[];  // เมนูย่อย (dropdown บน desktop / accordion บนมือถือ)
}

/** เมนูหลัก 3 อย่างตามบรีฟ + คลังเนื้อหา */
export const NAV_ITEMS: NavItem[] = [
  {
    href: "/projects",
    emoji: "📚",
    label: "โครงการ",
    description: "โครงการเรียนรู้แบบ Project Approach ของเด็ก ๆ",
    tint: "bg-yellow-soft",
    children: PROJECTS.map((p) => ({ href: `/projects/${p.id}`, emoji: p.emoji, label: p.title })),
  },
  {
    href: "/schedules",
    emoji: "📅",
    label: "กำหนดการสอน",
    description: "ตารางกำหนดการ กดหัวข้อเรื่องเพื่อไปยังแผนได้ทันที",
    tint: "bg-sky-soft",
    children: SCHEDULES.map((s) => ({ href: `/schedules/${s.id}`, emoji: "📅", label: s.title })),
  },
  {
    href: "/plans",
    emoji: "📖",
    label: "แผนการจัดประสบการณ์",
    description: "รวมแผนอนุบาล 1 ค้นหาตามเรื่อง หน่วย หรือคำสำคัญ",
    tint: "bg-purple-100",
  },
  { href: "/activities", emoji: "🧸", label: "กิจกรรมการเรียนรู้", description: "ไอเดียกิจกรรมพร้อมจุดประสงค์และขั้นตอน", tint: "bg-pink-soft" },
  { href: "/media", emoji: "🎨", label: "สื่อการสอน", description: "บัตรภาพ เพลง นิทาน และสื่อทำมือ", tint: "bg-yellow-soft" },
  { href: "/worksheets", emoji: "📝", label: "ใบงาน", description: "ใบงานฝึกทักษะแยกตามหน่วยการเรียนรู้", tint: "bg-mint-soft" },
  { href: "/weekly", emoji: "🗓️", label: "แผนรายสัปดาห์", description: "ภาพรวมกิจกรรม จันทร์–ศุกร์ ของแต่ละสัปดาห์", tint: "bg-sky-soft" },
  { href: "/notes", emoji: "🌷", label: "บันทึก / แนวทางสำหรับครู", description: "เคล็ดลับและแนวทางจากประสบการณ์ในห้องเรียน", tint: "bg-purple-50" },
];

/** เมนูบน header (desktop): 3 เมนูหลัก + "คลังความรู้" ที่รวมส่วนที่เหลือ */
export const PRIMARY_NAV: NavItem[] = [
  NAV_ITEMS[0],
  NAV_ITEMS[1],
  NAV_ITEMS[2],
  {
    href: "/activities",
    emoji: "🧺",
    label: "คลังความรู้",
    description: "กิจกรรม สื่อ ใบงาน และบันทึกครู",
    tint: "bg-pink-soft",
    children: NAV_ITEMS.slice(3).map(({ href, emoji, label }) => ({ href, emoji, label })),
  },
];
