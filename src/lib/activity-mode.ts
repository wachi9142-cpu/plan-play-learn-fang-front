/**
 * 🎯 Activity Mode — "เอฟเฟกต์มีไว้สร้างบรรยากาศ ไม่ใช่รบกวนการเรียนรู้"
 *
 * หน้าไหนที่ผู้ใช้ต้อง วาด · เขียน · ลาก · พิมพ์ · คลิกเล่น · เรียนออนไลน์
 * ระบบจะปิดเอฟเฟกต์บรรยากาศทั้งหมดให้อัตโนมัติ (ธีมสว่าง/มืดยังทำงานปกติ)
 *
 * เพิ่มหน้าใหม่ที่ต้องปิดเอฟเฟกต์ = เพิ่ม 1 บรรทัดใน ACTIVITY_ROUTES
 */

export type PageMode =
  | "landing"        // หน้าแรก
  | "informational"  // หน้าข้อมูล/เกี่ยวกับ
  | "listing"        // หน้ารายการ
  | "detail"         // หน้ารายละเอียด
  | "activity"       // หน้าที่ต้องลงมือทำ
  | "interactive"    // หน้าที่ต้องคลิก/ลากเล่น
  | "editor"         // หน้าสร้าง/แก้ไขเอกสาร
  | "classroom";     // ห้องเรียนออนไลน์

/** โหมดที่ "ปิด" เอฟเฟกต์ */
const OFF_MODES: PageMode[] = ["activity", "interactive", "editor", "classroom"];

export function effectsAllowed(mode: PageMode): boolean {
  return !OFF_MODES.includes(mode);
}

/** เส้นทางที่ถือเป็น Activity Mode — ตรวจตามลำดับ เจอ exact ก่อน แล้วค่อย pattern */
const ACTIVITY_ROUTES: { test: RegExp; mode: PageMode; why: string }[] = [
  { test: /^\/canvas(\/|$)/,            mode: "activity",    why: "🎨 Garden Canvas — วาด ระบายสี ลากเส้น" },
  { test: /^\/studio(\/|$)/,            mode: "editor",      why: "🌱 Garden Studio — พิมพ์ แก้ไขเอกสาร ทำตาราง" },
  { test: /^\/online-classroom(\/|$)/,  mode: "classroom",   why: "💻 ห้องเรียนออนไลน์ — เรียนสด ทำกิจกรรมกับครู" },
  { test: /^\/games\/(?!progress$)[^/]+/, mode: "interactive", why: "🎮 กำลังเล่นเกม — ต้องใช้สมาธิและการตอบสนอง" },
  { test: /^\/worksheets\/[^/]+/,       mode: "activity",    why: "📝 ทำใบงาน — เขียน ลากเส้น จับคู่ ระบายสี" },
  { test: /^\/curriculum\/[^/]+/,       mode: "editor",      why: "📚 อ่าน PDF และจัดโครงสร้างหลักสูตร" },
  { test: /^\/development(\/|$)/,       mode: "editor",      why: "📈 บันทึกพัฒนาการเด็กรายคน" },
  { test: /^\/admin(\/|$)/,             mode: "editor",      why: "👑 จัดการระบบและข้อมูล" },
  { test: /^\/search(\/|$)/,            mode: "interactive", why: "🔍 พิมพ์ค้นหา" },
];

/** หน้านี้ต้องปิดเอฟเฟกต์ไหม */
export function isActivityPath(pathname: string): boolean {
  return ACTIVITY_ROUTES.some((r) => r.test.test(pathname));
}

/** โหมดของหน้า (ใช้แสดงผล/ดีบัก) */
export function pageMode(pathname: string): PageMode {
  const hit = ACTIVITY_ROUTES.find((r) => r.test.test(pathname));
  if (hit) return hit.mode;
  if (pathname === "/") return "landing";
  return "listing";
}

/** เหตุผลที่ปิดเอฟเฟกต์ในหน้านี้ (ถ้าปิด) */
export function activityReason(pathname: string): string | null {
  return ACTIVITY_ROUTES.find((r) => r.test.test(pathname))?.why ?? null;
}
