"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Plus, RotateCw, Trash2 } from "lucide-react";
import type { Block, CropAspect, ImageAlign, StudioAsset, TextStyle } from "@/types";
import { uid } from "@/lib/studio-store";
import { fileEmoji, fmtSize, getAsset } from "@/lib/studio-assets";
import { DRAG_MIME, useAssetUrl } from "./AssetPanel";
import { TableBlock } from "./TableBlock";
import { cn } from "@/lib/cn";

/** แก้ไขบล็อกเดียว (contentEditable) */
export function BlockView({
  block, onChange, onDelete, onMove, onInsertAfter, onDropAsset, readOnly = false,
}: {
  block: Block;
  onChange: (b: Block) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  onInsertAfter: (type: Block["type"]) => void;
  onDropAsset?: (assetId: string) => void;   // วาง asset ที่ลากมา → แทรกหลังบล็อกนี้
  readOnly?: boolean;
}) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => { if (e.dataTransfer.types.includes(DRAG_MIME)) { e.preventDefault(); setOver(true); } }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { const id = e.dataTransfer.getData(DRAG_MIME); if (id) { e.preventDefault(); setOver(false); onDropAsset?.(id); } }}
      className={cn("group relative rounded-xl transition", !readOnly && "hover:bg-purple-50/60", over && "ring-2 ring-purple-400 ring-offset-2")}
    >
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
        <div className="no-print absolute -right-1 top-1 z-10 hidden translate-x-full group-hover:block">
          <QuickInsert onPick={onInsertAfter} />
        </div>
      )}
    </div>
  );
}

/** ปุ่ม + เล็ก ๆ ข้างบล็อก: แทรกบล็อกถัดจากบล็อกนี้ (เมนูโผล่เมื่อชี้) */
function QuickInsert({ onPick }: { onPick: (t: Block["type"]) => void }) {
  return (
    <div className="group/q relative">
      <button type="button" title="แทรกบล็อกถัดจากนี้" className="grid size-7 place-items-center rounded-lg border border-line bg-white text-purple-700 shadow-soft hover:bg-purple-50"><Plus size={14} /></button>
      <div className="invisible absolute left-0 top-full z-20 w-40 rounded-xl border border-line bg-white p-1 shadow-lift group-hover/q:visible">
        {INSERT.map((i) => <button key={i.type} type="button" onClick={() => onPick(i.type)} className="block w-full rounded-lg px-2 py-1 text-left text-[12px] hover:bg-purple-50">{i.emoji} {i.label}</button>)}
      </div>
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
  { type: "file", emoji: "📎", label: "ไฟล์แนบ" },
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
    case "image": return { id, type, src: "", caption: "", width: 70, align: "center", rotate: 0 };
    case "file": return { id, type, assetId: "", name: "", mime: "", size: 0 };
    case "callout": return { id, type, emoji: "💜", html: "ข้อความเน้น…", tone: "purple" };
    case "fields": return { id, type, fields: [{ label: "หน่วย", value: "" }, { label: "เรื่อง", value: "" }, { label: "วันที่", value: "" }] };
    case "divider": return { id, type };
  }
}

/** สร้างบล็อกจาก asset ที่อัปโหลด (รูป → image, อื่น ๆ → file) */
export function blockFromAsset(a: StudioAsset): Block {
  if (a.kind === "image") return { id: uid(), type: "image", src: "", assetId: a.id, caption: "", width: 70, align: "center", rotate: 0 };
  return { id: uid(), type: "file", assetId: a.id, name: a.name, mime: a.mime, size: a.size };
}

/** รูปจาก asset (IndexedDB) หรือ src ตรง ๆ */
function useImageSrc(block: Extract<Block, { type: "image" }>) {
  const [asset, setAsset] = useState<StudioAsset | null>(null);
  useEffect(() => { let ok = true; if (block.assetId) getAsset(block.assetId).then((a) => ok && setAsset(a ?? null)); else setAsset(null); return () => { ok = false; }; }, [block.assetId]);
  const url = useAssetUrl(asset);
  return block.assetId ? url : block.src;
}

/** แปลง TextStyle → CSS */
export function textStyle(s?: TextStyle): React.CSSProperties | undefined {
  if (!s) return undefined;
  return { lineHeight: s.lineHeight, letterSpacing: s.letterSpacing !== undefined ? `${s.letterSpacing}px` : undefined, fontFamily: s.fontFamily, fontSize: s.fontSize ? `${s.fontSize}px` : undefined, textAlign: s.align };
}

