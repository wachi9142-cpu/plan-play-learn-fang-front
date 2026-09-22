"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ClassRoom } from "@/types/classroom";
import { addMember, getClassMe, getRoomByInvite, type ClassMe } from "@/lib/classroom-store";
import { WhoAmI } from "./WhoAmI";

/**
 * เข้าห้องด้วยลิงก์/รหัสเชิญ — บันทึกเป็นสมาชิก "รออนุมัติ" ในเครื่องนี้ แล้วพาไปห้อง
 * (ครูจะอนุญาตให้เข้าห้องเรียนสดอีกครั้งตอนเรียนจริง)
 * หมายเหตุ: ยังไม่มีฐานข้อมูลกลาง — รหัสเชิญจะตรวจได้เฉพาะเครื่องที่มีข้อมูลห้อง; บนเครื่องอื่นจะสร้างห้องอ้างอิงให้อัตโนมัติ
 */
export function JoinByInvite({ code }: { code: string }) {
  const router = useRouter();
  const [room, setRoom] = useState<ClassRoom | null | undefined>(undefined);
  const [me, setMe] = useState<ClassMe | null>(null);
  useEffect(() => { setRoom(getRoomByInvite(code) ?? null); setMe(getClassMe()); }, [code]);

  const go = (m: ClassMe) => {
    if (!room) return;
    addMember(room.id, { id: m.id, name: m.name, role: m.role, childName: m.childName, approved: m.role === "teacher" });
    router.push(`/online-classroom/${room.id}`);
  };

  if (room === undefined) return <div className="container-page py-16 text-center text-ink-soft">กำลังตรวจสอบรหัสเชิญ…</div>;
  if (room === null) return (
    <div className="container-page py-16 text-center">
      <p className="text-5xl">🔍</p><h1 className="mt-2 text-2xl">ไม่พบรหัสเชิญ {code}</h1>
      <p className="mt-2 text-[14px] text-ink-soft">ตรวจสอบรหัสจากครูอีกครั้ง — หรือหากเปิดจากเครื่องอื่นที่ยังไม่มีข้อมูลห้อง ให้ครูส่งลิงก์ห้องโดยตรง (ระบบจะรองรับข้ามเครื่องเมื่อมีฐานข้อมูลกลาง)</p>
      <Link href="/online-classroom" className="mt-4 inline-block text-purple-700 underline">← ห้องเรียนออนไลน์</Link>
    </div>
  );
  return (
    <div className="container-page py-8">
      <div className="mx-auto mb-4 max-w-md text-center"><span className="text-5xl">{room.emoji}</span><h1 className="mt-1 text-2xl">{room.nickname}</h1><p className="text-[13px] text-ink-soft">{room.code} · 👩‍🏫 {room.teacher}</p><p className="mt-2 rounded-xl bg-yellow-soft px-3 py-2 text-[13px]">✉️ คุณได้รับเชิญเข้าห้องนี้ — ระบุชื่อเพื่อเข้าร่วม ครูจะอนุญาตให้เข้าห้องเรียนสดอีกครั้งตอนเรียนจริง</p></div>
      {me ? <div className="mx-auto max-w-md text-center"><button type="button" onClick={() => go(me)} className="tap rounded-full bg-purple-600 px-6 py-2.5 text-[15px] font-medium text-white shadow-soft">เข้าร่วมในชื่อ {me.name} 💜</button><p className="mt-2 text-[12px]"><button type="button" onClick={() => setMe(null)} className="text-purple-700 underline">ใช้ชื่ออื่น</button></p></div> : <WhoAmI onDone={go} />}
    </div>
  );
}
