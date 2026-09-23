import Link from "next/link";
import type { Metadata } from "next";
import { eduGames } from "@/data/games";
import { PageHeader, Tag } from "@/components/ui";
import { GameLibrary } from "@/components/games";
import { OfflineGames, NetStatus } from "@/components/games/OfflineGames";
import { CurrentPlayerBar } from "@/components/games/PlayerPicker";

export const metadata: Metadata = { title: "เกมการศึกษา" };

export default function GamesPage() {
  const games = eduGames();
  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader emoji="🧩" image="/games/edu.webp" title="เกมการศึกษา" description="เกมฝึกทักษะ เรียนรู้ผ่านการเล่น และพัฒนาการคิด — มีเป้าหมายทักษะชัดเจน เชื่อมกับหลักสูตร แผนการจัดประสบการณ์ และแฟ้มผลงาน · ทุกเกมเลือกระดับ 🟢 ง่าย · 🟡 ปานกลาง · 🔴 ยาก ได้ก่อนเล่น">
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="purple">{games.length} เกม</Tag>
          <Tag tone="pink">อนุบาล 1–3</Tag>
          <Tag tone="mint">🟢🟡🔴 3 ระดับทุกเกม</Tag>
          <NetStatus />
          <Link href="/games/progress" className="inline-flex items-center rounded-full bg-purple-100 px-3 py-0.5 text-[13px] font-medium leading-6 text-purple-800 hover:underline">📊 พัฒนาการ / ครูตั้งค่าระดับ</Link>
          <Link href="/play" className="inline-flex items-center rounded-full bg-pink-soft px-3 py-0.5 text-[13px] font-medium leading-6 text-purple-800 hover:underline">🎮 อยากเล่นสนุก ๆ ไปที่หมวด “เกม”</Link>
          <Link href="/core-activities/game" className="inline-flex items-center rounded-full bg-yellow-soft px-3 py-0.5 text-[13px] font-medium leading-6 text-[#8a6a00] hover:underline">
            🧩 ดูหมวด “กิจกรรมเกมการศึกษา” ใน 6 กิจกรรมหลัก
          </Link>
        </div>
      </PageHeader>
      <CurrentPlayerBar />
      <OfflineGames />
      <GameLibrary games={games} />
    </div>
  );
}
