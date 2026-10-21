import type { Metadata } from "next";
import { CHILD_ZONE } from "@/lib/site";
import { ZoneHub } from "@/components/layout/ZoneHub";

export const metadata: Metadata = {
  title: "ของลูกฉัน",
  description: "ผลงาน พัฒนาการ และห้องเรียนออนไลน์ของลูก สำหรับผู้ปกครอง",
};

export default function MyChildPage() {
  return (
    <ZoneHub
      emoji="👨‍👩‍👧"
      title="ของลูกฉัน"
      description="ติดตามผลงานและพัฒนาการของลูก และเข้าห้องเรียนออนไลน์กับครู"
      items={CHILD_ZONE}
      tint="bg-sky-soft"
    />
  );
}
