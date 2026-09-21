import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { CORE_ACTIVITIES, getActivitiesByType, getCoreActivity } from "@/data/core-activities";
import { DAY_META } from "@/data/plans";
import { GAMES } from "@/data/games";
import { Breadcrumb, EmptyState, PageHeader, Tag } from "@/components/ui";
import { ActivityCard } from "@/components/partials";
import { GameCard } from "@/components/games";

type Params = { type: string };

export function generateStaticParams(): Params[] {
  return CORE_ACTIVITIES.map((c) => ({ type: c.type }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { type } = await params;
  return { title: getCoreActivity(type)?.title ?? "ไม่พบกิจกรรม" };
}

export default async function CoreActivityPage({ params }: { params: Promise<Params> }) {
  const { type } = await params;
  const core = getCoreActivity(type);
  if (!core) notFound();

  const items = getActivitiesByType(core.type);
  const idx = CORE_ACTIVITIES.findIndex((c) => c.type === core.type);
  const prev = CORE_ACTIVITIES[idx - 1];
  const next = CORE_ACTIVITIES[idx + 1];
  const showGames = core.type === "game";

  return (
    <div className="container-page py-8 sm:py-12">
      <Breadcrumb items={[{ label: "6 กิจกรรมหลัก", href: "/core-activities" }, { label: core.title }]} />

      <PageHeader emoji={core.emoji} title={`${core.order}. ${core.title}`}>
        <Tag tone="purple">กิจกรรมหลักที่ {core.order} จาก 6</Tag>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card animate-rise delay-1 p-5 sm:p-6">
          <h2 className="mb-2 text-lg sm:text-xl">📌 ลักษณะ</h2>
          <p className="text-[15px] sm:text-base">{core.nature}</p>
        </section>
        <section className="card animate-rise delay-2 p-5 sm:p-6">
          <h2 className="mb-2 text-lg sm:text-xl">🎯 เป้าหมาย</h2>
          <p className="text-[15px] sm:text-base">{core.goal}</p>
        </section>
      </div>

      {showGames && (
        <section className="animate-rise delay-3 mt-10">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-xl sm:text-2xl">🎮 เกมออนไลน์ที่เกี่ยวข้อง</h2>
            <Link href="/games" className="tap inline-flex items-center gap-1 text-[15px] font-medium text-purple-700 hover:underline">ดูคลังเกมทั้งหมด <ArrowRight size={16} /></Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GAMES.filter((g) => g.activityType === core.type).map((g) => <GameCard key={g.id} game={g} />)}
          </div>
        </section>
      )}

      <section className="animate-rise delay-4 mt-10">
        <h2 className="mb-4 text-xl sm:text-2xl">🧸 ตัวอย่างกิจกรรมจากแผน ({items.length})</h2>
        {items.length === 0 ? (
          <EmptyState title="ยังไม่มีกิจกรรมประเภทนี้ในแผน" hint="เมื่อเติมรายละเอียดแผน กิจกรรมจะมาแสดงที่นี่อัตโนมัติ" />
        ) : (
          <div className="grid gap-5">
            {items.map(({ plan, week, day, activity }, i) => (
              <div key={activity.id}>
                <Link href={`/plans/${plan.id}/${week.id}`} className="mb-1.5 inline-flex flex-wrap items-center gap-1.5 text-[14px] text-purple-600 hover:underline">
                  📖 เรื่อง {plan.title} · สัปดาห์ที่ {week.number} · วัน{DAY_META[day.day].full}
                  <ArrowRight size={13} />
                </Link>
                <ActivityCard activity={activity} index={Math.min(i, 5)} />
              </div>
            ))}
          </div>
        )}
      </section>

      <nav className="mt-10 flex items-stretch justify-between gap-3" aria-label="กิจกรรมก่อนหน้า / ถัดไป">
        {prev ? (
          <Link href={`/core-activities/${prev.type}`} className="card card-hover tap flex flex-1 items-center gap-2 px-4 py-3 text-[15px] text-purple-700">
            <ChevronLeft size={18} /> <span className="truncate">{prev.emoji} {prev.title}</span>
          </Link>
        ) : <span className="flex-1" />}
        {next ? (
          <Link href={`/core-activities/${next.type}`} className="card card-hover tap flex flex-1 items-center justify-end gap-2 px-4 py-3 text-right text-[15px] text-purple-700">
            <span className="truncate">{next.emoji} {next.title}</span> <ChevronRight size={18} />
          </Link>
        ) : <span className="flex-1" />}
      </nav>
    </div>
  );
}
