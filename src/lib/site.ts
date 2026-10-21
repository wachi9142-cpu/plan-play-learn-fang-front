import { PROJECTS } from "@/data/projects";
import { SCHEDULES } from "@/data/schedules";
import { GRADES } from "@/data/plans";
import { FLASH_CATEGORIES } from "@/data/flashcards";
import { JIGSAW_CATEGORIES } from "@/data/jigsaw";

export const SITE = {
  /** แบรนด์ (แถบบน/ฟุตเตอร์) — "สวนสีม่วงเล็ก ๆ" พื้นที่ที่เด็ก ๆ เติบโตผ่านการเล่น */
  brand: "Little Purple Garden",
  brandSub: "Nursery & Kindergarten",
  motto: "Play • Learn • Grow",
  /** ชื่อชุดเนื้อหา (หน้าแรก/หัวเรื่อง) */
  name: "แผนเล่นเรียน อนุบาล 1",
  nameEn: "Play & Learn Plan | Kindergarten 1",
  credit: "by Teacher Kaowfang",
  tagline: "เด็กเรียนรู้ผ่านการเล่น เติบโตผ่านประสบการณ์ และเบ่งบานในแบบของตนเอง",
  welcomeIntro: "Little Purple Garden พื้นที่แห่งการดูแลและการเรียนรู้สำหรับเด็กเล็กและเด็กปฐมวัย ที่เปิดโอกาสให้เด็กได้เล่น ทดลอง ลงมือทำ และเรียนรู้ผ่านประสบการณ์ที่เหมาะสมกับวัย พร้อมส่งเสริมพัฒนาการอย่างรอบด้าน",
  description: "รวมแผน กิจกรรม และสื่อการเรียนรู้สำหรับเด็กปฐมวัย",
  concept: "พื้นที่เล็ก ๆ ที่เปลี่ยนการเรียนรู้ให้เป็นเรื่องสนุก ผ่านการเล่นและประสบการณ์ของเด็ก ๆ",
  intro: "สถานศึกษาและพื้นที่แห่งการดูแลและเรียนรู้สำหรับเด็กเล็กและเด็กปฐมวัย — รวมแผนการสอน กิจกรรม เกมการศึกษา และใบงาน",
  vision: "Little Purple Garden มุ่งสร้างสวนแห่งการเรียนรู้ที่เด็กทุกคนได้เล่น เรียนรู้ และเติบโตในแบบของตนเอง ผ่านกิจกรรมที่สนุก สร้างสรรค์ และเหมาะสมกับวัย พร้อมส่งเสริมพัฒนาการทั้งด้านร่างกาย อารมณ์ จิตใจ สังคม และสติปัญญาอย่างสมดุล",
  welcome: "สวัสดีค่ะ ครูข้าวฟ่างยินดีต้อนรับ",
};

export interface NavLink {
  href: string;
  emoji?: string;
  label: string;
  image?: string;        // ภาพเล็กแทนอีโมจิในเมนู
}

