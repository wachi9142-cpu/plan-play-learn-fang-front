import type { Scene } from "@/components/games/engines/SpotDiffGame";
import { SPOT_CATEGORIES, allScenes } from "./spot-diff";
import { customScenes } from "@/lib/spot-store";

/**
 * เลือกฉากตามหมวด และตัดจำนวนจุดต่างให้พอดีกับระดับความยาก
 * ฉากไหนมีจุดต่างน้อยกว่าที่ขอ ก็ใช้เท่าที่มี
 */
export function scenesFor(categoryId?: string, diffs?: number): Scene[] {
  // ฉากตั้งต้น + ฉากที่ครูสร้างเองจากหลังบ้าน
  const base = categoryId
    ? [...(SPOT_CATEGORIES.find((c) => c.id === categoryId)?.scenes ?? []), ...customScenes(categoryId)]
    : [...allScenes(), ...SPOT_CATEGORIES.flatMap((c) => customScenes(c.id))];
  if (!diffs) return base;
  return base.map((s) => ({ ...s, diffs: s.diffs.slice(0, Math.max(2, Math.min(diffs, s.diffs.length))) }));
}
