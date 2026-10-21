"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import type { ClassRoom } from "@/types/classroom";
import { CLASS_EVENT, listRooms } from "@/lib/classroom-store";
import {
  CARE_EVENT, LEAVE_KINDS, ackChange, ackLeave, listChanges, listLeaves, listPickups, todayISO,
} from "@/lib/care-store";
import { PageHeader, Tag } from "@/components/ui";
import { BackButton } from "@/components/ui/BackButton";
import { cn } from "@/lib/cn";

/** 🏠 แจ้งลา + 🚸 คนมารับเด็ก — ฝั่งครู ดูรวมทั้งห้องในหน้าเดียว */
export function LeaveTeacher() {
  const [rooms, setRooms] = useState<ClassRoom[]>([]);
  const [roomId, setRoomId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [v, setV] = useState(0);

  useEffect(() => {
    const sync = () => {
      const rs = listRooms();
      setRooms(rs);
      setRoomId((cur) => cur || rs[0]?.id || "");
      setV((n) => n + 1);
    };
    sync();
    window.addEventListener(CLASS_EVENT, sync);
    window.addEventListener(CARE_EVENT, sync);
    return () => { window.removeEventListener(CLASS_EVENT, sync); window.removeEventListener(CARE_EVENT, sync); };
  }, []);

  const todayLeaves = useMemo(() => listLeaves(roomId).filter((l) => l.dates.includes(date)), [roomId, date, v]);
  const todayChanges = useMemo(() => listChanges(roomId, date), [roomId, date, v]);
  const upcoming = useMemo(() => listLeaves(roomId).filter((l) => l.dates.every((d) => d > date)), [roomId, date, v]);
  const allPickups = useMemo(() => listPickups(undefined, roomId), [roomId, v]);

  if (rooms.length === 0) {
    return (
      <div className="container-page py-8 sm:py-12">
        <BackButton fallback="/teacher" label="ห้องครู" />
        <PageHeader emoji="🏠" title="แจ้งลาและคนมารับเด็ก" description="ดูรวมว่าวันนี้ใครลา และใครมารับใคร" />
        <p className="card p-6 text-center text-[15px] leading-relaxed text-ink-soft">
          ยังไม่มีห้องเรียนในระบบค่ะ — สร้างห้องก่อนที่{" "}
          <Link href="/online-classroom" className="font-medium text-purple-700 hover:underline">ห้องเรียนออนไลน์</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <BackButton fallback="/teacher" label="ห้องครู" />
      <PageHeader emoji="🏠" title="แจ้งลาและคนมารับเด็ก" description="ดูรวมในหน้าเดียวว่าวันนี้ใครลา และวันไหนมีคนอื่นมารับแทน">
        <div className="flex flex-wrap gap-2">
          <Tag tone={todayLeaves.length > 0 ? "pink" : "mint"}>🏠 ลาวันนี้ {todayLeaves.length} คน</Tag>
          <Tag tone={todayChanges.length > 0 ? "yellow" : "mint"}>🚸 เปลี่ยนคนรับวันนี้ {todayChanges.length} คน</Tag>
        </div>
      </PageHeader>

      <div className="card mb-5 grid gap-3 p-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[13px] text-ink-soft">🏫 ห้องเรียน</span>
          <select value={roomId} onChange={(e) => setRoomId(e.target.value)}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[15px] text-ink outline-none focus:border-purple-400">
            {rooms.map((r) => <option key={r.id} value={r.id}>{r.emoji} {r.nickname} ({r.code})</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[13px] text-ink-soft">📅 วันที่</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[15px] text-ink outline-none focus:border-purple-400" />
        </label>
      </div>

      {/* ลาวันนี้ */}
      <section className="mb-8">
        <h2 className="mb-2 text-xl sm:text-2xl">🏠 ลาวันที่เลือก</h2>
        {todayLeaves.length === 0 ? (
          <p className="card p-5 text-center text-[15px] text-[#1f6b4d]">✅ วันนี้ไม่มีเด็กลาค่ะ</p>
        ) : (
          <ul className="grid gap-2">
            {todayLeaves.map((l) => {
              const k = LEAVE_KINDS.find((x) => x.id === l.kind)!;
              return (
                <li key={l.id} className={cn("card flex items-start gap-3 p-4", !l.ack && "border-yellow-accent!")}>
                  <span className="text-2xl">{k.emoji}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[16px] text-purple-800">{l.childName} — {k.label}</span>
                    <span className="mt-0.5 block text-[13px] text-ink-soft">📅 {l.dates.join(" · ")}</span>
                    {l.reason && <span className="mt-0.5 block text-[14px] text-ink">💬 {l.reason}</span>}
                  </span>
                  {!l.ack && (
                    <button type="button" onClick={() => ackLeave(l.id)}
                      className="tap inline-flex shrink-0 items-center gap-1 rounded-full bg-purple-600 px-3 py-1.5 text-[13px] font-medium text-white shadow-soft hover:bg-purple-700">
                      <Check size={14} /> รับทราบ
                    </button>
                  )}
                  {l.ack && <span className="shrink-0 text-[13px] text-[#1f6b4d]">✅ รับทราบแล้ว</span>}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* เปลี่ยนคนรับ */}
      <section className="mb-8">
        <h2 className="mb-2 text-xl sm:text-2xl">🚸 วันนี้มีคนอื่นมารับ</h2>
        {todayChanges.length === 0 ? (
          <p className="card p-5 text-center text-[15px] text-[#1f6b4d]">✅ วันนี้ทุกคนมารับตามปกติค่ะ</p>
        ) : (
          <ul className="grid gap-2">
            {todayChanges.map((c) => (
              <li key={c.id} className={cn("card flex items-start gap-3 p-4", !c.ack && "border-yellow-accent!")}>
                <span className="text-2xl">🚸</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[16px] text-purple-800">{c.childName}</span>
                  <span className="mt-0.5 block text-[14px] text-ink">
                    ให้ <b>{c.name}</b> ({c.relation}) มารับ{c.phone ? ` · ☎️ ${c.phone}` : ""}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-ink-soft">แจ้งโดย {c.by}</span>
                </span>
                {!c.ack ? (
                  <button type="button" onClick={() => ackChange(c.id)}
                    className="tap inline-flex shrink-0 items-center gap-1 rounded-full bg-purple-600 px-3 py-1.5 text-[13px] font-medium text-white shadow-soft hover:bg-purple-700">
                    <Check size={14} /> รับทราบ
                  </button>
                ) : <span className="shrink-0 text-[13px] text-[#1f6b4d]">✅ รับทราบแล้ว</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* รายชื่อคนรับประจำ */}
      <section className="mb-8">
        <h2 className="mb-1 text-xl sm:text-2xl">📇 รายชื่อคนที่มารับได้ประจำ</h2>
        <p className="mb-3 text-[14px] text-ink-soft">ตรวจสอบก่อนส่งเด็กทุกครั้ง — ถ้าไม่มีชื่อในรายการนี้และไม่ได้แจ้งล่วงหน้า อย่าเพิ่งให้รับนะคะ</p>
        {allPickups.length === 0 ? (
          <p className="card p-5 text-center text-[15px] text-ink-soft">ยังไม่มีผู้ปกครองใส่รายชื่อเข้ามา</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {allPickups.map((p) => (
              <li key={p.id} className="card flex items-center gap-3 p-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-purple-100 text-lg">🧑</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[15px] text-purple-800">{p.name}</span>
                  <span className="text-[13px] text-ink-soft">รับ {p.childName} · {p.relation}{p.phone ? ` · ${p.phone}` : ""}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ลาล่วงหน้า */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-2 text-xl sm:text-2xl">📅 แจ้งลาล่วงหน้า</h2>
          <ul className="grid gap-2">
            {upcoming.map((l) => {
              const k = LEAVE_KINDS.find((x) => x.id === l.kind)!;
              return (
                <li key={l.id} className="card flex items-center gap-3 p-3">
                  <span className="text-xl">{k.emoji}</span>
                  <span className="min-w-0 flex-1 text-[14px]">
                    <b className="text-purple-800">{l.childName}</b> <span className="text-ink-soft">{k.label} · {l.dates.join(" · ")}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
