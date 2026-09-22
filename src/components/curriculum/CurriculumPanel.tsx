"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, PanelRightOpen, Plus } from "lucide-react";
import type { Curriculum } from "@/types/curriculum";
import { cn } from "@/lib/cn";
import { CURRICULUM_EVENT, LEVELS, STATUS, getCurriculum, listCurricula, mainPdf, toggleBookmark } from "@/lib/curriculum-store";
import { getAsset } from "@/lib/studio-assets";
import { PdfReader } from "./PdfReader";

export type PickKind = "state" | "experience" | "content";
export interface PickedLine { kind: PickKind; text: string }

/**
 * 📚 แผง "หลักสูตร" ใน Garden Studio — เลือกฉบับที่ใช้ · เปิด PDF split view · เลือกมาตรฐาน/ตัวบ่งชี้/สภาพที่พึงประสงค์/ประสบการณ์สำคัญ/สาระที่ควรเรียนรู้ ใส่ลงแผน
 * ข้อความที่เลือกมาจากโครงสร้างของ "ฉบับที่เลือก" เท่านั้น และควรตรวจกับ PDF ต้นฉบับเสมอ
 */
export function CurriculumPanel({ curriculumId, onPickCurriculum, onInsert, onOpenSplit, splitOpen }: {
  curriculumId?: string;
  onPickCurriculum: (id: string | undefined) => void;
  onInsert: (lines: PickedLine[]) => void;
  onOpenSplit?: () => void;
  splitOpen?: boolean;
}) {
  const [list, setList] = useState<Curriculum[]>([]);
  const [sel, setSel] = useState<Record<string, PickedLine>>({});
  useEffect(() => { const l = () => setList(listCurricula()); l(); window.addEventListener(CURRICULUM_EVENT, l); return () => window.removeEventListener(CURRICULUM_EVENT, l); }, []);
  const c = curriculumId ? list.find((x) => x.id === curriculumId) : undefined;
  const toggle = (key: string, line: PickedLine) => setSel((s) => { const n = { ...s }; if (n[key]) delete n[key]; else n[key] = line; return n; });
  const picked = Object.values(sel);

  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto">
      <div>
        <p className="text-[13px] font-medium">📚 หลักสูตรที่ใช้</p>
        <select value={curriculumId ?? ""} onChange={(e) => onPickCurriculum(e.target.value || undefined)} className="mt-1 w-full rounded-xl border border-line bg-white px-2 py-2 text-[13px]">
          <option value="">— ยังไม่ระบุ —</option>
          {list.map((x) => <option key={x.id} value={x.id}>{STATUS[x.status].emoji} {x.title}</option>)}
        </select>
        <p className="mt-1 text-[11px] text-ink-soft">แผนนี้จะบันทึกว่าใช้หลักสูตรฉบับใด และจะไม่เปลี่ยนตามฉบับใหม่ที่เพิ่มภายหลัง</p>
        <Link href="/curriculum" className="mt-1 inline-flex items-center gap-1 text-[12px] text-purple-700 hover:underline"><Plus size={12} /> จัดการ/เพิ่มหลักสูตร</Link>
      </div>

      {!c ? <p className="rounded-xl bg-cream p-3 text-[13px] text-ink-soft">เลือกหลักสูตรก่อน แล้วจะเห็นมาตรฐาน ตัวบ่งชี้ สภาพที่พึงประสงค์ ประสบการณ์สำคัญ และสาระที่ควรเรียนรู้ของฉบับนั้น</p> : (
        <>
          <div className="rounded-xl bg-cream p-2 text-[12px]">
            <p>{LEVELS[c.level].emoji} {LEVELS[c.level].label} · พ.ศ. {c.year} · {STATUS[c.status].emoji} {STATUS[c.status].label}</p>
            {onOpenSplit && <button type="button" onClick={onOpenSplit} className={cn("tap mt-1.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px]", splitOpen ? "bg-purple-600 text-white" : "bg-white text-purple-700 ring-1 ring-line")}><PanelRightOpen size={13} /> {splitOpen ? "ปิดหน้าต่างอ่านหลักสูตร" : "เปิด PDF คู่กับแผน (Split View)"}</button>}
            {!mainPdf(c) && <p className="mt-1 text-ink-soft">ยังไม่มีไฟล์ PDF — อัปโหลดได้ที่หน้าหลักสูตร</p>}
          </div>

          <details open className="rounded-xl bg-white p-2 text-[13px] ring-1 ring-line">
            <summary className="cursor-pointer font-medium">📏 มาตรฐาน / ตัวบ่งชี้ / สภาพที่พึงประสงค์</summary>
            <div className="mt-1.5 space-y-1.5">
              {c.structure.standards.map((st) => (
                <details key={st.id} className="rounded-lg bg-cream p-1.5">
                  <summary className="cursor-pointer text-[12px]"><b>{st.code}</b> {st.title}</summary>
                  {st.indicators.map((ind) => (
                    <div key={ind.id} className="mt-1 pl-2">
                      <p className="text-[12px] font-medium">{ind.code} {ind.title}</p>
                      {ind.states.map((sta) => { const key = sta.id; const text = `${st.code} ${ind.code}\n${sta.code} ${sta.text}`; return (
                        <label key={key} className="flex items-start gap-1.5 rounded-md px-1 py-0.5 text-[12px] hover:bg-white">
                          <input type="checkbox" checked={!!sel[key]} onChange={() => toggle(key, { kind: "state", text })} className="mt-0.5" />
                          <span>{sta.code} {sta.text}{sta.age && <span className="text-ink-soft"> ({sta.age})</span>}</span>
                        </label>
                      ); })}
                    </div>
                  ))}
                </details>
              ))}
            </div>
          </details>

          <details className="rounded-xl bg-white p-2 text-[13px] ring-1 ring-line">
            <summary className="cursor-pointer font-medium">🌟 ประสบการณ์สำคัญ</summary>
            {c.structure.experiences.map((g) => (
              <div key={g.id} className="mt-1"><p className="text-[12px] font-medium">{g.domain}</p>
                {g.items.map((it) => <label key={it.id} className="flex items-start gap-1.5 rounded-md px-1 py-0.5 text-[12px] hover:bg-cream"><input type="checkbox" checked={!!sel[it.id]} onChange={() => toggle(it.id, { kind: "experience", text: `${g.domain}: ${it.text}` })} className="mt-0.5" /><span>{it.text}</span></label>)}
              </div>
            ))}
          </details>

          <details className="rounded-xl bg-white p-2 text-[13px] ring-1 ring-line">
            <summary className="cursor-pointer font-medium">📗 สาระที่ควรเรียนรู้</summary>
            {c.structure.contents.map((g) => (
              <div key={g.id} className="mt-1"><p className="text-[12px] font-medium">{g.title}</p>
                {g.items.map((it) => <label key={it.id} className="flex items-start gap-1.5 rounded-md px-1 py-0.5 text-[12px] hover:bg-cream"><input type="checkbox" checked={!!sel[it.id]} onChange={() => toggle(it.id, { kind: "content", text: `${g.title}: ${it.text}` })} className="mt-0.5" /><span>{it.text}</span></label>)}
              </div>
            ))}
          </details>

          <div className="sticky bottom-0 mt-auto bg-cream pt-2">
            <button type="button" disabled={picked.length === 0} onClick={() => { onInsert(picked); setSel({}); }} className="tap w-full rounded-full bg-purple-600 py-2 text-[13px] font-medium text-white disabled:opacity-40">⬇️ ใส่ลงแผน ({picked.length})</button>
            <p className="mt-1 text-[11px] text-ink-soft">💡 ตรวจข้อความกับ PDF ต้นฉบับเสมอ</p>
          </div>
        </>
      )}
    </div>
  );
}

