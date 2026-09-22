"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Copy, Printer, Save, Trash2, WifiOff, X } from "lucide-react";
import type { Block, DocStatus, SaveStatus, StudioAsset, StudioDoc, TextStyle } from "@/types";
import { DOC_STATUS, DOC_TYPES, deleteDoc, duplicateDoc, saveDocLocal, syncDoc, syncPending } from "@/lib/studio-store";
import { getAsset } from "@/lib/studio-assets";
import { BlockView, InsertMenu, blockFromAsset, newBlock } from "./BlockEditor";
import { DRAG_MIME } from "./AssetPanel";
import { FormatToolbar, Tb } from "./FormatToolbar";
import { ElementsPanel, LinksPanel, ProjectsPanel, RAIL, TemplatesPanel, UploadsPanel, type RailTab } from "./SidePanels";
import { cn } from "@/lib/cn";

const STATUS: Record<SaveStatus, { dot: string; label: string }> = {
  saved: { dot: "bg-green-500", label: "บันทึกแล้ว" },
  saving: { dot: "bg-yellow-400 animate-pulse", label: "กำลังบันทึก…" },
  unsaved: { dot: "bg-red-500", label: "ยังไม่ได้บันทึก" },
  offline: { dot: "bg-red-500", label: "ออฟไลน์ — เก็บไว้ในเครื่อง รอซิงก์" },
  "local-only": { dot: "bg-green-500", label: "บันทึกในเครื่องแล้ว" },
  error: { dot: "bg-red-500", label: "การเชื่อมต่อมีปัญหา — เก็บไว้ในเครื่องแล้ว" },
};

