"use client";

import { useEffect, useRef, useState } from "react";

const A4_W = 794; // 210mm @ 96dpi
const A4_H = 1123;

/** ย่อหน้า A4 ให้พอดีความกว้างของกล่อง (สำหรับดูตัวอย่างบนมือถือ/แท็บเล็ต) */
export function SheetScaler({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / A4_W));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full overflow-hidden">
      <div style={{ height: A4_H * scale }}>
        <div style={{ width: A4_W, transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
      </div>
    </div>
  );
}
