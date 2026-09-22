"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * ⬅️ ปุ่มย้อนกลับ — กลับไปหน้าที่เพิ่งมา (เช่น จากหน้าเขียนแผน → กระดาษวาดรูป แล้วกดกลับ)
 * ถ้าไม่มีประวัติในแท็บนี้ (เปิดลิงก์ตรง) จะพาไปหน้าที่กำหนดใน `fallback` แทน
 */
export function BackButton({ fallback = "/", label = "ย้อนกลับ", className }: { fallback?: string; label?: string; className?: string }) {
  const router = useRouter();
  const [canBack, setCanBack] = useState(false);
  useEffect(() => { setCanBack(typeof window !== "undefined" && window.history.length > 1); }, []);
  return (
    <button
      type="button"
      onClick={() => (canBack ? router.back() : router.push(fallback))}
      title={label}
      className={cn("tap inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-[14px] text-purple-700 hover:bg-purple-50", className)}
    >
      <ArrowLeft size={16} /> <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