export interface NavItem extends NavLink {
  emoji: string;
  description: string;
  tint: string;          // tailwind bg class for the icon bubble
  image?: string;        // ภาพประกอบแทนอีโมจิ (พื้นหลังโปร่งใส)
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
    image: "/menu/projects.webp",
    children: PROJECTS.map((p) => ({ href: `/projects/${p.id}`, emoji: p.emoji, label: p.title })),
  },
  {
    href: "/schedules",
    emoji: "📅",
    label: "กำหนดการสอน",
    description: "ตารางกำหนดการ กดหัวข้อเรื่องเพื่อไปยังแผนได้ทันที",
    tint: "bg-sky-soft",
    image: "/menu/schedules.webp",
    children: SCHEDULES.map((s) => ({ href: `/schedules/${s.id}`, emoji: "📅", label: s.title })),
  },
  {
    href: "/plans",
    emoji: "📖",
    label: "แผนการจัดประสบการณ์",
    description: "รวมแผนอนุบาล 1 ค้นหาตามเรื่อง หน่วย หรือคำสำคัญ",
    tint: "bg-purple-100",
    image: "/menu/plans.webp",
  },
  {
    href: "/core-activities",
    emoji: "🎈",
    label: "6 กิจกรรมหลัก",
    description: "เคลื่อนไหว · เสริมประสบการณ์ · สร้างสรรค์ · เสรี · กลางแจ้ง · เกมการศึกษา",
    tint: "bg-pink-soft",
  },
  {
    href: "/play",
    emoji: "🎮",
    label: "เกม — เล่นสนุก",
    description: "เกมและกิจกรรมออนไลน์ เล่นสนุก สำรวจ และสร้างสรรค์",
    tint: "bg-pink-soft",
  },
  {
    href: "/games",
    emoji: "🧩",
    label: "เกมการศึกษา — ฝึกทักษะ",
    description: "เกมฝึกทักษะ เรียนรู้ผ่านการเล่น และพัฒนาการคิด",
    tint: "bg-mint-soft",
    image: "/games/edu.webp",
  },
  {
    href: "/flashcards",
    emoji: "🃏",
    label: "แฟลชการ์ด ไทย–อังกฤษ",
    description: "บัตรภาพคำศัพท์สองภาษา พลิกบัตร ฟังเสียง และเล่นเกมจับคู่",
    tint: "bg-purple-100",
    children: FLASH_CATEGORIES.map((c) => ({ href: `/flashcards/${c.id}`, emoji: c.emoji, label: c.label })),
  },
  {
    href: "/jigsaw",
    emoji: "🧩",
    label: "เกมจิ๊กซอว์",
    description: "ต่อภาพ ลากชิ้นที่หายไปกลับเข้าที่ — หลายหมวด 3 ระดับ",
    tint: "bg-sky-soft",
    children: JIGSAW_CATEGORIES.map((c) => ({ href: `/jigsaw/${c.id}`, emoji: c.emoji, label: c.label })),
  },
  {
    href: "/worksheets",
    emoji: "📝",
    label: "ใบงาน",
    description: "คลังใบงานแยกหมวด ค้นหา/กรองด้วยแท็ก พิมพ์ได้ทันที",
    tint: "bg-yellow-soft",
    image: "/worksheets/cover.webp",
  },
  { href: "/studio", emoji: "🌱", label: "Garden Studio · ห้องสร้างสื่อ", description: "สร้าง แก้ไข และจัดเก็บแผน/กำหนดการสอน/เอกสาร บันทึกอัตโนมัติ", tint: "bg-mint-soft", image: "/menu/studio.webp" },
  { href: "/library/media", emoji: "🗂️", label: "คลังสื่อรวม", description: "รูป วิดีโอ เสียง PDF Word PPT และผลงาน รวมจากทุกระบบในที่เดียว", tint: "bg-mint-soft" },
  { href: "/portfolio", emoji: "🏆", label: "แฟ้มผลงานเด็ก", description: "ผลงานเด็กพร้อมหมวดหมู่ ความคิดเห็นครู และการเลือกเผยแพร่", tint: "bg-pink-soft", image: "/menu/portfolio.webp" },
  { href: "/development", emoji: "📈", label: "ติดตามพัฒนาการ", description: "บันทึกพัฒนาการ 4 ด้าน เชื่อมกับสภาพที่พึงประสงค์ในหลักสูตร", tint: "bg-sky-soft", image: "/menu/development.webp" },
  { href: "/curriculum", emoji: "📚", label: "หลักสูตร", description: "หลักสูตรทุกฉบับ/ทุกปี พร้อมไฟล์ PDF อ่านในเว็บ และโครงสร้างมาตรฐาน–ตัวบ่งชี้–สภาพที่พึงประสงค์", tint: "bg-purple-50", image: "/menu/curriculum.webp" },
  { href: "/online-classroom", emoji: "💻", label: "ห้องเรียนออนไลน์", description: "เรียนสด แชตประจำห้อง ดาวให้กำลังใจ บันทึกการสอนและดูย้อนหลัง — ครู เด็ก ผู้ปกครอง", tint: "bg-sky-soft", image: "/menu/online-classroom.webp" },
  { href: "/canvas", emoji: "🎨", label: "Garden Canvas · กระดาษสร้างสรรค์", description: "วาด เล่น ทดลอง และสร้างสรรค์ร่วมกัน — ครู เด็ก ผู้ปกครอง วาดบนกระดาษเดียวกันแบบ real-time", tint: "bg-pink-soft", image: "/menu/canvas.webp" },
  { href: "/activities", emoji: "🧸", label: "กิจกรรมการเรียนรู้", description: "ไอเดียกิจกรรมพร้อมจุดประสงค์และขั้นตอน", tint: "bg-pink-soft" },
  { href: "/media", emoji: "🎨", label: "สื่อการเรียนการสอน", description: "บัตรภาพ เพลง นิทาน และสื่อทำมือ", tint: "bg-yellow-soft", image: "/menu/media.webp" },
  { href: "/weekly", emoji: "🗓️", label: "แผนรายสัปดาห์", description: "ภาพรวมกิจกรรม จันทร์–ศุกร์ ของแต่ละสัปดาห์", tint: "bg-sky-soft" },
  { href: "/classroom", emoji: "📚", label: "ห้องเรียนของเรา", description: "สิ่งที่กำลังเรียนสัปดาห์นี้ และสื่อที่เกี่ยวข้อง", tint: "bg-purple-100" },
  { href: "/gallery/works", emoji: "🏆", label: "ผลงานเด็ก", description: "ผลงานศิลปะและชิ้นงานจากกิจกรรมของเด็ก ๆ", tint: "bg-pink-soft" },
  { href: "/gallery/photos", emoji: "📷", label: "ภาพกิจกรรม", description: "ภาพบรรยากาศกิจกรรมและโครงการ", tint: "bg-sky-soft" },
  { href: "/notes", emoji: "🌷", label: "บันทึก / แนวทางสำหรับครู", description: "เคล็ดลับและแนวทางจากประสบการณ์ในห้องเรียน", tint: "bg-purple-50" },
];