const ASPECTS: Record<CropAspect, string | undefined> = { free: undefined, "1:1": "1 / 1", "4:3": "4 / 3", "3:4": "3 / 4", "16:9": "16 / 9" };

/* ---------- editable text ---------- */
function Editable({ html, onChange, className, placeholder, tag = "div", readOnly, style }: { html: string; onChange: (html: string) => void; className?: string; placeholder?: string; tag?: "div" | "span"; readOnly?: boolean; style?: React.CSSProperties }) {
  const ref = useRef<HTMLElement>(null);
  const Tag = tag as "div";
  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      style={style}
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
          <Editable html={block.html} onChange={(html) => onChange({ ...block, html })} className={cn("flex-1 font-display text-purple-800", size)} placeholder="หัวข้อ" readOnly={readOnly} style={textStyle(block.style)} />
        </div>
      );
    }
    case "paragraph":
      return <Editable html={block.html} onChange={(html) => onChange({ ...block, html })} className="text-[15px] leading-relaxed sm:text-base" placeholder="พิมพ์ข้อความ…" readOnly={readOnly} style={textStyle(block.style)} />;
    case "bullets": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <div>
          <List className={cn("space-y-1 pl-6", block.ordered ? "list-decimal" : "list-disc")} style={textStyle(block.style)}>
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
      return <TableBlock block={block} onChange={onChange} readOnly={readOnly} />;
    case "image":
      return <ImageBlock block={block} onChange={onChange} readOnly={readOnly} />;
    case "file":
      return <FileBlock block={block} readOnly={readOnly} />;
    case "callout": {
      const tones = { purple: "bg-purple-50 border-purple-200", yellow: "bg-yellow-soft border-yellow-accent/60", mint: "bg-mint-soft border-[#9fd8bb]", pink: "bg-pink-soft border-pink-accent/60" };
      return (
        <div className={cn("flex gap-3 rounded-xl border px-4 py-3", tones[block.tone ?? "purple"])}>
          {readOnly ? <span className="text-2xl">{block.emoji}</span> : (
            <input value={block.emoji} onChange={(e) => onChange({ ...block, emoji: e.target.value })} className="w-9 bg-transparent text-center text-2xl outline-none" aria-label="อีโมจิ" />
          )}
          <Editable html={block.html} onChange={(html) => onChange({ ...block, html })} className="flex-1 text-[15px]" placeholder="ข้อความ" readOnly={readOnly} style={textStyle(block.style)} />
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

/* ---------- image block: ย่อ/ขยาย จัดตำแหน่ง ครอป หมุน ---------- */
function ImageBlock({ block, onChange, readOnly }: { block: Extract<Block, { type: "image" }>; onChange: (b: Block) => void; readOnly?: boolean }) {
  const src = useImageSrc(block);
  const align: ImageAlign = block.align ?? "center";
  const rotate = block.rotate ?? 0;
  const crop = block.crop ?? { aspect: "free" as CropAspect, x: 50, y: 50 };
  const justify = align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";
  return (
    <figure>
      <div className={cn("flex", justify)}>
        {src ? (
          <div style={{ width: `${block.width ?? 70}%`, aspectRatio: ASPECTS[crop.aspect] }} className="overflow-hidden rounded-xl border border-line bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={block.caption ?? ""}
              draggable={false}
              style={{ transform: `rotate(${rotate}deg)`, objectPosition: `${crop.x}% ${crop.y}%`, width: rotate % 180 ? "auto" : "100%", height: rotate % 180 ? "100%" : (crop.aspect === "free" ? "auto" : "100%") }}
              className={cn("mx-auto block", crop.aspect !== "free" && "size-full object-cover")}
            />
          </div>
        ) : (
          <div className="no-print w-full rounded-xl border-2 border-dashed border-purple-200 bg-purple-50 p-6 text-center text-[14px] text-ink-soft">🖼️ ลากรูปจากแถบด้านซ้ายมาวางที่นี่ หรือเลือกไฟล์/วางลิงก์ด้านล่าง</div>
        )}
      </div>

      {!readOnly && (
        <div className="no-print mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-xl bg-cream px-3 py-2 text-[12px]">
          <label className="cursor-pointer rounded-full border border-line bg-white px-3 py-1 text-purple-700 hover:bg-purple-50">
            เลือกไฟล์รูป
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => onChange({ ...block, src: String(r.result), assetId: undefined }); r.readAsDataURL(f); }} />
          </label>
          <input type="url" placeholder="หรือวางลิงก์รูป" defaultValue={block.src.startsWith("data:") ? "" : block.src} onBlur={(e) => e.target.value && onChange({ ...block, src: e.target.value, assetId: undefined })} className="w-40 rounded-full border border-line px-3 py-1" />
          <label className="flex items-center gap-1 text-ink-soft">↔ ขนาด <input type="range" min={15} max={100} value={block.width ?? 70} onChange={(e) => onChange({ ...block, width: Number(e.target.value) })} /> {block.width ?? 70}%</label>
          <span className="flex items-center gap-0.5 rounded-full border border-line bg-white p-0.5">
            {(["left", "center", "right"] as ImageAlign[]).map((a) => (
              <button key={a} type="button" onClick={() => onChange({ ...block, align: a })} className={cn("rounded-full px-2 py-0.5", align === a ? "bg-purple-600 text-white" : "text-ink hover:bg-purple-50")}>{a === "left" ? "⬅ ซ้าย" : a === "center" ? "กลาง" : "ขวา ➡"}</button>
            ))}
          </span>
          <button type="button" onClick={() => onChange({ ...block, rotate: (((rotate + 90) % 360) as 0 | 90 | 180 | 270) })} className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-0.5 text-purple-700 hover:bg-purple-50"><RotateCw size={12} /> หมุน {rotate}°</button>
          <label className="flex items-center gap-1 text-ink-soft">✂ ครอป
            <select value={crop.aspect} onChange={(e) => onChange({ ...block, crop: { ...crop, aspect: e.target.value as CropAspect } })} className="rounded-md border border-line bg-white px-1 py-0.5">
              <option value="free">ไม่ครอป</option><option value="1:1">1:1 จัตุรัส</option><option value="4:3">4:3</option><option value="3:4">3:4</option><option value="16:9">16:9</option>
            </select>
          </label>
          {crop.aspect !== "free" && (
            <>
              <label className="flex items-center gap-1 text-ink-soft">↔ <input type="range" min={0} max={100} value={crop.x} onChange={(e) => onChange({ ...block, crop: { ...crop, x: Number(e.target.value) } })} /></label>
              <label className="flex items-center gap-1 text-ink-soft">↕ <input type="range" min={0} max={100} value={crop.y} onChange={(e) => onChange({ ...block, crop: { ...crop, y: Number(e.target.value) } })} /></label>
            </>
          )}
        </div>
      )}
      <figcaption className="mt-1">
        <Editable html={block.caption ?? ""} onChange={(caption) => onChange({ ...block, caption })} className="text-center text-[13px] text-ink-soft" placeholder="คำบรรยายภาพ (ถ้ามี)" readOnly={readOnly} />
      </figcaption>
    </figure>
  );
}

