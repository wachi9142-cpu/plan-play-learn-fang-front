import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { CORE_ACTIVITIES, getActivitiesByType } from "@/data/core-activities";
import { GAMES } from "@/data/games";
import { PageHeader } from "@/components/ui";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "6 กิจกรรมหลัก" };

export default function CoreActivitiesPage() {
  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader emoji="🎈" title="6 กิจกรรมหลัก" description="รูปแบบการจัดประสบการณ์ 6 กิจกรรมหลักสำหรับเด็กปฐมวัย กดเพื่อดูลักษณะ เป้าหมาย และตัวอย่างกิจกรรมจากแผน" />

      <div className="grid gap-4 md:grid-cols-2">
        {CORE_ACTIVITIES.map((c, i) => {
          const count = getActivitiesByType(c.type).length;
          const games = c.type === "game" ? GAMES.length : 0;
          return (
            <Link key={c.type} href={`/core-activities/${c.type}`} className="card card-hover animate-rise group flex gap-4 p-5" style={{ animationDelay: `${i * 70}ms` }}>
              <span className={cn("grid size-16 shrink-0 place-items-center rounded-2xl text-4xl transition-transform group-hover:-rotate-6", c.tint)}>{c.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-purple-500">กิจกรรมที่ {c.order}</span>
                <span className="block font-display text-lg leading-snug text-purple-800 sm:text-xl">{c.title}</span>
                <span className="mt-1 block text-[15px] text-ink-soft">{c.goal}</span>
                <span className="mt-2 block text-[13px] text-purple-600">
                  {count} กิจกรรมในแผน{games > 0 && ` · 🎮 ${games} เกมออนไลน์`}
                </span>
              </span>
              <ArrowRight size={20} className="shrink-0 self-center text-purple-300 transition group-hover:translate-x-1 group-hover:text-purple-600" />
            </Link>
          );
        })}
      </div>

      <div className="animate-rise delay-6 mt-8 card bg-purple-50 p-5 text-[15px]">
        <p className="font-display text-lg text-purple-800">⭐ “เกมการศึกษา” มี 2 จุด ไม่ซ้ำกันนะคะ</p>
        <ul className="mt-2 space-y-1">
          <li>🧩 <span className="font-medium">กิจกรรมเกมการศึกษา</span> (ในหน้านี้) = หมวดกิจกรรมการจัดประสบการณ์ที่ครูจัดในห้อง</li>
          <li>🎮 <Link href="/games" className="font-medium text-purple-700 underline underline-offset-2">เกมการศึกษา</Link> (เมนูหลัก) = คลังเกมออนไลน์ที่เด็กเข้ามาเล่นบนเว็บได้เลย</li>
        </ul>
        <p className="mt-2 text-ink-soft">เกมออนไลน์แต่ละเกมจึงเชื่อมกับ 📖 แผน → 🧩 กิจกรรมเกมการศึกษา → 🎮 เกมออนไลน์ที่เกี่ยวข้อง</p>
      </div>
    </div>
  );
}
