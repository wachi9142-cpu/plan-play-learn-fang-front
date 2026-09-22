"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Bold, Copy, Italic, Link2, Printer, Save, Trash2, Underline, WifiOff } from "lucide-react";
import type { Block, SaveStatus, StudioDoc } from "@/types";
import { DOC_TYPES, deleteDoc, duplicateDoc, saveDocLocal, syncDoc, syncPending } from "@/lib/studio-store";
import { PLANS, getPlan, getUnit } from "@/data/plans";
import { SCHEDULES } from "@/data/schedules";
import { getGamesForPlan } from "@/data/games";
import { getWorksheetsForPlan } from "@/data/worksheets";
import { TEACHING_MEDIA } from "@/data/content";
import { CORE_ACTIVITIES } from "@/data/core-activities";
import { BlockView, InsertMenu, newBlock } from "./BlockEditor";
import { cn } from "@/lib/cn";

const STATUS: Record<SaveStatus, { dot: string; label: string }> = {
  saved: { dot: "bg-green-500", label: "บันทึกแล้ว" },
  saving: { dot: "bg-yellow-400 animate-pulse", label: "กำลังบันทึก…" },
  unsaved: { dot: "bg-red-500", label: "ยังไม่ได้บันทึก" },
  offline: { dot: "bg-red-500", label: "ออฟไลน์ — เก็บไว้ในเครื่อง รอซิงก์" },
  "local-only": { dot: "bg-green-500", label: "บันทึกในเครื่องแล้ว · ยังไม่ได้เชื่อมบัญชี" },
  error: { dot: "bg-red-500", label: "การเชื่อมต่อมีปัญหา — เก็บไว้ในเครื่องแล้ว" },
};

