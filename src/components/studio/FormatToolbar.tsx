"use client";

import { useEffect, useRef, useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, Bold, Highlighter, Indent, Italic, List, ListOrdered, Outdent, Palette, Plus, Strikethrough, Trash2, Underline } from "lucide-react";
import type { TextStyle } from "@/types";
import { RECOMMENDED_FONTS, addFont, ensureGoogleFonts, listFonts, removeFont, type UserFont } from "@/lib/studio-fonts";
import { cn } from "@/lib/cn";

/**
 * แถบจัดรูปแบบข้อความ: หัวข้อ · ฟอนต์ (แนะนำ/ของฉัน/เพิ่มฟอนต์) · ขนาด · สี · ไฮไลต์ · B I U S · จัดชิด · รายการ · ย่อหน้า · ระยะบรรทัด · ระยะตัวอักษร
 * - จัดรูปแบบ "ข้อความที่เลือก" ผ่าน execCommand (เก็บใน HTML ของบล็อก)
 * - ระยะบรรทัด/ตัวอักษร/ฟอนต์ทั้งบล็อก ผ่าน onBlockStyle (เก็บใน block.style)
 */
const SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];
const COLORS = ["#3b2f4a", "#6d3aa8", "#a8456c", "#2b5c8a", "#2e6b4c", "#8a6a00", "#e53935", "#111111"];
const HILITES = ["transparent", "#fff1bf", "#fde4ec", "#e2f5ec", "#e3f0fb", "#ece0f8"];
const LINE_HEIGHTS = [1, 1.2, 1.5, 1.75, 2, 2.5];
const LETTER_SPACINGS = [0, 0.5, 1, 2, 3];

