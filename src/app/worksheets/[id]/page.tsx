import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { WORKSHEETS, WORKSHEET_CATEGORIES, getWorksheet } from "@/data/worksheets";
import { getGame } from "@/data/games";
import { getGrade, getPlan, getUnit } from "@/data/plans";
import { Breadcrumb, PageHeader, Tag } from "@/components/ui";
import { SheetScaler, WorksheetActions, WorksheetSheet } from "@/components/worksheets";
import { WorksheetCard } from "@/components/worksheets/WorksheetLibrary";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return WORKSHEETS.map((w) => ({ id: w.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return { title: getWorksheet(id)?.title ?? "ไม่พบใบงาน" };
}

export default async function WorksheetDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const w = getWorksheet(id);
  if (!w) notFound();

  const cat = WORKSHEET_CATEGORIES[w.category];
  const grade = getGrade(w.gradeId);
  const plans = w.planIds.map(getPlan).filter((p) => p !== undefined);
  const games = (w.gameIds ?? []).map(getGame).filter((g) => g !== undefined);
  const related = WORKSHEETS.filter((x) => x.id !== w.id && (x.category === w.category || x.planIds.some((p) => w.planIds.includes(p)))).slice(0, 3);
  const idx = WORKSHEETS.findIndex((x) => x.id === w.id);
  const prev = WORKSHEETS[idx - 1];
  const next = WORKSHEETS[idx + 1];

  return (
    <div className="container-page py-8 sm:py-12">
      <Breadcrumb items={[{ label: "ใบงาน", href: "/worksheets" }, { label: w.title }]} />

      <PageHeader emoji={w.emoji} title={w.title} description={w.description}>
        <WorksheetActions worksheet={w} />
      </PageHeader>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ตัวอย่างใบงาน */}
        <section id="preview" className="animate-rise delay-1 min-w-0 scroll-mt-24">
          <h2 className="mb-3 text-lg sm:text-xl">👀 ตัวอย่างใบงาน</h2>
          {w.file ? (
            w.file.type === "pdf" ? (
              <iframe src={w.file.url} title={w.title} className="card h-[70vh] w-full" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={w.file.url} alt={w.title} className="card w-full" />
            )
          ) : (
            <div className="rounded-2xl bg-purple-50 p-3 sm:p-5">
              <SheetScaler><WorksheetSheet worksheet={w} /></SheetScaler>
            </div>
          )}
        </section>

        {/* ข้อมูลใบงาน */}
        <aside className="animate-rise delay-2 space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h2 className="mb-3 text-lg">📋 ข้อมูลใบงาน</h2>
            <dl className="grid gap-y-3 text-[15px]">
              <div><dt className="text-[13px] text-ink-soft">🎯 เหมาะสำหรับ</dt><dd className="flex flex-wrap gap-1.5"><Tag tone="pink">{grade?.name ?? (w.gradeId === "primary" ? "ประถมศึกษา" : w.gradeId === "secondary" ? "มัธยมศึกษา" : w.gradeId)}</Tag><Tag tone="yellow">👶 {w.ages ?? grade?.ages}</Tag></dd></div>
              <div><dt className="text-[13px] text-ink-soft">📚 หมวด</dt><dd><Link href={`/worksheets?cat=${w.category}`} className="hover:underline"><Tag tone="purple">{cat.emoji} {cat.label}</Tag></Link></dd></div>
              <div><dt className="text-[13px] text-ink-soft">✏️ ทักษะ</dt><dd className="mt-0.5 flex flex-wrap gap-1.5">{w.skills.map((s) => <Tag key={s} tone="mint">{s}</Tag>)}</dd></div>
              <div><dt className="text-[13px] text-ink-soft">🏷️ แท็ก</dt><dd className="mt-0.5 flex flex-wrap gap-1.5">{w.tags.map((t) => <Tag key={t} tone="yellow">{t}</Tag>)}</dd></div>
              <div><dt className="text-[13px] text-ink-soft">📄 รูปแบบ</dt><dd>{w.file ? `ไฟล์ ${w.file.type.toUpperCase()}` : "🖨️ พิมพ์จากเว็บได้เลย (A4)"}</dd></div>
            </dl>
          </div>

          <div className="card p-5">
            <h2 className="mb-2 text-lg">👩‍🏫 วิธีใช้สำหรับครู</h2>
            <ol className="space-y-1.5">
              {w.instructions.map((s, i) => (
                <li key={i} className="flex gap-2 text-[15px]"><span className="font-medium text-purple-500">{i + 1}.</span>{s}</li>
              ))}
            </ol>
          </div>

          {games.length > 0 && (
            <div className="card p-5">
              <h2 className="mb-2 text-lg">🎮 เกมที่คู่กับใบงานนี้</h2>
              <p className="mb-2 text-[13px] text-ink-soft">เล่นเกมก่อน แล้วมาทำใบงานในเรื่องเดียวกัน</p>
              <div className="grid gap-1.5">{games.map((g) => <Link key={g.id} href={`/games/${g.id}`} className="tap flex items-center gap-3 rounded-xl bg-cream px-3 py-2 text-[15px] hover:bg-purple-50"><span className="text-xl">{g.emoji}</span><span className="min-w-0 flex-1 truncate text-purple-800">{g.title}</span><span className="text-[12px] text-ink-soft">🟢🟡🔴</span></Link>)}</div>
            </div>
          )}
          {plans.length > 0 && (
            <div className="card p-5">
              <h2 className="mb-2 text-lg">📖 แผนที่เกี่ยวข้อง</h2>
              <div className="grid gap-1.5">
                {plans.map((p) => {
                  const unit = getUnit(p.unitId);
                  return (
                    <Link key={p.id} href={`/plans/${p.id}`} className="tap flex items-center gap-3 rounded-xl bg-cream px-3 py-2 text-[15px] hover:bg-purple-50">
                      <span className="text-xl">{p.emoji}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block leading-snug text-purple-800">เรื่อง {p.title}</span>
                        {unit && <span className="block text-[13px] text-ink-soft">หน่วย {unit.name}</span>}
                      </span>
                      <ArrowRight size={16} className="text-purple-300" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section className="animate-rise delay-3 mt-10">
          <h2 className="mb-4 text-xl sm:text-2xl">📝 ใบงานที่คล้ายกัน</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r, i) => <WorksheetCard key={r.id} w={r} delay={i} />)}
          </div>
        </section>
      )}

      <nav className="mt-10 flex items-stretch justify-between gap-3" aria-label="ใบงานก่อนหน้า / ถัดไป">
        {prev ? (
          <Link href={`/worksheets/${prev.id}`} className="card card-hover tap flex flex-1 items-center gap-2 px-4 py-3 text-[15px] text-purple-700">
            <ChevronLeft size={18} /> <span className="truncate">{prev.emoji} {prev.title}</span>
          </Link>
        ) : <span className="flex-1" />}
        {next ? (
          <Link href={`/worksheets/${next.id}`} className="card card-hover tap flex flex-1 items-center justify-end gap-2 px-4 py-3 text-right text-[15px] text-purple-700">
            <span className="truncate">{next.emoji} {next.title}</span> <ChevronRight size={18} />
          </Link>
        ) : <span className="flex-1" />}
      </nav>
    </div>
  );
}
