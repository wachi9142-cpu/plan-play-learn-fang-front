"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Plus, Trash2, Volume2 } from "lucide-react";
import type { Book, CornerCategory } from "@/types/book";
import { cn } from "@/lib/cn";
import { BOOK_EVENT, CORNER_CATEGORIES, createBook, deleteBook, listBooks, updateBook } from "@/lib/books-store";
import { uid } from "@/lib/studio-store";
import { BackButton } from "@/components/ui";

/** 🧸 มุมหนังสือ — พื้นที่เล็ก ๆ สำหรับเด็ก ๆ ได้อ่าน ฟัง และจินตนาการ */
export function KidsCorner() {
  const [books, setBooks] = useState<Book[]>([]);
  const [cat, setCat] = useState<CornerCategory | null>(null);
  const [open, setOpen] = useState<Book | null>(null);
  const [add, setAdd] = useState(false);
  useEffect(() => { const l = () => setBooks(listBooks("kid")); l(); window.addEventListener(BOOK_EVENT, l); return () => window.removeEventListener(BOOK_EVENT, l); }, []);
  const list = cat ? books.filter((b) => b.category === cat) : books;

  return (
    <div className="container-page py-5 sm:py-8">
      <div className="flex flex-wrap items-center gap-2"><BackButton fallback="/library" /><Link href="/library" className="text-[13px] text-purple-700 hover:underline">📚 ห้องสมุด</Link></div>

      <section className="mt-2 overflow-hidden rounded-3xl bg-gradient-to-br from-pink-soft via-cream to-yellow-soft">
        <div className="flex flex-col items-center gap-5 px-4 py-6 sm:flex-row sm:px-6 sm:py-8">
          <span className="block w-36 shrink-0 overflow-hidden rounded-3xl bg-white shadow-lift sm:w-48">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/library/kids.webp" alt="มุมหนังสือของ Little Purple Garden" className="block h-auto w-full" />
          </span>
          <div className="min-w-0 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl">🧸 มุมหนังสือ</h1>
            <p className="mt-1 text-[15px] text-ink-soft">พื้นที่เล็ก ๆ สำหรับเด็ก ๆ ได้อ่าน ฟัง และจินตนาการ 💜</p>
            <p className="mt-2 text-[14px] text-ink-soft">📖 อ่านนิทาน · 🔊 ฟังนิทาน · 🎨 ทำกิจกรรมต่อยอด</p>
          </div>
        </div>
      </section>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        <Chip active={cat === null} onClick={() => setCat(null)}>📚 ทุกเรื่อง ({books.length})</Chip>
        {CORNER_CATEGORIES.map((c) => { const n = books.filter((b) => b.category === c.id).length; return <Chip key={c.id} active={cat === c.id} onClick={() => setCat(cat === c.id ? null : c.id)}>{c.emoji} {c.label} ({n})</Chip>; })}
      </div>

      {list.length === 0 ? <div className="card mt-4 p-10 text-center text-[14px] text-ink-soft">ยังไม่มีหนังสือในหมวดนี้ — ครูกด “เพิ่มนิทาน” เพื่อเขียนเรื่องใหม่ให้เด็ก ๆ</div> : (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((b) => {
            const c = CORNER_CATEGORIES.find((x) => x.id === b.category);
            return (
              <button key={b.id} type="button" onClick={() => setOpen(b)} className="card card-hover group flex flex-col overflow-hidden text-left">
                <span className={cn("grid aspect-square place-items-center text-7xl transition-transform group-hover:scale-105 sm:text-8xl", c?.tint ?? "bg-purple-100")}>{b.emoji}</span>
                <span className="flex flex-1 flex-col p-3">
                  <span className="font-display text-[16px] leading-snug text-purple-800">{b.title}</span>
                  <span className="mt-0.5 line-clamp-2 flex-1 text-[13px] text-ink-soft">{b.description}</span>
                  <span className="mt-2 text-[12px] text-ink-soft">{c?.emoji} {c?.label} · 👶 {b.ages ?? "3–6 ปี"} · {b.pages?.length ?? 0} หน้า</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6 text-center">
        <button type="button" onClick={() => setAdd(true)} className="tap inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-[14px] text-purple-700 hover:bg-purple-50"><Plus size={16} /> เพิ่มนิทาน (สำหรับครู)</button>
      </div>

      {open && <StoryReader book={open} onClose={() => setOpen(null)} />}
      {add && <AddStory onClose={() => setAdd(false)} onCreated={(b) => { setAdd(false); setOpen(b); }} />}
    </div>
  );
}

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button type="button" onClick={onClick} className={cn("tap shrink-0 rounded-full px-4 py-2 text-[14px] ring-1 transition", active ? "bg-purple-600 text-white ring-purple-600" : "bg-white text-ink ring-line hover:bg-purple-50")}>{children}</button>
);

/** 📖 อ่านนิทาน · 🔊 ฟังนิทาน · 🎨 กิจกรรมต่อยอด */
function StoryReader({ book, onClose }: { book: Book; onClose: () => void }) {
  const pages = book.pages ?? [];
  const [i, setI] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [auto, setAuto] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const autoRef = useRef(false);
  const page = pages[i];

  useEffect(() => { setCanSpeak(typeof window !== "undefined" && "speechSynthesis" in window); return () => { try { window.speechSynthesis?.cancel(); } catch { /* */ } }; }, []);
  useEffect(() => { autoRef.current = auto; }, [auto]);

  const speak = (text: string, onEnd?: () => void) => {
    if (!canSpeak) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/\n/g, " "));
    const th = window.speechSynthesis.getVoices().find((v) => v.lang?.toLowerCase().startsWith("th"));
    if (th) u.voice = th;
    u.lang = "th-TH"; u.rate = 0.9; u.pitch = 1.1;
    u.onstart = () => setSpeaking(true);
    u.onend = () => { setSpeaking(false); onEnd?.(); };
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };
  const readPage = (idx = i) => { const p = pages[idx]; if (p) speak(p.text, () => { if (autoRef.current && idx + 1 < pages.length) { setI(idx + 1); setTimeout(() => readPage(idx + 1), 400); } else setAuto(false); }); };
  const stop = () => { try { window.speechSynthesis.cancel(); } catch { /* */ } setSpeaking(false); setAuto(false); };
  const go = (d: number) => { stop(); setI((x) => Math.min(pages.length - 1, Math.max(0, x + d))); };

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); if (e.key === "Escape") { stop(); onClose(); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const c = CORNER_CATEGORIES.find((x) => x.id === book.category);
  const last = i === pages.length - 1;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/70 p-3" onClick={() => { stop(); onClose(); }}>
      <div className="card mx-auto my-4 w-full max-w-3xl p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1"><h2 className="font-display text-xl text-purple-800 sm:text-2xl">{book.emoji} {book.title}</h2><p className="text-[12px] text-ink-soft">{c?.emoji} {c?.label} · 👶 {book.ages ?? "3–6 ปี"} · หน้า {i + 1}/{pages.length}</p></div>
          <button type="button" onClick={() => { stop(); onClose(); }} className="tap rounded-full px-3 py-1 text-ink-soft hover:bg-cream">✕ ปิด</button>
        </div>

        {page ? (
          <>
            <div className={cn("mt-3 grid place-items-center rounded-3xl p-6 text-center", c?.tint ?? "bg-purple-100")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {page.image ? <img src={page.image} alt="" className="max-h-64 rounded-2xl object-contain" /> : <span className="text-8xl sm:text-9xl">{page.emoji ?? book.emoji}</span>}
              <p className={cn("mt-4 whitespace-pre-line font-display text-xl leading-relaxed text-ink sm:text-2xl", speaking && "text-purple-800")}>{page.text}</p>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button type="button" onClick={() => go(-1)} disabled={i === 0} className="tap grid size-12 place-items-center rounded-full border border-line bg-white text-purple-700 disabled:opacity-40"><ChevronLeft size={22} /></button>
              {canSpeak && (speaking || auto
                ? <button type="button" onClick={stop} className="tap inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-3 text-[15px] font-medium text-white"><Pause size={18} /> หยุดฟัง</button>
                : <>
                    <button type="button" onClick={() => readPage()} className="tap inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-3 text-[15px] font-medium text-white shadow-soft"><Volume2 size={18} /> 🔊 ฟังหน้านี้</button>
                    <button type="button" onClick={() => { setAuto(true); autoRef.current = true; readPage(); }} className="tap inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-3 text-[15px] text-purple-700"><Play size={16} /> ฟังทั้งเรื่อง</button>
                  </>)}
              <button type="button" onClick={() => go(1)} disabled={last} className="tap grid size-12 place-items-center rounded-full border border-line bg-white text-purple-700 disabled:opacity-40"><ChevronRight size={22} /></button>
            </div>
            {!canSpeak && <p className="mt-2 text-center text-[12px] text-ink-soft">เบราว์เซอร์นี้ยังอ่านออกเสียงไม่ได้ — ให้คุณครู/ผู้ปกครองอ่านให้ฟังนะคะ</p>}

            <div className="mt-3 flex justify-center gap-1">{pages.map((p, k) => <button key={p.id} type="button" onClick={() => { stop(); setI(k); }} className={cn("size-2.5 rounded-full", k === i ? "bg-purple-600" : "bg-purple-200")} aria-label={`หน้า ${k + 1}`} />)}</div>
          </>
        ) : <p className="py-10 text-center text-ink-soft">นิทานเรื่องนี้ยังไม่มีเนื้อหา</p>}

        {last && book.activities && book.activities.length > 0 && (
          <div className="mt-5 rounded-2xl bg-cream p-4">
            <p className="font-display text-[16px] text-purple-800">🎨 กิจกรรมต่อยอด</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {book.activities.map((a, k) => a.href
                ? <Link key={k} href={a.href} className="tap rounded-full bg-white px-4 py-2 text-[14px] text-purple-700 ring-1 ring-line hover:bg-purple-50">{a.emoji} {a.label}</Link>
                : <span key={k} className="rounded-full bg-white px-4 py-2 text-[14px] ring-1 ring-line">{a.emoji} {a.label}</span>)}
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button type="button" onClick={async () => { if (confirm(`ลบนิทาน “${book.title}”?`)) { stop(); await deleteBook(book.id); onClose(); } }} className="rounded-full px-3 py-1.5 text-[12px] text-red-400 hover:bg-red-50"><Trash2 size={12} className="inline" /> ลบนิทานนี้ (สำหรับครู)</button>
        </div>
      </div>
    </div>
  );
}

function AddStory({ onClose, onCreated }: { onClose: () => void; onCreated: (b: Book) => void }) {
  const [f, setF] = useState({ title: "", emoji: "📖", category: "tale" as CornerCategory, description: "", ages: "3–6 ปี" });
  const [pages, setPages] = useState([{ id: uid(), emoji: "🌱", text: "" }]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/40 p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); const b = createBook({ audience: "kid", category: f.category, title: f.title, emoji: f.emoji, description: f.description, ages: f.ages, tags: [], pages: pages.filter((p) => p.text.trim()) }); onCreated(b); }} className="card w-full max-w-lg p-5">
        <h2 className="text-lg">🧸 เพิ่มนิทานเข้ามุมหนังสือ</h2>
        <div className="mt-3 grid gap-2 text-[13px] sm:grid-cols-[70px_1fr]">
          <label>ไอคอน<input value={f.emoji} onChange={(e) => setF({ ...f, emoji: e.target.value })} className="mt-1 w-full rounded-lg border border-line px-2 py-2 text-center text-[20px]" /></label>
          <label>ชื่อเรื่อง *<input required autoFocus value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className="mt-1 w-full rounded-lg border border-line px-3 py-2" /></label>
          <label className="sm:col-span-2">หมวด<select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as CornerCategory })} className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2">{CORNER_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}</select></label>
          <label className="sm:col-span-2">เรื่องย่อ<input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className="mt-1 w-full rounded-lg border border-line px-3 py-2" /></label>
          <label className="sm:col-span-2">เหมาะกับอายุ<input value={f.ages} onChange={(e) => setF({ ...f, ages: e.target.value })} className="mt-1 w-full rounded-lg border border-line px-3 py-2" /></label>
        </div>
        <p className="mt-3 text-[13px] font-medium">หน้าของนิทาน</p>
        <div className="mt-1 space-y-2">
          {pages.map((p, k) => (
            <div key={p.id} className="flex gap-2">
              <input value={p.emoji} onChange={(e) => setPages(pages.map((x, j) => (j === k ? { ...x, emoji: e.target.value } : x)))} className="w-14 rounded-lg border border-line px-2 py-2 text-center text-[20px]" />
              <textarea value={p.text} onChange={(e) => setPages(pages.map((x, j) => (j === k ? { ...x, text: e.target.value } : x)))} rows={2} placeholder={`ข้อความหน้า ${k + 1}`} className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-[14px]" />
              <button type="button" onClick={() => setPages(pages.filter((_, j) => j !== k))} className="text-red-400"><Trash2 size={14} /></button>
            </div>
          ))}
          <button type="button" onClick={() => setPages([...pages, { id: uid(), emoji: "🌸", text: "" }])} className="rounded-full bg-cream px-3 py-1 text-[13px]">+ เพิ่มหน้า</button>
        </div>
        <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-full px-3 py-1.5 text-[13px] text-ink-soft">ยกเลิก</button><button type="submit" className="rounded-full bg-purple-600 px-4 py-1.5 text-[13px] text-white">บันทึกนิทาน</button></div>
      </form>
    </div>
  );
}

export { updateBook };
