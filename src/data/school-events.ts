/** กิจกรรมโรงเรียน — รูป + รายละเอียด + วันที่ (เชื่อมกับโครงการ/แกลเลอรีได้) */
export type SchoolEventCategory = "art" | "nature" | "project" | "festival" | "parents" | "outdoor";

export interface SchoolEvent {
  id: string;
  emoji: string;
  title: string;
  category: SchoolEventCategory;
  date: string;          // "2026-11-24"
  dateLabel: string;     // "24 พ.ย. 2569"
  description: string;
  highlights?: string[];
  image?: string;        // /events/xxx.jpg
  projectId?: string;
  planId?: string;

  /* ---------- ข้อมูลสำหรับผู้ปกครอง ---------- */
  time?: string;         // "09:00–11:30 น."
  place?: string;        // "สนามหน้าโรงเรียน"
  grades?: string[];     // ระดับชั้น/ห้องที่เข้าร่วม เช่น ["อนุบาล 1", "อนุบาล 2"]
  /** 🎒 สิ่งที่เด็กต้องเตรียมมา — ถ้าไม่มี ระบบจะขึ้นว่า "ไม่ต้องเตรียมอุปกรณ์เพิ่มเติม" */
  prepare?: string[];
  /** กำหนดวันที่ต้องเตรียมให้เสร็จ (YYYY-MM-DD) */
  prepareBy?: string;
  prepareByLabel?: string;
  /** หมายเหตุถึงผู้ปกครอง */
  parentNote?: string;
  /** ภาพไอคอนแทนอีโมจิ (พื้นหลังโปร่งใส) */
  icon?: string;
}

/** สถานะกิจกรรมสำหรับแสดงให้ผู้ปกครอง */
export type EventStatus = "today" | "prepare" | "upcoming" | "done";

export const EVENT_STATUS: Record<EventStatus, { emoji: string; label: string; tint: string; text: string }> = {
  today: { emoji: "🔴", label: "วันนี้", tint: "bg-pink-soft", text: "text-[#a8456c]" },
  prepare: { emoji: "🟡", label: "เตรียมอุปกรณ์", tint: "bg-yellow-soft", text: "text-[#8a6a00]" },
  upcoming: { emoji: "🟢", label: "กำลังจะมาถึง", tint: "bg-mint-soft", text: "text-[#1f6b4d]" },
  done: { emoji: "⚪", label: "สิ้นสุดกิจกรรม", tint: "bg-cream-dark", text: "text-ink-soft" },
};

/** จำนวนวันจากวันนี้ถึงวันกิจกรรม (ติดลบ = ผ่านไปแล้ว) */
export function daysUntil(date: string, today = new Date()): number {
  const d = new Date(date + "T00:00:00");
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}

/**
 * 🔴 วันนี้ · 🟡 ถึงกำหนดเตรียมของแล้ว · 🟢 กำลังจะมาถึง · ⚪ ผ่านไปแล้ว
 * กิจกรรมที่ต้องเตรียมของจะขึ้น 🟡 ตั้งแต่ถึงวันกำหนดเตรียม (หรือ 7 วันก่อนงานถ้าไม่ได้ระบุ)
 */
export function eventStatus(e: SchoolEvent, today = new Date()): EventStatus {
  const left = daysUntil(e.date, today);
  if (left < 0) return "done";
  if (left === 0) return "today";
  const needs = (e.prepare?.length ?? 0) > 0;
  if (needs) {
    const window = e.prepareBy ? daysUntil(e.prepareBy, today) : left - 7;
    if (window <= 0) return "prepare";
  }
  return "upcoming";
}

