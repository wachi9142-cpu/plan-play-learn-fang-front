"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Download, Eye, EyeOff, Trash2 } from "lucide-react";
import type { PortfolioCategory, PortfolioItem } from "@/types/canvas";
import { cn } from "@/lib/cn";
import { CANVAS_EVENT, listPortfolio, removePortfolio, updatePortfolio } from "@/lib/canvas-store";
import { getClassMe, listRooms, type ClassMe } from "@/lib/classroom-store";
import { Avatar } from "@/components/profile/Avatar";

export const PF_CATEGORIES: { id: PortfolioCategory; emoji: string; label: string }[] = [
  { id: "art", emoji: "🎨", label: "ศิลปะ/ภาพวาด" },
  { id: "coding", emoji: "💻", label: "Coding" },
  { id: "worksheet", emoji: "📝", label: "ใบงาน" },
  { id: "craft", emoji: "✂️", label: "งานประดิษฐ์/ปั้น" },
  { id: "writing", emoji: "🔤", label: "การเขียน" },
  { id: "photo", emoji: "📷", label: "ภาพกิจกรรม" },
  { id: "other", emoji: "📦", label: "อื่น ๆ" },
];

/** 🏆 แฟ้มผลงานเด็ก — หมวดหมู่ · วันที่ · ความคิดเห็นครู · Private / แสดงใน Gallery */
export function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [me, setMe] = useState<ClassMe | null>(null);
  const [child, setChild] = useState("");
  const [cat, setCat] = useState<PortfolioCategory | null>(null);
  const [open, setOpen] = useState<PortfolioItem | null>(null);
  useEffect(() => { const l = () => setItems(listPortfolio()); l(); setMe(getClassMe()); window.addEventListener(CANVAS_EVENT, l); return () => window.removeEventListener(CANVAS_EVENT, l); }, []);

  const isTeacher = me?.role === "teacher";
  /** ผู้ปกครอง/นักเรียนเห็นเฉพาะของตนเอง · ผู้เยี่ยมชมเห็นเฉพาะที่เผยแพร่ */
  const visible = useMemo(() => items.filter((p) => {
    if (isTeacher) return true;
    if (me?.role === "parent") return p.childName === me.childName || p.published;
    if (me?.role === "child") return p.childName === me.name || p.published;
    return p.published;
  }), [items, me, isTeacher]);
  const children = Array.from(new Set(visible.map((p) => p.childName)));
  const list = visible.filter((p) => (!child || p.childName === child) && (!cat || (p.category ?? "art") === cat));

  return (
    <div className="container-page py-6 sm:py-10">
      <section className="rounded-3xl bg-gradient-to-br from-pink-soft via-cream to-yellow-soft px-4 py-8 sm:px-6">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-[13px] font-medium text-purple-700 shadow-soft">🏆 แฟ้มผลงานเด็ก · Portfolio</p>
        <h1 className="mt-3 text-3xl sm:text-4xl">ผลงานของเด็ก ๆ</h1>
        <p className="mt-2 max-w-3xl text-[15px] text-ink-soft">ผลงานจาก 🎨 Garden Canvas · งานที่ส่งในห้องเรียน · ภาพผลงานที่ครูอัปโหลด — จัดหมวดหมู่ ใส่ความคิดเห็นครู และเลือกว่าจะเก็บเป็นส่วนตัวหรือแสดงใน <Link href="/gallery/works" className="text-purple-700 underline">ผลงานเด็ก</Link></p>
        <p className="mt-2 text-[13px] text-ink-soft">{isTeacher ? "👩‍🏫 คุณเป็นครู — เห็นและจัดการผลงานทั้งหมด" : me ? `${me.role === "parent" ? "👨‍👩‍👧 ผู้ปกครอง" : "👧 นักเรียน"} — เห็นผลงานของตนเองและผลงานที่เผยแพร่` : "🌐 ผู้เยี่ยมชม — เห็นเฉพาะผลงานที่ครูเผยแพร่"}</p>
      </section>

      <div className="card mt-5 flex flex-wrap items-center gap-1.5 p-3">
        <Chip active={cat === null} onClick={() => setCat(null)}>ทุกหมวด ({visible.length})</Chip>
        {PF_CATEGORIES.map((c) => { const n = visible.filter((p) => (p.category ?? "art") === c.id).length; return n ? <Chip key={c.id} active={cat === c.id} onClick={() => setCat(cat === c.id ? null : c.id)}>{c.emoji} {c.label} ({n})</Chip> : null; })}
        <select value={child} onChange={(e) => setChild(e.target.value)} className="ml-auto rounded-lg border border-line bg-white px-2 py-1 text-[13px]"><option value="">🧒 ทุกคน</option>{children.map((c) => <option key={c} value={c}>{c}</option>)}</select>
      </div>

      {list.length === 0 ? <div className="card mt-4 p-10 text-center text-[14px] text-ink-soft">ยังไม่มีผลงาน — วาดใน <Link href="/canvas" className="text-purple-700 underline">🎨 Garden Canvas</Link> แล้วกด “บันทึกผลงาน”</div> : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => {
            const c = PF_CATEGORIES.find((x) => x.id === (p.category ?? "art"))!;
            return (
              <figure key={p.id} className="card card-hover flex flex-col overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <button type="button" onClick={() => setOpen(p)} className="block"><img src={p.image} alt={p.title} className="aspect-square w-full object-cover" loading="lazy" /></button>
                <figcaption className="flex flex-1 flex-col p-2.5 text-[12px]">
                  <p className="text-ink-soft">{new Date(p.date).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}</p>
                  <p className="line-clamp-2 text-[14px] font-medium leading-snug">{p.title}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-ink-soft"><Avatar name={p.childName} size={18} /> {p.childName}</p>
                  <span className="mt-1 w-fit rounded-full bg-cream px-2 py-0.5">{c.emoji} {c.label}</span>
                  {p.teacherComment && <p className="mt-1 line-clamp-2 rounded-lg bg-purple-50 px-2 py-1 text-purple-800">👩‍🏫 {p.teacherComment}</p>}
                  <div className="mt-2 flex items-center gap-1">
                    <span className={cn("rounded-full px-2 py-0.5", p.published ? "bg-mint-soft text-green-800" : "bg-cream text-ink-soft")}>{p.published ? <><Eye size={11} className="inline" /> แสดงใน Gallery</> : <><EyeOff size={11} className="inline" /> ส่วนตัว</>}</span>
                    {isTeacher && <button type="button" onClick={() => { if (confirm("ลบผลงานนี้?")) removePortfolio(p.id); }} className="ml-auto text-ink-soft hover:text-red-500"><Trash2 size={12} /></button>}
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}

      {open && <Detail item={open} isTeacher={isTeacher} onClose={() => setOpen(null)} />}
    </div>
  );
}

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button type="button" onClick={onClick} className={cn("tap shrink-0 rounded-full px-3 py-1 text-[13px] ring-1", active ? "bg-purple-600 text-white ring-purple-600" : "bg-white text-ink ring-line hover:bg-purple-50")}>{children}</button>
);

