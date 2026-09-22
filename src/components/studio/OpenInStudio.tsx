"use client";

import { useRouter } from "next/navigation";
import { PenLine } from "lucide-react";
import type { DocType } from "@/types";
import { createDoc } from "@/lib/studio-store";

/** ปุ่ม "สร้าง/แก้ไขใน Garden Studio" — สร้างเอกสารที่ดึงข้อมูลจากแผน/กำหนดการมาให้ */
export function OpenInStudio({ type, planId, scheduleId, label }: { type: DocType; planId?: string; scheduleId?: string; label?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push(`/studio/${createDoc(type, { planId, scheduleId }).id}`)}
      className="tap inline-flex items-center gap-2 rounded-full border-2 border-purple-200 bg-white px-4 py-2 text-[14px] font-medium text-purple-700 transition hover:border-purple-300 hover:bg-purple-50"
    >
      <PenLine size={16} /> {label ?? "🌱 แก้ไขใน Garden Studio"}
    </button>
  );
}
