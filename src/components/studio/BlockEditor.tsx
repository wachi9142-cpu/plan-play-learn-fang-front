"use client";

import { useRef } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { Block } from "@/types";
import { uid } from "@/lib/studio-store";
import { cn } from "@/lib/cn";

/** แก้ไขบล็อกเดียว (contentEditable) */
export function BlockView({
  block, onChange, onDelete, onMove, onInsertAfter, readOnly = false,
}: {
  block: Block;
  onChange: (b: Block) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  onInsertAfter: (type: Block["type"]) => void;
  readOnly?: boolean;
}) {
  return (
    <div className={cn("group relative rounded-xl transition", !readOnly && "hover:bg-purple-50/60")}>
      {!readOnly && (
        <div className="no-print absolute -left-1 top-1 z-10 hidden -translate-x-full flex-col gap-0.5 pr-1 group-hover:flex">
          <IconBtn title="เลื่อนขึ้น" onClick={() => onMove(-1)}><ArrowUp size={14} /></IconBtn>
          <IconBtn title="เลื่อนลง" onClick={() => onMove(1)}><ArrowDown size={14} /></IconBtn>
          <IconBtn title="ลบบล็อก" onClick={onDelete} danger><Trash2 size={14} /></IconBtn>
        </div>
      )}
      <div className="px-3 py-1.5">
        <BlockBody block={block} onChange={onChange} readOnly={readOnly} />
      </div>
      {!readOnly && (
        <div className="no-print flex justify-center opacity-0 transition group-hover:opacity-100">
          <InsertMenu onPick={onInsertAfter} />
        </div>
      )}
    </div>
  );
}

function IconBtn({ children, onClick, title, danger = false }: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) {
  return (
    <button type="button" title={title} onClick={onClick} className={cn("grid size-7 place-items-center rounded-lg border border-line bg-white shadow-soft hover:bg-purple-50", danger ? "text-red-500" : "text-purple-700")}>
      {children}
    </button>
  );
}

const INSERT: { type: Block["type"]; emoji: string; label: string }[] = [
  { type: "paragraph", emoji: "¶", label: "ข้อความ" },
  { type: "heading", emoji: "H", label: "หัวข้อ" },
  { type: "bullets", emoji: "•", label: "รายการ" },
  { type: "table", emoji: "▦", label: "ตาราง" },
  { type: "image", emoji: "🖼️", label: "รูปภาพ" },
  { type: "callout", emoji: "💜", label: "กล่องเน้น" },
  { type: "fields", emoji: "📋", label: "ข้อมูลหัวเอกสาร" },
  { type: "divider", emoji: "—", label: "เส้นคั่น" },
];

export function InsertMenu({ onPick, big = false }: { onPick: (t: Block["type"]) => void; big?: boolean }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-1", big ? "py-3" : "py-0.5")}>
      <Plus size={14} className="text-purple-400" />
      {INSERT.map((i) => (
        <button key={i.type} type="button" onClick={() => onPick(i.type)} className={cn("rounded-full border border-line bg-white text-purple-700 hover:bg-purple-100", big ? "px-3 py-1.5 text-[14px]" : "px-2 py-0.5 text-[12px]")}>
          {i.emoji} {i.label}
        </button>
      ))}
    </div>
  );
}

export function newBlock(type: Block["type"]): Block {
  const id = uid();
  switch (type) {
    case "heading": return { id, type, level: 2, html: "หัวข้อใหม่" };
    case "paragraph": return { id, type, html: "" };
    case "bullets": return { id, type, items: ["รายการที่ 1"] };
    case "table": return { id, type, rows: [["หัวข้อ 1", "หัวข้อ 2", "หัวข้อ 3"], ["", "", ""], ["", "", ""]], header: true };
    case "image": return { id, type, src: "", caption: "" };
    case "callout": return { id, type, emoji: "💜", html: "ข้อความเน้น…", tone: "purple" };
    case "fields": return { id, type, fields: [{ label: "หน่วย", value: "" }, { label: "เรื่อง", value: "" }, { label: "วันที่", value: "" }] };
    case "divider": return { id, type };
  }
}

