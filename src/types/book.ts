/** 📚 ห้องสมุด — ชั้นหนังสือ (ผู้ใหญ่) · มุมหนังสือ (เด็ก) */

export type Audience = "adult" | "kid";

/** ประเภทเอกสารบนชั้นหนังสือ */
export type DocType = "curriculum" | "manual" | "official" | "notice" | "reference" | "other";
/** สถานะเผยแพร่ (แยกจากสถานะหลักสูตร) */
export type PublishState = "draft" | "review" | "published";
/** ใครเห็นเอกสารนี้ได้ */
export type Visibility = "admin" | "teacher" | "parent" | "student" | "public";

/** หมวดชั้นหนังสือ (ครู/บุคลากร/ผู้ปกครอง) */
export type ShelfCategory = "official" | "teacher" | "psychology" | "teaching" | "guide" | "parent" | "knowledge" | "kaowfang";
/** หมวดมุมหนังสือ (เด็ก) */
export type CornerCategory = "tale" | "animal" | "nature" | "adventure" | "family" | "feeling" | "number" | "language" | "science" | "art" | "world";

export interface BookFile { assetId: string; name: string; mime: string; size: number }

/** หน้าหนึ่งของนิทานเด็ก */
export interface StoryPage { id: string; emoji?: string; image?: string; text: string }

export interface Book {
  id: string;
  audience: Audience;
  category: ShelfCategory | CornerCategory;
  title: string;
  author?: string;
  emoji: string;               // ใช้เป็นปกเมื่อไม่มีรูป
  cover?: string;              // data URL ปกหนังสือ
  description?: string;
  tags: string[];
  /** ผู้ใหญ่: ไฟล์ PDF/เอกสาร · เด็ก: ไม่จำเป็น */
  file?: BookFile;
  url?: string;                // ลิงก์ภายนอก (ถ้าอ่านจากเว็บอื่น)
  /** เด็ก: เนื้อเรื่องเป็นหน้า ๆ */
  pages?: StoryPage[];
  ages?: string;               // เช่น "3–6 ปี"
  /** 🎨 กิจกรรมต่อยอดหลังอ่าน */
  activities?: { emoji: string; label: string; href?: string }[];
  addedBy: string;
  createdAt: string;
  updatedAt: string;
  /** อ้างอิงกลับไปยังหลักสูตร (สำหรับเล่มที่มาจากระบบหลักสูตร) */
  curriculumId?: string;
  /** ปี พ.ศ. ของเอกสาร (ใช้จัดกลุ่มหลักสูตรตามปี) */
  year?: number;
  /** สถานะจากระบบหลักสูตร: active | pending | announced | archived */
  status?: string;
  docType?: DocType;          // 📕 หลักสูตร · 📘 คู่มือ · 📄 เอกสารทางการ · 📑 ประกาศ · 📚 อ้างอิง · 🗂️ อื่น ๆ
  level?: string;             // ระดับการศึกษา เช่น ปฐมวัย
  announcedAt?: string;       // วันที่ประกาศ/เริ่มใช้
  note?: string;
  publish?: PublishState;     // 📝 แบบร่าง → 👀 รอตรวจสอบ → 🟢 เผยแพร่
  visibility?: Visibility;    // ใครเห็นได้
}
