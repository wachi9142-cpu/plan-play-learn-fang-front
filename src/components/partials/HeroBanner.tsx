"use client";

import { useEffect, useState } from "react";

/**
 * พื้นที่ภาพแบนเนอร์กว้างบนหน้าแรก
 * วางรูปไว้ที่ public/hero-banner.jpg (แนะนำ ~2000×800 px) ระบบจะแสดงอัตโนมัติ
 * ถ้ายังไม่มีไฟล์ จะแสดงพื้นที่ว่างสีม่วงอ่อนไว้ก่อน
 */
export function HeroBanner({ src = "/hero-banner.jpg" }: { src?: string }) {
  // ตรวจว่ามีไฟล์รูปไหมหลัง mount (กัน onError ยิงก่อน hydrate)
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setReady(true);
    img.src = src;
  }, [src]);

  return (
    <div className="container-page pt-4 sm:pt-6">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-purple-100 via-pink-soft to-yellow-soft shadow-soft sm:aspect-[21/9] lg:aspect-[3/1]">
        {ready ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="Little Purple Garden" className="size-full object-cover" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-center">
            <div className="text-5xl sm:text-6xl" aria-hidden>🌷🧒🎨🐰🌳</div>
            <p className="font-display text-lg text-purple-700 sm:text-2xl">พื้นที่สำหรับภาพแบนเนอร์</p>
            <p className="text-[13px] text-ink-soft sm:text-sm">วางรูปไว้ที่ <code className="rounded bg-white/70 px-1.5 py-0.5">public/hero-banner.jpg</code> แล้วภาพจะแสดงตรงนี้</p>
          </div>
        )}
      </div>
    </div>
  );
}
