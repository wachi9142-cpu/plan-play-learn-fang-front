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
  { id: "art-week", emoji: "🎨", title: "สัปดาห์ศิลปะ “สีสันในสวน”", category: "art", date: "2026-11-13", dateLabel: "13 พ.ย. 2569", description: "เด็ก ๆ ทดลองผสมสี พิมพ์ภาพจากผลไม้ และจัดแสดงผลงานที่มุมศิลปะของห้อง", highlights: ["ผสมสีน้ำ", "พิมพ์ภาพผลไม้", "นิทรรศการเล็ก ๆ"], planId: "food" },
  { id: "plant-day", emoji: "🌱", title: "วันปลูกต้นไม้ของหนู", category: "nature", date: "2026-11-20", dateLabel: "20 พ.ย. 2569", description: "ทุกคนเพาะถั่วงอกและปลูกต้นกล้าในกระถางของตัวเอง แล้วช่วยกันรดน้ำทุกเช้า", highlights: ["เพาะถั่วงอก", "ตกแต่งกระถาง"], planId: "nature" },
  { id: "loy-krathong", emoji: "🪷", title: "ลอยกระทงน้อย", category: "festival", date: "2026-11-24", dateLabel: "24 พ.ย. 2569", description: "ประดิษฐ์กระทงจากใบตองและดอกไม้ แล้วลอยในอ่างน้ำที่สนามโรงเรียน", planId: "loy-krathong" },
  { id: "father-day", emoji: "👨", title: "กิจกรรมวันพ่อ", category: "parents", date: "2026-12-04", dateLabel: "4 ธ.ค. 2569", description: "คุณพ่อมาร่วมกิจกรรมในห้อง เด็ก ๆ มอบการ์ดและร้องเพลงให้", planId: "father" },
  { id: "egg-hatch", emoji: "🥚", title: "โครงการนักสำรวจไข่ตัวจิ๋ว — วันฟักไข่", category: "project", date: "2026-12-16", dateLabel: "16 ธ.ค. 2569", description: "หลังเฝ้าดูตู้ฟักมา 3 สัปดาห์ ลูกเจี๊ยบตัวแรกก็ออกจากไข่", projectId: "egg-explorer" },
  { id: "mango-day", emoji: "🥭", title: "Mango Day — ปิดโครงการ Mango Lab", category: "project", date: "2027-01-29", dateLabel: "29 ม.ค. 2570", description: "ร้านมะม่วงจำลอง มะม่วงปั่น และการนำเสนอผลงานให้เพื่อนห้องอื่น", projectId: "mango-lab" },
  { id: "sports-day", emoji: "🏃", title: "กีฬาสีอนุบาล", category: "outdoor", date: "2027-02-26", dateLabel: "26 ก.พ. 2570", description: "วิ่งเก็บของ ขี่ม้าก้านกล้วย และเชียร์ลีดเดอร์ตัวจิ๋ว", highlights: ["วิ่งเก็บของ", "ขบวนพาเหรด"] },
];

export const getSchoolEvent = (id: string) => SCHOOL_EVENTS.find((e) => e.id === id);
