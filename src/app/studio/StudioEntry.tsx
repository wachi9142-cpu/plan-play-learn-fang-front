"use client";

import { useSearchParams } from "next/navigation";
import type { DocType } from "@/types";
import { StudioHome } from "@/components/studio";

/** อ่าน ?type=plan|schedule|other เพื่อเปิดตัวเลือกสร้างเอกสารทันที */
export function StudioEntry() {
  const t = useSearchParams().get("type");
  const ALL: DocType[] = ["plan", "schedule", "worksheet", "media", "slides", "sheet", "other"];
  const preset = t && (ALL as string[]).includes(t) ? (t as DocType) : undefined;
  return <StudioHome presetType={preset} />;
}
