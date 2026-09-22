"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Copy, FileText, Plus, Search, Trash2 } from "lucide-react";
import type { DocType, StudioDoc } from "@/types";
import { DOC_TYPES, createDoc, deleteDoc, duplicateDoc, listDocs } from "@/lib/studio-store";
import { PLANS, getUnit } from "@/data/plans";
import { SCHEDULES } from "@/data/schedules";
import { EmptyState } from "@/components/ui";
import { cn } from "@/lib/cn";

const timeAgo = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "เมื่อสักครู่";
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
  return `${Math.round(h / 24)} วันที่แล้ว`;
};

/** หน้าแรก Garden Studio: สร้างเอกสารใหม่ + ค้นหา + เอกสารล่าสุด */
export function StudioHome({ presetType }: { presetType?: DocType }) {
  const router = useRouter();
  const [docs, setDocs] = useState<StudioDoc[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<DocType | "all">("all");
  const [picker, setPicker] = useState<DocType | null>(presetType ?? null);

  useEffect(() => {
    const load = () => setDocs(listDocs());
    load();
    window.addEventListener("lpg-studio-change", load);
    return () => window.removeEventListener("lpg-studio-change", load);
  }, []);

  const shown = useMemo(() => docs.filter((d) => (filter === "all" || d.type === filter) && (!q || d.title.toLowerCase().includes(q.toLowerCase()))), [docs, filter, q]);

  const start = (type: DocType, opts?: { planId?: string; scheduleId?: string }) => {
    const d = createDoc(type, opts);
    router.push(`/studio/${d.id}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-purple-100 via-pink-soft to-yellow-soft px-5 py-10 text-center sm:py-14">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-[13px] font-medium text-purple-700 shadow-soft">🌱 Garden Studio · 💜 ห้องสร้างสื่อ</p>
        <h1 className="mt-4 text-3xl sm:text-5xl">วันนี้จะสร้างอะไรดีคะ?</h1>
        <p className="mt-2 font-display text-lg text-purple-600">Garden Studio — พื้นที่สร้างสรรค์เอกสารการเรียนรู้</p>
        <p className="mt-1 text-[15px] text-ink-soft sm:text-base">พื้นที่สำหรับสร้าง แก้ไข และจัดเก็บเอกสารการเรียนรู้ของ Little Purple Garden</p>
        <label className="card mx-auto mt-6 flex max-w-xl items-center gap-3 px-4 py-2.5">
          <Search size={20} className="text-purple-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาเอกสารของฉัน…" className="min-w-0 flex-1 bg-transparent py-1 text-base outline-none" aria-label="ค้นหาเอกสาร" />
        </label>

        {/* ประเภทเอกสาร */}
        <div className="mt-8 flex flex-wrap items-start justify-center gap-4 sm:gap-8">
          {(Object.keys(DOC_TYPES) as DocType[]).map((t) => {
            const m = DOC_TYPES[t];
            return (
              <button key={t} type="button" onClick={() => setPicker(picker === t ? null : t)} className="group flex w-28 flex-col items-center gap-2 text-center">
                <span className={cn("grid size-16 place-items-center rounded-full text-3xl shadow-soft transition group-hover:-translate-y-1 group-hover:shadow-lift", m.tint, picker === t && "ring-4 ring-purple-400")}>{m.emoji}</span>
                <span className="text-[14px] font-medium leading-snug text-purple-800">{m.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ตัวเลือกเมื่อกดประเภท */}
      {picker && (
        <section className="card animate-rise mt-4 p-5 sm:p-6">
          <h2 className="text-xl">{DOC_TYPES[picker].emoji} สร้าง{DOC_TYPES[picker].label}</h2>
          <p className="text-[14px] text-ink-soft">{DOC_TYPES[picker].description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => start(picker)} className="tap inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700"><Plus size={16} /> สร้างเอกสารเปล่า (มีแบบฟอร์มให้)</button>
          </div>
          {picker === "plan" && (
            <div className="mt-4">
              <p className="mb-2 text-[13px] text-ink-soft">หรือเริ่มจากแผนที่มีในเว็บ (ดึงข้อมูลเรื่อง/หน่วย/จุดประสงค์/กิจกรรมมาให้):</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {PLANS.map((p) => (
                  <button key={p.id} type="button" onClick={() => start("plan", { planId: p.id })} className="card card-hover flex items-center gap-3 px-3 py-2 text-left">
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="min-w-0"><span className="block truncate font-display text-[15px] text-purple-800">เรื่อง {p.title}</span><span className="block text-[12px] text-ink-soft">หน่วย {getUnit(p.unitId)?.name} · {p.duration}</span></span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {picker === "schedule" && (
            <div className="mt-4">
              <p className="mb-2 text-[13px] text-ink-soft">หรือเริ่มจากกำหนดการสอนที่มี:</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {SCHEDULES.map((s) => (
                  <button key={s.id} type="button" onClick={() => start("schedule", { scheduleId: s.id })} className="card card-hover flex items-center gap-3 px-3 py-2 text-left">
                    <span className="text-2xl">📅</span>
                    <span className="min-w-0"><span className="block truncate font-display text-[15px] text-purple-800">{s.title}</span><span className="block text-[12px] text-ink-soft">{s.semester} {s.year} · {s.rows.length} สัปดาห์</span></span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ล่าสุด */}
      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl sm:text-3xl">🕘 เอกสารล่าสุด</h2>
          <div className="flex gap-1.5">
            {(["all", "plan", "schedule", "other"] as const).map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)} className={cn("rounded-full border px-3 py-1 text-[13px]", filter === f ? "border-purple-600 bg-purple-600 text-white" : "border-line bg-white text-ink hover:bg-purple-50")}>
                {f === "all" ? "ทั้งหมด" : `${DOC_TYPES[f].emoji} ${DOC_TYPES[f].label}`}
              </button>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <EmptyState emoji="📄" title={docs.length === 0 ? "ยังไม่มีเอกสาร" : "ไม่พบเอกสารที่ตรงกับคำค้น"} hint="กดประเภทเอกสารด้านบนเพื่อเริ่มสร้าง — เอกสารจะบันทึกอัตโนมัติ" />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {shown.map((d) => {
              const m = DOC_TYPES[d.type];
              return (
                <div key={d.id} className="card card-hover group relative flex flex-col overflow-hidden">
                  <Link href={`/studio/${d.id}`} className={cn("flex h-32 items-center justify-center", m.tint)}>
                    <div className="mx-4 w-full rounded-md bg-white/90 p-2 shadow-soft">
                      <div className="mb-1 h-2 w-2/3 rounded bg-purple-200" />
                      <div className="mb-1 h-1.5 w-full rounded bg-line" />
                      <div className="mb-1 h-1.5 w-5/6 rounded bg-line" />
                      <div className="h-1.5 w-3/4 rounded bg-line" />
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col p-3">
                    <Link href={`/studio/${d.id}`} className="line-clamp-2 font-display text-[15px] leading-snug text-purple-800 hover:underline">{d.title || "(ไม่มีชื่อ)"}</Link>
                    <p className="mt-1 text-[12px] text-ink-soft">{m.emoji} {m.label} · แก้ไข {timeAgo(d.updatedAt)}{d.dirty ? " · 🟡 รอซิงก์" : ""}</p>
                    <div className="mt-2 flex gap-1">
                      <button type="button" onClick={() => { const c = duplicateDoc(d.id); if (c) router.push(`/studio/${c.id}`); }} className="grid size-7 place-items-center rounded-lg text-ink-soft hover:bg-purple-50 hover:text-purple-700" title="ทำสำเนา"><Copy size={14} /></button>
                      <button type="button" onClick={() => confirm(`ลบ “${d.title}”?`) && deleteDoc(d.id)} className="grid size-7 place-items-center rounded-lg text-ink-soft hover:bg-red-50 hover:text-red-500" title="ลบ"><Trash2 size={14} /></button>
                      <Link href={`/studio/${d.id}`} className="ml-auto inline-flex items-center gap-1 rounded-full bg-purple-600 px-3 py-1 text-[12px] font-medium text-white hover:bg-purple-700"><FileText size={12} /> เปิด</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
