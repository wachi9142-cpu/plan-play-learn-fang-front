"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ClassRoom, LiveParticipant } from "@/types/classroom";
import { cn } from "@/lib/cn";
import { CLASS_EVENT, CLASS_GRADES, getClassMe, listArchive, listMembers, listRooms, listSessions, type ClassMe } from "@/lib/classroom-store";
import { connectRoom, type CanvasSync } from "@/lib/canvas-sync";
import type { LiveMessage } from "@/types/classroom";
import { participation } from "@/lib/live-room";
import { WhoAmI } from "./WhoAmI";

/** 🧑‍🏫 Teacher Dashboard — ภาพรวมทุกห้อง: จำนวนเด็ก · ออนไลน์ · สัญญาณ · การมีส่วนร่วม · ดาว · คลัง */
export function TeacherDashboard() {
  const [me, setMe] = useState<ClassMe | null | undefined>(undefined);
  const [rooms, setRooms] = useState<ClassRoom[]>([]);
  const [online, setOnline] = useState<Record<string, LiveParticipant[]>>({});
  useEffect(() => { const l = () => setRooms(listRooms()); l(); setMe(getClassMe()); window.addEventListener(CLASS_EVENT, l); return () => window.removeEventListener(CLASS_EVENT, l); }, []);

  // ฟัง presence ของทุกห้อง (อ่านอย่างเดียว) เพื่อแสดงว่าใครออนไลน์อยู่
  useEffect(() => {
    const conns: CanvasSync<LiveMessage>[] = [];
    for (const r of rooms) {
      const s = connectRoom<LiveMessage>(`class-${r.id}`, (m) => {
        if (m.t === "presence" || m.t === "hello") setOnline((o) => ({ ...o, [r.id]: [...(o[r.id] ?? []).filter((p) => p.id !== m.who.id), { ...m.who, lastSeen: Date.now() }] }));
        if (m.t === "bye") setOnline((o) => ({ ...o, [r.id]: (o[r.id] ?? []).filter((p) => p.id !== m.who) }));
      });
      conns.push(s);
    }
    const t = setInterval(() => setOnline((o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v.filter((p) => Date.now() - p.lastSeen < 35000)]))), 10000);
    return () => { clearInterval(t); conns.forEach((c) => c.close()); };
  }, [rooms]);

  if (me === undefined) return null;
  if (!me || me.role !== "teacher") return <div className="container-page py-8"><WhoAmI onDone={setMe} lockRole="teacher" /></div>;

  const totalKids = rooms.reduce((a, r) => a + listMembers(r.id).filter((m) => m.role === "child").length, 0);
  const totalOnline = Object.values(online).reduce((a, v) => a + v.length, 0);

  return (
    <div className="container-page py-6 sm:py-10">
      <div className="flex flex-wrap items-center gap-3"><Link href="/online-classroom" className="text-[13px] text-purple-700 hover:underline">← ห้องเรียนออนไลน์</Link></div>
      <h1 className="mt-2 text-3xl">🧑‍🏫 Teacher Dashboard</h1>
      <p className="text-[14px] text-ink-soft">สวัสดีค่ะ {me.name} — ภาพรวมห้องเรียนทั้งหมด {rooms.length} ห้อง · 👧 {totalKids} คน · 🟢 ออนไลน์ตอนนี้ {totalOnline}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-[12px]"><span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-line">🌐 Connection: 🟢 ปกติ · 🟠 ไม่เสถียร · 🔴 หลุด</span><span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-line">🙋 Participation: 🟢 ร่วม · 🟡 ไม่แน่ใจ · 🔴 ไม่ร่วม</span></div>

      {CLASS_GRADES.map((g) => {
        const list = rooms.filter((r) => r.gradeId === g.id); if (!list.length) return null;
        return (
          <section key={g.id} className="mt-6">
            <h2 className="text-lg">{g.emoji} {g.label}</h2>
            <div className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {list.map((r) => {
                const members = listMembers(r.id); const kids = members.filter((m) => m.role === "child");
                const on = (online[r.id] ?? []).filter((p) => p.role !== "teacher");
                const conn = { green: on.filter((p) => p.conn === "green").length, orange: on.filter((p) => p.conn === "orange").length, red: on.filter((p) => p.conn === "red").length };
                const partRed = on.filter((p) => p.role === "child" && participation(p) === "red").length;
                const stars = kids.reduce((a, k) => a + k.stars.length, 0);
                const archive = listArchive(r.id); const sessions = listSessions(r.id);
                return (
                  <div key={r.id} className={cn("card p-4", r.status === "closed" && "opacity-60")}>
                    <div className="flex items-center gap-3"><span className={cn("grid size-12 place-items-center rounded-2xl text-2xl", g.tint)}>{r.emoji}</span><div className="min-w-0 flex-1"><p className="truncate font-display text-[16px] text-purple-800">{r.nickname}</p><p className="text-[12px] text-ink-soft">{r.code}{r.liveTime && ` · 🕘 ${r.liveTime}`}</p></div></div>
                    <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[13px]">
                      <span>👧 {kids.length} คน</span><span>⭐ {stars} ดาว</span>
                      <span>🟢 ออนไลน์ {on.length}</span><span>🟠 สัญญาณมีปัญหา {conn.orange}</span>
                      <span>🔴 หลุด {conn.red}</span><span>🔴 ไม่ร่วมกิจกรรม {partRed}</span>
                      <span>📚 คลัง {archive.length}</span><span>🎥 คาบที่บันทึก {sessions.filter((s) => s.recordingId).length}/{sessions.length}</span>
                    </div>
                    {on.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{on.map((p) => <span key={p.id} className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-0.5 text-[11px]"><span className={cn("size-2 rounded-full", p.conn === "green" ? "bg-green-500" : p.conn === "orange" ? "bg-orange-400" : "bg-red-500")} />{p.name}</span>)}</div>}
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[12px]">
                      <Link href={`/online-classroom/${r.id}`} className="rounded-full bg-purple-600 px-3 py-1 text-white">🔴 เริ่มห้องเรียน</Link>
                      <Link href={`/online-classroom/${r.id}?tab=members`} className="rounded-full bg-white px-3 py-1 ring-1 ring-line hover:bg-purple-50">✉️ เชิญ</Link>
                      <Link href={`/online-classroom/${r.id}?tab=stars`} className="rounded-full bg-white px-3 py-1 ring-1 ring-line hover:bg-purple-50">⭐ ดาว</Link>
                      <Link href={`/online-classroom/${r.id}?tab=archive`} className="rounded-full bg-white px-3 py-1 ring-1 ring-line hover:bg-purple-50">📚 คลัง</Link>
                      <Link href={`/online-classroom/${r.id}?tab=chat`} className="rounded-full bg-white px-3 py-1 ring-1 ring-line hover:bg-purple-50">💬 แชต</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
      <div className="card mt-8 p-4 text-[13px] text-ink-soft">
        <b className="text-ink">💡 วิธีใช้งานจริง (ยังไม่มีเซิร์ฟเวอร์กลาง)</b>
        <ol className="mt-1 list-decimal space-y-0.5 pl-5">
          <li>ครูรัน <code className="rounded bg-cream px-1">npm run canvas-server</code> (พอร์ต 3003) บนเครื่องครู — ใช้เป็นตัวกลางของห้องเรียนสด แชต และ Garden Canvas</li>
          <li>เด็ก/ผู้ปกครองเปิดเว็บด้วย IP ของเครื่องครูใน Wi-Fi เดียวกัน · กล้อง/ไมค์ต้องเปิดผ่าน https:// (หรือ localhost) — ใช้ <code className="rounded bg-cream px-1">next dev --experimental-https</code> หรือขึ้นเซิร์ฟเวอร์จริงพร้อม SSL</li>
          <li>เมื่อขึ้นระบบจริง: แทน relay ด้วยบริการวิดีโอ (เช่น LiveKit/Daily) และย้ายข้อมูลจาก localStorage ไปฐานข้อมูล — โครงสร้างข้อมูลออกแบบไว้รองรับแล้ว</li>
        </ol>
      </div>
    </div>
  );
}
