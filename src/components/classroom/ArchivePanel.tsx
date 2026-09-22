"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import type { ArchiveItem, ArchiveKind, ClassRoom } from "@/types/classroom";
import { cn } from "@/lib/cn";
import { ARCHIVE_KINDS, CLASS_EVENT, addArchive, fmtDate, kindOfMime, listArchive, listSessions, removeArchive, updateArchive } from "@/lib/classroom-store";
import { fileEmoji, fmtSize, getAsset, removeAsset, addAsset } from "@/lib/studio-assets";
import { uid } from "@/lib/studio-store";
import { UNITS } from "@/data/plans";

/** 📚 คลังย้อนหลังของห้อง — ภาพ / วิดีโอ / ไฟล์ / อื่น ๆ · กรองตามวันที่ หน่วย กิจกรรม */
export function ArchivePanel({ room, isTeacher, by }: { room: ClassRoom; isTeacher: boolean; by: string }) {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [kind, setKind] = useState<ArchiveKind | "all">("all");
  const [q, setQ] = useState("");
  const [unit, setUnit] = useState("");
  const [month, setMonth] = useState("");
  const [add, setAdd] = useState(false);
  const [open, setOpen] = useState<ArchiveItem | null>(null);

  useEffect(() => { const load = () => setItems(listArchive(room.id)); load(); window.addEventListener(CLASS_EVENT, load); return () => window.removeEventListener(CLASS_EVENT, load); }, [room.id]);

  const months = useMemo(() => Array.from(new Set(items.map((i) => i.date.slice(0, 7)))).sort().reverse(), [items]);
  const shown = items.filter((i) => (kind === "all" || i.kind === kind) && (!unit || i.unitId === unit) && (!month || i.date.startsWith(month)) && (!q || `${i.title} ${i.activity ?? ""} ${i.note ?? ""}`.toLowerCase().includes(q.toLowerCase())));
  const sessions = listSessions(room.id);

  return (
    <div className="space-y-3">
      <div className="card p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="no-scrollbar flex gap-1 overflow-x-auto">
            <button type="button" onClick={() => setKind("all")} className={cn("shrink-0 rounded-full px-3 py-1 text-[13px]", kind === "all" ? "bg-purple-600 text-white" : "bg-cream hover:bg-purple-50")}>ทั้งหมด ({items.length})</button>
            {ARCHIVE_KINDS.map((k) => <button key={k.id} type="button" onClick={() => setKind(k.id)} title={k.hint} className={cn("shrink-0 rounded-full px-3 py-1 text-[13px]", kind === k.id ? "bg-purple-600 text-white" : "bg-cream hover:bg-purple-50")}>{k.emoji} {k.label} ({items.filter((i) => i.kind === k.id).length})</button>)}
          </div>
          {isTeacher && <button type="button" onClick={() => setAdd(true)} className="tap ml-auto inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-3 py-1.5 text-[13px] text-white hover:bg-purple-700"><Upload size={14} /> เพิ่มเนื้อหา</button>}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-[13px]">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 ค้นหาชื่อ/กิจกรรม" className="min-w-0 flex-1 rounded-lg border border-line px-3 py-1.5 outline-none focus:border-purple-400" />
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-lg border border-line bg-white px-2 py-1.5"><option value="">📅 ทุกเดือน</option>{months.map((m) => <option key={m} value={m}>{new Date(`${m}-01`).toLocaleDateString("th-TH", { month: "long", year: "numeric" })}</option>)}</select>
          <select value={unit} onChange={(e) => setUnit(e.target.value)} className="rounded-lg border border-line bg-white px-2 py-1.5"><option value="">📖 ทุกหน่วย</option>{UNITS.map((u) => <option key={u.id} value={u.id}>{u.emoji} {u.name}</option>)}</select>
        </div>
      </div>

      {sessions.length > 0 && (
        <details className="card p-3 text-[13px]"><summary className="cursor-pointer font-medium">🕘 ประวัติคาบเรียนสด ({sessions.length})</summary>
          <ul className="mt-2 space-y-1">{sessions.map((s) => <li key={s.id} className="flex flex-wrap gap-2 rounded-lg bg-cream px-2 py-1"><span>{s.title}</span><span className="text-ink-soft">{new Date(s.startedAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}{s.endedAt && ` – ${new Date(s.endedAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`}</span>{s.attendees.length > 0 && <span className="text-ink-soft">👧 {s.attendees.join(", ")}</span>}{s.recordingId && <span className="text-purple-700">🎥 มีคลิป</span>}</li>)}</ul>
        </details>
      )}

      {shown.length === 0 ? <div className="card p-8 text-center text-[14px] text-ink-soft">ยังไม่มีเนื้อหาในหมวดนี้ {isTeacher && "— กด “เพิ่มเนื้อหา” เพื่ออัปโหลดภาพ คลิป ใบงาน หรือลิงก์"}</div> : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((i) => <Card key={i.id} item={i} onOpen={() => setOpen(i)} onDelete={isTeacher ? async () => { if (confirm(`ลบ “${i.title}”?`)) { if (i.assetId) await removeAsset(i.assetId, `class:${room.id}`); removeArchive(i.id); } } : undefined} />)}
        </div>
      )}

      {add && <AddDialog room={room} by={by} onClose={() => setAdd(false)} />}
      {open && <Viewer item={open} onClose={() => setOpen(null)} isTeacher={isTeacher} />}
    </div>
  );
}

