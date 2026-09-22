"use client";

import type { Block, StudioDoc } from "@/types";
import { getAsset, listAssets } from "./studio-assets";

/**
 * 📥 ส่งออกเอกสาร Garden Studio
 * - PDF/พิมพ์: ใช้หน้าต่างพิมพ์ของเบราว์เซอร์ (รักษาหน้าตาเหมือนที่ออกแบบมากที่สุด → เลือก "Save as PDF")
 * - PNG/JPG: จับภาพหน้าเอกสาร/สไลด์ปัจจุบัน (html-to-image)
 * - Word: สร้างจากบล็อก (docx) — การจัดวางอาจคลาดเคลื่อนได้บ้าง
 * - PowerPoint: สไลด์ → pptx (pptxgenjs); เอกสารทั่วไป → 1 บล็อกกลุ่ม/สไลด์
 * - Text: ข้อความล้วน
 * - ZIP: ทั้งหมด + รูป/ไฟล์แนบ + สำเนา JSON
 */
const strip = (h: string) => h.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li)>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
const imgsOf = (h: string) => Array.from(h.matchAll(/<img[^>]+src="([^"]+)"/g), (m) => m[1]);
const hex = (c?: string) => (c && /^#[0-9a-f]{6}$/i.test(c) ? c.slice(1).toUpperCase() : undefined);
const safe = (s: string) => (s || "เอกสาร").replace(/[\\/:*?"<>|]+/g, "-").slice(0, 80);

export function download(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

/* ---------- Text ---------- */
export function docToText(doc: StudioDoc): string {
  const lines: string[] = [doc.title, ""];
  const walk = (blocks: Block[]) => {
    for (const b of blocks) {
      switch (b.type) {
        case "heading": lines.push("", strip(b.html).toUpperCase(), ""); break;
        case "paragraph": lines.push(strip(b.html)); break;
        case "bullets": b.items.forEach((it, i) => lines.push(`${b.ordered ? `${i + 1}.` : "•"} ${strip(it)}`)); break;
        case "table": b.rows.forEach((r) => lines.push(r.map(strip).join(" | "))); lines.push(""); break;
        case "callout": lines.push(`${b.emoji} ${strip(b.html)}`); break;
        case "fields": b.fields.forEach((f) => lines.push(`${strip(f.label)}: ${strip(f.value)}`)); break;
        case "image": if (b.caption) lines.push(`[รูป] ${strip(b.caption)}`); break;
        case "file": lines.push(`[ไฟล์แนบ] ${b.name}`); break;
        case "divider": lines.push("----------"); break;
      }
    }
  };
  if (doc.type === "slides") doc.slides?.forEach((s, i) => { lines.push(`=== สไลด์ ${i + 1} ===`); walk(s.blocks); if (s.notes) lines.push(`(โน้ต: ${s.notes})`); lines.push(""); });
  else if (doc.type === "sheet") doc.sheet?.rows.forEach((r) => lines.push(r.join("\t")));
  else walk(doc.blocks);
  return lines.join("\n");
}
export const exportText = (doc: StudioDoc) => download(new Blob([docToText(doc)], { type: "text/plain;charset=utf-8" }), `${safe(doc.title)}.txt`);

/* ---------- PNG / JPG ---------- */
const pageEl = () => document.querySelector<HTMLElement>(".doc-page, .slide-page, .sheet-page");
const noPrint = (n: HTMLElement) => !(n.classList?.contains("no-print"));

/** จับภาพองค์ประกอบเป็น canvas (ใช้ toSvg แล้ววาดเอง เพื่อไม่พึ่ง requestAnimationFrame) */
export async function captureCanvas(el: HTMLElement, ratio = 2): Promise<HTMLCanvasElement> {
  const { toSvg } = await import("html-to-image");
  const svg = await toSvg(el, { backgroundColor: "#ffffff", filter: noPrint });
  const img = new Image();
  img.src = svg;
  await img.decode();
  const w = Math.max(1, Math.round(el.offsetWidth)); const h = Math.max(1, Math.round(el.offsetHeight));
  const cv = document.createElement("canvas"); cv.width = w * ratio; cv.height = h * ratio;
  const ctx = cv.getContext("2d")!; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height); ctx.drawImage(img, 0, 0, cv.width, cv.height);
  return cv;
}
export async function exportImage(doc: StudioDoc, kind: "png" | "jpg") {
  const el = pageEl();
  if (!el) throw new Error("ไม่พบพื้นที่เอกสาร");
  const cv = await captureCanvas(el);
  const url = kind === "png" ? cv.toDataURL("image/png") : cv.toDataURL("image/jpeg", 0.92);
  const a = document.createElement("a"); a.href = url; a.download = `${safe(doc.title)}.${kind}`; a.click();
}

/* ---------- Word ---------- */
async function assetBuffer(id?: string) {
  if (!id) return null;
  const a = await getAsset(id);
  return a ? { buf: new Uint8Array(await a.blob.arrayBuffer()), mime: a.mime } : null;
}
async function dataUrlBuffer(src: string) {
  if (!src) return null;
  const res = await fetch(src); const b = await res.blob();
  return { buf: new Uint8Array(await b.arrayBuffer()), mime: b.type };
}

export async function exportDocx(doc: StudioDoc) {
  const docx = await import("docx");
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ImageRun, AlignmentType, BorderStyle, VerticalAlign, HeightRule } = docx;
  const children: InstanceType<typeof Paragraph | typeof Table>[] = [new Paragraph({ text: doc.title, heading: HeadingLevel.TITLE })];

  const blocksToDocx = async (blocks: Block[]) => {
    for (const b of blocks) {
      switch (b.type) {
        case "heading": children.push(new Paragraph({ text: strip(b.html), heading: b.level === 1 ? HeadingLevel.HEADING_1 : b.level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3 })); break;
        case "paragraph": strip(b.html).split("\n").forEach((l) => children.push(new Paragraph({ children: [new TextRun({ text: l, font: "Sarabun", size: 28 })] }))); break;
        case "bullets": b.items.forEach((it, i) => children.push(new Paragraph({ children: [new TextRun({ text: `${b.ordered ? `${i + 1}. ` : "• "}${strip(it)}`, font: "Sarabun", size: 28 })], indent: { left: 400 } }))); break;
        case "callout": children.push(new Paragraph({ children: [new TextRun({ text: `${b.emoji} ${strip(b.html)}`, font: "Sarabun", size: 28, bold: true })], shading: { fill: "F3EAFB" } })); break;
        case "fields": b.fields.forEach((f) => children.push(new Paragraph({ children: [new TextRun({ text: `${strip(f.label)}: `, bold: true, font: "Sarabun", size: 28 }), new TextRun({ text: strip(f.value), font: "Sarabun", size: 28 })] }))); break;
        case "divider": children.push(new Paragraph({ text: "─".repeat(40) })); break;
        case "file": children.push(new Paragraph({ children: [new TextRun({ text: `📎 ไฟล์แนบ: ${b.name}`, italics: true, font: "Sarabun", size: 24 })] })); break;
        case "table": {
          const covered = new Set<string>();
          (b.merges ?? []).forEach((m) => { for (let r = m.r; r < m.r + m.rowSpan; r++) for (let c = m.c; c < m.c + m.colSpan; c++) if (!(r === m.r && c === m.c)) covered.add(`${r},${c}`); });
          const bd = { style: b.border?.style === "none" ? BorderStyle.NONE : b.border?.style === "dashed" ? BorderStyle.DASHED : b.border?.style === "dotted" ? BorderStyle.DOTTED : b.border?.style === "double" ? BorderStyle.DOUBLE : BorderStyle.SINGLE, size: Math.round((b.border?.width ?? 1) * 8), color: hex(b.border?.color) ?? "444444" };
          const borders = { top: bd, bottom: bd, left: bd, right: bd };
          const rowsOut: InstanceType<typeof TableRow>[] = [];
          for (const [r, row] of b.rows.entries()) {
            const cells: InstanceType<typeof TableCell>[] = [];
            for (const [c, cell] of row.entries()) {
              if (covered.has(`${r},${c}`)) continue;
              const m = (b.merges ?? []).find((x) => x.r === r && x.c === c);
              const cs = b.cellStyles?.[`${r},${c}`] ?? {};
              const head = b.header && r === 0;
              const al = cs.align === "center" || (head && !cs.align) ? AlignmentType.CENTER : cs.align === "right" ? AlignmentType.RIGHT : AlignmentType.LEFT;
              const paras: InstanceType<typeof Paragraph>[] = strip(cell).split("\n").map((l) => new Paragraph({ alignment: al, children: [new TextRun({ text: l, font: cs.fontFamily ?? "Sarabun", size: (cs.fontSize ?? 13) * 2, bold: head, color: hex(cs.color) })] }));
              for (const src of imgsOf(cell)) {
                const img = await dataUrlBuffer(src).catch(() => null);
                if (img) { const w = Math.min(300, Math.round((b.colWidths?.[c] ?? 160) * 0.9)); paras.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: img.mime.includes("png") ? "png" : "jpg", data: img.buf, transformation: { width: w, height: Math.round(w * 0.7) } })] })); }
              }
              cells.push(new TableCell({ columnSpan: m?.colSpan, rowSpan: m?.rowSpan, borders, verticalAlign: cs.valign === "middle" ? VerticalAlign.CENTER : cs.valign === "bottom" ? VerticalAlign.BOTTOM : VerticalAlign.TOP, width: b.colWidths?.[c] ? { size: b.colWidths[c] * 15, type: WidthType.DXA } : undefined, shading: hex(cs.bg) ? { fill: hex(cs.bg) } : head ? { fill: "ECE0F8" } : undefined, children: paras }));
            }
            rowsOut.push(new TableRow({ height: b.rowHeights?.[r] ? { value: b.rowHeights[r] * 15, rule: HeightRule.ATLEAST } : undefined, children: cells }));
          }
          children.push(new Table({ rows: rowsOut, alignment: b.align === "center" ? AlignmentType.CENTER : b.align === "right" ? AlignmentType.RIGHT : AlignmentType.LEFT, width: b.colWidths?.length ? { size: b.colWidths.reduce((a, x) => a + x, 0) * 15, type: WidthType.DXA } : { size: 100, type: WidthType.PERCENTAGE } }));
          children.push(new Paragraph({ text: "" }));
          break;
        }
        case "image": {
          const img = b.assetId ? await assetBuffer(b.assetId) : await dataUrlBuffer(b.src).catch(() => null);
          if (img) {
            const type = img.mime.includes("png") ? "png" : img.mime.includes("gif") ? "gif" : "jpg";
            const w = Math.round(600 * ((b.width ?? 70) / 100));
            children.push(new Paragraph({ alignment: b.align === "left" ? AlignmentType.LEFT : b.align === "right" ? AlignmentType.RIGHT : AlignmentType.CENTER, children: [new ImageRun({ type, data: img.buf, transformation: { width: w, height: Math.round(w * 0.66) } })] }));
            if (b.caption) children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: strip(b.caption), italics: true, font: "Sarabun", size: 22 })] }));
          }
          break;
        }
      }
    }
  };

  if (doc.type === "slides") { for (const [i, s] of (doc.slides ?? []).entries()) { children.push(new Paragraph({ text: `สไลด์ ${i + 1}`, heading: HeadingLevel.HEADING_1, pageBreakBefore: i > 0 })); await blocksToDocx(s.blocks); } }
  else if (doc.type === "sheet" && doc.sheet) { await blocksToDocx([{ id: "s", type: "table", rows: doc.sheet.rows, header: doc.sheet.headerRow }]); }
  else await blocksToDocx(doc.blocks);

  const file = new Document({ styles: { default: { document: { run: { font: "Sarabun", size: 28 } } } }, sections: [{ children }] });
  download(await Packer.toBlob(file), `${safe(doc.title)}.docx`);
}

