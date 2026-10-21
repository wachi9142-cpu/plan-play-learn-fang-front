import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PENDING_GROUPS, PENDING_STATUS, pendingStats } from "@/data/pending";
import { PageHeader, Tag } from "@/components/ui";
import { BackButton } from "@/components/ui/BackButton";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "สิ่งที่รอครูเติม",
  description: "รวมทุกจุดในเว็บที่ยังขาดข้อมูลจริง พร้อมลิงก์กดไปดูหน้านั้นได้เลย",
};

/** 📋 หน้ารวมสิ่งที่รอครูเติม — ครูเปิดดูได้ตลอดว่าเหลืออะไร ไม่ต้องเปิดไฟล์เอกสาร */
export default function TeacherTodoPage() {
  const s = pendingStats();
  const pct = Math.round((s.done / s.total) * 100);

  return (
    <div className="container-page py-8 sm:py-12">
      <BackButton fallback="/teacher" label="ห้องครู" />
      <PageHeader
        emoji="📋"
        title="สิ่งที่รอครูเติม"
        description="ทุกจุดในเว็บที่ยังไม่มีข้อมูลจริง รวมไว้หน้าเดียว กดที่รายการเพื่อไปดูหน้านั้นได้เลย"
      >
        <div className="flex flex-wrap gap-2">
          <Tag tone="mint">✅ ได้แล้ว {s.done}</Tag>
          <Tag tone="sky">👀 รอครูตรวจ {s.review}</Tag>
          <Tag tone="yellow">⬜ รอข้อมูล {s.waiting}</Tag>
          {s.priority > 0 && <Tag tone="pink">⭐ อยากได้ก่อน {s.priority}</Tag>}
        </div>
      </PageHeader>

      {/* ความคืบหน้า */}
      <div className="card mb-8 p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg">ความคืบหน้าข้อมูลจริง</h2>
            <p className="text-[14px] text-ink-soft">ได้ข้อมูลแล้ว {s.done} จาก {s.total} รายการ</p>
          </div>
          <span className="font-display text-3xl text-purple-700">{pct}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-cream-dark">
          <div className="h-full rounded-full bg-purple-400 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-3 rounded-2xl bg-mint-soft px-4 py-2.5 text-[14px] leading-relaxed text-ink">
          💡 ไม่ต้องรีบและไม่ต้องให้ครบทีเดียวนะคะ — บอกมาทีละข้อก็แก้ให้ทันที
          ทุกจุดที่ยังไม่มีข้อมูลจริง เว็บจะขึ้นว่า “สอบถามครู” แทน ไม่แสดงตัวเลขมั่ว
        </p>
      </div>

      {/* ⭐ อยากได้ก่อน */}
      {s.priority > 0 && (
        <section className="card mb-8 border-pink-accent! p-5">
          <h2 className="text-lg">⭐ ถ้าให้เลือกมาก่อน 1 ชุด เอาข้อพวกนี้</h2>
          <p className="mt-0.5 text-[14px] text-ink-soft">เป็นข้อที่ผู้ปกครองสะดุดที่สุดเวลาเข้าเว็บ</p>
          <ul className="mt-3 grid gap-2">
            {PENDING_GROUPS.flatMap((g) => g.items.filter((i) => i.priority && i.status !== "done").map((i) => ({ g, i }))).map(({ g, i }) => (
              <li key={i.id}>
                <Link href={i.href ?? "#"} className="tap flex items-start gap-3 rounded-2xl bg-pink-soft px-4 py-3 transition hover:brightness-95">
                  <span className="text-xl">{g.emoji}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[15px] text-purple-800">{i.title}</span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-ink">{i.detail}</span>
                  </span>
                  <ArrowRight size={16} className="mt-1 shrink-0 text-[#a8456c]" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* รายการทั้งหมด แยกตามหมวด */}
      <div className="grid gap-8">
        {PENDING_GROUPS.map((g) => {
          const left = g.items.filter((i) => i.status !== "done").length;
          return (
            <section key={g.id}>
              <div className="mb-3">
                <h2 className="text-2xl sm:text-3xl">{g.emoji} {g.label}</h2>
                <p className="mt-0.5 text-[14px] text-ink-soft">
                  {g.hint} · {left === 0 ? "ครบแล้วทุกข้อ 🎉" : `เหลืออีก ${left} ข้อ`}
                </p>
              </div>

              <ul className="grid gap-2">
                {g.items.map((i) => {
                  const st = PENDING_STATUS[i.status];
                  const Row = (
                    <span className="flex items-start gap-3">
                      <span className="shrink-0 text-lg leading-6">{st.emoji}</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className={cn("font-display text-[15px]", i.status === "done" ? "text-ink-soft" : "text-purple-800")}>
                            {i.title}
                          </span>
                          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", st.tint, st.text)}>{st.label}</span>
                          {i.priority && i.status !== "done" && (
                            <span className="rounded-full bg-pink-soft px-2 py-0.5 text-[11px] font-medium text-[#a8456c]">⭐ อยากได้ก่อน</span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-soft">{i.detail}</span>
                        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-ink-soft">
                          {i.doneAt && <span>📅 ครูให้ข้อมูล {i.doneAt}</span>}
                          {i.file && <code className="rounded bg-cream-dark px-1.5 py-0.5">{i.file}</code>}
                        </span>
                      </span>
                      {i.href && <ArrowRight size={16} className="mt-1 shrink-0 text-purple-300" />}
                    </span>
                  );
                  return (
                    <li key={i.id}>
                      {i.href ? (
                        <Link href={i.href} className="card card-hover block p-4">{Row}</Link>
                      ) : (
                        <div className="card p-4">{Row}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <p className="mt-10 text-center text-[13px] text-ink-soft">
        หน้านี้คู่กับไฟล์ <code className="rounded bg-cream-dark px-1.5 py-0.5">docs/05-รอข้อมูลจริง.md</code> — แก้ที่ <code className="rounded bg-cream-dark px-1.5 py-0.5">src/data/pending.ts</code>
      </p>
    </div>
  );
}
