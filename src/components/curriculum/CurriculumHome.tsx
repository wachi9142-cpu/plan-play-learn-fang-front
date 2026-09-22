"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FileText, Plus } from "lucide-react";
import type { Curriculum, CurriculumLevel, CurriculumStatus } from "@/types/curriculum";
import { cn } from "@/lib/cn";
import { CURRICULUM_EVENT, LEVELS, STATUS, createCurriculum, fmtSize, listCurricula } from "@/lib/curriculum-store";

/** 📚 หน้ารวมหลักสูตร — เพิ่มหลักสูตรได้ไม่จำกัด แต่ละฉบับแยกข้อมูลกัน */
export function CurriculumHome() {
  const router = useRouter();
  const [list, setList] = useState<Curriculum[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => { const l = () => setList(listCurricula()); l(); window.addEventListener(CURRICULUM_EVENT, l); return () => window.removeEventListener(CURRICULUM_EVENT, l); }, []);

  return (
    <div className="container-page py-6 sm:py-10">
      <section className="rounded-3xl bg-gradient-to-br from-purple-100 via-cream to-mint-soft px-4 py-8 sm:px-6 sm:py-10">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-[13px] font-medium text-purple-700 shadow-soft">📚 ระบบจัดการหลักสูตร · Curriculum Management</p>
        <h1 className="mt-3 text-3xl sm:text-4xl">หลักสูตรของโรงเรียน</h1>
        <p className="mt-2 max-w-3xl text-[15px] text-ink-soft">เพิ่มหลักสูตรได้หลายฉบับ/หลายปี พร้อมไฟล์ PDF · เปิดอ่านในเว็บได้เลย · จัดโครงสร้าง มาตรฐาน → ตัวบ่งชี้ → สภาพที่พึงประสงค์ · ประสบการณ์สำคัญ · สาระที่ควรเรียนรู้ — แต่ละฉบับแยกข้อมูลกัน แผนที่สร้างไว้จะยังอ้างอิงฉบับเดิมเสมอ</p>
        <button type="button" onClick={() => setOpen(true)} className="tap mt-4 inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700"><Plus size={18} /> เพิ่มหลักสูตร</button>
      </section>

      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => {
          const s = STATUS[c.status]; const lv = LEVELS[c.level];
          const pdf = c.files.find((f) => f.mime === "application/pdf");
          const n = c.structure.standards.length;
          return (
            <Link key={c.id} href={`/curriculum/${c.id}`} className="card card-hover flex flex-col p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-purple-100 text-2xl">📕</span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[16px] leading-snug text-purple-800">{c.title}</p>
                  <p className="text-[12px] text-ink-soft">{lv.emoji} {lv.label} · พ.ศ. {c.year}</p>
                </div>
              </div>
              <span className={cn("mt-3 inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px]", s.cls)}>{s.emoji} {s.label}</span>
              {c.description && <p className="mt-2 line-clamp-2 text-[13px] text-ink-soft">{c.description}</p>}
              <p className="mt-2 text-[12px] text-ink-soft">{pdf ? <><FileText size={12} className="inline" /> {pdf.name} · {fmtSize(pdf.size)}</> : "ยังไม่ได้อัปโหลดไฟล์"} {n > 0 && `· 🧩 ${n} มาตรฐาน`}</p>
            </Link>
          );
        })}
        <button type="button" onClick={() => setOpen(true)} className="grid min-h-32 place-items-center rounded-2xl border-2 border-dashed border-purple-200 text-[14px] text-purple-700 hover:bg-purple-50"><span><Plus size={20} className="mx-auto" />เพิ่มหลักสูตรใหม่…</span></button>
      </div>

      {open && <AddDialog onClose={() => setOpen(false)} onCreated={(c) => router.push(`/curriculum/${c.id}`)} />}
    </div>
  );
}

function AddDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (c: Curriculum) => void }) {
  const [f, setF] = useState({ title: "", year: new Date().getFullYear() + 543, level: "early" as CurriculumLevel, status: "pending" as CurriculumStatus, description: "", announcedAt: "", note: "", addedBy: "ผู้ดูแล" });
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/40 p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onCreated(createCurriculum(f)); }} className="card w-full max-w-lg p-5">
        <h2 className="text-lg">📕 เพิ่มหลักสูตร</h2>
        <p className="text-[12px] text-ink-soft">กรอกข้อมูลแล้วอัปโหลดไฟล์ในหน้าถัดไป (PDF · Word · PowerPoint · รูปภาพ · เอกสารอื่น)</p>
        <div className="mt-3 grid gap-2 text-[13px] sm:grid-cols-2">
          <label className="sm:col-span-2">ชื่อหลักสูตร *<input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="เช่น หลักสูตรการศึกษาปฐมวัย พ.ศ. 2570" className="mt-1 w-full rounded-lg border border-line px-3 py-2 outline-none focus:border-purple-400" /></label>
          <label>ปี พ.ศ. *<input type="number" required min={2500} max={2700} value={f.year} onChange={(e) => setF({ ...f, year: +e.target.value })} className="mt-1 w-full rounded-lg border border-line px-3 py-2" /></label>
          <label>ระดับการศึกษา<select value={f.level} onChange={(e) => setF({ ...f, level: e.target.value as CurriculumLevel })} className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2">{(Object.keys(LEVELS) as CurriculumLevel[]).map((k) => <option key={k} value={k}>{LEVELS[k].emoji} {LEVELS[k].label}</option>)}</select></label>
          <label>สถานะ<select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as CurriculumStatus })} className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2">{(Object.keys(STATUS) as CurriculumStatus[]).map((k) => <option key={k} value={k}>{STATUS[k].emoji} {STATUS[k].label}</option>)}</select></label>
          <label>วันที่ประกาศ/เริ่มใช้<input value={f.announcedAt} onChange={(e) => setF({ ...f, announcedAt: e.target.value })} placeholder="เช่น 2560-08-03" className="mt-1 w-full rounded-lg border border-line px-3 py-2" /></label>
          <label className="sm:col-span-2">รายละเอียด/คำอธิบาย<textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} rows={2} className="mt-1 w-full rounded-lg border border-line px-3 py-2" /></label>
          <label className="sm:col-span-2">หมายเหตุ<input value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} className="mt-1 w-full rounded-lg border border-line px-3 py-2" /></label>
          <label className="sm:col-span-2">ผู้เพิ่ม<input value={f.addedBy} onChange={(e) => setF({ ...f, addedBy: e.target.value })} className="mt-1 w-full rounded-lg border border-line px-3 py-2" /></label>
        </div>
        <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-full px-3 py-1.5 text-[13px] text-ink-soft">ยกเลิก</button><button type="submit" className="rounded-full bg-purple-600 px-4 py-1.5 text-[13px] text-white">เพิ่มหลักสูตร</button></div>
      </form>
    </div>
  );
}
