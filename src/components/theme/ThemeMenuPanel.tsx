"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { THEME_MODES } from "@/lib/theme";
import { cn } from "@/lib/cn";
import { useTheme } from "./useTheme";
import { useAmbient } from "./useAmbient";

/** 💜 เนื้อหาในเมนูตั้งค่า ⚙️ — เลือกธีม ☀️ 🌙 ⚙️ แล้วระบบจำไว้ให้ */
export function ThemeMenuPanel({ onPicked }: { onPicked?: () => void }) {
  const { mode, resolved, ready, setMode } = useTheme();
  const fx = useAmbient();
  return (
    <div>
      <p className="px-3 pb-1 pt-1.5 text-[12px] text-ink-soft">💜 ธีมการแสดงผล</p>
      {THEME_MODES.map((m) => {
        const on = ready && mode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            role="menuitemradio"
            aria-checked={on}
            onClick={() => { setMode(m.id); onPicked?.(); }}
            className={cn("flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[15px] transition-colors", on ? "bg-purple-50 font-medium text-purple-800" : "text-ink hover:bg-purple-50")}
          >
            <span className="w-6 shrink-0 text-center">{m.emoji}</span>
            <span className="min-w-0 flex-1 truncate">{m.label}</span>
            {on && <Check size={16} className="shrink-0 text-purple-600" />}
          </button>
        );
      })}
      <p className="px-3 pb-1 pt-1 text-[11px] leading-snug text-ink-soft">
        {ready && mode === "system" ? `ตอนนี้เครื่องตั้งเป็น ${resolved === "dark" ? "🌙 มืด" : "☀️ สว่าง"}` : "ระบบจะจำโหมดนี้ไว้ให้ครั้งหน้า"}
      </p>
      <div className="my-1 h-px bg-line" />
      <p className="px-3 pb-1 pt-1 text-[12px] text-ink-soft">✨ เอฟเฟกต์บรรยากาศ</p>
      <div className="no-scrollbar max-h-64 overflow-y-auto">
      {fx.effects.map((e) => {
        const on = fx.ready && fx.effect === e.id && !fx.reduced;
        return (
          <button
            key={e.id}
            type="button"
            role="menuitemradio"
            aria-checked={on}
            onClick={() => { fx.choose(e.id); onPicked?.(); }}
            disabled={fx.reduced && e.id !== "none"}
            className={cn("flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[15px] transition-colors disabled:opacity-50", on ? "bg-sky-soft font-medium text-purple-800" : "text-ink hover:bg-purple-50")}
          >
            <span className="w-6 shrink-0 text-center">{e.emoji}</span>
            <span className="min-w-0 flex-1 truncate">{e.label}</span>
            {on && <Check size={16} className="shrink-0 text-purple-600" />}
          </button>
        );
      })}
      </div>
      {fx.reduced && <p className="px-3 pb-1 text-[11px] leading-snug text-ink-soft">อุปกรณ์นี้ตั้งค่า “ลดการเคลื่อนไหว” ไว้ จึงไม่เล่นเอฟเฟกต์</p>}
      <div className="my-1 h-px bg-line" />
      <Link href="/settings" onClick={onPicked} className="flex items-center gap-2 rounded-xl px-3 py-2 text-[14px] text-purple-700 hover:bg-purple-50">
        <span className="w-6 shrink-0 text-center">⚙️</span> เปิดหน้าตั้งค่าทั้งหมด
      </Link>
    </div>
  );
}

/** สวิตช์เปิด/ปิดเล็ก ๆ */
export function Switch({ on }: { on: boolean }) {
  return (
    <span className={cn("relative inline-block h-5 w-9 shrink-0 rounded-full transition-colors", on ? "bg-purple-600" : "bg-line")}>
      <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow-soft transition-all", on ? "left-[18px]" : "left-0.5")} />
    </span>
  );
}
