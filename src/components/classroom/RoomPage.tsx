"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ClassRoom } from "@/types/classroom";
import { cn } from "@/lib/cn";
import { CLASS_EVENT, getClassMe, getRoom, gradeOf, listMembers, type ClassMe } from "@/lib/classroom-store";
import { LiveRoom } from "./LiveRoom";
import { ChatPanel } from "./ChatPanel";
import { ArchivePanel } from "./ArchivePanel";
import { MembersPanel, RoomSettings, StarsPanel } from "./RoomPanels";
import { WhoAmI } from "./WhoAmI";
import { BackButton } from "@/components/ui";
import { Avatar, AvatarPicker } from "@/components/profile/Avatar";

type Tab = "live" | "chat" | "archive" | "stars" | "members" | "settings";
const TABS: { id: Tab; emoji: string; label: string; teacherOnly?: boolean }[] = [
  { id: "live", emoji: "📹", label: "เรียนสด" },
  { id: "chat", emoji: "💬", label: "แชต" },
  { id: "archive", emoji: "📚", label: "ย้อนหลัง" },
  { id: "stars", emoji: "⭐", label: "ดาว" },
  { id: "members", emoji: "👥", label: "สมาชิก" },
  { id: "settings", emoji: "⚙️", label: "ตั้งค่า", teacherOnly: true },
];

/** หน้าห้องเรียนออนไลน์ 1 ห้อง — แท็บ: เรียนสด / แชต / ย้อนหลัง / ดาว / สมาชิก / ตั้งค่า */
export function RoomPage({ id, initialTab }: { id: string; initialTab?: Tab }) {
  const router = useRouter();
  const [room, setRoom] = useState<ClassRoom | null | undefined>(undefined);
  const [me, setMe] = useState<ClassMe | null>(null);
  const [tab, setTab] = useState<Tab>(initialTab ?? "live");
  const [avatar, setAvatar] = useState(false);
  useEffect(() => { const l = () => setRoom(getRoom(id) ?? null); l(); setMe(getClassMe()); window.addEventListener(CLASS_EVENT, l); return () => window.removeEventListener(CLASS_EVENT, l); }, [id]);

  if (room === undefined) return <div className="container-page py-16 text-center text-ink-soft">กำลังเปิดห้องเรียน…</div>;
  if (room === null) return <div className="container-page py-16 text-center"><p className="text-4xl">🏫</p><p className="mt-2">ไม่พบห้องเรียนนี้</p><Link href="/online-classroom" className="mt-3 inline-block text-purple-700 underline">← กลับห้องเรียนออนไลน์</Link></div>;
  if (!me) return <div className="container-page py-8"><WhoAmI onDone={setMe} /></div>;
  const isTeacher = me.role === "teacher";
  const member = listMembers(room.id).find((m) => m.id === me.id || (m.name === me.name && m.role === me.role));
  const g = gradeOf(room.gradeId);
  if (!isTeacher && !member) return (
    <div className="container-page py-12 text-center">
      <p className="text-5xl">{room.emoji}</p><h1 className="mt-2 text-2xl">{room.nickname} <span className="text-[14px] font-normal text-ink-soft">— {room.code}</span></h1>
      <p className="mt-2 text-[14px] text-ink-soft">ห้องนี้เข้าได้เฉพาะเด็กและผู้ปกครองที่ครูเชิญ — ขอลิงก์/รหัสเชิญจากครูประจำห้อง แล้วเข้าที่ “มีรหัสเชิญ?” ในหน้าห้องเรียนออนไลน์</p>
      <Link href="/online-classroom" className="mt-4 inline-block rounded-full bg-purple-600 px-4 py-2 text-[14px] text-white">← ห้องเรียนออนไลน์</Link>
    </div>
  );

  return (
    <div className="container-page py-4 sm:py-6">
      <div className="flex flex-wrap items-center gap-3">
        <BackButton fallback="/online-classroom" />
        <Link href="/online-classroom" className="text-[13px] text-purple-700 hover:underline">💻 ห้องเรียนออนไลน์</Link>
        <span className={cn("rounded-full px-2.5 py-0.5 text-[12px]", g.tint)}>{g.emoji} {g.label}</span>
        {room.status === "closed" && <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[12px] text-red-600">🔒 ปิดห้องชั่วคราว</span>}
        <button type="button" onClick={() => setAvatar(true)} className="ml-auto inline-flex items-center gap-2 rounded-full bg-white px-2 py-1 text-[13px] ring-1 ring-line hover:bg-purple-50"><Avatar name={me.name} size={26} /> {me.name} <span className="text-ink-soft">({isTeacher ? "ครู" : me.role === "parent" ? "ผู้ปกครอง" : "นักเรียน"})</span></button>
      </div>
      <header className="mt-2 flex items-center gap-3">
        <span className="grid size-14 place-items-center rounded-2xl bg-white text-4xl shadow-soft">{room.emoji}</span>
        <div className="min-w-0"><h1 className="truncate text-2xl leading-tight sm:text-3xl">{room.nickname}</h1><p className="text-[13px] text-ink-soft">{room.code} · 👩‍🏫 {room.teacher}{room.liveTime && ` · 🕘 ${room.liveTime}`}</p></div>
      </header>
      <nav className="no-scrollbar mt-4 flex gap-1 overflow-x-auto border-b border-line" aria-label="แท็บห้องเรียน">
        {TABS.filter((t) => !t.teacherOnly || isTeacher).map((t) => <button key={t.id} type="button" onClick={() => setTab(t.id)} className={cn("tap shrink-0 border-b-2 px-3 py-2 text-[14px]", tab === t.id ? "border-purple-600 text-purple-800" : "border-transparent text-ink-soft hover:text-purple-700")}>{t.emoji} {t.label}</button>)}
      </nav>
      <div className="mt-4">
        {tab === "live" && <LiveRoom key={room.id} room={room} me={me} isTeacher={isTeacher} />}
        {tab === "chat" && <ChatPanel room={room} me={me} isTeacher={isTeacher} />}
        {tab === "archive" && <ArchivePanel room={room} isTeacher={isTeacher} by={me.name} />}
        {tab === "stars" && <StarsPanel room={room} me={me} isTeacher={isTeacher} />}
        {tab === "members" && <MembersPanel room={room} isTeacher={isTeacher} />}
        {tab === "settings" && isTeacher && <RoomSettings room={room} onDeleted={() => router.push("/online-classroom")} />}
      </div>
      {avatar && <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" onClick={() => setAvatar(false)}><div onClick={(e) => e.stopPropagation()}><AvatarPicker name={me.name} onClose={() => setAvatar(false)} /></div></div>}
    </div>
  );
}
