"use client";

import { AlignCenter, AlignLeft, AlignRight, Bold, Highlighter, Indent, Italic, List, ListOrdered, Outdent, Palette, Strikethrough, Underline } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * แถบจัดรูปแบบข้อความ (ตามภาพอ้างอิง): หัวข้อ · ฟอนต์ · ขนาด · สี · ไฮไลต์ · B I U S · จัดชิด · รายการ · ย่อหน้า
 * ทำงานกับข้อความที่เลือกในบล็อก contentEditable (document.execCommand)
 */
const FONTS = [
  { label: "Sarabun (อ่านง่าย)", value: "var(--font-sarabun), Sarabun, sans-serif" },
  { label: "Mitr (หัวข้อน่ารัก)", value: "var(--font-mitr), Mitr, sans-serif" },
  { label: "System", value: "system-ui, sans-serif" },
];
const SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48];
const COLORS = ["#3b2f4a", "#6d3aa8", "#a8456c", "#2b5c8a", "#2e6b4c", "#8a6a00", "#e53935", "#111111"];
const HILITES = ["transparent", "#fff1bf", "#fde4ec", "#e2f5ec", "#e3f0fb", "#ece0f8"];

export function FormatToolbar({ onHeading }: { onHeading?: (level: 0 | 1 | 2 | 3) => void }) {
  const exec = (cmd: string, value?: string) => { document.execCommand("styleWithCSS", false, "true"); document.execCommand(cmd, false, value); };

  /** ใส่ขนาดตัวอักษรเป็น px กับข้อความที่เลือก (execCommand fontSize ให้ได้แค่ 1–7 จึงแปลงเป็น span style) */
  const setSize = (px: number) => {
    exec("fontSize", "7");
    document.querySelectorAll('font[size="7"]').forEach((el) => {
      const span = document.createElement("span");
      span.style.fontSize = `${px}px`;
      span.innerHTML = (el as HTMLElement).innerHTML;
      el.replaceWith(span);
    });
    // แจ้ง React ว่าเนื้อหาเปลี่ยน
    document.activeElement?.dispatchEvent(new Event("input", { bubbles: true }));
  };
  const setFont = (v: string) => { exec("fontName", v); document.activeElement?.dispatchEvent(new Event("input", { bubbles: true })); };
  const fire = () => document.activeElement?.dispatchEvent(new Event("input", { bubbles: true }));

  const stop = (e: React.MouseEvent) => e.preventDefault(); // กันไม่ให้เสีย selection

  return (
    <div className="no-print flex flex-wrap items-center gap-1 rounded-2xl border border-line bg-white px-2 py-1.5 shadow-soft">
      {/* หัวข้อ */}
      <select onMouseDown={(e) => e.stopPropagation()} onChange={(e) => { onHeading?.(Number(e.target.value) as 0 | 1 | 2 | 3); e.target.value = ""; }} defaultValue="" className="h-8 rounded-lg border border-line bg-cream px-2 text-[13px]" title="เปลี่ยนบล็อกที่กำลังแก้เป็นหัวข้อ/ข้อความ">
        <option value="" disabled>H ▾</option>
        <option value="1">H1 หัวข้อใหญ่</option>
        <option value="2">H2 หัวข้อ</option>
        <option value="3">H3 หัวข้อย่อย</option>
        <option value="0">¶ ข้อความ</option>
      </select>
      {/* ฟอนต์ */}
      <select onChange={(e) => setFont(e.target.value)} defaultValue={FONTS[0].value} onMouseDown={(e) => e.stopPropagation()} className="h-8 w-36 rounded-lg border border-line bg-white px-2 text-[13px]" title="ฟอนต์">
        {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
      </select>
      {/* ขนาด */}
      <select onChange={(e) => setSize(Number(e.target.value))} defaultValue="16" onMouseDown={(e) => e.stopPropagation()} className="h-8 rounded-lg border border-line bg-white px-1 text-[13px]" title="ขนาดตัวอักษร">
        {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <Sep />
      {/* สีตัวอักษร */}
      <Menu icon={<Palette size={15} />} title="สีตัวอักษร">
        {COLORS.map((c) => <button key={c} type="button" onMouseDown={stop} onClick={() => { exec("foreColor", c); fire(); }} className="size-6 rounded-full border border-white shadow-soft" style={{ background: c }} aria-label={c} />)}
      </Menu>
      {/* ไฮไลต์ */}
      <Menu icon={<Highlighter size={15} />} title="ไฮไลต์">
        {HILITES.map((c) => <button key={c} type="button" onMouseDown={stop} onClick={() => { exec("hiliteColor", c); fire(); }} className="size-6 rounded-full border border-line" style={{ background: c === "transparent" ? "repeating-linear-gradient(45deg,#fff 0 4px,#ddd 4px 6px)" : c }} aria-label={c} />)}
      </Menu>

      <Sep />
      <Tb onClick={() => { exec("bold"); fire(); }} title="ตัวหนา (Ctrl+B)"><Bold size={15} /></Tb>
      <Tb onClick={() => { exec("italic"); fire(); }} title="ตัวเอียง (Ctrl+I)"><Italic size={15} /></Tb>
      <Tb onClick={() => { exec("underline"); fire(); }} title="ขีดเส้นใต้ (Ctrl+U)"><Underline size={15} /></Tb>
      <Tb onClick={() => { exec("strikeThrough"); fire(); }} title="ขีดฆ่า"><Strikethrough size={15} /></Tb>

      <Sep />
      <Tb onClick={() => { exec("justifyLeft"); fire(); }} title="ชิดซ้าย"><AlignLeft size={15} /></Tb>
      <Tb onClick={() => { exec("justifyCenter"); fire(); }} title="กึ่งกลาง"><AlignCenter size={15} /></Tb>
      <Tb onClick={() => { exec("justifyRight"); fire(); }} title="ชิดขวา"><AlignRight size={15} /></Tb>

      <Sep />
      <Tb onClick={() => { exec("insertUnorderedList"); fire(); }} title="รายการจุด"><List size={15} /></Tb>
      <Tb onClick={() => { exec("insertOrderedList"); fire(); }} title="รายการตัวเลข"><ListOrdered size={15} /></Tb>
      <Tb onClick={() => { exec("indent"); fire(); }} title="ย่อหน้าเข้า"><Indent size={15} /></Tb>
      <Tb onClick={() => { exec("outdent"); fire(); }} title="ย่อหน้าออก"><Outdent size={15} /></Tb>
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

function Menu({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="group relative">
      <Tb onClick={() => {}} title={title}>{icon}</Tb>
      <div className="invisible absolute left-0 top-full z-40 flex gap-1.5 rounded-xl border border-line bg-white p-2 shadow-lift group-hover:visible">
        {children}
      </div>
    </div>
  );
}
