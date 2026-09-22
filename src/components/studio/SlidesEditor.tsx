"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Copy, Play, Plus, Trash2, X } from "lucide-react";
import type { Block, Slide, SlideTheme, StudioAsset } from "@/types";
import { newSlide } from "@/lib/studio-store";
import { getAsset } from "@/lib/studio-assets";
import { BlockView, InsertMenu, blockFromAsset, newBlock } from "./BlockEditor";
import { DRAG_MIME } from "./AssetPanel";
import { cn } from "@/lib/cn";

export const SLIDE_THEMES: Record<SlideTheme, { label: string; cls: string }> = {
  white: { label: "ขาว", cls: "bg-white text-ink" },
  purple: { label: "ม่วง", cls: "bg-gradient-to-br from-purple-100 via-purple-50 to-pink-soft text-ink" },
  pink: { label: "ชมพู", cls: "bg-gradient-to-br from-pink-soft to-white text-ink" },
  mint: { label: "เขียว", cls: "bg-gradient-to-br from-mint-soft to-white text-ink" },
  sky: { label: "ฟ้า", cls: "bg-gradient-to-br from-sky-soft to-white text-ink" },
  yellow: { label: "เหลือง", cls: "bg-gradient-to-br from-yellow-soft to-white text-ink" },
  dark: { label: "ม่วงเข้ม", cls: "bg-gradient-to-br from-purple-800 to-purple-600 text-white [&_h1]:text-white [&_h2]:text-white [&_.editable]:text-white" },
};