/* ---------- PowerPoint ---------- */
export async function exportPptx(doc: StudioDoc) {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";
  const THEME: Record<string, string> = { white: "FFFFFF", purple: "ECE0F8", pink: "FDE4EC", mint: "E2F5EC", sky: "E3F0FB", yellow: "FFF1BF", dark: "45236B" };

  const slideFrom = async (blocks: Block[], theme = "white", notes?: string) => {
    const s = pptx.addSlide();
    s.background = { color: THEME[theme] ?? "FFFFFF" };
    const dark = theme === "dark";
    let y = 0.4;
    for (const b of blocks) {
      if (y > 5.2) break;
      if (b.type === "heading") { s.addText(strip(b.html), { x: 0.5, y, w: 9, h: 0.8, fontSize: b.level === 1 ? 32 : b.level === 2 ? 26 : 20, bold: true, color: dark ? "FFFFFF" : "45236B", fontFace: "Sarabun" }); y += 0.9; }
      else if (b.type === "paragraph" || b.type === "callout") { const t = b.type === "callout" ? `${b.emoji} ${strip(b.html)}` : strip(b.html); if (t) { s.addText(t, { x: 0.5, y, w: 9, h: 0.6, fontSize: 16, color: dark ? "FFFFFF" : "3B2F4A", fontFace: "Sarabun" }); y += 0.65; } }
      else if (b.type === "bullets") { s.addText(b.items.map((it) => ({ text: strip(it), options: { bullet: b.ordered ? { type: "number" as const } : true } })), { x: 0.6, y, w: 8.8, h: 0.4 * b.items.length, fontSize: 16, color: dark ? "FFFFFF" : "3B2F4A", fontFace: "Sarabun" }); y += 0.4 * b.items.length + 0.2; }
      else if (b.type === "table") {
        const covered = new Set<string>();
        (b.merges ?? []).forEach((m) => { for (let r = m.r; r < m.r + m.rowSpan; r++) for (let c = m.c; c < m.c + m.colSpan; c++) if (!(r === m.r && c === m.c)) covered.add(`${r},${c}`); });
        const totalW = b.colWidths?.length ? b.colWidths.reduce((a, x) => a + x, 0) : 0;
        const colW = b.colWidths?.length ? b.colWidths.map((w) => (w / totalW) * 9) : undefined;
        const bt = b.border?.style === "none" ? "none" : b.border?.style === "dashed" || b.border?.style === "dotted" ? "dash" : "solid";
        const tblRows = b.rows.map((row, r) => row.map((cell, c) => {
          if (covered.has(`${r},${c}`)) return null;
          const m = (b.merges ?? []).find((x) => x.r === r && x.c === c);
          const cs = b.cellStyles?.[`${r},${c}`] ?? {};
          const head = b.header && r === 0;
          return { text: strip(cell), options: { fontSize: cs.fontSize ? cs.fontSize * 0.75 : 11, fontFace: cs.fontFamily ?? "Sarabun", bold: head, color: hex(cs.color) ?? (dark ? "FFFFFF" : "3B2F4A"), fill: hex(cs.bg) ? { color: hex(cs.bg)! } : head ? { color: "ECE0F8" } : undefined, align: (cs.align ?? (head ? "center" : "left")) as "left" | "center" | "right", valign: (cs.valign ?? "top") as "top" | "middle" | "bottom", colspan: m?.colSpan, rowspan: m?.rowSpan, border: { type: bt as "none" | "dash" | "solid", color: hex(b.border?.color) ?? "444444", pt: b.border?.width ?? 0.75 } } };
        }).filter((x): x is NonNullable<typeof x> => !!x));
        s.addTable(tblRows, { x: 0.5, y, w: 9, colW, rowH: b.rowHeights?.map((h) => (h ? h / 96 : 0.3)) });
        y += (b.rowHeights?.length ? b.rowHeights.reduce((a, h) => a + (h ? h / 96 : 0.35), 0) : 0.35 * b.rows.length) + 0.3;
      }
      else if (b.type === "image") {
        const img = b.assetId ? await getAsset(b.assetId) : null;
        const data = img ? await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(img.blob); }) : b.src;
        if (data) { const w = 9 * ((b.width ?? 70) / 100); const x = b.align === "left" ? 0.5 : b.align === "right" ? 9.5 - w : (10 - w) / 2; s.addImage({ data, x, y, w, h: w * 0.6 }); y += w * 0.6 + 0.2; }
      }
      else if (b.type === "fields") { s.addText(b.fields.map((f) => `${strip(f.label)}: ${strip(f.value)}`).join("\n"), { x: 0.5, y, w: 9, h: 0.3 * b.fields.length, fontSize: 14, fontFace: "Sarabun", color: dark ? "FFFFFF" : "3B2F4A" }); y += 0.3 * b.fields.length + 0.2; }
    }
    if (notes) s.addNotes(notes);
  };

  if (doc.type === "slides") for (const sl of doc.slides ?? []) await slideFrom(sl.blocks, sl.theme, sl.notes);
  else if (doc.type === "sheet" && doc.sheet) await slideFrom([{ id: "t", type: "table", rows: doc.sheet.rows.slice(0, 15), header: doc.sheet.headerRow }]);
  else {
    // เอกสาร → แบ่งเป็นสไลด์ทุกครั้งที่เจอหัวข้อ
    let cur: Block[] = [{ id: "t", type: "heading", level: 1, html: doc.title }];
    for (const b of doc.blocks) { if (b.type === "heading" && cur.length > 1) { await slideFrom(cur); cur = []; } cur.push(b); }
    if (cur.length) await slideFrom(cur);
  }
  await pptx.writeFile({ fileName: `${safe(doc.title)}.pptx` });
}

/* ---------- ZIP ---------- */
export async function exportZip(doc: StudioDoc) {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  zip.file(`${safe(doc.title)}.txt`, docToText(doc));
  zip.file(`${safe(doc.title)}.json`, JSON.stringify(doc, null, 2));
  const assets = await listAssets(doc.id).catch(() => []);
  if (assets.length) { const f = zip.folder("ไฟล์แนบ")!; for (const a of assets) f.file(a.name, a.blob); }
  try {
    const el = pageEl();
    if (el) zip.file(`${safe(doc.title)}.png`, (await captureCanvas(el)).toDataURL("image/png").split(",")[1], { base64: true });
  } catch { /* ข้ามถ้าจับภาพไม่ได้ */ }
  download(await zip.generateAsync({ type: "blob" }), `${safe(doc.title)}.zip`);
}

/** PDF: เปิดหน้าต่างพิมพ์ → เลือก "Save as PDF" (รักษาหน้าตาเอกสารดีที่สุด) */
export const exportPdf = () => window.print();
