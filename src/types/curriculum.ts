/** 📚 หลักสูตร — เพิ่มได้หลายฉบับ/หลายปี แต่ละฉบับมีโครงสร้างข้อมูลของตัวเอง (ไม่เขียนทับกัน) */

export type CurriculumStatus = "active" | "pending" | "archived";
export type CurriculumLevel = "early" | "primary" | "secondary" | "other";

export interface CurriculumFile { id: string; assetId: string; name: string; mime: string; size: number; kind: "main" | "attachment"; addedAt: string }

/** สภาพที่พึงประสงค์ (ระบุช่วงอายุได้) */
export interface DesiredState { id: string; code: string; text: string; age?: string }
/** ตัวบ่งชี้ */
export interface Indicator { id: string; code: string; title: string; states: DesiredState[] }
/** มาตรฐาน */
export interface Standard { id: string; code: string; title: string; indicators: Indicator[] }
/** ประสบการณ์สำคัญ (แยกตามด้าน) */
export interface ExperienceGroup { id: string; domain: string; items: { id: string; text: string }[] }
/** สาระที่ควรเรียนรู้ */
export interface ContentArea { id: string; title: string; items: { id: string; text: string }[] }

export interface CurriculumStructure {
  standards: Standard[];
  experiences: ExperienceGroup[];
  contents: ContentArea[];
}

export interface Curriculum {
  id: string;
  title: string;
  year: number;               // พ.ศ.
  level: CurriculumLevel;
  description?: string;
  status: CurriculumStatus;
  files: CurriculumFile[];
  announcedAt?: string;       // วันที่ประกาศ/เริ่มใช้
  note?: string;
  addedBy: string;
  createdAt: string;
  updatedAt: string;
  structure: CurriculumStructure;
  /** 📌 หน้าที่คั่นไว้ในตัวอ่าน */
  bookmarks: { page: number; label?: string }[];
}
