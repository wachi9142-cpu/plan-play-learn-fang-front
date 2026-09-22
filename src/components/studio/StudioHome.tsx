"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Copy, FileText, LayoutGrid, List as ListIcon, Plus, Search, Trash2, Upload } from "lucide-react";
import type { DocStatus, DocType, StudioDoc } from "@/types";
import { DOC_STATUS, DOC_TYPES, SHEET_TEMPLATES, SLIDE_TEMPLATES, createDoc, deleteDoc, duplicateDoc, listDocs } from "@/lib/studio-store";
import { PLANS, getUnit } from "@/data/plans";
import { SCHEDULES } from "@/data/schedules";
import { EmptyState } from "@/components/ui";
import { TEMPLATES } from "./SidePanels";
import { cn } from "@/lib/cn";

const timeAgo = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "เมื่อสักครู่";
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
  return `${Math.round(h / 24)} วันที่แล้ว`;
};

/** แถวไอคอนกลม (แบบภาพอ้างอิง) — ประเภทเอกสาร + เครื่องมือ */
type Chip = { id: string; emoji: string; label: string; color: string; action: "create" | "templates" | "uploads" | "projects" | "more"; type?: DocType; badge?: string };
const CHIPS: Chip[] = [
  { id: "templates", emoji: "📑", label: "แม่แบบ", color: "bg-purple-100 text-purple-800", action: "templates" },
  { id: "plan", emoji: "📖", label: "แผนฯ", color: "bg-purple-600 text-white", action: "create", type: "plan" },
  { id: "schedule", emoji: "📅", label: "กำหนดการสอน", color: "bg-[#2b8ad6] text-white", action: "create", type: "schedule" },
  { id: "worksheet", emoji: "📝", label: "ใบงาน", color: "bg-[#2ea672] text-white", action: "create", type: "worksheet" },
  { id: "media", emoji: "🎨", label: "สื่อการสอน", color: "bg-[#e0508a] text-white", action: "create", type: "media" },
  { id: "slides", emoji: "🎞️", label: "สไลด์", color: "bg-[#f2a33a] text-white", action: "create", type: "slides", badge: "ใหม่" },
  { id: "sheet", emoji: "📊", label: "ชีต", color: "bg-[#1f9d6b] text-white", action: "create", type: "sheet", badge: "ใหม่" },
  { id: "other", emoji: "📄", label: "เอกสาร", color: "bg-[#f2a33a] text-white", action: "create", type: "other" },
  { id: "uploads", emoji: "⬆️", label: "อัปโหลด", color: "bg-[#e9e2f4] text-purple-800", action: "uploads" },
  { id: "projects", emoji: "📚", label: "เอกสารของฉัน", color: "bg-[#e9e2f4] text-purple-800", action: "projects" },
  { id: "more", emoji: "⋯", label: "เพิ่มเติม", color: "bg-[#e9e2f4] text-purple-800", action: "more", badge: "เร็ว ๆ นี้" },
];

const RAIL_HOME = [
  { id: "create", emoji: "➕", label: "สร้าง" },
  { id: "home", emoji: "🏠", label: "หน้าแรก" },
  { id: "projects", emoji: "📚", label: "เอกสาร" },
  { id: "templates", emoji: "📑", label: "แม่แบบ" },
  { id: "uploads", emoji: "⬆️", label: "อัปโหลด" },
] as const;

