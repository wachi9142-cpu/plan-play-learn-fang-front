"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CanvasDoc } from "@/types/canvas";
import { createCanvas, getCanvas, getCanvasByRoom } from "@/lib/canvas-store";
import { EmptyState } from "@/components/ui";
import { CanvasEditor } from "./CanvasEditor";

/** เปิดกระดาษจากเครื่อง (id) หรือเข้าห้องด้วยรหัส (สร้างสำเนาในเครื่องถ้ายังไม่มี) */
export function CanvasLoader({ id, room }: { id?: string; room?: string }) {
  const [doc, setDoc] = useState<CanvasDoc | null | undefined>(undefined);
  useEffect(() => {
    if (room) setDoc(getCanvasByRoom(room) ?? createCanvas({ room, title: "มาวาดด้วยกัน 🎨" }));
    else if (id) setDoc(getCanvas(id) ?? null);
  }, [id, room]);

  if (doc === undefined) return <div className="container-page py-16 text-center text-ink-soft">กำลังเปิดกระดาษ…</div>;
  if (doc === null) {
    return (
      <div className="container-page py-16">
        <EmptyState emoji="🎨" title="ไม่พบกระดาษนี้ในเครื่อง" hint="กระดาษเก็บในเบราว์เซอร์ที่วาด — ถ้าเป็นห้องวาดร่วมกัน ให้เปิดด้วยลิงก์/รหัสห้องแทน" />
        <div className="mt-4 text-center"><Link href="/canvas" className="text-purple-700 hover:underline">← กลับ Garden Canvas</Link></div>
      </div>
    );
  }
  return <CanvasEditor key={doc.id} initial={doc} />;
}