/** ตัวแก้ไขเอกสาร Garden Studio: Auto Save + บันทึกเอง + ออฟไลน์ + เชื่อมข้อมูล */
export function DocEditor({ initial }: { initial: StudioDoc }) {
  const router = useRouter();
  const [doc, setDoc] = useState<StudioDoc>(initial);
  const [status, setStatus] = useState<SaveStatus>(initial.dirty ? "unsaved" : "saved");
  const [online, setOnline] = useState(true);
  const [showLinks, setShowLinks] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const docRef = useRef(doc);
  docRef.current = doc;

  /* ---- บันทึก ---- */
  const persist = useCallback(async () => {
    setStatus("saving");
    const saved = saveDocLocal(docRef.current);          // เก็บในเครื่องก่อนเสมอ
    docRef.current = { ...docRef.current, updatedAt: saved.updatedAt };
    if (!navigator.onLine) { setStatus("offline"); return; }
    const r = await syncDoc(saved);
    setStatus(r === "synced" ? "saved" : r === "local-only" ? "local-only" : "error");
  }, []);

  const scheduleSave = useCallback(() => {
    setStatus("unsaved");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(persist, 900);              // ⚡ Auto Save หลังหยุดพิมพ์ ~1 วินาที
  }, [persist]);

  const update = (patch: Partial<StudioDoc>) => { setDoc((d) => ({ ...d, ...patch })); scheduleSave(); };
  const setBlocks = (fn: (b: Block[]) => Block[]) => update({ blocks: fn(docRef.current.blocks) });

  /* ---- ออนไลน์/ออฟไลน์ ---- */
  useEffect(() => {
    setOnline(navigator.onLine);
    const on = async () => { setOnline(true); await syncPending(); await persist(); };
    const off = () => { setOnline(false); setStatus("offline"); };
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, [persist]);

  // Ctrl+S / เตือนก่อนปิดหน้าถ้ายังไม่ได้บันทึก
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); if (timer.current) clearTimeout(timer.current); persist(); } };
    const unload = (e: BeforeUnloadEvent) => { if (status === "unsaved" || status === "saving") { e.preventDefault(); } };
    window.addEventListener("keydown", key); window.addEventListener("beforeunload", unload);
    return () => { window.removeEventListener("keydown", key); window.removeEventListener("beforeunload", unload); };
  }, [persist, status]);

  /* ---- จัดรูปแบบข้อความ ---- */
  const fmt = (cmd: "bold" | "italic" | "underline") => { document.execCommand(cmd); };

  /* ---- ข้อมูลที่เชื่อมโยง ---- */
  const plan = doc.links.planId ? getPlan(doc.links.planId) : undefined;
  const related = useMemo(() => {
    if (!plan) return null;
    return {
      games: getGamesForPlan(plan.id),
      worksheets: getWorksheetsForPlan(plan.id),
      media: TEACHING_MEDIA.filter((m) => plan.related?.mediaIds?.includes(m.id)),
      types: Array.from(new Set(plan.weeks.flatMap((w) => w.days.flatMap((d) => d.activities.map((a) => a.type))))),
    };
  }, [plan]);

  const st = STATUS[status];
  const t = DOC_TYPES[doc.type];

  return (
    <div className="min-h-dvh bg-cream">
      {/* Toolbar */}
      <div className="no-print sticky top-16 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="container-page flex flex-wrap items-center gap-2 py-2">
          <Link href="/studio" className="tap inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[14px] text-purple-700 hover:bg-purple-50"><ArrowLeft size={16} /> Studio</Link>
          <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[12px] text-purple-800">{t.emoji} {t.label}</span>

          <div className="mx-1 h-6 w-px bg-line" />
          <Tb onClick={() => fmt("bold")} title="ตัวหนา (Ctrl+B)"><Bold size={15} /></Tb>
          <Tb onClick={() => fmt("italic")} title="ตัวเอียง (Ctrl+I)"><Italic size={15} /></Tb>
          <Tb onClick={() => fmt("underline")} title="ขีดเส้นใต้ (Ctrl+U)"><Underline size={15} /></Tb>
          <div className="mx-1 h-6 w-px bg-line" />
          <Tb onClick={() => setShowLinks((v) => !v)} title="เชื่อมกับแผน/กำหนดการ" active={showLinks}><Link2 size={15} /> <span className="hidden sm:inline">เชื่อมข้อมูล</span></Tb>
          <Tb onClick={() => window.print()} title="พิมพ์ / บันทึก PDF"><Printer size={15} /> <span className="hidden sm:inline">พิมพ์</span></Tb>
          <Tb onClick={() => { const c = duplicateDoc(doc.id); if (c) router.push(`/studio/${c.id}`); }} title="ทำสำเนา"><Copy size={15} /></Tb>
          <Tb onClick={() => { if (confirm("ลบเอกสารนี้?")) { deleteDoc(doc.id); router.push("/studio"); } }} title="ลบเอกสาร" danger><Trash2 size={15} /></Tb>

          <div className="ml-auto flex items-center gap-2">
            {!online && <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[12px] text-red-600"><WifiOff size={13} /> ออฟไลน์</span>}
            <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-soft"><span className={cn("size-2.5 rounded-full", st.dot)} /> {st.label}</span>
            <button type="button" onClick={() => { if (timer.current) clearTimeout(timer.current); persist(); }} className="tap inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-4 py-1.5 text-[14px] font-medium text-white shadow-soft hover:bg-purple-700">
              <Save size={15} /> บันทึก
            </button>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-6 py-6 lg:grid-cols-[1fr_300px]">
        {/* เอกสาร */}
        <div className="min-w-0">
          <div className="doc-page card mx-auto w-full max-w-[210mm] px-6 py-8 sm:px-12 sm:py-12">
            <input
              value={doc.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="ชื่อเอกสาร"
              className="mb-4 w-full bg-transparent font-display text-2xl text-purple-800 outline-none placeholder:text-ink-soft/50 sm:text-3xl"
              aria-label="ชื่อเอกสาร"
            />
            <div className="pl-0 sm:pl-2">
              {doc.blocks.map((b, i) => (
                <BlockView
                  key={b.id}
                  block={b}
                  onChange={(nb) => setBlocks((bs) => bs.map((x) => (x.id === b.id ? nb : x)))}
                  onDelete={() => setBlocks((bs) => bs.filter((x) => x.id !== b.id))}
                  onMove={(dir) => setBlocks((bs) => { const j = i + dir; if (j < 0 || j >= bs.length) return bs; const c = [...bs]; [c[i], c[j]] = [c[j], c[i]]; return c; })}
                  onInsertAfter={(type) => setBlocks((bs) => [...bs.slice(0, i + 1), newBlock(type), ...bs.slice(i + 1)])}
                />
              ))}
            </div>
            <div className="no-print mt-4 rounded-xl border-2 border-dashed border-purple-200">
              <InsertMenu big onPick={(type) => setBlocks((bs) => [...bs, newBlock(type)])} />
            </div>
          </div>
          <p className="no-print mt-3 text-center text-[12px] text-ink-soft">
            ⚡ บันทึกอัตโนมัติทุกครั้งที่หยุดพิมพ์ · Ctrl+S บันทึกทันที · เอกสารเก็บในเครื่องนี้และจะซิงก์เข้าบัญชีเมื่อเชื่อมต่อระบบหลังบ้าน
          </p>
        </div>

        {/* แถบข้าง: เชื่อมข้อมูล */}
        <aside className={cn("no-print space-y-4 lg:sticky lg:top-32 lg:self-start", !showLinks && "hidden lg:block")}>
          <div className="card p-4">
            <h3 className="text-base">🔗 เชื่อมกับข้อมูลในเว็บ</h3>
            <label className="mt-2 block text-[13px] text-ink-soft">แผนการจัดประสบการณ์ (เรื่อง)</label>
            <select value={doc.links.planId ?? ""} onChange={(e) => update({ links: { ...doc.links, planId: e.target.value || undefined } })} className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-[14px]">
              <option value="">— ไม่เชื่อม —</option>
              {PLANS.map((p) => <option key={p.id} value={p.id}>{p.emoji} เรื่องที่ {p.number} {p.title} (หน่วย {getUnit(p.unitId)?.name})</option>)}
            </select>
            <label className="mt-3 block text-[13px] text-ink-soft">กำหนดการสอน</label>
            <select value={doc.links.scheduleId ?? ""} onChange={(e) => update({ links: { ...doc.links, scheduleId: e.target.value || undefined } })} className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-[14px]">
              <option value="">— ไม่เชื่อม —</option>
              {SCHEDULES.map((s) => <option key={s.id} value={s.id}>📅 {s.title} · {s.semester} {s.year}</option>)}
            </select>
            {(plan || doc.links.scheduleId) && (
              <div className="mt-3 grid gap-1 text-[13px]">
                {plan && <Link href={`/plans/${plan.id}`} className="text-purple-700 hover:underline">📖 เปิดหน้าแผน เรื่อง {plan.title} →</Link>}
                {doc.links.scheduleId && <Link href={`/schedules/${doc.links.scheduleId}`} className="text-purple-700 hover:underline">📅 เปิดกำหนดการสอน →</Link>}
              </div>
            )}
          </div>

          {related && (
            <div className="card p-4">
              <h3 className="text-base">🧩 สิ่งที่ใช้ในเรื่องนี้</h3>
              {related.types.length > 0 && (
                <div className="mt-2">
                  <p className="text-[12px] text-ink-soft">🎈 กิจกรรมหลักที่เกี่ยวข้อง</p>
                  <div className="mt-1 flex flex-wrap gap-1">{related.types.map((ty) => { const c = CORE_ACTIVITIES.find((x) => x.type === ty); return c ? <Link key={ty} href={`/core-activities/${ty}`} className="rounded-full bg-purple-100 px-2 py-0.5 text-[12px] text-purple-800 hover:bg-purple-200">{c.emoji} {c.short}</Link> : null; })}</div>
                </div>
              )}
              <RelList title="🎮 เกมที่ใช้" items={related.games.map((g) => ({ href: `/games/${g.id}`, label: `${g.emoji} ${g.title}` }))} />
              <RelList title="📝 ใบงานที่ใช้" items={related.worksheets.map((w) => ({ href: `/worksheets/${w.id}`, label: `${w.emoji} ${w.title}` }))} />
              <RelList title="🎨 สื่อที่ใช้" items={related.media.map((m) => ({ href: `/media#${m.id}`, label: `${m.emoji} ${m.title}` }))} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Tb({ children, onClick, title, active = false, danger = false }: { children: React.ReactNode; onClick: () => void; title: string; active?: boolean; danger?: boolean }) {
  return (
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onClick} title={title} aria-label={title} className={cn("inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-[13px] transition", active ? "bg-purple-100 text-purple-800" : danger ? "text-red-500 hover:bg-red-50" : "text-ink hover:bg-purple-50")}>
      {children}
    </button>
  );
}

function RelList({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-2">
      <p className="text-[12px] text-ink-soft">{title}</p>
      <ul className="mt-1 grid gap-0.5">{items.map((i) => <li key={i.href}><Link href={i.href} className="block truncate rounded-md px-1 text-[13px] text-purple-800 hover:bg-purple-50">{i.label}</Link></li>)}</ul>
    </div>
  );
}
