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
      note="🔒 โซนนี้สำหรับครู — ต้องเข้าสู่ระบบครูก่อนจึงจะเปิดได้ (เพิ่มบัญชีครูคนอื่นได้ในหน้าผู้ดูแลระบบ)"
    />
  );
}
