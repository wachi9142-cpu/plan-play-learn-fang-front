import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { GRADES, PLANS } from "@/data/plans";
import { GAMES } from "@/data/games";
import { WORKSHEETS } from "@/data/worksheets";
import { PROJECTS } from "@/data/projects";
import { SITE } from "@/lib/site";
import { PageHeader } from "@/components/ui";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "เกี่ยวกับ" };

export default function AboutPage() {
  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader emoji="📖" title="เกี่ยวกับ Little Purple Garden" description="เว็บไซต์รวบรวมแผนการสอน กิจกรรม เกมการศึกษา และใบงานสำหรับเด็กปฐมวัย" />

      <section className="animate-rise card grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-8">
        <Image src="/logo.webp" alt="Little Purple Garden" width={200} height={200} className="mx-auto size-40 rounded-full bg-white object-cover shadow-soft sm:size-48" />
        <div>
          <p className="font-display text-2xl text-purple-800">💜 {SITE.brand}</p>
          <p className="text-[15px] text-ink-soft">{SITE.credit} · 🌱 {SITE.motto}</p>
          <dl className="mt-4 grid gap-3 text-[15px]">
            <div><dt className="font-medium text-purple-700">Little Purple Garden = “สวนสีม่วงเล็ก ๆ”</dt><dd className="text-ink-soft">เปรียบเหมือนพื้นที่ที่เด็ก ๆ ได้เติบโตและเรียนรู้ผ่านการเล่น 🌱</dd></div>
            <div><dt className="font-medium text-purple-700">Teacher Kaowfang</dt><dd className="text-ink-soft">ตัวตนของผู้สร้างและดูแลพื้นที่นี้ — ครูปฐมวัยที่อยากให้การเรียนรู้เป็นเรื่องสนุก</dd></div>
            <div><dt className="font-medium text-purple-700">Play • Learn • Grow</dt><dd className="text-ink-soft">เล่น → เรียนรู้ → เติบโต</dd></div>
          </dl>
        </div>
      </section>

      <section className="animate-rise delay-1 card mt-6 bg-purple-50 p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl">🌱 วิสัยทัศน์</h2>
        <p className="mt-2 text-base leading-relaxed sm:text-lg">“{SITE.vision}”</p>
      </section>

      <section className="mt-10">
        <h2 className="mb-2 text-xl sm:text-2xl">🎓 การจัดการเรียนรู้ระดับปฐมวัย</h2>
        <p className="mb-5 text-[15px] text-ink-soft">เลือกระดับชั้นเพื่อดูแนวทางการจัดประสบการณ์ จุดเน้นพัฒนาการ และเนื้อหาที่มีในเว็บสำหรับระดับนั้น</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GRADES.map((g, i) => {
            const n = PLANS.filter((p) => p.gradeId === g.id).length + GAMES.filter((x) => x.gradeId === g.id).length + WORKSHEETS.filter((w) => w.gradeId === g.id).length + PROJECTS.filter((p) => p.gradeId === g.id).length;
            return (
              <Link key={g.id} href={`/about/${g.id}`} className="card card-hover animate-rise group flex flex-col p-5" style={{ animationDelay: `${i * 80}ms` }}>
                <span className={cn("grid size-16 place-items-center rounded-2xl text-4xl transition-transform group-hover:-rotate-6", g.tint)}>{g.emoji}</span>
                <h3 className="mt-3 text-xl">{g.name}</h3>
                <p className="text-[13px] text-purple-500">อายุ {g.ages}</p>
                <p className="mt-2 flex-1 text-[14px] text-ink-soft">{g.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[14px] font-medium text-purple-600">
                  {n > 0 ? `${n} รายการในเว็บ` : "เร็ว ๆ นี้"} <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
