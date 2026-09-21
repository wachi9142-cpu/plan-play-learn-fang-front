export const SITE = {
  name: "แผนเล่นเรียน อนุบาล 1",
  nameEn: "Play & Learn Plan | Kindergarten 1",
  credit: "by Teacher Kaowfang",
  tagline: "เรียนรู้ผ่านการเล่น เติบโตผ่านประสบการณ์ 🌱",
  description: "รวมแผน กิจกรรม และสื่อการเรียนรู้สำหรับเด็กปฐมวัย",
  concept: "พื้นที่เล็ก ๆ ที่เปลี่ยนการเรียนรู้ให้เป็นเรื่องสนุก ผ่านการเล่นและประสบการณ์ของเด็ก ๆ",
  welcome: "สวัสดีค่ะ ครูฟ่างฟ่างยินดีต้อนรับ",
};

export interface NavItem {
  href: string;
  emoji: string;
  label: string;
  description: string;
  tint: string; // tailwind bg class for the icon bubble
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/plans", emoji: "📚", label: "แผนการจัดประสบการณ์", description: "เลือกดูตามภาคเรียน เดือน หน่วย และสัปดาห์", tint: "bg-purple-100" },
  { href: "/activities", emoji: "🧸", label: "กิจกรรมการเรียนรู้", description: "ไอเดียกิจกรรมพร้อมจุดประสงค์และขั้นตอน", tint: "bg-pink-soft" },
  { href: "/media", emoji: "🎨", label: "สื่อการสอน", description: "บัตรภาพ เพลง นิทาน และสื่อทำมือ", tint: "bg-yellow-soft" },
  { href: "/worksheets", emoji: "📝", label: "ใบงาน", description: "ใบงานฝึกทักษะแยกตามหน่วยการเรียนรู้", tint: "bg-mint-soft" },
  { href: "/weekly", emoji: "📅", label: "แผนรายสัปดาห์", description: "ภาพรวมกิจกรรม จันทร์–ศุกร์ ของแต่ละสัปดาห์", tint: "bg-sky-soft" },
  { href: "/notes", emoji: "🌷", label: "บันทึก / แนวทางสำหรับครู", description: "เคล็ดลับและแนวทางจากประสบการณ์ในห้องเรียน", tint: "bg-purple-50" },
];
