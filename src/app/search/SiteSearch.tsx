"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Search, X } from "lucide-react";
import { SEARCH_KINDS, searchAll, type SearchKind } from "@/lib/search-index";
import { EmptyState } from "@/components/ui";
import { cn } from "@/lib/cn";

const QUICK = ["อาหาร", "ตัวเรา", "จับคู่", "ระบายสี", "นับเลข", "สัตว์", "ลอยกระทง", "ประชุมผู้ปกครอง"];

export function SiteSearch() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [kind, setKind] = useState<SearchKind | null>(null);
  useEffect(() => { const v = params.get("q"); if (v !== null) setQ(v); }, [params]);

  const all = useMemo(() => searchAll(q), [q]);
  const results = kind ? all.filter((r) => r.kind === kind) : all;
  const kinds = (Object.keys(SEARCH_KINDS) as SearchKind[]).filter((k) => all.some((r) => r.kind === k));

  return (
    <div>
      <label className="card flex items-center gap-3 px-4 py-3 focus-within:border-purple-300 sm:px-5">
        <Search size={22} className="shrink-0 text-purple-400" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="พิมพ์คำที่ต้องการค้นหา…"
          className="min-w-0 flex-1 bg-transparent py-1 text-lg outline-none placeholder:text-ink-soft/70"
          aria-label="ค้นหาทั้งเว็บ"
          autoFocus
        />
        {q && <button type="button" onClick={() => setQ("")} aria-label="ล้างคำค้น" className="tap grid place-items-center rounded-full text-ink-soft hover:bg-purple-50"><X size={20} /></button>}
      </label>

      {!q && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[14px] text-ink-soft">ลองค้นหา:</span>
          {QUICK.map((w) => <button key={w} type="button" onClick={() => setQ(w)} className="tap rounded-full border border-line bg-white px-3.5 py-1.5 text-[14px] text-ink hover:border-purple-200 hover:bg-purple-50">{w}</button>)}
        </div>
      )}

      {q && (
        <>
          <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            <Chip active={kind === null} onClick={() => setKind(null)}>ทั้งหมด ({all.length})</Chip>
            {kinds.map((k) => (
              <Chip key={k} active={kind === k} onClick={() => setKind(kind === k ? null : k)}>
                {SEARCH_KINDS[k].emoji} {SEARCH_KINDS[k].label} ({all.filter((r) => r.kind === k).length})
              </Chip>
            ))}
          </div>

          <p className="mt-5 mb-3 text-[15px] text-ink-soft">พบ <span className="font-medium text-purple-700">{results.length}</span> รายการ สำหรับ “{q}”</p>

          {results.length === 0 ? (
            <EmptyState emoji="🔍" title="ไม่พบผลลัพธ์" hint="ลองใช้คำสั้นลง หรือคำอื่น เช่น ชื่อหน่วย ชื่อเกม ชื่อใบงาน" />
          ) : (
            <div className="grid gap-2">
              {results.map((r) => (
                <Link key={`${r.kind}-${r.href}`} href={r.href} className="card card-hover group flex items-center gap-3 px-4 py-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-purple-100 text-2xl">{r.emoji}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] text-purple-500">{SEARCH_KINDS[r.kind].emoji} {SEARCH_KINDS[r.kind].label}</span>
                    <span className="block truncate font-display text-[16px] text-purple-800">{r.title}</span>
                    {r.subtitle && <span className="block truncate text-[13px] text-ink-soft">{r.subtitle}</span>}
                  </span>
                  <ArrowRight size={16} className="shrink-0 text-purple-300 transition group-hover:translate-x-1 group-hover:text-purple-600" />
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn("tap shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[14px] transition-colors", active ? "border-purple-600 bg-purple-600 text-white" : "border-line bg-white text-ink hover:border-purple-200 hover:bg-purple-50")}>
      {children}
    </button>
  );
}
