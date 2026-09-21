/**
 * โครงสร้างข้อมูลแบบสัมพันธ์กัน (relational)
 *
 *   กำหนดการสอน (Schedule)
 *        │  แต่ละแถวอ้างถึง planId
 *        ↓
 *   แผนการจัดประสบการณ์ / เรื่อง (LessonPlan)  ── belongs to ── หน่วย (Unit)
 *        │  จุดประสงค์ · สาระการเรียนรู้ · สื่อ · การประเมิน
 *        ↓
 *   สัปดาห์ (Week) → วัน (DayPlan) → กิจกรรม (Activity)
 *        │
 *        └── related: media / worksheets / projects (อ้างด้วย id)
 *
 * ทุกอย่างอ้างกันด้วย id จึงเพิ่ม อนุบาล 2 / โครงการใหม่ / แผนใหม่ ได้โดยไม่ต้องแก้หน้าเว็บ
 */

export type ActivityType =
  | "circle"      // กิจกรรมเคลื่อนไหวและจังหวะ
  | "creative"    // กิจกรรมสร้างสรรค์
  | "free"        // กิจกรรมเสรี / เล่นตามมุม
  | "outdoor"     // กิจกรรมกลางแจ้ง
  | "story"       // กิจกรรมเสริมประสบการณ์
  | "game";       // เกมการศึกษา

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  objectives: string[];
  materials: string[];
  steps: string[];
  assessment?: string[];
  note?: string;
}

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri";

export interface DayPlan {
  day: DayKey;
  theme?: string;
  activities: Activity[];
}

export interface Week {
  id: string;           // e.g. "w1"
  number: number;
  title: string;
  summary: string;
  days: DayPlan[];
}

/** หน่วยการเรียนรู้ (ชื่อสั้น เช่น "อาหาร", "ตัวเรา") */
export interface Unit {
  id: string;
  emoji: string;
  name: string;
}

/** ระดับชั้น */
export interface Grade {
  id: string;           // "k1"
  name: string;         // "อนุบาล 1"
  short: string;        // "อ.1"
  emoji: string;
  ages: string;         // ช่วงอายุ
  description: string;  // ลักษณะการจัดประสบการณ์ของระดับนี้
  focus: string[];      // จุดเน้นพัฒนาการ
  tint: string;         // tailwind bg class
}

/** แผนการจัดประสบการณ์ 1 เรื่อง — หัวใจของระบบ */
export interface LessonPlan {
  id: string;           // slug e.g. "food"
  number: number;       // เรื่องที่ N
  title: string;        // "อาหารดีมีประโยชน์"
  emoji: string;
  gradeId: string;      // → Grade
  unitId: string;       // → Unit
  strand?: string;      // สาระการเรียนรู้ (1 ใน 4 สาระ) → STRANDS
  description: string;
  keywords: string[];   // สำหรับค้นหา
  duration: string;     // "4 สัปดาห์"
  objectives: string[];         // จุดประสงค์
  content: string[];            // สาระการเรียนรู้
  materials: string[];          // สื่อ/อุปกรณ์
  assessment: string[];         // การประเมิน
  weeks: Week[];
  related?: {
    mediaIds?: string[];
    worksheetIds?: string[];
    projectIds?: string[];
    activityIds?: string[];     // → LearningActivity (คลังกิจกรรม)
  };
}

/** โครงสร้างปีการศึกษา ใช้สำหรับ "เลือกดูตามภาคเรียน → เดือน" */
export interface Month {
  id: string;
  name: string;
  planIds: string[];    // → LessonPlan
}

export interface Semester {
  id: string;
  gradeId: string;
  name: string;         // "ภาคเรียนที่ 1"
  year: string;         // "ปีการศึกษา 2569"
  months: Month[];
}

/** กำหนดการสอน 1 ชุด — ตารางรายสัปดาห์ (ปกติ 20 สัปดาห์/ภาคเรียน) */
export type ScheduleRowKind = "plan" | "assessment" | "holiday" | "event";

export interface ScheduleRow {
  week: number;             // สัปดาห์ที่
  dates: string;            // วัน เดือน ปี เช่น "1-5 พ.ย. 64"
  strand?: string;          // สาระการเรียนรู้ (ถ้าไม่ระบุ ดึงจากแผน)
  planId?: string;          // → LessonPlan (หน่วยการจัดประสบการณ์) — กดแล้วไปยังแผน
  title?: string;           // ชื่อหน่วยกรณียังไม่มีแผน หรือแถวพิเศษ เช่น "ประเมินพัฒนาการ"
  note?: string;            // หมายเหตุ
  kind?: ScheduleRowKind;   // default "plan"
}

export interface Schedule {
  id: string;               // "k1-2564-2"
  title: string;            // "กำหนดการสอนชุดที่ 1"
  gradeId: string;
  semester: string;         // "ภาคเรียนที่ 2"
  year: string;             // "ปีการศึกษา 2564"
  school?: string;
  teacher?: string;
  description?: string;
  rows: ScheduleRow[];
  footer?: string;          // แถบท้ายตาราง เช่น "ปิดเทอม"
}

/** โครงการ (Project Approach) */
export interface ProjectPhase {
  title: string;
  description: string;
  activities: string[];
}

export interface Project {
  id: string;
  emoji: string;
  title: string;
  subtitle?: string;
  gradeId: string;
  description: string;
  duration: string;
  goals: string[];
  phases: ProjectPhase[];
  materials: string[];
  outcomes: string[];
  relatedPlanIds?: string[];   // → LessonPlan
}
