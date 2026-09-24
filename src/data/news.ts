/** ประชาสัมพันธ์ — ประกาศ/ข่าวสารถึงผู้ปกครอง เพิ่มรายการใหม่ที่ด้านบนของอาร์เรย์ */
export type NewsCategory = "announce" | "event" | "holiday" | "parents" | "general";

export interface NewsItem {
  id: string;
  title: string;
  category: NewsCategory;
  date: string;        // "2026-11-01"
  dateLabel: string;   // "1 พ.ย. 2569"
  summary: string;
  body?: string[];     // ย่อหน้า
  pinned?: boolean;
  icon?: string;       // ภาพเฉพาะข่าวนี้ (แทนไอคอนหมวด)
  link?: { href: string; label: string };
}

export const NEWS_CATEGORIES: Record<NewsCategory, { emoji: string; label: string; tone: "purple" | "pink" | "yellow" | "mint" | "sky"; image?: string }> = {
  announce: { emoji: "📣", label: "ประกาศ", tone: "purple", image: "/news/announce.webp" },
  event: { emoji: "🎉", label: "กิจกรรม", tone: "pink" },
  holiday: { emoji: "🌴", label: "วันหยุด", tone: "mint" },
  parents: { emoji: "👨‍👩‍👧", label: "ถึงผู้ปกครอง", tone: "sky", image: "/news/parents.webp" },
  general: { emoji: "💜", label: "ทั่วไป", tone: "yellow" },
};

export const NEWS: NewsItem[] = [
  {
    id: "open-term2",
    title: "เปิดภาคเรียนที่ 2 ปีการศึกษา 2569 วันจันทร์ที่ 2 พฤศจิกายน",
    category: "announce", date: "2026-10-26", dateLabel: "26 ต.ค. 2569", pinned: true,
    summary: "โรงเรียนเปิดภาคเรียนที่ 2 วันที่ 2 พ.ย. 69 เวลา 08:00 น. เตรียมชุดนักเรียน ผ้ากันเปื้อน และขวดน้ำมาด้วยนะคะ",
    body: ["ภาคเรียนที่ 2/2569 เริ่มวันจันทร์ที่ 2 พฤศจิกายน 2569 เวลา 08:00 น.", "สัปดาห์แรกเรียนหน่วย “อาหารดีมีประโยชน์” ผู้ปกครองสามารถดูกำหนดการสอนทั้งภาคเรียนได้ในเว็บไซต์", "สิ่งที่ต้องเตรียม: ชุดนักเรียน 1 ชุด ผ้ากันเปื้อน ขวดน้ำ และชุดสำรอง"],
    link: { href: "/schedules", label: "ดูกำหนดการสอน" },
  },
  {
    id: "parents-meeting",
    title: "ประชุมผู้ปกครอง ภาคเรียนที่ 2 — ศุกร์ 6 พ.ย. 69 เวลา 09:00 น.",
    category: "parents", date: "2026-10-28", dateLabel: "28 ต.ค. 2569", pinned: true,
    summary: "ขอเชิญผู้ปกครองทุกท่านร่วมประชุมรับฟังแนวทางการจัดประสบการณ์ กิจกรรม และปฏิทินของภาคเรียน",
    link: { href: "/calendar", label: "ดูปฏิทินโรงเรียน" },
  },
  {
    id: "loy-krathong-2569",
    title: "ชวนเด็ก ๆ ประดิษฐ์กระทงจากใบตอง วันอังคารที่ 24 พ.ย. 69",
    icon: "/news/krathong.webp",
    category: "event", date: "2026-11-16", dateLabel: "16 พ.ย. 2569",
    summary: "กิจกรรมลอยกระทงน้อย ผู้ปกครองที่สะดวกสามารถส่งใบตองหรือดอกไม้มาให้เด็ก ๆ ได้ค่ะ",
    link: { href: "/school-events/loy-krathong", label: "รายละเอียดกิจกรรม" },
  },
  {
    id: "holiday-dec",
    title: "แจ้งวันหยุดเดือนธันวาคม 2569",
    icon: "/news/holiday.webp",
    category: "holiday", date: "2026-11-30", dateLabel: "30 พ.ย. 2569",
    summary: "หยุดชดเชยวันพ่อแห่งชาติ 7 ธ.ค. · วันรัฐธรรมนูญ 10 ธ.ค. · หยุดปีใหม่ 31 ธ.ค. – 1 ม.ค.",
    link: { href: "/calendar", label: "ดูปฏิทินโรงเรียน" },
  },
  {
    id: "website-launch",
    title: "เปิดตัวเว็บไซต์ Little Purple Garden 💜",
    category: "general", date: "2026-10-20", dateLabel: "20 ต.ค. 2569",
    summary: "รวมแผนการสอน กิจกรรม เกมการศึกษา และใบงาน ให้ผู้ปกครองดูและเล่นกับลูก ๆ ที่บ้านได้",
    link: { href: "/games", label: "ลองเล่นเกมการศึกษา" },
  },
];

export const getNews = (id: string) => NEWS.find((n) => n.id === id);
export const sortedNews = () => [...NEWS].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.date.localeCompare(a.date));
