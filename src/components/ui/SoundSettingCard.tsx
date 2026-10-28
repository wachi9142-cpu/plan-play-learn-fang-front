"use client";

import { useEffect, useState } from "react";
import { SFX_EVENT, playSfx, setSfxOn, sfxOn } from "@/lib/sfx";
import { Switch } from "@/components/theme/ThemeMenuPanel";

/**
 * 🔊 เปิด–ปิดเสียงเอฟเฟกต์ในเกมทั้งเว็บ — ใช้ค่าเดียวกับปุ่มเสียงในแต่ละเกม
 * (ปุ่มอ่านออกเสียงคำสั่งยังกดฟังได้เสมอ เพราะผู้ใช้กดเองทุกครั้ง)
 */
export function SoundSettingCard() {
  const [on, setOn] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const read = () => setOn(sfxOn());
    read();
    setReady(true);
    window.addEventListener(SFX_EVENT, read);
    window.addEventListener("storage", read);
    return () => { window.removeEventListener(SFX_EVENT, read); window.removeEventListener("storage", read); };
  }, []);

  const toggle = () => {
    const next = !on;
    setSfxOn(next);
    setOn(next);
    if (next) playSfx("correct"); // ให้ได้ยินตัวอย่างทันทีว่าเสียงกลับมาแล้ว
  };

  return (
    <div className="card flex items-center gap-3 p-4">
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-purple-50 text-2xl">{on ? "🔊" : "🔇"}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[16px] text-purple-800">เสียงเอฟเฟกต์ในเกม</span>
        <span className="mt-0.5 block text-[13px] leading-snug text-ink-soft">
          {on ? "เปิดอยู่ — ตอบถูก ได้ดาว และจบเกมจะมีเสียงเบา ๆ" : "ปิดอยู่ — ทุกเกมจะเงียบ เหมาะกับห้องเรียนหรือตอนกลางคืน"}
        </span>
      </span>
      <button type="button" role="switch" aria-checked={on} aria-label={on ? "ปิดเสียงเอฟเฟกต์ในเกม" : "เปิดเสียงเอฟเฟกต์ในเกม"} onClick={toggle}>
        <Switch on={ready && on} />
      </button>
    </div>
  );
}
