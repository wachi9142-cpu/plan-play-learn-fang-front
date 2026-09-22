"use client";

import type { SyncMessage } from "@/types/canvas";

/**
 * ซิงก์ห้องวาดร่วมกันแบบ real-time
 * 1) WebSocket relay (server/canvas-ws.mjs) — ใช้ข้ามเครื่อง/มือถือใน LAN หรือบนเซิร์ฟเวอร์จริง
 *    ตั้งค่า NEXT_PUBLIC_CANVAS_WS=wss://… หรือปล่อยว่างจะลอง ws://<host ของเว็บ>:3003
 * 2) BroadcastChannel — สำรอง: ซิงก์ระหว่างแท็บในเครื่องเดียวกันเมื่อไม่มีเซิร์ฟเวอร์
 */
export type SyncMode = "ws" | "local" | "connecting";

export interface CanvasSync {
  send: (m: SyncMessage) => void;
  close: () => void;
  mode: () => SyncMode;
}

export function wsUrl() {
  const env = process.env.NEXT_PUBLIC_CANVAS_WS;
  if (env) return env;
  if (typeof window === "undefined") return "";
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.hostname}:3003`;
}

export function connectRoom(room: string, onMessage: (m: SyncMessage) => void, onMode?: (m: SyncMode) => void): CanvasSync {
  let mode: SyncMode = "connecting";
  let ws: WebSocket | null = null;
  let bc: BroadcastChannel | null = null;
  let closed = false;
  const setMode = (m: SyncMode) => { mode = m; onMode?.(m); };

  const useLocal = () => {
    if (bc || closed) return;
    try {
      bc = new BroadcastChannel(`lpg-canvas-${room}`);
      bc.onmessage = (e) => onMessage(e.data as SyncMessage);
      setMode("local");
    } catch { setMode("local"); }
  };

  const tryWs = () => {
    const url = wsUrl();
    if (!url || closed) return useLocal();
    try {
      ws = new WebSocket(`${url}${url.includes("?") ? "&" : "?"}room=${encodeURIComponent(room)}`);
    } catch { return useLocal(); }
    const timeout = setTimeout(() => { if (ws && ws.readyState !== WebSocket.OPEN) { ws.close(); } }, 2500);
    ws.onopen = () => { clearTimeout(timeout); setMode("ws"); bc?.close(); bc = null; };
    ws.onmessage = (e) => { try { onMessage(JSON.parse(e.data as string) as SyncMessage); } catch { /* ข้าม */ } };
    ws.onerror = () => { /* onclose จะจัดการ */ };
    ws.onclose = () => { clearTimeout(timeout); ws = null; if (closed) return; useLocal(); setTimeout(() => { if (!closed) tryWs(); }, 8000); };
  };
  tryWs();

  return {
    send: (m) => { if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(m)); else bc?.postMessage(m); },
    close: () => { closed = true; ws?.close(); bc?.close(); },
    mode: () => mode,
  };
}
