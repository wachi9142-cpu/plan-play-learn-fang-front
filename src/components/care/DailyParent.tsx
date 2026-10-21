"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ClassMember } from "@/types/classroom";
import type { DailyReport } from "@/types/care";
import { CLASS_EVENT, listMembers, listRooms } from "@/lib/classroom-store";
import { CARE_EVENT, MEAL_AMOUNTS, MEAL_SLOTS, MOODS, historyOf } from "@/lib/care-store";
import { PageHeader, Tag } from "@/components/ui";
import { BackButton } from "@/components/ui/BackButton";
import { cn } from "@/lib/cn";

const thaiDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  const days = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
  const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  return `วัน${days[d.getDay()]}ที่ ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
};

/** 📔 สมุดสื่อสารประจำวัน — ฝั่งผู้ปกครอง ดูของลูกตัวเอง */
export function DailyParent() {
  const [kids, setKids] = useState<ClassMember[]>([]);
  const [childId, setChildId] = useState("");
  const [v, setV] = useState(0);

  useEffect(() => {
    const sync = () => {
      const all = listRooms().flatMap((r) => listMembers(r.id)).filter((m) => m.role === "child");
      setKids(all);
      setChildId((cur) => cur || all[0]?.id || "");
    };
    sync();
    window.addEventListener(CLASS_EVENT, sync);
    const bump = () => setV((n) => n + 1);
    window.addEventListener(CARE_EVENT, bump);
    return () => { window.removeEventListener(CLASS_EVENT, sync); window.removeEventListener(CARE_EVENT, bump); };
  }, []);

  const child = kids.find((k) => k.id === childId);
  const history = useMemo(() => (childId ? historyOf(childId, 30) : []), [childId, v]);

  return (
    <div className="container-page py-8 sm:py-12">
      <BackButton fallback="/my-child" label="ของลูกฉัน" />
      <PageHeader
        emoji="📔"
        title="สมุดสื่อสารประจำวัน"
        description="วันนี้ลูกกินข้าวไหม นอนกี่โมง อารมณ์เป็นยังไง — ครูบันทึกให้ทุกวัน"
      >
        {child && (
          <div className="flex flex-wrap gap-2">
            <Tag tone="purple">👧 {child.name}</Tag>
            <Tag tone="sky">📔 {history.length} วัน</Tag>
          </div>
        )}
      </PageHeader>

      {kids.length === 0 ? (
        <p className="card p-6 text-center text-[15px] leading-relaxed text-ink-soft">
          ยังไม่มีรายชื่อเด็กในระบบค่ะ — ครูต้องสร้างห้องเรียนและเพิ่มชื่อลูกก่อนที่หน้า{" "}
          <Link href="/online-classroom" className="font-medium text-purple-700 hover:underline">ห้องเรียนออนไลน์</Link>
        </p>
      ) : (
        <>
          {kids.length > 1 && (
            <div className="card mb-5 p-4">
              <p className="mb-1.5 text-[13px] text-ink-soft">👧 เลือกลูก</p>
              <div className="flex flex-wrap gap-1.5">
                {kids.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => setChildId(k.id)}
                    aria-pressed={childId === k.id}
                    className={cn(
                      "tap rounded-full px-4 py-1.5 text-[14px] font-medium transition",
                      childId === k.id ? "bg-purple-600 text-white! shadow-soft" : "bg-cream-dark text-purple-700 hover:brightness-95",
                    )}
                  >
                    {k.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {history.length === 0 ? (
            <p className="card p-6 text-center text-[15px] leading-relaxed text-ink-soft">
              ยังไม่มีบันทึกของ {child?.name} ค่ะ — ครูจะบันทึกให้ตอนเย็นของแต่ละวัน
            </p>
          ) : (
            <div className="grid gap-3">
              {history.map((r, i) => <ReportCard key={r.id} r={r} latest={i === 0} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ReportCard({ r, latest }: { r: DailyReport; latest: boolean }) {
  const mood = MOODS.find((m) => m.id === r.mood);
  const amount = (a?: string) => MEAL_AMOUNTS.find((m) => m.id === a);

  return (
    <article className={cn("card animate-rise p-5", latest && "border-purple-300!")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg">{thaiDate(r.date)}</h2>
        {latest && <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[12px] font-medium text-purple-800">ล่าสุด</span>}
      </div>

      {mood && (
        <p className="mt-2 rounded-2xl bg-purple-50 px-4 py-2.5 text-[15px] text-ink">
          <span className="text-xl">{mood.emoji}</span> วันนี้อารมณ์ <b className="text-purple-800">{mood.label}</b>
        </p>
      )}

      {/* มื้ออาหาร */}
      <dl className="mt-3 grid gap-2 sm:grid-cols-3">
        {MEAL_SLOTS.map((s) => {
          const a = amount(r.meals?.[s.id]);
          return (
            <div key={s.id} className={cn("rounded-2xl px-3 py-2", a?.tint ?? "bg-cream-dark")}>
              <dt className="text-[12px] text-ink-soft">{s.emoji} {s.label}</dt>
              <dd className="mt-0.5 text-[14px] font-medium text-purple-800">{a ? `${a.emoji} ${a.label}` : "— ไม่ได้บันทึก"}</dd>
            </div>
          );
        })}
      </dl>

      <dl className="mt-2 grid gap-2 sm:grid-cols-2">
        <div className="rounded-2xl bg-cream-dark px-3 py-2">
          <dt className="text-[12px] text-ink-soft">😴 นอนกลางวัน</dt>
          <dd className="mt-0.5 text-[14px] font-medium text-purple-800">{r.nap || "— ไม่ได้บันทึก"}</dd>
        </div>
        <div className="rounded-2xl bg-cream-dark px-3 py-2">
          <dt className="text-[12px] text-ink-soft">🚻 เข้าห้องน้ำหนัก</dt>
          <dd className="mt-0.5 text-[14px] font-medium text-purple-800">
            {r.poop === "yes" ? "✅ ถ่ายปกติ" : r.poop === "no" ? "➖ ยังไม่ถ่าย" : "— ไม่ได้บันทึก"}
          </dd>
        </div>
      </dl>

      {r.activities && r.activities.length > 0 && (
        <div className="mt-3">
          <p className="text-[13px] font-medium text-purple-700">🎨 วันนี้ทำอะไรบ้าง</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {r.activities.map((a) => (
              <span key={a} className="rounded-full bg-mint-soft px-2.5 py-0.5 text-[13px] text-[#1f6b4d]">{a}</span>
            ))}
          </div>
        </div>
      )}

      {r.bring && r.bring.length > 0 && (
        <p className="mt-3 rounded-2xl bg-yellow-soft px-4 py-2.5 text-[14px] text-ink">
          🎒 <b className="text-[#8a6a00]">พรุ่งนี้ขอให้เตรียมมา:</b> {r.bring.join(" · ")}
        </p>
      )}

      {r.note && (
        <p className="mt-2 rounded-2xl bg-pink-soft px-4 py-2.5 text-[14px] leading-relaxed text-ink">
          💬 {r.note}
        </p>
      )}

      {/* ชวนคุยกับลูกที่บ้าน */}
      {r.activities && r.activities.length > 0 && (
        <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
          💡 กลับบ้านลองถามลูกดูนะคะว่า “วันนี้{r.activities[0]}เป็นยังไงบ้าง?”
        </p>
      )}
    </article>
  );
}
