"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Save, Trash2 } from "lucide-react";
import type { ClassMember, ClassRoom } from "@/types/classroom";
import type { LunchWeek } from "@/types/care";
import { CLASS_EVENT, listMembers, listRooms } from "@/lib/classroom-store";
import { CARE_EVENT, DAY_NAMES, allergyOf, listWeeks, removeWeek, saveAllergy, saveWeek, todayISO } from "@/lib/care-store";
import { PageHeader, Tag } from "@/components/ui";
import { BackButton } from "@/components/ui/BackButton";
import { cn } from "@/lib/cn";

const emptyWeek = (): Omit<LunchWeek, "updatedAt" | "id"> => ({
  label: "เมนูสัปดาห์ใหม่",
  startDate: todayISO(),
  days: [1, 2, 3, 4, 5].map((day) => ({ day })),
});

/** 🍚 เมนูอาหารประจำสัปดาห์ + ของแพ้ — ฝั่งครู */
export function LunchTeacher() {
  const [weeks, setWeeks] = useState<LunchWeek[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<ClassRoom[]>([]);
  const [v, setV] = useState(0);

  useEffect(() => {
    const sync = () => { setWeeks(listWeeks()); setRooms(listRooms()); setV((n) => n + 1); };
    sync();
    window.addEventListener(CARE_EVENT, sync);
    window.addEventListener(CLASS_EVENT, sync);
    return () => { window.removeEventListener(CARE_EVENT, sync); window.removeEventListener(CLASS_EVENT, sync); };
  }, []);

  const add = () => { const w = saveWeek(emptyWeek()); setOpenId(w.id); };

  return (
    <div className="container-page py-8 sm:py-12">
      <BackButton fallback="/teacher" label="ห้องครู" />
      <PageHeader
        emoji="🍚"
        title="เมนูอาหารและของแพ้"
        description="ใส่เมนูทีเดียวทั้งสัปดาห์ · ผู้ปกครองเปิดดูได้ที่หน้าเมนูอาหาร"
      >
        <div className="flex flex-wrap gap-2">
          <Tag tone="purple">📅 {weeks.length} สัปดาห์</Tag>
          <Link href="/lunch" className="tap rounded-full bg-cream-dark px-3 py-0.5 text-[13px] font-medium leading-6 text-purple-700 hover:brightness-95">
            👀 ดูหน้าที่ผู้ปกครองเห็น
          </Link>
        </div>
      </PageHeader>

      <button type="button" onClick={add}
        className="tap mb-5 inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-5 py-2.5 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700">
        <Plus size={16} /> เพิ่มเมนูสัปดาห์ใหม่
      </button>

      <div className="mb-10 grid gap-3">
        {weeks.map((w) => <WeekRow key={w.id} week={w} open={openId === w.id} onToggle={() => setOpenId(openId === w.id ? null : w.id)} />)}
        {weeks.length === 0 && (
          <p className="card p-6 text-center text-[15px] text-ink-soft">ยังไม่มีเมนู — กด “เพิ่มเมนูสัปดาห์ใหม่” เพื่อเริ่มได้เลยค่ะ</p>
        )}
      </div>

      {/* ของแพ้ */}
      <section>
        <h2 className="mb-1 text-2xl sm:text-3xl">⚠️ ของแพ้ของเด็กแต่ละคน</h2>
        <p className="mb-4 text-[14px] text-ink-soft">
          ใส่ไว้แล้วจะขึ้นเตือนในสมุดสื่อสารประจำวันและในหน้าเมนูอาหารอัตโนมัติ
        </p>
        {rooms.length === 0 ? (
          <p className="card p-6 text-center text-[15px] text-ink-soft">
            ยังไม่มีห้องเรียน — สร้างห้องและเพิ่มรายชื่อเด็กก่อนที่{" "}
            <Link href="/online-classroom" className="font-medium text-purple-700 hover:underline">ห้องเรียนออนไลน์</Link>
          </p>
        ) : (
          <div className="grid gap-5">
            {rooms.map((r) => {
              const kids = listMembers(r.id).filter((m) => m.role === "child");
              if (kids.length === 0) return null;
              return (
                <div key={r.id}>
                  <p className="mb-2 font-display text-[16px] text-purple-800">{r.emoji} {r.nickname} <span className="text-[13px] font-normal text-ink-soft">({r.code})</span></p>
                  <div className="grid gap-2">
                    {kids.map((k) => <AllergyRow key={k.id} child={k} roomId={r.id} v={v} />)}
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

function WeekRow({ week, open, onToggle }: { week: LunchWeek; open: boolean; onToggle: () => void }) {
  const [d, setD] = useState(week);
  const [flash, setFlash] = useState(false);
  useEffect(() => setD(week), [week]);

  const setDay = (day: number, field: "snackAm" | "lunch" | "snackPm", value: string) =>
    setD((x) => ({ ...x, days: x.days.map((dd) => (dd.day === day ? { ...dd, [field]: value } : dd)) }));

  const filled = week.days.filter((dd) => dd.lunch).length;

  return (
    <article className="card overflow-hidden p-0">
      <button type="button" onClick={onToggle} className="tap flex w-full items-center gap-3 p-4 text-left">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-yellow-soft text-xl">🍚</span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[16px] text-purple-800">{week.label}</span>
          <span className="text-[13px] text-ink-soft">
            {week.startDate ? `เริ่มวันจันทร์ที่ ${week.startDate}` : "ยังไม่ได้ใส่วันที่"} · ใส่เมนูแล้ว {filled}/5 วัน
          </span>
        </span>
        <span className="shrink-0 text-[13px] font-medium text-purple-600">{open ? "ปิด" : "แก้ไข"}</span>
      </button>

      {open && (
        <div className="border-t border-line p-4">
          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[13px] text-ink-soft">ชื่อสัปดาห์</span>
              <input value={d.label} onChange={(e) => setD({ ...d, label: e.target.value })}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-purple-400" />
            </label>
            <label className="block">
              <span className="mb-1 block text-[13px] text-ink-soft">วันจันทร์ของสัปดาห์นี้</span>
              <input type="date" value={d.startDate ?? ""} onChange={(e) => setD({ ...d, startDate: e.target.value })}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-purple-400" />
            </label>
          </div>

          <div className="grid gap-2">
            {d.days.map((dd) => (
              <div key={dd.day} className="rounded-2xl bg-cream px-3 py-2.5">
                <p className="mb-1.5 font-display text-[15px] text-purple-800">{DAY_NAMES[dd.day]}</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {([["snackAm", "🍎 ว่างเช้า"], ["lunch", "🍚 กลางวัน"], ["snackPm", "🥛 ว่างบ่าย"]] as const).map(([f, label]) => (
                    <label key={f} className="block">
                      <span className="mb-0.5 block text-[12px] text-ink-soft">{label}</span>
                      <input value={dd[f] ?? ""} onChange={(e) => setDay(dd.day, f, e.target.value)}
                        placeholder="—"
                        className="w-full rounded-xl border border-line bg-white px-3 py-1.5 text-[14px] text-ink outline-none focus:border-purple-400" />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <label className="mt-3 block">
            <span className="mb-1 block text-[13px] text-ink-soft">หมายเหตุถึงผู้ปกครอง (ไม่ใส่ก็ได้)</span>
            <input value={d.note ?? ""} onChange={(e) => setD({ ...d, note: e.target.value })}
              placeholder="เช่น สัปดาห์นี้มีผลไม้ตามฤดูกาลทุกวัน"
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-purple-400" />
          </label>

          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => { saveWeek(d); setFlash(true); setTimeout(() => setFlash(false), 1400); }}
              className={cn("tap inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-[14px] font-medium text-white shadow-soft transition",
                flash ? "bg-[#1f6b4d]" : "bg-purple-600 hover:bg-purple-700")}>
              <Save size={15} /> {flash ? "บันทึกแล้ว" : "บันทึกสัปดาห์นี้"}
            </button>
            <button type="button" onClick={() => { if (confirm(`ลบ “${week.label}”?`)) removeWeek(week.id); }}
              className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-5 py-2 text-[14px] font-medium text-[#a8456c] hover:brightness-95">
              <Trash2 size={15} /> ลบ
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function AllergyRow({ child, roomId, v }: { child: ClassMember; roomId: string; v: number }) {
  const saved = useMemo(() => allergyOf(child.id), [child.id, v]);
  const [text, setText] = useState("");
  const [severe, setSevere] = useState(false);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    setText((saved?.items ?? []).join(", "));
    setSevere(saved?.severity === "severe");
  }, [saved]);

  const save = () => {
    saveAllergy({
      childId: child.id, roomId, childName: child.name,
      items: text.split(",").map((t) => t.trim()).filter(Boolean),
      severity: severe ? "severe" : "mild",
    });
    setEdit(false);
  };

  const items = saved?.items ?? [];

  return (
    <div className="card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-[15px] text-purple-800">{child.name}</span>
        {items.length > 0 ? (
          <span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-medium",
            saved?.severity === "severe" ? "bg-pink-soft text-[#a8456c]" : "bg-yellow-soft text-[#8a6a00]")}>
            {saved?.severity === "severe" ? "🚨 แพ้รุนแรง" : "⚠️ แพ้"} {items.join(" · ")}
          </span>
        ) : (
          <span className="text-[13px] text-ink-soft">ไม่มีข้อมูลของแพ้</span>
        )}
        <button type="button" onClick={() => setEdit((e) => !e)}
          className="tap ml-auto rounded-lg px-2 py-1 text-[13px] font-medium text-purple-700 hover:bg-cream">
          {edit ? "ปิด" : "แก้ไข"}
        </button>
      </div>

      {edit && (
        <div className="mt-2 border-t border-line pt-2">
          <label className="block">
            <span className="mb-1 block text-[12px] text-ink-soft">แพ้อะไรบ้าง (คั่นด้วยลูกน้ำ)</span>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="เช่น ไข่, นมวัว, ถั่ว"
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-purple-400" />
          </label>
          <label className="mt-2 flex items-center gap-2 text-[14px] text-ink">
            <input type="checkbox" checked={severe} onChange={(e) => setSevere(e.target.checked)} className="size-4 accent-purple-600" />
            🚨 แพ้รุนแรง (ต้องระวังเป็นพิเศษ)
          </label>
          <button type="button" onClick={save}
            className="tap mt-2 inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-4 py-1.5 text-[13px] font-medium text-white shadow-soft hover:bg-purple-700">
            <Save size={14} /> บันทึก
          </button>
        </div>
      )}
    </div>
  );
}
