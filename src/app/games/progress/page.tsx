import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui";
import { GameProgress } from "@/components/games/GameProgress";

export const metadata: Metadata = { title: "พัฒนาการการเล่นเกม" };

export default function GameProgressPage() {
  return (
    <div className="container-page py-6 sm:py-10">
      <Breadcrumb items={[{ label: "เกมการศึกษา", href: "/games" }, { label: "พัฒนาการ / ตั้งค่าระดับ" }]} />
      <h1 className="mt-2 text-3xl">📊 พัฒนาการการเล่นเกม</h1>
      <p className="mb-5 text-[14px] text-ink-soft">สำหรับครู: ดูว่าเด็กเล่นอะไรไปแล้ว ระดับไหน ได้กี่ดาว · กำหนดระดับต่อห้อง/ต่อเด็ก · เปิด-ปิดการปรับความยากอัตโนมัติ</p>
      <GameProgress />
    </div>
  );
}
