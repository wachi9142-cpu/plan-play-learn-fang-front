import { TeacherGate } from "@/components/teacher/TeacherGate";

/** 🔒 หน้าในโซนนี้สำหรับครู — ต้องเข้าสู่ระบบครูก่อน */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <TeacherGate>{children}</TeacherGate>;
}