/** จำนวนเมนูหลัก (แสดงเป็น Card ใหญ่บนหน้าแรก) */
export const MAIN_MENU_COUNT = 7;

/** ลำดับ "เมนู" ตามบรีฟ: กำหนดการสอน → แผนฯ → โครงการ → 6 กิจกรรมหลัก → เกม → ใบงาน → แฟลชการ์ด → สื่อการเรียนการสอน */
const MENU_ORDER = ["/schedules", "/plans", "/projects", "/core-activities", "/games", "/worksheets", "/flashcards", "/jigsaw", "/media", "/curriculum", "/online-classroom", "/portfolio", "/development", "/studio", "/canvas"];
export const MENU_ITEMS: NavItem[] = MENU_ORDER.map((h) => NAV_ITEMS.find((n) => n.href === h)!);
export const LIBRARY_ITEMS: NavItem[] = NAV_ITEMS.slice(MAIN_MENU_COUNT).filter((n) => !MENU_ORDER.includes(n.href));

/** เมนู "ห้องสมุด": ชั้นหนังสือ (ผู้ใหญ่) · มุมหนังสือ (เด็ก) · คลังสื่อรวม */
export const LIBRARY_NAV: NavLink[] = [
  { href: "/library/shelf", emoji: "📚", label: "ชั้นหนังสือ — สำหรับครูและผู้ใหญ่" },
  { href: "/library/kids", emoji: "🧸", label: "มุมหนังสือ — สำหรับเด็ก" },
  { href: "/library/media", emoji: "🗂️", label: "คลังสื่อรวม (ไฟล์จากทุกระบบ)" },
];

