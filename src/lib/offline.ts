"use client";

import { useEffect, useState } from "react";
import { GAME_EVENT, listResults, type GameResult } from "./game-store";
import type { Difficulty } from "./game-levels";

/**
 * 📴 ระบบออนไลน์/ออฟไลน์ของเกม — PWA (public/sw.js)
 * - ดาวน์โหลดเกม 1 ครั้ง → หน้าเกม + ไฟล์ที่ต้องใช้ถูกแคชในเครื่อง จนกว่าผู้ใช้จะกดลบ
 * - ผลการเล่นบันทึกในเครื่องก่อนเสมอ → ซิงก์ขึ้นบัญชีเมื่อออนไลน์ (NEXT_PUBLIC_GAME_API) · ถ้ายังไม่มี backend = local-only
 */
export interface OfflineGame { gameId: string; level?: Difficulty; downloadedAt: string; size: number; files: string[] }
const KEY = "lpg-offline-games-v1";
export const OFFLINE_EVENT = "lpg-offline-change";
const read = (): OfflineGame[] => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const write = (v: OfflineGame[]) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* */ } window.dispatchEvent(new Event(OFFLINE_EVENT)); };
export const listOffline = read;
export const isOffline = (gameId: string) => read().some((g) => g.gameId === gameId);

export const swSupported = () => typeof navigator !== "undefined" && "serviceWorker" in navigator;
export async function registerSW() {
  if (!swSupported()) return null;
  try { return await navigator.serviceWorker.register("/sw.js", { scope: "/" }); } catch { return null; }
}
async function swReady() { if (!swSupported()) return null; await registerSW(); const reg = await navigator.serviceWorker.ready; return reg.active; }

/** ดึง URL ของสคริปต์/สไตล์/รูป ที่หน้าเกมต้องใช้ จาก HTML ของหน้านั้น */
async function assetsOf(path: string): Promise<string[]> {
  const html = await fetch(path, { cache: "no-cache" }).then((r) => r.text());
  const urls = new Set<string>([path]);
  for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const u = m[1];
    if (u.startsWith("/_next/static/") || /\.(css|js|woff2?|ttf|png|jpg|webp|svg|ico)(\?|$)/.test(u)) urls.add(u.split("#")[0]);
  }
  return Array.from(urls);
}

/** 📥 ดาวน์โหลดเกมไว้เล่นออฟไลน์ (หน้าเกม + คลังเกม + ไฟล์) */
export async function downloadGame(gameId: string, level?: Difficulty): Promise<{ ok: boolean; size: number; message: string }> {
  const sw = await swReady();
  if (!sw) return { ok: false, size: 0, message: "เบราว์เซอร์นี้ไม่รองรับการเก็บเกมไว้ในเครื่อง (ต้องเปิดผ่าน https:// หรือ localhost)" };
  const files = Array.from(new Set([...(await assetsOf(`/games/${gameId}`)), ...(await assetsOf("/games")), "/logo-lpg.webp", "/manifest.webmanifest"]));
  const id = Math.random().toString(36).slice(2);
  const res = await new Promise<{ size: number; ok: number; total: number }>((resolve) => {
    const h = (e: MessageEvent) => { if (e.data?.type === "CACHED" && e.data.id === id) { navigator.serviceWorker.removeEventListener("message", h); resolve(e.data); } };
    navigator.serviceWorker.addEventListener("message", h);
    sw.postMessage({ type: "CACHE_URLS", id, urls: files });
    setTimeout(() => { navigator.serviceWorker.removeEventListener("message", h); resolve({ size: 0, ok: 0, total: files.length }); }, 60000);
  });
  if (res.ok === 0) return { ok: false, size: 0, message: "ดาวน์โหลดไม่สำเร็จ ลองใหม่เมื่อมีอินเทอร์เน็ต" };
  const all = read().filter((g) => g.gameId !== gameId);
  all.unshift({ gameId, level, downloadedAt: new Date().toISOString(), size: res.size, files });
  write(all);
  return { ok: true, size: res.size, message: "เก็บเกมไว้ในเครื่องแล้ว เล่นได้แม้ไม่มีอินเทอร์เน็ต 📴" };
}
export async function removeOfflineGame(gameId: string) {
  const g = read().find((x) => x.gameId === gameId);
  write(read().filter((x) => x.gameId !== gameId));
  const sw = await swReady();
  if (sw && g) { const shared = new Set(read().flatMap((x) => x.files)); sw.postMessage({ type: "UNCACHE_URLS", id: gameId, urls: g.files.filter((f) => !shared.has(f)) }); }
}
export function setOfflineLevel(gameId: string, level?: Difficulty) { write(read().map((g) => (g.gameId === gameId ? { ...g, level } : g))); }
export const fmtMB = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/* ---------- 🔄 ซิงก์ผลการเล่น ---------- */
export type SyncState = "online" | "syncing" | "offline" | "synced" | "local";
const KEY_SYNC = "lpg-game-synced";
const synced = (): Set<string> => { try { return new Set(JSON.parse(localStorage.getItem(KEY_SYNC) || "[]")); } catch { return new Set(); } };
export const unsyncedResults = (): GameResult[] => { const s = synced(); return listResults().filter((r) => !s.has(r.id)); };

/** ส่งผลที่ยังไม่ซิงก์ขึ้นบัญชี — ถ้าไม่มี API (ยังไม่มี backend) จะถือว่าเก็บในเครื่อง (local) */
export async function syncResults(): Promise<{ state: SyncState; count: number }> {
  const pending = unsyncedResults();
  if (!navigator.onLine) return { state: "offline", count: pending.length };
  const api = process.env.NEXT_PUBLIC_GAME_API;
  if (!api) return { state: "local", count: pending.length };
  if (pending.length === 0) return { state: "synced", count: 0 };
  try {
    const r = await fetch(`${api}/results`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pending) });
    if (!r.ok) throw new Error();
    const s = synced(); pending.forEach((p) => s.add(p.id)); localStorage.setItem(KEY_SYNC, JSON.stringify(Array.from(s)));
    window.dispatchEvent(new Event(OFFLINE_EVENT));
    return { state: "synced", count: pending.length };
  } catch { return { state: "offline", count: pending.length }; }
}

/** สถานะ 🟢 ออนไลน์ / 🟠 กำลังซิงก์ / 🔴 ออฟไลน์ + จำนวนที่รอซิงก์ */
export function useNetStatus() {
  const [online, setOnline] = useState(true);
  const [state, setState] = useState<SyncState>("online");
  const [pending, setPending] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    registerSW();
    const run = async () => {
      setOnline(navigator.onLine);
      if (!navigator.onLine) { setState("offline"); setPending(unsyncedResults().length); return; }
      setState("syncing");
      const r = await syncResults();
      setPending(r.count);
      setState(r.state === "synced" || r.state === "local" ? "online" : r.state);
      if (r.state === "synced" && r.count > 0) { setMsg(`🟢 ซิงก์ข้อมูล ${r.count} รายการเรียบร้อย`); setTimeout(() => setMsg(null), 3000); }
    };
    run();
    const onOff = () => { setOnline(false); setState("offline"); setPending(unsyncedResults().length); };
    window.addEventListener("online", run); window.addEventListener("offline", onOff); window.addEventListener(GAME_EVENT, run);
    return () => { window.removeEventListener("online", run); window.removeEventListener("offline", onOff); window.removeEventListener(GAME_EVENT, run); };
  }, []);
  return { online, state, pending, msg };
}
