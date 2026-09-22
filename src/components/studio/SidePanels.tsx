"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Block, StudioAsset, StudioDoc } from "@/types";
import { DOC_TYPES, listDocs, uid } from "@/lib/studio-store";
import { PLANS, getUnit } from "@/data/plans";
import { SCHEDULES } from "@/data/schedules";
import { getGamesForPlan } from "@/data/games";
import { getWorksheetsForPlan } from "@/data/worksheets";
import { TEACHING_MEDIA } from "@/data/content";
import { CORE_ACTIVITIES } from "@/data/core-activities";
import { AssetPanel } from "./AssetPanel";
import { InsertMenu } from "./BlockEditor";
import { cn } from "@/lib/cn";

export type RailTab = "templates" | "elements" | "uploads" | "projects" | "links";

export const RAIL: { id: RailTab; emoji: string; label: string }[] = [
  { id: "templates", emoji: "📑", label: "แม่แบบ" },
  { id: "elements", emoji: "🧩", label: "องค์ประกอบ" },
  { id: "uploads", emoji: "⬆️", label: "อัปโหลด" },
  { id: "projects", emoji: "📚", label: "เอกสารของฉัน" },
  { id: "links", emoji: "🔗", label: "เชื่อมข้อมูล" },
];

/* ---------- แม่แบบ: ชุดบล็อกสำเร็จรูป ---------- */
const h = (level: 1 | 2 | 3, html: string): Block => ({ id: uid(), type: "heading", level, html });
const p = (html: string): Block => ({ id: uid(), type: "paragraph", html });
const ul = (items: string[]): Block => ({ id: uid(), type: "bullets", items });
const ol = (items: string[]): Block => ({ id: uid(), type: "bullets", items, ordered: true });
const table = (rows: string[][], header = true): Block => ({ id: uid(), type: "table", rows, header });
const callout = (emoji: string, html: string, tone: "purple" | "yellow" | "mint" | "pink" = "purple"): Block => ({ id: uid(), type: "callout", emoji, html, tone });
const fields = (f: { label: string; value: string }[]): Block => ({ id: uid(), type: "fields", fields: f });

