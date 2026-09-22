"use client";

import type { CanvasDoc, CanvasRole, CanvasTemplateId, Participant, PortfolioItem } from "@/types/canvas";
import { uid } from "./studio-store";

/**
 * 🎨 Garden Canvas — เก็บกระดาษวาดรูป / ผู้ใช้ / แฟ้มผลงาน ใน localStorage
 * (ยังไม่มี backend: ห้องวาดร่วมกันซิงก์ผ่าน canvas-sync.ts)
 */
const KEY = "lpg-canvas-v1";
const KEY_PORT = "lpg-portfolio-v1";
const KEY_ME = "lpg-canvas-me";
const EVT = "lpg-canvas-change";

export const CANVAS_W = 1000;
export const CANVAS_H = 700;

const read = <T>(k: string, def: T): T => { try { const s = localStorage.getItem(k); return s ? (JSON.parse(s) as T) : def; } catch { return def; } };
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* เต็ม/ปิดใช้งาน */ } window.dispatchEvent(new Event(EVT)); };

/* ---------- กระดาษ ---------- */
export const listCanvases = (): CanvasDoc[] => read<CanvasDoc[]>(KEY, []).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
export const getCanvas = (id: string) => read<CanvasDoc[]>(KEY, []).find((c) => c.id === id);
export const getCanvasByRoom = (room: string) => read<CanvasDoc[]>(KEY, []).find((c) => c.room === room);
export function saveCanvas(doc: CanvasDoc) {
  const all = read<CanvasDoc[]>(KEY, []);
  const i = all.findIndex((c) => c.id === doc.id);
  const next = { ...doc, updatedAt: new Date().toISOString() };
  if (i >= 0) all[i] = next; else all.unshift(next);
  write(KEY, all);
  return next;
}
export const deleteCanvas = (id: string) => write(KEY, read<CanvasDoc[]>(KEY, []).filter((c) => c.id !== id));

export function createCanvas(opts: { title?: string; template?: CanvasTemplateId; room?: string; planId?: string; childName?: string } = {}): CanvasDoc {
  const now = new Date().toISOString();
  const tpl = opts.template ?? "blank";
  const doc: CanvasDoc = { id: uid(), title: opts.title ?? defaultTitle(tpl), template: tpl, width: CANVAS_W, height: CANVAS_H, ops: [], room: opts.room, planId: opts.planId, childName: opts.childName, createdAt: now, updatedAt: now };
  return saveCanvas(doc);
}
const defaultTitle = (t: CanvasTemplateId) => ({ blank: "ภาพวาดของหนู", garden: "มาวาดสวนของเรา 🌱", "trace-lines": "ลากเส้นตามรอย", "trace-numbers": "ฝึกเขียนตัวเลข", "trace-letters": "ฝึกเขียนตัวอักษร", "color-in": "เติมสีดอกไม้", house: "บ้านในฝัน", story: "นิทานของเรา" }[t]);

/** รหัสห้อง 6 ตัว อ่านง่าย (ตัด 0/O, 1/I) */
export const newRoomCode = () => { const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let s = ""; for (let i = 0; i < 6; i++) s += A[Math.floor(Math.random() * A.length)]; return s; };

/* ---------- ตัวฉัน (ชื่อ/บทบาท/สี) ---------- */
export const ROLE_LABEL: Record<CanvasRole, string> = { teacher: "ครู", child: "เด็ก", parent: "ผู้ปกครอง" };
export const ROLE_EMOJI: Record<CanvasRole, string> = { teacher: "👩‍🏫", child: "🧒", parent: "👨‍👩‍👧" };
export const MEMBER_COLORS = ["#8b5cf6", "#22c55e", "#eab308", "#ec4899", "#0ea5e9", "#f97316", "#14b8a6", "#ef4444"];

export function getMe(): Participant | null { return read<Participant | null>(KEY_ME, null); }
export function setMe(p: { name: string; role: CanvasRole; color?: string }): Participant {
  const prev = getMe();
  const me: Participant = { id: prev?.id ?? uid(), name: p.name.trim() || "ผู้ร่วมวาด", role: p.role, color: p.color ?? prev?.color ?? MEMBER_COLORS[Math.floor(Math.random() * MEMBER_COLORS.length)], lastSeen: Date.now() };
  write(KEY_ME, me);
  return me;
}

/* ---------- แฟ้มผลงานเด็ก ---------- */
export const listPortfolio = (): PortfolioItem[] => read<PortfolioItem[]>(KEY_PORT, []).sort((a, b) => b.date.localeCompare(a.date));
export const listPublished = () => listPortfolio().filter((p) => p.published);
export function addToPortfolio(item: Omit<PortfolioItem, "id" | "date">): PortfolioItem {
  const all = read<PortfolioItem[]>(KEY_PORT, []);
  const it: PortfolioItem = { ...item, id: uid(), date: new Date().toISOString() };
  all.unshift(it); write(KEY_PORT, all); return it;
}
export function updatePortfolio(id: string, patch: Partial<PortfolioItem>) {
  write(KEY_PORT, read<PortfolioItem[]>(KEY_PORT, []).map((p) => (p.id === id ? { ...p, ...patch } : p)));
}
export const removePortfolio = (id: string) => write(KEY_PORT, read<PortfolioItem[]>(KEY_PORT, []).filter((p) => p.id !== id));

export const CANVAS_EVENT = EVT;
