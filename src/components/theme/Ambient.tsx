"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isActivityPath } from "@/lib/activity-mode";
import { findEffect } from "@/lib/ambient-effects";
import { SCENES } from "./AmbientScenes";
import { useAmbient } from "./useAmbient";
import { useTheme } from "./useTheme";

/**
 * ✨ ชั้นเอฟเฟกต์บรรยากาศของ Little Purple Garden
 * - เปิดได้ทีละ 1 อย่าง: ❄️ หิมะ · 🌠 แสงดาว · 🌸 กลีบดอกไม้ · 🍂 ใบไม้ร่วง
 * - CSS animation ล้วน (transform/opacity) ไม่แตะ JS ทุกเฟรม จึงไม่ทำให้เลื่อนหน้าหรือกดปุ่มช้า
 * - pointer-events: none ทั้งชั้น · z-index 20 (ใต้แถบเมนู 40 และ popup 50)
 * - ปิดแล้วค่อย ๆ จางหายก่อนถอดออกจากหน้า · เครื่องที่ตั้ง "ลดการเคลื่อนไหว" ไว้จะไม่เล่นเลย
 * - 🎯 Activity Mode: หน้าที่ต้องวาด เขียน ลาก พิมพ์ เล่นเกม หรือเรียนออนไลน์ จะปิดเอฟเฟกต์ให้อัตโนมัติ
 *   (ดูรายการหน้าได้ที่ src/lib/activity-mode.ts — ธีมสว่าง/มืดยังทำงานตามปกติ)
 */

export function Ambient() {
  const { effect, ready, reduced } = useAmbient();
  const { resolved } = useTheme();
  const pathname = usePathname();
  // เอฟเฟกต์บางอย่าง (🌌 สวนหิ่งห้อย) สวยเฉพาะบนพื้นมืด — ไม่เปลี่ยนธีมให้เอง แค่ไม่เล่น
  const needsDark = ready && effect !== "none" && findEffect(effect).darkOnly === true && resolved !== "dark";
  const activity = isActivityPath(pathname);
  const [shown, setShown] = useState<string>("none");
  const [visible, setVisible] = useState(false);

  // บอกให้ทั้งหน้ารู้ว่าอยู่ในโหมดทำกิจกรรม — CSS หรือคอมโพเนนต์อื่นใช้ต่อได้
  useEffect(() => {
    document.documentElement.dataset.activity = activity ? "on" : "off";
  }, [activity]);

  useEffect(() => {
    if (!ready || reduced || activity || needsDark || effect === "none" || !SCENES[effect]) {
      setVisible(false);
      const t = window.setTimeout(() => setShown("none"), 700); // เฟดออกให้จบก่อนค่อยถอดออก
      return () => window.clearTimeout(t);
    }
    setShown(effect);
    const t = window.setTimeout(() => setVisible(true), 20); // เฟดเข้า
    return () => window.clearTimeout(t);
  }, [effect, ready, reduced, activity, needsDark]);

  if (shown === "none") return null;
  const Scene = SCENES[shown];

  return (
    <div className={`fx-layer no-print fx-${shown}`} data-visible={visible ? "on" : "off"} aria-hidden>
      <Scene />
    </div>
  );
}