export function FormatToolbar({ onHeading, onBlockStyle }: { onHeading?: (level: 0 | 1 | 2 | 3) => void; onBlockStyle?: (patch: TextStyle) => void }) {
  const [fonts, setFonts] = useState<UserFont[]>([]);
  const [fontErr, setFontErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ensureGoogleFonts();
    const load = () => listFonts().then(setFonts);
    load();
    window.addEventListener("lpg-fonts-change", load);
    return () => window.removeEventListener("lpg-fonts-change", load);
  }, []);

  const exec = (cmd: string, value?: string) => { document.execCommand("styleWithCSS", false, "true"); document.execCommand(cmd, false, value); };
  const fire = () => document.activeElement?.dispatchEvent(new Event("input", { bubbles: true }));
  const hasSelection = () => { const s = window.getSelection(); return !!s && !s.isCollapsed; };

  /** ฟอนต์: มีข้อความที่เลือก → ใส่เฉพาะส่วนนั้น, ไม่มี → ทั้งบล็อกที่กำลังแก้ */
  const applyFont = (family: string) => {
    if (hasSelection()) { exec("fontName", family); fire(); } else onBlockStyle?.({ fontFamily: family });
  };
  const applySize = (px: number) => {
    if (hasSelection()) {
      exec("fontSize", "7");
      document.querySelectorAll('font[size="7"]').forEach((el) => { const span = document.createElement("span"); span.style.fontSize = `${px}px`; span.innerHTML = (el as HTMLElement).innerHTML; el.replaceWith(span); });
      fire();
    } else onBlockStyle?.({ fontSize: px });
  };

  const onAddFont = async (f?: File) => {
    if (!f) return;
    setFontErr("");
    try { const font = await addFont(f); applyFont(font.family); } catch (e) { setFontErr((e as Error).message); }
  };

  const stop = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div className="no-print flex flex-wrap items-center gap-1 rounded-2xl border border-line bg-white px-2 py-1.5 shadow-soft">
      <select onChange={(e) => { onHeading?.(Number(e.target.value) as 0 | 1 | 2 | 3); e.target.value = ""; }} defaultValue="" className="h-8 rounded-lg border border-line bg-cream px-2 text-[13px]" title="หัวข้อ / ข้อความ">
        <option value="" disabled>H ▾</option>
        <option value="1">H1 หัวเรื่อง</option>
        <option value="2">H2 หัวข้อ</option>
        <option value="3">H3 หัวข้อย่อย</option>
        <option value="0">¶ เนื้อหา</option>
      </select>

      {/* ฟอนต์ */}
      <select
        onChange={(e) => { if (e.target.value === "__add") { fileRef.current?.click(); e.target.value = ""; return; } applyFont(e.target.value); }}
        defaultValue=""
        onMouseDown={(e) => e.stopPropagation()}
        className="h-8 w-44 rounded-lg border border-line bg-white px-2 text-[13px]"
        title="ฟอนต์ (เลือกข้อความก่อนเพื่อใส่เฉพาะส่วน หรือไม่เลือกเพื่อใส่ทั้งบล็อก)"
      >
        <option value="" disabled>🔤 ฟอนต์</option>
        <optgroup label="ฟอนต์แนะนำ">
          {RECOMMENDED_FONTS.map((f) => <option key={f.label} value={f.family} style={{ fontFamily: f.family }}>{f.label}</option>)}
        </optgroup>
        <optgroup label="ฟอนต์ของฉัน">
          {fonts.length === 0 && <option disabled>— ยังไม่มี —</option>}
          {fonts.map((f) => <option key={f.id} value={f.family} style={{ fontFamily: f.family }}>{f.name}</option>)}
        </optgroup>
        <option value="__add">＋ เพิ่มฟอนต์ (.ttf / .otf)…</option>
      </select>
      <input ref={fileRef} type="file" accept=".ttf,.otf,.woff,.woff2" className="hidden" onChange={(e) => onAddFont(e.target.files?.[0])} />
      <Menu icon={<span className="text-[12px] font-medium">My Fonts</span>} title="จัดการฟอนต์ของฉัน" wide>
        <div className="w-56">
          <p className="mb-1 text-[12px] font-medium text-purple-800">🔤 ฟอนต์ของฉัน</p>
          {fonts.length === 0 && <p className="text-[12px] text-ink-soft">ยังไม่มีฟอนต์ที่อัปโหลด</p>}
          <ul className="grid gap-1">
            {fonts.map((f) => (
              <li key={f.id} className="flex items-center gap-2 text-[13px]">
                <button type="button" onMouseDown={stop} onClick={() => applyFont(f.family)} className="min-w-0 flex-1 truncate rounded-md px-1 text-left hover:bg-purple-50" style={{ fontFamily: f.family }}>{f.name}</button>
                <button type="button" onMouseDown={stop} onClick={() => removeFont(f.id)} className="text-ink-soft hover:text-red-500" aria-label="ลบฟอนต์"><Trash2 size={13} /></button>
              </li>
            ))}
          </ul>
          <button type="button" onMouseDown={stop} onClick={() => fileRef.current?.click()} className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-full bg-purple-600 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-purple-700"><Plus size={13} /> เพิ่มฟอนต์</button>
          <p className="mt-1 text-[11px] text-ink-soft">รองรับ .ttf .otf .woff .woff2 — ตรวจสอบไฟล์ก่อนใช้งาน เก็บในเครื่องนี้</p>
          {fontErr && <p className="mt-1 text-[11px] text-red-600">⚠️ {fontErr}</p>}
        </div>
      </Menu>

      {/* ขนาด */}
      <select onChange={(e) => { applySize(Number(e.target.value)); e.target.value = ""; }} defaultValue="" onMouseDown={(e) => e.stopPropagation()} className="h-8 rounded-lg border border-line bg-white px-1 text-[13px]" title="ขนาดตัวอักษร">
        <option value="" disabled>ขนาด</option>
        {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <Sep />
      <Menu icon={<Palette size={15} />} title="สีตัวอักษร">
        {COLORS.map((c) => <button key={c} type="button" onMouseDown={stop} onClick={() => { exec("foreColor", c); fire(); }} className="size-6 rounded-full border border-white shadow-soft" style={{ background: c }} aria-label={c} />)}
      </Menu>
      <Menu icon={<Highlighter size={15} />} title="ไฮไลต์">
        {HILITES.map((c) => <button key={c} type="button" onMouseDown={stop} onClick={() => { exec("hiliteColor", c); fire(); }} className="size-6 rounded-full border border-line" style={{ background: c === "transparent" ? "repeating-linear-gradient(45deg,#fff 0 4px,#ddd 4px 6px)" : c }} aria-label={c} />)}
      </Menu>

      <Sep />
      <Tb onClick={() => { exec("bold"); fire(); }} title="ตัวหนา (Ctrl+B)"><Bold size={15} /></Tb>
      <Tb onClick={() => { exec("italic"); fire(); }} title="ตัวเอียง (Ctrl+I)"><Italic size={15} /></Tb>
      <Tb onClick={() => { exec("underline"); fire(); }} title="ขีดเส้นใต้ (Ctrl+U)"><Underline size={15} /></Tb>
      <Tb onClick={() => { exec("strikeThrough"); fire(); }} title="ขีดฆ่า"><Strikethrough size={15} /></Tb>

      <Sep />
      <Tb onClick={() => { exec("justifyLeft"); fire(); onBlockStyle?.({ align: "left" }); }} title="ชิดซ้าย"><AlignLeft size={15} /></Tb>
      <Tb onClick={() => { exec("justifyCenter"); fire(); onBlockStyle?.({ align: "center" }); }} title="กึ่งกลาง"><AlignCenter size={15} /></Tb>
      <Tb onClick={() => { exec("justifyRight"); fire(); onBlockStyle?.({ align: "right" }); }} title="ชิดขวา"><AlignRight size={15} /></Tb>

      <Sep />
      <Tb onClick={() => { exec("insertUnorderedList"); fire(); }} title="รายการจุด"><List size={15} /></Tb>
      <Tb onClick={() => { exec("insertOrderedList"); fire(); }} title="รายการตัวเลข"><ListOrdered size={15} /></Tb>
      <Tb onClick={() => { exec("indent"); fire(); }} title="ย่อหน้าเข้า"><Indent size={15} /></Tb>
      <Tb onClick={() => { exec("outdent"); fire(); }} title="ย่อหน้าออก"><Outdent size={15} /></Tb>

      <Sep />
      <select onChange={(e) => { onBlockStyle?.({ lineHeight: Number(e.target.value) }); e.target.value = ""; }} defaultValue="" onMouseDown={(e) => e.stopPropagation()} className="h-8 rounded-lg border border-line bg-white px-1 text-[13px]" title="ระยะห่างระหว่างบรรทัด (ทั้งบล็อก)">
        <option value="" disabled>↕ บรรทัด</option>
        {LINE_HEIGHTS.map((v) => <option key={v} value={v}>{v}</option>)}
      </select>
      <select onChange={(e) => { onBlockStyle?.({ letterSpacing: Number(e.target.value) }); e.target.value = ""; }} defaultValue="" onMouseDown={(e) => e.stopPropagation()} className="h-8 rounded-lg border border-line bg-white px-1 text-[13px]" title="ระยะห่างตัวอักษร (ทั้งบล็อก)">
        <option value="" disabled>↔ ตัวอักษร</option>
        {LETTER_SPACINGS.map((v) => <option key={v} value={v}>{v} px</option>)}
      </select>
    </div>
  );
}

function Sep() { return <span className="mx-0.5 h-6 w-px bg-line" />; }

export function Tb({ children, onClick, title, active = false, danger = false, className }: { children: React.ReactNode; onClick: () => void; title: string; active?: boolean; danger?: boolean; className?: string }) {
  return (
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onClick} title={title} aria-label={title} className={cn("inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[13px] transition", active ? "bg-purple-100 text-purple-800" : danger ? "text-red-500 hover:bg-red-50" : "text-ink hover:bg-purple-50", className)}>
      {children}
    </button>
  );
}

function Menu({ icon, title, children, wide = false }: { icon: React.ReactNode; title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="group relative">
      <Tb onClick={() => {}} title={title}>{icon}</Tb>
      <div className={cn("invisible absolute left-0 top-full z-40 rounded-xl border border-line bg-white p-2 shadow-lift group-hover:visible", wide ? "" : "flex gap-1.5")}>
        {children}
      </div>
    </div>
  );
}
