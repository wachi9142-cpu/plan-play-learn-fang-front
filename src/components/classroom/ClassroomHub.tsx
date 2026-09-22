"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import type { ClassGradeId, ClassRoom } from "@/types/classroom";
import { cn } from "@/lib/cn";
import { CLASS_EVENT, CLASS_GRADES, createRoom, getClassMe, getRoomByInvite, listMembers, listRooms, setClassMe, type ClassMe } from "@/lib/classroom-store";
import { WhoAmI } from "./WhoAmI";

/** 🏫 หน้าแรกห้องเรียนออนไลน์ — ห้องแยกตามระดับ · ห้องพิเศษ · ครูสร้าง/จัดการห้องได้เอง */
export function ClassroomHub() {
  const router = useRouter();
  const [rooms, setRooms] = useState<ClassRoom[]>([]);
  const [me, setMe] = useState<ClassMe | null | undefined>(undefined);
  const [create, setCreate] = useState(false);
  const [code, setCode] = useState("");
  useEffect(() => { const l = () => setRooms(listRooms()); l(); setMe(getClassMe()); window.addEventListener(CLASS_EVENT, l); return () => window.removeEventListener(CLASS_EVENT, l); }, []);
  if (me === undefined) return null;
  if (!me) return <div className="container-page py-8"><WhoAmI onDone={setMe} /></div>;
  const isTeacher = me.role === "teacher";
  const myRooms = isTeacher ? rooms : rooms.filter((r) => listMembers(r.id).some((m) => m.id === me.id || (m.name === me.name && m.role === me.role)));

  const join = (e: React.FormEvent) => { e.preventDefault(); const r = getRoomByInvite(code.trim()); if (r) router.push(`/online-classroom/join/${r.inviteCode}`); else router.push(`/online-classroom/join/${code.trim().toUpperCase()}`); };

  return (
    <div className="container-page py-6 sm:py-10">
      <section className="rounded-3xl bg-gradient-to-br from-purple-100 via-sky-soft to-mint-soft px-4 py-8 text-center sm:px-6 sm:py-12">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-[13px] font-medium text-purple-700 shadow-soft">💻 ห้องเรียนออนไลน์ · Little Purple Garden Online Classroom</p>
        <h1 className="mt-4 text-3xl sm:text-5xl">ห้องเรียนจริงที่ย้ายมาอยู่บนออนไลน์</h1>
        <p className="mx-auto mt-2 max-w-2xl text-[15px] text-ink-soft sm:text-base">เรียนสด 🔴 · แชตประจำห้อง 💬 · ดาวให้กำลังใจ ⭐ · บันทึกการสอนและดูย้อนหลัง 📚 — สำหรับครู เด็ก และผู้ปกครอง</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[13px]">
          <span className="rounded-full bg-white/80 px-3 py-1">คุณคือ {isTeacher ? "👩‍🏫 ครู" : me.role === "parent" ? "👨‍👩‍👧 ผู้ปกครอง" : "👧 นักเรียน"} {me.name}</span>
          <button type="button" onClick={() => { setClassMe({ name: "", role: "parent" }); localStorage.removeItem("lpg-class-me"); setMe(null); }} className="text-purple-700 underline">เปลี่ยน</button>
          {isTeacher && <Link href="/online-classroom/teacher" className="rounded-full bg-purple-600 px-4 py-1.5 font-medium text-white shadow-soft hover:bg-purple-700">🧑‍🏫 Teacher Dashboard</Link>}
        </div>
        {!isTeacher && (
          <form onSubmit={join} className="mx-auto mt-5 flex max-w-md items-center gap-2 rounded-2xl bg-white p-2 shadow-soft">
            <span className="pl-2 text-[13px] text-ink-soft">มีรหัสเชิญจากครู?</span>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="เช่น AB3K9Z" maxLength={8} className="min-w-0 flex-1 rounded-lg border border-line px-3 py-1.5 font-mono tracking-widest outline-none focus:border-purple-400" />
            <button type="submit" className="rounded-full bg-purple-600 px-4 py-1.5 text-[13px] text-white">เข้าห้อง</button>
          </form>
        )}
      </section>

      {!isTeacher && myRooms.length === 0 && <div className="card mt-6 p-6 text-center text-[14px] text-ink-soft">ยังไม่ได้อยู่ในห้องเรียนใด — ขอลิงก์หรือรหัสเชิญจากครูประจำห้อง แล้วกรอกด้านบน 💜<br /><span className="text-[12px]">บุคคลภายนอกไม่สามารถเข้าห้องเรียนได้เอง ครูต้องเป็นผู้เชิญและอนุญาต</span></div>}

      {CLASS_GRADES.map((g) => {
        const list = myRooms.filter((r) => r.gradeId === g.id);
        if (list.length === 0 && !isTeacher) return null;
        return (
          <section key={g.id} className="mt-8">
            <div className="flex items-center gap-2"><h2 className="text-xl">{g.emoji} {g.label}</h2><span className="text-[13px] text-ink-soft">{list.length} ห้อง</span>{isTeacher && g.id === "special" && <button type="button" onClick={() => setCreate(true)} className="ml-auto inline-flex items-center gap-1 rounded-full bg-purple-600 px-3 py-1 text-[13px] text-white"><Plus size={14} /> สร้างห้องพิเศษ</button>}</div>
            {g.id === "special" && list.length === 0 && <p className="mt-2 text-[13px] text-ink-soft">เช่น ห้องกิจกรรมพิเศษ · ห้องศิลปะ · ห้องดนตรี · ห้องเสริมทักษะ · ห้องเรียนรวม · ห้องเฉพาะโครงการ</p>}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((r) => <RoomCard key={r.id} room={r} tint={g.tint} />)}
              {isTeacher && g.id !== "special" && <button type="button" onClick={() => { createRoom({ gradeId: g.id, nickname: `ห้องใหม่ ${g.short}`, emoji: g.emoji }); }} className="grid min-h-24 place-items-center rounded-2xl border-2 border-dashed border-purple-200 text-[13px] text-purple-700 hover:bg-purple-50"><span><Plus size={16} className="mx-auto" />เพิ่มห้อง {g.short}</span></button>}
            </div>
          </section>
        );
      })}

      {create && <CreateSpecial onClose={() => setCreate(false)} />}
    </div>
  );
}

