"use client";

import { useEffect, useState } from "react";

/**
 * 👩‍🏫 บัญชีครู (ชื่อผู้ใช้ + รหัสผ่าน) — ช่วงยังไม่มีระบบหลังบ้าน
 * เก็บในเครื่องนี้ (localStorage) · รหัสผ่านเก็บเป็นค่าแฮชพร้อม salt ไม่เก็บตัวจริง
 * กันคนทั่วไปเปิดห้องครูได้ แต่ยังไม่ใช่ระบบความปลอดภัยจริง — เมื่อมี backend ให้เปลี่ยนไปตรวจที่เซิร์ฟเวอร์
 * ใช้ครั้งแรก: ยังไม่มีบัญชี → หน้าเข้าสู่ระบบจะให้ตั้งบัญชีผู้ดูแลก่อน
 */

const ACCOUNTS_KEY = "lpg-teacher-accounts-v1";
const SESSION_KEY = "lpg-teacher-session-v1";
export const TEACHER_AUTH_EVENT = "lpg-teacher-auth-change";
/** อยู่ในระบบได้นานเท่าไรก่อนต้องเข้าใหม่ */
const SESSION_HOURS = 12;

export interface TeacherAccount {
  username: string;
  name: string;
  admin: boolean;
  salt: string;
  hash: string;
}
export interface TeacherSession { username: string; name: string; admin: boolean; at: number }

const emit = () => window.dispatchEvent(new Event(TEACHER_AUTH_EVENT));
const norm = (u: string) => u.trim().toLowerCase();

async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // เปิดผ่าน http ที่ไม่ใช่ localhost จะไม่มี crypto.subtle — ใช้ FNV-1a แทน
  let h = 0x811c9dc5;
  for (const b of data) { h ^= b; h = Math.imul(h, 0x01000193) >>> 0; }
  return `fnv-${h.toString(16)}`;
}
const newSalt = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export function listTeachers(): TeacherAccount[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]") as TeacherAccount[]; } catch { return []; }
}
const saveTeachers = (list: TeacherAccount[]) => { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list)); emit(); };
export const hasTeachers = () => listTeachers().length > 0;

/** เพิ่มบัญชีครู — บัญชีแรกของเครื่องเป็นผู้ดูแลเสมอ · คืนข้อความผิดพลาด หรือ null ถ้าสำเร็จ */
export async function addTeacher(username: string, name: string, password: string, admin = false): Promise<string | null> {
  const u = norm(username);
  if (!/^[a-z0-9._-]{3,30}$/.test(u)) return "ชื่อผู้ใช้ใช้ a-z ตัวเลข . _ - ได้ 3–30 ตัว";
  if (!name.trim()) return "กรุณาใส่ชื่อที่แสดง";
  if (password.length < 6) return "รหัสผ่านอย่างน้อย 6 ตัว";
  const list = listTeachers();
  if (list.some((t) => t.username === u)) return "ชื่อผู้ใช้นี้มีแล้ว";
  const salt = newSalt();
  saveTeachers([...list, { username: u, name: name.trim(), admin: admin || list.length === 0, salt, hash: await hashPassword(password, salt) }]);
  return null;
}

export async function setTeacherPassword(username: string, password: string): Promise<string | null> {
  if (password.length < 6) return "รหัสผ่านอย่างน้อย 6 ตัว";
  const salt = newSalt();
  const hash = await hashPassword(password, salt);
  saveTeachers(listTeachers().map((t) => (t.username === norm(username) ? { ...t, salt, hash } : t)));
  return null;
}

/** ลบบัญชีครู — ห้ามลบผู้ดูแลคนสุดท้าย */
export function removeTeacher(username: string): string | null {
  const list = listTeachers();
  const t = list.find((x) => x.username === norm(username));
  if (!t) return null;
  if (t.admin && list.filter((x) => x.admin).length === 1) return "ต้องมีผู้ดูแลอย่างน้อย 1 คน";
  saveTeachers(list.filter((x) => x !== t));
  return null;
}

export async function loginTeacher(username: string, password: string): Promise<string | null> {
  const t = listTeachers().find((x) => x.username === norm(username));
  if (!t || (await hashPassword(password, t.salt)) !== t.hash) return "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
  const s: TeacherSession = { username: t.username, name: t.name, admin: t.admin, at: Date.now() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  emit();
  return null;
}

export function logoutTeacher() {
  try { localStorage.removeItem(SESSION_KEY); } catch { /* */ }
  emit();
}

/** ครูที่เข้าสู่ระบบอยู่ (หมดอายุ/บัญชีถูกลบ = null) */
export function getTeacher(): TeacherSession | null {
  if (typeof window === "undefined") return null;
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null") as TeacherSession | null;
    if (!s || Date.now() - s.at > SESSION_HOURS * 3600_000) return null;
    const t = listTeachers().find((x) => x.username === s.username);
    return t ? { ...s, name: t.name, admin: t.admin } : null;
  } catch { return null; }
}

/** hook: ครูที่เข้าสู่ระบบอยู่ · ready = อ่านค่าจากเครื่องแล้ว (กันหน้ากระพริบตอนโหลด) */
export function useTeacher() {
  const [teacher, setTeacher] = useState<TeacherSession | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const read = () => setTeacher(getTeacher());
    read();
    setReady(true);
    window.addEventListener(TEACHER_AUTH_EVENT, read);
    window.addEventListener("storage", read);
    return () => { window.removeEventListener(TEACHER_AUTH_EVENT, read); window.removeEventListener("storage", read); };
  }, []);
  return { teacher, ready };
}
