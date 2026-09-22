"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Download, Plus, Search, Trash2, Upload } from "lucide-react";
import type { Book, ShelfCategory } from "@/types/book";
import { cn } from "@/lib/cn";
import { BOOK_EVENT, SHELF_CATEGORIES, attachBookFile, createBook, deleteBook, fmtSize, setBookCover, shelfBooks, updateBook } from "@/lib/books-store";
import { CURRICULUM_EVENT, STATUS as CUR_STATUS } from "@/lib/curriculum-store";
import type { CurriculumStatus } from "@/types/curriculum";
import { getAsset } from "@/lib/studio-assets";
import { BackButton } from "@/components/ui";
import { PdfReader } from "@/components/curriculum/PdfReader";

/** 📚 ชั้นหนังสือ — พื้นที่แห่งความรู้สำหรับครูและผู้ใหญ่ */
export function ShelfPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [cat, setCat] = useState<ShelfCategory | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Book | null>(null);
  const [add, setAdd] = useState(false);
  useEffect(() => { const l = () => setBooks(shelfBooks()); l(); window.addEventListener(BOOK_EVENT, l); window.addEventListener(CURRICULUM_EVENT, l); return () => { window.removeEventListener(BOOK_EVENT, l); window.removeEventListener(CURRICULUM_EVENT, l); }; }, []);

  const list = useMemo(() => books.filter((b) => (!cat || b.category === cat) && (!q.trim() || `${b.title} ${b.author ?? ""} ${b.description ?? ""} ${b.tags.join(" ")}`.toLowerCase().includes(q.trim().toLowerCase()))), [books, cat, q]);
  const grouped = cat ? [[cat, list] as const] : SHELF_CATEGORIES.map((c) => [c.id, list.filter((b) => b.category === c.id)] as const).filter(([, l]) => l.length > 0);

  return (
    <div className="container-page py-5 sm:py-8">
      <div className="flex flex-wrap items-center gap-2"><BackButton fallback="/library" /><Link href="/library" className="text-[13px] text-purple-700 hover:underline">📚 ห้องสมุด</Link></div>

      <section className="mt-2 rounded-3xl bg-gradient-to-br from-purple-100 via-cream to-sky-soft px-4 py-8 sm:px-6">
        <h1 className="text-3xl sm:text-4xl">📚 ชั้นหนังสือ</h1>
        <p className="mt-1 text-[15px] text-ink-soft">พื้นที่แห่งความรู้สำหรับครูและผู้ใหญ่ — ครู บุคลากร และผู้ปกครอง</p>
        <button type="button" onClick={() => setAdd(true)} className="tap mt-4 inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-[14px] font-medium text-white shadow-soft hover:bg-purple-700"><Plus size={16} /> เพิ่มหนังสือ/เอกสาร</button>
      </section>

      <div className="card mt-4 space-y-2 p-3">
        <label className="flex items-center gap-2 rounded-xl bg-cream px-3 py-2"><Search size={16} className="text-purple-500" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาชื่อหนังสือ ผู้แต่ง หรือแท็ก" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none" /></label>
        <div className="flex flex-wrap gap-1.5">
          <Chip active={cat === null} onClick={() => setCat(null)}>ทุกหมวด ({books.length})</Chip>
          {SHELF_CATEGORIES.map((c) => <Chip key={c.id} active={cat === c.id} onClick={() => setCat(cat === c.id ? null : c.id)} title={c.hint}>{c.emoji} {c.label} ({books.filter((b) => b.category === c.id).length})</Chip>)}
        </div>
      </div>

      {grouped.length === 0 ? <div className="card mt-4 p-10 text-center text-[14px] text-ink-soft">ยังไม่มีหนังสือในหมวดนี้ — กด “เพิ่มหนังสือ/เอกสาร” เพื่ออัปโหลด PDF · Word · PowerPoint หรือใส่ลิงก์</div> : grouped.map(([id, items]) => {
        const c = SHELF_CATEGORIES.find((x) => x.id === id)!;
        const curricula = items.filter((b) => b.curriculumId).sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
        const others = items.filter((b) => !b.curriculumId);
        return (
          <section key={id} className="mt-6">
            <h2 className="text-xl">{c.emoji} {c.label} <span className="text-[13px] font-normal text-ink-soft">({items.length}) · {c.hint}</span></h2>
            {id === "official" && curricula.length > 0 && (
              <div className="mt-2">
                <p className="text-[14px] font-medium text-purple-800">📕 หลักสูตรการศึกษาปฐมวัย <span className="font-normal text-ink-soft">— แยกตามปี/ฉบับ · สถานะกำหนดโดยผู้ดูแล ไม่ใช่ “ปีใหม่กว่า = ใช้งานอยู่”</span></p>
                <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-ink-soft">{(Object.keys(CUR_STATUS) as CurriculumStatus[]).map((k) => <span key={k}>{CUR_STATUS[k].emoji} {CUR_STATUS[k].label}</span>)}</div>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {curricula.map((b) => <ShelfCard key={b.id} book={b} onOpen={() => setOpen(b)} />)}
                </div>
              </div>
            )}
            {others.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {others.map((b) => <ShelfCard key={b.id} book={b} onOpen={() => setOpen(b)} />)}
              </div>
            )}
          </section>
        );
      })}

      {open && <BookViewer book={open} onClose={() => setOpen(null)} />}
      {add && <AddDialog onClose={() => setAdd(false)} onCreated={(b) => { setAdd(false); setOpen(b); }} />}
    </div>
  );
}

