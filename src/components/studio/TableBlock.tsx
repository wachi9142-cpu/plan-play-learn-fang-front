"use client";

import { useRef, useState } from "react";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, ImagePlus } from "lucide-react";
import type { Block, CellStyle, TableBorder, TableMerge } from "@/types";
import { cn } from "@/lib/cn";
import { RECOMMENDED_FONTS } from "@/lib/studio-fonts";

type TB = Extract<Block, { type: "table" }>;

const DEF_BORDER: Required<TableBorder> = { width: 1, style: "solid", color: "#444444" };
const SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32];

/**
 * ตารางแบบ Word: เพิ่ม/ลบแถว-คอลัมน์ · ลากปรับความกว้าง/สูง (หรือพิมพ์ตัวเลข) · รวม/แยกเซลล์
 * · จัดข้อความซ้าย-กลาง-ขวา/บน-กลาง-ล่าง · ฟอนต์/ขนาด/สี/พื้นหลังรายเซลล์ · เส้นขอบ · รูปในเซลล์ · ลากปรับขนาดทั้งตาราง
 * ข้อมูล: rows (html ต่อเซลล์), colWidths, rowHeights, merges, cellStyles {"r,c": CellStyle}, border, align
 */
export function TableBlock({ block, onChange, readOnly }: { block: TB; onChange: (b: Block) => void; readOnly?: boolean }) {
  const [sel, setSel] = useState<{ r: number; c: number } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const rows = block.rows;
  const cols = rows[0]?.length ?? 0;
  const merges = block.merges ?? [];
  const colWidths = block.colWidths ?? [];
  const rowHeights = block.rowHeights ?? [];
  const styles = block.cellStyles ?? {};
  const border = { ...DEF_BORDER, ...(block.border ?? {}) };

  const mergeAt = (r: number, c: number) => merges.find((m) => m.r === r && m.c === c);
  const covered = (r: number, c: number) => merges.some((m) => !(m.r === r && m.c === c) && r >= m.r && r < m.r + m.rowSpan && c >= m.c && c < m.c + m.colSpan);
  const key = (r: number, c: number) => `${r},${c}`;

  const patch = (p: Partial<TB>) => onChange({ ...block, ...p });
  const setCell = (r: number, c: number, html: string) => patch({ rows: rows.map((row, i) => (i === r ? row.map((x, j) => (j === c ? html : x)) : row)) });
  const styleCell = (p: Partial<CellStyle>) => sel && patch({ cellStyles: { ...styles, [key(sel.r, sel.c)]: { ...styles[key(sel.r, sel.c)], ...p } } });
  const curStyle: CellStyle = sel ? styles[key(sel.r, sel.c)] ?? {} : {};

  /** วัดความกว้าง/สูงจริงจากหน้าจอ (ใช้เมื่อยังไม่ได้กำหนดตัวเลข) */
  const measuredCols = () => Array.from({ length: cols }, (_, i) => colWidths[i] ?? Math.round((tableRef.current?.querySelectorAll("thead th")[i + 1] as HTMLElement)?.getBoundingClientRect().width ?? 140));
  const measuredRows = () => Array.from({ length: rows.length }, (_, i) => rowHeights[i] || Math.round((tableRef.current?.querySelectorAll("tbody tr")[i] as HTMLElement)?.getBoundingClientRect().height ?? 36));

  /* ---- แถว/คอลัมน์ ---- */
  const shiftStyles = (fn: (r: number, c: number) => [number, number] | null) => {
    const out: Record<string, CellStyle> = {};
    for (const [k, v] of Object.entries(styles)) { const [r, c] = k.split(",").map(Number); const n = fn(r, c); if (n) out[key(n[0], n[1])] = v; }
    return out;
  };
  const addRow = (at = rows.length) => patch({
    rows: [...rows.slice(0, at), Array.from({ length: cols }, () => ""), ...rows.slice(at)],
    rowHeights: rowHeights.length ? [...rowHeights.slice(0, at), 0, ...rowHeights.slice(at)] : undefined,
    merges: merges.map((m) => (m.r >= at ? { ...m, r: m.r + 1 } : m)),
    cellStyles: shiftStyles((r, c) => [r >= at ? r + 1 : r, c]),
  });
  const addCol = (at = cols) => patch({
    rows: rows.map((row) => [...row.slice(0, at), "", ...row.slice(at)]),
    colWidths: colWidths.length ? [...colWidths.slice(0, at), 140, ...colWidths.slice(at)] : undefined,
    merges: merges.map((m) => (m.c >= at ? { ...m, c: m.c + 1 } : m)),
    cellStyles: shiftStyles((r, c) => [r, c >= at ? c + 1 : c]),
  });
  const delRow = (r: number) => rows.length > 1 && patch({
    rows: rows.filter((_, i) => i !== r), rowHeights: rowHeights.filter((_, i) => i !== r),
    merges: merges.filter((m) => m.r !== r).map((m) => (m.r > r ? { ...m, r: m.r - 1 } : m.r < r && m.r + m.rowSpan > r ? { ...m, rowSpan: m.rowSpan - 1 } : m)),
    cellStyles: shiftStyles((rr, c) => (rr === r ? null : [rr > r ? rr - 1 : rr, c])),
  });
  const delCol = (c: number) => cols > 1 && patch({
    rows: rows.map((row) => row.filter((_, j) => j !== c)), colWidths: colWidths.filter((_, j) => j !== c),
    merges: merges.filter((m) => m.c !== c).map((m) => (m.c > c ? { ...m, c: m.c - 1 } : m.c < c && m.c + m.colSpan > c ? { ...m, colSpan: m.colSpan - 1 } : m)),
    cellStyles: shiftStyles((r, cc) => (cc === c ? null : [r, cc > c ? cc - 1 : cc])),
  });

  /* ---- รวม/แยกเซลล์ ---- */
  const mergeRight = () => { if (!sel) return; const m = mergeAt(sel.r, sel.c) ?? { r: sel.r, c: sel.c, rowSpan: 1, colSpan: 1 }; if (sel.c + m.colSpan >= cols) return; patch({ merges: [...merges.filter((x) => x !== mergeAt(sel.r, sel.c)), { ...m, colSpan: m.colSpan + 1 }] }); };
  const mergeDown = () => { if (!sel) return; const m = mergeAt(sel.r, sel.c) ?? { r: sel.r, c: sel.c, rowSpan: 1, colSpan: 1 }; if (sel.r + m.rowSpan >= rows.length) return; patch({ merges: [...merges.filter((x) => x !== mergeAt(sel.r, sel.c)), { ...m, rowSpan: m.rowSpan + 1 }] }); };
  const unmerge = () => sel && patch({ merges: merges.filter((m) => !(m.r === sel.r && m.c === sel.c)) });
  /** แยกเซลล์ที่ไม่ได้รวม → เพิ่มคอลัมน์ขวาแล้วรวมเซลล์แถวอื่นให้เหมือนเดิม (เห็นเป็นเซลล์เดียวถูกผ่าครึ่ง) */
  const splitCell = () => {
    if (!sel) return;
    if (mergeAt(sel.r, sel.c)) return unmerge();
    const at = sel.c + 1;
    const cw = measuredCols(); const half = Math.max(50, Math.round(cw[sel.c] / 2));
    const newMerges: TableMerge[] = merges.map((m) => (m.c >= at ? { ...m, c: m.c + 1 } : m.c < at && m.c + m.colSpan > sel.c ? { ...m, colSpan: m.colSpan + 1 } : m));
    for (let r = 0; r < rows.length; r++) {
      if (r === sel.r || covered(r, sel.c) || newMerges.some((m) => m.r === r && m.c === sel.c)) continue;
      newMerges.push({ r, c: sel.c, rowSpan: 1, colSpan: 2 });
    }
    patch({ rows: rows.map((row) => [...row.slice(0, at), "", ...row.slice(at)]), colWidths: [...cw.slice(0, sel.c), half, half, ...cw.slice(at)], merges: newMerges, cellStyles: shiftStyles((r, c) => [r, c >= at ? c + 1 : c]) });
  };

  /* ---- ลากปรับขนาด ---- */
  const drag = (e: React.PointerEvent, onMove: (dx: number, dy: number) => void) => {
    e.preventDefault(); const sx = e.clientX, sy = e.clientY;
    const move = (ev: PointerEvent) => onMove(ev.clientX - sx, ev.clientY - sy);
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };
  const startResizeCol = (c: number, e: React.PointerEvent) => { const cw = measuredCols(); const w0 = cw[c]; drag(e, (dx) => { const n = [...cw]; n[c] = Math.max(40, w0 + dx); patch({ colWidths: n }); }); };
  const startResizeRow = (r: number, e: React.PointerEvent) => { const rh = measuredRows(); const h0 = rh[r]; drag(e, (_, dy) => { const n = [...rh]; n[r] = Math.max(24, h0 + dy); patch({ rowHeights: n }); }); };
  /** มุมขวาล่าง: ย่อ/ขยายทั้งตารางตามสัดส่วน */
  const startResizeAll = (e: React.PointerEvent) => { const cw = measuredCols(); const rh = measuredRows(); const W = cw.reduce((a, b) => a + b, 0); const H = rh.reduce((a, b) => a + b, 0); drag(e, (dx, dy) => { const kx = Math.max(0.2, (W + dx) / W); const ky = Math.max(0.2, (H + dy) / H); patch({ colWidths: cw.map((w) => Math.max(40, Math.round(w * kx))), rowHeights: rh.map((h) => Math.max(24, Math.round(h * ky))) }); }); };
  const setColW = (w: number) => { if (!sel) return; const cw = measuredCols(); cw[sel.c] = Math.max(40, w); patch({ colWidths: cw }); };
  const setRowH = (h: number) => { if (!sel) return; const rh = measuredRows(); rh[sel.r] = Math.max(24, h); patch({ rowHeights: rh }); };

  /* ---- รูปในเซลล์ (ย่อ ≤600px แล้วฝังเป็น data URL เพื่อให้ติดไปกับไฟล์ส่งออก) ---- */
  const insertImage = (file: File, at = sel) => {
    if (!at || !file.type.startsWith("image/")) return;
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 600; const k = Math.min(1, max / Math.max(img.width, img.height));
      const cv = document.createElement("canvas"); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      cv.getContext("2d")!.drawImage(img, 0, 0, cv.width, cv.height);
      const data = cv.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.88);
      setCell(at.r, at.c, `${rows[at.r][at.c]}<img src="${data}" style="max-width:100%;height:auto;display:block;margin:4px auto" alt="">`);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const exec = (cmd: string, val?: string) => document.execCommand(cmd, false, val);
  const bStyle = `${border.width}px ${border.style} ${border.color}`;
  const totalW = colWidths.length ? colWidths.reduce((a, b) => a + b, 0) : undefined;

  return (
    <div className="group/tbl">
      <div className="overflow-x-auto" style={{ textAlign: block.align ?? "left" }}>
        <div className="relative inline-block max-w-full">
          <table ref={tableRef} className="border-collapse text-[14px] sm:text-[15px]" style={{ width: totalW ?? "100%", minWidth: totalW ? undefined : 200, tableLayout: totalW ? "fixed" : "auto", textAlign: "left" }}>
            <thead className="no-print">
              <tr className="h-0">
                <th className="w-0 p-0" />
                {Array.from({ length: cols }, (_, c) => (
                  <th key={c} className="relative h-0 p-0" style={{ width: colWidths[c] }}>
                    {!readOnly && <span onPointerDown={(e) => startResizeCol(c, e)} className="absolute -right-1.5 top-0 z-10 h-5 w-3 cursor-col-resize rounded bg-purple-400 opacity-0 group-hover/tbl:opacity-60 hover:opacity-100!" title="ลากปรับความกว้างคอลัมน์" />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <tr key={r} style={{ height: rowHeights[r] || undefined }}>
                  <td className="no-print relative w-0 p-0">
                    {!readOnly && <span onPointerDown={(e) => startResizeRow(r, e)} className="absolute -bottom-1.5 left-0 z-10 h-3 w-5 cursor-row-resize rounded bg-purple-400 opacity-0 group-hover/tbl:opacity-60 hover:opacity-100!" title="ลากปรับความสูงแถว" />}
                  </td>
                  {row.map((cell, c) => {
                    if (covered(r, c)) return null;
                    const m = mergeAt(r, c);
                    const isHead = block.header && r === 0;
                    const active = sel?.r === r && sel?.c === c;
                    const cs = styles[key(r, c)] ?? {};
                    return (
                      <td
                        key={c}
                        rowSpan={m?.rowSpan} colSpan={m?.colSpan}
                        onClick={() => !readOnly && setSel({ r, c })}
                        className={cn("relative", isHead && !cs.bg && "bg-purple-50", isHead && !cs.align && "text-center", isHead && "font-medium", active && "ring-2 ring-inset ring-purple-500")}
                        style={{ border: bStyle, padding: cs.padding ?? 6, height: rowHeights[r] || undefined, textAlign: cs.align, verticalAlign: cs.valign ?? "top", background: cs.bg, color: cs.color, fontSize: cs.fontSize, fontFamily: cs.fontFamily }}
                      >
                        <div
                          contentEditable={!readOnly}
                          suppressContentEditableWarning
                          onFocus={() => !readOnly && setSel({ r, c })}
                          onInput={(e) => setCell(r, c, (e.currentTarget as HTMLElement).innerHTML)}
                          onBlur={(e) => setCell(r, c, (e.currentTarget as HTMLElement).innerHTML)}
                          onDrop={(e) => { const f = e.dataTransfer.files?.[0]; if (f?.type.startsWith("image/")) { e.preventDefault(); setSel({ r, c }); insertImage(f, { r, c }); } }}
                          className="editable min-h-[1.5em] whitespace-pre-wrap break-words outline-none"
                          dangerouslySetInnerHTML={{ __html: cell }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {!readOnly && <span onPointerDown={startResizeAll} className="no-print absolute -bottom-2 -right-2 z-10 size-4 cursor-nwse-resize rounded-full border-2 border-white bg-purple-500 opacity-0 shadow group-hover/tbl:opacity-100" title="ลากปรับขนาดทั้งตาราง" />}
        </div>
      </div>

      {!readOnly && (
        <div className="no-print mt-2 space-y-1.5 rounded-xl bg-cream px-2 py-1.5 text-[12px]">
          {/* แถว 1: โครงสร้าง */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-ink-soft">{sel ? `แถว ${sel.r + 1} · คอลัมน์ ${sel.c + 1}` : "กดเซลล์เพื่อเลือก"}</span>
            <B onClick={() => addRow(sel ? sel.r + 1 : rows.length)}>➕ แถว</B>
            <B onClick={() => addCol(sel ? sel.c + 1 : cols)}>➕ คอลัมน์</B>
            <B onClick={() => sel && delRow(sel.r)} disabled={!sel} danger>➖ แถว</B>
            <B onClick={() => sel && delCol(sel.c)} disabled={!sel} danger>➖ คอลัมน์</B>
            <Sep />
            <B onClick={mergeRight} disabled={!sel}>🔗 รวมขวา</B>
            <B onClick={mergeDown} disabled={!sel}>🔗 รวมล่าง</B>
            <B onClick={splitCell} disabled={!sel}>✂️ แยกเซลล์</B>
            <Sep />
            <label className="inline-flex items-center gap-1">📏 กว้าง <input type="number" min={40} value={sel ? measuredCols()[sel.c] : ""} disabled={!sel} onChange={(e) => setColW(+e.target.value)} className="h-6 w-16 rounded-md border border-line bg-white px-1.5" /> px</label>
            <label className="inline-flex items-center gap-1">สูง <input type="number" min={24} value={sel ? measuredRows()[sel.r] : ""} disabled={!sel} onChange={(e) => setRowH(+e.target.value)} className="h-6 w-16 rounded-md border border-line bg-white px-1.5" /> px</label>
            <B onClick={() => patch({ colWidths: undefined, rowHeights: undefined })}>รีเซ็ตขนาด</B>
            <B onClick={() => patch({ header: !block.header })}>{block.header ? "ไม่ใช้แถวหัว" : "แถวแรกเป็นหัว"}</B>
          </div>
          {/* แถว 2: ข้อความในเซลล์ */}
          <div className="flex flex-wrap items-center gap-1.5">
            <I onClick={() => exec("bold")} title="ตัวหนา"><Bold size={13} /></I>
            <I onClick={() => exec("italic")} title="ตัวเอียง"><Italic size={13} /></I>
            <I onClick={() => exec("underline")} title="ขีดเส้นใต้"><Underline size={13} /></I>
            <Sep />
            <I onClick={() => styleCell({ align: "left" })} on={curStyle.align === "left"} title="ชิดซ้าย"><AlignLeft size={13} /></I>
            <I onClick={() => styleCell({ align: "center" })} on={curStyle.align === "center"} title="กึ่งกลาง"><AlignCenter size={13} /></I>
            <I onClick={() => styleCell({ align: "right" })} on={curStyle.align === "right"} title="ชิดขวา"><AlignRight size={13} /></I>
            <Sep />
            <I onClick={() => styleCell({ valign: "top" })} on={(curStyle.valign ?? "top") === "top"} title="ชิดบน">⤒</I>
            <I onClick={() => styleCell({ valign: "middle" })} on={curStyle.valign === "middle"} title="กลางแนวตั้ง">↕</I>
            <I onClick={() => styleCell({ valign: "bottom" })} on={curStyle.valign === "bottom"} title="ชิดล่าง">⤓</I>
            <Sep />
            <select value={curStyle.fontFamily ?? ""} disabled={!sel} onChange={(e) => styleCell({ fontFamily: e.target.value || undefined })} className="h-6 rounded-md border border-line bg-white px-1" title="ฟอนต์ในเซลล์">
              <option value="">ฟอนต์ (ตามเอกสาร)</option>
              {RECOMMENDED_FONTS.map((f) => <option key={f.family} value={f.family}>{f.label}</option>)}
            </select>
            <select value={curStyle.fontSize ?? ""} disabled={!sel} onChange={(e) => styleCell({ fontSize: e.target.value ? +e.target.value : undefined })} className="h-6 rounded-md border border-line bg-white px-1" title="ขนาดตัวอักษร">
              <option value="">ขนาด</option>
              {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <label className="inline-flex items-center gap-1" title="สีตัวอักษร">🎨 <input type="color" value={curStyle.color ?? "#3b2f4a"} disabled={!sel} onChange={(e) => styleCell({ color: e.target.value })} className="h-6 w-7 cursor-pointer rounded border border-line bg-white p-0" /></label>
            <label className="inline-flex items-center gap-1" title="สีพื้นหลังเซลล์">🖌️ <input type="color" value={curStyle.bg ?? "#ffffff"} disabled={!sel} onChange={(e) => styleCell({ bg: e.target.value })} className="h-6 w-7 cursor-pointer rounded border border-line bg-white p-0" /></label>
            <B onClick={() => styleCell({ bg: undefined, color: undefined })} disabled={!sel}>ล้างสี</B>
            <Sep />
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) insertImage(f); e.target.value = ""; }} />
            <B onClick={() => fileRef.current?.click()} disabled={!sel}><ImagePlus size={13} className="inline" /> รูปในเซลล์</B>
          </div>
          {/* แถว 3: เส้นขอบ + ตำแหน่งตาราง */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-ink-soft">▦ เส้นขอบ</span>
            <select value={border.style} onChange={(e) => patch({ border: { ...border, style: e.target.value as TableBorder["style"] } })} className="h-6 rounded-md border border-line bg-white px-1">
              <option value="solid">ทึบ</option><option value="dashed">เส้นประ</option><option value="dotted">จุด</option><option value="double">คู่</option><option value="none">ไม่มีเส้น</option>
            </select>
            <label className="inline-flex items-center gap-1">หนา <input type="number" min={0} max={8} step={0.5} value={border.width} onChange={(e) => patch({ border: { ...border, width: +e.target.value } })} className="h-6 w-14 rounded-md border border-line bg-white px-1.5" /> px</label>
            <input type="color" value={border.color} onChange={(e) => patch({ border: { ...border, color: e.target.value } })} className="h-6 w-7 cursor-pointer rounded border border-line bg-white p-0" title="สีเส้นขอบ" />
            <Sep />
            <span className="text-ink-soft">ตำแหน่งตาราง</span>
            <I onClick={() => patch({ align: "left" })} on={(block.align ?? "left") === "left"}><AlignLeft size={13} /></I>
            <I onClick={() => patch({ align: "center" })} on={block.align === "center"}><AlignCenter size={13} /></I>
            <I onClick={() => patch({ align: "right" })} on={block.align === "right"}><AlignRight size={13} /></I>
            <span className="ml-auto hidden text-ink-soft md:inline">💡 ลากขอบคอลัมน์/แถว หรือมุมขวาล่างเพื่อปรับขนาด · Enter ในเซลล์ขึ้นบรรทัดใหม่ · ลากรูปลงเซลล์ได้</span>
          </div>
        </div>
      )}
    </div>
  );
}

const Sep = () => <span className="mx-0.5 h-4 w-px bg-line" />;

function B({ children, onClick, disabled = false, danger = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onClick} disabled={disabled} className={cn("rounded-full border border-line bg-white px-2.5 py-0.5 hover:bg-purple-50 disabled:opacity-40", danger ? "text-red-500" : "text-purple-700")}>
      {children}
    </button>
  );
}
function I({ children, onClick, on = false, title }: { children: React.ReactNode; onClick: () => void; on?: boolean; title?: string }) {
  return (
    <button type="button" title={title} onMouseDown={(e) => e.preventDefault()} onClick={onClick} className={cn("inline-flex size-6 items-center justify-center rounded-md border border-line bg-white text-purple-700 hover:bg-purple-50", on && "border-purple-300 bg-purple-100")}>
      {children}
    </button>
  );
}

export type { TableMerge };