/** ตัวแก้ไขเอกสาร Garden Studio: แถบซ้าย (แม่แบบ/องค์ประกอบ/อัปโหลด/เอกสาร/เชื่อมข้อมูล) + แถบจัดรูปแบบ + Auto Save */
export function DocEditor({ initial }: { initial: StudioDoc }) {
  const router = useRouter();
  const [doc, setDoc] = useState<StudioDoc>(initial);
  const [status, setStatus] = useState<SaveStatus>(initial.dirty ? "unsaved" : "saved");
  const [online, setOnline] = useState(true);
  const [tab, setTab] = useState<RailTab | null>("uploads");
  const [endOver, setEndOver] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const docRef = useRef(doc);
  docRef.current = doc;

  /* ---- บันทึก ---- */
  const persist = useCallback(async () => {
    setStatus("saving");
    const saved = saveDocLocal(docRef.current);
    docRef.current = { ...docRef.current, updatedAt: saved.updatedAt };
    if (!navigator.onLine) { setStatus("offline"); return; }
    const r = await syncDoc(saved);
    setStatus(r === "synced" ? "saved" : r === "local-only" ? "local-only" : "error");
  }, []);
  const scheduleSave = useCallback(() => {
    setStatus("unsaved");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(persist, 900);
  }, [persist]);
  const update = (patch: Partial<StudioDoc>) => { setDoc((d) => ({ ...d, ...patch })); scheduleSave(); };
  const setBlocks = (fn: (b: Block[]) => Block[]) => update({ blocks: fn(docRef.current.blocks) });

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = async () => { setOnline(true); await syncPending(); await persist(); };
    const off = () => { setOnline(false); setStatus("offline"); };
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, [persist]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); if (timer.current) clearTimeout(timer.current); persist(); } };
    const unload = (e: BeforeUnloadEvent) => { if (status === "unsaved" || status === "saving") e.preventDefault(); };
    window.addEventListener("keydown", key); window.addEventListener("beforeunload", unload);
    return () => { window.removeEventListener("keydown", key); window.removeEventListener("beforeunload", unload); };
  }, [persist, status]);

  /* ---- แทรก ---- */
  const insertAsset = async (a: StudioAsset | string, afterIndex?: number) => {
    const asset = typeof a === "string" ? await getAsset(a) : a;
    if (!asset) return;
    const b = blockFromAsset(asset);
    setBlocks((bs) => (afterIndex === undefined ? [...bs, b] : [...bs.slice(0, afterIndex + 1), b, ...bs.slice(afterIndex + 1)]));
  };
  const appendBlocks = (blocks: Block[]) => setBlocks((bs) => [...bs, ...blocks]);

  /** เปลี่ยนบล็อกที่กำลังแก้ไข (มี focus) เป็นหัวข้อ/ข้อความ */
  const changeHeading = (level: 0 | 1 | 2 | 3) => {
    const el = document.activeElement?.closest("[data-block-id]") as HTMLElement | null;
    const id = el?.dataset.blockId;
    if (!id) return;
    setBlocks((bs) => bs.map((b) => {
      if (b.id !== id || (b.type !== "heading" && b.type !== "paragraph")) return b;
      return level === 0 ? { id: b.id, type: "paragraph", html: b.html } : { id: b.id, type: "heading", level, html: b.html };
    }));
  };

  /** ใส่สไตล์ระดับบล็อก (ระยะบรรทัด/ตัวอักษร/ฟอนต์/ขนาด) ให้บล็อกที่กำลังแก้ไข */
  const styleBlock = (patch: TextStyle) => {
    const el = document.activeElement?.closest("[data-block-id]") as HTMLElement | null;
    const id = el?.dataset.blockId;
    if (!id) return;
    setBlocks((bs) => bs.map((b) => ("style" in b || b.type === "heading" || b.type === "paragraph" || b.type === "bullets" || b.type === "callout") && b.id === id ? ({ ...b, style: { ...(b as { style?: TextStyle }).style, ...patch } } as Block) : b));
  };

  const st = STATUS[status];
  const t = DOC_TYPES[doc.type];
  const ds = DOC_STATUS[doc.status];

  return (
    <div className="min-h-dvh bg-cream">
      {/* แถบบนของเอกสาร */}
      <div className="no-print sticky top-16 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 sm:px-4">
          <Link href="/studio" className="tap inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[14px] text-purple-700 hover:bg-purple-50"><ArrowLeft size={16} /> Studio</Link>
          <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[12px] text-purple-800">{t.emoji} {t.label}</span>
          <select value={doc.status} onChange={(e) => update({ status: e.target.value as DocStatus })} className={cn("h-7 rounded-full border-0 px-2.5 text-[12px] font-medium", ds.cls)} title="สถานะเอกสาร">
            {(Object.keys(DOC_STATUS) as DocStatus[]).map((k) => <option key={k} value={k}>{DOC_STATUS[k].emoji} {DOC_STATUS[k].label}</option>)}
          </select>
          <input value={doc.title} onChange={(e) => update({ title: e.target.value })} placeholder="ชื่อเอกสาร" className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1 font-display text-[16px] text-purple-800 outline-none hover:bg-purple-50 focus:bg-purple-50" aria-label="ชื่อเอกสาร" />
          <div className="ml-auto flex items-center gap-1.5">
            {!online && <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[12px] text-red-600"><WifiOff size={13} /> ออฟไลน์</span>}
            <span className="hidden items-center gap-1.5 text-[12px] text-ink-soft sm:inline-flex"><span className={cn("size-2.5 rounded-full", st.dot)} /> {st.label}</span>
            <Tb onClick={() => window.print()} title="พิมพ์ / บันทึก PDF"><Printer size={15} /></Tb>
            <Tb onClick={async () => { const c = await duplicateDoc(doc.id); if (c) router.push(`/studio/${c.id}`); }} title="ทำสำเนา"><Copy size={15} /></Tb>
            <Tb onClick={async () => { if (confirm("ลบเอกสารนี้?")) { await deleteDoc(doc.id); router.push("/studio"); } }} title="ลบเอกสาร" danger><Trash2 size={15} /></Tb>
            <button type="button" onClick={() => { if (timer.current) clearTimeout(timer.current); persist(); }} className="tap inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-4 py-1.5 text-[14px] font-medium text-white shadow-soft hover:bg-purple-700"><Save size={15} /> บันทึก</button>
          </div>
        </div>
        <div className="px-3 pb-2 sm:px-4"><FormatToolbar onHeading={changeHeading} onBlockStyle={styleBlock} /></div>
      </div>

      <div className="flex">
        {/* Rail ซ้าย */}
        <nav className="no-print sticky top-[8.5rem] hidden h-[calc(100dvh-8.5rem)] w-[72px] shrink-0 flex-col items-center gap-1 border-r border-line bg-white py-3 md:flex" aria-label="เครื่องมือ">
          {RAIL.map((r) => (
            <button key={r.id} type="button" onClick={() => setTab(tab === r.id ? null : r.id)} className={cn("flex w-16 flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] leading-tight transition", tab === r.id ? "bg-purple-100 text-purple-800" : "text-ink-soft hover:bg-purple-50 hover:text-purple-700")}>
              <span className="text-2xl">{r.emoji}</span>{r.label}
            </button>
          ))}
        </nav>

        {/* แผงซ้าย */}
        {tab && (
          <div className="no-print sticky top-[8.5rem] hidden h-[calc(100dvh-8.5rem)] w-[300px] shrink-0 border-r border-line bg-cream p-3 md:block">
            <button type="button" onClick={() => setTab(null)} className="absolute right-2 top-2 z-10 grid size-7 place-items-center rounded-full bg-white text-ink-soft shadow-soft hover:text-purple-700" aria-label="ปิดแผง"><X size={14} /></button>
            {tab === "templates" && <TemplatesPanel onInsert={appendBlocks} />}
            {tab === "elements" && <ElementsPanel onInsertBlock={(ty) => setBlocks((bs) => [...bs, newBlock(ty)])} onInsertText={(html) => setBlocks((bs) => [...bs, { ...newBlock("paragraph"), html } as Block])} />}
            {tab === "uploads" && <UploadsPanel docId={doc.id} onInsert={(a) => insertAsset(a)} />}
            {tab === "projects" && <ProjectsPanel currentId={doc.id} />}
            {tab === "links" && <LinksPanel doc={doc} onChange={(links) => update({ links })} />}
          </div>
        )}

        {/* พื้นที่เอกสาร */}
        <div className="min-w-0 flex-1 px-3 py-5 sm:px-6">
          {/* มือถือ: เลือกแผงเป็นชิป */}
          <div className="no-print mb-3 flex gap-1.5 overflow-x-auto md:hidden">
            {RAIL.map((r) => <button key={r.id} type="button" onClick={() => setTab(tab === r.id ? null : r.id)} className={cn("shrink-0 rounded-full border px-3 py-1 text-[13px]", tab === r.id ? "border-purple-600 bg-purple-600 text-white" : "border-line bg-white")}>{r.emoji} {r.label}</button>)}
          </div>
          {tab && (
            <div className="no-print mb-4 h-[60vh] md:hidden">
              {tab === "templates" && <TemplatesPanel onInsert={appendBlocks} />}
              {tab === "elements" && <ElementsPanel onInsertBlock={(ty) => setBlocks((bs) => [...bs, newBlock(ty)])} onInsertText={(html) => setBlocks((bs) => [...bs, { ...newBlock("paragraph"), html } as Block])} />}
              {tab === "uploads" && <UploadsPanel docId={doc.id} onInsert={(a) => insertAsset(a)} />}
              {tab === "projects" && <ProjectsPanel currentId={doc.id} />}
              {tab === "links" && <LinksPanel doc={doc} onChange={(links) => update({ links })} />}
            </div>
          )}

          <div className="doc-page card mx-auto w-full max-w-[210mm] px-6 py-8 sm:px-12 sm:py-12">
            <h1 className="mb-4 font-display text-2xl text-purple-800 sm:text-3xl print:block">{doc.title}</h1>
            <div className="pl-0 sm:pl-2">
              {doc.blocks.map((b, i) => (
                <div key={b.id} data-block-id={b.id}>
                  <BlockView
                    block={b}
                    onChange={(nb) => setBlocks((bs) => bs.map((x) => (x.id === b.id ? nb : x)))}
                    onDelete={() => setBlocks((bs) => bs.filter((x) => x.id !== b.id))}
                    onMove={(dir) => setBlocks((bs) => { const j = i + dir; if (j < 0 || j >= bs.length) return bs; const c = [...bs]; [c[i], c[j]] = [c[j], c[i]]; return c; })}
                    onInsertAfter={(type) => setBlocks((bs) => [...bs.slice(0, i + 1), newBlock(type), ...bs.slice(i + 1)])}
                    onDropAsset={(assetId) => insertAsset(assetId, i)}
                  />
                </div>
              ))}
            </div>
            {/* วางท้ายเอกสาร */}
            <div
              onDragOver={(e) => { if (e.dataTransfer.types.includes(DRAG_MIME)) { e.preventDefault(); setEndOver(true); } }}
              onDragLeave={() => setEndOver(false)}
              onDrop={(e) => { const id = e.dataTransfer.getData(DRAG_MIME); if (id) { e.preventDefault(); setEndOver(false); insertAsset(id); } }}
              className={cn("no-print mt-4 rounded-xl border-2 border-dashed transition", endOver ? "border-purple-500 bg-purple-50" : "border-purple-200")}
            >
              <InsertMenu big onPick={(type) => setBlocks((bs) => [...bs, newBlock(type)])} />
              <p className="pb-2 text-center text-[12px] text-ink-soft">หรือลากรูป/ไฟล์จากแถบ “อัปโหลด” มาวางที่นี่</p>
            </div>
          </div>
          <p className="no-print mt-3 text-center text-[12px] text-ink-soft">
            ⚡ บันทึกอัตโนมัติเมื่อหยุดพิมพ์ · Ctrl+S บันทึกทันที · เก็บในเครื่องนี้ก่อนเสมอ และจะซิงก์เข้าบัญชีเมื่อเชื่อมต่อระบบหลังบ้าน
          </p>
        </div>
      </div>
    </div>
  );
}
