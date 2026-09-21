import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { GAMES, GAME_CATEGORIES, getGame } from "@/data/games";
import { getGrade, getPlan, getUnit } from "@/data/plans";
import { getCoreActivity } from "@/data/core-activities";
import { Breadcrumb, Tag } from "@/components/ui";
import { GamePlayer } from "@/components/games";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return GAMES.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return { title: getGame(id)?.title ?? "ไม่พบเกม" };
}

export default async function GamePage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const game = getGame(id);
  if (!game) notFound();

  const grade = getGrade(game.gradeId);
  const cat = GAME_CATEGORIES[game.category];
  const core = getCoreActivity(game.activityType);
  const plans = game.planIds.map(getPlan).filter((p) => p !== undefined);
  const idx = GAMES.findIndex((g) => g.id === game.id);
  const prev = GAMES[idx - 1];
  const next = GAMES[idx + 1];

  return (
    <div className="container-page py-6 sm:py-10">
      <Breadcrumb items={[{ label: "เกมการศึกษา", href: "/games" }, { label: game.title }]} />

      <div className="animate-rise mb-5 flex items-start gap-3 sm:gap-4">
        <span className={`grid size-14 shrink-0 place-items-center rounded-2xl text-3xl shadow-soft sm:size-16 sm:text-4xl ${game.cover}`}>{game.emoji}</span>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl">{game.title}</h1>
          <p className="text-[15px] text-ink-soft sm:text-base">{game.description}</p>
        </div>
      </div>

      <div className="animate-rise delay-1">
        <GamePlayer config={game.config} />
      </div>

      {/* ข้อมูลการเชื่อมโยงของเกม */}
      <section className="animate-rise delay-2 mt-8 grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-3 text-lg">🎯 ข้อมูลเกม</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-[15px]">
            <dt className="text-ink-soft">เหมาะกับ</dt><dd><Tag tone="pink">{grade?.name}</Tag></dd>
            <dt className="text-ink-soft">ประเภท</dt><dd><Tag tone="purple">{cat.emoji} {cat.label}</Tag></dd>
            <dt className="text-ink-soft">ทักษะ</dt><dd className="flex flex-wrap gap-1.5">{game.skills.map((s) => <Tag key={s} tone="mint">{s}</Tag>)}</dd>
            {core && (
              <>
                <dt className="text-ink-soft">กิจกรรมหลัก</dt>
                <dd><Link href={`/core-activities/${core.type}`} className="inline-flex items-center gap-1 font-medium text-purple-700 hover:underline">🎈 {core.title} <ArrowRight size={14} /></Link></dd>
              </>
            )}
          </dl>
        </div>
        <div className="card p-5">
          <h2 className="mb-3 text-lg">📖 หน่วย / แผนที่เกี่ยวข้อง</h2>
          {plans.length === 0 ? <p className="text-[15px] text-ink-soft">ยังไม่ได้เชื่อมกับแผน</p> : (
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
          )}
        </div>
      </section>

      <nav className="mt-8 flex items-stretch justify-between gap-3" aria-label="เกมก่อนหน้า / ถัดไป">
        {prev ? (
          <Link href={`/games/${prev.id}`} className="card card-hover tap flex flex-1 items-center gap-2 px-4 py-3 text-[15px] text-purple-700">
            <ChevronLeft size={18} /> <span className="truncate">{prev.emoji} {prev.title}</span>
          </Link>
        ) : <span className="flex-1" />}
        {next ? (
          <Link href={`/games/${next.id}`} className="card card-hover tap flex flex-1 items-center justify-end gap-2 px-4 py-3 text-right text-[15px] text-purple-700">
            <span className="truncate">{next.emoji} {next.title}</span> <ChevronRight size={18} />
          </Link>
        ) : <span className="flex-1" />}
      </nav>
    </div>
  );
}
