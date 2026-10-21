"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ZONES } from "@/lib/site";
import { getClassMe, isTeacher } from "@/lib/classroom-store";
import { NavIcon } from "@/components/ui/NavIcon";

/**
 * 🧭 การ์ด 4 โซนบนหน้าแรก — บอกตั้งแต่แรกว่าเว็บแบ่งตามใครใช้
 * โซน "ห้องครู" ขึ้นเมื่อเข้าสู่ระบบเป็นครูแล้วเท่านั้น เหมือนในแถบเมนู
 */
export function ZoneCards() {
  const [teacher, setTeacher] = useState(false);
  useEffect(() => { setTeacher(isTeacher(getClassMe())); }, []);
  const zones = ZONES.filter((z) => !z.teacherOnly || teacher);

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {zones.map((zone, i) => (
        <Link
          key={zone.href}
          href={zone.href}
          className="card card-hover animate-rise group flex flex-col p-5"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center gap-4">
            <NavIcon
              emoji={zone.emoji}
              label={zone.label}
              tint={zone.tint}
              className="size-14 text-3xl transition-transform group-hover:-rotate-6 sm:size-16 sm:text-4xl"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-xl text-purple-800 sm:text-2xl">{zone.label}</h3>
              <p className="mt-0.5 text-[14px] leading-snug text-ink-soft">{zone.description}</p>
            </div>
          </div>

          <ul className="mt-3 flex flex-wrap gap-1.5">
            {zone.children?.slice(0, 5).map((c) => (
              <li key={c.href} className="rounded-full bg-cream-dark px-2.5 py-0.5 text-[12px] text-purple-700">
                {c.emoji} {c.label}
              </li>
            ))}
            {(zone.children?.length ?? 0) > 5 && (
              <li className="rounded-full bg-cream-dark px-2.5 py-0.5 text-[12px] text-ink-soft">
                และอีก {(zone.children?.length ?? 0) - 5} รายการ
              </li>
            )}
          </ul>

          <span className="mt-3 inline-flex items-center gap-1 text-[14px] font-medium text-purple-600">
            เปิดโซนนี้ <ArrowRight size={15} className="transition group-hover:translate-x-1" />
          </span>
        </Link>
      ))}
    </div>
  );
}
