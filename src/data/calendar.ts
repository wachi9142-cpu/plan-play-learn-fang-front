/** ปฏิทินโรงเรียน — เพิ่มรายการใหม่ในอาร์เรย์ CALENDAR_EVENTS (วันที่แบบ ค.ศ. YYYY-MM-DD) */
export type CalendarType = "term" | "holiday" | "important" | "monthly" | "parents" | "special";

export interface CalendarEvent {
  id: string;
  date: string;        // "2026-11-02" (วันเริ่ม)
  endDate?: string;    // วันสิ้นสุด (ถ้าหลายวัน)
  title: string;
  type: CalendarType;
  description?: string;
  time?: string;       // "09:00–11:00"
}

export const CALENDAR_TYPES: Record<CalendarType, { emoji: string; label: string; color: string; bg: string; icon?: string }> = {
  term: { emoji: "🏫", label: "เปิด–ปิดภาคเรียน", color: "text-purple-800", bg: "bg-purple-100" },
  holiday: { emoji: "🌴", label: "วันหยุด", color: "text-[#2e6b4c]", bg: "bg-mint-soft" },
  important: { emoji: "⭐", label: "วันสำคัญ", color: "text-[#8a6a00]", bg: "bg-yellow-soft" },
  monthly: { emoji: "🎈", label: "กิจกรรมประจำเดือน", color: "text-[#a8456c]", bg: "bg-pink-soft" },
  parents: { emoji: "👨‍👩‍👧", label: "ประชุมผู้ปกครอง", color: "text-[#2b5c8a]", bg: "bg-sky-soft", icon: "/events/parents.webp" },
  special: { emoji: "🎉", label: "กิจกรรมพิเศษ", color: "text-[#7a3e00]", bg: "bg-[#ffe3c8]" },
};

export const CALENDAR_EVENTS: CalendarEvent[] = [
  { id: "open-t2", date: "2026-11-02", title: "เปิดภาคเรียนที่ 2/2569", type: "term", description: "วันแรกของภาคเรียนที่ 2 ปีการศึกษา 2569" },
  { id: "parents-1", date: "2026-11-06", title: "ประชุมผู้ปกครอง ภาคเรียนที่ 2", type: "parents", time: "09:00–11:00", description: "ชี้แจงกำหนดการสอนและกิจกรรมของภาคเรียน" },
  { id: "loy", date: "2026-11-24", title: "วันลอยกระทง", type: "important", description: "กิจกรรมประดิษฐ์กระทงจากวัสดุธรรมชาติ" },
  { id: "father", date: "2026-12-04", title: "กิจกรรมวันพ่อ", type: "special", time: "09:00–10:30", description: "เด็ก ๆ มอบดอกพุทธรักษาและการ์ดให้คุณพ่อ" },
  { id: "h-father", date: "2026-12-07", title: "หยุดชดเชยวันพ่อแห่งชาติ", type: "holiday" },
  { id: "h-const", date: "2026-12-10", title: "วันรัฐธรรมนูญ", type: "holiday" },
  { id: "xmas", date: "2026-12-25", title: "กิจกรรมคริสต์มาส & ปีใหม่", type: "monthly", description: "แลกของขวัญและการแสดงของเด็ก ๆ" },
  { id: "h-newyear", date: "2026-12-31", endDate: "2027-01-01", title: "หยุดปีใหม่", type: "holiday" },
  { id: "kids-day", date: "2027-01-08", title: "กิจกรรมวันเด็ก", type: "special", description: "ฐานเกมและซุ้มขนม" },
  { id: "teacher-day", date: "2027-01-15", title: "กิจกรรมวันครู", type: "important" },
  { id: "mango", date: "2027-01-29", title: "Mango Day — ปิดโครงการ Mango Lab", type: "monthly", description: "ร้านมะม่วงจำลองและนำเสนอผลงาน" },
  { id: "makha", date: "2027-02-22", title: "วันมาฆบูชา", type: "holiday" },
  { id: "sports", date: "2027-02-26", title: "กีฬาสีอนุบาล", type: "special", time: "08:30–11:30" },
  { id: "eval", date: "2027-03-15", endDate: "2027-03-19", title: "ประเมินพัฒนาการปลายภาค", type: "term" },
  { id: "close-t2", date: "2027-03-19", title: "ปิดภาคเรียนที่ 2/2569", type: "term" },
  { id: "grad", date: "2027-03-26", title: "วันบัณฑิตน้อย", type: "special", time: "09:00–11:00", description: "พิธีมอบวุฒิบัตรอนุบาล 3" },
];

/** เดือน–ปีที่มีเหตุการณ์ (สำหรับเลือกเดือนเริ่มต้น) */
export const THAI_MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
export const THAI_MONTHS_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
export const THAI_DAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export function eventsOn(dateISO: string) {
  return CALENDAR_EVENTS.filter((e) => dateISO >= e.date && dateISO <= (e.endDate ?? e.date));
}
