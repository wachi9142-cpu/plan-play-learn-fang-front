"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { DEV_EVENT, DOMAINS, LEVELS, addDev, devChildren, listDev, removeDev, summary, updateDev, type Domain, type Level } from "@/lib/development-store";
import { CLASS_EVENT, getClassMe, listMembers, listRooms, type ClassMe } from "@/lib/classroom-store";
import { activeCurricula } from "@/lib/curriculum-store";
import { Avatar } from "@/components/profile/Avatar";
import { WhoAmI } from "@/components/classroom/WhoAmI";

/** 📈 ติดตามพัฒนาการ 4 ด้าน — ครูบันทึก · ผู้ปกครองเห็นเฉพาะบุตรหลาน */
export function DevelopmentPage() {
  const [me, setMe] = useState<ClassMe | null | undefined>(undefined);
  const [tick, setTick] = useState(0);
  const [child, setChild] = useState("");
  const [add, setAdd] = useState(false);
  useEffect(() => { setMe(getClassMe()); const l = () => setTick((t) => t + 1); window.addEventListener(DEV_EVENT, l); window.addEventListener(CLASS_EVENT, l); return () => { window.removeEventListener(DEV_EVENT, l); window.removeEventListener(CLASS_EVENT, l); }; }, []);
  const isTeacher = me?.role === "teacher";
  const [allChildren, setAllChildren] = useState<string[]>([]);
  useEffect(() => { const kids = listRooms().flatMap((r) => listMembers(r.id).filter((m) => m.role === "child").map((m) => m.name)); setAllChildren(Array.from(new Set([...kids, ...devChildren()]))); }, [tick]);
  const mine = me?.role === "parent" ? me.childName : me?.role === "child" ? me.name : undefined;
  const children = isTeacher ? allChildren : mine ? [mine] : [];
  const selected = child || children[0] || "";
  const [records, setRecords] = useState<ReturnType<typeof listDev>>([]);
  useEffect(() => { setRecords(listDev().filter((r) => r.childName === selected)); }, [selected, tick]);

  const [sums, setSums] = useState<ReturnType<typeof summary>>([]);
  useEffect(() => { if (selected) setSums(summary(selected)); }, [selected, tick, records.length]);

  if (me === undefined) return null;
  if (!me) return <div className="container-page py-8"><WhoAmI onDone={setMe} /></div>;

  return (
    <div className="container-page py-6 sm:py-10">
      <section className="rounded-3xl bg-gradient-to-br from-sky-soft via-cream to-mint-soft px-4 py-8 sm:px-6">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-[13px] font-medium text-purple-700 shadow-soft">📈 ติดตามพัฒนาการ</p>
        <h1 className="mt-3 text-3xl sm:text-4xl">พัฒนาการ 4 ด้าน</h1>
        <p className="mt-2 max-w-3xl text-[15px] text-ink-soft">💪 ร่างกาย · 💛 อารมณ์ จิตใจ · 🤝 สังคม · 🧠 สติปัญญา — บันทึกจากการสังเกตในกิจกรรมจริง เชื่อมกับสภาพที่พึงประสงค์ในหลักสูตร {isTeacher ? "" : "· ผู้ปกครองเห็นเฉพาะบุตรหลานของตน"}</p>
      </section>

      {children.length === 0 ? (
        <div className="card mt-5 p-10 text-center text-[14px] text-ink-soft">ยังไม่มีรายชื่อเด็ก — ครูเพิ่มนักเรียนได้ที่ <Link href="/online-classroom" className="text-purple-700 underline">ห้องเรียนออนไลน์ → 👥 สมาชิก</Link></div>
      ) : (
        <>
          <div className="card mt-5 flex flex-wrap items-center gap-2 p-3">
            <span className="text-[13px] text-ink-soft">🧒 เด็ก:</span>
            <select value={selected} onChange={(e) => setChild(e.target.value)} disabled={!isTeacher} className="rounded-lg border border-line bg-white px-2 py-1 text-[14px] disabled:opacity-70">{children.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            {isTeacher && <button type="button" onClick={() => setAdd(true)} className="tap ml-auto inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-4 py-1.5 text-[13px] text-white"><Plus size={14} /> บันทึกพัฒนาการ</button>}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {sums.map(({ domain, count, latest }) => (
              <div key={domain.id} className={cn("card p-4", domain.tint)}>
                <p className="text-3xl">{domain.emoji}</p>
                <p className="font-display text-[16px] text-purple-800">{domain.label}</p>
                <p className="text-[12px] text-ink-soft">{domain.hint}</p>
                <p className="mt-2 text-[13px]">📝 {count} บันทึก</p>
                {latest && <p className={cn("mt-1 w-fit rounded-full px-2 py-0.5 text-[12px]", LEVELS[latest.level].cls)}>{LEVELS[latest.level].emoji} {LEVELS[latest.level].label}</p>}
              </div>
            ))}
          </div>

          <section className="mt-6">
            <h2 className="text-lg">🗒️ บันทึกล่าสุดของ {selected} <span className="text-[13px] font-normal text-ink-soft">({records.length})</span></h2>
            {records.length === 0 ? <p className="card mt-2 p-6 text-center text-[14px] text-ink-soft">ยังไม่มีบันทึก</p> : (
              <ul className="mt-2 space-y-2">
                {records.map((r) => { const d = DOMAINS.find((x) => x.id === r.domain)!; return (
                  <li key={r.id} className="card flex flex-wrap items-start gap-2 p-3 text-[14px]">
                    <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl text-xl", d.tint)}>{d.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-ink-soft">{new Date(r.date).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })} · {d.label} · โดย {r.by}</p>
                      <p>{r.note}</p>
                      {r.indicator && <p className="mt-0.5 text-[12px] text-purple-700">📏 {r.indicator}</p>}
                    </div>
                    {isTeacher ? (
                      <select value={r.level} onChange={(e) => updateDev(r.id, { level: e.target.value as Level })} className={cn("rounded-full border-0 px-2 py-1 text-[12px]", LEVELS[r.level].cls)}>{(Object.keys(LEVELS) as Level[]).map((k) => <option key={k} value={k}>{LEVELS[k].emoji} {LEVELS[k].label}</option>)}</select>
                    ) : <span className={cn("rounded-full px-2 py-1 text-[12px]", LEVELS[r.level].cls)}>{LEVELS[r.level].emoji} {LEVELS[r.level].label}</span>}
                    {isTeacher && <button type="button" onClick={() => { if (confirm("ลบบันทึกนี้?")) removeDev(r.id); }} className="text-ink-soft hover:text-red-500"><Trash2 size={13} /></button>}
                  </li>
                ); })}
              </ul>
            )}
          </section>
        </>
      )}

      {add && isTeacher && <AddDialog child={selected} by={me.name} onClose={() => setAdd(false)} />}
    </div>
  );
}

