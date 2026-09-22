import Link from "next/link";
import type { Metadata } from "next";
import { GRADES, SEMESTERS, UNITS, getPlan, getPlansByGrade } from "@/data/plans";
import { SCHEDULES } from "@/data/schedules";
import { PageHeader, Tag } from "@/components/ui";
import { PlanSearch } from "@/components/partials/PlanSearch";

export const metadata: Metadata = { title: "แผนการจัดประสบการณ์ อนุบาล 1" };

export default function PlansPage() {
  const grade = GRADES.find((g) => g.id === "k1")!;
  const plans = getPlansByGrade(grade.id);
  const semesters = SEMESTERS.filter((s) => s.gradeId === grade.id);

  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader
        emoji="📖"
        title={`แผนการจัดประสบการณ์ ${grade.name}`}
        description="รวมแผนทุกเรื่อง ค้นหาได้จากชื่อเรื่อง หน่วย หรือคำสำคัญ กดเพื่อเปิดรายละเอียดแผน"
      >
        <div className="flex flex-wrap gap-2 text-[14px]">
          <Tag tone="purple">{plans.length} เรื่อง</Tag>
          <Link href="/schedules" className="inline-flex items-center rounded-full bg-sky-soft px-3 py-0.5 text-[13px] font-medium leading-6 text-[#2b5c8a] hover:underline">
            📅 ดูกำหนดการสอน ({SCHEDULES.length} ชุด)
          </Link>
        </div>
      </PageHeader>

      {/* 🌱 Garden Studio — สร้างเอกสารใหม่ */}
      <section className="animate-rise mb-10 card bg-gradient-to-r from-mint-soft via-white to-purple-50 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl">🌱 สร้างเอกสารใหม่ใน Garden Studio</h2>
            <p className="text-[14px] text-ink-soft">ห้องสร้างสื่อ — พิมพ์ จัดรูปแบบ เพิ่มตาราง/รูป บันทึกอัตโนมัติ และเชื่อมกับแผน/กำหนดการ</p>
          </div>
          <Link href="/studio" className="text-[14px] font-medium text-purple-700 hover:underline">เปิด Garden Studio →</Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Link href="/studio?type=plan" className="card card-hover flex items-center gap-3 p-4"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-purple-100 text-2xl">📄</span><span className="font-display text-[15px] text-purple-800">สร้างแผนการจัดประสบการณ์</span></Link>
          <Link href="/studio?type=schedule" className="card card-hover flex items-center gap-3 p-4"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-sky-soft text-2xl">📅</span><span className="font-display text-[15px] text-purple-800">สร้างกำหนดการสอน</span></Link>
          <Link href="/studio?type=other" className="card card-hover flex items-center gap-3 p-4"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-yellow-soft text-2xl">📋</span><span className="font-display text-[15px] text-purple-800">สร้างเอกสาร/แบบฟอร์มอื่น ๆ</span></Link>
        </div>
      </section>

      <section className="animate-rise delay-1 mb-12">
        <h2 className="mb-4 text-xl sm:text-2xl">🔎 ค้นหาแผน</h2>
        <PlanSearch plans={plans} units={UNITS} />
      </section>

      <section className="animate-rise delay-2">
        <h2 className="mb-4 text-xl sm:text-2xl">🗓️ เลือกดูตามภาคเรียน → เดือน</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {semesters.map((sem) => (
            <div key={sem.id} className="card p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <p className="font-display text-lg text-purple-800">{sem.name}</p>
                <Tag tone="purple">{sem.year}</Tag>
              </div>
              <ul className="divide-y divide-line">
                {sem.months.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                    <span className="w-24 shrink-0 text-[15px] text-ink-soft">📅 {m.name}</span>
                    <span className="flex flex-wrap gap-1.5">
                      {m.planIds.map((id) => {
                        const p = getPlan(id);
                        return p ? (
                          <Link key={id} href={`/plans/${p.id}`} className="tap inline-flex items-center gap-1 rounded-full bg-cream px-3 py-1 text-[15px] text-purple-800 hover:bg-purple-100">
                            {p.emoji} เรื่องที่ {p.number} {p.title}
                          </Link>
                        ) : null;
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
