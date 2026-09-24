/**
 * แกลเลอรี: ผลงานเด็ก & ภาพกิจกรรม
 * ใส่รูปจริงโดยวางไฟล์ใน public/gallery/ แล้วอ้าง image: "/gallery/xxx.jpg"
 * ถ้ายังไม่มีรูป ระบบจะแสดง emoji แทน
 */
export type GalleryKind = "work" | "photo";

export interface GalleryItem {
  id: string;
  kind: GalleryKind;
  title: string;
  description?: string;
  date: string;         // "พ.ย. 2569"
  emoji: string;        // ใช้แทนรูปเมื่อยังไม่มี image
  icon?: string;        // ภาพไอคอนแทนอีโมจิ (พื้นหลังโปร่งใส)
  image?: string;
  planId?: string;      // → LessonPlan
  projectId?: string;   // → Project
  tags?: string[];
}

export const GALLERY: GalleryItem[] = [
  { id: "w-color-mix", kind: "work", title: "สนุกกับการผสมสี", description: "ผลงานสีน้ำจากกิจกรรมสร้างสรรค์ สัปดาห์ที่ 2 หน่วยตัวเรา", date: "มิ.ย. 2569", emoji: "🎨", icon: "/art/palette.webp", planId: "myself", tags: ["ศิลปะ", "หน่วยตัวเรา"] },
  { id: "w-clay-me", kind: "work", title: "ปั้นดินน้ำมัน “ตัวฉัน”", description: "เด็ก ๆ ปั้นตัวเองด้วยดินน้ำมัน", date: "มิ.ย. 2569", emoji: "🧸", planId: "myself", tags: ["ปั้น", "หน่วยตัวเรา"] },
  { id: "w-fruit-print", kind: "work", title: "พิมพ์ภาพจากผลไม้", description: "พิมพ์ภาพจากหน้าตัดมะนาวและกระเจี๊ยบ", date: "พ.ย. 2569", emoji: "🍋", planId: "food", tags: ["ศิลปะ", "หน่วยอาหาร"] },
  { id: "w-family-draw", kind: "work", title: "วาดครอบครัวของฉัน", description: "ใบงานวาดครอบครัว หน่วยครอบครัว", date: "ก.ค. 2569", emoji: "🏠", planId: "family", tags: ["วาดภาพ", "หน่วยครอบครัว"] },
  { id: "p-egg", kind: "photo", title: "นักสำรวจไข่ตัวจิ๋ว", description: "วันฟักไข่ เด็ก ๆ ตื่นเต้นกันมาก", date: "พ.ย. 2569", emoji: "🐣", projectId: "egg-explorer", tags: ["โครงการ"] },
  { id: "p-outdoor", kind: "photo", title: "วิ่งเก็บสีในสนาม", description: "กิจกรรมกลางแจ้ง หน่วยตัวเรา", date: "มิ.ย. 2569", emoji: "🌳", planId: "myself", tags: ["กลางแจ้ง"] },
  { id: "p-fruit-salad", kind: "photo", title: "ปาร์ตี้สลัดผลไม้", description: "ทำสลัดผลไม้ด้วยตัวเอง หน่วยอาหารดีมีประโยชน์", date: "พ.ย. 2569", emoji: "🥗", planId: "food", tags: ["หน่วยอาหาร"] },
  { id: "p-mango", kind: "photo", title: "Mango Day", description: "ร้านมะม่วงจำลองปิดโครงการ Mango Lab", date: "ธ.ค. 2569", emoji: "🥭", projectId: "mango-lab", tags: ["โครงการ"] },
];

export const getGalleryByKind = (kind: GalleryKind) => GALLERY.filter((g) => g.kind === kind);
export const getGalleryForPlan = (planId: string) => GALLERY.filter((g) => g.planId === planId);
