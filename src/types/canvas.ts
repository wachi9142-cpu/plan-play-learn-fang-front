/** 🎨 Garden Canvas — กระดาษสร้างสรรค์ (วาดคนเดียว / วาดร่วมกัน) */

export type CanvasTool = "pen" | "brush" | "line" | "rect" | "ellipse" | "triangle" | "star" | "fill" | "eraser" | "text" | "image" | "move";

export interface Pt { x: number; y: number }

/** รูปแบบหัวยางลบ */
export type EraserShape = "circle" | "heart" | "cloud" | "square";

/** ทุกการวาดเป็น "op" เพื่อ undo/redo และส่งให้ผู้ร่วมวาดคนอื่น */
export type CanvasOp =
  | { id: string; by: string; kind: "stroke"; tool: "pen" | "brush" | "eraser"; color: string; size: number; points: Pt[]; shape?: EraserShape }
  | { id: string; by: string; kind: "shape"; shape: "line" | "rect" | "ellipse" | "triangle" | "star"; color: string; size: number; fill?: string; from: Pt; to: Pt }
  | { id: string; by: string; kind: "fill"; color: string; at: Pt }
  | { id: string; by: string; kind: "text"; text: string; color: string; size: number; font?: string; at: Pt }
  | { id: string; by: string; kind: "image"; src: string; x: number; y: number; w: number; h: number };

export type CanvasRole = "teacher" | "child" | "parent";

export interface Participant { id: string; name: string; role: CanvasRole; color: string; cursor?: Pt; lastSeen: number }

export type CanvasTemplateId = "blank" | "garden" | "trace-lines" | "trace-numbers" | "trace-letters" | "color-in" | "house" | "story";

export interface CanvasDoc {
  id: string;
  title: string;
  template: CanvasTemplateId;
  width: number;
  height: number;
  ops: CanvasOp[];
  /** รหัสห้อง (มีเมื่อเป็นกระดาษวาดร่วมกัน) */
  room?: string;
  childName?: string;
  planId?: string;
  createdAt: string;
  updatedAt: string;
  thumb?: string; // data URL เล็ก ๆ
}

/** ผลงานในแฟ้มผลงานเด็ก (บันทึกจาก Canvas) */
export type PortfolioCategory = "art" | "coding" | "worksheet" | "craft" | "writing" | "photo" | "other";

export interface PortfolioItem {
  id: string;
  canvasId: string;
  title: string;
  childName: string;
  image: string; // data URL
  date: string;
  published: boolean;      // แสดงใน Gallery สาธารณะ (ไม่เผยแพร่ = Private เห็นเฉพาะครู/ผู้ปกครองของเด็ก)
  planId?: string;
  authors?: string[];
  category?: PortfolioCategory;
  teacherComment?: string;
  roomId?: string;
  note?: string;
}

/** ข้อความที่ส่งระหว่างผู้ร่วมวาด */
export type SyncMessage =
  | { t: "hello"; room: string; who: Participant; ops?: CanvasOp[] }
  | { t: "state"; room: string; ops: CanvasOp[]; title?: string; template?: CanvasTemplateId }
  | { t: "op"; room: string; op: CanvasOp }
  | { t: "undo"; room: string; opId: string }
  | { t: "clear"; room: string; by: string }
  | { t: "cursor"; room: string; who: string; at: Pt | null }
  | { t: "presence"; room: string; who: Participant }
  | { t: "bye"; room: string; who: string }
  | { t: "meta"; room: string; title?: string; template?: CanvasTemplateId };
