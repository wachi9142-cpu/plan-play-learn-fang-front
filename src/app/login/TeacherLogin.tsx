"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutTeacher, useTeacher } from "@/lib/teacher-auth";
import { TeacherLoginForm } from "@/components/teacher/TeacherGate";

/** 👩‍🏫 ส่วนเข้าสู่ระบบของครู บนหน้า /login */
export function TeacherLogin() {
  const router = useRouter();
  const { teacher, ready } = useTeacher();
  if (!ready) return <div className="mt-6 h-40" />;

  return (
    <section className="mt-6 rounded-3xl border border-purple-200 bg-purple-50/60 p-4 sm:p-5">
      <h2 className="text-center font-display text-lg text-purple-800">👩‍🏫 สำหรับครู</h2>
      {teacher ? (
        <div className="mt-3 grid gap-2 text-center">
          <p className="text-[14px]">เข้าสู่ระบบเป็น <b className="text-purple-800">{teacher.name}</b> อยู่แล้ว</p>
          <Link href="/teacher" className="tap rounded-full bg-purple-600 px-4 py-3 text-base font-medium text-white shadow-soft hover:bg-purple-700">ไปห้องครู →</Link>
          <button type="button" onClick={logoutTeacher} className="tap rounded-full border border-line bg-white px-4 py-2 text-[14px] text-purple-700 hover:bg-purple-50">ออกจากระบบ</button>
        </div>
      ) : (
        <TeacherLoginForm onDone={() => router.push("/teacher")} />
      )}
    </section>
  );
}
