import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { NavLink } from "@/lib/site";
import { NAV_ITEMS } from "@/lib/site";
import { NavIcon } from "@/components/ui/NavIcon";
import { PageHeader } from "@/components/ui";

/**
 * 🧭 หน้ารวมของแต่ละโซน (โรงเรียน · สำหรับเด็ก · ห้องครู · ของลูกฉัน)
 * ดึงคำอธิบายจาก NAV_ITEMS ให้อัตโนมัติ ถ้าหน้านั้นมีอยู่ในรายการเมนูหลักอยู่แล้ว
 */
export function ZoneHub({ emoji, image, title, description, items, note, tint = "bg-purple-100" }: {
  emoji: string;
  image?: string;
  title: string;
  description: string;
  items: NavLink[];
  note?: string;
  tint?: string;
}) {
  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader emoji={emoji} image={image} title={title} description={description} />

      {note && (
        <p className="card mb-6 border-yellow-accent! p-4 text-[14px] leading-relaxed text-ink">{note}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const full = NAV_ITEMS.find((n) => n.href === item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="card card-hover animate-rise group flex items-center gap-4 p-5"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <NavIcon
                emoji={item.emoji ?? full?.emoji ?? "•"}
                image={item.image ?? full?.image}
                label={item.label}
                tint={full?.tint ?? tint}
                className="size-14 text-3xl transition-transform group-hover:-rotate-6"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg leading-snug text-purple-800">{item.label}</span>
                {full?.description && <span className="mt-0.5 block text-[14px] leading-snug text-ink-soft">{full.description}</span>}
              </span>
              <ArrowRight size={20} className="shrink-0 text-purple-300 transition group-hover:translate-x-1 group-hover:text-purple-600" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
