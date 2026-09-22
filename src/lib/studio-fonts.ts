"use client";

import { uid } from "./studio-store";

/**
 * 🔤 ฟอนต์ของ Garden Studio
 * - ฟอนต์แนะนำ: โหลดจาก Google Fonts (ไทย/อังกฤษ)
 * - ฟอนต์ของฉัน: ผู้ใช้อัปโหลด .ttf/.otf/.woff/.woff2 → ตรวจสอบด้วย FontFace → เก็บใน IndexedDB → ลงทะเบียนให้ทั้งเว็บใช้ได้
 */
export interface UserFont { id: string; name: string; family: string; mime: string; size: number; createdAt: string; blob: Blob }

export const RECOMMENDED_FONTS: { label: string; family: string; google?: string }[] = [
  { label: "Sarabun", family: "var(--font-sarabun), Sarabun, sans-serif" },
  { label: "Mitr", family: "var(--font-mitr), Mitr, sans-serif" },
  { label: "Noto Sans Thai", family: "'Noto Sans Thai', sans-serif", google: "Noto+Sans+Thai:wght@400;500;700" },
  { label: "Prompt", family: "Prompt, sans-serif", google: "Prompt:wght@400;500;700" },
  { label: "Kanit", family: "Kanit, sans-serif", google: "Kanit:wght@400;500;700" },
  { label: "Mali (ลายมือน่ารัก)", family: "Mali, cursive", google: "Mali:wght@400;500;700" },
  { label: "Itim (น่ารัก)", family: "Itim, cursive", google: "Itim" },
  { label: "Chakra Petch", family: "'Chakra Petch', sans-serif", google: "Chakra+Petch:wght@400;500;700" },
];

/** โหลด Google Fonts ที่แนะนำ (ครั้งเดียว) */
export function ensureGoogleFonts() {
  if (typeof document === "undefined" || document.getElementById("lpg-google-fonts")) return;
  const fams = RECOMMENDED_FONTS.filter((f) => f.google).map((f) => `family=${f.google}`).join("&");
  const link = document.createElement("link");
  link.id = "lpg-google-fonts";
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?${fams}&display=swap`;
  document.head.appendChild(link);
}

/* ---------- IndexedDB (ใช้ DB เดียวกับ assets, store แยก) ---------- */
const DB = "lpg-studio";
const STORE = "fonts";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 2);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("assets")) db.createObjectStore("assets", { keyPath: "id" }).createIndex("docId", "docId");
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return open().then((db) => new Promise<T>((resolve, reject) => {
    const r = fn(db.transaction(STORE, mode).objectStore(STORE));
    r.onsuccess = () => resolve(r.result as T);
    r.onerror = () => reject(r.error);
  }));
}

const registered = new Set<string>();

async function register(f: UserFont) {
  if (registered.has(f.id)) return;
  const face = new FontFace(f.family, await f.blob.arrayBuffer());
  await face.load();
  document.fonts.add(face);
  registered.add(f.id);
}

export async function listFonts(): Promise<UserFont[]> {
  try {
    const all = await tx<UserFont[]>("readonly", (s) => s.getAll());
    await Promise.all(all.map((f) => register(f).catch(() => {})));
    return all.sort((a, b) => a.name.localeCompare(b.name));
  } catch { return []; }
}

const OK_EXT = ["ttf", "otf", "woff", "woff2"];

/** เพิ่มฟอนต์จากไฟล์ — ตรวจนามสกุล + ทดลองโหลดด้วย FontFace ก่อนเก็บ */
export async function addFont(file: File): Promise<UserFont> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!OK_EXT.includes(ext)) throw new Error("รองรับเฉพาะไฟล์ .ttf .otf .woff .woff2");
  if (file.size > 15 * 1024 * 1024) throw new Error("ไฟล์ฟอนต์ใหญ่เกิน 15 MB");
  const name = file.name.replace(/\.[^.]+$/, "");
  const family = `LPG-${name.replace(/[^a-zA-Z0-9ก-๙_-]/g, "")}-${uid().slice(0, 4)}`;
  const buf = await file.arrayBuffer();
  const face = new FontFace(family, buf);
  try { await face.load(); } catch { throw new Error("ไฟล์ฟอนต์เสียหรือไม่รองรับ"); }
  document.fonts.add(face);
  const f: UserFont = { id: uid(), name, family, mime: file.type, size: file.size, createdAt: new Date().toISOString(), blob: file };
  await tx("readwrite", (s) => s.put(f));
  registered.add(f.id);
  window.dispatchEvent(new Event("lpg-fonts-change"));
  return f;
}

export async function removeFont(id: string) {
  await tx("readwrite", (s) => s.delete(id));
  window.dispatchEvent(new Event("lpg-fonts-change"));
}