/** เมนู "เกี่ยวกับ": ข้อมูลโรงเรียน → ระดับชั้น → อาคาร/นักเรียน/บุคลากร */
export const ABOUT_ITEMS: NavLink[] = [
  { href: "/about#history", emoji: "🏫", label: "ข้อมูล / ประวัติโรงเรียน" },
  { href: "/about#concept", emoji: "🌱", label: "แนวคิดของโรงเรียน" },
  { href: "/about#learning", emoji: "📚", label: "การจัดการเรียนรู้" },
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
  { href: "/calendar", emoji: "📅", label: "ปฏิทิน", description: "เปิด–ปิดเทอม วันหยุด วันสำคัญ และกิจกรรมประจำเดือน", tint: "bg-sky-soft" },
  { href: "/school-events", emoji: "🎈", label: "กิจกรรม", description: "กิจกรรมโรงเรียน วันที่ เวลา และสิ่งที่ต้องเตรียมให้ลูก", tint: "bg-yellow-soft" },
  { href: "/news", emoji: "📢", label: "ประชาสัมพันธ์", description: "ประกาศ ข่าวสาร และเรื่องแจ้งถึงผู้ปกครอง", tint: "bg-pink-soft" },
  { href: "/admission", emoji: "🎒", label: "สมัครเรียน", description: "รับอายุ 1.5–6 ปี · ขั้นตอนสมัคร เอกสาร และคำถามที่พบบ่อย", tint: "bg-purple-100" },
  { href: "/contact", emoji: "📞", label: "ติดต่อเรา", description: "ที่อยู่ แผนที่ เวลาเปิด–ปิด และช่องทางติดต่อ", tint: "bg-mint-soft", image: "/nav/phone.webp" },
];

/** 3 เมนูที่ผู้ปกครองใช้บ่อยที่สุด — แสดงเด่นเป็นพิเศษบนมือถือ */
export const PARENT_LINKS: NavItem[] = TOP_LINKS.slice(0, 3);

/** ภาพไอคอนของรายการในเมนูย่อย (เพิ่มรายการใหม่ได้ที่นี่) */
const NAV_MENU_ICONS: Record<string, string | undefined> = {
  "/schedules": "/nav/calendar.webp",
  "/plans": "/nav/book.webp",
  "/media": "/art/palette.webp",
};

/**
 * 🧭 แบ่งเว็บเป็น 4 โซนตาม "ใครใช้" ไม่ใช่ "เป็นสื่อประเภทไหน"
 *
 *   🏫 โรงเรียน      — ผู้ปกครองและคนทั่วไป
 *   🧸 สำหรับเด็ก    — เด็กเล่นเอง หรือครูเปิดให้ดูหน้าห้อง
 *   👩‍🏫 ห้องครู      — เครื่องมือทำงานของครู (ซ่อนจากเมนูจนกว่าจะเข้าสู่ระบบเป็นครู)
 *   👨‍👩‍👧 ของลูกฉัน   — ข้อมูลรายคนของเด็ก สำหรับผู้ปกครอง
 *
 * เพิ่มหน้าใหม่ = เพิ่ม 1 บรรทัดในโซนที่ใช่ แล้วเมนูบน/มือถือ/หน้าโซนจะขึ้นเองทั้งหมด
 */

const link = (href: string): NavLink => {
  const n = NAV_ITEMS.find((x) => x.href === href);
  return { href, emoji: n?.emoji ?? "•", label: n?.label ?? href, image: n?.image ?? NAV_MENU_ICONS[href] };
};

/** 🏫 โรงเรียน — เปิดดูได้ทุกคน */
export const SCHOOL_ZONE: NavLink[] = [
  ...ABOUT_ITEMS,
  { href: "/lunch", emoji: "🍚", label: "เมนูอาหารประจำสัปดาห์" },
  { href: "/calendar", emoji: "📅", label: "ปฏิทินโรงเรียน" },
  { href: "/school-events", emoji: "🎈", label: "กิจกรรมโรงเรียน" },
  { href: "/news", emoji: "📢", label: "ประชาสัมพันธ์" },
  { href: "/admission", emoji: "🎒", label: "สมัครเรียน" },
  { href: "/gallery/photos", emoji: "📷", label: "ภาพกิจกรรม" },
  { href: "/gallery/works", emoji: "🏆", label: "ผลงานเด็ก" },
  { href: "/contact", emoji: "📞", label: "ติดต่อเรา", image: "/nav/phone.webp" },
];

/** 🧸 สำหรับเด็ก — เด็กเปิดเล่นเองได้ ไม่มีอะไรที่เด็กไม่ควรเห็น */
export const KIDS_ZONE: NavLink[] = [
  link("/play"),
  link("/games"),
  link("/worksheets"),
  link("/flashcards"),
  link("/jigsaw"),
  { href: "/library/kids", emoji: "🧸", label: "มุมหนังสือ — นิทานสำหรับเด็ก" },
  link("/canvas"),
  link("/core-activities"),
  link("/projects"),
];

