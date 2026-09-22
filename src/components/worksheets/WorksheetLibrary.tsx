"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, Printer } from "lucide-react";
import type { Worksheet, WorksheetCategory } from "@/types";
import { WORKSHEET_CATEGORIES } from "@/data/worksheets";
import { AGE_BANDS, bandsForRange, type AgeBandId } from "@/lib/age-bands";
import { getGrade } from "@/data/plans";
import { getPlan } from "@/data/plans";
import { EmptyState, Tag } from "@/components/ui";
import { cn } from "@/lib/cn";

interface Props {
  worksheets: Worksheet[];
  tags: { tag: string; n: number }[];
  initialCategory?: WorksheetCategory | null;
}

/** คลังใบงาน: ค้นหา + กรองตามหมวด + กรองตามแท็ก */
export function WorksheetLibrary({ worksheets, tags, initialCategory = null }: Props) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<WorksheetCategory | null>(initialCategory);
  const [tag, setTag] = useState<string | null>(null);
  const [band, setBand] = useState<AgeBandId | null>(null);
  const [skill, setSkill] = useState<string | null>(null);
  const agesOf = (w: Worksheet) => w.ages ?? getGrade(w.gradeId)?.ages;
  const skills = useMemo(() => { const m = new Map<string, number>(); worksheets.forEach((w) => w.skills.forEach((s) => m.set(s, (m.get(s) ?? 0) + 1))); return Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, 18); }, [worksheets]);

  // รองรับลิงก์ /worksheets?cat=math จากแถบลอย/หน้าอื่น
  const catParam = useSearchParams().get("cat");
  useEffect(() => {
    if (catParam && catParam in WORKSHEET_CATEGORIES) setCat(catParam as WorksheetCategory);
    else if (catParam === null) setCat(null);
  }, [catParam]);

  const cats = (Object.keys(WORKSHEET_CATEGORIES) as WorksheetCategory[]).filter((c) => worksheets.some((w) => w.category === c));

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    return worksheets.filter((w) => {
      if (cat && w.category !== cat) return false;
      if (tag && !w.tags.includes(tag)) return false;
      if (band && !bandsForRange(agesOf(w)).includes(band)) return false;
      if (skill && !w.skills.includes(skill)) return false;
      if (!query) return true;
      const plans = w.planIds.map((id) => getPlan(id)?.title ?? "").join(" ");
      return [w.title, w.description, ...w.skills, ...w.tags, plans].join(" ").toLowerCase().includes(query);
    });
  }, [q, cat, tag, band, skill, worksheets]); // eslint-disable-line react-hooks/exhaustive-deps

  // จัดกลุ่มตามหมวดเมื่อยังไม่เลือกหมวด
  const grouped = cat ? [[cat, results] as const] : cats.map((c) => [c, results.filter((w) => w.category === c)] as const).filter(([, l]) => l.length > 0);

  return (
    <div>
      <label className="card flex items-center gap-3 px-4 py-2.5 focus-within:border-purple-300 sm:px-5">
        <Search size={20} className="shrink-0 text-purple-400" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ค้นหาใบงาน เช่น คัด ก-ฮ, นับเลข, ระบายสี, หน่วยอาหาร"
          className="min-w-0 flex-1 bg-transparent py-1.5 text-base outline-none placeholder:text-ink-soft/70"
          aria-label="ค้นหาใบงาน"
        />
        {q && <button type="button" onClick={() => setQ("")} aria-label="ล้างคำค้น" className="tap grid place-items-center rounded-full text-ink-soft hover:bg-purple-50"><X size={18} /></button>}
      </label>

      {/* หมวด */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="self-center text-[13px] text-ink-soft">👶 อายุ:</span>
        <Mini active={band === null} onClick={() => setBand(null)}>ทุกวัย</Mini>
        {AGE_BANDS.filter((b) => b.id !== "adult").map((b) => <Mini key={b.id} active={band === b.id} onClick={() => setBand(band === b.id ? null : b.id)}>{b.emoji} {b.label} ({worksheets.filter((w) => bandsForRange(agesOf(w)).includes(b.id)).length})</Mini>)}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="self-center text-[13px] text-ink-soft">🧠 ทักษะ:</span>
        <Mini active={skill === null} onClick={() => setSkill(null)}>ทั้งหมด</Mini>
        {skills.map(([sk, n]) => <Mini key={sk} active={skill === sk} onClick={() => setSkill(skill === sk ? null : sk)}>{sk} ({n})</Mini>)}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <CatChip active={cat === null} onClick={() => setCat(null)} emoji="📝" label="ทั้งหมด" n={worksheets.length} tint="bg-white" />
        {cats.map((c) => {
          const m = WORKSHEET_CATEGORIES[c];
          return <CatChip key={c} active={cat === c} onClick={() => setCat(cat === c ? null : c)} emoji={m.emoji} label={m.label} n={worksheets.filter((w) => w.category === c).length} tint={m.tint} />;
        })}
      </div>

      {/* แท็ก */}
      <div className="no-scrollbar -mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <span className="shrink-0 self-center text-[13px] text-ink-soft">🏷️ แท็ก:</span>
        {tags.map(({ tag: t, n }) => (
          <button
            key={t}
            type="button"
            onClick={() => setTag(tag === t ? null : t)}
            aria-pressed={tag === t}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-[13px] transition-colors",
              tag === t ? "border-purple-600 bg-purple-600 text-white" : "border-line bg-white text-ink hover:border-purple-200 hover:bg-purple-50",
            )}
          >
            {t} <span className="opacity-60">({n})</span>
          </button>
        ))}
      </div>

      <p className="mt-5 mb-3 text-[15px] text-ink-soft">
        พบ <span className="font-medium text-purple-700">{results.length}</span> ใบงาน
        {tag && <> · แท็ก “{tag}”</>}{q && <> · “{q}”</>}
      </p>

      {results.length === 0 ? (
        <EmptyState emoji="🔍" title="ไม่พบใบงานที่ตรงกับเงื่อนไข" hint="ลองเปลี่ยนคำค้น หรือยกเลิกแท็ก/หมวดที่เลือก" />
      ) : (
        <div className="space-y-10">
          {grouped.map(([c, list]) => {
            const m = WORKSHEET_CATEGORIES[c];
            return (
              <section key={c}>
                <h2 className="mb-4 flex items-center gap-2 text-xl sm:text-2xl">
                  <span className={cn("grid size-9 place-items-center rounded-xl text-lg", m.tint)}>{m.emoji}</span>
                  {m.label} <span className="text-base font-normal text-ink-soft">({list.length})</span>
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((w, i) => <WorksheetCard key={w.id} w={w} delay={i} />)}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CatChip({ active, onClick, emoji, label, n, tint }: { active: boolean; onClick: () => void; emoji: string; label: string; n: number; tint: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "tap flex items-center gap-2 rounded-2xl border px-3 py-2 text-left text-[14px] leading-tight transition-colors",
        active ? "border-purple-600 bg-purple-600 text-white shadow-soft" : "border-line bg-white text-ink hover:border-purple-200",
      )}
    >
      <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg text-base", active ? "bg-white/20" : tint)}>{emoji}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className={cn("text-[12px]", active ? "text-purple-100" : "text-ink-soft")}>{n}</span>
    </button>
  );
}

export function WorksheetCard({ w, delay = 0 }: { w: Worksheet; delay?: number }) {
  const m = WORKSHEET_CATEGORIES[w.category];
  const plans = w.planIds.map(getPlan).filter((p) => p !== undefined);
  return (
    <article className="card card-hover animate-rise group flex flex-col overflow-hidden" style={{ animationDelay: `${Math.min(delay, 6) * 60}ms` }}>
      <Link href={`/worksheets/${w.id}`} className={cn("relative grid h-28 place-items-center text-6xl transition-transform group-hover:scale-105", m.tint)} aria-label={w.title}>
        <span className="drop-shadow-sm">{w.emoji}</span>
        <span className="absolute right-3 top-3 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium text-purple-700">{w.file ? "📎 PDF" : "🖨️ พิมพ์ได้"}</span>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[12px] font-medium text-purple-500">{m.emoji} {m.label}</p>
        <h3 className="text-lg leading-snug">{w.title}</h3>
        <p className="mt-1 flex-1 text-[14px] text-ink-soft">{w.description}</p>
        <div className="mt-2 flex flex-wrap gap-1">{w.skills.slice(0, 3).map((s) => <Tag key={s} tone="mint" className="text-[12px]">{s}</Tag>)}</div>
        {plans.length > 0 && <p className="mt-2 truncate text-[12px] text-ink-soft">📖 {plans.map((p) => p.title).join(" · ")}</p>}
        <div className="mt-3 flex gap-2">
          <Link href={`/worksheets/${w.id}`} className="tap inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-purple-600 px-4 py-2 text-[14px] font-medium text-white hover:bg-purple-700">👀 ดูตัวอย่าง</Link>
          <Link href={`/worksheets/${w.id}/print`} target="_blank" className="tap inline-flex items-center justify-center gap-1.5 rounded-full border border-purple-200 bg-white px-3 py-2 text-[14px] font-medium text-purple-700 hover:bg-purple-50" aria-label="พิมพ์ใบงาน"><Printer size={16} /></Link>
        </div>
      </div>
    </article>
  );
}

function Mini({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`tap rounded-full px-2.5 py-0.5 text-[12px] ring-1 transition ${active ? "bg-purple-600 text-white ring-purple-600" : "bg-white text-ink ring-line hover:bg-purple-50"}`}>{children}</button>;
}
