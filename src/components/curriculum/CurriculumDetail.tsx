"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Copy, Plus, Trash2, Upload } from "lucide-react";
import type { Curriculum, CurriculumStatus } from "@/types/curriculum";
import { cn } from "@/lib/cn";
import { CURRICULUM_EVENT, LEVELS, STATUS, addCurriculumFile, deleteCurriculum, duplicateStructure, fmtSize, getCurriculum, listCurricula, mainPdf, removeCurriculumFile, setStructure, toggleBookmark, updateCurriculum } from "@/lib/curriculum-store";
import { getAsset, fileEmoji } from "@/lib/studio-assets";
import { uid } from "@/lib/studio-store";
import { EmptyState } from "@/components/ui";
import { PdfReader } from "./PdfReader";

type Tab = "info" | "read" | "structure";

/** 📕 หน้าหลักสูตร 1 ฉบับ — ข้อมูล · เปิดอ่าน PDF · จัดโครงสร้าง */
export function CurriculumDetail({ id }: { id: string }) {
  const router = useRouter();
  const [c, setC] = useState<Curriculum | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>("info");
  const [blob, setBlob] = useState<Blob | null>(null);
  useEffect(() => { const l = () => setC(getCurriculum(id) ?? null); l(); window.addEventListener(CURRICULUM_EVENT, l); return () => window.removeEventListener(CURRICULUM_EVENT, l); }, [id]);
  const pdf = c ? mainPdf(c) : undefined;
  useEffect(() => { let dead = false; if (pdf) getAsset(pdf.assetId).then((a) => !dead && setBlob(a?.blob ?? null)); else setBlob(null); return () => { dead = true; }; }, [pdf?.assetId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (c === undefined) return <div className="container-page py-16 text-center text-ink-soft">กำลังเปิดหลักสูตร…</div>;
  if (c === null) return <div className="container-page py-16"><EmptyState emoji="📕" title="ไม่พบหลักสูตรนี้" hint="หลักสูตรเก็บในเบราว์เซอร์นี้ — เมื่อมีฐานข้อมูลกลางจะเปิดได้จากทุกเครื่อง" /><div className="mt-4 text-center"><Link href="/curriculum" className="text-purple-700 hover:underline">← กลับรายการหลักสูตร</Link></div></div>;
  const s = STATUS[c.status]; const lv = LEVELS[c.level];

  return (
    <div className="container-page py-5 sm:py-8">
      <Link href="/curriculum" className="text-[13px] text-purple-700 hover:underline">← หลักสูตรทั้งหมด</Link>
      <header className="mt-2 flex flex-wrap items-center gap-3">
        <span className="grid size-14 place-items-center rounded-2xl bg-purple-100 text-3xl">📕</span>
        <div className="min-w-0 flex-1"><h1 className="text-2xl leading-tight sm:text-3xl">{c.title}</h1><p className="text-[13px] text-ink-soft">{lv.emoji} {lv.label} · พ.ศ. {c.year} · เพิ่มโดย {c.addedBy} · {new Date(c.createdAt).toLocaleDateString("th-TH")}</p></div>
        <select value={c.status} onChange={(e) => updateCurriculum(c.id, { status: e.target.value as CurriculumStatus })} className={cn("h-8 rounded-full border-0 px-3 text-[13px]", s.cls)}>{(Object.keys(STATUS) as CurriculumStatus[]).map((k) => <option key={k} value={k}>{STATUS[k].emoji} {STATUS[k].label}</option>)}</select>
      </header>

      <nav className="no-scrollbar mt-4 flex gap-1 overflow-x-auto border-b border-line">
        {([["info", "📋 ข้อมูลหลักสูตร"], ["read", "📖 เปิดอ่านหลักสูตร"], ["structure", "🧩 โครงสร้างข้อมูล"]] as [Tab, string][]).map(([k, label]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={cn("tap shrink-0 border-b-2 px-3 py-2 text-[14px]", tab === k ? "border-purple-600 text-purple-800" : "border-transparent text-ink-soft hover:text-purple-700")}>{label}</button>
        ))}
      </nav>

      <div className="mt-4">
        {tab === "info" && <InfoTab c={c} onDeleted={() => router.push("/curriculum")} />}
        {tab === "read" && (blob ? <PdfReader src={blob} bookmarks={c.bookmarks} onToggleBookmark={(p) => toggleBookmark(c.id, p)} className="h-[78dvh]" /> : <div className="card p-8 text-center text-[14px] text-ink-soft">ยังไม่ได้อัปโหลดไฟล์ PDF ของหลักสูตรนี้ — ไปที่แท็บ 📋 ข้อมูลหลักสูตร แล้วอัปโหลดไฟล์หลัก</div>)}
        {tab === "structure" && <StructureTab c={c} />}
      </div>
    </div>
  );
}

function InfoTab({ c, onDeleted }: { c: Curriculum; onDeleted: () => void }) {
  const [busy, setBusy] = useState(false);
  const upload = async (files: FileList | null, kind: "main" | "attachment") => { if (!files?.length) return; setBusy(true); for (const f of Array.from(files)) await addCurriculumFile(c.id, f, kind); setBusy(false); };
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="card p-5">
        <h2 className="text-lg">📋 ข้อมูลหลักสูตร</h2>
        <dl className="mt-3 grid gap-y-3 text-[15px] sm:grid-cols-[150px_1fr]">
          <dt className="text-ink-soft">ชื่อหลักสูตร</dt><dd><input value={c.title} onChange={(e) => updateCurriculum(c.id, { title: e.target.value })} className="w-full rounded-lg border border-line px-2 py-1" /></dd>
          <dt className="text-ink-soft">ปี พ.ศ.</dt><dd><input type="number" value={c.year} onChange={(e) => updateCurriculum(c.id, { year: +e.target.value })} className="w-32 rounded-lg border border-line px-2 py-1" /></dd>
          <dt className="text-ink-soft">ระดับการศึกษา</dt><dd>{LEVELS[c.level].emoji} {LEVELS[c.level].label}</dd>
          <dt className="text-ink-soft">วันที่ประกาศ/เริ่มใช้</dt><dd><input value={c.announcedAt ?? ""} onChange={(e) => updateCurriculum(c.id, { announcedAt: e.target.value })} placeholder="—" className="w-40 rounded-lg border border-line px-2 py-1" /></dd>
          <dt className="text-ink-soft">รายละเอียด</dt><dd><textarea value={c.description ?? ""} onChange={(e) => updateCurriculum(c.id, { description: e.target.value })} rows={3} className="w-full rounded-lg border border-line px-2 py-1" /></dd>
          <dt className="text-ink-soft">หมายเหตุ</dt><dd><input value={c.note ?? ""} onChange={(e) => updateCurriculum(c.id, { note: e.target.value })} className="w-full rounded-lg border border-line px-2 py-1" /></dd>
        </dl>
        <button type="button" onClick={async () => { if (confirm(`ลบหลักสูตร “${c.title}” และไฟล์ทั้งหมด?`)) { await deleteCurriculum(c.id); onDeleted(); } }} className="mt-4 rounded-full px-3 py-1.5 text-[13px] text-red-500 hover:bg-red-50">ลบหลักสูตรนี้</button>
      </div>
      <div className="card h-fit p-5">
        <h2 className="text-lg">📄 ไฟล์หลักสูตร</h2>
        <label className="mt-2 block cursor-pointer rounded-2xl border-2 border-dashed border-purple-200 bg-cream p-4 text-center text-[13px] hover:bg-purple-50"><Upload size={18} className="mx-auto text-purple-600" />อัปโหลดไฟล์หลัก (PDF)<input type="file" accept="application/pdf" className="hidden" onChange={(e) => upload(e.target.files, "main")} /></label>
        <label className="mt-2 block cursor-pointer rounded-xl border border-line bg-white px-3 py-2 text-center text-[13px] hover:bg-purple-50">+ เอกสารประกอบ (Word · PPT · รูป · อื่น ๆ)<input type="file" multiple className="hidden" onChange={(e) => upload(e.target.files, "attachment")} /></label>
        {busy && <p className="mt-2 text-[12px] text-purple-700">กำลังอัปโหลด…</p>}
        <ul className="mt-3 space-y-1.5 text-[13px]">
          {c.files.length === 0 && <li className="text-ink-soft">ยังไม่มีไฟล์</li>}
          {c.files.map((f) => (
            <li key={f.id} className="flex items-center gap-2 rounded-xl bg-cream px-2 py-1.5">
              <span>{fileEmoji(f.mime, f.name)}</span>
              <span className="min-w-0 flex-1 truncate">{f.name}<span className="text-ink-soft"> · {fmtSize(f.size)}{f.kind === "main" ? " · ไฟล์หลัก" : ""}</span></span>
              <button type="button" onClick={() => removeCurriculumFile(c.id, f.id)} className="text-ink-soft hover:text-red-500"><Trash2 size={13} /></button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- 🧩 โครงสร้างข้อมูลหลักสูตร (แก้ไขได้) ---------- */
function StructureTab({ c }: { c: Curriculum }) {
  const S = c.structure;
  const save = (p: Partial<Curriculum["structure"]>) => setStructure(c.id, { ...S, ...p });
  const others = listCurricula().filter((x) => x.id !== c.id && x.structure.standards.length > 0);
  return (
    <div className="space-y-5">
      <div className="card flex flex-wrap items-center gap-2 p-3 text-[13px]">
        <span className="text-ink-soft">ข้อมูลชุดนี้เป็นของหลักสูตร <b className="text-ink">{c.title}</b> เท่านั้น — แก้ที่นี่ไม่กระทบฉบับอื่น และแผนที่สร้างไว้แล้วยังอ้างอิงฉบับเดิม</span>
        {others.length > 0 && (
          <select onChange={(e) => { if (e.target.value && confirm("คัดลอกโครงสร้างจากฉบับนั้นมาทับฉบับนี้?")) duplicateStructure(e.target.value, c.id); e.target.value = ""; }} className="ml-auto rounded-lg border border-line bg-white px-2 py-1"><option value="">📋 คัดลอกโครงสร้างจากฉบับอื่น…</option>{others.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}</select>
        )}
      </div>

      {/* มาตรฐาน */}
      <section className="card p-4">
        <div className="flex items-center gap-2"><h2 className="text-lg">📏 มาตรฐาน → ตัวบ่งชี้ → สภาพที่พึงประสงค์</h2><span className="text-[13px] text-ink-soft">({S.standards.length} มาตรฐาน)</span>
          <button type="button" onClick={() => save({ standards: [...S.standards, { id: uid(), code: `มฐ ${S.standards.length + 1}`, title: "", indicators: [] }] })} className="ml-auto tap rounded-full bg-purple-600 px-3 py-1 text-[13px] text-white"><Plus size={13} className="inline" /> มาตรฐาน</button>
        </div>
        <div className="mt-3 space-y-2">
          {S.standards.map((st, i) => (
            <details key={st.id} className="rounded-xl bg-cream p-2">
              <summary className="cursor-pointer text-[14px]"><b>{st.code}</b> {st.title || "(ยังไม่มีชื่อ)"} <span className="text-[12px] text-ink-soft">· {st.indicators.length} ตัวบ่งชี้</span></summary>
              <div className="mt-2 flex flex-wrap gap-2 text-[13px]">
                <input value={st.code} onChange={(e) => save({ standards: S.standards.map((x, j) => (j === i ? { ...x, code: e.target.value } : x)) })} className="w-24 rounded-lg border border-line px-2 py-1" placeholder="มฐ 1" />
                <input value={st.title} onChange={(e) => save({ standards: S.standards.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} className="min-w-0 flex-1 rounded-lg border border-line px-2 py-1" placeholder="ชื่อมาตรฐาน" />
                <button type="button" onClick={() => save({ standards: S.standards.map((x, j) => (j === i ? { ...x, indicators: [...x.indicators, { id: uid(), code: `ตบช ${i + 1}.${x.indicators.length + 1}`, title: "", states: [] }] } : x)) })} className="rounded-full bg-white px-2.5 py-1 ring-1 ring-line">+ ตัวบ่งชี้</button>
                <button type="button" onClick={() => confirm("ลบมาตรฐานนี้?") && save({ standards: S.standards.filter((_, j) => j !== i) })} className="rounded-full px-2 py-1 text-red-500"><Trash2 size={13} /></button>
              </div>
              <div className="mt-2 space-y-2 pl-3">
                {st.indicators.map((ind, k) => (
                  <div key={ind.id} className="rounded-lg bg-white p-2">
                    <div className="flex flex-wrap gap-2 text-[13px]">
                      <input value={ind.code} onChange={(e) => save({ standards: S.standards.map((x, j) => (j === i ? { ...x, indicators: x.indicators.map((y, m) => (m === k ? { ...y, code: e.target.value } : y)) } : x)) })} className="w-24 rounded-lg border border-line px-2 py-1" />
                      <input value={ind.title} onChange={(e) => save({ standards: S.standards.map((x, j) => (j === i ? { ...x, indicators: x.indicators.map((y, m) => (m === k ? { ...y, title: e.target.value } : y)) } : x)) })} className="min-w-0 flex-1 rounded-lg border border-line px-2 py-1" placeholder="ชื่อตัวบ่งชี้" />
                      <button type="button" onClick={() => save({ standards: S.standards.map((x, j) => (j === i ? { ...x, indicators: x.indicators.map((y, m) => (m === k ? { ...y, states: [...y.states, { id: uid(), code: "", text: "" }] } : y)) } : x)) })} className="rounded-full bg-cream px-2.5 py-1">+ สภาพที่พึงประสงค์</button>
                      <button type="button" onClick={() => save({ standards: S.standards.map((x, j) => (j === i ? { ...x, indicators: x.indicators.filter((_, m) => m !== k) } : x)) })} className="rounded-full px-2 py-1 text-red-500"><Trash2 size={12} /></button>
                    </div>
                    <ul className="mt-1.5 space-y-1 pl-3">
                      {ind.states.map((sta, n) => (
                        <li key={sta.id} className="flex flex-wrap gap-1.5 text-[13px]">
                          <input value={sta.code} onChange={(e) => save({ standards: S.standards.map((x, j) => (j === i ? { ...x, indicators: x.indicators.map((y, m) => (m === k ? { ...y, states: y.states.map((z, o) => (o === n ? { ...z, code: e.target.value } : z)) } : y)) } : x)) })} className="w-20 rounded-lg border border-line px-2 py-0.5" placeholder="1.1.1" />
                          <input value={sta.text} onChange={(e) => save({ standards: S.standards.map((x, j) => (j === i ? { ...x, indicators: x.indicators.map((y, m) => (m === k ? { ...y, states: y.states.map((z, o) => (o === n ? { ...z, text: e.target.value } : z)) } : y)) } : x)) })} className="min-w-0 flex-1 rounded-lg border border-line px-2 py-0.5" placeholder="ข้อความสภาพที่พึงประสงค์" />
                          <input value={sta.age ?? ""} onChange={(e) => save({ standards: S.standards.map((x, j) => (j === i ? { ...x, indicators: x.indicators.map((y, m) => (m === k ? { ...y, states: y.states.map((z, o) => (o === n ? { ...z, age: e.target.value } : z)) } : y)) } : x)) })} className="w-20 rounded-lg border border-line px-2 py-0.5" placeholder="อายุ" />
                          <button type="button" onClick={() => save({ standards: S.standards.map((x, j) => (j === i ? { ...x, indicators: x.indicators.map((y, m) => (m === k ? { ...y, states: y.states.filter((_, o) => o !== n) } : y)) } : x)) })} className="text-red-400"><Trash2 size={11} /></button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>

      <ListSection title="🌟 ประสบการณ์สำคัญ" groups={S.experiences.map((g) => ({ id: g.id, name: g.domain, items: g.items }))}
        onAddGroup={() => save({ experiences: [...S.experiences, { id: uid(), domain: "ด้านใหม่", items: [] }] })}
        onRename={(gi, v) => save({ experiences: S.experiences.map((g, j) => (j === gi ? { ...g, domain: v } : g)) })}
        onDelGroup={(gi) => save({ experiences: S.experiences.filter((_, j) => j !== gi) })}
        onAddItem={(gi) => save({ experiences: S.experiences.map((g, j) => (j === gi ? { ...g, items: [...g.items, { id: uid(), text: "" }] } : g)) })}
        onEditItem={(gi, ii, v) => save({ experiences: S.experiences.map((g, j) => (j === gi ? { ...g, items: g.items.map((it, m) => (m === ii ? { ...it, text: v } : it)) } : g)) })}
        onDelItem={(gi, ii) => save({ experiences: S.experiences.map((g, j) => (j === gi ? { ...g, items: g.items.filter((_, m) => m !== ii) } : g)) })} />

      <ListSection title="📗 สาระที่ควรเรียนรู้" groups={S.contents.map((g) => ({ id: g.id, name: g.title, items: g.items }))}
        onAddGroup={() => save({ contents: [...S.contents, { id: uid(), title: "สาระใหม่", items: [] }] })}
        onRename={(gi, v) => save({ contents: S.contents.map((g, j) => (j === gi ? { ...g, title: v } : g)) })}
        onDelGroup={(gi) => save({ contents: S.contents.filter((_, j) => j !== gi) })}
        onAddItem={(gi) => save({ contents: S.contents.map((g, j) => (j === gi ? { ...g, items: [...g.items, { id: uid(), text: "" }] } : g)) })}
        onEditItem={(gi, ii, v) => save({ contents: S.contents.map((g, j) => (j === gi ? { ...g, items: g.items.map((it, m) => (m === ii ? { ...it, text: v } : it)) } : g)) })}
        onDelItem={(gi, ii) => save({ contents: S.contents.map((g, j) => (j === gi ? { ...g, items: g.items.filter((_, m) => m !== ii) } : g)) })} />
    </div>
  );
}

function ListSection({ title, groups, onAddGroup, onRename, onDelGroup, onAddItem, onEditItem, onDelItem }: { title: string; groups: { id: string; name: string; items: { id: string; text: string }[] }[]; onAddGroup: () => void; onRename: (gi: number, v: string) => void; onDelGroup: (gi: number) => void; onAddItem: (gi: number) => void; onEditItem: (gi: number, ii: number, v: string) => void; onDelItem: (gi: number, ii: number) => void }) {
  return (
    <section className="card p-4">
      <div className="flex items-center gap-2"><h2 className="text-lg">{title}</h2><button type="button" onClick={onAddGroup} className="ml-auto tap rounded-full bg-purple-600 px-3 py-1 text-[13px] text-white"><Plus size={13} className="inline" /> เพิ่มกลุ่ม</button></div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {groups.map((g, gi) => (
          <div key={g.id} className="rounded-xl bg-cream p-2">
            <div className="flex gap-1.5"><input value={g.name} onChange={(e) => onRename(gi, e.target.value)} className="min-w-0 flex-1 rounded-lg border border-line px-2 py-1 text-[14px] font-medium" /><button type="button" onClick={() => confirm("ลบกลุ่มนี้?") && onDelGroup(gi)} className="px-1 text-red-500"><Trash2 size={13} /></button></div>
            <ul className="mt-1.5 space-y-1">
              {g.items.map((it, ii) => <li key={it.id} className="flex gap-1.5"><input value={it.text} onChange={(e) => onEditItem(gi, ii, e.target.value)} className="min-w-0 flex-1 rounded-lg border border-line px-2 py-0.5 text-[13px]" /><button type="button" onClick={() => onDelItem(gi, ii)} className="text-red-400"><Trash2 size={11} /></button></li>)}
            </ul>
            <button type="button" onClick={() => onAddItem(gi)} className="mt-1.5 rounded-full bg-white px-2.5 py-0.5 text-[12px] ring-1 ring-line">+ เพิ่มข้อ</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export { Copy };
