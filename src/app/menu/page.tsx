import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { LIBRARY_ITEMS, MENU_ITEMS } from "@/lib/site";
import { PageHeader } from "@/components/ui";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "เมนู" };

export default function MenuPage() {
  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader emoji="📚" title="เมนู" description="หมวดหมู่หลักของเว็บไซต์ ทุกหมวดเชื่อมโยงถึงกัน: กำหนดการสอน → แผน → กิจกรรมหลัก → เกม → ใบงาน" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MENU_ITEMS.map((item, i) => (
          <Link key={item.href} href={item.href} className="card card-hover animate-rise group flex items-center gap-4 p-5" style={{ animationDelay: `${i * 70}ms` }}>
            <span className={cn("grid size-14 shrink-0 place-items-center rounded-2xl text-3xl transition-transform group-hover:-rotate-6", item.tint)}>{item.emoji}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] text-purple-500">{i + 1}.</span>
              <span className="block font-display text-lg leading-snug text-purple-800">{item.label}</span>
              <span className="block text-[14px] text-ink-soft">{item.description}</span>
            </span>
            <ArrowRight size={20} className="shrink-0 text-purple-300 transition group-hover:translate-x-1 group-hover:text-purple-600" />
          </Link>
        ))}
      </div>

      <h2 className="mt-12 mb-4 text-xl sm:text-2xl">🧺 คลังความรู้เพิ่มเติม</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {LIBRARY_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="card card-hover flex items-center gap-3 p-4">
            <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl text-2xl", item.tint)}>{item.emoji}</span>
            <span className="min-w-0 font-display text-[15px] leading-snug text-purple-800">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