const Chip = ({ active, onClick, children, title }: { active: boolean; onClick: () => void; children: React.ReactNode; title?: string }) => (
  <button type="button" title={title} onClick={onClick} className={cn("tap shrink-0 rounded-full px-3 py-1 text-[13px] ring-1", active ? "bg-purple-600 text-white ring-purple-600" : "bg-white text-ink ring-line hover:bg-purple-50")}>{children}</button>
);

function ShelfCard({ book, onOpen }: { book: Book; onOpen: () => void }) {
  return (
    <div className="card card-hover flex flex-col overflow-hidden">
      <button type="button" onClick={onOpen} className="block aspect-[3/4] bg-gradient-to-br from-purple-50 to-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {book.cover ? <img src={book.cover} alt={book.title} className="size-full object-cover" /> : <span className="grid size-full place-items-center text-6xl">{book.emoji}</span>}
      </button>
      <div className="p-2.5 text-[12px]">
        <p className="line-clamp-2 text-[13px] font-medium leading-snug">{book.title}</p>
        {book.status && <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-[11px]", CUR_STATUS[book.status as CurriculumStatus].cls)}>{CUR_STATUS[book.status as CurriculumStatus].emoji} {CUR_STATUS[book.status as CurriculumStatus].label}</span>}
        {book.author && <p className="truncate text-ink-soft">✍️ {book.author}</p>}
        <p className="mt-1 truncate text-ink-soft">{book.file ? `📄 ${fmtSize(book.file.size)}` : book.url ? "🔗 ลิงก์ภายนอก" : "— ยังไม่มีไฟล์"}</p>
        {book.curriculumId && <Link href={`/curriculum/${book.curriculumId}`} className="text-purple-600 hover:underline">📚 จัดการในระบบหลักสูตร</Link>}
      </div>
    </div>
  );
}

function BookViewer({ book, onClose }: { book: Book; onClose: () => void }) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let u: string | null = null;
    if (book.file) getAsset(book.file.assetId).then((a) => { if (a) { setBlob(a.blob); u = URL.createObjectURL(a.blob); setUrl(u); } });
    return () => { if (u) URL.revokeObjectURL(u); };
  }, [book]);
  const isPdf = book.file?.mime === "application/pdf";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-3" onClick={onClose}>
      <div className="card max-h-[94dvh] w-full max-w-4xl overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-2">
          <span className="text-3xl">{book.emoji}</span>
          <div className="min-w-0 flex-1"><h2 className="text-lg leading-snug">{book.title}</h2><p className="text-[12px] text-ink-soft">{book.author ? `✍️ ${book.author} · ` : ""}เพิ่มโดย {book.addedBy}{book.tags.length ? ` · ${book.tags.join(" · ")}` : ""}</p></div>
          <button type="button" onClick={onClose} className="rounded-full px-2 text-ink-soft hover:bg-cream">✕</button>
        </div>
        {book.status && <p className="mt-1 text-[13px]"><span className={cn("rounded-full px-2 py-0.5", CUR_STATUS[book.status as CurriculumStatus].cls)}>{CUR_STATUS[book.status as CurriculumStatus].emoji} {CUR_STATUS[book.status as CurriculumStatus].label}</span>{book.year ? <span className="ml-2 text-ink-soft">ปี พ.ศ. {book.year} · ระดับ ปฐมวัย</span> : null}</p>}
        {book.description && <p className="mt-2 text-[14px] text-ink-soft">{book.description}</p>}
        {book.curriculumId && <p className="mt-2 flex flex-wrap gap-2 text-[12px] text-ink-soft">📄 เปิดอ่าน PDF · 🔍 ค้นหาในเอกสาร · 🔖 บุ๊กมาร์ก (ในตัวอ่านด้านล่าง) · 📥 ดาวน์โหลด · <Link href={`/curriculum/${book.curriculumId}`} className="text-purple-700 underline">📑 ดูสารบัญ/โครงสร้างหลักสูตร</Link></p>}
        <div className="mt-3">
          {isPdf && blob && <PdfReader src={blob} className="h-[64dvh]" />}
          {!isPdf && url && book.file?.mime.startsWith("image/") && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={book.title} className="max-h-[60dvh] w-full rounded-xl object-contain" />
          )}
          {!isPdf && book.file && !book.file.mime.startsWith("image/") && <p className="py-10 text-center text-[14px] text-ink-soft">ไฟล์ {book.file.name} เปิดดูในเว็บไม่ได้ — ดาวน์โหลดเพื่อเปิดด้วยโปรแกรมในเครื่อง</p>}
          {!book.file && book.url && <a href={book.url} target="_blank" rel="noreferrer" className="text-purple-700 underline">🔗 เปิดลิงก์หนังสือ</a>}
          {!book.file && !book.url && <UploadBox bookId={book.id} />}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-[13px]">
          {url && <a href={url} download={book.file?.name} className="tap inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-4 py-1.5 text-white"><Download size={14} /> ดาวน์โหลด</a>}
          {!book.curriculumId && <button type="button" onClick={async () => { if (confirm(`ลบ “${book.title}” ออกจากชั้นหนังสือ?`)) { await deleteBook(book.id); onClose(); } }} className="tap rounded-full px-3 py-1.5 text-red-500 hover:bg-red-50"><Trash2 size={13} className="inline" /> ลบ</button>}
        </div>
      </div>
    </div>
  );
}

