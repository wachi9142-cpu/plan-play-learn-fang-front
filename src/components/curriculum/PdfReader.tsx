"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bookmark, ChevronLeft, ChevronRight, Maximize2, Minimize2, Search, X, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * 📖 ตัวอ่าน PDF ในเว็บ (pdfjs-dist) — เปลี่ยนหน้า · เลขหน้า · Zoom · ค้นหาข้อความ · Bookmark · เต็มจอ
 * worker อยู่ที่ /pdf.worker.min.mjs (คัดลอกไว้ใน public)
 */
interface Props {
  src: Blob | string;
  bookmarks?: { page: number; label?: string }[];
  onToggleBookmark?: (page: number) => void;
  initialPage?: number;
  className?: string;
  compact?: boolean;
}
type Hit = { page: number; snippet: string };
type PdfDoc = { numPages: number; getPage: (n: number) => Promise<PdfPage>; destroy: () => void };
type PdfPage = { getViewport: (o: { scale: number }) => { width: number; height: number }; render: (o: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void>; cancel: () => void }; getTextContent: () => Promise<{ items: { str?: string }[] }> };

export function PdfReader({ src, bookmarks = [], onToggleBookmark, initialPage = 1, className, compact }: Props) {
  const [doc, setDoc] = useState<PdfDoc | null>(null);
  const [page, setPage] = useState(initialPage);
  const [pages, setPages] = useState(0);
  const [scale, setScale] = useState(compact ? 0.9 : 1.2);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [full, setFull] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const task = useRef<{ cancel: () => void } | null>(null);

  useEffect(() => {
    let dead = false; let d: PdfDoc | null = null;
    (async () => {
      try {
        setLoading(true); setErr(null);
        const pdfjs = await import("pdfjs-dist");
        (pdfjs as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const data = typeof src === "string" ? { url: src } : { data: await src.arrayBuffer() };
        d = await (pdfjs as unknown as { getDocument: (o: unknown) => { promise: Promise<PdfDoc> } }).getDocument(data).promise;
        if (dead) { d.destroy(); return; }
        setDoc(d); setPages(d.numPages); setPage((p) => Math.min(Math.max(1, p), d!.numPages));
      } catch (e) { if (!dead) setErr(`เปิดไฟล์ PDF ไม่สำเร็จ (${(e as Error).message})`); }
      finally { if (!dead) setLoading(false); }
    })();
    return () => { dead = true; d?.destroy(); };
  }, [src]);

  const draw = useCallback(async () => {
    if (!doc || !canvas.current) return;
    try {
      const p = await doc.getPage(page);
      const vp = p.getViewport({ scale: scale * (window.devicePixelRatio > 1 ? 1.5 : 1) });
      const cv = canvas.current; cv.width = vp.width; cv.height = vp.height;
      cv.style.width = `${vp.width / (window.devicePixelRatio > 1 ? 1.5 : 1)}px`; cv.style.height = "auto";
      task.current?.cancel();
      const t = p.render({ canvasContext: cv.getContext("2d")!, viewport: vp });
      task.current = t; await t.promise; task.current = null;
    } catch { /* ยกเลิกระหว่างเปลี่ยนหน้า */ }
  }, [doc, page, scale]);
  useEffect(() => { draw(); }, [draw]);

  const search = async () => {
    if (!doc || !q.trim()) { setHits(null); return; }
    setSearching(true); const found: Hit[] = []; const needle = q.trim().toLowerCase();
    for (let i = 1; i <= doc.numPages; i++) {
      const tc = await doc.getPage(i).then((p) => p.getTextContent());
      const text = tc.items.map((x) => x.str ?? "").join(" ");
      const k = text.toLowerCase().indexOf(needle);
      if (k >= 0) found.push({ page: i, snippet: text.slice(Math.max(0, k - 40), k + needle.length + 40).trim() });
      if (found.length >= 50) break;
    }
    setHits(found); setSearching(false);
    if (found[0]) setPage(found[0].page);
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.target as HTMLElement).tagName === "INPUT") return; if (e.key === "ArrowRight" || e.key === "PageDown") setPage((p) => Math.min(pages, p + 1)); if (e.key === "ArrowLeft" || e.key === "PageUp") setPage((p) => Math.max(1, p - 1)); if (e.key === "Escape") setFull(false); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [pages]);

  const marked = bookmarks.some((b) => b.page === page);
  return (
    <div ref={wrap} className={cn("flex flex-col overflow-hidden rounded-2xl border border-line bg-white", full && "fixed inset-0 z-50 rounded-none", className)}>
      {/* แถบเครื่องมือ */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-cream px-2 py-1.5 text-[13px]">
        <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="tap grid size-8 place-items-center rounded-lg bg-white text-purple-700 ring-1 ring-line disabled:opacity-40" title="หน้าก่อนหน้า"><ChevronLeft size={16} /></button>
        <span className="inline-flex items-center gap-1">
          <input type="number" min={1} max={pages || 1} value={page} onChange={(e) => setPage(Math.min(Math.max(1, +e.target.value || 1), pages || 1))} className="h-8 w-14 rounded-lg border border-line px-1 text-center" aria-label="เลขหน้า" />
          <span className="text-ink-soft">/ {pages || "—"}</span>
        </span>
        <button type="button" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages} className="tap grid size-8 place-items-center rounded-lg bg-white text-purple-700 ring-1 ring-line disabled:opacity-40" title="หน้าถัดไป"><ChevronRight size={16} /></button>
        <span className="mx-1 h-5 w-px bg-line" />
        <button type="button" onClick={() => setScale((s) => Math.max(0.4, +(s - 0.2).toFixed(2)))} className="tap grid size-8 place-items-center rounded-lg bg-white text-purple-700 ring-1 ring-line" title="ย่อ"><ZoomOut size={16} /></button>
        <span className="w-11 text-center text-ink-soft">{Math.round(scale * 100)}%</span>
        <button type="button" onClick={() => setScale((s) => Math.min(3, +(s + 0.2).toFixed(2)))} className="tap grid size-8 place-items-center rounded-lg bg-white text-purple-700 ring-1 ring-line" title="ขยาย"><ZoomIn size={16} /></button>
        {onToggleBookmark && <button type="button" onClick={() => onToggleBookmark(page)} className={cn("tap grid size-8 place-items-center rounded-lg ring-1 ring-line", marked ? "bg-yellow-soft text-yellow-800" : "bg-white text-purple-700")} title={marked ? "เอาที่คั่นออก" : "คั่นหน้านี้"}><Bookmark size={16} fill={marked ? "currentColor" : "none"} /></button>}
        <form onSubmit={(e) => { e.preventDefault(); search(); }} className="ml-auto flex items-center gap-1">
          <span className="relative"><Search size={14} className="absolute left-2 top-2.5 text-ink-soft" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาข้อความใน PDF" className="h-8 w-40 rounded-lg border border-line pl-7 pr-2 sm:w-52" /></span>
          <button type="submit" disabled={searching || !doc} className="tap rounded-lg bg-purple-600 px-2.5 py-1.5 text-white disabled:opacity-50">{searching ? "…" : "ค้นหา"}</button>
          {hits && <button type="button" onClick={() => { setHits(null); setQ(""); }} className="tap grid size-8 place-items-center rounded-lg bg-white ring-1 ring-line" title="ล้าง"><X size={14} /></button>}
        </form>
        <button type="button" onClick={() => setFull((f) => !f)} className="tap grid size-8 place-items-center rounded-lg bg-white text-purple-700 ring-1 ring-line" title={full ? "ออกจากเต็มจอ" : "เต็มจอ"}>{full ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* ผลค้นหา + ที่คั่น */}
        {(hits || bookmarks.length > 0) && (
          <aside className="hidden w-52 shrink-0 overflow-y-auto border-r border-line bg-cream p-2 text-[12px] sm:block">
            {hits && <><p className="font-medium">🔍 พบ {hits.length} หน้า</p><ul className="mt-1 space-y-1">{hits.map((h) => <li key={h.page}><button type="button" onClick={() => setPage(h.page)} className={cn("w-full rounded-lg px-2 py-1 text-left hover:bg-white", page === h.page && "bg-white ring-1 ring-purple-300")}><b>หน้า {h.page}</b><span className="line-clamp-2 text-ink-soft">…{h.snippet}…</span></button></li>)}</ul></>}
            {bookmarks.length > 0 && <><p className="mt-3 font-medium">📌 ที่คั่น</p><ul className="mt-1 space-y-1">{bookmarks.map((b) => <li key={b.page}><button type="button" onClick={() => setPage(b.page)} className="w-full rounded-lg px-2 py-1 text-left hover:bg-white">หน้า {b.page}{b.label ? ` · ${b.label}` : ""}</button></li>)}</ul></>}
          </aside>
        )}
        {/* หน้ากระดาษ */}
        <div className="min-h-0 flex-1 overflow-auto bg-[#f3f0f7] p-3 text-center">
          {loading && <p className="py-16 text-ink-soft">กำลังเปิดเอกสาร…</p>}
          {err && <p className="py-16 text-red-500">{err}</p>}
          <canvas ref={canvas} className={cn("mx-auto max-w-full rounded-lg bg-white shadow-soft", (loading || err) && "hidden")} />
        </div>
      </div>
    </div>
  );
}
