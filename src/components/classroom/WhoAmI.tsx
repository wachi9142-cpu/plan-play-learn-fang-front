"use client";

import { useState } from "react";
import type { ClassRole } from "@/types/classroom";
import { cn } from "@/lib/cn";
import { ROLE_EMOJI, ROLE_LABEL, getClassMe, setClassMe, type ClassMe } from "@/lib/classroom-store";

/**
 * ระบุตัวตนก่อนใช้ห้องเรียนออนไลน์ (ชั่วคราว จนกว่าจะมีระบบเข้าสู่ระบบจริง)
 * ครู = ควบคุมห้อง · นักเรียน/ผู้ปกครอง = ต้องได้รับเชิญและครูอนุญาตก่อน
 */
export function WhoAmI({ onDone, lockRole }: { onDone: (me: ClassMe) => void; lockRole?: ClassRole }) {
  const prev = typeof window !== "undefined" ? getClassMe() : null;
  const [name, setName] = useState(prev?.name ?? "");
  const [role, setRole] = useState<ClassRole>(lockRole ?? prev?.role ?? "parent");
  const [childName, setChildName] = useState(prev?.childName ?? "");
  return (
    <form onSubmit={(e) => { e.preventDefault(); onDone(setClassMe({ name, role, childName: role === "parent" ? childName : undefined })); }} className="card mx-auto w-full max-w-md p-6 animate-rise">
      <p className="text-[13px] text-purple-700">💜 ห้องเรียนออนไลน์ Little Purple Garden</p>
      <h1 className="mt-1 text-2xl">คุณคือใครคะ?</h1>
      <p className="mt-1 text-[13px] text-ink-soft">ยังไม่มีระบบเข้าสู่ระบบจริง — ระบุชื่อและบทบาทเพื่อใช้งานในเครื่องนี้ (ห้องเรียนสดต้องให้ครูอนุญาตก่อนเสมอ)</p>
      {!lockRole && <div className="mt-4 grid grid-cols-3 gap-2">{(Object.keys(ROLE_LABEL) as ClassRole[]).map((r) => <button key={r} type="button" onClick={() => setRole(r)} className={cn("rounded-xl border border-line py-2 text-[14px] hover:bg-purple-50", role === r && "border-purple-400 bg-purple-100 text-purple-800")}>{ROLE_EMOJI[r]} {ROLE_LABEL[r]}</button>)}</div>}
      <label className="mt-3 block text-[13px]">ชื่อ{role === "teacher" ? "ครู" : role === "parent" ? "ผู้ปกครอง" : "เด็ก"}<input autoFocus value={name} onChange={(e) => setName(e.target.value)} required placeholder={role === "teacher" ? "ครูข้าวฟ่าง" : role === "parent" ? "คุณแม่น้องเอ" : "น้องเอ"} className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-[15px] outline-none focus:border-purple-400" /></label>
      {role === "parent" && <label className="mt-3 block text-[13px]">ผู้ปกครองของ (ชื่อเด็ก)<input value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="น้องเอ" className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-[15px] outline-none focus:border-purple-400" /></label>}
      <button type="submit" className="tap mt-5 w-full rounded-full bg-purple-600 py-2.5 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700">ไปต่อ 💜</button>
    </form>
  );
}
