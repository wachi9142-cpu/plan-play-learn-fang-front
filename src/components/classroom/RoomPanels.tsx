"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Link2, RefreshCw, Trash2, UserPlus } from "lucide-react";
import type { ClassMember, ClassRoom } from "@/types/classroom";
import { cn } from "@/lib/cn";
import { CLASS_EVENT, CLASS_GRADES, ROLE_EMOJI, ROLE_LABEL, STAR_REASONS, addMember, deleteRoom, editStar, fmtDate, giveStar, listMembers, regenInvite, removeMember, removeStar, updateMember, updateRoom, type ClassMe } from "@/lib/classroom-store";
import { Avatar } from "@/components/profile/Avatar";

const useMembers = (roomId: string) => { const [ms, set] = useState<ClassMember[]>([]); useEffect(() => { const l = () => set(listMembers(roomId)); l(); window.addEventListener(CLASS_EVENT, l); return () => window.removeEventListener(CLASS_EVENT, l); }, [roomId]); return ms; };

/* ---------- ⭐ ดาว ---------- */
export function StarsPanel({ room, me, isTeacher }: { room: ClassRoom; me: ClassMe; isTeacher: boolean }) {
  const members = useMembers(room.id).filter((m) => m.role === "child");
  const [reasonFor, setReasonFor] = useState<string | null>(null);
  const [reason, setReason] = useState(STAR_REASONS[0]);
  const [custom, setCustom] = useState("");
  const visible = isTeacher ? members : members.filter((m) => m.id === me.id || m.name === me.childName || m.name === me.name);
  return (
    <div className="space-y-3">
      <div className="card p-3 text-[13px] text-ink-soft">⭐ ดาวคือกำลังใจและแรงเสริมเชิงบวก — ให้เมื่อเด็กตอบคำถาม ตั้งใจฟัง ร่วมกิจกรรม กล้าแสดงความคิดเห็น หรือทำกิจกรรมเสร็จ (ไม่ใช้เพื่อกดดันเด็ก) {isTeacher ? "· ครูแก้ไข/ลบเหตุผลได้" : "· ผู้ปกครองเห็นเฉพาะดาวของบุตรหลาน"}</div>
      {visible.length === 0 && <div className="card p-8 text-center text-[14px] text-ink-soft">ยังไม่มีนักเรียนในห้อง — เชิญเด็กเข้าห้องในแท็บ 👥 สมาชิก</div>}
      <div className="grid gap-3 sm:grid-cols-2">
        {visible.sort((a, b) => b.stars.length - a.stars.length).map((m) => (
          <div key={m.id} className="card p-4">
            <div className="flex items-center gap-3">
              <Avatar name={m.name} size={44} />
              <div className="min-w-0 flex-1"><p className="font-display text-[16px] text-purple-800">{m.name}</p><p className="text-[20px] leading-tight tracking-tight">{"⭐".repeat(Math.min(m.stars.length, 20))}{m.stars.length > 20 && "…"}</p><p className="text-[12px] text-ink-soft">{m.stars.length} ดาว</p></div>
              {isTeacher && <button type="button" onClick={() => setReasonFor(m.id)} className="tap rounded-full bg-yellow-400 px-3 py-1.5 text-[13px] font-medium text-ink">⭐ ให้ดาว</button>}
            </div>
            {m.stars.length > 0 && (
              <ul className="mt-3 space-y-1 text-[12px]">
                {[...m.stars].reverse().slice(0, 8).map((s) => (
                  <li key={s.id} className="flex items-center gap-2 rounded-lg bg-cream px-2 py-1">
                    <span>⭐</span>
                    {isTeacher ? <input defaultValue={s.reason} onBlur={(e) => e.target.value !== s.reason && editStar(m.id, s.id, e.target.value)} className="min-w-0 flex-1 bg-transparent outline-none focus:bg-white" /> : <span className="flex-1">{s.reason}</span>}
                    <span className="text-ink-soft">{fmtDate(s.at)}</span>
                    {isTeacher && <button type="button" onClick={() => removeStar(m.id, s.id)} className="text-ink-soft hover:text-red-500"><Trash2 size={11} /></button>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      {reasonFor && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" onClick={() => setReasonFor(null)}>
          <div className="card w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg">⭐ ให้ดาว {members.find((m) => m.id === reasonFor)?.name}</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">{STAR_REASONS.map((r) => <button key={r} type="button" onClick={() => { setReason(r); setCustom(""); }} className={cn("rounded-full border border-line px-3 py-1 text-[13px]", reason === r && !custom && "border-purple-400 bg-purple-100")}>{r}</button>)}</div>
            <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="หรือพิมพ์เหตุผลเอง…" className="mt-2 w-full rounded-lg border border-line px-3 py-1.5 text-[14px] outline-none focus:border-purple-400" />
            <div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => setReasonFor(null)} className="rounded-full px-3 py-1.5 text-[13px] text-ink-soft">ยกเลิก</button><button type="button" onClick={() => { giveStar(reasonFor, custom.trim() || reason, me.name); setReasonFor(null); setCustom(""); }} className="rounded-full bg-yellow-400 px-4 py-1.5 text-[13px] font-medium text-ink">⭐ ให้ดาว</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- 👥 สมาชิก / เชิญ ---------- */
export function MembersPanel({ room, isTeacher }: { room: ClassRoom; isTeacher: boolean }) {
  const members = useMembers(room.id);
  const [name, setName] = useState("");
  const [role, setRole] = useState<"child" | "parent">("child");
  const [childName, setChildName] = useState("");
  const [copied, setCopied] = useState(false);
  const link = typeof window !== "undefined" ? `${window.location.origin}/online-classroom/join/${room.inviteCode}` : "";
  const copy = async () => { try { await navigator.clipboard.writeText(`${room.emoji} ${room.nickname} — ${room.code}\nลิงก์เข้าห้องเรียนออนไลน์: ${link}\nรหัสเชิญ: ${room.inviteCode}`); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* */ } };
  const children = members.filter((m) => m.role === "child"); const parents = members.filter((m) => m.role === "parent");
  return (
    <div className="space-y-3">
      {isTeacher && (
        <div className="card p-4">
          <h3 className="text-[15px]">✉️ เชิญเด็ก / ผู้ปกครอง</h3>
          <p className="text-[12px] text-ink-soft">ส่งลิงก์หรือรหัสเชิญให้ผู้ปกครอง — คนที่กดเข้ามาจะต้องรอครูอนุญาตก่อนเข้าห้องเรียนสดเสมอ บุคคลภายนอกเข้าเองไม่ได้</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-cream px-3 py-2 text-[13px]"><Link2 size={14} className="shrink-0 text-purple-600" /><span className="truncate">{link}</span></div>
            <span className="rounded-xl bg-purple-600 px-3 py-2 font-display text-[16px] tracking-[0.25em] text-white">{room.inviteCode}</span>
            <button type="button" onClick={copy} className="tap rounded-full border border-purple-200 bg-white px-3 py-1.5 text-[13px] text-purple-700">{copied ? <><Check size={13} className="inline" /> คัดลอกแล้ว</> : <><Copy size={13} className="inline" /> คัดลอกคำเชิญ</>}</button>
            <button type="button" onClick={() => { if (confirm("สร้างรหัสเชิญใหม่? ลิงก์เดิมจะใช้ไม่ได้")) regenInvite(room.id); }} className="tap rounded-full px-2 py-1.5 text-ink-soft hover:text-purple-700" title="สร้างรหัสใหม่"><RefreshCw size={14} /></button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; addMember(room.id, { name, role, childName: role === "parent" ? childName : undefined, approved: true }); setName(""); setChildName(""); }} className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
            <UserPlus size={15} className="text-purple-600" /><span>เพิ่มรายชื่อเอง:</span>
            <select value={role} onChange={(e) => setRole(e.target.value as "child" | "parent")} className="rounded-lg border border-line bg-white px-2 py-1.5"><option value="child">👧 นักเรียน</option><option value="parent">👨‍👩‍👧 ผู้ปกครอง</option></select>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อ" className="min-w-0 flex-1 rounded-lg border border-line px-3 py-1.5 outline-none focus:border-purple-400" />
            {role === "parent" && <input value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="ผู้ปกครองของ (ชื่อเด็ก)" className="min-w-0 flex-1 rounded-lg border border-line px-3 py-1.5 outline-none focus:border-purple-400" />}
            <button type="submit" className="rounded-full bg-purple-600 px-3 py-1.5 text-white">เพิ่ม</button>
          </form>
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        <MemberList title={`👧 นักเรียน (${children.length})`} list={children} isTeacher={isTeacher} />
        <MemberList title={`👨‍👩‍👧 ผู้ปกครอง (${parents.length})`} list={parents} isTeacher={isTeacher} />
      </div>
    </div>
  );
}
function MemberList({ title, list, isTeacher }: { title: string; list: ClassMember[]; isTeacher: boolean }) {
  return (
    <div className="card p-3">
      <h3 className="text-[14px]">{title}</h3>
      {list.length === 0 ? <p className="mt-2 text-[13px] text-ink-soft">ยังไม่มี</p> : (
        <ul className="mt-2 space-y-1.5">
          {list.map((m) => (
            <li key={m.id} className="flex items-center gap-2 rounded-xl bg-cream px-2 py-1.5 text-[13px]">
              <Avatar name={m.name} size={30} />
              <span className="min-w-0 flex-1 truncate">{m.name}{m.childName && <span className="text-ink-soft"> · ของ {m.childName}</span>}{m.role === "child" && m.stars.length > 0 && <span className="text-ink-soft"> · ⭐ {m.stars.length}</span>}</span>
              {!m.approved && <span className="rounded-full bg-yellow-soft px-2 text-[11px]">รออนุมัติ</span>}
              {isTeacher && <>
                {!m.approved && <button type="button" onClick={() => updateMember(m.id, { approved: true })} className="rounded-full bg-green-500 px-2 text-[11px] text-white">อนุญาต</button>}
                {m.role === "child" && <button type="button" onClick={() => updateMember(m.id, { filterAllowed: !m.filterAllowed })} title={m.filterAllowed ? "งดฟิลเตอร์" : "อนุญาตฟิลเตอร์"} className="text-[14px]">{m.filterAllowed ? "🎨" : "🚫"}</button>}
                <button type="button" onClick={() => { if (confirm(`นำ ${m.name} ออกจากห้อง?`)) removeMember(m.id); }} className="text-ink-soft hover:text-red-500"><Trash2 size={12} /></button>
              </>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- ⚙️ ตั้งค่าห้อง ---------- */
export function RoomSettings({ room, onDeleted }: { room: ClassRoom; onDeleted: () => void }) {
  const [f, setF] = useState({ nickname: room.nickname, emoji: room.emoji, code: room.code, description: room.description ?? "", liveTime: room.liveTime ?? "", teacher: room.teacher, gradeId: room.gradeId });
  const save = () => { updateRoom(room.id, f); };
  return (
    <div className="card max-w-xl p-4">
      <h3 className="text-[15px]">⚙️ ตั้งค่าห้องเรียน</h3>
      <p className="text-[12px] text-ink-soft">ระบบใช้ “รหัสห้องจริง” เป็นตัวอ้างอิง ส่วน “ชื่อเล่นห้อง” เปลี่ยนได้ตลอด</p>
      <div className="mt-3 grid gap-2 text-[13px] sm:grid-cols-[72px_1fr]">
        <label>อีโมจิ<input value={f.emoji} onChange={(e) => setF({ ...f, emoji: e.target.value })} className="mt-1 w-full rounded-lg border border-line px-2 py-1.5 text-center text-[20px]" /></label>
        <label>ชื่อเล่นห้อง<input value={f.nickname} onChange={(e) => setF({ ...f, nickname: e.target.value })} className="mt-1 w-full rounded-lg border border-line px-3 py-1.5" /></label>
        <label className="sm:col-span-2">รหัสห้องจริง<input value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} className="mt-1 w-full rounded-lg border border-line px-3 py-1.5" /></label>
        <label className="sm:col-span-2">ระดับ<select value={f.gradeId} onChange={(e) => setF({ ...f, gradeId: e.target.value as ClassRoom["gradeId"] })} className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-1.5">{CLASS_GRADES.map((g) => <option key={g.id} value={g.id}>{g.emoji} {g.label}</option>)}</select></label>
        <label className="sm:col-span-2">ครูประจำห้อง<input value={f.teacher} onChange={(e) => setF({ ...f, teacher: e.target.value })} className="mt-1 w-full rounded-lg border border-line px-3 py-1.5" /></label>
        <label className="sm:col-span-2">เวลาเรียนสด<input value={f.liveTime} onChange={(e) => setF({ ...f, liveTime: e.target.value })} placeholder="เช่น จ–ศ 09:00–09:40" className="mt-1 w-full rounded-lg border border-line px-3 py-1.5" /></label>
        <label className="sm:col-span-2">คำอธิบาย<textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} rows={2} className="mt-1 w-full rounded-lg border border-line px-3 py-1.5" /></label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={save} className="rounded-full bg-purple-600 px-4 py-1.5 text-[13px] text-white">บันทึก</button>
        <button type="button" onClick={() => updateRoom(room.id, { status: room.status === "open" ? "closed" : "open" })} className="rounded-full border border-line bg-white px-4 py-1.5 text-[13px]">{room.status === "open" ? "🔒 ปิดห้องชั่วคราว" : "🔓 เปิดห้อง"}</button>
        <button type="button" onClick={() => { if (confirm(`ลบห้อง “${room.nickname}” และข้อมูลทั้งหมดของห้อง?`)) { deleteRoom(room.id); onDeleted(); } }} className="ml-auto rounded-full px-3 py-1.5 text-[13px] text-red-500 hover:bg-red-50">ลบห้อง</button>
      </div>
      <p className="mt-2 text-[11px] text-ink-soft">บทบาทในเครื่องนี้: {ROLE_EMOJI.teacher} {ROLE_LABEL.teacher}</p>
    </div>
  );
}
