"use client";

import { useState } from "react";
import type { CanvasRole, Participant } from "@/types/canvas";
import { MEMBER_COLORS, ROLE_EMOJI, ROLE_LABEL, getMe, setMe } from "@/lib/canvas-store";
import { cn } from "@/lib/cn";

/** หน้าต่างก่อนเข้าห้องวาด: ชื่อ · บทบาท · สีปากกา (ใช้แยกว่าใครวาดส่วนไหน) */
export function JoinDialog({ title, room, onJoin }: { title: string; room: string; onJoin: (p: Participant) => void }) {
  const prev = typeof window !== "undefined" ? getMe() : null;
  const [name, setName] = useState(prev?.name ?? "");
  const [role, setRole] = useState<CanvasRole>(prev?.role ?? "child");
  const [color, setColor] = useState(prev?.color ?? MEMBER_COLORS[1]);

  return (
    <div className="grid min-h-dvh place-items-center bg-cream p-4">
      <form onSubmit={(e) => { e.preventDefault(); onJoin(setMe({ name, role, color })); }} className="card w-full max-w-md p-6 animate-rise">
        <p className="text-[13px] text-purple-700">🎨 Garden Canvas · ห้อง <b className="tracking-widest">{room}</b></p>
        <h1 className="mt-1 text-2xl">{title}</h1>
        <p className="mt-1 text-[14px] text-ink-soft">บอกชื่อก่อนเข้าไปวาดด้วยกันนะคะ 💜</p>
        <label className="mt-4 block text-[13px]">ชื่อที่จะแสดง<input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น น้องเอ / คุณแม่น้องเอ" className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-[15px] outline-none focus:border-purple-400" required /></label>
        <div className="mt-3 text-[13px]">ฉันคือ
          <div className="mt-1 grid grid-cols-3 gap-2">
            {(Object.keys(ROLE_LABEL) as CanvasRole[]).map((r) => <button key={r} type="button" onClick={() => setRole(r)} className={cn("rounded-xl border border-line py-2 text-[14px] hover:bg-purple-50", role === r && "border-purple-400 bg-purple-100 text-purple-800")}>{ROLE_EMOJI[r]} {ROLE_LABEL[r]}</button>)}
          </div>
        </div>
        <div className="mt-3 text-[13px]">สีของฉัน
          <div className="mt-1 flex flex-wrap gap-2">{MEMBER_COLORS.map((c) => <button key={c} type="button" onClick={() => setColor(c)} className={cn("size-8 rounded-full ring-2 ring-offset-2", color === c ? "ring-purple-500" : "ring-transparent")} style={{ background: c }} aria-label={c} />)}</div>
        </div>
        <button type="submit" className="tap mt-5 w-full rounded-full bg-purple-600 py-2.5 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700">เข้าห้องวาด 🖍️</button>
      </form>
    </div>
  );
}
