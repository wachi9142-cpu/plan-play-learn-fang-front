"use client";

import { useEffect, useState } from "react";
import { KeyRound, Trash2, UserPlus } from "lucide-react";
import { TEACHER_AUTH_EVENT, addTeacher, listTeachers, removeTeacher, setTeacherPassword, useTeacher, type TeacherAccount } from "@/lib/teacher-auth";

/** 👩‍🏫 จัดการบัญชีครู (หน้าผู้ดูแลระบบ) — เพิ่มครู · เปลี่ยนรหัสผ่าน · ลบบัญชี */
export function TeacherAccounts() {
  const { teacher } = useTeacher();
  const [list, setList] = useState<TeacherAccount[]>([]);
  const [form, setForm] = useState({ username: "", name: "", password: "", admin: false });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const read = () => setList(listTeachers());
    read();
    window.addEventListener(TEACHER_AUTH_EVENT, read);
    return () => window.removeEventListener(TEACHER_AUTH_EVENT, read);
  }, []);

  const isAdmin = !!teacher?.admin;
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = await addTeacher(form.username, form.name, form.password, form.admin);
    setMsg(err ? { ok: false, text: err } : { ok: true, text: `เพิ่มบัญชี ${form.name} แล้ว` });
    if (!err) setForm({ username: "", name: "", password: "", admin: false });
  };
  const changePassword = async (t: TeacherAccount) => {
    const p = prompt(`ตั้งรหัสผ่านใหม่ให้ ${t.name} (อย่างน้อย 6 ตัว)`);
    if (p === null) return;
    const err = await setTeacherPassword(t.username, p);
    setMsg(err ? { ok: false, text: err } : { ok: true, text: `เปลี่ยนรหัสผ่านของ ${t.name} แล้ว` });
  };
  const remove = (t: TeacherAccount) => {
    if (!confirm(`ลบบัญชี ${t.name} (${t.username})?`)) return;
    const err = removeTeacher(t.username);
    setMsg(err ? { ok: false, text: err } : { ok: true, text: `ลบบัญชี ${t.name} แล้ว` });
  };

  const input = "min-w-0 rounded-xl border border-line bg-white px-3 py-2 text-[14px] outline-none focus:border-purple-400";
  return (
    <div className="card p-4">
      <ul className="grid grid-cols-1 gap-2">
        {list.map((t) => (
          <li key={t.username} className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-cream-dark/40 px-3 py-2 text-[14px]">
            <span className="min-w-0 flex-1">
              <b className="text-purple-800">{t.name}</b> <span className="text-ink-soft">@{t.username}</span>
              {t.admin && <span className="ml-1.5 rounded-full bg-purple-100 px-2 py-0.5 text-[11px] text-purple-700">👑 ผู้ดูแล</span>}
              {t.username === teacher?.username && <span className="ml-1.5 text-[12px] text-ink-soft">(คุณ)</span>}
            </span>
            {(isAdmin || t.username === teacher?.username) && (
              <button type="button" onClick={() => changePassword(t)} className="tap inline-flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1 text-[12px] text-purple-700 hover:bg-purple-50"><KeyRound size={13} /> เปลี่ยนรหัส</button>
            )}
            {isAdmin && t.username !== teacher?.username && (
              <button type="button" onClick={() => remove(t)} aria-label={`ลบบัญชี ${t.name}`} className="tap grid size-8 place-items-center rounded-full text-ink-soft hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
            )}
          </li>
        ))}
      </ul>

      {isAdmin ? (
        <form onSubmit={add} className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <input className={input} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="ชื่อผู้ใช้ (อังกฤษ)" autoCapitalize="none" required aria-label="ชื่อผู้ใช้ครูใหม่" />
          <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ชื่อที่แสดง เช่น ครูมะลิ" required aria-label="ชื่อที่แสดง" />
          <input className={input} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="รหัสผ่าน (6 ตัวขึ้นไป)" autoComplete="new-password" required aria-label="รหัสผ่านครูใหม่" />
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-[13px] text-ink-soft"><input type="checkbox" checked={form.admin} onChange={(e) => setForm({ ...form, admin: e.target.checked })} /> ผู้ดูแล</label>
            <button type="submit" className="tap ml-auto inline-flex items-center gap-1 rounded-full bg-purple-600 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-purple-700"><UserPlus size={14} /> เพิ่มครู</button>
          </div>
        </form>
      ) : (
        <p className="mt-3 text-[13px] text-ink-soft">เฉพาะผู้ดูแลเพิ่มหรือลบบัญชีครูได้</p>
      )}
      {msg && <p className={`mt-3 rounded-xl px-3 py-2 text-[13px] ${msg.ok ? "bg-mint-soft text-[#2e7d32]" : "bg-red-50 text-red-600"}`}>{msg.text}</p>}
      <p className="mt-3 text-[12px] leading-relaxed text-ink-soft">
        ℹ️ บัญชีเก็บในเบราว์เซอร์ของเครื่องนี้ (รหัสผ่านเก็บแบบเข้ารหัสทางเดียว) — ครูแต่ละเครื่องต้องตั้งบัญชีของเครื่องนั้น จนกว่าจะมีระบบหลังบ้าน
      </p>
    </div>
  );
}
