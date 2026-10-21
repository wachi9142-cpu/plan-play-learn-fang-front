import type { Metadata } from "next";
import { DailyParent } from "@/components/care/DailyParent";

export const metadata: Metadata = {
  title: "สมุดสื่อสารประจำวัน",
  description: "วันนี้ลูกกินข้าวไหม นอนกี่โมง อารมณ์เป็นอย่างไร — ครูบันทึกให้ทุกวัน",
};

export default function Page() {
  return <DailyParent />;
}
