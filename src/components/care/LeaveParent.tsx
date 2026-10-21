"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Send, Trash2 } from "lucide-react";
import type { ClassMember } from "@/types/classroom";
import type { LeaveKind } from "@/types/care";
import { CLASS_EVENT, listMembers, listRooms } from "@/lib/classroom-store";
import {
  CARE_EVENT, LEAVE_KINDS, addChange, addLeave, listChanges, listLeaves, listPickups,
  removeChange, removeLeave, removePickup, savePickup, toISODate, todayISO,
} from "@/lib/care-store";
import { PageHeader, Tag } from "@/components/ui";
import { BackButton } from "@/components/ui/BackButton";
import { cn } from "@/lib/cn";

/** 🏠 แจ้งลา + 🚸 คนมารับเด็ก — ฝั่งผู้ปกครอง */
export function LeaveParent() {
  const [kids, setKids] = useState<(ClassMember & { roomId: string })[]>([]);
  const [childId, setChildId] = useState("");
  const [v, setV] = useState(0);

  useEffect(() => {
    const sync = () => {
      const all = listRooms().flatMap((r) => listMembers(r.id)).filter((m) => m.role === "child") as (ClassMember & { roomId: string })[];
      setKids(all);
      setChildId((cur) => cur || all[0]?.id || "");
      setV((n) => n + 1);
    };
    sync();
    window.addEventListener(CLASS_EVENT, sync);
    window.addEventListener(CARE_EVENT, sync);
    return () => { window.removeEventListener(CLASS_EVENT, sync); window.removeEventListener(CARE_EVENT, sync); };
  }, []);

  const child = kids.find((k) => k.id === childId);
  const myLeaves = useMemo(() => listLeaves().filter((l) => l.childId === childId), [childId, v]);
  const myPickups = useMemo(() => listPickups(childId), [childId, v]);
  const myChanges = useMemo(() => listChanges().filter((c) => c.childId === childId), [childId, v]);

  if (kids.length === 0) {
    return (
      <div className="container-page py-8 sm:py-12">
        <BackButton fallback="/my-child" label="ของลูกฉัน" />
        <PageHeader emoji="🏠" title="แจ้งลาและคนมารับเด็ก" description="แจ้งครูล่วงหน้าได้จากที่นี่" />
        <p className="card p-6 text-center text-[15px] leading-relaxed text-ink-soft">
          ยังไม่มีรายชื่อเด็กในระบบค่ะ — ครูต้องสร้างห้องเรียนและเพิ่มชื่อลูกก่อนที่{" "}
          <Link href="/online-classroom" className="font-medium text-purple-700 hover:underline">ห้องเรียนออนไลน์</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <BackButton fallback="/my-child" label="ของลูกฉัน" />
      <PageHeader
        emoji="🏠"
        title="แจ้งลาและคนมารับเด็ก"
        description="แจ้งลาป่วย ลากิจ และบอกครูว่าวันไหนให้ใครมารับลูกแทน"
      >
        {child && <Tag tone="purple">👧 {child.name}</Tag>}
      </PageHeader>

      {kids.length > 1 && (
        <div className="card mb-5 p-4">
          <p className="mb-1.5 text-[13px] text-ink-soft">👧 เลือกลูก</p>
          <div className="flex flex-wrap gap-1.5">
            {kids.map((k) => (
              <button key={k.id} type="button" onClick={() => setChildId(k.id)} aria-pressed={childId === k.id}
                className={cn("tap rounded-full px-4 py-1.5 text-[14px] font-medium transition",
                  childId === k.id ? "bg-purple-600 text-white! shadow-soft" : "bg-cream-dark text-purple-700 hover:brightness-95")}>
                {k.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {child && (
        <>
          <LeaveForm child={child} />
          {myLeaves.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-2 text-xl">📋 ประวัติการลา</h2>
              <ul className="grid gap-2">
                {myLeaves.map((l) => {
                  const k = LEAVE_KINDS.find((x) => x.id === l.kind)!;
                  return (
                    <li key={l.id} className="card flex items-start gap-3 p-4">
                      <span className="text-xl">{k.emoji}</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="font-display text-[15px] text-purple-800">{k.label}</span>
                          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium",
                            l.ack ? "bg-mint-soft text-[#1f6b4d]" : "bg-yellow-soft text-[#8a6a00]")}>
                            {l.ack ? "✅ ครูรับทราบแล้ว" : "⏳ รอครูรับทราบ"}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-[14px] text-ink">📅 {l.dates.join(" · ")}</span>
                        {l.reason && <span className="mt-0.5 block text-[13px] text-ink-soft">💬 {l.reason}</span>}
                      </span>
                      <button type="button" onClick={() => { if (confirm("ยกเลิกการแจ้งลานี้?")) removeLeave(l.id); }}
                        aria-label="ยกเลิกการแจ้งลา" className="tap rounded-lg px-1.5 py-1 text-[#a8456c] hover:bg-pink-soft">
                        <Trash2 size={15} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <PickupSection child={child} people={myPickups} changes={myChanges} />
        </>
      )}
    </div>
  );
}

function LeaveForm({ child }: { child: ClassMember & { roomId: string } }) {
  const [kind, setKind] = useState<LeaveKind>("sick");
  const [from, setFrom] = useState(todayISO());
  const [to, setTo] = useState(todayISO());
  const [reason, setReason] = useState("");
  const [sent, setSent] = useState(false);

  const send = () => {
    const dates: string[] = [];
    const a = new Date(from + "T00:00:00"), b = new Date(to + "T00:00:00");
    for (let d = new Date(a); d <= b && dates.length < 60; d.setDate(d.getDate() + 1)) {
      dates.push(toISODate(d));
    }
    if (dates.length === 0) { alert("เลือกวันที่ให้ถูกต้องก่อนนะคะ"); return; }
    addLeave({ roomId: child.roomId, childId: child.id, childName: child.name, kind, dates, reason: reason.trim() || undefined, by: "ผู้ปกครอง" });
    setReason(""); setSent(true);
    setTimeout(() => setSent(false), 2000);
  };

  return (
    <section className="card mb-8 p-5">
      <h2 className="text-xl">🏠 แจ้งลา</h2>
      <p className="mt-0.5 text-[14px] text-ink-soft">แจ้งล่วงหน้าได้เลย ครูจะเห็นรวมในหน้าเดียวตอนเช้า</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {LEAVE_KINDS.map((k) => (
          <button key={k.id} type="button" onClick={() => setKind(k.id)} aria-pressed={kind === k.id}
            className={cn("tap rounded-full px-4 py-1.5 text-[14px] font-medium transition",
              kind === k.id ? "bg-purple-600 text-white! shadow-soft" : "bg-cream-dark text-purple-700 hover:brightness-95")}>
            {k.emoji} {k.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[13px] text-ink-soft">ตั้งแต่วันที่</span>
          <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); if (e.target.value > to) setTo(e.target.value); }}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[15px] text-ink outline-none focus:border-purple-400" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[13px] text-ink-soft">ถึงวันที่</span>
          <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[15px] text-ink outline-none focus:border-purple-400" />
        </label>
      </div>

      <label className="mt-3 block">
        <span className="mb-1 block text-[13px] text-ink-soft">เหตุผล (ไม่ใส่ก็ได้)</span>
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="เช่น มีไข้ ไปพบแพทย์"
          className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-purple-400" />
      </label>

      <button type="button" onClick={send}
        className={cn("tap mt-3 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[15px] font-medium text-white shadow-soft transition",
          sent ? "bg-[#1f6b4d]" : "bg-purple-600 hover:bg-purple-700")}>
        <Send size={16} /> {sent ? "แจ้งครูแล้ว" : `แจ้งลาให้ ${child.name}`}
      </button>
    </section>
  );
}

function PickupSection({ child, people, changes }: {
  child: ClassMember & { roomId: string };
  people: ReturnType<typeof listPickups>;
  changes: ReturnType<typeof listChanges>;
}) {
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");
  const [cName, setCName] = useState("");
  const [cRel, setCRel] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cDate, setCDate] = useState(todayISO());
  const [sent, setSent] = useState(false);

  const add = () => {
    if (!name.trim()) { alert("ใส่ชื่อคนที่มารับก่อนนะคะ"); return; }
    savePickup({ roomId: child.roomId, childId: child.id, childName: child.name, name: name.trim(), relation: relation.trim() || "ผู้ปกครอง", phone: phone.trim() || undefined });
    setName(""); setRelation(""); setPhone("");
  };

  const notify = () => {
    if (!cName.trim()) { alert("ใส่ชื่อคนที่จะมารับก่อนนะคะ"); return; }
    addChange({ roomId: child.roomId, childId: child.id, childName: child.name, date: cDate, name: cName.trim(), relation: cRel.trim() || "ผู้ปกครอง", phone: cPhone.trim() || undefined, by: "ผู้ปกครอง" });
    setCName(""); setCRel(""); setCPhone(""); setSent(true);
    setTimeout(() => setSent(false), 2000);
  };

  return (
    <>
      <section className="card mb-8 p-5">
        <h2 className="text-xl">🚸 คนที่มารับ {child.name} ได้ประจำ</h2>
        <p className="mt-0.5 text-[14px] leading-relaxed text-ink-soft">
          ใส่ชื่อคนที่โรงเรียนอนุญาตให้มารับได้ — ครูจะตรวจสอบก่อนส่งเด็กทุกครั้ง เพื่อความปลอดภัย
        </p>

        {people.length > 0 && (
          <ul className="mt-3 grid gap-2">
            {people.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-2.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-purple-100 text-lg">🧑</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[15px] text-purple-800">{p.name}</span>
                  <span className="text-[13px] text-ink-soft">{p.relation}{p.phone ? ` · ${p.phone}` : ""}</span>
                </span>
                <button type="button" onClick={() => { if (confirm(`ลบ ${p.name} ออกจากรายชื่อ?`)) removePickup(p.id); }}
                  aria-label={`ลบ ${p.name}`} className="tap rounded-lg px-1.5 py-1 text-[#a8456c] hover:bg-pink-soft">
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อ-นามสกุล"
            className="rounded-xl border border-line bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-purple-400" />
          <input value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="เกี่ยวข้องเป็น เช่น คุณยาย"
            className="rounded-xl border border-line bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-purple-400" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="เบอร์โทร"
            className="rounded-xl border border-line bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-purple-400" />
        </div>
        <button type="button" onClick={add}
          className="tap mt-2 inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-5 py-2 text-[14px] font-medium text-white shadow-soft hover:bg-purple-700">
          <Plus size={15} /> เพิ่มรายชื่อ
        </button>
      </section>

      <section className="card border-yellow-accent! p-5">
        <h2 className="text-xl">📣 วันนี้ให้คนอื่นมารับแทน</h2>
        <p className="mt-0.5 text-[14px] leading-relaxed text-ink-soft">
          ถ้าวันไหนมีคนอื่นมารับ แจ้งล่วงหน้าตรงนี้ ครูจะเห็นก่อนถึงเวลารับเด็ก
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[13px] text-ink-soft">วันที่</span>
            <input type="date" value={cDate} onChange={(e) => setCDate(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[15px] text-ink outline-none focus:border-purple-400" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[13px] text-ink-soft">ชื่อคนที่จะมารับ</span>
            <input value={cName} onChange={(e) => setCName(e.target.value)} placeholder="ชื่อ-นามสกุล"
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-purple-400" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[13px] text-ink-soft">เกี่ยวข้องเป็น</span>
            <input value={cRel} onChange={(e) => setCRel(e.target.value)} placeholder="เช่น คุณอา"
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-purple-400" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[13px] text-ink-soft">เบอร์โทร</span>
            <input value={cPhone} onChange={(e) => setCPhone(e.target.value)} placeholder="08x-xxx-xxxx"
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-purple-400" />
          </label>
        </div>

        <button type="button" onClick={notify}
          className={cn("tap mt-3 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[15px] font-medium text-white shadow-soft transition",
            sent ? "bg-[#1f6b4d]" : "bg-purple-600 hover:bg-purple-700")}>
          <Send size={16} /> {sent ? "แจ้งครูแล้ว" : "แจ้งครู"}
        </button>

        {changes.length > 0 && (
          <ul className="mt-4 grid gap-2">
            {changes.map((c) => (
              <li key={c.id} className="flex items-start gap-3 rounded-2xl bg-cream px-4 py-2.5">
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="font-display text-[15px] text-purple-800">📅 {c.date}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium",
                      c.ack ? "bg-mint-soft text-[#1f6b4d]" : "bg-yellow-soft text-[#8a6a00]")}>
                      {c.ack ? "✅ ครูรับทราบแล้ว" : "⏳ รอครูรับทราบ"}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-[14px] text-ink">{c.name} ({c.relation}){c.phone ? ` · ${c.phone}` : ""}</span>
                </span>
                <button type="button" onClick={() => { if (confirm("ยกเลิกการแจ้งนี้?")) removeChange(c.id); }}
                  aria-label="ยกเลิกการแจ้ง" className="tap rounded-lg px-1.5 py-1 text-[#a8456c] hover:bg-pink-soft">
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
