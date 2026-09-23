"use client";

import { cn } from "@/lib/cn";
import { Switch } from "./ThemeMenuPanel";
import { useWinter } from "./useWinter";

/** ❄️ การ์ดเปิด/ปิดโหมดฤดูหนาวในหน้าตั้งค่า ⚙️ */
export function WinterCard() {
  const { on, ready, reduced, toggle } = useWinter();
  const active = ready && on && !reduced;
  return (
    <button
      type="button"
      onClick={() => toggle()}
      disabled={reduced}
      aria-pressed={active}
      className={cn("card card-hover flex w-full items-center gap-4 p-4 text-left disabled:cursor-not-allowed disabled:opacity-60", active && "border-purple-400! ring-2 ring-purple-300")}
    >
      <span className={cn("grid size-14 shrink-0 place-items-center rounded-2xl text-3xl transition-colors", active ? "bg-sky-soft" : "bg-purple-50")}>❄️</span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[17px] text-purple-800">โหมดฤดูหนาว</span>
        <span className="block text-[13px] leading-snug text-ink-soft">
          {reduced
            ? "อุปกรณ์นี้ตั้งค่า “ลดการเคลื่อนไหว” ไว้ ระบบจึงปิดหิมะให้อัตโนมัติ"
            : "หิมะขาวนวลตกเบา ๆ ทั่วหน้าเว็บ ไม่บังปุ่มหรือตัวหนังสือ — เปิดใช้ได้ทั้งโหมดสว่างและโหมดมืด"}
        </span>
      </span>
      <Switch on={active} />
    </button>
  );
}
