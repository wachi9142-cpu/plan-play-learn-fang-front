import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { GRADES, PLANS } from "@/data/plans";
import { GAMES } from "@/data/games";
import { WORKSHEETS } from "@/data/worksheets";
import { PROJECTS } from "@/data/projects";
import { ABOUT_SECTIONS } from "@/data/about";
import { SITE } from "@/lib/site";
import { PageHeader } from "@/components/ui";
import { cn } from "@/lib/cn";
import { GRADE_GROUPS } from "@/data/plans";

export const metadata: Metadata = { title: "เกี่ยวกับ" };

const GRADE_ANCHOR = "grades";

export default function AboutPage() {
  const before = ABOUT_SECTIONS.filter((s) => ["history", "concept", "learning", "philosophy", "vision", "mission", "goals"].includes(s.id));
  const after = ABOUT_SECTIONS.filter((s) => ["facilities", "students", "staff"].includes(s.id));

  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader emoji="📖" title="เกี่ยวกับ Little Purple Garden" description={SITE.intro} />

      {/* สารบัญ */}
      <nav aria-label="หัวข้อในหน้านี้" className="no-scrollbar animate-rise -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {[...before, { id: GRADE_ANCHOR, emoji: "🎓", title: "ระดับชั้น" }, ...after].map((s) => (
          <a key={s.id} href={`#${s.id}`} className="tap shrink-0 whitespace-nowrap rounded-full border border-line bg-white px-3.5 py-1.5 text-[14px] text-ink hover:border-purple-200 hover:bg-purple-50">
            {s.emoji} {s.title}
          </a>
        ))}
      </nav>

      {/* แบรนด์ */}
      <section className="animate-rise card grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-8">
        <Image src="/logo-lpg.webp" alt="Little Purple Garden" width={200} height={200} className="mx-auto size-40 rounded-full bg-white object-cover shadow-soft sm:size-48" />
        <div>
          <p className="font-display text-2xl text-purple-800">💜 {SITE.brand}</p>
          <p className="text-[15px] text-ink-soft">{SITE.credit} · 🌱 {SITE.motto}</p>
          <dl className="mt-4 grid gap-3 text-[15px]">
            <div><dt className="font-medium text-purple-700">Little Purple Garden = “สวนสีม่วงเล็ก ๆ”</dt><dd className="text-ink-soft">เปรียบเหมือนพื้นที่ที่เด็ก ๆ ได้เติบโตและเรียนรู้ผ่านการเล่น 🌱</dd></div>
            <div><dt className="font-medium text-purple-700">Teacher Kaowfang</dt><dd className="text-ink-soft">ตัวตนของผู้สร้างและดูแลพื้นที่นี้</dd></div>
            <div><dt className="font-medium text-purple-700">Play • Learn • Grow</dt><dd className="text-ink-soft">เล่น → เรียนรู้ → เติบโต</dd></div>
          </dl>
        </div>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {before.map((s, i) => <SectionCard key={s.id} s={s} i={i} wide={["history", "vision", "philosophy"].includes(s.id)} />)}
      </div>

      {/* ระดับชั้น */}
      <section id={GRADE_ANCHOR} className="mt-10 scroll-mt-24">
        <h2 className="mb-2 text-xl sm:text-2xl">🎓 ระดับการดูแล/การศึกษา</h2>
        <p className="mb-5 text-[15px] text-ink-soft">เลือกระดับเพื่อดูแนวทางการดูแลและจัดประสบการณ์ จุดเน้นพัฒนาการ และเนื้อหาที่มีในเว็บ</p>
        {(["nursery", "kindergarten"] as const).map((grp) => (
        <div key={grp} className="mb-6">
        <h3 className="mb-3 text-lg text-purple-700">{GRADE_GROUPS[grp].emoji} {GRADE_GROUPS[grp].label} <span className="text-[14px] font-normal text-ink-soft">({GRADE_GROUPS[grp].thai})</span></h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GRADES.filter((g) => g.group === grp).map((g, i) => {
            const n = PLANS.filter((p) => p.gradeId === g.id).length + GAMES.filter((x) => x.gradeId === g.id).length + WORKSHEETS.filter((w) => w.gradeId === g.id).length + PROJECTS.filter((p) => p.gradeId === g.id).length;
            return (
              <Link key={g.id} href={`/about/${g.id}`} className="card card-hover animate-rise group flex flex-col p-5" style={{ animationDelay: `${i * 80}ms` }}>
                <span className={cn("grid size-16 place-items-center rounded-2xl text-4xl transition-transform group-hover:-rotate-6", g.tint)}>{g.emoji}</span>
                <h3 className="mt-3 text-xl">{g.name}</h3>
                <p className="text-[13px] text-purple-500">อายุ {g.ages}</p>
                <p className="mt-2 flex-1 text-[14px] text-ink-soft">{g.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[14px] font-medium text-purple-600">
                  {n > 0 ? `${n} รายการในเว็บ` : "เร็ว ๆ นี้"} <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
        </div>
        ))}
      </section>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {after.map((s, i) => <SectionCard key={s.id} s={s} i={i} wide={s.id === "facilities"} />)}
      </div>
    </div>
  );
}

function SectionCard({ s, i, wide = false }: { s: (typeof ABOUT_SECTIONS)[number]; i: number; wide?: boolean }) {
  return (
    <section id={s.id} className={cn("card animate-rise scroll-mt-24 p-5 sm:p-6", wide && "md:col-span-2", (s.id === "vision" || s.id === "philosophy") && "bg-purple-50")} style={{ animationDelay: `${i * 70}ms` }}>
      <h2 className="text-xl sm:text-2xl">{s.emoji} {s.title}</h2>
      {s.lead && <p className="mt-2 font-display text-lg leading-relaxed text-purple-800 sm:text-xl">“{s.lead}”</p>}
      {s.paragraphs?.map((p, k) => <p key={k} className={cn("leading-relaxed text-[15px] sm:text-base", k === 0 && !s.lead ? "mt-2" : "mt-3")}>{p}</p>)}
      {s.timeline && (
        <ol className="mt-4 grid gap-3 sm:grid-cols-5">
          {s.timeline.map((t, k) => (
            <li key={k} className="relative rounded-2xl bg-cream p-3 text-center">
              <span className="text-3xl">{t.emoji}</span>
              <span className="mt-1 block font-display text-[15px] text-purple-800">{t.title}</span>
              <span className="block text-[12px] text-ink-soft">{t.when && t.when !== "—" ? t.when : "พ.ศ. —"}</span>
              <span className="mt-1 block text-[13px] text-ink">{t.detail}</span>
              {k < s.timeline!.length - 1 && <span className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-purple-300 sm:block" aria-hidden>→</span>}
            </li>
          ))}
        </ol>
      )}
      {s.bullets && (
        <ul className="mt-3 space-y-1.5">
          {s.bullets.map((b) => <li key={b} className="flex gap-2 text-[15px] sm:text-base">{!/^\p{Extended_Pictographic}/u.test(b) && <span className="text-purple-400">•</span>}<span>{b}</span></li>)}
        </ul>
      )}
      {s.table && (
        <dl className="mt-3 divide-y divide-line rounded-xl border border-line">
          {s.table.map((r) => (
            <div key={r.label} className="grid gap-x-4 px-4 py-2 text-[15px] sm:grid-cols-[10rem_1fr]">
              <dt className="text-ink-soft">{r.label}</dt><dd className="font-medium text-purple-800">{r.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {s.note && <p className="mt-3 rounded-xl bg-yellow-soft px-3 py-2 text-[13px]">💡 {s.note}</p>}
    </section>
  );
}