function UploadBox({ bookId }: { bookId: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-purple-200 bg-cream p-6 text-center text-[14px] hover:bg-purple-50">
      <Upload size={20} className="mx-auto text-purple-600" />
      {busy ? "กำลังอัปโหลด…" : "อัปโหลดไฟล์หนังสือ (PDF · Word · PowerPoint · รูป)"}
      <input type="file" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setBusy(true); await attachBookFile(bookId, f); setBusy(false); }} />
    </label>
  );
}

function AddDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (b: Book) => void }) {
  const [f, setF] = useState({ title: "", author: "", category: "teacher" as ShelfCategory, description: "", tags: "", url: "", emoji: "📘" });
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/40 p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={async (e) => {
        e.preventDefault(); setBusy(true);
        const b = createBook({ audience: "adult", category: f.category, title: f.title, author: f.author || undefined, description: f.description || undefined, tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean), url: f.url || undefined, emoji: f.emoji });
        if (file) await attachBookFile(b.id, file);
        if (cover) await setBookCover(b.id, cover);
        setBusy(false); onCreated(b);
      }} className="card w-full max-w-lg p-5">
        <h2 className="text-lg">📘 เพิ่มหนังสือ/เอกสารเข้าชั้นหนังสือ</h2>
        <div className="mt-3 grid gap-2 text-[13px] sm:grid-cols-[70px_1fr]">
          <label>ไอคอน<input value={f.emoji} onChange={(e) => setF({ ...f, emoji: e.target.value })} className="mt-1 w-full rounded-lg border border-line px-2 py-2 text-center text-[20px]" /></label>
          <label>ชื่อหนังสือ *<input required autoFocus value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className="mt-1 w-full rounded-lg border border-line px-3 py-2" /></label>
          <label className="sm:col-span-2">ผู้แต่ง/หน่วยงาน<input value={f.author} onChange={(e) => setF({ ...f, author: e.target.value })} className="mt-1 w-full rounded-lg border border-line px-3 py-2" /></label>
          <label className="sm:col-span-2">หมวด<select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as ShelfCategory })} className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2">{SHELF_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}</select></label>
          <label className="sm:col-span-2">คำอธิบาย<textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} rows={2} className="mt-1 w-full rounded-lg border border-line px-3 py-2" /></label>
          <label className="sm:col-span-2">แท็ก (คั่นด้วย ,)<input value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} placeholder="ปฐมวัย, พัฒนาการ" className="mt-1 w-full rounded-lg border border-line px-3 py-2" /></label>
          <label className="sm:col-span-2">ลิงก์ภายนอก (ถ้ามี)<input value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} placeholder="https://…" className="mt-1 w-full rounded-lg border border-line px-3 py-2" /></label>
          <label className="sm:col-span-2 cursor-pointer rounded-xl border-2 border-dashed border-purple-200 bg-cream p-3 text-center">📄 ไฟล์หนังสือ (PDF/Word/PPT/รูป){file && <span className="block text-purple-700">{file.name}</span>}<input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label>
          <label className="sm:col-span-2 cursor-pointer rounded-xl border border-line bg-white p-2 text-center">🖼️ รูปปก (ถ้ามี){cover && <span className="block text-purple-700">{cover.name}</span>}<input type="file" accept="image/*" className="hidden" onChange={(e) => setCover(e.target.files?.[0] ?? null)} /></label>
        </div>
        <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-full px-3 py-1.5 text-[13px] text-ink-soft">ยกเลิก</button><button type="submit" disabled={busy} className="rounded-full bg-purple-600 px-4 py-1.5 text-[13px] text-white disabled:opacity-50">{busy ? "กำลังบันทึก…" : "เพิ่มเข้าชั้นหนังสือ"}</button></div>
      </form>
    </div>
  );
}
