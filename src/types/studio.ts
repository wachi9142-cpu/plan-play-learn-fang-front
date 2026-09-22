/**
 * 🌱 Garden Studio — ระบบสร้าง/แก้ไขเอกสารของ Little Purple Garden
 *
 * เอกสาร = รายการบล็อก (block-based) เพิ่มประเภทบล็อก/ประเภทเอกสารใหม่ได้โดยไม่รื้อโครง
 * - ข้อความ/โครงเอกสาร: localStorage
 * - รูปภาพ/ไฟล์แนบ (assets): IndexedDB (รองรับไฟล์ใหญ่)
 * - ซิงก์ขึ้นเซิร์ฟเวอร์เมื่อเชื่อมต่อได้และตั้งค่า API แล้ว
 */
export type DocType = "plan" | "schedule" | "worksheet" | "media" | "slides" | "sheet" | "other";
export type DocStatus = "draft" | "saved" | "ready";

export type ImageAlign = "left" | "center" | "right";
export type CropAspect = "free" | "1:1" | "4:3" | "3:4" | "16:9";

/** การรวมเซลล์ในตาราง */
export interface TableMerge { r: number; c: number; rowSpan: number; colSpan: number }
/** สไตล์รายเซลล์ (key "r,c") */
export interface CellStyle { align?: "left" | "center" | "right"; valign?: "top" | "middle" | "bottom"; bg?: string; color?: string; fontSize?: number; fontFamily?: string; padding?: number }
/** เส้นขอบตาราง */
export interface TableBorder { width?: number; style?: "solid" | "dashed" | "dotted" | "double" | "none"; color?: string }

/** สไตล์ระดับบล็อกข้อความ: ระยะบรรทัด ระยะตัวอักษร ฟอนต์ ขนาด */
export interface TextStyle { lineHeight?: number; letterSpacing?: number; fontFamily?: string; fontSize?: number; align?: "left" | "center" | "right" }

export type Block =
  | { id: string; type: "heading"; level: 1 | 2 | 3; html: string; style?: TextStyle }
  | { id: string; type: "paragraph"; html: string; style?: TextStyle }
  | { id: string; type: "bullets"; items: string[]; ordered?: boolean; style?: TextStyle }
  | { id: string; type: "table"; rows: string[][]; header?: boolean; colWidths?: number[]; rowHeights?: number[]; merges?: TableMerge[]; cellStyles?: Record<string, CellStyle>; border?: TableBorder; align?: "left" | "center" | "right" }
  | {
      id: string; type: "image";
      src: string;            // data URL / URL (ถ้าไม่ได้ใช้ assetId)
      assetId?: string;       // → asset ใน IndexedDB
      caption?: string;
      width?: number;         // % ของความกว้างเอกสาร
      align?: ImageAlign;
      rotate?: 0 | 90 | 180 | 270;
      crop?: { aspect: CropAspect; x: number; y: number }; // x,y = object-position (%)
    }
  | { id: string; type: "file"; assetId: string; name: string; mime: string; size: number } // ไฟล์แนบ (PDF/Word/PPT)
  | { id: string; type: "callout"; emoji: string; html: string; tone?: "purple" | "yellow" | "mint" | "pink"; style?: TextStyle }
  | { id: string; type: "divider" }
  | { id: string; type: "fields"; fields: { label: string; value: string }[] };

export interface DocLinks {
  /** 📚 หลักสูตรที่ใช้กับเอกสาร/แผนนี้ (ไม่เปลี่ยนตามฉบับใหม่) */
  curriculumId?: string;
  planId?: string;
  scheduleId?: string;
  gradeId?: string;
}

export interface StudioAsset {
  id: string;
  docId: string;
  name: string;
  mime: string;
  size: number;
  kind: "image" | "file";
  createdAt: string;
  blob: Blob;
}

/** สไลด์ 1 หน้า (16:9) — ใช้บล็อกชุดเดียวกับเอกสาร */
export type SlideTheme = "white" | "purple" | "pink" | "mint" | "sky" | "yellow" | "dark";
export interface Slide { id: string; theme: SlideTheme; blocks: Block[]; notes?: string }

/** สเปรดชีต: ตารางเซลล์ (รองรับสูตร =SUM(A1:A5) =AVERAGE() =COUNT() และ +-*\/ ระหว่างเซลล์) */
export interface SheetData { rows: string[][]; colWidths?: number[]; headerRow?: boolean }

export interface StudioDoc {
  id: string;
  type: DocType;
  status: DocStatus;
  title: string;
  blocks: Block[];
  slides?: Slide[];      // เฉพาะ type "slides"
  sheet?: SheetData;     // เฉพาะ type "sheet"
  links: DocLinks;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
  dirty: boolean;
}

export type SaveStatus = "saved" | "saving" | "unsaved" | "offline" | "local-only" | "error";
