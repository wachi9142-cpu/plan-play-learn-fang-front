"use client";

import { useMemo, useState } from "react";
import type { SheetData } from "@/types";
import { cn } from "@/lib/cn";

/* ---------- สูตรอย่างง่าย: =SUM(A1:B3) =AVERAGE() =COUNT() =MIN() =MAX() และ +-*\/ ระหว่างเซลล์/ตัวเลข ---------- */
const colName = (i: number) => { let s = ""; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
const colIndex = (s: string) => s.toUpperCase().split("").reduce((n, ch) => n * 26 + (ch.charCodeAt(0) - 64), 0) - 1;

function evalCell(rows: string[][], r: number, c: number, seen = new Set<string>()): number | string {
  const raw = rows[r]?.[c] ?? "";
  if (!raw.startsWith("=")) { const n = Number(raw); return raw.trim() !== "" && !isNaN(n) ? n : raw; }
  const key = `${r},${c}`;
  if (seen.has(key)) return "#วน";
  seen.add(key);
  try {
    const expr = raw.slice(1).toUpperCase();
    const range = (a: string, b: string) => {
      const [ca, ra] = [colIndex(a.replace(/\d+/, "")), Number(a.replace(/[A-Z]+/, "")) - 1];
      const [cb, rb] = [colIndex(b.replace(/\d+/, "")), Number(b.replace(/[A-Z]+/, "")) - 1];
      const out: number[] = [];
      for (let i = Math.min(ra, rb); i <= Math.max(ra, rb); i++) for (let j = Math.min(ca, cb); j <= Math.max(ca, cb); j++) { const v = evalCell(rows, i, j, new Set(seen)); if (typeof v === "number") out.push(v); }
      return out;
    };
    const fn = (name: string, vals: number[]) => {
      switch (name) {
        case "SUM": return vals.reduce((a, b) => a + b, 0);
        case "AVERAGE": return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        case "COUNT": return vals.length;
        case "MIN": return vals.length ? Math.min(...vals) : 0;
        case "MAX": return vals.length ? Math.max(...vals) : 0;
        default: return NaN;
      }
    };
    let e = expr.replace(/(SUM|AVERAGE|COUNT|MIN|MAX)\(([A-Z]+\d+):([A-Z]+\d+)\)/g, (_, f, a, b) => String(fn(f, range(a, b))));
    e = e.replace(/[A-Z]+\d+/g, (ref) => { const v = evalCell(rows, Number(ref.replace(/[A-Z]+/, "")) - 1, colIndex(ref.replace(/\d+/, "")), new Set(seen)); return String(typeof v === "number" ? v : 0); });
    if (!/^[\d\s+\-*/().]+$/.test(e)) return "#สูตร";
    const v = Function(`"use strict";return (${e})`)() as number;
    return Number.isFinite(v) ? Math.round(v * 100) / 100 : "#สูตร";
  } catch { return "#สูตร"; }
}

/** 📊 ตัวแก้ไขสเปรดชีต */
export function SheetEditor({ sheet, onChange }: { sheet: SheetData; onChange: (s: SheetData) => void }) {
  const [sel, setSel] = useState<{ r: number; c: number } | null>(null);
  const rows = sheet.rows;
  const cols = rows[0]?.length ?? 0;
  const computed = useMemo(() => rows.map((row, r) => row.map((_, c) => evalCell(rows, r, c))), [rows]);

  const setCell = (r: number, c: number, v: string) => onChange({ ...sheet, rows: rows.map((row, i) => (i === r ? row.map((x, j) => (j === c ? v : x)) : row)) });
  const addRow = () => onChange({ ...sheet, rows: [...rows, Array.from({ length: cols }, () => "")] });
  const addCol = () => onChange({ ...sheet, rows: rows.map((row) => [...row, ""]) });
  const delRow = () => { if (sel && rows.length > 1) { onChange({ ...sheet, rows: rows.filter((_, i) => i !== sel.r) }); setSel(null); } };
  const delCol = () => { if (sel && cols > 1) { onChange({ ...sheet, rows: rows.map((row) => row.filter((_, j) => j !== sel.c)) }); setSel(null); } };

  const selRaw = sel ? rows[sel.r][sel.c] : "";

  return (
    <div className="card overflow-hidden">
      {/* แถบสูตร */}
      <div className="no-print flex flex-wrap items-center gap-2 border-b border-line bg-cream px-3 py-2 text-[13px]">
        <span className="w-14 rounded-md bg-white px-2 py-1 text-center font-mono text-purple-800">{sel ? `${colName(sel.c)}${sel.r + 1}` : "—"}</span>
        <span className="text-ink-soft">fx</span>
        <input value={selRaw} onChange={(e) => sel && setCell(sel.r, sel.c, e.target.value)} placeholder="พิมพ์ค่า หรือสูตร เช่น =SUM(B2:B10)" className="min-w-0 flex-1 rounded-md border border-line bg-white px-2 py-1 font-mono outline-none focus:border-purple-300" disabled={!sel} />
        <button type="button" onClick={addRow} className="rounded-full border border-line bg-white px-3 py-1 hover:bg-purple-50">+ แถว</button>
        <button type="button" onClick={addCol} className="rounded-full border border-line bg-white px-3 py-1 hover:bg-purple-50">+ คอลัมน์</button>
        <button type="button" onClick={delRow} disabled={!sel} className="rounded-full border border-line bg-white px-3 py-1 text-red-500 hover:bg-red-50 disabled:opacity-40">− แถวที่เลือก</button>
        <button type="button" onClick={delCol} disabled={!sel} className="rounded-full border border-line bg-white px-3 py-1 text-red-500 hover:bg-red-50 disabled:opacity-40">− คอลัมน์ที่เลือก</button>
        <label className="ml-auto inline-flex items-center gap-1 text-ink-soft"><input type="checkbox" checked={!!sheet.headerRow} onChange={(e) => onChange({ ...sheet, headerRow: e.target.checked })} /> แถวแรกเป็นหัวตาราง</label>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full border-collapse text-[14px]">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-10 border border-line bg-cream text-[11px] text-ink-soft" />
              {Array.from({ length: cols }, (_, c) => <th key={c} className={cn("border border-line bg-cream px-2 py-1 text-center text-[12px] font-medium text-ink-soft", sel?.c === c && "bg-purple-100 text-purple-800")}>{colName(c)}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                <th className={cn("sticky left-0 z-10 border border-line bg-cream px-1 text-center text-[11px] font-medium text-ink-soft", sel?.r === r && "bg-purple-100 text-purple-800")}>{r + 1}</th>
                {row.map((raw, c) => {
                  const isHead = sheet.headerRow && r === 0;
                  const active = sel?.r === r && sel?.c === c;
                  const val = computed[r][c];
                  const isFormula = raw.startsWith("=");
                  return (
                    <td key={c} className={cn("min-w-[110px] border border-line p-0 align-middle", isHead && "bg-purple-100 font-display font-medium text-purple-800", active && "ring-2 ring-inset ring-purple-500")}>
                      <input
                        value={active ? raw : String(val)}
                        onFocus={() => setSel({ r, c })}
                        onChange={(e) => setCell(r, c, e.target.value)}
                        onKeyDown={(e) => {
                          const go = (dr: number, dc: number) => { e.preventDefault(); const nr = Math.min(rows.length - 1, Math.max(0, r + dr)); const nc = Math.min(cols - 1, Math.max(0, c + dc)); setSel({ r: nr, c: nc }); (e.currentTarget.closest("table")?.querySelectorAll("tbody tr")[nr]?.querySelectorAll("input")[nc] as HTMLInputElement | undefined)?.focus(); };
                          if (e.key === "Enter" || e.key === "ArrowDown") go(1, 0);
                          else if (e.key === "ArrowUp") go(-1, 0);
                          else if (e.key === "Tab" && !e.shiftKey) go(0, 1);
                          else if (e.key === "Tab" && e.shiftKey) go(0, -1);
                        }}
                        className={cn("w-full bg-transparent px-2 py-1.5 outline-none", isFormula && !active && "text-purple-700", typeof val === "number" && !isHead && "text-right font-mono")}
                        aria-label={`${colName(c)}${r + 1}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="no-print border-t border-line px-3 py-2 text-[11px] text-ink-soft">💡 สูตรที่รองรับ: =SUM(A1:A5) =AVERAGE() =COUNT() =MIN() =MAX() และคำนวณ เช่น =B2*C2 · Enter/Tab/ลูกศร เลื่อนเซลล์</p>
    </div>
  );
}