/** 🎞️ ตัวแก้ไขสไลด์: แถบภาพย่อ + สไลด์ 16:9 + โหมดนำเสนอ */
export function SlidesEditor({ slides, onChange, current, setCurrent }: { slides: Slide[]; onChange: (s: Slide[]) => void; current: number; setCurrent: (i: number) => void }) {
  const [present, setPresent] = useState(false);
  const [over, setOver] = useState(false);
  const cur = slides[current] ?? slides[0];

  const updateSlide = (id: string, fn: (s: Slide) => Slide) => onChange(slides.map((s) => (s.id === id ? fn(s) : s)));
  const setBlocks = (fn: (b: Block[]) => Block[]) => updateSlide(cur.id, (s) => ({ ...s, blocks: fn(s.blocks) }));
  const add = () => { const s = newSlide(cur?.theme ?? "white", [newBlock("heading"), newBlock("paragraph")]); onChange([...slides.slice(0, current + 1), s, ...slides.slice(current + 1)]); setCurrent(current + 1); };
  const dup = () => { const s: Slide = { ...cur, id: Math.random().toString(36).slice(2), blocks: cur.blocks.map((b) => ({ ...b, id: Math.random().toString(36).slice(2) })) }; onChange([...slides.slice(0, current + 1), s, ...slides.slice(current + 1)]); setCurrent(current + 1); };
  const del = () => { if (slides.length <= 1) return; onChange(slides.filter((s) => s.id !== cur.id)); setCurrent(Math.max(0, current - 1)); };
  const move = (dir: -1 | 1) => { const j = current + dir; if (j < 0 || j >= slides.length) return; const c = [...slides]; [c[current], c[j]] = [c[j], c[current]]; onChange(c); setCurrent(j); };
  const dropAsset = async (id: string) => { const a = await getAsset(id); if (a) setBlocks((bs) => [...bs, blockFromAsset(a as StudioAsset)]); };

  // คีย์ลัดโหมดนำเสนอ
  useEffect(() => {
    if (!present) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPresent(false);
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") setCurrent(Math.min(slides.length - 1, current + 1));
      if (e.key === "ArrowLeft" || e.key === "PageUp") setCurrent(Math.max(0, current - 1));
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [present, current, slides.length, setCurrent]);

  if (!cur) return null;

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* ภาพย่อ */}
      <aside className="no-print flex gap-2 overflow-x-auto lg:w-44 lg:flex-col lg:overflow-y-auto">
        {slides.map((s, i) => (
          <button key={s.id} type="button" onClick={() => setCurrent(i)} className={cn("relative shrink-0 overflow-hidden rounded-xl border-2 text-left transition lg:w-full", i === current ? "border-purple-500 shadow-lift" : "border-line hover:border-purple-300")}>
            <div className={cn("aspect-video w-36 p-2 lg:w-full", SLIDE_THEMES[s.theme].cls)}>
              <p className="truncate font-display text-[10px] text-purple-800">{s.blocks.find((b) => b.type === "heading" && "html" in b) ? stripHtml((s.blocks.find((b) => b.type === "heading") as Extract<Block, { type: "heading" }>).html) : "(สไลด์)"}</p>
              <div className="mt-1 h-1 w-3/4 rounded bg-black/10" /><div className="mt-0.5 h-1 w-1/2 rounded bg-black/10" />
            </div>
            <span className="absolute left-1 top-1 rounded-full bg-black/50 px-1.5 text-[10px] text-white">{i + 1}</span>
          </button>
        ))}
        <button type="button" onClick={add} className="grid aspect-video w-36 shrink-0 place-items-center rounded-xl border-2 border-dashed border-purple-200 text-purple-600 hover:bg-purple-50 lg:w-full"><Plus size={20} /></button>
      </aside>

      {/* สไลด์ปัจจุบัน */}
      <div className="min-w-0 flex-1">
        <div className="no-print mb-2 flex flex-wrap items-center gap-2 text-[13px]">
          <span className="text-ink-soft">สไลด์ {current + 1} / {slides.length}</span>
          <span className="flex items-center gap-1 rounded-full border border-line bg-white p-0.5">
            {(Object.keys(SLIDE_THEMES) as SlideTheme[]).map((t) => (
              <button key={t} type="button" onClick={() => updateSlide(cur.id, (s) => ({ ...s, theme: t }))} title={SLIDE_THEMES[t].label} className={cn("size-6 rounded-full border", SLIDE_THEMES[t].cls, cur.theme === t ? "border-purple-600 ring-2 ring-purple-300" : "border-line")} />
            ))}
          </span>
          <button type="button" onClick={() => move(-1)} className="rounded-lg px-2 py-1 hover:bg-purple-50" title="เลื่อนสไลด์ขึ้น"><ChevronLeft size={14} /></button>
          <button type="button" onClick={() => move(1)} className="rounded-lg px-2 py-1 hover:bg-purple-50" title="เลื่อนสไลด์ลง"><ChevronRight size={14} /></button>
          <button type="button" onClick={dup} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-purple-50"><Copy size={14} /> ทำสำเนา</button>
          <button type="button" onClick={del} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-red-500 hover:bg-red-50"><Trash2 size={14} /> ลบสไลด์</button>
          <button type="button" onClick={() => setPresent(true)} className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-4 py-1.5 font-medium text-white shadow-soft hover:bg-purple-700"><Play size={14} fill="currentColor" /> นำเสนอ</button>
        </div>

        <div
          onDragOver={(e) => { if (e.dataTransfer.types.includes(DRAG_MIME)) { e.preventDefault(); setOver(true); } }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { const id = e.dataTransfer.getData(DRAG_MIME); if (id) { e.preventDefault(); setOver(false); dropAsset(id); } }}
          className={cn("slide-page card relative aspect-video w-full overflow-hidden", SLIDE_THEMES[cur.theme].cls, over && "ring-4 ring-purple-400")}
        >
          <div className="absolute inset-0 overflow-y-auto p-6 sm:p-10">
            {cur.blocks.map((b, i) => (
              <div key={b.id} data-block-id={b.id}>
                <BlockView
                  block={b}
                  onChange={(nb) => setBlocks((bs) => bs.map((x) => (x.id === b.id ? nb : x)))}
                  onDelete={() => setBlocks((bs) => bs.filter((x) => x.id !== b.id))}
                  onMove={(dir) => setBlocks((bs) => { const j = i + dir; if (j < 0 || j >= bs.length) return bs; const c = [...bs]; [c[i], c[j]] = [c[j], c[i]]; return c; })}
                  onInsertAfter={(type) => setBlocks((bs) => [...bs.slice(0, i + 1), newBlock(type), ...bs.slice(i + 1)])}
                  onDropAsset={async (id) => { const a = await getAsset(id); if (a) setBlocks((bs) => [...bs.slice(0, i + 1), blockFromAsset(a), ...bs.slice(i + 1)]); }}
                />
              </div>
            ))}
            <div className="no-print mt-2 rounded-xl border border-dashed border-black/10"><InsertMenu onPick={(t) => setBlocks((bs) => [...bs, newBlock(t)])} /></div>
          </div>
        </div>

        <label className="no-print mt-3 block">
          <span className="text-[12px] text-ink-soft">🗒️ โน้ตผู้พูด (ไม่แสดงตอนนำเสนอ)</span>
          <textarea value={cur.notes ?? ""} onChange={(e) => updateSlide(cur.id, (s) => ({ ...s, notes: e.target.value }))} rows={2} className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-[14px] outline-none focus:border-purple-300" placeholder="สิ่งที่จะพูด / คำถามชวนคิด…" />
        </label>
      </div>

      {/* โหมดนำเสนอ */}
      {present && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black">
          <div className="flex flex-1 items-center justify-center p-4">
            <div className={cn("aspect-video w-full max-w-[177vh] overflow-hidden rounded-xl", SLIDE_THEMES[cur.theme].cls)}>
              <div className="h-full overflow-y-auto p-8 sm:p-14 [&_.editable]:text-[1.4em] [&_h1]:text-5xl [&_h2]:text-4xl [&_li]:text-2xl [&_p]:text-2xl">
                {cur.blocks.map((b) => <BlockView key={b.id} block={b} onChange={() => {}} onDelete={() => {}} onMove={() => {}} onInsertAfter={() => {}} readOnly />)}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <button type="button" onClick={() => setCurrent(Math.max(0, current - 1))} className="rounded-full bg-white/10 px-4 py-2 hover:bg-white/20">← ก่อนหน้า</button>
            <span className="text-sm opacity-80">{current + 1} / {slides.length} · ← → เปลี่ยนสไลด์ · Esc ออก</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setCurrent(Math.min(slides.length - 1, current + 1))} className="rounded-full bg-white/10 px-4 py-2 hover:bg-white/20">ถัดไป →</button>
              <button type="button" onClick={() => setPresent(false)} className="grid size-10 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="ออกจากโหมดนำเสนอ"><X size={18} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const stripHtml = (h: string) => h.replace(/<[^>]+>/g, "").trim();