/** กิจกรรมที่ยังมาไม่ถึง เรียงจากใกล้ที่สุด */
export function upcomingEvents(limit = 3, today = new Date()) {
  return SCHOOL_EVENTS.filter((e) => daysUntil(e.date, today) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

/** 🎒 กิจกรรมใน N วันข้างหน้าที่ผู้ปกครองต้องเตรียมของ */
export function prepareSoon(days = 10, today = new Date()) {
  return SCHOOL_EVENTS.filter((e) => {
    const left = daysUntil(e.date, today);
    return left >= 0 && left <= days && (e.prepare?.length ?? 0) > 0;
  }).sort((a, b) => a.date.localeCompare(b.date));
}

export const EVENT_CATEGORIES: Record<SchoolEventCategory, { emoji: string; label: string; tint: string }> = {
  art: { emoji: "🎨", label: "กิจกรรมศิลปะ", tint: "bg-pink-soft" },
  nature: { emoji: "🌱", label: "กิจกรรมปลูกต้นไม้", tint: "bg-mint-soft" },
  project: { emoji: "🥭", label: "โครงการ", tint: "bg-yellow-soft" },
  festival: { emoji: "🎃", label: "กิจกรรมเทศกาล", tint: "bg-[#ffe3c8]" },
  parents: { emoji: "👨‍👩‍👧", label: "กิจกรรมร่วมกับผู้ปกครอง", tint: "bg-sky-soft" },
  outdoor: { emoji: "🏃", label: "กิจกรรมกลางแจ้ง", tint: "bg-purple-100" },
};

export const SCHOOL_EVENTS: SchoolEvent[] = [
  {
    id: "nature-art", emoji: "🎨", icon: "/art/palette.webp", title: "ศิลปะจากธรรมชาติ", category: "art",
    date: "2026-09-25", dateLabel: "25 ก.ย. 2569",
    time: "09:00–11:00 น.", place: "มุมศิลปะ อาคาร 1", grades: ["เนอร์เซอรี่", "เตรียมอนุบาล", "อนุบาล 1"],
    description: "เด็ก ๆ เก็บใบไม้ กิ่งไม้ และดอกไม้รอบโรงเรียน มาสร้างเป็นภาพติดปะของตัวเอง",
    highlights: ["เดินสำรวจสวน", "ภาพติดปะจากใบไม้", "จัดแสดงผลงานหน้าห้อง"],
    prepare: ["ใบไม้แห้ง 5–10 ใบ", "กล่องกระดาษเล็ก 1 กล่อง", "ชุดสำรอง 1 ชุด"],
    prepareBy: "2026-09-24", prepareByLabel: "24 ก.ย. 2569",
    parentNote: "ใบไม้เก็บจากบ้านหรือระหว่างทางมาโรงเรียนก็ได้ค่ะ ไม่ต้องซื้อ",
    planId: "nature",
  },
  {
    id: "mango-lab-open", emoji: "🥭", title: "Mango Lab — วันเปิดห้องทดลองมะม่วง", category: "project",
    date: "2026-09-28", dateLabel: "28 ก.ย. 2569",
    time: "10:00–11:30 น.", place: "ห้องกิจกรรม ชั้น 2", grades: ["อนุบาล 1", "อนุบาล 2", "อนุบาล 3"],
    description: "ชิม ดม สังเกต และเปรียบเทียบมะม่วงดิบ–สุก แล้วบันทึกผลลงสมุดนักสำรวจ",
    highlights: ["ชิมมะม่วง 3 แบบ", "วาดภาพบันทึก", "ทำมะม่วงปั่น"],
    prepare: ["มะม่วงสุก 1 ผล", "ผ้ากันเปื้อน"],
    prepareBy: "2026-09-27", prepareByLabel: "27 ก.ย. 2569",
    projectId: "mango-lab",
  },
  {
    id: "parents-meeting", emoji: "👨‍👩‍👧", title: "ประชุมผู้ปกครองภาคเรียนที่ 1", category: "parents",
    date: "2026-10-10", dateLabel: "10 ต.ค. 2569",
    time: "13:00–15:00 น.", place: "ห้องประชุมใหญ่",
    description: "สรุปพัฒนาการของเด็ก ๆ ภาคเรียนที่ 1 และแนะนำแผนการเรียนรู้ภาคเรียนที่ 2",
    parentNote: "ขอความร่วมมือผู้ปกครองมาอย่างน้อย 1 ท่านต่อครอบครัวค่ะ",
  },
  { id: "art-week", emoji: "🎨", title: "สัปดาห์ศิลปะ “สีสันในสวน”", category: "art", date: "2026-11-13", dateLabel: "13 พ.ย. 2569", description: "เด็ก ๆ ทดลองผสมสี พิมพ์ภาพจากผลไม้ และจัดแสดงผลงานที่มุมศิลปะของห้อง", highlights: ["ผสมสีน้ำ", "พิมพ์ภาพผลไม้", "นิทรรศการเล็ก ๆ"], planId: "food" },
  { id: "plant-day", emoji: "🌱", title: "วันปลูกต้นไม้ของหนู", category: "nature", date: "2026-11-20", dateLabel: "20 พ.ย. 2569", description: "ทุกคนเพาะถั่วงอกและปลูกต้นกล้าในกระถางของตัวเอง แล้วช่วยกันรดน้ำทุกเช้า", highlights: ["เพาะถั่วงอก", "ตกแต่งกระถาง"], planId: "nature", time: "09:30–11:00 น.", place: "สวนหลังอาคาร", prepare: ["กระถางเล็ก 1 ใบ", "ชุดสำรอง"], prepareBy: "2026-11-19", prepareByLabel: "19 พ.ย. 2569" },
  { id: "loy-krathong", emoji: "🪷", title: "ลอยกระทงน้อย", category: "festival", date: "2026-11-24", dateLabel: "24 พ.ย. 2569", description: "ประดิษฐ์กระทงจากใบตองและดอกไม้ แล้วลอยในอ่างน้ำที่สนามโรงเรียน", planId: "loy-krathong", time: "09:00–11:00 น.", place: "สนามหน้าโรงเรียน", prepare: ["ใบตอง 2 ใบ", "ดอกไม้สด"], prepareBy: "2026-11-23", prepareByLabel: "23 พ.ย. 2569" },
  { id: "father-day", emoji: "👨", title: "กิจกรรมวันพ่อ", category: "parents", date: "2026-12-04", dateLabel: "4 ธ.ค. 2569", description: "คุณพ่อมาร่วมกิจกรรมในห้อง เด็ก ๆ มอบการ์ดและร้องเพลงให้", planId: "father" },
  { id: "egg-hatch", emoji: "🥚", title: "โครงการนักสำรวจไข่ตัวจิ๋ว — วันฟักไข่", category: "project", date: "2026-12-16", dateLabel: "16 ธ.ค. 2569", description: "หลังเฝ้าดูตู้ฟักมา 3 สัปดาห์ ลูกเจี๊ยบตัวแรกก็ออกจากไข่", projectId: "egg-explorer" },
  { id: "mango-day", emoji: "🥭", title: "Mango Day — ปิดโครงการ Mango Lab", category: "project", date: "2027-01-29", dateLabel: "29 ม.ค. 2570", description: "ร้านมะม่วงจำลอง มะม่วงปั่น และการนำเสนอผลงานให้เพื่อนห้องอื่น", projectId: "mango-lab" },
  { id: "sports-day", emoji: "🏃", title: "กีฬาสีอนุบาล", category: "outdoor", date: "2027-02-26", dateLabel: "26 ก.พ. 2570", description: "วิ่งเก็บของ ขี่ม้าก้านกล้วย และเชียร์ลีดเดอร์ตัวจิ๋ว", highlights: ["วิ่งเก็บของ", "ขบวนพาเหรด"], time: "08:00–12:00 น.", place: "สนามกีฬาโรงเรียน", prepare: ["เสื้อสีประจำทีม", "หมวก", "ขวดน้ำ"], prepareBy: "2027-02-24", prepareByLabel: "24 ก.พ. 2570" },
];

export const getSchoolEvent = (id: string) => SCHOOL_EVENTS.find((e) => e.id === id);