function Detail({ item, isTeacher, onClose }: { item: PortfolioItem; isTeacher: boolean; onClose: () => void }) {
  const [comment, setComment] = useState(item.teacherComment ?? "");
  const rooms = listRooms();
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-3" onClick={onClose}>
      <div className="card max-h-[92dvh] w-full max-w-2xl overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-2"><h2 className="flex-1 text-lg">{item.title}</h2><button type="button" onClick={onClose} className="rounded-full px-2 text-ink-soft hover:bg-cream">✕</button></div>
        <p className="text-[12px] text-ink-soft">🧒 {item.childName} · {new Date(item.date).toLocaleDateString("th-TH")}{item.authors && item.authors.filter((a) => a !== item.childName).length ? ` · วาดร่วมกับ ${item.authors.filter((a) => a !== item.childName).join(", ")}` : ""}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image} alt={item.title} className="mt-3 max-h-[52dvh] w-full rounded-xl object-contain" />
        {isTeacher ? (
          <div className="mt-3 space-y-2 text-[13px]">
            <div className="flex flex-wrap items-center gap-2">
              <label>หมวดหมู่ <select value={item.category ?? "art"} onChange={(e) => updatePortfolio(item.id, { category: e.target.value as PortfolioCategory })} className="rounded-lg border border-line bg-white px-2 py-1">{PF_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}</select></label>
              <label>ห้อง <select value={item.roomId ?? ""} onChange={(e) => updatePortfolio(item.id, { roomId: e.target.value || undefined })} className="rounded-lg border border-line bg-white px-2 py-1"><option value="">—</option>{rooms.map((r) => <option key={r.id} value={r.id}>{r.emoji} {r.nickname}</option>)}</select></label>
              <button type="button" onClick={() => updatePortfolio(item.id, { published: !item.published })} className={cn("tap rounded-full px-3 py-1 font-medium", item.published ? "bg-mint-soft text-green-800" : "bg-purple-600 text-white")}>{item.published ? "🔒 เปลี่ยนเป็นส่วนตัว" : "🏆 แสดงใน Gallery"}</button>
            </div>
            <label className="block">👩‍🏫 ความคิดเห็นครู<textarea value={comment} onChange={(e) => setComment(e.target.value)} onBlur={() => updatePortfolio(item.id, { teacherComment: comment })} rows={2} placeholder="เช่น ใช้สีได้หลากหลาย เล่าเรื่องจากภาพได้ดีมาก" className="mt-1 w-full rounded-xl border border-line px-3 py-2 outline-none focus:border-purple-400" /></label>
          </div>
        ) : item.teacherComment && <p className="mt-3 rounded-xl bg-purple-50 px-3 py-2 text-[14px] text-purple-800">👩‍🏫 {item.teacherComment}</p>}
        <a href={item.image} download={`${item.title}.jpg`} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-4 py-1.5 text-[13px] text-white"><Download size={14} /> ดาวน์โหลด</a>
      </div>
    </div>
  );
}
