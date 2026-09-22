"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import type { StudioDoc } from "@/types";
import { cn } from "@/lib/cn";
import { exportDocx, exportImage, exportPdf, exportPptx, exportText, exportZip } from "@/lib/studio-export";

type Kind = "pdf" | "docx" | "png" | "jpg" | "pptx" | "txt" | "zip" | "print";

const ITEMS: { k: Kind; emoji: string; label: string; hint: string; best?: boolean }[] = [
  { k: "pdf", emoji: "📄", label: "PDF", hint: "รักษาหน้าตาเอกสารดีที่สุด (เลือก “บันทึกเป็น PDF” ในหน้าต่างพิมพ์)", best: true },
  { k: "docx", emoji: "📝", label: "Word (.docx)", hint: "แก้ไขต่อใน Word ได้ — ตาราง/รูปติดไปด้วย" },
  { k: "png", emoji: "🖼️", label: "รูปภาพ PNG", hint: "ภาพหน้าเอกสาร/สไลด์ปัจจุบัน คมชัด 2×" },
  { k: "jpg", emoji: "🖼️", label: "รูปภาพ JPG", hint: "ภาพขนาดเล็ก เหมาะส่งในไลน์" },
  { k: "pptx", emoji: "📊", label: "PowerPoint (.pptx)", hint: "สไลด์ → พรีเซนต์ · เอกสาร → แบ่งสไลด์ตามหัวข้อ" },
  { k: "txt", emoji: "📑", label: "Text (.txt)", hint: "ข้อความล้วน" },
  { k: "zip", emoji: "🗂️", label: "ดาวน์โหลดทั้งหมด (.zip)", hint: "ข้อความ + JSON + รูป/ไฟล์แนบ + ภาพหน้าเอกสาร" },
  { k: "print", emoji: "🖨️", label: "พิมพ์เอกสาร", hint: "เปิดหน้าต่างพิมพ์" },
];

/** 📥 เมนูดาวน์โหลดงานของ Garden Studio */
export function DownloadMenu({ doc, beforeExport }: { doc: StudioDoc; beforeExport?: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<Kind | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    window.addEventListener("mousedown", off);
    return () => window.removeEventListener("mousedown", off);
  }, [open]);

  const run = async (k: Kind) => {
    beforeExport?.();
    setBusy(k); setMsg(null);
    try {
      if (k === "pdf" || k === "print") { setOpen(false); setTimeout(exportPdf, 150); }
      else if (k === "docx") await exportDocx(doc);
      else if (k === "png") await exportImage(doc, "png");
      else if (k === "jpg") await exportImage(doc, "jpg");
      else if (k === "pptx") await exportPptx(doc);
      else if (k === "txt") exportText(doc);
      else if (k === "zip") await exportZip(doc);
      if (k !== "pdf" && k !== "print") { setMsg("✅ ดาวน์โหลดแล้ว"); setTimeout(() => { setMsg(null); setOpen(false); }, 900); }
    } catch (e) {
      setMsg(`⚠️ ${(e as Error).message || "ส่งออกไม่สำเร็จ"}`);
    } finally { setBusy(null); }
  };

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className="tap inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-white px-3 py-1.5 text-[13px] font-medium text-purple-700 hover:bg-purple-50" title="ดาวน์โหลดงาน">
        <Download size={15} /> <span className="hidden sm:inline">ดาวน์โหลด</span>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1.5 w-[300px] overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-lg animate-rise">
          <div className="px-2.5 py-1.5 font-display text-[13px] text-purple-800">📥 ดาวน์โหลดงาน</div>
          {ITEMS.map((it) => (
            <button key={it.k} type="button" disabled={!!busy} onClick={() => run(it.k)} className={cn("flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left hover:bg-purple-50 disabled:opacity-60", it.best && "bg-purple-50/60")}>
              <span className="text-[18px] leading-none">{busy === it.k ? <Loader2 size={18} className="animate-spin text-purple-600" /> : it.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-ink">{it.label} {it.best && <span className="ml-1 rounded-full bg-purple-600 px-1.5 py-px text-[10px] text-white">แนะนำ</span>}</span>
                <span className="block text-[11px] leading-snug text-ink-soft">{it.hint}</span>
              </span>
            </button>
          ))}
          {msg && <div className="px-2.5 py-1.5 text-[12px] text-purple-700">{msg}</div>}
        </div>
      )}
    </div>
  );
}