/* ---------- file block: ไฟล์แนบ PDF/Word/PPT ---------- */
function FileBlock({ block, readOnly }: { block: Extract<Block, { type: "file" }>; readOnly?: boolean }) {
  const [asset, setAsset] = useState<StudioAsset | null>(null);
  useEffect(() => { let ok = true; if (block.assetId) getAsset(block.assetId).then((a) => ok && setAsset(a ?? null)); return () => { ok = false; }; }, [block.assetId]);
  const url = useAssetUrl(asset);
  if (!block.assetId) {
    return <div className="no-print rounded-xl border-2 border-dashed border-purple-200 bg-purple-50 p-4 text-center text-[14px] text-ink-soft">📎 ลากไฟล์จากแถบด้านซ้าย (แท็บ “ไฟล์”) มาวางที่นี่</div>;
  }
  return (
    <a href={url || undefined} target="_blank" rel="noopener" className="flex items-center gap-3 rounded-xl border border-line bg-cream px-4 py-3 hover:bg-purple-50">
      <span className="text-3xl">{fileEmoji(block.mime, block.name)}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-purple-800">{block.name}</span>
        <span className="block text-[12px] text-ink-soft">{fmtSize(block.size)} · {asset ? "กดเพื่อเปิด" : "ไม่พบไฟล์ในเครื่องนี้"}{readOnly ? "" : ""}</span>
      </span>
    </a>
  );
}
