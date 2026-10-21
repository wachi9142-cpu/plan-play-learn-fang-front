"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import type { Game, GameCategory } from "@/types";
import { CATEGORY_KEYWORDS, GAME_CATEGORIES } from "@/data/games";
import { GameCard } from "@/components/games/GameCard";
import { EmptyState } from "@/components/ui";
import { cn } from "@/lib/cn";
import { AGE_BANDS, bandsForRange, type AgeBandId } from "@/lib/age-bands";
import { getGrade } from "@/data/plans";

/** จำนวนเกมต่อหน้า */
const PER_PAGE = 9;

/** คลังเกม — ครอบด้วย Suspense เพราะด้านในอ่านตัวกรองจาก URL (?cat= / ?q=) */
export function GameLibrary({ games }: { games: Game[] }) {
  return (
    <Suspense fallback={<div className="card p-8 text-center text-[15px] text-ink-soft">กำลังโหลดคลังเกม…</div>}>
      <GameLibraryInner games={games} />
    </Suspense>
  );
}

/** คลังเกม + ค้นหา + กรองตามประเภท + แบ่งหน้า */
function GameLibraryInner({ games }: { games: Game[] }) {
  const params = useSearchParams();
  /** เปิดหน้าแบบกรองไว้ล่วงหน้าได้ เช่น /games?cat=coding หรือ /games?q=โค้ดดิ้ง */
  const initCat = (params.get("cat") as GameCategory | null) ?? null;
  const initQ = params.get("q") ?? "";

  const [cat, setCat] = useState<GameCategory | null>(initCat && GAME_CATEGORIES[initCat] ? initCat : null);
  /** 🔍 คำค้น — ค้นจากชื่อเกม คำอธิบาย ทักษะ และชื่อหมวด */
  const [q, setQ] = useState(initQ);
  const [band, setBand] = useState<AgeBandId | null>(null);
  /** 👥 กรองตามจำนวนผู้เล่น — null = ไม่กรอง */
  const [people, setPeople] = useState<number | null>(null);
  /** 📄 หน้าที่กำลังดู — เกมแต่ละหน้าไม่ซ้ำกัน */
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);
  const agesOf = (g: Game) => g.ages ?? getGrade(g.gradeId)?.ages;
  const inBand = (g: Game) => !band || bandsForRange(agesOf(g)).includes(band);
  const fitsPeople = (g: Game) => !people || (g.players ?? [1]).includes(people);
  const cats = (Object.keys(GAME_CATEGORIES) as GameCategory[]).filter((c) => games.some((g) => g.category === c));

  const matchQ = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return () => true;
    return (g: Game) => {
      const cl = GAME_CATEGORIES[g.category];
      const hay = [g.title, g.description, ...g.skills, cl.label, ...(CATEGORY_KEYWORDS[g.category] ?? []), g.ages ?? "", g.id].join(" ").toLowerCase();
      return t.split(/\s+/).every((w) => hay.includes(w));
    };
  }, [q]);

  const list = games.filter((g) => (!cat || g.category === cat) && inBand(g) && fitsPeople(g) && matchQ(g));

  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const current = Math.min(page, pages);
  const shown = list.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  // เปลี่ยนตัวกรองแล้วกลับไปหน้าแรกเสมอ จะได้ไม่ไปค้างอยู่หน้าที่ไม่มีเกม
  useEffect(() => { setPage(1); }, [cat, band, people, q]);

  const goPage = (p: number) => {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      {/* 🔍 ค้นหาเกม */}
      <div className="mb-4 flex items-center gap-2 rounded-2xl border-2 border-line bg-white px-4 py-2.5 focus-within:border-purple-400">
        <Search size={18} className="shrink-0 text-purple-400" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ค้นหาเกม เช่น โค้ดดิ้ง · จับคู่ · ตัวเลข · ตีตุ่น"
          aria-label="ค้นหาเกม"
          className="min-w-0 flex-1 bg-transparent py-1 text-[15px] text-ink outline-none placeholder:text-ink-soft"
        />
        {q && (
          <button type="button" onClick={() => setQ("")} aria-label="ล้างคำค้น"
            className="tap shrink-0 rounded-full p-1 text-ink-soft hover:bg-cream">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="no-scrollbar -mx-4 mb-2 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip active={band === null} onClick={() => setBand(null)}>👶 ทุกวัย</Chip>
        {AGE_BANDS.filter((b) => b.id !== "adult").map((b) => <Chip key={b.id} active={band === b.id} onClick={() => setBand(band === b.id ? null : b.id)}>{b.emoji} {b.label} ({games.filter((g) => bandsForRange(agesOf(g)).includes(b.id)).length})</Chip>)}
      </div>
      <div className="no-scrollbar -mx-4 mb-2 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip active={people === null} onClick={() => setPeople(null)}>👥 กี่คนก็ได้</Chip>
        <Chip active={people === 1} onClick={() => setPeople(people === 1 ? null : 1)}>
          👤 เล่นคนเดียว ({games.filter((g) => (g.players ?? [1]).includes(1) && inBand(g)).length})
        </Chip>
        <Chip active={people === 2} onClick={() => setPeople(people === 2 ? null : 2)}>
          👬 เล่น 2 คน ({games.filter((g) => (g.players ?? [1]).includes(2) && inBand(g)).length})
        </Chip>
      </div>
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip active={cat === null} onClick={() => setCat(null)}>🎮 ทุกเกม ({games.filter((g) => inBand(g) && fitsPeople(g)).length})</Chip>
        {cats.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(cat === c ? null : c)}>
            {GAME_CATEGORIES[c].emoji} {GAME_CATEGORIES[c].label} ({games.filter((g) => g.category === c && inBand(g) && fitsPeople(g)).length})
          </Chip>
        ))}
      </div>

      <div ref={topRef} className="scroll-mt-24" />

      {list.length === 0 ? (
        <EmptyState emoji="🔍" title={q ? `ไม่พบเกมที่ตรงกับ “${q}”` : "ยังไม่มีเกมในหมวดนี้"} hint={q ? "ลองใช้คำสั้นลง หรือกดล้างคำค้นแล้วเลือกจากหมวดด้านบน" : "เกมใหม่กำลังจะมาเร็ว ๆ นี้"} />
      ) : (
        <>
          <p className="mb-3 text-[14px] text-ink-soft">
            พบ <b className="text-purple-700">{list.length}</b> เกม
            {pages > 1 && <> · กำลังดูหน้า <b className="text-purple-700">{current}</b> จาก {pages} (เกมที่ {(current - 1) * PER_PAGE + 1}–{Math.min(current * PER_PAGE, list.length)})</>}
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((g, i) => <GameCard key={g.id} game={g} className="animate-rise" style={{ animationDelay: `${i * 60}ms` }} />)}
          </div>

          {/* 📄 เลขหน้า — กดเลขเพื่อไปหน้านั้น เกมไม่ซ้ำกับหน้าอื่น */}
          {pages > 1 && (
            <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="เลือกหน้าเกม">
              <button
                type="button"
                onClick={() => goPage(current - 1)}
                disabled={current === 1}
                className="tap inline-flex items-center gap-1 rounded-full bg-cream-dark px-4 py-2 text-[14px] font-medium text-purple-700 hover:brightness-95 disabled:opacity-40"
              >
                <ChevronLeft size={16} /> ก่อนหน้า
              </button>

              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => goPage(p)}
                  aria-current={p === current ? "page" : undefined}
                  aria-label={`หน้า ${p}`}
                  className={cn(
                    "tap grid size-11 place-items-center rounded-2xl font-display text-[17px] transition",
                    p === current
                      ? "bg-purple-600 text-white! shadow-soft"
                      : "bg-cream-dark text-purple-700 hover:brightness-95",
                  )}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                onClick={() => goPage(current + 1)}
                disabled={current === pages}
                className="tap inline-flex items-center gap-1 rounded-full bg-cream-dark px-4 py-2 text-[14px] font-medium text-purple-700 hover:brightness-95 disabled:opacity-40"
              >
                ถัดไป <ChevronRight size={16} />
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "tap shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-[15px] transition-colors",
        active ? "border-purple-600 bg-purple-600 text-white shadow-soft" : "border-line bg-white text-ink hover:border-purple-200 hover:bg-purple-50",
      )}
    >
      {children}
    </button>
  );
}
