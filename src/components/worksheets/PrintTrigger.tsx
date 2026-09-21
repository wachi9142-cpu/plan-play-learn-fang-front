"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";

/** หน้าพิมพ์: เปิด dialog พิมพ์อัตโนมัติ (บันทึกเป็น PDF ได้จาก dialog เดียวกัน) */
export function PrintTrigger({ auto = true }: { auto?: boolean }) {
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, [auto]);

  return (
    <div className="no-print mb-4 flex flex-wrap items-center justify-center gap-3 text-[15px]">
      <button type="button" onClick={() => window.print()} className="tap inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 font-medium text-white shadow-soft hover:bg-purple-700">
        <Printer size={18} /> พิมพ์ / บันทึกเป็น PDF
      </button>
      <span className="text-ink-soft">ในหน้าต่างพิมพ์ เลือก “Save as PDF” เพื่อดาวน์โหลดไฟล์</span>
    </div>
  );
}
