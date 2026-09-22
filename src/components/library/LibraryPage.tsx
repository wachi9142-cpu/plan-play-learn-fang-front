"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Download, ExternalLink, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { LIB_KINDS, LIB_SOURCES, buildLibrary, type LibItem, type LibKind, type LibSource } from "@/lib/library";
import { CLASS_EVENT, listRooms } from "@/lib/classroom-store";
import { CURRICULUM_EVENT } from "@/lib/curriculum-store";
import { CANVAS_EVENT } from "@/lib/canvas-store";
import { getAsset, fmtSize } from "@/lib/studio-assets";
import { UNITS } from "@/data/plans";

/** 📚 Garden Library — คลังสื่อรวมของทั้งเว็บ */
export function LibraryPage() {
  const [items, setItems] = useState<LibItem[] | null>(null);
  const [kind, setKind] = useState<LibKind | null>(null);
  const [source, setSource] = useState<LibSource | null>(null);
  const [room, setRoom] = useState("");
  const [unit, setUnit] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<LibItem | null>(null);
  const [rooms, setRooms] = useState<ReturnType<typeof listRooms>>([]);

  useEffect(() => {
    const load = () => { buildLibrary().then(setItems).catch(() => setItems([])); setRooms(listRooms()); };
    load();
    const evs = ["lpg-assets-change", CLASS_EVENT, CURRICULUM_EVENT, CANVAS_EVENT, "lpg-studio-change"];
    evs.forEach((e) => window.addEventListener(e, load));
    return () => evs.forEach((e) => window.removeEventListener(e, load));
  }, []);

  const list = useMemo(() => (items ?? []).filter((i) =>
    (!kind || i.kind === kind) && (!source || i.source === source) && (!room || i.roomId === room) && (!unit || i.unitId === unit) &&
    (!q.trim() || `${i.title} ${i.sourceLabel} ${i.tags.join(" ")}`.toLowerCase().includes(q.trim().toLowerCase()))
  ), [items, kind, source, room, unit, q]);


  return (
    <div className="container-page py-6 sm:py-10">
      <section className="rounded-3xl bg-gradient-to-br from-mint-soft via-cream to-purple-100 px-4 py-8 sm:px-6">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-[13px] font-medium text-purple-700 shadow-soft">📚 Garden Library · คลังสื่อรวม</p>
        <h1 className="mt-3 text-3xl sm:text-4xl">สื่อทั้งหมดของโรงเรียนในที่เดียว</h1>
        <p className="mt-2 max-w-3xl text-[15px] text-ink-soft">รูป · วิดีโอ · เสียง · PDF · Word · PowerPoint · สเปรดชีต · ผลงานเด็ก — รวมจาก Garden Studio · ห้องเรียนออนไลน์ · หลักสูตร · Garden Canvas พร้อมลิงก์กลับต้นทาง</p>
      </section>

      <div className="card mt-5 space-y-2 p-3">
        <label className="flex items-center gap-2 rounded-xl bg-cream px-3 py-2"><Search size={16} className="text-purple-500" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาชื่อไฟล์ ผลงาน หรือแท็ก" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none" /></label>
        <div className="flex flex-wrap gap-1.5">
          <Chip active={kind === null} onClick={() => setKind(null)}>ทุกประเภท ({items?.length ?? 0})</Chip>
          {LIB_KINDS.map((k) => { const n = (items ?? []).filter((i) => i.kind === k.id).length; return n ? <Chip key={k.id} active={kind === k.id} onClick={() => setKind(kind === k.id ? null : k.id)}>{k.emoji} {k.label} ({n})</Chip> : null; })}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[13px] text-ink-soft">ที่มา:</span>
          <Chip active={source === null} onClick={() => setSource(null)}>ทั้งหมด</Chip>
          {(Object.keys(LIB_SOURCES) as LibSource[]).map((s) => { const n = (items ?? []).filter((i) => i.source === s).length; return <Chip key={s} active={source === s} onClick={() => setSource(source === s ? null : s)}>{LIB_SOURCES[s].emoji} {LIB_SOURCES[s].label} ({n})</Chip>; })}
          <select value={room} onChange={(e) => setRoom(e.target.value)} className="ml-auto rounded-lg border border-line bg-white px-2 py-1 text-[13px]"><option value="">🏫 ทุกห้อง</option>{rooms.map((r) => <option key={r.id} value={r.id}>{r.emoji} {r.nickname}</option>)}</select>
          <select value={unit} onChange={(e) => setUnit(e.target.value)} className="rounded-lg border border-line bg-white px-2 py-1 text-[13px]"><option value="">📖 ทุกหน่วย</option>{UNITS.map((u) => <option key={u.id} value={u.id}>{u.emoji} {u.name}</option>)}</select>
        </div>
      </div>

      {items === null ? <p className="py-16 text-center text-ink-soft">กำลังรวบรวมสื่อ…</p>
        : list.length === 0 ? <div className="card mt-4 p-10 text-center text-[14px] text-ink-soft">ยังไม่มีสื่อในหมวดนี้ — อัปโหลดไฟล์ใน Garden Studio · เพิ่มคลังย้อนหลังในห้องเรียน · อัปโหลด PDF หลักสูตร · หรือบันทึกผลงานจาก Garden Canvas</div>
        : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {list.map((i) => <Card key={i.id} item={i} onOpen={() => setOpen(i)} />)}
          </div>
        )}

      {open && <Viewer item={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button type="button" onClick={onClick} className={cn("tap shrink-0 rounded-full px-3 py-1 text-[13px] ring-1 transition", active ? "bg-purple-600 text-white ring-purple-600" : "bg-white text-ink ring-line hover:bg-purple-50")}>{children}</button>
);

function useThumb(item: LibItem) {
  const [url, setUrl] = useState<string | null>(item.dataUrl ?? null);
  useEffect(() => {
    if (item.dataUrl || item.kind !== "image" || !item.assetId) return;
    let u: string | null = null;
    getAsset(item.assetId).then((a) => { if (a) { u = URL.createObjectURL(a.blob); setUrl(u); } });
    return () => { if (u) URL.revokeObjectURL(u); };
  }, [item]);
  return url;
}

function Card({ item, onOpen }: { item: LibItem; onOpen: () => void }) {
  const thumb = useThumb(item);
  const k = LIB_KINDS.find((x) => x.id === item.kind)!;
  return (
    <div className="card card-hover flex flex-col overflow-hidden">
      <button type="button" onClick={onOpen} className="block aspect-[4/3] bg-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {thumb ? <img src={thumb} alt={item.title} className="size-full object-cover" loading="lazy" /> : <span className="grid size-full place-items-center text-5xl">{k.emoji}</span>}
      </button>
      <div className="p-2 text-[12px]">
        <p className="line-clamp-2 text-[13px] font-medium leading-snug">{item.title}</p>
        <p className="truncate text-ink-soft">{item.sourceLabel}</p>
        <div className="mt-1 flex items-center gap-1">
          <span className="rounded-full bg-cream px-1.5">{k.emoji} {k.label}</span>
          {item.size && <span className="text-ink-soft">{fmtSize(item.size)}</span>}
          {item.href && <Link href={item.href} className="ml-auto text-purple-600 hover:text-purple-800" title="ไปที่ต้นทาง"><ExternalLink size={12} /></Link>}
        </div>
      </div>
    </div>
  );
}

function Viewer({ item, onClose }: { item: LibItem; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(item.dataUrl ?? null);
  useEffect(() => { if (item.dataUrl || !item.assetId) return; let u: string | null = null; getAsset(item.assetId).then((a) => { if (a) { u = URL.createObjectURL(a.blob); setUrl(u); } }); return () => { if (u) URL.revokeObjectURL(u); }; }, [item]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-3" onClick={onClose}>
      <div className="card max-h-[92dvh] w-full max-w-3xl overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-2"><h2 className="flex-1 text-lg leading-snug">{item.title}</h2><button type="button" onClick={onClose} className="rounded-full px-2 text-ink-soft hover:bg-cream">✕</button></div>
        <p className="text-[12px] text-ink-soft">{item.sourceLabel} · {new Date(item.date).toLocaleDateString("th-TH")}{item.size ? ` · ${fmtSize(item.size)}` : ""}</p>
        <div className="mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {item.kind === "image" && url && <img src={url} alt={item.title} className="max-h-[60dvh] w-full rounded-xl object-contain" />}
          {item.kind === "video" && url && <video src={url} controls className="w-full rounded-xl bg-black" />}
          {item.kind === "audio" && url && <audio src={url} controls className="w-full" />}
          {item.kind === "pdf" && url && <iframe src={url} className="h-[60dvh] w-full rounded-xl" title={item.title} />}
          {!["image", "video", "audio", "pdf"].includes(item.kind) && <p className="py-10 text-center text-ink-soft">ไฟล์ประเภทนี้เปิดดูในเว็บไม่ได้ — ดาวน์โหลดเพื่อเปิดด้วยโปรแกรมในเครื่อง</p>}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {url && <a href={url} download={item.title} className="tap inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-4 py-1.5 text-[13px] text-white"><Download size={14} /> ดาวน์โหลด</a>}
          {item.href && <Link href={item.href} className="tap inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-1.5 text-[13px] text-purple-700"><ExternalLink size={14} /> ไปที่ต้นทาง</Link>}
        </div>
      </div>
    </div>
  );
}
