"use client";

import type { Scene } from "@/components/games/engines/SpotDiffGame";
import { SPOT_CATEGORIES } from "@/data/spot-diff";

/**
 * 👀 ฉากจับผิดภาพที่ครูสร้างเอง — เก็บใน localStorage `lpg-spot-v1`
 * ฉากตั้งต้นอยู่ใน src/data/spot-diff.ts · ฉากของครูจะต่อท้ายหมวดเดิม
 */
const KEY = "lpg-spot-v1";
export const SPOT_EVENT = "lpg-spot-change";

/** ฉากของครู แยกตามหมวด */
type Store = Record<string, Scene[]>;

const read = (): Store => {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
};

const write = (s: Store) => {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* */ }
  window.dispatchEvent(new Event(SPOT_EVENT));
};

export const customScenes = (categoryId: string): Scene[] => read()[categoryId] ?? [];

/** หมวดทั้งหมด พร้อมฉากตั้งต้น + ฉากที่ครูเพิ่ม */
export function listCategories() {
  const mine = read();
  return SPOT_CATEGORIES.map((c) => ({ ...c, scenes: [...c.scenes, ...(mine[c.id] ?? [])] }));
}

export function saveScene(categoryId: string, scene: Scene) {
  const s = read();
  const list = s[categoryId] ?? [];
  const i = list.findIndex((x) => x.id === scene.id);
  s[categoryId] = i >= 0 ? list.map((x) => (x.id === scene.id ? scene : x)) : [...list, scene];
  write(s);
}

export function removeScene(categoryId: string, sceneId: string) {
  const s = read();
  s[categoryId] = (s[categoryId] ?? []).filter((x) => x.id !== sceneId);
  write(s);
}

export const newSceneId = () => `custom-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

/* 💾 สำรอง / นำกลับเข้ามา */
export function downloadSpotBackup() {
  const name = `spot-diff-${new Date().toISOString().slice(0, 10)}.json`;
  const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, data: read() }, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return name;
}

export function importSpot(text: string): { ok: boolean; message: string } {
  try {
    const v = JSON.parse(text);
    const data = v?.data ?? v;
    if (!data || typeof data !== "object") return { ok: false, message: "ไฟล์นี้ไม่ใช่ไฟล์สำรองฉากจับผิดภาพค่ะ" };
    write(data as Store);
    const n = Object.values(data as Store).reduce((a, x) => a + (x?.length ?? 0), 0);
    return { ok: true, message: `นำเข้าสำเร็จ — ฉากของครู ${n} ฉาก` };
  } catch {
    return { ok: false, message: "อ่านไฟล์ไม่ได้ ลองเลือกไฟล์ .json ที่กดสำรองไว้อีกครั้งนะคะ" };
  }
}