function AddDialog({ child, by, onClose }: { child: string; by: string; onClose: () => void }) {
  const [f, setF] = useState({ domain: "physical" as Domain, note: "", level: "progress" as Level, indicator: "", curriculumId: "" });
  const [curs, setCurs] = useState<ReturnType<typeof activeCurricula>>([]);
  useEffect(() => { const cs = activeCurricula(); setCurs(cs); setF((x) => ({ ...x, curriculumId: x.curriculumId || (cs[0]?.id ?? "") })); }, []);
  const cur = curs.find((c) => c.id === f.curriculumId);
  const states = cur ? cur.structure.standards.flatMap((s) => s.indicators.flatMap((i) => i.states.map((st) => `${s.code} ${i.code} · ${st.code} ${st.text}`))) : [];
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/40 p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); if (!f.note.trim()) return; addDev({ childName: child, by, domain: f.domain, note: f.note.trim(), level: f.level, indicator: f.indicator || undefined, curriculumId: f.curriculumId || undefined }); onClose(); }} className="card w-full max-w-lg p-5">
        <h2 className="text-lg">📈 บันทึกพัฒนาการ — {child}</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">{DOMAINS.map((d) => <button key={d.id} type="button" onClick={() => setF({ ...f, domain: d.id })} className={cn("rounded-xl border-2 p-2 text-left text-[13px]", f.domain === d.id ? "border-purple-400 bg-purple-50" : "border-line")}><span className="text-xl">{d.emoji}</span> {d.label}</button>)}</div>
        <label className="mt-3 block text-[13px]">สิ่งที่สังเกตเห็น *<textarea autoFocus required value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} rows={3} placeholder="เช่น กระโดดสองขาขึ้นลงอยู่กับที่ได้ 5 ครั้งติดต่อกันในกิจกรรมกลางแจ้ง" className="mt-1 w-full rounded-xl border border-line px-3 py-2 outline-none focus:border-purple-400" /></label>
        <label className="mt-2 block text-[13px]">ระดับพัฒนาการ<div className="mt-1 flex gap-2">{(Object.keys(LEVELS) as Level[]).map((k) => <button key={k} type="button" onClick={() => setF({ ...f, level: k })} className={cn("flex-1 rounded-full px-3 py-1.5 text-[13px] ring-1 ring-line", f.level === k ? LEVELS[k].cls : "bg-white")}>{LEVELS[k].emoji} {LEVELS[k].label}</button>)}</div></label>
        {states.length > 0 && <label className="mt-2 block text-[13px]">เชื่อมกับหลักสูตร ({cur?.title})<select value={f.indicator} onChange={(e) => setF({ ...f, indicator: e.target.value })} className="mt-1 w-full rounded-xl border border-line bg-white px-2 py-2 text-[13px]"><option value="">— ไม่ระบุ —</option>{states.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>}
        <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-full px-3 py-1.5 text-[13px] text-ink-soft">ยกเลิก</button><button type="submit" className="rounded-full bg-purple-600 px-4 py-1.5 text-[13px] text-white">บันทึก</button></div>
      </form>
    </div>
  );
}
