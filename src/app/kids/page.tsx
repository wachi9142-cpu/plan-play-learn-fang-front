import type { Metadata } from "next";
import { KIDS_ZONE } from "@/lib/site";
import { ZoneHub } from "@/components/layout/ZoneHub";

export const metadata: Metadata = {
  title: "สำหรับเด็ก",
  description: "เกม ใบงาน แฟลชการ์ด นิทาน และกระดาษวาดรูป สำหรับเด็กปฐมวัย",
};

export default function KidsPage() {
  return (
    <ZoneHub
      emoji="🧸"
      title="สำหรับเด็ก"
      description="ทุกอย่างที่เด็ก ๆ เปิดเล่นเองได้ หรือครูเปิดให้ดูหน้าห้อง — เล่น เรียนรู้ และสร้างสรรค์"
      items={KIDS_ZONE}
      tint="bg-pink-soft"
    />
  );
}