function useAssetUrl(assetId?: string) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => { let u: string | null = null; if (assetId) getAsset(assetId).then((a) => { if (a) { u = URL.createObjectURL(a.blob); setUrl(u); } }); return () => { if (u) URL.revokeObjectURL(u); }; }, [assetId]);
  return url;
}

function Card({ item, onOpen, onDelete }: { item: ArchiveItem; onOpen: () => void; onDelete?: () => void }) {
  const k = ARCHIVE_KINDS.find((x) => x.id === item.kind)!;
  const url = useAssetUrl(item.kind === "image" && !item.thumb ? item.assetId : undefined);
  const img = item.thumb ?? url;
  return (
    <div className="card card-hover flex flex-col overflow-hidden">
      <button type="button" onClick={onOpen} className="block aspect-[4/3] bg-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {img ? <img src={img} alt={item.title} className="size-full object-cover" /> : <div className="grid size-full place-items-center text-5xl">{item.kind === "file" ? fileEmoji(item.mime ?? "", item.title) : k.emoji}</div>}
      </button>
      <div className="p-2 text-[12px]">
        <p className="line-clamp-2 text-[13px] font-medium leading-snug">{item.title}</p>
        <p className="text-ink-soft">{fmtDate(item.date)}{item.unitId && ` · ${UNITS.find((u) => u.id === item.unitId)?.name ?? ""}`}{item.activity && ` · ${item.activity}`}</p>
        <div className="mt-1 flex items-center gap-1"><span className="rounded-full bg-cream px-1.5">{k.emoji} {k.label}</span>{item.size && <span className="text-ink-soft">{fmtSize(item.size)}</span>}{onDelete && <button type="button" onClick={onDelete} className="ml-auto text-ink-soft hover:text-red-500"><Trash2 size={12} /></button>}</div>
      </div>
    </div>
  );
}

