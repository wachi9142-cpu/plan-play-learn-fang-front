import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EffectCards, ThemeCards } from "@/components/theme";
import { BackButton } from "@/components/ui/BackButton";

export const metadata: Metadata = {
  title: "ตั้งค่า",
  description: "ธีมการแสดงผล ☀️ 🌙 ⚙️ · เอฟเฟกต์บรรยากาศ ❄️ 🌠 🌸 🍂 และการตั้งค่าอื่น ๆ ของ Little Purple Garden",
};

const SHORTCUTS = [
  { href: "/games/progress", emoji: "🎮", label: "ระดับความยากเกม & ผู้เล่น", hint: "ตั้งระดับ 🟢🟡🔴 · โปรไฟล์ผู้เล่น · ประวัติการเล่น" },
  { href: "/admin", emoji: "👑", label: "ผู้ดูแลระบบ", hint: "ภาพรวมข้อมูล · สำรอง/กู้คืนข้อมูลของเว็บ" },
  { href: "/curriculum", emoji: "📚", label: "หลักสูตรและเอกสาร", hint: "เพิ่ม/ประกาศใช้หลักสูตร · สถานะเผยแพร่" },
];

export default function SettingsPage() {
  return (
    <div className="container-page py-6 sm:py-10">
      <BackButton />
      <header className="mt-3">
        <h1 className="text-3xl sm:text-4xl">⚙️ ตั้งค่า</h1>
        <p className="mt-1 text-[15px] text-ink-soft sm:text-base">ปรับหน้าตาเว็บให้สบายตาที่สุดสำหรับคุณ 💜</p>
      </header>

      <section className="mt-6">
        <h2 className="text-xl sm:text-2xl">💜 ธีมการแสดงผล</h2>
        <p className="mt-1 text-[14px] text-ink-soft">เลือกได้ 3 แบบ — เปลี่ยนเมื่อไหร่ก็ได้ ทุกหน้าในเว็บจะเปลี่ยนตามทันที</p>
        <div className="mt-3"><ThemeCards /></div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl sm:text-2xl">✨ เอฟเฟกต์บรรยากาศ</h2>
        <p className="mt-1 text-[14px] text-ink-soft">ลูกเล่นตามฤดูกาลและเทศกาล — เปิดไว้เมื่อไหร่ก็ได้ ระบบจำค่าไว้ให้เหมือนกับธีม</p>
        <div className="mt-3"><EffectCards /></div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl sm:text-2xl">🔗 ตั้งค่าอื่น ๆ</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SHORTCUTS.map((s) => (
            <Link key={s.href} href={s.href} className="card card-hover flex items-center gap-3 p-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-purple-50 text-2xl">{s.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[16px] text-purple-800">{s.label}</span>
                <span className="block text-[13px] leading-snug text-ink-soft">{s.hint}</span>
              </span>
              <ArrowRight size={18} className="shrink-0 text-purple-400" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
