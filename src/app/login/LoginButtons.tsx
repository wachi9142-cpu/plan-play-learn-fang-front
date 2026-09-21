"use client";

import { useState } from "react";
import type { AuthProvider } from "@/lib/auth-providers";

/**
 * ปุ่ม Social Login — เมื่อเชื่อม NextAuth แล้วเปลี่ยน onClick เป็น signIn(provider.id)
 * และตั้ง status: "ready" ใน auth-providers.ts
 */
export function LoginButtons({ providers }: { providers: AuthProvider[] }) {
  const [msg, setMsg] = useState<string | null>(null);

  const handle = (p: AuthProvider) => {
    if (p.status === "ready") {
      // TODO: signIn(p.id) เมื่อเชื่อม backend
      return;
    }
    setMsg(`${p.emoji} ${p.name} — เร็ว ๆ นี้ค่ะ ${p.note ? `(${p.note})` : ""}`);
  };

  return (
    <div className="mt-6 grid gap-3">
      {providers.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => handle(p)}
          className="tap relative flex w-full items-center justify-center gap-3 rounded-full border border-line px-5 py-3 text-base font-medium shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
          style={{ background: p.color, color: p.text }}
        >
          <span className="text-xl">{p.emoji}</span>
          เข้าสู่ระบบด้วย {p.name}
          {p.status === "soon" && <span className="absolute right-3 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium text-purple-700">เร็ว ๆ นี้</span>}
        </button>
      ))}
      {msg && <p className="rounded-xl bg-yellow-soft px-4 py-2.5 text-center text-[14px]">{msg}</p>}
    </div>
  );
}
