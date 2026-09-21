import Link from "next/link";
import type { Metadata } from "next";
import { GAMES } from "@/data/games";
import { PageHeader, Tag } from "@/components/ui";
import { GameLibrary } from "@/components/games";

export const metadata: Metadata = { title: "เกมการศึกษา" };

export default function GamesPage() {
  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader emoji="🎮" title="เกมการศึกษา" description="คลังเกมออนไลน์สำหรับเด็กอนุบาล 1 เล่นได้เลยบนเว็บไซต์ ทั้งมือถือ แท็บเล็ต และคอมพิวเตอร์">
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="purple">{GAMES.length} เกม</Tag>
          <Tag tone="pink">อนุบาล 1</Tag>
          <Link href="/core-activities/game" className="inline-flex items-center rounded-full bg-yellow-soft px-3 py-0.5 text-[13px] font-medium leading-6 text-[#8a6a00] hover:underline">
            🧩 ดูหมวด “กิจกรรมเกมการศึกษา” ใน 6 กิจกรรมหลัก
          </Link>
        </div>
      </PageHeader>
      <GameLibrary games={GAMES} />
    </div>
  );
}
