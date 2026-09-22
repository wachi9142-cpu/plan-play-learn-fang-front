/**
 * 🌱 Garden Studio — ระบบสร้าง/แก้ไขเอกสารของ Little Purple Garden
 *
 * เอกสาร = รายการบล็อก (block-based) เพิ่มประเภทบล็อก/ประเภทเอกสารใหม่ได้โดยไม่รื้อโครง
 * เก็บในเครื่อง (localStorage) เป็นหลัก + ซิงก์ขึ้นเซิร์ฟเวอร์เมื่อเชื่อมต่อได้และมี API
 */
export type DocType = "plan" | "schedule" | "other";

export type Block =
  | { id: string; type: "heading"; level: 1 | 2 | 3; html: string }
  | { id: string; type: "paragraph"; html: string }
  | { id: string; type: "bullets"; items: string[]; ordered?: boolean }
  | { id: string; type: "table"; rows: string[][]; header?: boolean }
  | { id: string; type: "image"; src: string; caption?: string; width?: number }
  | { id: string; type: "callout"; emoji: string; html: string; tone?: "purple" | "yellow" | "mint" | "pink" }
  | { id: string; type: "divider" }
  | { id: string; type: "fields"; fields: { label: string; value: string }[] }; // ตารางข้อมูลหัวเอกสาร เช่น หน่วย/สัปดาห์/วันที่

export interface DocLinks {
  planId?: string;        // → LessonPlan
  scheduleId?: string;    // → Schedule
  gradeId?: string;
}

export interface StudioDoc {
  id: string;
  type: DocType;
  title: string;
  blocks: Block[];
  links: DocLinks;
  createdAt: string;      // ISO
  updatedAt: string;      // ISO
  syncedAt?: string;      // ISO — ครั้งล่าสุดที่ขึ้นเซิร์ฟเวอร์สำเร็จ
  dirty: boolean;         // มีการแก้ไขที่ยังไม่ได้ซิงก์
}

export type SaveStatus = "saved" | "saving" | "unsaved" | "offline" | "local-only" | "error";
