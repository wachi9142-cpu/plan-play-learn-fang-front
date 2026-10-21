import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { NAV_ITEMS, ZONES } from "@/lib/site";
import { NavIcon } from "@/components/ui/NavIcon";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "ทุกเมนู" };

/** 🧭 หน้ารวมทุกเมนู — แบ่งตาม 4 โซน: โรงเรียน · สำหรับเด็ก · ห้องครู · ของลูกฉัน */
export default function MenuPage() {
  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader
        emoji="🧭"
        title="ทุกเมนู"
        description="เว็บไซต์แบ่งเป็น 4 โซนตามว่าใครใช้ — กดที่ชื่อโซนเพื่อดูหน้ารวมของโซนนั้น"
      />

      <div className="grid gap-10">
        {ZONES.map((zone) => (
          <section key={zone.href}>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-2xl sm:text-3xl">{zone.emoji} {zone.label}</h2>
                <p className="mt-1 text-[14px] text-ink-soft sm:text-[15px]">{zone.description}</p>
              </div>
              <Link href={zone.href} className="tap inline-flex shrink-0 items-center gap-1 text-[15px] font-medium text-purple-700 hover:underline">
                เปิดโซนนี้ <ArrowRight size={16} />
              </Link>
            </div>

            {zone.teacherOnly && (
              <p className="mb-3 rounded-2xl bg-yellow-soft px-4 py-2.5 text-[13px] leading-relaxed text-[#8a6a00]">
                🔒 โซนนี้ไม่ขึ้นในเมนูของผู้ปกครอง — จะเห็นเมื่อเข้าสู่ระบบเป็นครูแล้วเท่านั้น
              </p>
            )}

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              {zone.children?.map((item) => {
                const full = NAV_ITEMS.find((n) => n.href === item.href);
                return (
                  <Link key={zone.href + item.href} href={item.href} className="card card-hover flex items-center gap-2.5 p-3">
                    <NavIcon
                      emoji={item.emoji ?? "•"}
                      image={item.image ?? full?.image}
                      label={item.label}
                      tint={full?.tint ?? zone.tint}
                      className="size-10 rounded-xl! text-xl"
                    />
                    <span className="min-w-0 font-display text-[14px] leading-snug text-purple-800">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
