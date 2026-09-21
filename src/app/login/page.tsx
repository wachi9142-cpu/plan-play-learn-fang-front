import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { AUTH_PROVIDERS } from "@/lib/auth-providers";
import { SITE } from "@/lib/site";
import { LoginButtons } from "./LoginButtons";

export const metadata: Metadata = { title: "เข้าสู่ระบบ" };

export default function LoginPage() {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-10">
      <div className="card animate-rise w-full max-w-md p-6 sm:p-8">
        <div className="text-center">
          <Image src="/logo.webp" alt="Little Purple Garden" width={112} height={112} className="mx-auto size-28 rounded-full bg-white object-cover shadow-soft" />
          <h1 className="mt-4 text-2xl sm:text-3xl">🔐 เข้าสู่ระบบ</h1>
          <p className="mt-1 text-[15px] text-ink-soft">💜 {SITE.brand} · {SITE.credit}</p>
        </div>

        <LoginButtons providers={AUTH_PROVIDERS} />

        <p className="mt-6 text-center text-[13px] text-ink-soft">
          การเข้าสู่ระบบจะเปิดใช้เมื่อเชื่อมต่อระบบหลังบ้านแล้ว — ตอนนี้ทุกส่วนของเว็บใช้งานได้โดยไม่ต้องเข้าสู่ระบบ
        </p>
        <Link href="/" className="tap mt-3 inline-flex w-full items-center justify-center rounded-full border border-line px-4 py-2.5 text-[15px] text-purple-700 hover:bg-purple-50">
          ← กลับหน้าแรก
        </Link>
      </div>
    </div>
  );
}
