/**
 * ผู้ให้บริการ Social Login — เพิ่ม provider ใหม่ = เพิ่ม object ในอาร์เรย์นี้
 * `status: "soon"` = แสดงปุ่มแต่ยังไม่เปิดใช้ (รอเชื่อม backend/OAuth credentials)
 *
 * หมายเหตุ Instagram: ปัจจุบัน Instagram ไม่มี "Login with Instagram" สำหรับเว็บทั่วไปแล้ว
 * (Instagram Basic Display API ถูกยกเลิก ธ.ค. 2024) ทางที่รองรับคือ Facebook Login /
 * Instagram Login สำหรับบัญชีธุรกิจผ่าน Meta — ต้องตรวจสอบ API ปัจจุบันก่อน implement
 */
export interface AuthProvider {
  id: string;
  name: string;
  emoji: string;
  color: string;      // สีปุ่ม
  text: string;       // สีตัวอักษร
  status: "ready" | "soon";
  note?: string;
}

export const AUTH_PROVIDERS: AuthProvider[] = [
  { id: "google", name: "Google / Gmail", emoji: "🔴", color: "#ffffff", text: "#3b2f4a", status: "soon" },
  { id: "facebook", name: "Facebook", emoji: "🔵", color: "#1877f2", text: "#ffffff", status: "soon" },
  { id: "instagram", name: "Instagram", emoji: "📷", color: "linear-gradient(45deg,#f58529,#dd2a7b,#8134af)", text: "#ffffff", status: "soon", note: "ต้องตรวจสอบ API ของ Meta ก่อนเปิดใช้" },
];
