import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays } from "lucide-react";
import { PLANS, ACTIVITY_META, countPlanActivities, getGrade, getPlan, getUnit } from "@/data/plans";
import { LEARNING_ACTIVITIES, TEACHING_MEDIA } from "@/data/content";
import { getWorksheetsForPlan } from "@/data/worksheets";
import { getProjectsForPlan } from "@/data/projects";
import { getSchedulesForPlan } from "@/data/schedules";
import { getGamesForPlan } from "@/data/games";
import { Breadcrumb, PageHeader, Tag } from "@/components/ui";

type Params = { plan: string };

export function generateStaticParams(): Params[] {
  return PLANS.map((p) => ({ plan: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { plan: id } = await params;
  const p = getPlan(id);
  return { title: p ? `เรื่อง ${p.title}` : "ไม่พบแผน" };
}

export default async function PlanDetailPage({ params }: { params: Promise<Params> }) {
  const { plan: id } = await params;
  const plan = getPlan(id);
  if (!plan) notFound();

  const grade = getGrade(plan.gradeId);
  const unit = getUnit(plan.unitId);
  const total = countPlanActivities(plan);

  // ข้อมูลที่เชื่อมโยงกัน (อ้างด้วย id)
  const media = TEACHING_MEDIA.filter((m) => plan.related?.mediaIds?.includes(m.id));
  const worksheets = getWorksheetsForPlan(plan.id);
  const activities = LEARNING_ACTIVITIES.filter((a) => plan.related?.activityIds?.includes(a.id));
  const projects = getProjectsForPlan(plan.id);
  const schedules = getSchedulesForPlan(plan.id);
  const games = getGamesForPlan(plan.id);

  return (
    <div className="container-page py-8 sm:py-12">
      <Breadcrumb items={[{ label: `แผนการจัดประสบการณ์ ${grade?.name ?? ""}`, href: "/plans" }, { label: `เรื่อง ${plan.title}` }]} />

      <PageHeader emoji={plan.emoji} title={`เรื่องที่ ${plan.number} : ${plan.title}`} description={plan.description}>
        <div className="flex flex-wrap gap-2">
          {grade && <Tag tone="pink">{grade.name}</Tag>}
          {unit && <Tag tone="yellow">หน่วย {unit.name}</Tag>}
          {plan.strand && <Tag tone="purple">สาระ: {plan.strand}</Tag>}
          <Tag tone="sky">{plan.duration}</Tag>
          {total > 0 && <Tag tone="mint">{total} กิจกรรม</Tag>}
        </div>
      </PageHeader>

      {/* อยู่ในกำหนดการสอนชุดไหน */}
      {schedules.length > 0 && (
        <p className="animate-rise mb-8 flex flex-wrap items-center gap-2 rounded-2xl bg-sky-soft px-4 py-3 text-[15px]">
          <CalendarDays size={18} className="text-[#2b5c8a]" />
          <span>อยู่ใน</span>
          {schedules.map((s) => {
            const row = s.rows.find((r) => r.planId === plan.id);
            return (
              <Link key={s.id} href={`/schedules/${s.id}`} className="font-medium text-[#2b5c8a] underline-offset-2 hover:underline">
                {s.title}{row ? ` (สัปดาห์ที่ ${row.week} · ${row.dates})` : ""}
              </Link>
            );
          })}
        </p>
      )}

      {plan.objectives.length === 0 && (
        <p className="animate-rise mb-6 rounded-2xl bg-yellow-soft px-4 py-3 text-[15px]">
          🌱 แผนนี้ยังเป็นโครงร่าง — คุณครูสามารถเติมจุดประสงค์ สาระ กิจกรรม สื่อ และการประเมินได้ในภายหลัง
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Panel emoji="🎯" title="จุดประสงค์" delay={1}><Bullets items={plan.objectives} /></Panel>
        <Panel emoji="📚" title="สาระการเรียนรู้" delay={2}><Bullets items={plan.content} /></Panel>
        <Panel emoji="🧺" title="สื่อ / อุปกรณ์" delay={3}>
          {plan.materials.length === 0 ? <p className="text-[15px] text-ink-soft">— ยังไม่ได้ระบุ —</p> : <div className="flex flex-wrap gap-1.5">{plan.materials.map((m) => <Tag key={m} tone="yellow">{m}</Tag>)}</div>}
        </Panel>
        <Panel emoji="📋" title="การประเมิน" delay={4}><Bullets items={plan.assessment} mark="✓" /></Panel>
      </div>

      {/* กิจกรรม: แยกตามสัปดาห์ */}
      <section className="animate-rise delay-5 mt-10">
        <h2 className="mb-4 text-xl sm:text-2xl">🧸 กิจกรรม — แยกตามสัปดาห์</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {plan.weeks.map((w) => {
            const n = w.days.reduce((s, d) => s + d.activities.length, 0);
            const types = Array.from(new Set(w.days.flatMap((d) => d.activities.map((a) => a.type))));
            return (
              <Link key={w.id} href={`/plans/${plan.id}/${w.id}`} className="card card-hover group flex items-center gap-4 p-5">
                <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-purple-600 text-white shadow-soft">
                  <span className="text-[11px] leading-none opacity-80">สัปดาห์</span>
                  <span className="font-display text-3xl leading-none">{w.number}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg text-purple-800 sm:text-xl">{w.title}</span>
                  <span className="block text-[15px] text-ink-soft">{w.summary}</span>
                  <span className="mt-1 flex items-center gap-1.5 text-[13px] text-purple-500">
                    {n > 0 ? (
                      <>
                        <span>{n} กิจกรรม · จันทร์–ศุกร์</span>
                        <span aria-hidden>{types.map((t) => ACTIVITY_META[t].emoji).join(" ")}</span>
                      </>
                    ) : "ยังไม่ได้ใส่รายละเอียด"}
                  </span>
                </span>
                <ArrowRight size={20} className="shrink-0 text-purple-300 transition group-hover:translate-x-1 group-hover:text-purple-600" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* สิ่งที่เกี่ยวข้อง */}
      {(projects.length + media.length + worksheets.length + activities.length + games.length) > 0 && (
        <section className="animate-rise delay-6 mt-10">
          <h2 className="mb-4 text-xl sm:text-2xl">🔗 สิ่งที่เกี่ยวข้องกับเรื่องนี้</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {games.length > 0 && (
              <RelatedBox emoji="🎮" title="เกมออนไลน์ที่เกี่ยวข้อง" href="/games">
                {games.map((g) => <RelatedLink key={g.id} href={`/games/${g.id}`} emoji={g.emoji} label={g.title} sub={`▶️ เล่นได้เลย · ${g.skills.join(", ")}`} />)}
              </RelatedBox>
            )}
            {projects.length > 0 && (
              <RelatedBox emoji="📚" title="โครงการที่เกี่ยวข้อง" href="/projects">
                {projects.map((p) => <RelatedLink key={p.id} href={`/projects/${p.id}`} emoji={p.emoji} label={p.title} sub={p.duration} />)}
              </RelatedBox>
            )}
            {activities.length > 0 && (
              <RelatedBox emoji="🧸" title="ไอเดียกิจกรรมเพิ่มเติม" href="/activities">
                {activities.map((a) => <RelatedLink key={a.id} href={`/activities/${a.id}`} emoji={a.emoji} label={a.title} sub={a.category} />)}
              </RelatedBox>
            )}
            {media.length > 0 && (
              <RelatedBox emoji="🎨" title="สื่อการเรียนการสอน" href="/media">
                {media.map((m) => <RelatedLink key={m.id} href={`/media#${m.id}`} emoji={m.emoji} label={m.title} sub={m.kind} />)}
              </RelatedBox>
            )}
            {worksheets.length > 0 && (
              <RelatedBox emoji="📝" title="ใบงาน" href="/worksheets">
                {worksheets.map((w) => <RelatedLink key={w.id} href={`/worksheets/${w.id}`} emoji={w.emoji} label={w.title} sub={w.skills.join(" · ")} />)}
              </RelatedBox>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------- small pieces ---------- */
function Panel({ emoji, title, delay, children }: { emoji: string; title: string; delay: number; children: React.ReactNode }) {
  return (
    <section className={`card animate-rise delay-${delay} p-5 sm:p-6`}>
      <h2 className="mb-3 text-lg sm:text-xl">{emoji} {title}</h2>
      {children}
    </section>
  );
}

function Bullets({ items, mark = "•" }: { items: string[]; mark?: string }) {
  if (items.length === 0) return <p className="text-[15px] text-ink-soft">— ยังไม่ได้ระบุ —</p>;
  return (
    <ul className="space-y-1.5">
      {items.map((t, i) => (
        <li key={i} className="flex gap-2 text-[15px] sm:text-base"><span className="text-purple-400">{mark}</span><span>{t}</span></li>
      ))}
    </ul>
  );
}

function RelatedBox({ emoji, title, href, children }: { emoji: string; title: string; href: string; children: React.ReactNode }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-base sm:text-lg">{emoji} {title}</h3>
        <Link href={href} className="text-[13px] font-medium text-purple-600 hover:underline">ดูทั้งหมด</Link>
      </div>
      <div className="grid gap-1.5">{children}</div>
    </div>
  );
}

function RelatedLink({ href, emoji, label, sub }: { href: string; emoji: string; label: string; sub?: string }) {
  return (
    <Link href={href} className="tap flex items-center gap-3 rounded-xl bg-cream px-3 py-2 text-[15px] transition hover:bg-purple-50">
      <span className="text-xl">{emoji}</span>
      <span className="min-w-0 flex-1">
        <span className="block leading-snug text-purple-800">{label}</span>
        {sub && <span className="block text-[13px] text-ink-soft">{sub}</span>}
      </span>
      <ArrowRight size={16} className="shrink-0 text-purple-300" />
    </Link>
  );
}