/* ---------- editable text ---------- */
function Editable({ html, onChange, className, placeholder, tag = "div", readOnly }: { html: string; onChange: (html: string) => void; className?: string; placeholder?: string; tag?: "div" | "span"; readOnly?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const Tag = tag as "div";
  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      contentEditable={!readOnly}
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onInput={(e) => onChange((e.currentTarget as HTMLElement).innerHTML)}
      onBlur={(e) => onChange((e.currentTarget as HTMLElement).innerHTML)}
      className={cn("editable min-h-[1.6em] outline-none focus:ring-2 focus:ring-purple-200 rounded-md px-1", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function BlockBody({ block, onChange, readOnly }: { block: Block; onChange: (b: Block) => void; readOnly?: boolean }) {
  switch (block.type) {
    case "heading": {
      const size = block.level === 1 ? "text-2xl sm:text-3xl" : block.level === 2 ? "text-xl sm:text-2xl" : "text-lg";
      return (
        <div className="flex items-start gap-2">
          {!readOnly && (
            <select value={block.level} onChange={(e) => onChange({ ...block, level: Number(e.target.value) as 1 | 2 | 3 })} className="no-print mt-1 rounded-md border border-line bg-white px-1 text-[12px] text-ink-soft" aria-label="ระดับหัวข้อ">
              <option value={1}>H1</option><option value={2}>H2</option><option value={3}>H3</option>
            </select>
          )}
          <Editable html={block.html} onChange={(html) => onChange({ ...block, html })} className={cn("flex-1 font-display text-purple-800", size)} placeholder="หัวข้อ" readOnly={readOnly} />
        </div>
      );
    }
    case "paragraph":
      return <Editable html={block.html} onChange={(html) => onChange({ ...block, html })} className="text-[15px] leading-relaxed sm:text-base" placeholder="พิมพ์ข้อความ…" readOnly={readOnly} />;
    case "bullets": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <div>
          <List className={cn("space-y-1 pl-6", block.ordered ? "list-decimal" : "list-disc")}>
            {block.items.map((it, i) => (
              <li key={i} className="text-[15px] sm:text-base">
                <div className="flex items-start gap-1">
                  <Editable tag="span" html={it} onChange={(html) => onChange({ ...block, items: block.items.map((x, j) => (j === i ? html : x)) })} className="flex-1" placeholder="รายการ" readOnly={readOnly} />
                  {!readOnly && <button type="button" onClick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })} className="no-print text-ink-soft hover:text-red-500" aria-label="ลบรายการ">×</button>}
                </div>
              </li>
            ))}
          </List>
          {!readOnly && (
            <div className="no-print mt-1 flex gap-2 text-[12px]">
              <button type="button" onClick={() => onChange({ ...block, items: [...block.items, ""] })} className="text-purple-600 hover:underline">+ เพิ่มรายการ</button>
              <button type="button" onClick={() => onChange({ ...block, ordered: !block.ordered })} className="text-ink-soft hover:underline">{block.ordered ? "เปลี่ยนเป็นจุด" : "เปลี่ยนเป็นตัวเลข"}</button>
            </div>
          )}
        </div>
      );
    }
    case "table":
      return (
        <div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[14px] sm:text-[15px]">
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => {
                      const isHead = block.header && r === 0;
                      const Cell = isHead ? "th" : "td";
                      return (
                        <Cell key={c} className={cn("border border-[#cfc3dd] px-2 py-1 align-top", isHead && "bg-purple-100 text-left font-display font-medium text-purple-800")}>
                          <Editable html={cell} onChange={(html) => onChange({ ...block, rows: block.rows.map((rr, i) => (i === r ? rr.map((x, j) => (j === c ? html : x)) : rr)) })} className="min-h-[1.4em]" readOnly={readOnly} />
                        </Cell>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!readOnly && (
            <div className="no-print mt-1 flex flex-wrap gap-2 text-[12px]">
              <button type="button" onClick={() => onChange({ ...block, rows: [...block.rows, block.rows[0].map(() => "")] })} className="text-purple-600 hover:underline">+ แถว</button>
              <button type="button" onClick={() => onChange({ ...block, rows: block.rows.map((r) => [...r, ""]) })} className="text-purple-600 hover:underline">+ คอลัมน์</button>
              <button type="button" onClick={() => block.rows.length > 1 && onChange({ ...block, rows: block.rows.slice(0, -1) })} className="text-ink-soft hover:underline">− แถวสุดท้าย</button>
              <button type="button" onClick={() => block.rows[0].length > 1 && onChange({ ...block, rows: block.rows.map((r) => r.slice(0, -1)) })} className="text-ink-soft hover:underline">− คอลัมน์สุดท้าย</button>
              <button type="button" onClick={() => onChange({ ...block, header: !block.header })} className="text-ink-soft hover:underline">{block.header ? "ไม่ใช้แถวหัว" : "ใช้แถวแรกเป็นหัว"}</button>
            </div>
          )}
        </div>
      );
    case "image":
      return (
        <figure className="text-center">
          {block.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={block.src} alt={block.caption ?? ""} style={{ width: `${block.width ?? 70}%` }} className="mx-auto rounded-xl border border-line" />
          ) : (
            <div className="no-print rounded-xl border-2 border-dashed border-purple-200 bg-purple-50 p-6 text-[14px] text-ink-soft">🖼️ ยังไม่มีรูป — เลือกไฟล์หรือวางลิงก์ด้านล่าง</div>
          )}
          {!readOnly && (
            <div className="no-print mt-2 flex flex-wrap items-center justify-center gap-2 text-[12px]">
              <label className="cursor-pointer rounded-full border border-line bg-white px-3 py-1 text-purple-700 hover:bg-purple-50">
                เลือกไฟล์รูป
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0]; if (!f) return;
                  const reader = new FileReader();
                  reader.onload = () => onChange({ ...block, src: String(reader.result) });
                  reader.readAsDataURL(f);
                }} />
              </label>
              <input type="url" placeholder="หรือวางลิงก์รูป https://…" defaultValue={block.src.startsWith("data:") ? "" : block.src} onBlur={(e) => e.target.value && onChange({ ...block, src: e.target.value })} className="w-56 rounded-full border border-line px-3 py-1" />
              <label className="flex items-center gap-1 text-ink-soft">กว้าง <input type="range" min={20} max={100} value={block.width ?? 70} onChange={(e) => onChange({ ...block, width: Number(e.target.value) })} /></label>
            </div>
          )}
          <figcaption className="mt-1">
            <Editable html={block.caption ?? ""} onChange={(caption) => onChange({ ...block, caption })} className="text-center text-[13px] text-ink-soft" placeholder="คำบรรยายภาพ (ถ้ามี)" readOnly={readOnly} />
          </figcaption>
        </figure>
      );
    case "callout": {
      const tones = { purple: "bg-purple-50 border-purple-200", yellow: "bg-yellow-soft border-yellow-accent/60", mint: "bg-mint-soft border-[#9fd8bb]", pink: "bg-pink-soft border-pink-accent/60" };
      return (
        <div className={cn("flex gap-3 rounded-xl border px-4 py-3", tones[block.tone ?? "purple"])}>
          {readOnly ? <span className="text-2xl">{block.emoji}</span> : (
            <input value={block.emoji} onChange={(e) => onChange({ ...block, emoji: e.target.value })} className="w-9 bg-transparent text-center text-2xl outline-none" aria-label="อีโมจิ" />
          )}
          <Editable html={block.html} onChange={(html) => onChange({ ...block, html })} className="flex-1 text-[15px]" placeholder="ข้อความ" readOnly={readOnly} />
          {!readOnly && (
            <select value={block.tone ?? "purple"} onChange={(e) => onChange({ ...block, tone: e.target.value as typeof block.tone })} className="no-print h-6 self-start rounded-md border border-line bg-white px-1 text-[11px]" aria-label="สีกล่อง">
              <option value="purple">ม่วง</option><option value="yellow">เหลือง</option><option value="mint">เขียว</option><option value="pink">ชมพู</option>
            </select>
          )}
        </div>
      );
    }
    case "fields":
      return (
        <div className="grid gap-1 rounded-xl border border-line bg-cream p-3 sm:grid-cols-2">
          {block.fields.map((f, i) => (
            <div key={i} className="flex items-baseline gap-2 text-[15px]">
              <Editable tag="span" html={f.label} onChange={(label) => onChange({ ...block, fields: block.fields.map((x, j) => (j === i ? { ...x, label } : x)) })} className="min-w-24 font-medium text-purple-700" readOnly={readOnly} />
              <span className="text-ink-soft">:</span>
              <Editable tag="span" html={f.value} onChange={(value) => onChange({ ...block, fields: block.fields.map((x, j) => (j === i ? { ...x, value } : x)) })} className="flex-1 border-b border-dotted border-[#bbb]" placeholder="…" readOnly={readOnly} />
              {!readOnly && <button type="button" onClick={() => onChange({ ...block, fields: block.fields.filter((_, j) => j !== i) })} className="no-print text-ink-soft hover:text-red-500" aria-label="ลบ">×</button>}
            </div>
          ))}
          {!readOnly && <button type="button" onClick={() => onChange({ ...block, fields: [...block.fields, { label: "หัวข้อ", value: "" }] })} className="no-print text-left text-[12px] text-purple-600 hover:underline">+ เพิ่มช่อง</button>}
        </div>
      );
    case "divider":
      return <hr className="my-2 border-t-2 border-dashed border-purple-200" />;
  }
}
