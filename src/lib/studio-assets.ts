"use client";

import type { StudioAsset } from "@/types";
import { uid } from "./studio-store";

/** ที่เก็บรูป/ไฟล์แนบของ Garden Studio ใน IndexedDB (รองรับไฟล์ใหญ่กว่า localStorage) */
const DB = "lpg-studio";
const STORE = "assets";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const s = db.createObjectStore(STORE, { keyPath: "id" });
        s.createIndex("docId", "docId");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T> | IDBRequest): Promise<T> {
  return open().then((db) => new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const r = fn(t.objectStore(STORE));
    r.onsuccess = () => resolve(r.result as T);
    r.onerror = () => reject(r.error);
  }));
}

export async function addAsset(docId: string, file: File): Promise<StudioAsset> {
  const asset: StudioAsset = {
    id: uid(), docId, name: file.name, mime: file.type || "application/octet-stream", size: file.size,
    kind: file.type.startsWith("image/") ? "image" : "file", createdAt: new Date().toISOString(), blob: file,
  };
  await tx("readwrite", (s) => s.put(asset));
  window.dispatchEvent(new CustomEvent("lpg-assets-change", { detail: docId }));
  return asset;
}

export async function listAssets(docId: string): Promise<StudioAsset[]> {
  const all = await tx<StudioAsset[]>("readonly", (s) => s.index("docId").getAll(docId));
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const getAsset = (id: string) => tx<StudioAsset | undefined>("readonly", (s) => s.get(id));

export async function removeAsset(id: string, docId: string) {
  await tx("readwrite", (s) => s.delete(id));
  window.dispatchEvent(new CustomEvent("lpg-assets-change", { detail: docId }));
}

export async function removeAssetsOfDoc(docId: string) {
  const all = await listAssets(docId);
  for (const a of all) await tx("readwrite", (s) => s.delete(a.id));
}

/** ทำสำเนา asset ทั้งหมดไปยังเอกสารใหม่ (ใช้ตอน duplicate) คืน map oldId→newId */
export async function copyAssets(fromDocId: string, toDocId: string): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  for (const a of await listAssets(fromDocId)) {
    const copy: StudioAsset = { ...a, id: uid(), docId: toDocId, createdAt: new Date().toISOString() };
    await tx("readwrite", (s) => s.put(copy));
    map[a.id] = copy.id;
  }
  return map;
}

export const fmtSize = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export const fileEmoji = (mime: string, name = "") => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (mime.startsWith("image/")) return "🖼️";
  if (mime.includes("pdf") || ext === "pdf") return "📕";
  if (mime.includes("word") || ["doc", "docx"].includes(ext)) return "📘";
  if (mime.includes("presentation") || ["ppt", "pptx"].includes(ext)) return "📙";
  if (mime.includes("sheet") || ["xls", "xlsx", "csv"].includes(ext)) return "📗";
  return "📄";
};
