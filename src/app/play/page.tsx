import Link from "next/link";
import type { Metadata } from "next";
import { funGames } from "@/data/games";
import { PageHeader, Tag } from "@/components/ui";
import { GameLibrary } from "@/components/games";
import { NetStatus } from "@/components/games/OfflineGames";
import { CurrentPlayerBar } from "@/components/games/PlayerPicker";

export const metadata: Metadata = {
  title: "เกม",
  description: "เกมและกิจกรรมออนไลน์ เล่นสนุก สำรวจ และสร้างสรรค์ — สำหรับเด็ก ๆ Little Purple Garden",
};

/** กิจกรรมสนุก ๆ ที่ไม่ใช่เกมในคลัง แต่เล่นได้จริงบนเว็บ */
const PLAY_LINKS = [
  { href: "/canvas", emoji: "🎨", label: "ระบายสี & วาดรูปออนไลน์", hint: "Garden Canvas — วาดคนเดียวหรือชวนเพื่อนมาวาดด้วยกันแบบ real-time", tint: "bg-pink-soft" },
  { href: "/media", emoji: "🎵", label: "เพลงและนิทาน", hint: "ฟังเพลง ดูนิทาน และสื่อสนุก ๆ ของห้องเรา", tint: "bg-yellow-soft" },
  { href: "/library/kids", emoji: "🧸", label: "มุมหนังสือเด็ก", hint: "อ่าน ฟัง และทำกิจกรรมต่อยอดจากนิทาน", tint: "bg-mint-soft" },
  { href: "/settings", emoji: "❄️", label: "กิจกรรมตามเทศกาล", hint: "เปิดโหมดฤดูหนาวให้หิมะตกทั่วเว็บ — เปลี่ยนตามเทศกาลได้เรื่อย ๆ", tint: "bg-sky-soft" },
];

export default function PlayPage() {
  const games = funGames();
  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader emoji="🎮" title="เกม" description="เกมและกิจกรรมออนไลน์ เล่นสนุก สำรวจ และสร้างสรรค์ — เล่นได้เลยบนเว็บ ทั้งมือถือ แท็บเล็ต และคอมพิวเตอร์">
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="purple">{games.length} เกม</Tag>
          <Tag tone="pink">เล่นสนุก ไม่ต้องผูกกับแผนการสอน</Tag>
          <NetStatus />
          <Link href="/games" className="inline-flex items-center rounded-full bg-purple-100 px-3 py-0.5 text-[13px] font-medium leading-6 text-purple-800 hover:underline">
            🧩 อยากฝึกทักษะ ไปที่ “เกมการศึกษา”
          </Link>
        </div>
      </PageHeader>

      <CurrentPlayerBar />

      <section>
        <h2 className="text-xl sm:text-2xl">🪄 กิจกรรมสร้างสรรค์</h2>
        <p className="mt-1 text-[14px] text-ink-soft">เล่น วาด ฟัง และลองทำ — ไม่มีถูกผิด ไม่มีคะแนน</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {PLAY_LINKS.map((p) => (
            <Link key={p.href} href={p.href} className="card card-hover flex items-center gap-3 p-4">
              <span className={`grid size-14 shrink-0 place-items-center rounded-2xl text-3xl ${p.tint}`}>{p.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[16px] text-purple-800">{p.label}</span>
                <span className="block text-[13px] leading-snug text-ink-soft">{p.hint}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl sm:text-2xl">🎈 เกมเล่นสนุก</h2>
        <p className="mt-1 text-[14px] text-ink-soft">จิ๊กซอว์ · จับคู่ · ทายสัตว์ · หาของ — เลือกระดับได้เหมือนกัน แต่เล่นเพื่อความสนุกเป็นหลัก</p>
        <div className="mt-3"><GameLibrary games={games} /></div>
      </section>
    </div>
  );
}