/** หน้าต่างอ่าน PDF หลักสูตรคู่กับแผน */
export function CurriculumSplit({ curriculumId, onClose }: { curriculumId: string; onClose: () => void }) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [c, setC] = useState<Curriculum | undefined>();
  useEffect(() => { const l = () => setC(getCurriculum(curriculumId)); l(); window.addEventListener(CURRICULUM_EVENT, l); return () => window.removeEventListener(CURRICULUM_EVENT, l); }, [curriculumId]);
  const pdf = c ? mainPdf(c) : undefined;
  useEffect(() => { let dead = false; if (pdf) getAsset(pdf.assetId).then((a) => !dead && setBlob(a?.blob ?? null)); return () => { dead = true; }; }, [pdf?.assetId]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <aside className="no-print sticky top-[8.5rem] hidden h-[calc(100dvh-8.5rem)] w-[46%] max-w-[620px] shrink-0 flex-col border-l border-line bg-white lg:flex">
      <div className="flex items-center gap-2 border-b border-line bg-cream px-3 py-1.5 text-[13px]">
        <BookOpen size={14} className="text-purple-600" /><span className="min-w-0 flex-1 truncate">{c?.title ?? "หลักสูตร"}</span>
        <button type="button" onClick={onClose} className="rounded-full px-2 py-0.5 text-ink-soft hover:bg-white">ปิด</button>
      </div>
      {blob ? <PdfReader src={blob} compact bookmarks={c?.bookmarks ?? []} onToggleBookmark={(p) => toggleBookmark(curriculumId, p)} className="min-h-0 flex-1 rounded-none border-0" /> : <p className="p-6 text-center text-[13px] text-ink-soft">ยังไม่มีไฟล์ PDF ของหลักสูตรนี้ — อัปโหลดได้ที่ <Link href={`/curriculum/${curriculumId}`} className="text-purple-700 underline">หน้าหลักสูตร</Link></p>}
    </aside>
  );
}
