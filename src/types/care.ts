/**
 * 🧸 การดูแลรายวัน — สมุดสื่อสาร · เมนูอาหาร · แจ้งลา · คนมารับเด็ก
 * ทั้งหมดผูกกับห้องเรียนและสมาชิกใน classroom-store (roomId / childId)
 */

/** กินได้แค่ไหน */
export type MealAmount = "all" | "most" | "some" | "none";

/** อารมณ์วันนี้ */
export type MoodId = "happy" | "normal" | "quiet" | "cry" | "tired" | "sick";

export interface DailyReport {
  id: string;
  roomId: string;
  childId: string;
  /** วันที่แบบ YYYY-MM-DD */
  date: string;
  meals: { snackAm?: MealAmount; lunch?: MealAmount; snackPm?: MealAmount };
  /** เวลานอนกลางวัน เช่น "12:30–14:00" */
  nap?: string;
  /** เข้าห้องน้ำหนักปกติไหม */
  poop?: "yes" | "no";
  mood?: MoodId;
  /** วันนี้ทำอะไรบ้าง (ครูพิมพ์สั้น ๆ หรือเลือกจากรายการ) */
  activities?: string[];
  /** ของที่ต้องเตรียมมาพรุ่งนี้ */
  bring?: string[];
  note?: string;
  by: string;
  at: string;
}

/** เมนูอาหาร 1 วัน */
export interface LunchDay {
  /** 1 = จันทร์ … 5 = ศุกร์ */
  day: number;
  snackAm?: string;
  lunch?: string;
  snackPm?: string;
}

/** เมนูอาหารประจำสัปดาห์ */
export interface LunchWeek {
  id: string;
  label: string;
  /** วันจันทร์ของสัปดาห์นั้น YYYY-MM-DD */
  startDate?: string;
  note?: string;
  days: LunchDay[];
  updatedAt: string;
}

/** ของแพ้ของเด็กคนหนึ่ง */
export interface Allergy {
  childId: string;
  roomId: string;
  childName: string;
  items: string[];
  /** รุนแรงแค่ไหน */
  severity: "mild" | "severe";
  note?: string;
  updatedAt: string;
}

export type LeaveKind = "sick" | "personal";

export interface LeaveRequest {
  id: string;
  roomId: string;
  childId: string;
  childName: string;
  kind: LeaveKind;
  /** วันที่ลา (ลาหลายวันได้) */
  dates: string[];
  reason?: string;
  by: string;
  at: string;
  /** ครูรับทราบแล้ว */
  ack?: boolean;
}

/** คนที่มารับเด็กได้ประจำ */
export interface PickupPerson {
  id: string;
  roomId: string;
  childId: string;
  childName: string;
  name: string;
  relation: string;
  phone?: string;
  photo?: string;
  note?: string;
}

/** วันไหนให้คนอื่นมารับแทน */
export interface PickupChange {
  id: string;
  roomId: string;
  childId: string;
  childName: string;
  date: string;
  name: string;
  relation: string;
  phone?: string;
  by: string;
  at: string;
  ack?: boolean;
}

export interface CareDB {
  reports: DailyReport[];
  weeks: LunchWeek[];
  allergies: Allergy[];
  leaves: LeaveRequest[];
  pickups: PickupPerson[];
  changes: PickupChange[];
}
