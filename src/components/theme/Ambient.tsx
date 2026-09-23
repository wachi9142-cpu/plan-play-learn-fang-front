"use client";

import { useEffect, useState } from "react";
import { SCENES } from "./AmbientScenes";
import { useAmbient } from "./useAmbient";

/**
 * ✨ ชั้นเอฟเฟกต์บรรยากาศของ Little Purple Garden
 * - เปิดได้ทีละ 1 อย่าง: ❄️ หิมะ · 🌠 แสงดาว · 🌸 กลีบดอกไม้ · 🍂 ใบไม้ร่วง
 * - CSS animation ล้วน (transform/opacity) ไม่แตะ JS ทุกเฟรม จึงไม่ทำให้เลื่อนหน้าหรือกดปุ่มช้า
 * - pointer-events: none ทั้งชั้น · z-index 20 (ใต้แถบเมนู 40 และ popup 50)
 * - ปิดแล้วค่อย ๆ จางหายก่อนถอดออกจากหน้า · เครื่องที่ตั้ง "ลดการเคลื่อนไหว" ไว้จะไม่เล่นเลย
 */

export function Ambient() {
  const { effect, ready, reduced } = useAmbient();
  const [shown, setShown] = useState<string>("none");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ready || reduced || effect === "none" || !SCENES[effect]) {
      setVisible(false);
      const t = window.setTimeout(() => setShown("none"), 700); // เฟดออกให้จบก่อนค่อยถอดออก
      return () => window.clearTimeout(t);
    }
    setShown(effect);
    const t = window.setTimeout(() => setVisible(true), 20); // เฟดเข้า
    return () => window.clearTimeout(t);
  }, [effect, ready, reduced]);

  if (shown === "none") return null;
  const Scene = SCENES[shown];

  return (
    <div className={`fx-layer no-print fx-${shown}`} data-visible={visible ? "on" : "off"} aria-hidden>
      <Scene />
    </div>
  );
}
