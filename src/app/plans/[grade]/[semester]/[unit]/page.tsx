import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { GRADES, findUnit } from "@/data/plans";
import { Breadcrumb, PageHeader, Tag } from "@/components/ui";

type Params = { grade: string; semester: string; unit: string };

export function generateStaticParams(): Params[] {
  return GRADES.flatMap((g) =>
    g.semesters.flatMap((s) => s.months.flatMap((m) => m.units.map((u) => ({ grade: g.id, semester: s.id, unit: u.id })))),
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const p = await params;
  const found = findUnit(p.grade, p.semester, p.unit);
  return { title: found ? `หน่วย ${found.unit.title}` : "ไม่พบหน่วย" };
}

export default async function UnitPage({ params }: { params: Promise<Params> }) {
  const p = await params;
  const found = findUnit(p.grade, p.semester, p.unit);
  if (!found) notFound();
  const { grade, semester, month, unit } = found;

  return (
    <div className="container-page py-8 sm:py-12">
      <Breadcrumb items={[{ label: "แผนการจัดประสบการณ์", href: "/plans" }, { label: `หน่วย ${unit.title}` }]} />

      <PageHeader emoji={unit.emoji} title={`หน่วยการเรียนรู้ “${unit.title}”`} description={unit.description}>
        <div className="flex flex-wrap gap-2">
          <Tag tone="pink">{grade.name}</Tag>
          <Tag tone="purple">{semester.name}</Tag>
          <Tag tone="sky">{month.name}</Tag>
        </div>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        {unit.weeks.map((w, i) => {
          const total = w.days.reduce((n, d) => n + d.activities.length, 0);
          return (
            <Link
              key={w.id}
              href={`/plans/${grade.id}/${semester.id}/${unit.id}/${w.id}`}
              className="card card-hover animate-rise group flex items-center gap-4 p-5"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-purple-600 text-white shadow-soft">
                <span className="text-[11px] leading-none opacity-80">สัปดาห์</span>
                <span className="font-display text-3xl leading-none">{w.number}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg text-purple-800 sm:text-xl">{w.title}</span>
                <span className="block text-[15px] text-ink-soft">{w.summary}</span>
                <span className="mt-1 block text-[13px] text-purple-500">
                  {total > 0 ? `${total} กิจกรรม · จันทร์–ศุกร์` : "ยังไม่ได้ใส่รายละเอียด"}
                </span>
              </span>
              <ArrowRight size={20} className="shrink-0 text-purple-300 transition group-hover:translate-x-1 group-hover:text-purple-600" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
