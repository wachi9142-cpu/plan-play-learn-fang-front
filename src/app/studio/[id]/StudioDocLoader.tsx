"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { StudioDoc } from "@/types";
import { getDoc } from "@/lib/studio-store";
import { DocEditor } from "@/components/studio";
import { EmptyState } from "@/components/ui";

/** โหลดเอกสารจากที่เก็บในเครื่อง (client) แล้วเปิดตัวแก้ไข */
export function StudioDocLoader({ id }: { id: string }) {
  const [doc, setDoc] = useState<StudioDoc | null | undefined>(undefined);
  useEffect(() => setDoc(getDoc(id) ?? null), [id]);

  if (doc === undefined) return <div className="container-page py-16 text-center text-ink-soft">กำลังเปิดเอกสาร…</div>;
  if (doc === null) {
    return (
      <div className="container-page py-16">
        <EmptyState emoji="📄" title="ไม่พบเอกสารนี้ในเครื่อง" hint="เอกสารเก็บในเบราว์เซอร์ที่สร้าง — เมื่อเชื่อมบัญชีแล้วจะเปิดได้จากทุกเครื่อง" />
        <div className="mt-4 text-center"><Link href="/studio" className="text-purple-700 hover:underline">← กลับ Garden Studio</Link></div>
      </div>
    );
  }
  return <DocEditor key={doc.id} initial={doc} />;
}
