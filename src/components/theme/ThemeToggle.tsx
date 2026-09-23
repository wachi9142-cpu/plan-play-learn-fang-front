"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { THEME_MODES } from "@/lib/theme";
import { cn } from "@/lib/cn";
import { ThemeMenuPanel } from "./ThemeMenuPanel";
import { useTheme } from "./useTheme";

const ICON = { light: Sun, dark: Moon, system: Monitor } as const;

/** 💜 ปุ่มเล็ก ๆ บนแถบบนสุด — กดแล้วเลือก ☀️ / 🌙 / ⚙️ */
export function ThemeToggle({ className }: { className?: string }) {
  const { mode, ready } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  // ก่อนอ่านค่าจากเครื่องเสร็จ แสดงช่องว่างขนาดเท่ากันไว้ก่อน กันหน้าเด้ง
  const Icon = ready ? ICON[mode] : Sun;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`ธีมการแสดงผล — ตอนนี้ ${ready ? THEME_MODES.find((m) => m.id === mode)!.label : "กำลังโหลด"}`}
        title="ธีมการแสดงผล"
        className="tap grid place-items-center rounded-xl border border-line bg-white text-purple-700 transition-colors hover:bg-purple-50"
      >
        <span className={cn("transition-opacity", !ready && "opacity-0")}><Icon size={19} /></span>
      </button>

      <div
        role="menu"
        className={cn(
          "absolute right-0 top-full z-50 w-64 pt-2 transition-all duration-150",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
        )}
      >
        <div className="card overflow-hidden p-1.5">
          <ThemeMenuPanel onPicked={() => setOpen(false)} />
        </div>
      </div>
    </div>
  );
}