export function RoomCard({ room, tint, extra }: { room: ClassRoom; tint: string; extra?: React.ReactNode }) {
  const members = listMembers(room.id); const kids = members.filter((m) => m.role === "child").length; const parents = members.filter((m) => m.role === "parent").length;
  return (
    <Link href={`/online-classroom/${room.id}`} className={cn("card card-hover flex items-center gap-3 p-3", room.status === "closed" && "opacity-60")}>
      <span className={cn("grid size-14 shrink-0 place-items-center rounded-2xl text-3xl", tint)}>{room.emoji}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-[16px] text-purple-800">{room.nickname}</span>
        <span className="block text-[13px] text-ink-soft">{room.code}{room.status === "closed" && " · 🔒 ปิด"}</span>
        <span className="block text-[12px] text-ink-soft">👧 {kids} · 👨‍👩‍👧 {parents}{room.liveTime && ` · 🕘 ${room.liveTime}`}</span>
        {extra}
      </span>
    </Link>
  );
}

function CreateSpecial({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [f, setF] = useState({ nickname: "", emoji: "⭐", code: "", description: "", liveTime: "" });
  const PRESETS = [["🎉", "ห้องกิจกรรมพิเศษ"], ["🎨", "ห้องศิลปะ"], ["🎵", "ห้องดนตรี"], ["🧩", "ห้องเสริมทักษะ"], ["🏫", "ห้องเรียนรวม"], ["🌱", "ห้องโครงการ"]];
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" onClick={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); const r = createRoom({ gradeId: "special" as ClassGradeId, nickname: f.nickname, emoji: f.emoji, code: f.code || f.nickname, description: f.description, liveTime: f.liveTime }); onClose(); router.push(`/online-classroom/${r.id}`); }} className="card w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg">⭐ สร้างห้องเรียนพิเศษ</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">{PRESETS.map(([e, n]) => <button key={n} type="button" onClick={() => setF({ ...f, emoji: e, nickname: n })} className="rounded-full bg-cream px-2.5 py-1 text-[12px] hover:bg-purple-50">{e} {n}</button>)}</div>
        <div className="mt-3 grid grid-cols-[64px_1fr] gap-2 text-[13px]">
          <input value={f.emoji} onChange={(e) => setF({ ...f, emoji: e.target.value })} className="rounded-lg border border-line px-2 py-1.5 text-center text-[20px]" aria-label="อีโมจิ" />
          <input value={f.nickname} onChange={(e) => setF({ ...f, nickname: e.target.value })} required placeholder="ชื่อห้อง เช่น ห้องศิลปะ" className="rounded-lg border border-line px-3 py-1.5" />
          <input value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} placeholder="รหัสห้อง (ถ้ามี)" className="col-span-2 rounded-lg border border-line px-3 py-1.5" />
          <input value={f.liveTime} onChange={(e) => setF({ ...f, liveTime: e.target.value })} placeholder="เวลาเรียน เช่น ศ 13:00–13:40" className="col-span-2 rounded-lg border border-line px-3 py-1.5" />
          <textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="คำอธิบาย/โครงการที่เกี่ยวข้อง" rows={2} className="col-span-2 rounded-lg border border-line px-3 py-1.5" />
        </div>
        <div className="mt-3 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-full px-3 py-1.5 text-[13px] text-ink-soft">ยกเลิก</button><button type="submit" className="rounded-full bg-purple-600 px-4 py-1.5 text-[13px] text-white">สร้างห้อง</button></div>
      </form>
    </div>
  );
}