function Viewer({ item, onClose, isTeacher }: { item: ArchiveItem; onClose: () => void; isTeacher: boolean }) {
  const url = useAssetUrl(item.assetId);
  const [note, setNote] = useState(item.note ?? "");
  const yt = item.url?.match(/(?:youtu\.be\/|v=)([\w-]{6,})/)?.[1];
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-3" onClick={onClose}>
      <div className="card max-h-[92dvh] w-full max-w-3xl overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-2"><h3 className="flex-1 text-lg leading-snug">{item.title}</h3><button type="button" onClick={onClose} className="rounded-full px-2 text-ink-soft hover:bg-cream">✕</button></div>
        <p className="text-[12px] text-ink-soft">{fmtDate(item.date)} · โดย {item.by}{item.unitId && ` · 📖 ${UNITS.find((u) => u.id === item.unitId)?.name}`}{item.activity && ` · 🎯 ${item.activity}`}</p>
        <div className="mt-3">
          {item.kind === "video" && url && <video src={url} controls className="w-full rounded-xl bg-black" />}
          {item.kind === "video" && yt && <iframe src={`https://www.youtube.com/embed/${yt}`} className="aspect-video w-full rounded-xl" allowFullScreen title={item.title} />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {item.kind === "image" && (url || item.thumb) && <img src={url ?? item.thumb} alt={item.title} className="max-h-[60dvh] w-full rounded-xl object-contain" />}
          {item.kind === "file" && url && item.mime === "application/pdf" && <iframe src={url} className="h-[60dvh] w-full rounded-xl" title={item.title} />}
          {item.url && !yt && <a href={item.url} target="_blank" rel="noreferrer" className="text-purple-700 underline">🔗 {item.url}</a>}
        </div>
        {item.note && !isTeacher && <p className="mt-2 rounded-xl bg-cream px-3 py-2 text-[13px]">{item.note}</p>}
        {isTeacher && <textarea value={note} onChange={(e) => setNote(e.target.value)} onBlur={() => updateArchive(item.id, { note })} placeholder="หมายเหตุถึงผู้ปกครอง เช่น สิ่งที่ควรทบทวนที่บ้าน" className="mt-2 w-full rounded-xl border border-line px-3 py-2 text-[13px] outline-none focus:border-purple-400" rows={2} />}
        {url && <a href={url} download={item.title} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-4 py-1.5 text-[13px] text-white"><Download size={14} /> ดาวน์โหลด</a>}
      </div>
    </div>
  );
}

function AddDialog({ room, by, onClose }: { room: ClassRoom; by: string; onClose: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [unitId, setUnit] = useState("");
  const [activity, setActivity] = useState("");
  const [kind, setKind] = useState<ArchiveKind>("other");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    const date = new Date().toISOString();
    if (files.length) {
      for (const f of files) {
        const a = await addAsset(`class:${room.id}`, f);
        let thumb: string | undefined;
        if (f.type.startsWith("image/")) thumb = await new Promise<string>((r) => { const img = new Image(); const u = URL.createObjectURL(f); img.onload = () => { const c = document.createElement("canvas"); const k = Math.min(1, 320 / img.width); c.width = img.width * k; c.height = img.height * k; c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height); r(c.toDataURL("image/jpeg", 0.6)); URL.revokeObjectURL(u); }; img.src = u; });
        addArchive({ id: uid(), roomId: room.id, kind: kindOfMime(f.type), title: files.length === 1 && title ? title : title ? `${title} — ${f.name}` : f.name, date, unitId: unitId || undefined, activity: activity || undefined, assetId: a.id, mime: f.type, size: f.size, thumb, by });
      }
    } else if (url.trim()) {
      addArchive({ id: uid(), roomId: room.id, kind: /youtu/.test(url) ? "video" : kind, title: title || url, date, unitId: unitId || undefined, activity: activity || undefined, url: url.trim(), by });
    }
    setBusy(false); onClose();
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-3" onClick={onClose}>
      <div className="card w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg">📚 เพิ่มเนื้อหาย้อนหลัง</h3>
        <p className="text-[12px] text-ink-soft">ภาพ · คลิป · ใบงาน/PDF · สื่อ · ลิงก์ (YouTube ฯลฯ) — ระบบจัดหมวดให้อัตโนมัติจากชนิดไฟล์</p>
        <label className="mt-3 block rounded-2xl border-2 border-dashed border-purple-200 bg-cream p-4 text-center text-[13px] hover:bg-purple-50"><Upload size={20} className="mx-auto text-purple-600" />เลือกไฟล์ (หลายไฟล์ได้)<input type="file" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />{files.length > 0 && <p className="mt-1 text-purple-700">{files.length} ไฟล์ · {fmtSize(files.reduce((a, f) => a + f.size, 0))}</p>}</label>
        <p className="my-2 text-center text-[12px] text-ink-soft">— หรือ —</p>
        <div className="flex gap-2"><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="ลิงก์ เช่น https://youtu.be/…" className="flex-1 rounded-lg border border-line px-3 py-1.5 text-[13px] outline-none focus:border-purple-400" /><select value={kind} onChange={(e) => setKind(e.target.value as ArchiveKind)} className="rounded-lg border border-line bg-white px-2 text-[13px]">{ARCHIVE_KINDS.map((k) => <option key={k.id} value={k.id}>{k.emoji} {k.label}</option>)}</select></div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ชื่อเนื้อหา (ไม่ใส่จะใช้ชื่อไฟล์)" className="mt-2 w-full rounded-lg border border-line px-3 py-1.5 text-[13px] outline-none focus:border-purple-400" />
        <div className="mt-2 flex gap-2"><select value={unitId} onChange={(e) => setUnit(e.target.value)} className="flex-1 rounded-lg border border-line bg-white px-2 py-1.5 text-[13px]"><option value="">📖 หน่วยการเรียนรู้ (ถ้ามี)</option>{UNITS.map((u) => <option key={u.id} value={u.id}>{u.emoji} {u.name}</option>)}</select><input value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="🎯 กิจกรรม เช่น ศิลปะสร้างสรรค์" className="flex-1 rounded-lg border border-line px-3 py-1.5 text-[13px] outline-none focus:border-purple-400" /></div>
        <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-full px-3 py-1.5 text-[13px] text-ink-soft">ยกเลิก</button><button type="button" disabled={busy || (!files.length && !url.trim())} onClick={submit} className="rounded-full bg-purple-600 px-4 py-1.5 text-[13px] text-white disabled:opacity-50">{busy ? "กำลังบันทึก…" : "บันทึกเข้าคลัง"}</button></div>
      </div>
    </div>
  );
}