/** 👩‍🏫 ห้องทำงานครู — ซ่อนจากเมนูถ้ายังไม่ได้เข้าสู่ระบบเป็นครู */
export const TEACHER_ZONE: NavLink[] = [
  link("/schedules"),
  link("/plans"),
  link("/weekly"),
  link("/curriculum"),
  link("/media"),
  link("/activities"),
  link("/studio"),
  { href: "/library/shelf", emoji: "📚", label: "ชั้นหนังสือ — สำหรับครูและผู้ใหญ่" },
  { href: "/library/media", emoji: "🗂️", label: "คลังสื่อรวม (ไฟล์จากทุกระบบ)" },
  link("/classroom"),
  link("/notes"),
  { href: "/teacher/daily", emoji: "📔", label: "สมุดสื่อสารประจำวัน" },
  { href: "/teacher/lunch", emoji: "🍚", label: "เมนูอาหารและของแพ้" },
  { href: "/teacher/leave", emoji: "🏠", label: "แจ้งลาและคนมารับเด็ก" },
  { href: "/teacher/todo", emoji: "📋", label: "สิ่งที่รอครูเติม" },
  { href: "/admin/spot-diff", emoji: "👀", label: "สร้างฉากจับผิดภาพ" },
  { href: "/admin", emoji: "👑", label: "ผู้ดูแลระบบ" },
];

/** 👨‍👩‍👧 ของลูกฉัน — ข้อมูลรายคน ผู้ปกครองดูของลูกตัวเอง */
export const CHILD_ZONE: NavLink[] = [
  { href: "/my-child/daily", emoji: "📔", label: "สมุดสื่อสารประจำวัน" },
  { href: "/my-child/leave", emoji: "🏠", label: "แจ้งลาและคนมารับเด็ก" },
  { href: "/lunch", emoji: "🍚", label: "เมนูอาหารประจำสัปดาห์" },
  link("/portfolio"),
  link("/development"),
  link("/online-classroom"),
];

export interface Zone extends NavItem {
  /** true = ซ่อนจากเมนูจนกว่าจะเข้าสู่ระบบเป็นครู (ยังเปิดจากลิงก์ตรงได้) */
  teacherOnly?: boolean;
}

/** 4 โซนหลักของเว็บ */
export const ZONES: Zone[] = [
  {
    href: "/about", emoji: "🏫", image: "/nav/book.webp", label: "โรงเรียน",
    description: "เกี่ยวกับโรงเรียน ระดับชั้น ปฏิทิน กิจกรรม ประชาสัมพันธ์ สมัครเรียน และติดต่อเรา",
    tint: "bg-mint-soft", children: SCHOOL_ZONE,
  },
  {
    href: "/kids", emoji: "🧸", label: "สำหรับเด็ก",
    description: "เกม ใบงาน แฟลชการ์ด นิทาน และกระดาษวาดรูป — เด็กเปิดเล่นเองได้",
    tint: "bg-pink-soft", children: KIDS_ZONE,
  },
  {
    href: "/teacher", emoji: "👩‍🏫", label: "ห้องครู",
    description: "แผนการสอน กำหนดการ หลักสูตร Garden Studio และคลังสื่อ — เครื่องมือทำงานของครู",
    tint: "bg-purple-100", children: TEACHER_ZONE, teacherOnly: true,
  },
  {
    href: "/my-child", emoji: "👨‍👩‍👧", label: "ของลูกฉัน",
    description: "ผลงาน พัฒนาการ และห้องเรียนออนไลน์ของลูก",
    tint: "bg-sky-soft", children: CHILD_ZONE,
  },
];

/**
 * แถบ Navigation ด้านบน — หน้าแรก · 4 โซน · สมัครเรียน · ติดต่อเรา · เข้าสู่ระบบ
 * (โซน "ห้องครู" จะขึ้นเมื่อเข้าสู่ระบบเป็นครูแล้วเท่านั้น)
 */
export const PRIMARY_NAV: Zone[] = ZONES;