/** หน้าแรก Garden Studio: rail ซ้าย + ค้นหา + แถวไอคอน + เอกสารล่าสุด */
export function StudioHome({ presetType }: { presetType?: DocType }) {
  const router = useRouter();
  const [docs, setDocs] = useState<StudioDoc[]>([]);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<DocStatus | "all">("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [picker, setPicker] = useState<DocType | null>(presetType ?? null);
  const [panel, setPanel] = useState<"templates" | "uploads" | null>(null);

  useEffect(() => {
    const load = () => setDocs(listDocs());
    load();
    window.addEventListener("lpg-studio-change", load);
    return () => window.removeEventListener("lpg-studio-change", load);
  }, []);

  const shown = useMemo(() => docs.filter((d) =>
    (typeFilter === "all" || d.type === typeFilter) &&
    (statusFilter === "all" || d.status === statusFilter) &&
    (!q || d.title.toLowerCase().includes(q.toLowerCase()))), [docs, typeFilter, statusFilter, q]);

  const start = (type: DocType, opts?: { planId?: string; scheduleId?: string }) => router.push(`/studio/${createDoc(type, opts).id}`);

  const onChip = (c: Chip) => {
    if (c.action === "create" && c.type) { setPicker(picker === c.type ? null : c.type); setPanel(null); }
    else if (c.action === "templates") { setPanel(panel === "templates" ? null : "templates"); setPicker(null); }
    else if (c.action === "uploads") { setPanel(panel === "uploads" ? null : "uploads"); setPicker(null); }
    else if (c.action === "projects") document.getElementById("recent")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollRow = (dir: 1 | -1) => document.getElementById("chip-row")?.scrollBy({ left: dir * 300, behavior: "smooth" });

  return (
    <div className="flex gap-4">
      {/* Rail ซ้าย (desktop) */}
      <nav className="no-print sticky top-24 hidden h-fit w-[76px] shrink-0 flex-col items-center gap-1 rounded-3xl border border-line bg-white py-3 shadow-soft md:flex" aria-label="เมนู Studio">
        {RAIL_HOME.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => {
              if (r.id === "create") { setPicker("plan"); window.scrollTo({ top: 0, behavior: "smooth" }); }
              else if (r.id === "home") window.scrollTo({ top: 0, behavior: "smooth" });
              else if (r.id === "projects") document.getElementById("recent")?.scrollIntoView({ behavior: "smooth" });
              else setPanel(r.id);
            }}
            className={cn("flex w-16 flex-col items-center gap-0.5 rounded-2xl py-2 text-[11px] text-ink-soft transition hover:bg-purple-50 hover:text-purple-700", r.id === "create" && "text-purple-700")}
          >
            <span className={cn("grid size-10 place-items-center rounded-full text-xl", r.id === "create" ? "bg-purple-600 text-white shadow-soft" : "bg-cream")}>{r.emoji}</span>
            {r.label}
          </button>
        ))}
      </nav>

      <div className="min-w-0 flex-1">
        {/* Hero */}
        <section className="rounded-3xl bg-gradient-to-br from-purple-100 via-pink-soft to-yellow-soft px-4 pb-6 pt-10 text-center sm:px-6 sm:pt-14">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-[13px] font-medium text-purple-700 shadow-soft">💜 Garden Studio · ห้องสร้างสื่อ</p>
          <h1 className="mt-4 text-3xl sm:text-5xl">วันนี้จะสร้างอะไรดีคะ?</h1>
          <p className="mt-2 text-[15px] text-ink-soft sm:text-base">พื้นที่สำหรับสร้าง แก้ไข จัดเก็บ และจัดเตรียมเอกสารการเรียนรู้ · อยากวาดรูปหรือทำกิจกรรมร่วมกัน? ไปที่ <Link href="/canvas" className="font-medium text-purple-700 underline">🎨 Garden Canvas</Link></p>
          <label className="card mx-auto mt-6 flex max-w-2xl items-center gap-3 px-4 py-3">
            <Search size={20} className="text-purple-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาเอกสาร แม่แบบ หรือพิมพ์สิ่งที่อยากสร้าง…" className="min-w-0 flex-1 bg-transparent py-1 text-base outline-none" aria-label="ค้นหา" />
          </label>

          {/* แถวไอคอนกลม เลื่อนได้ */}
          <div className="relative mt-8">
            <button type="button" onClick={() => scrollRow(-1)} className="absolute -left-2 top-6 z-10 hidden size-8 place-items-center rounded-full bg-white shadow-lift sm:grid" aria-label="เลื่อนซ้าย"><ChevronLeft size={16} /></button>
            <div id="chip-row" className="no-scrollbar flex items-start gap-2 overflow-x-auto px-2 sm:gap-4 sm:px-8">
              {CHIPS.map((c, i) => (
                <button key={c.id} type="button" onClick={() => onChip(c)} className="group flex w-[88px] shrink-0 flex-col items-center gap-2 text-center">
                  <span className="relative">
                    <span className={cn("grid size-14 place-items-center rounded-full text-2xl shadow-soft transition group-hover:-translate-y-1 group-hover:shadow-lift", c.color, (picker === c.type && c.type) || panel === c.action ? "ring-4 ring-purple-300" : "")}>{c.emoji}</span>
                    {c.badge && <span className="absolute -right-2 -top-1 rounded-full bg-[#e0508a] px-1.5 text-[10px] text-white">{c.badge}</span>}
                  </span>
                  <span className="text-[12px] leading-tight text-ink">{c.label}</span>
                  {i === 0 && <span className="sr-only">|</span>}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => scrollRow(1)} className="absolute -right-2 top-6 z-10 hidden size-8 place-items-center rounded-full bg-white shadow-lift sm:grid" aria-label="เลื่อนขวา"><ChevronRight size={16} /></button>
          </div>
        </section>

        {/* สร้างตามประเภท */}
        {picker && (
          <section className="card animate-rise mt-4 p-5 sm:p-6">
            <h2 className="text-xl">{DOC_TYPES[picker].emoji} สร้าง{DOC_TYPES[picker].label}</h2>
            <p className="text-[14px] text-ink-soft">{DOC_TYPES[picker].description}</p>
            {picker !== "slides" && picker !== "sheet" && (
              <button type="button" onClick={() => start(picker)} className="tap mt-4 inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700"><Plus size={16} /> สร้างใหม่ (มีแบบฟอร์มให้)</button>
            )}
            {picker === "slides" && (
              <div className="mt-4">
                <p className="mb-2 text-[13px] text-ink-soft">🎞️ เริ่มงานนำเสนอใหม่</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {SLIDE_TEMPLATES.map((t) => (
                    <button key={t.id} type="button" onClick={() => router.push(`/studio/${createDoc("slides", { slideTemplate: t.id }).id}`)} className="card card-hover flex flex-col overflow-hidden text-left">
                      <span className="grid aspect-video place-items-center bg-gradient-to-br from-[#ffe3c8] to-white text-4xl">{t.emoji}</span>
                      <span className="p-3"><span className="block font-display text-[14px] text-purple-800">{t.title}</span><span className="block text-[12px] text-ink-soft">{t.description}</span></span>
                    </button>
                  ))}
                </div>
                <p className="mb-2 mt-4 text-[13px] text-ink-soft">หรือทำสไลด์บทเรียนจากเรื่องที่มีในเว็บ:</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {PLANS.slice(0, 6).map((p) => (
                    <button key={p.id} type="button" onClick={() => router.push(`/studio/${createDoc("slides", { planId: p.id, slideTemplate: "lesson" }).id}`)} className="card card-hover flex items-center gap-3 px-3 py-2 text-left">
                      <span className="text-2xl">{p.emoji}</span><span className="min-w-0 truncate font-display text-[15px] text-purple-800">เรื่อง {p.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {picker === "sheet" && (
              <div className="mt-4">
                <p className="mb-2 text-[13px] text-ink-soft">📊 เริ่มสเปรดชีตใหม่</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {SHEET_TEMPLATES.map((t) => (
                    <button key={t.id} type="button" onClick={() => router.push(`/studio/${createDoc("sheet", { sheetTemplate: t.id }).id}`)} className="card card-hover flex flex-col overflow-hidden text-left">
                      <span className="grid aspect-video place-items-center bg-gradient-to-br from-mint-soft to-white text-4xl">{t.emoji}</span>
                      <span className="p-3"><span className="block font-display text-[14px] text-purple-800">{t.title}</span><span className="block text-[12px] text-ink-soft">{t.description}</span></span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {(picker === "plan" || picker === "worksheet" || picker === "media") && (
              <div className="mt-4">
                <p className="mb-2 text-[13px] text-ink-soft">หรือเริ่มจากเรื่องที่มีในเว็บ (ดึงข้อมูลหน่วย/เรื่องมาให้):</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {PLANS.map((p) => (
                    <button key={p.id} type="button" onClick={() => start(picker, { planId: p.id })} className="card card-hover flex items-center gap-3 px-3 py-2 text-left">
                      <span className="text-2xl">{p.emoji}</span>
                      <span className="min-w-0"><span className="block truncate font-display text-[15px] text-purple-800">เรื่อง {p.title}</span><span className="block text-[12px] text-ink-soft">หน่วย {getUnit(p.unitId)?.name} · {p.duration}</span></span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {picker === "schedule" && (
              <div className="mt-4">
                <p className="mb-2 text-[13px] text-ink-soft">หรือเริ่มจากกำหนดการสอนที่มี:</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {SCHEDULES.map((s) => (
                    <button key={s.id} type="button" onClick={() => start("schedule", { scheduleId: s.id })} className="card card-hover flex items-center gap-3 px-3 py-2 text-left">
                      <span className="text-2xl">📅</span>
                      <span className="min-w-0"><span className="block truncate font-display text-[15px] text-purple-800">{s.title}</span><span className="block text-[12px] text-ink-soft">{s.semester} {s.year} · {s.rows.length} สัปดาห์</span></span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* แม่แบบ */}
        {panel === "templates" && (
          <section className="card animate-rise mt-4 p-5 sm:p-6">
            <h2 className="text-xl">📑 แม่แบบ</h2>
            <p className="text-[14px] text-ink-soft">เลือกแม่แบบ → สร้างเอกสารใหม่ที่มีชุดบล็อกนี้ทันที (ในเอกสารยังเพิ่มแม่แบบอื่นต่อได้)</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {TEMPLATES.map((t) => (
                <button key={t.id} type="button" onClick={() => { const d = createDoc("other", { title: t.title }); d.blocks = t.make(); import("@/lib/studio-store").then((m) => { m.saveDocLocal(d); router.push(`/studio/${d.id}`); }); }} className="card card-hover flex items-center gap-3 p-3 text-left">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-purple-100 text-2xl">{t.emoji}</span>
                  <span className="min-w-0"><span className="block font-display text-[15px] text-purple-800">{t.title}</span><span className="block text-[12px] text-ink-soft">{t.description}</span></span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* อัปโหลด */}
        {panel === "uploads" && (
          <section className="card animate-rise mt-4 p-5 text-center sm:p-6">
            <Upload className="mx-auto text-purple-400" />
            <h2 className="mt-2 text-xl">⬆️ อัปโหลดรูป / ไฟล์</h2>
            <p className="text-[14px] text-ink-soft">รูปและไฟล์แนบเก็บอยู่กับเอกสารแต่ละฉบับ — เปิดเอกสารแล้วใช้แถบ “อัปโหลด” ด้านซ้าย หรือสร้างเอกสารใหม่ตอนนี้</p>
            <button type="button" onClick={() => start("other")} className="tap mt-4 inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700"><Plus size={16} /> สร้างเอกสารแล้วอัปโหลด</button>
          </section>
        )}

        {/* ล่าสุด */}
        <section id="recent" className="mt-10 scroll-mt-24">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl sm:text-3xl">🕘 เอกสารล่าสุด</h2>
            <div className="flex flex-wrap items-center gap-2">
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as DocType | "all")} className="h-9 rounded-full border border-line bg-white px-3 text-[13px]" aria-label="ประเภท">
                <option value="all">ประเภท: ทั้งหมด</option>
                {(Object.keys(DOC_TYPES) as DocType[]).map((t) => <option key={t} value={t}>{DOC_TYPES[t].emoji} {DOC_TYPES[t].label}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as DocStatus | "all")} className="h-9 rounded-full border border-line bg-white px-3 text-[13px]" aria-label="สถานะ">
                <option value="all">สถานะ: ทั้งหมด</option>
                {(Object.keys(DOC_STATUS) as DocStatus[]).map((s) => <option key={s} value={s}>{DOC_STATUS[s].emoji} {DOC_STATUS[s].label}</option>)}
              </select>
              <span className="flex rounded-full border border-line bg-white p-0.5">
                <button type="button" onClick={() => setView("grid")} className={cn("grid size-8 place-items-center rounded-full", view === "grid" ? "bg-purple-100 text-purple-800" : "text-ink-soft")} aria-label="มุมมองการ์ด"><LayoutGrid size={15} /></button>
                <button type="button" onClick={() => setView("list")} className={cn("grid size-8 place-items-center rounded-full", view === "list" ? "bg-purple-100 text-purple-800" : "text-ink-soft")} aria-label="มุมมองรายการ"><ListIcon size={15} /></button>
              </span>
            </div>
          </div>

          {shown.length === 0 ? (
            <EmptyState emoji="📄" title={docs.length === 0 ? "ยังไม่มีเอกสาร" : "ไม่พบเอกสารที่ตรงกับเงื่อนไข"} hint="กดไอคอนด้านบนเพื่อเริ่มสร้าง — เอกสารจะบันทึกอัตโนมัติ" />
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {shown.map((d) => <DocCard key={d.id} d={d} onDup={async () => { const c = await duplicateDoc(d.id); if (c) router.push(`/studio/${c.id}`); }} onDel={async () => { if (confirm(`ลบ “${d.title}”?`)) await deleteDoc(d.id); }} />)}
            </div>
          ) : (
            <div className="card divide-y divide-line">
              {shown.map((d) => {
                const m = DOC_TYPES[d.type]; const s = DOC_STATUS[d.status];
                return (
                  <div key={d.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl text-lg", m.tint)}>{m.emoji}</span>
                    <Link href={`/studio/${d.id}`} className="min-w-0 flex-1 truncate font-display text-[15px] text-purple-800 hover:underline">{d.title || "(ไม่มีชื่อ)"}</Link>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px]", s.cls)}>{s.emoji} {s.label}</span>
                    <span className="hidden text-[12px] text-ink-soft sm:block">{timeAgo(d.updatedAt)}</span>
                    <button type="button" onClick={async () => { const c = await duplicateDoc(d.id); if (c) router.push(`/studio/${c.id}`); }} className="text-ink-soft hover:text-purple-700" title="ทำสำเนา"><Copy size={14} /></button>
                    <button type="button" onClick={async () => { if (confirm(`ลบ “${d.title}”?`)) await deleteDoc(d.id); }} className="text-ink-soft hover:text-red-500" title="ลบ"><Trash2 size={14} /></button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function DocCard({ d, onDup, onDel }: { d: StudioDoc; onDup: () => void; onDel: () => void }) {
  const m = DOC_TYPES[d.type]; const s = DOC_STATUS[d.status];
  return (
    <div className="card card-hover group relative flex flex-col overflow-hidden">
      <Link href={`/studio/${d.id}`} className={cn("flex h-32 items-center justify-center", m.tint)}>
        <div className="mx-4 w-full rounded-md bg-white/90 p-2 shadow-soft">
          <div className="mb-1 h-2 w-2/3 rounded bg-purple-200" />
          <div className="mb-1 h-1.5 w-full rounded bg-line" />
          <div className="mb-1 h-1.5 w-5/6 rounded bg-line" />
          <div className="h-1.5 w-3/4 rounded bg-line" />
        </div>
      </Link>
      <span className={cn("absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-medium", s.cls)}>{s.emoji} {s.label}</span>
      <div className="flex flex-1 flex-col p-3">
        <Link href={`/studio/${d.id}`} className="line-clamp-2 font-display text-[15px] leading-snug text-purple-800 hover:underline">{d.title || "(ไม่มีชื่อ)"}</Link>
        <p className="mt-1 text-[12px] text-ink-soft">{m.emoji} {m.label} · แก้ไข {timeAgo(d.updatedAt)}{d.dirty ? " · 🟡 รอซิงก์" : ""}</p>
        <div className="mt-2 flex gap-1">
          <button type="button" onClick={onDup} className="grid size-7 place-items-center rounded-lg text-ink-soft hover:bg-purple-50 hover:text-purple-700" title="ทำสำเนา"><Copy size={14} /></button>
          <button type="button" onClick={onDel} className="grid size-7 place-items-center rounded-lg text-ink-soft hover:bg-red-50 hover:text-red-500" title="ลบ"><Trash2 size={14} /></button>
          <Link href={`/studio/${d.id}`} className="ml-auto inline-flex items-center gap-1 rounded-full bg-purple-600 px-3 py-1 text-[12px] font-medium text-white hover:bg-purple-700"><FileText size={12} /> เปิด</Link>
        </div>
      </div>
    </div>
  );
}
