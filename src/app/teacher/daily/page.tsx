import type { Metadata } from "next";
import { DailyTeacher } from "@/components/care/DailyTeacher";

export const metadata: Metadata = {
  title: "สมุดสื่อสารประจำวัน (ครู)",
  description: "บันทึกว่าวันนี้เด็กแต่ละคนเป็นอย่างไร ให้ผู้ปกครองเปิดดูตอนเย็น",
};

export default function Page() {
  return <DailyTeacher />;
}
