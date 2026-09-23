"use client";

import { Check } from "lucide-react";
import { THEME_MODES } from "@/lib/theme";
import { cn } from "@/lib/cn";
import { useTheme } from "./useTheme";

/** 💜 การ์ดเลือกธีมขนาดใหญ่ พร้อมภาพตัวอย่าง — ใช้ในหน้าตั้งค่า ⚙️ */
export function ThemeCards() {
  const { mode, resolved, ready, setMode } = useTheme();
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        {THEME_MODES.map((m) => {
          const on = ready && mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              aria-pressed={on}
              className={cn(
                "card card-hover flex flex-col p-3 text-left transition-colors",
                on ? "border-purple-400! ring-2 ring-purple-300" : "",
              )}
            >
              <Preview id={m.id} systemIsDark={resolved === "dark"} />
              <span className="mt-3 flex items-center gap-1.5">
                <span className="text-lg">{m.emoji}</span>
                <span className="font-display text-[16px] text-purple-800">{m.label}</span>
                {on && <Check size={16} className="ml-auto shrink-0 text-purple-600" />}
              </span>
              <span className="mt-1 text-[13px] leading-snug text-ink-soft">{m.hint}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 rounded-2xl bg-purple-50 px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
        ⭐ ระบบจะ<b className="text-purple-700">จำโหมดที่เลือกไว้</b>ในเครื่องนี้ — เปิดเว็บครั้งหน้าไม่ต้องเลือกใหม่
        {ready && mode === "system" && <> · ตอนนี้อุปกรณ์ของคุณตั้งเป็น{resolved === "dark" ? " 🌙 โหมดมืด" : " ☀️ โหมดสว่าง"} ถ้าเปลี่ยนที่เครื่อง เว็บจะเปลี่ยนตามทันที</>}
      </p>
    </div>
  );
}

/** ภาพตัวอย่างหน้าเว็บย่อส่วน — ให้เห็นสีก่อนกดเลือกจริง */
function Preview({ id, systemIsDark }: { id: string; systemIsDark: boolean }) {
  const dark = id === "dark" || (id === "system" && systemIsDark);
  const c = dark
    ? { bg: "#14101c", card: "#221b30", bar: "#6f45cc", text: "#e2d3fb", soft: "#ab9fbd", line: "#362a4a" }
    : { bg: "#fff9f0", card: "#ffffff", bar: "#6d3aa8", text: "#45236b", soft: "#6d6379", line: "#ecdff5" };
  return (
    <span aria-hidden className="block overflow-hidden rounded-xl border" style={{ background: c.bg, borderColor: c.line }}>
      <span className="flex items-center gap-1 px-2 py-1.5" style={{ background: c.bar }}>
        <span className="size-2 rounded-full bg-white/80" />
        <span className="h-1.5 w-10 rounded-full bg-white/60" />
        <span className="ml-auto h-1.5 w-5 rounded-full bg-white/40" />
      </span>
      <span className="block p-2">
        <span className="block rounded-lg border p-2" style={{ background: c.card, borderColor: c.line }}>
          <span className="block h-2 w-16 rounded-full" style={{ background: c.text }} />
          <span className="mt-1.5 block h-1.5 w-full rounded-full" style={{ background: c.soft, opacity: 0.6 }} />
          <span className="mt-1 block h-1.5 w-3/4 rounded-full" style={{ background: c.soft, opacity: 0.45 }} />
        </span>
      </span>
    </span>
  );
}