export const TEMPLATES: { id: string; emoji: string; title: string; description: string; make: () => Block[] }[] = [
  { id: "ws-header", emoji: "📝", title: "หัวกระดาษใบงาน", description: "ชื่อ–นามสกุล–ห้อง–วันที่ + คำสั่ง", make: () => [fields([{ label: "ชื่อ", value: "" }, { label: "นามสกุล", value: "" }, { label: "ห้อง", value: "" }, { label: "วันที่", value: "" }]), callout("📌", "คำสั่ง: …", "yellow")] },
  { id: "plan-header", emoji: "📖", title: "หัวเอกสารแผน", description: "ระดับชั้น หน่วย เรื่อง สาระ ระยะเวลา ครู", make: () => [fields([{ label: "ระดับชั้น", value: "อนุบาล 1" }, { label: "หน่วยการเรียนรู้", value: "" }, { label: "เรื่อง", value: "" }, { label: "สาระการเรียนรู้", value: "" }, { label: "ระยะเวลา", value: "" }, { label: "ครูผู้สอน", value: "Teacher Kaowfang" }])] },
  { id: "objectives", emoji: "🎯", title: "จุดประสงค์ + สาระ", description: "สองหัวข้อพร้อมรายการ", make: () => [h(2, "🎯 จุดประสงค์"), ul(["เด็กสามารถ…"]), h(2, "📚 สาระการเรียนรู้"), ul(["…"])] },
  { id: "steps", emoji: "👣", title: "ขั้นตอนกิจกรรม", description: "ขั้นนำ–ขั้นสอน–ขั้นสรุป", make: () => [h(2, "🧸 กิจกรรม"), ol(["ขั้นนำ: …", "ขั้นสอน: …", "ขั้นสรุป: …"])] },
  { id: "daily", emoji: "🗓️", title: "ตารางกิจกรรม จ.–ศ.", description: "ตาราง 5 วัน × 6 กิจกรรมหลัก", make: () => [h(2, "🗓️ กิจกรรมรายวัน"), table([["กิจกรรม", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"], ...CORE_ACTIVITIES.map((c) => [`${c.emoji} ${c.short}`, "", "", "", "", ""])])] },
  { id: "schedule20", emoji: "📅", title: "ตารางกำหนดการสอน 20 สัปดาห์", description: "สัปดาห์ · วันที่ · สาระ · หน่วย · หมายเหตุ", make: () => [table([["สัปดาห์ที่", "วัน เดือน ปี", "สาระการเรียนรู้", "หน่วยการจัดประสบการณ์", "หมายเหตุ"], ...Array.from({ length: 20 }, (_, i) => [String(i + 1), "", "", "", ""])])] },
  { id: "materials-assess", emoji: "🧺", title: "สื่อ + การประเมิน", description: "สองหัวข้อพร้อมรายการ", make: () => [h(2, "🧺 สื่อ / อุปกรณ์"), ul(["…"]), h(2, "📋 การประเมิน"), ul(["สังเกต…", "ตรวจผลงาน…"])] },
  { id: "reflection", emoji: "💜", title: "บันทึกหลังสอน", description: "กล่องบันทึกผล/ปัญหา/แนวทางแก้ไข", make: () => [h(2, "💜 บันทึกหลังสอน"), callout("✅", "ผลการจัดกิจกรรม: …", "mint"), callout("⚠️", "ปัญหา/อุปสรรค: …", "yellow"), callout("💡", "แนวทางแก้ไข: …", "purple")] },
  { id: "media-card", emoji: "🎨", title: "การ์ดสื่อการสอน", description: "ชื่อสื่อ ประเภท วิธีใช้ + ที่วางรูป", make: () => [h(2, "🎨 ชื่อสื่อ"), fields([{ label: "ประเภทสื่อ", value: "" }, { label: "ใช้กับหน่วย", value: "" }]), { id: uid(), type: "image", src: "", caption: "", width: 70, align: "center", rotate: 0 }, h(3, "วิธีใช้"), ol(["…"])] },
  { id: "signature", emoji: "✍️", title: "ช่องลงชื่อ", description: "ครูผู้สอน / ผู้ตรวจ", make: () => [p("ลงชื่อ ……………………………… ครูผู้สอน &nbsp;&nbsp;&nbsp;&nbsp; ลงชื่อ ……………………………… ผู้ตรวจ")] },
];

export function TemplatesPanel({ onInsert }: { onInsert: (blocks: Block[]) => void }) {
  const [q, setQ] = useState("");
  const list = TEMPLATES.filter((t) => !q || (t.title + t.description).includes(q));
  return (
    <PanelShell title="📑 แม่แบบ" hint="กดเพื่อแทรกชุดบล็อกต่อท้ายเอกสาร">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาแม่แบบ…" className="mb-3 w-full rounded-xl border border-line bg-white px-3 py-2 text-[14px] outline-none focus:border-purple-300" />
      <div className="grid gap-2">
        {list.map((t) => (
          <button key={t.id} type="button" onClick={() => onInsert(t.make())} className="card card-hover flex items-center gap-3 p-3 text-left">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-purple-100 text-xl">{t.emoji}</span>
            <span className="min-w-0"><span className="block font-display text-[14px] text-purple-800">{t.title}</span><span className="block text-[12px] text-ink-soft">{t.description}</span></span>
          </button>
        ))}
      </div>
    </PanelShell>
  );
}

/* ---------- องค์ประกอบ ---------- */
const STICKERS = ["💜", "🌷", "🌱", "⭐", "🎈", "🧸", "🎨", "🎵", "🌳", "🧩", "🍎", "🐰", "🦋", "☀️", "🌈", "✅", "❌", "👉", "📌", "💡"];
const SHAPES = ["●", "■", "▲", "◆", "★", "♥", "→", "←", "↑", "↓", "✂", "☐", "☑", "○", "□", "△"];

export function ElementsPanel({ onInsertBlock, onInsertText }: { onInsertBlock: (type: Block["type"]) => void; onInsertText: (html: string) => void }) {
  return (
    <PanelShell title="🧩 องค์ประกอบ" hint="บล็อก สติกเกอร์ และรูปทรง">
      <p className="mb-1 text-[12px] font-medium text-ink-soft">บล็อก</p>
      <div className="rounded-xl border border-line bg-white"><InsertMenu big onPick={onInsertBlock} /></div>
      <p className="mb-1 mt-4 text-[12px] font-medium text-ink-soft">สติกเกอร์ (กดเพื่อแทรก)</p>
      <div className="grid grid-cols-5 gap-1">{STICKERS.map((s) => <button key={s} type="button" onClick={() => onInsertText(`<span style="font-size:48px">${s}</span>`)} className="grid aspect-square place-items-center rounded-xl bg-white text-2xl shadow-soft hover:bg-purple-50">{s}</button>)}</div>
      <p className="mb-1 mt-4 text-[12px] font-medium text-ink-soft">รูปทรง / สัญลักษณ์</p>
      <div className="grid grid-cols-6 gap-1">{SHAPES.map((s) => <button key={s} type="button" onClick={() => onInsertText(`<span style="font-size:40px;color:#6d3aa8">${s}</span>`)} className="grid aspect-square place-items-center rounded-xl bg-white text-xl text-purple-700 shadow-soft hover:bg-purple-50">{s}</button>)}</div>
    </PanelShell>
  );
}

/* ---------- เอกสารของฉัน ---------- */
export function ProjectsPanel({ currentId }: { currentId: string }) {
  const [docs, setDocs] = useState<StudioDoc[]>([]);
  useEffect(() => { const load = () => setDocs(listDocs()); load(); window.addEventListener("lpg-studio-change", load); return () => window.removeEventListener("lpg-studio-change", load); }, []);
  return (
    <PanelShell title="📚 เอกสารของฉัน" hint="เปิดเอกสารอื่น">
      <div className="grid gap-1.5">
        {docs.map((d) => (
          <Link key={d.id} href={`/studio/${d.id}`} className={cn("flex items-center gap-2 rounded-xl px-3 py-2 text-[14px]", d.id === currentId ? "bg-purple-100 text-purple-800" : "bg-white hover:bg-purple-50")}>
            <span>{DOC_TYPES[d.type].emoji}</span><span className="truncate">{d.title || "(ไม่มีชื่อ)"}</span>
          </Link>
        ))}
      </div>
      <Link href="/studio" className="mt-3 inline-block text-[13px] font-medium text-purple-700 hover:underline">← กลับหน้า Garden Studio</Link>
    </PanelShell>
  );
}

/* ---------- เชื่อมข้อมูล ---------- */
export function LinksPanel({ doc, onChange }: { doc: StudioDoc; onChange: (links: StudioDoc["links"]) => void }) {
  const plan = doc.links.planId ? PLANS.find((x) => x.id === doc.links.planId) : undefined;
  const games = plan ? getGamesForPlan(plan.id) : [];
  const worksheets = plan ? getWorksheetsForPlan(plan.id) : [];
  const media = plan ? TEACHING_MEDIA.filter((m) => plan.related?.mediaIds?.includes(m.id)) : [];
  const types = plan ? Array.from(new Set(plan.weeks.flatMap((w) => w.days.flatMap((d) => d.activities.map((a) => a.type))))) : [];
  return (
    <PanelShell title="🔗 เชื่อมกับข้อมูลในเว็บ" hint="กำหนดการสอน → แผน → กิจกรรม → เกม/ใบงาน/สื่อ">
      <label className="block text-[12px] text-ink-soft">แผนการจัดประสบการณ์ (เรื่อง)</label>
      <select value={doc.links.planId ?? ""} onChange={(e) => onChange({ ...doc.links, planId: e.target.value || undefined })} className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px]">
        <option value="">— ไม่เชื่อม —</option>
        {PLANS.map((p) => <option key={p.id} value={p.id}>{p.emoji} เรื่องที่ {p.number} {p.title} (หน่วย {getUnit(p.unitId)?.name})</option>)}
      </select>
      <label className="mt-3 block text-[12px] text-ink-soft">กำหนดการสอน</label>
      <select value={doc.links.scheduleId ?? ""} onChange={(e) => onChange({ ...doc.links, scheduleId: e.target.value || undefined })} className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px]">
        <option value="">— ไม่เชื่อม —</option>
        {SCHEDULES.map((s) => <option key={s.id} value={s.id}>📅 {s.title} · {s.semester} {s.year}</option>)}
      </select>
      {(plan || doc.links.scheduleId) && (
        <div className="mt-3 grid gap-1 text-[13px]">
          {plan && <Link href={`/plans/${plan.id}`} className="text-purple-700 hover:underline">📖 เปิดหน้าแผน เรื่อง {plan.title} →</Link>}
          {doc.links.scheduleId && <Link href={`/schedules/${doc.links.scheduleId}`} className="text-purple-700 hover:underline">📅 เปิดกำหนดการสอน →</Link>}
        </div>
      )}
      {plan && (
        <div className="mt-4 border-t border-line pt-3">
          <p className="font-display text-[14px] text-purple-800">🧩 สิ่งที่ใช้ในเรื่องนี้</p>
          {types.length > 0 && <div className="mt-1 flex flex-wrap gap-1">{types.map((ty) => { const c = CORE_ACTIVITIES.find((x) => x.type === ty); return c ? <Link key={ty} href={`/core-activities/${ty}`} className="rounded-full bg-purple-100 px-2 py-0.5 text-[12px] text-purple-800">{c.emoji} {c.short}</Link> : null; })}</div>}
          <Rel title="🎮 เกมที่ใช้" items={games.map((g) => ({ href: `/games/${g.id}`, label: `${g.emoji} ${g.title}` }))} />
          <Rel title="📝 ใบงานที่ใช้" items={worksheets.map((w) => ({ href: `/worksheets/${w.id}`, label: `${w.emoji} ${w.title}` }))} />
          <Rel title="🎨 สื่อที่ใช้" items={media.map((m) => ({ href: `/media#${m.id}`, label: `${m.emoji} ${m.title}` }))} />
        </div>
      )}
    </PanelShell>
  );
}

function Rel({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-2">
      <p className="text-[12px] text-ink-soft">{title}</p>
      <ul className="mt-1 grid gap-0.5">{items.map((i) => <li key={i.href}><Link href={i.href} className="block truncate rounded-md px-1 text-[13px] text-purple-800 hover:bg-purple-50">{i.label}</Link></li>)}</ul>
    </div>
  );
}

export function UploadsPanel({ docId, onInsert }: { docId: string; onInsert: (a: StudioAsset) => void }) {
  return <AssetPanel docId={docId} onInsert={onInsert} />;
}

function PanelShell({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="card flex h-full flex-col overflow-hidden">
      <div className="border-b border-line px-4 py-3">
        <p className="font-display text-[15px] text-purple-800">{title}</p>
        {hint && <p className="text-[12px] text-ink-soft">{hint}</p>}
      </div>
      <div className="no-scrollbar flex-1 overflow-y-auto p-3">{children}</div>
    </div>
  );
}
