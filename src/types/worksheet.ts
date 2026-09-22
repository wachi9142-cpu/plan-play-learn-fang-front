/** หมวดใบงาน */
export type WorksheetCategory =
  | "language"   // 🔤 ภาษาและการเขียน
  | "math"       // 🔢 คณิตศาสตร์
  | "color"      // 🎨 สีและรูปทรง
  | "thinking"   // 🧠 ฝึกทักษะการคิด
  | "unit"       // 🌱 ใบงานตามหน่วยการเรียนรู้
  | "science"    // 🔬 วิทยาศาสตร์
  | "nature"     // 🌿 ธรรมชาติ
  | "coding";    // 💻 Coding & Computational Thinking

/**
 * template = รูปแบบใบงานที่เว็บเรนเดอร์เป็นหน้า A4 ให้พิมพ์ได้เอง (ไม่ต้องมีไฟล์)
 * ถ้ามีไฟล์ PDF/รูปจริง ใส่ใน `file` แทน ระบบจะใช้ไฟล์นั้นสำหรับดูตัวอย่าง/ดาวน์โหลด
 */
export type WorksheetTemplate =
  | { kind: "trace"; rows: string[]; repeat?: number; hint?: string }          // คัดตัวอักษร/ตัวเลข (ตัวจาง ๆ ให้ลากตาม)
  | { kind: "count"; groups: { emoji: string; count: number }[]; choices: number[] } // นับแล้ววงกลมตัวเลข
  | { kind: "match"; left: string[]; right: string[] }                         // โยงเส้นจับคู่ (right = ลำดับสุ่มไว้แล้ว)
  | { kind: "color"; items: { emoji: string; label: string }[]; prompt: string } // ระบายสี (ภาพจาง ๆ)
  | { kind: "odd"; rows: string[][] }                                          // วงกลมภาพที่ไม่เข้าพวก
  | { kind: "sequence"; scenes: { emoji: string; label: string }[] }           // เรียงลำดับเหตุการณ์ (ใส่ตัวเลขในช่อง)
  | { kind: "blank"; prompt: string; lines?: number }                          // ช่องว่างให้วาด/เขียน
  | { kind: "grid-copy"; source: string[]; size: number }                      // ภาพเหมือน: วาดตามตาราง
  | { kind: "match-color"; icon: "motorbike" | "car"; colors: { hex: string; name: string }[]; order: number[] } // โยงเส้นยานพาหนะกับวงกลมสี (order = ลำดับสีฝั่งขวา)
  /* 💻 Coding */
  | { kind: "path"; actor: string; goal: string; size: number; start: [number, number]; target: [number, number]; obstacles?: [number, number][]; commands: string[]; prompt: string; showTrace?: boolean } // ตารางเดิน + คำสั่งให้วงกลม
  | { kind: "commands"; actor: string; goal: string; size: number; start: [number, number]; target: [number, number]; obstacles?: [number, number][]; sequence: string[]; choices: string[]; prompt: string } // ลำดับคำสั่งที่มีช่อง ❓ / คำสั่งผิด
  | { kind: "pattern-sheet"; rows: string[][] }                                // แถวแบบแผน ช่องว่างให้เติม
  | { kind: "qa"; items: { q: string; code?: string; lines: number }[] };      // คำถาม + (โค้ด) + บรรทัดเขียนตอบ

export interface WorksheetFile {
  url: string;               // /worksheets/xxx.pdf หรือ URL ภายนอก
  type: "pdf" | "image";
  preview?: string;          // รูปตัวอย่าง (ถ้ามี)
}

export interface Worksheet {
  id: string;
  title: string;
  emoji: string;
  category: WorksheetCategory;
  gradeId: string;
  ages?: string;             // 👶 เหมาะกับอายุ เช่น "4–6 ปี" (บ้านหนึ่งมีเด็กหลายวัย)
  description: string;
  skills: string[];          // ✏️ ทักษะ
  tags: string[];            // แท็กสำหรับค้นหา/กรอง เช่น "กล้ามเนื้อมัดเล็ก", "หน่วยอาหาร"
  planIds: string[];         // 📖 เชื่อมกับแผนการจัดประสบการณ์
  gameIds?: string[];        // 🎮 เกมที่คู่กัน (ใบงาน ↔ เกม)
  instructions: string[];    // วิธีใช้สำหรับครู
  template?: WorksheetTemplate;
  file?: WorksheetFile;
}
