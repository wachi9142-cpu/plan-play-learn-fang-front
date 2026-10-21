"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Allergy, LunchWeek } from "@/types/care";
import { CARE_EVENT, DAY_NAMES, currentWeek, listAllergies, listWeeks } from "@/lib/care-store";
import { PageHeader, Tag } from "@/components/ui";
import { cn } from "@/lib/cn";

/** 🍚 เมนูอาหารประจำสัปดาห์ — หน้าที่ผู้ปกครองเปิดดู */
export function LunchPublic() {
  const [week, setWeek] = useState<LunchWeek | undefined>();
  const [all, setAll] = useState<LunchWeek[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => { setWeek(currentWeek()); setAll(listWeeks()); setAllergies(listAllergies()); setReady(true); };
    sync();
    window.addEventListener(CARE_EVENT, sync);
    return () => window.removeEventListener(CARE_EVENT, sync);
  }, []);

  const today = new Date().getDay();   // 0 = อาทิตย์

  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader
        emoji="🍚"
        title="เมนูอาหารประจำสัปดาห์"
        description="อาหารกลางวันและอาหารว่างของเด็ก ๆ ที่โรงเรียน — ครูอัปเดตล่วงหน้าทั้งสัปดาห์"
      >
        <div className="flex flex-wrap gap-2">
          {week && <Tag tone="yellow">📅 {week.label}</Tag>}
          {allergies.length > 0 && <Tag tone="pink">⚠️ มีเด็กแพ้อาหาร {allergies.length} คน</Tag>}
        </div>
      </PageHeader>

      {!ready ? null : !week ? (
        <p className="card p-6 text-center text-[15px] leading-relaxed text-ink-soft">
          ยังไม่มีเมนูอาหารค่ะ — ครูใส่เมนูได้ที่หน้า{" "}
          <Link href="/teacher/lunch" className="font-medium text-purple-700 hover:underline">เมนูอาหารและของแพ้</Link>
        </p>
      ) : (
        <>
          <div className="grid gap-3">
            {week.days.map((d) => {
              const isToday = d.day === today;
              const empty = !d.snackAm && !d.lunch && !d.snackPm;
              return (
                <article
                  key={d.day}
                  className={cn("card animate-rise p-4 sm:p-5", isToday && "border-purple-300! bg-purple-50")}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg">วัน{DAY_NAMES[d.day]}</h2>
                    {isToday && <span className="rounded-full bg-purple-600 px-2.5 py-0.5 text-[12px] font-medium text-white!">วันนี้</span>}
                  </div>
                  {empty ? (
                    <p className="mt-2 text-[14px] text-ink-soft">ยังไม่ได้ใส่เมนูของวันนี้</p>
                  ) : (
                    <dl className="mt-2 grid gap-2 sm:grid-cols-3">
                      {([["snackAm", "🍎 ว่างเช้า"], ["lunch", "🍚 อาหารกลางวัน"], ["snackPm", "🥛 ว่างบ่าย"]] as const).map(([f, label]) => (
                        <div key={f} className="rounded-2xl bg-cream-dark px-3 py-2">
                          <dt className="text-[12px] text-ink-soft">{label}</dt>
                          <dd className="mt-0.5 text-[15px] font-medium text-purple-800">{d[f] || "—"}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </article>
              );
            })}
          </div>

          {week.note && (
            <p className="mt-4 rounded-2xl bg-mint-soft px-4 py-3 text-[14px] leading-relaxed text-ink">💡 {week.note}</p>
          )}

          {allergies.length > 0 && (
            <section className="card mt-8 border-pink-accent! p-5">
              <h2 className="text-lg">⚠️ เด็กที่แพ้อาหาร</h2>
              <p className="mt-0.5 text-[14px] text-ink-soft">ครูจะจัดอาหารทดแทนให้ และเฝ้าระวังเป็นพิเศษในมื้อนั้น</p>
              <ul className="mt-3 grid gap-2">
                {allergies.map((a) => (
                  <li key={a.childId} className={cn("rounded-2xl px-4 py-2.5 text-[14px]", a.severity === "severe" ? "bg-pink-soft" : "bg-yellow-soft")}>
                    <b className="text-purple-800">{a.childName}</b>
                    <span className="text-ink"> — {a.severity === "severe" ? "🚨 แพ้รุนแรง: " : "⚠️ แพ้: "}{a.items.join(" · ")}</span>
                    {a.note && <span className="block text-[13px] text-ink-soft">{a.note}</span>}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
                💬 ถ้าลูกแพ้อะไรเพิ่มเติม แจ้งครูได้เลยนะคะ เพื่อความปลอดภัยของเด็ก ๆ
              </p>
            </section>
          )}

          {all.length > 1 && (
            <p className="mt-6 text-center text-[13px] text-ink-soft">
              มีเมนูทั้งหมด {all.length} สัปดาห์ในระบบ — หน้านี้แสดงสัปดาห์ปัจจุบัน
            </p>
          )}
        </>
      )}
    </div>
  );
}
