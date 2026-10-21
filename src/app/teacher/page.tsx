import type { Metadata } from "next";
import { TEACHER_ZONE } from "@/lib/site";
import { ZoneHub } from "@/components/layout/ZoneHub";

export const metadata: Metadata = {
  title: "ห้องครู",
  description: "แผนการสอน กำหนดการ หลักสูตร Garden Studio และคลังสื่อ สำหรับครู",
};

export default function TeacherPage() {
  return (
    <ZoneHub
      emoji="👩‍🏫"
      title="ห้องครู"
      description="เครื่องมือทำงานของครู — วางแผน ทำสื่อ จัดหลักสูตร และดูแลห้องเรียน"
      items={TEACHER_ZONE}
      note="🔒 โซนนี้ไม่ขึ้นในเมนูของผู้ปกครอง — จะเห็นเมื่อเข้าสู่ระบบเป็นครูแล้วเท่านั้น (ตอนนี้ยังเปิดจากลิงก์ตรงได้ เพราะระบบบัญชีจริงยังไม่เสร็จ)"
    />
  );
}
