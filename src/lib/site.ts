import { PROJECTS } from "@/data/projects";
import { SCHEDULES } from "@/data/schedules";
import { GRADES } from "@/data/plans";

export const SITE = {
  /** แบรนด์ (แถบบน/ฟุตเตอร์) — "สวนสีม่วงเล็ก ๆ" พื้นที่ที่เด็ก ๆ เติบโตผ่านการเล่น */
  brand: "Little Purple Garden",
  motto: "Play • Learn • Grow",
  /** ชื่อชุดเนื้อหา (หน้าแรก/หัวเรื่อง) */
  name: "แผนเล่นเรียน อนุบาล 1",
  nameEn: "Play & Learn Plan | Kindergarten 1",
  credit: "by Teacher Kaowfang",
  tagline: "เรียนรู้ผ่านการเล่น เติบโตผ่านประสบการณ์ 🌱",
  description: "รวมแผน กิจกรรม และสื่อการเรียนรู้สำหรับเด็กปฐมวัย",
  concept: "พื้นที่เล็ก ๆ ที่เปลี่ยนการเรียนรู้ให้เป็นเรื่องสนุก ผ่านการเล่นและประสบการณ์ของเด็ก ๆ",
  intro: "เว็บไซต์สำหรับรวบรวมแผนการสอน กิจกรรม เกมการศึกษา และใบงานสำหรับเด็กปฐมวัย",
  vision: "Little Purple Garden มุ่งสร้างสวนแห่งการเรียนรู้ที่เด็กทุกคนได้เล่น เรียนรู้ และเติบโตในแบบของตนเอง ผ่านกิจกรรมที่สนุก สร้างสรรค์ และเหมาะสมกับวัย พร้อมส่งเสริมพัฒนาการทั้งด้านร่างกาย อารมณ์ จิตใจ สังคม และสติปัญญาอย่างสมดุล",
  welcome: "สวัสดีค่ะ ครูข้าวฟ่างยินดีต้อนรับ",
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

/** เมนูหลัก (ลำดับตามแถบเมนูด้านข้าง) + คลังเนื้อหา */
export const NAV_ITEMS: NavItem[] = [
  {
    href: "/projects",
    emoji: "🌱",
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
  {
    href: "/core-activities",
    emoji: "🎈",
    label: "6 กิจกรรมหลัก",
    description: "เคลื่อนไหว · เสริมประสบการณ์ · สร้างสรรค์ · เสรี · กลางแจ้ง · เกมการศึกษา",
    tint: "bg-pink-soft",
  },
  {
    href: "/games",
    emoji: "🎮",
    label: "เกมการศึกษา",
    description: "คลังเกมออนไลน์ เล่นได้เลยบนเว็บ เพิ่มเกมใหม่ได้เรื่อย ๆ",
    tint: "bg-mint-soft",
  },
  {
    href: "/worksheets",
    emoji: "📝",
    label: "ใบงาน",
    description: "คลังใบงานแยกหมวด ค้นหา/กรองด้วยแท็ก พิมพ์ได้ทันที",
    tint: "bg-yellow-soft",
  },
  { href: "/activities", emoji: "🧸", label: "กิจกรรมการเรียนรู้", description: "ไอเดียกิจกรรมพร้อมจุดประสงค์และขั้นตอน", tint: "bg-pink-soft" },
  { href: "/media", emoji: "🎨", label: "สื่อการเรียนการสอน", description: "บัตรภาพ เพลง นิทาน และสื่อทำมือ", tint: "bg-yellow-soft" },
  { href: "/weekly", emoji: "🗓️", label: "แผนรายสัปดาห์", description: "ภาพรวมกิจกรรม จันทร์–ศุกร์ ของแต่ละสัปดาห์", tint: "bg-sky-soft" },
  { href: "/gallery/works", emoji: "🖼️", label: "ผลงานเด็ก", description: "ผลงานศิลปะและชิ้นงานจากกิจกรรมของเด็ก ๆ", tint: "bg-pink-soft" },
  { href: "/gallery/photos", emoji: "📷", label: "ภาพกิจกรรม", description: "ภาพบรรยากาศกิจกรรมและโครงการ", tint: "bg-sky-soft" },
  { href: "/notes", emoji: "🌷", label: "บันทึก / แนวทางสำหรับครู", description: "เคล็ดลับและแนวทางจากประสบการณ์ในห้องเรียน", tint: "bg-purple-50" },
];

/** จำนวนเมนูหลัก (แสดงเป็น Card ใหญ่บนหน้าแรก) */
export const MAIN_MENU_COUNT = 6;

/** ลำดับ "เมนู" ตามบรีฟ: กำหนดการสอน → แผนฯ → โครงการ → 6 กิจกรรมหลัก → เกม → ใบงาน → สื่อการเรียนการสอน */
const MENU_ORDER = ["/schedules", "/plans", "/projects", "/core-activities", "/games", "/worksheets", "/media"];
export const MENU_ITEMS: NavItem[] = MENU_ORDER.map((h) => NAV_ITEMS.find((n) => n.href === h)!);
export const LIBRARY_ITEMS: NavItem[] = NAV_ITEMS.slice(MAIN_MENU_COUNT).filter((n) => !MENU_ORDER.includes(n.href));

/** เมนู "เกี่ยวกับ": ข้อมูลโรงเรียน → ระดับชั้น → อาคาร/นักเรียน/บุคลากร */
export const ABOUT_ITEMS: NavLink[] = [
  { href: "/about#history", emoji: "🏫", label: "ข้อมูล / ประวัติโรงเรียน" },
  { href: "/about#philosophy", emoji: "🌷", label: "ปรัชญา" },
  { href: "/about#vision", emoji: "🌱", label: "วิสัยทัศน์" },
  { href: "/about#mission", emoji: "🎯", label: "พันธกิจ" },
  { href: "/about#goals", emoji: "⭐", label: "เป้าหมาย" },
  ...GRADES.map((g) => ({ href: `/about/${g.id}`, emoji: g.emoji, label: g.name })),
  { href: "/about#facilities", emoji: "🏡", label: "ข้อมูลอาคาร / สถานที่" },
  { href: "/about#students", emoji: "🧒", label: "ข้อมูลนักเรียน" },
  { href: "/about#staff", emoji: "👩‍🏫", label: "ข้อมูลบุคลากร" },
];

/** เมนูบนแถบ (ไม่มีเมนูย่อย) — ปฏิทินโรงเรียน · กิจกรรมโรงเรียน · ติดต่อเรา */
export const TOP_LINKS: NavItem[] = [
  { href: "/calendar", emoji: "📅", label: "ปฏิทินโรงเรียน", description: "เปิด–ปิดเทอม วันหยุด วันสำคัญ และกิจกรรมประจำเดือน", tint: "bg-sky-soft" },
  { href: "/school-events", emoji: "🎉", label: "กิจกรรมโรงเรียน", description: "กิจกรรมที่เกิดขึ้นในโรงเรียน พร้อมรูปและรายละเอียด", tint: "bg-yellow-soft" },
  { href: "/news", emoji: "📣", label: "ประชาสัมพันธ์", description: "ประกาศ ข่าวสาร และเรื่องแจ้งถึงผู้ปกครอง", tint: "bg-pink-soft" },
  { href: "/contact", emoji: "📞", label: "ติดต่อเรา", description: "ที่อยู่ แผนที่ เวลาเปิด–ปิด และช่องทางติดต่อ", tint: "bg-mint-soft" },
];

/**
 * แถบ Navigation ด้านบน (ตามบรีฟ): หน้าแรก · เกี่ยวกับ ▾ · เมนู ▾ · ปฏิทินโรงเรียน · กิจกรรมโรงเรียน · ติดต่อเรา · เข้าสู่ระบบ
 */
export const PRIMARY_NAV: NavItem[] = [
  {
    href: "/about",
    emoji: "📖",
    label: "เกี่ยวกับ",
    description: "เกี่ยวกับเว็บไซต์และการจัดการเรียนรู้ระดับปฐมวัย แยกตามระดับชั้น",
    tint: "bg-mint-soft",
    children: ABOUT_ITEMS,
  },
  {
    href: "/menu",
    emoji: "📚",
    label: "เมนู",
    description: "หมวดหมู่หลักของเว็บไซต์",
    tint: "bg-purple-100",
    children: MENU_ITEMS.map(({ href, emoji, label }) => ({ href, emoji, label })),
  },
];
