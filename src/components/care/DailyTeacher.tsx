"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Download, Save, Upload } from "lucide-react";
import type { ClassMember, ClassRoom } from "@/types/classroom";
import type { DailyReport, MealAmount, MoodId } from "@/types/care";
import { CLASS_EVENT, listMembers, listRooms } from "@/lib/classroom-store";
import {
  ACTIVITY_CHIPS, BRING_CHIPS, CARE_EVENT, MEAL_AMOUNTS, MEAL_SLOTS, MOODS,
  allergyOf, downloadCareBackup, importCare, leavesOn, reportOf, saveReport, todayISO,
} from "@/lib/care-store";
import { PageHeader, Tag } from "@/components/ui";
import { BackButton } from "@/components/ui/BackButton";
import { cn } from "@/lib/cn";

/**
 * 📔 สมุดสื่อสารประจำวัน — ฝั่งครู
 * ออกแบบให้ "กดไม่กี่ปุ่มต่อเด็ก 1 คน" ไม่ต้องพิมพ์ เพราะครูมีเวลาน้อยตอนเย็น
 */
export function DailyTeacher() {
  const [rooms, setRooms] = useState<ClassRoom[]>([]);
  const [members, setMembers] = useState<ClassMember[]>([]);
  const [roomId, setRoomId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [openChild, setOpenChild] = useState<string | null>(null);
  const [v, setV] = useState(0);   // ใช้บังคับให้อ่านข้อมูลใหม่

  useEffect(() => {
    // อ่านใหม่ทุกครั้งที่ห้องเรียนหรือข้อมูลการดูแลเปลี่ยน (เช่น ครูเพิ่มชื่อเด็กจากอีกหน้า)
    const sync = () => {
      const rs = listRooms();
      setRooms(rs);
      setRoomId((cur) => cur || rs[0]?.id || "");
      setV((n) => n + 1);
    };
    sync();
    window.addEventListener(CLASS_EVENT, sync);
    window.addEventListener(CARE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CLASS_EVENT, sync);
      window.removeEventListener(CARE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => { setMembers(roomId ? listMembers(roomId) : []); }, [roomId, v]);

  const kids = useMemo(() => members.filter((m) => m.role === "child"), [members]);
  const onLeave = useMemo(() => (roomId ? leavesOn(roomId, date) : []), [roomId, date, v]);
  const doneCount = useMemo(
    () => kids.filter((k) => reportOf(roomId, k.id, date)).length,
    [kids, roomId, date, v],
  );

  if (rooms.length === 0) {
    return (
      <div className="container-page py-8 sm:py-12">
        <BackButton fallback="/teacher" label="ห้องครู" />
        <PageHeader emoji="📔" title="สมุดสื่อสารประจำวัน" description="บอกผู้ปกครองว่าวันนี้ลูกเป็นอย่างไรบ้าง" />
        <p className="card p-6 text-center text-[15px] leading-relaxed text-ink-soft">
          ยังไม่มีห้องเรียนในระบบค่ะ — สร้างห้องและเพิ่มรายชื่อเด็กก่อนที่หน้า{" "}
          <Link href="/online-classroom" className="font-medium text-purple-700 hover:underline">ห้องเรียนออนไลน์</Link>{" "}
          แล้วกลับมาที่หน้านี้อีกครั้ง
        </p>
      </div>
    );
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <BackButton fallback="/teacher" label="ห้องครู" />
      <PageHeader
        emoji="📔"
        title="สมุดสื่อสารประจำวัน"
        description="กดไม่กี่ปุ่มต่อเด็ก 1 คน — ผู้ปกครองเปิดดูของลูกตัวเองได้ตอนเย็น"
      >
        <div className="flex flex-wrap gap-2">
          <Tag tone="purple">👧 {kids.length} คน</Tag>
          <Tag tone={doneCount === kids.length && kids.length > 0 ? "mint" : "yellow"}>
            ✍️ บันทึกแล้ว {doneCount}/{kids.length}
          </Tag>
          {onLeave.length > 0 && <Tag tone="pink">🏠 ลาวันนี้ {onLeave.length} คน</Tag>}
        </div>
      </PageHeader>

      {/* เลือกห้องและวันที่ */}
      <div className="card mb-5 grid gap-3 p-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[13px] text-ink-soft">🏫 ห้องเรียน</span>
          <select
            value={roomId}
            onChange={(e) => { setRoomId(e.target.value); setOpenChild(null); }}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[15px] text-ink outline-none focus:border-purple-400"
          >
            {rooms.map((r) => <option key={r.id} value={r.id}>{r.emoji} {r.nickname} ({r.code})</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[13px] text-ink-soft">📅 วันที่</span>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setOpenChild(null); }}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[15px] text-ink outline-none focus:border-purple-400"
          />
        </label>
      </div>

      {kids.length === 0 ? (
        <p className="card p-6 text-center text-[15px] text-ink-soft">
          ห้องนี้ยังไม่มีรายชื่อเด็ก — เพิ่มได้ที่หน้า{" "}
          <Link href="/online-classroom" className="font-medium text-purple-700 hover:underline">ห้องเรียนออนไลน์</Link>
        </p>
      ) : (
        <div className="grid gap-2">
          {kids.map((k) => (
            <ChildRow
              key={k.id}
              child={k}
              roomId={roomId}
              date={date}
              open={openChild === k.id}
              onToggle={() => setOpenChild(openChild === k.id ? null : k.id)}
              onLeave={onLeave.some((l) => l.childId === k.id)}
              v={v}
            />
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <button type="button" onClick={() => { const n = downloadCareBackup(); alert(`สำรองไว้แล้ว: ${n}`); }}
          className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-5 py-2.5 text-[14px] font-medium text-purple-700 hover:brightness-95">
          <Download size={15} /> สำรองเป็นไฟล์
        </button>
        <label className="tap inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-cream-dark px-5 py-2.5 text-[14px] font-medium text-purple-700 hover:brightness-95">
          <Upload size={15} /> นำไฟล์สำรองกลับเข้ามา
          <input type="file" accept="application/json,.json" className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0]; e.target.value = "";
              if (!f || !confirm("นำไฟล์สำรองกลับเข้ามา? ข้อมูลในเครื่องนี้จะถูกแทนที่")) return;
              alert(importCare(await f.text()).message);
            }} />
        </label>
      </div>

      <p className="mt-4 rounded-2xl bg-yellow-soft px-4 py-3 text-[13px] leading-relaxed text-[#8a6a00]">
        💾 ตอนนี้ข้อมูลเก็บในเครื่องนี้เครื่องเดียว — ผู้ปกครองยังเปิดดูจากเครื่องตัวเองไม่ได้
        จนกว่าจะย้ายข้อมูลขึ้นเซิร์ฟเวอร์ (อยู่ในรายการรอทำข้อ 6.2) · ระหว่างนี้กดสำรองไฟล์เก็บไว้ด้วยนะคะ
      </p>
    </div>
  );
}

function ChildRow({ child, roomId, date, open, onToggle, onLeave, v }: {
  child: ClassMember; roomId: string; date: string; open: boolean; onToggle: () => void; onLeave: boolean; v: number;
}) {
  const saved = useMemo(() => reportOf(roomId, child.id, date), [roomId, child.id, date, v]);
  const allergy = useMemo(() => allergyOf(child.id), [child.id, v]);
  const [d, setD] = useState<Partial<DailyReport>>({});
  const [flash, setFlash] = useState(false);

  useEffect(() => { setD(saved ?? {}); }, [saved, open]);

  const setMeal = (slot: keyof DailyReport["meals"], a: MealAmount) =>
    setD((x) => ({ ...x, meals: { ...x.meals, [slot]: x.meals?.[slot] === a ? undefined : a } }));

  const toggleIn = (key: "activities" | "bring", val: string) =>
    setD((x) => {
      const cur = x[key] ?? [];
      return { ...x, [key]: cur.includes(val) ? cur.filter((c) => c !== val) : [...cur, val] };
    });

  const save = () => {
    saveReport({
      roomId, childId: child.id, date,
      meals: d.meals ?? {}, nap: d.nap, poop: d.poop, mood: d.mood,
      activities: d.activities, bring: d.bring, note: d.note,
      by: "ครู", id: saved?.id,
    });
    setFlash(true);
    setTimeout(() => setFlash(false), 1400);
  };

  const mood = MOODS.find((m) => m.id === d.mood);

  return (
    <article className={cn("card overflow-hidden p-0", onLeave && "opacity-70")}>
      <button type="button" onClick={onToggle} className="tap flex w-full items-center gap-3 p-4 text-left">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-purple-100 text-xl">
          {mood?.emoji ?? "👧"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="font-display text-[16px] text-purple-800">{child.name}</span>
            {onLeave && <span className="rounded-full bg-pink-soft px-2 py-0.5 text-[11px] font-medium text-[#a8456c]">🏠 ลาวันนี้</span>}
            {allergy && allergy.items.length > 0 && (
              <span className="rounded-full bg-yellow-soft px-2 py-0.5 text-[11px] font-medium text-[#8a6a00]">
                ⚠️ แพ้ {allergy.items.join(" · ")}
              </span>
            )}
          </span>
          <span className="mt-0.5 block text-[13px] text-ink-soft">
            {saved ? `✅ บันทึกแล้ว${mood ? ` · ${mood.label}` : ""}` : "ยังไม่ได้บันทึก"}
          </span>
        </span>
        <span className="shrink-0 text-[13px] font-medium text-purple-600">{open ? "ปิด" : "บันทึก"}</span>
      </button>

      {open && (
        <div className="border-t border-line p-4">
          {/* มื้ออาหาร */}
          {MEAL_SLOTS.map((slot) => (
            <div key={slot.id} className="mb-3">
              <p className="mb-1.5 text-[13px] font-medium text-purple-700">{slot.emoji} {slot.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {MEAL_AMOUNTS.map((a) => (
                  <Chip key={a.id} active={d.meals?.[slot.id] === a.id} onClick={() => setMeal(slot.id, a.id)}>
                    {a.emoji} {a.label}
                  </Chip>
                ))}
              </div>
            </div>
          ))}

          {/* นอนกลางวัน + ห้องน้ำ */}
          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[13px] font-medium text-purple-700">😴 นอนกลางวัน</span>
              <input
                value={d.nap ?? ""}
                onChange={(e) => setD((x) => ({ ...x, nap: e.target.value }))}
                placeholder="เช่น 12:30–14:00 น."
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-purple-400"
              />
            </label>
            <div>
              <p className="mb-1.5 text-[13px] font-medium text-purple-700">🚻 เข้าห้องน้ำหนัก</p>
              <div className="flex gap-1.5">
                <Chip active={d.poop === "yes"} onClick={() => setD((x) => ({ ...x, poop: x.poop === "yes" ? undefined : "yes" }))}>✅ ถ่ายปกติ</Chip>
                <Chip active={d.poop === "no"} onClick={() => setD((x) => ({ ...x, poop: x.poop === "no" ? undefined : "no" }))}>➖ ยังไม่ถ่าย</Chip>
              </div>
            </div>
          </div>

          {/* อารมณ์ */}
          <div className="mb-3">
            <p className="mb-1.5 text-[13px] font-medium text-purple-700">💗 อารมณ์วันนี้</p>
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map((m) => (
                <Chip key={m.id} active={d.mood === m.id} onClick={() => setD((x) => ({ ...x, mood: x.mood === m.id ? undefined : m.id as MoodId }))}>
                  {m.emoji} {m.label}
                </Chip>
              ))}
            </div>
          </div>

          {/* กิจกรรม */}
          <div className="mb-3">
            <p className="mb-1.5 text-[13px] font-medium text-purple-700">🎨 วันนี้ทำอะไรบ้าง</p>
            <div className="flex flex-wrap gap-1.5">
              {ACTIVITY_CHIPS.map((a) => (
                <Chip key={a} active={d.activities?.includes(a)} onClick={() => toggleIn("activities", a)}>{a}</Chip>
              ))}
            </div>
          </div>

          {/* ของที่ต้องเตรียมพรุ่งนี้ */}
          <div className="mb-3">
            <p className="mb-1.5 text-[13px] font-medium text-purple-700">🎒 พรุ่งนี้ขอให้เตรียมมา</p>
            <div className="flex flex-wrap gap-1.5">
              {BRING_CHIPS.map((b) => (
                <Chip key={b} active={d.bring?.includes(b)} onClick={() => toggleIn("bring", b)}>{b}</Chip>
              ))}
            </div>
          </div>

          <label className="mb-3 block">
            <span className="mb-1 block text-[13px] font-medium text-purple-700">💬 ข้อความถึงผู้ปกครอง (ไม่ใส่ก็ได้)</span>
            <textarea
              value={d.note ?? ""}
              onChange={(e) => setD((x) => ({ ...x, note: e.target.value }))}
              rows={2}
              placeholder="เช่น วันนี้กล้าออกไปเล่าหน้าชั้นเป็นครั้งแรกเลยค่ะ"
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-purple-400"
            />
          </label>

          <button type="button" onClick={save}
            className={cn(
              "tap inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[15px] font-medium text-white shadow-soft transition",
              flash ? "bg-[#1f6b4d]" : "bg-purple-600 hover:bg-purple-700",
            )}>
            {flash ? <><Check size={16} /> บันทึกแล้ว</> : <><Save size={16} /> บันทึกของ {child.name}</>}
          </button>
        </div>
      )}
    </article>
  );
}

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!!active}
      className={cn(
        "tap rounded-full px-3 py-1.5 text-[13px] font-medium transition",
        active ? "bg-purple-600 text-white! shadow-soft" : "bg-cream-dark text-purple-700 hover:brightness-95",
      )}
    >
      {children}
    </button>
  );
}
