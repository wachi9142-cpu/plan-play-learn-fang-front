"use client";

import { useEffect, useState } from "react";
import { Snowflake } from "./Snowflake";
import { useWinter } from "./useWinter";

/**
 * ❄️ หิมะของ Little Purple Garden
 * - ใช้ CSS animation ล้วน (compositor) ไม่แตะ JS ทุกเฟรม จึงไม่ทำให้เลื่อนหน้าหรือกดปุ่มช้า
 * - pointer-events: none ทั้งชั้น — คลิกทะลุไปยังปุ่ม/เมนูได้ตามปกติ
 * - ปิดโหมดแล้วค่อย ๆ จางหายก่อนถอดออกจากหน้า
 * - เครื่องที่ตั้ง "ลดการเคลื่อนไหว" ไว้ จะไม่เล่นหิมะเลย
 */

/** ค่าคงที่ (ไม่สุ่มตอน render) เพื่อให้ฝั่งเซิร์ฟเวอร์กับเบราว์เซอร์ตรงกัน แต่ยังดูสุ่มเป็นธรรมชาติ */
const FLAKES = Array.from({ length: 26 }, (_, i) => {
  const r = (n: number) => ((Math.sin((i + 1) * n) + 1) / 2);        // 0–1 แบบคงที่
  return {
    left: +(r(12.9898) * 100).toFixed(2),      // ตำแหน่งแนวนอน %
    size: +(4 + r(78.233) * 7).toFixed(2),     // เกล็ดเล็ก 4px – กลาง 11px
    fall: +(11 + r(43.123) * 12).toFixed(2),   // ตกช้า–เร็วไม่เท่ากัน (วินาที)
    delay: +(-r(93.719) * 22).toFixed(2),      // เริ่มไม่พร้อมกัน (ติดลบ = ตกค้างกลางทางตั้งแต่แรก)
    drift: +(6 + r(27.611) * 26).toFixed(2),   // ระยะเอียงซ้าย–ขวา (px)
    sway: +(3 + r(61.077) * 4).toFixed(2),     // จังหวะการส่าย (วินาที)
    opacity: +(0.35 + r(11.337) * 0.45).toFixed(2),
    lavender: i % 4 === 0,                     // บางเกล็ดออกโทนม่วงอ่อนให้เข้ากับสวน
    crystal: i % 3 === 0,                      // 1 ใน 3 เป็นเกล็ดหิมะ 6 แฉก ที่เหลือเป็นเม็ดหิมะนุ่ม ๆ
    spin: +(9 + r(55.281) * 12).toFixed(2),    // เกล็ดคริสตัลค่อย ๆ หมุนระหว่างตก
  };
});

export function Snowfall() {
  const { on, ready, reduced } = useWinter();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ready || reduced) { setVisible(false); setMounted(false); return; }
    if (on) {
      setMounted(true);
      const t = window.setTimeout(() => setVisible(true), 20);   // เฟดเข้า
      return () => window.clearTimeout(t);
    }
    setVisible(false);
    const t = window.setTimeout(() => setMounted(false), 700);   // เฟดออกให้จบก่อนค่อยถอดออก
    return () => window.clearTimeout(t);
  }, [on, ready, reduced]);

  if (!mounted) return null;

  return (
    <div className="snowfall no-print" data-visible={visible ? "on" : "off"} aria-hidden>
      {FLAKES.map((f, i) => (
        <span
          key={i}
          className="snow-fall"
          style={{
            left: `${f.left}%`,
            animationDuration: `${f.fall}s`,
            animationDelay: `${f.delay}s`,
          }}
        >
          <span
            className="snow-sway"
            style={{
              width: `${f.crystal ? f.size + 6 : f.size}px`,
              height: `${f.crystal ? f.size + 6 : f.size}px`,
              opacity: f.crystal ? Math.min(0.95, f.opacity + 0.2) : f.opacity,
              animationDuration: `${f.sway}s`,
              ["--drift" as string]: `${f.drift}px`,
              ...(f.crystal
                ? {}
                : {
                    borderRadius: "50%",
                    background: f.lavender
                      ? "radial-gradient(circle at 34% 30%, #ffffff 0%, #ece0f8 58%, rgba(217,195,241,0) 100%)"
                      : "radial-gradient(circle at 34% 30%, #ffffff 0%, #ffffff 52%, rgba(255,255,255,0) 100%)",
                  }),
            }}
          >
            {f.crystal && <Snowflake id={String(i)} className="snow-spin block size-full" style={{ animationDuration: `${f.spin}s` }} />}
          </span>
        </span>
      ))}
    </div>
  );
}
