"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { addTeacher, hasTeachers, loginTeacher, logoutTeacher, useTeacher } from "@/lib/teacher-auth";

/**
 * 🔒 กั้นหน้าของครู — ยังไม่เข้าสู่ระบบจะเห็นฟอร์มเข้าสู่ระบบแทนเนื้อหา
 * ใช้ใน layout.tsx ของโซนครู (ห้องครู · ผู้ดูแลระบบ · Studio ฯลฯ)
 */
export function TeacherGate({ children }: { children: React.ReactNode }) {
  const { teacher, ready } = useTeacher();
  if (!ready) return <div className="min-h-[60vh]" />;
  if (!teacher) {
    return (
      <div className="container-page flex min-h-[70vh] items-center justify-center py-10">
        <div className="card animate-rise w-full max-w-md p-6 sm:p-8">
          <p className="text-center text-5xl">👩‍🏫</p>
          <h1 className="mt-2 text-center text-2xl">หน้านี้สำหรับครู</h1>
          <p className="mt-1 text-center text-[14px] text-ink-soft">กรุณาเข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่านของครูก่อนนะคะ</p>
          <TeacherLoginForm />
          <Link href="/" className="tap mt-3 inline-flex w-full items-center justify-center rounded-full border border-line px-4 py-2.5 text-[15px] text-purple-700 hover:bg-purple-50">← กลับหน้าแรก</Link>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="container-page flex flex-wrap items-center justify-end gap-2 pt-3 text-[13px] text-ink-soft">
        <span>👩‍🏫 เข้าสู่ระบบเป็น <b className="text-purple-800">{teacher.name}</b>{teacher.admin && " · ผู้ดูแล"}</span>
        <button type="button" onClick={logoutTeacher} className="tap inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-purple-700 hover:bg-purple-50"><LogOut size={13} /> ออกจากระบบ</button>
      </div>
      {children}
    </>
  );
}

/** ฟอร์มเข้าสู่ระบบครู — ถ้าเครื่องนี้ยังไม่มีบัญชีครูเลย จะให้ตั้งบัญชีผู้ดูแลก่อน */
export function TeacherLoginForm({ onDone }: { onDone?: () => void }) {
  const [setup] = useState(() => !hasTeachers());
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    let err: string | null;
    if (setup) {
      err = password !== confirm ? "รหัสผ่านสองช่องไม่ตรงกัน" : await addTeacher(username, name, password, true);
      if (!err) err = await loginTeacher(username, password);
    } else {
      err = await loginTeacher(username, password);
    }
    setBusy(false);
    setError(err);
    if (!err) onDone?.();
  };

  const input = "w-full rounded-2xl border border-line bg-white px-4 py-2.5 text-[15px] outline-none focus:border-purple-400";
  return (
    <form onSubmit={submit} className="mt-5 grid gap-2.5">
      {setup && <p className="rounded-xl bg-yellow-soft px-3 py-2 text-[13px] leading-relaxed">✨ ยังไม่มีบัญชีครูในเครื่องนี้ — ตั้งบัญชี <b>ผู้ดูแล</b> คนแรกได้เลย แล้วค่อยเพิ่มครูคนอื่นในหน้าผู้ดูแลระบบ</p>}
      <input className={input} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ชื่อผู้ใช้ (ภาษาอังกฤษ เช่น kaowfang)" autoComplete="username" autoCapitalize="none" required aria-label="ชื่อผู้ใช้" />
      {setup && <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อที่แสดง เช่น ครูข้าวฟ่าง" required aria-label="ชื่อที่แสดง" />}
      <input className={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="รหัสผ่าน" autoComplete={setup ? "new-password" : "current-password"} required aria-label="รหัสผ่าน" />
      {setup && <input className={input} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="ยืนยันรหัสผ่าน" autoComplete="new-password" required aria-label="ยืนยันรหัสผ่าน" />}
      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-[13px] text-red-600">{error}</p>}
      <button type="submit" disabled={busy} className="tap rounded-full bg-purple-600 px-4 py-3 text-base font-medium text-white shadow-soft hover:bg-purple-700 disabled:opacity-60">
        {busy ? "กำลังตรวจสอบ…" : setup ? "ตั้งบัญชีและเข้าสู่ระบบ" : "👩‍🏫 เข้าสู่ระบบครู"}
      </button>
    </form>
  );
}
