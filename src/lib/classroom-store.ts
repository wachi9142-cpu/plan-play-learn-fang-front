"use client";

import type { ArchiveItem, ArchiveKind, ChatMessage, ClassGradeId, ClassMember, ClassRole, ClassRoom, LiveSession, StarEntry, StickerId } from "@/types/classroom";
import { uid } from "./studio-store";

/**
 * 💜 ห้องเรียนออนไลน์ — เก็บห้อง/สมาชิก/แชต/คลังย้อนหลัง/ดาว ใน localStorage (ยังไม่มี backend)
 * ไฟล์ใหญ่ (คลิป/เอกสาร) เก็บใน IndexedDB ผ่าน studio-assets โดยใช้ docId = `class:<roomId>`
 */
const KEY = "lpg-classroom-v1";
const KEY_ME = "lpg-class-me";
export const CLASS_EVENT = "lpg-classroom-change";

interface DB { rooms: ClassRoom[]; members: ClassMember[]; chat: ChatMessage[]; archive: ArchiveItem[]; sessions: LiveSession[]; seeded?: boolean }
const empty = (): DB => ({ rooms: [], members: [], chat: [], archive: [], sessions: [] });
const read = (): DB => { try { const s = localStorage.getItem(KEY); return s ? { ...empty(), ...(JSON.parse(s) as DB) } : empty(); } catch { return empty(); } };
const write = (db: DB) => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* เต็ม */ } window.dispatchEvent(new Event(CLASS_EVENT)); };
const now = () => new Date().toISOString();

/* ---------- ระดับชั้น ---------- */
export const CLASS_GRADES: { id: ClassGradeId; emoji: string; label: string; short: string; tint: string }[] = [
  { id: "nursery", emoji: "👶", label: "Nursery / เนอร์เซอรี่", short: "Nursery", tint: "bg-sky-soft" },
  { id: "k0", emoji: "🎒", label: "เตรียมอนุบาล", short: "เตรียมอนุบาล", tint: "bg-mint-soft" },
  { id: "k1", emoji: "🌱", label: "อนุบาล 1", short: "อนุบาล 1", tint: "bg-purple-100" },
  { id: "k2", emoji: "🌷", label: "อนุบาล 2", short: "อนุบาล 2", tint: "bg-pink-soft" },
  { id: "k3", emoji: "🌳", label: "อนุบาล 3", short: "อนุบาล 3", tint: "bg-yellow-soft" },
  { id: "special", emoji: "⭐", label: "ห้องเรียนพิเศษ", short: "พิเศษ", tint: "bg-cream" },
];
export const gradeOf = (id: ClassGradeId) => CLASS_GRADES.find((g) => g.id === id)!;

/** ห้องเริ่มต้น 15 ห้อง — รหัสห้องจริง + ชื่อเล่นน่ารัก (ครูเปลี่ยนได้ภายหลัง) */
const DEFAULT_ROOMS: { gradeId: ClassGradeId; roomNo: number; nickname: string; emoji: string }[] = [
  { gradeId: "nursery", roomNo: 1, nickname: "ห้องเจ้าผีเสื้อน้อย", emoji: "🦋" },
  { gradeId: "nursery", roomNo: 2, nickname: "ห้องเจ้าผึ้งน้อย", emoji: "🐝" },
  { gradeId: "nursery", roomNo: 3, nickname: "ห้องเจ้าหนอนน้อย", emoji: "🐛" },
  { gradeId: "k0", roomNo: 1, nickname: "ห้องน้องกระต่าย", emoji: "🐰" },
  { gradeId: "k0", roomNo: 2, nickname: "ห้องน้องลูกเจี๊ยบ", emoji: "🐥" },
  { gradeId: "k0", roomNo: 3, nickname: "ห้องน้องเต่าทอง", emoji: "🐞" },
  { gradeId: "k1", roomNo: 1, nickname: "ห้องน้องเพนกวิน", emoji: "🐧" },
  { gradeId: "k1", roomNo: 2, nickname: "ห้องน้องหมีน้อย", emoji: "🐻" },
  { gradeId: "k1", roomNo: 3, nickname: "ห้องน้องแพนด้า", emoji: "🐼" },
  { gradeId: "k2", roomNo: 1, nickname: "ห้องดอกทานตะวัน", emoji: "🌻" },
  { gradeId: "k2", roomNo: 2, nickname: "ห้องดอกเดซี่", emoji: "🌼" },
  { gradeId: "k2", roomNo: 3, nickname: "ห้องดอกลาเวนเดอร์", emoji: "💜" },
  { gradeId: "k3", roomNo: 1, nickname: "ห้องพี่สายรุ้ง", emoji: "🌈" },
  { gradeId: "k3", roomNo: 2, nickname: "ห้องพี่ต้นไม้ใหญ่", emoji: "🌳" },
  { gradeId: "k3", roomNo: 3, nickname: "ห้องพี่ดวงดาว", emoji: "⭐" },
];
export const roomCode = (gradeId: ClassGradeId, roomNo: number) => (gradeId === "nursery" ? `Nursery / ห้อง ${roomNo}` : gradeId === "k0" ? `เตรียมอนุบาล ห้อง ${roomNo}` : gradeId === "special" ? `ห้องพิเศษ ${roomNo}` : `${gradeOf(gradeId).short}/${roomNo}`);
const inviteCode = () => { const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let s = ""; for (let i = 0; i < 6; i++) s += A[Math.floor(Math.random() * A.length)]; return s; };

function seed(db: DB) {
  if (db.seeded) return db;
  const t = now();
  db.rooms = DEFAULT_ROOMS.map((r) => ({ id: `${r.gradeId}-${r.roomNo}`, gradeId: r.gradeId, code: roomCode(r.gradeId, r.roomNo), roomNo: r.roomNo, nickname: r.nickname, emoji: r.emoji, teacher: "ครูข้าวฟ่าง", status: "open" as const, inviteCode: inviteCode(), liveTime: "จ–ศ 09:00–09:40", createdAt: t, updatedAt: t }));
  db.seeded = true; return db;
}
const db = () => { const d = read(); if (!d.seeded) { seed(d); write(d); } return d; };

/* ---------- ห้อง ---------- */
export const listRooms = (): ClassRoom[] => db().rooms;
export const getRoom = (id: string) => db().rooms.find((r) => r.id === id);
export const getRoomByInvite = (code: string) => db().rooms.find((r) => r.inviteCode === code.toUpperCase());
export function createRoom(input: { gradeId: ClassGradeId; nickname: string; emoji?: string; code?: string; roomNo?: number; description?: string; liveTime?: string; teacher?: string }): ClassRoom {
  const d = db(); const t = now();
  const roomNo = input.roomNo ?? (input.gradeId === "special" ? undefined : d.rooms.filter((r) => r.gradeId === input.gradeId).length + 1);
  const room: ClassRoom = { id: uid(), gradeId: input.gradeId, code: input.code || (roomNo ? roomCode(input.gradeId, roomNo) : input.nickname), roomNo, nickname: input.nickname, emoji: input.emoji ?? gradeOf(input.gradeId).emoji, description: input.description, teacher: input.teacher ?? "ครูข้าวฟ่าง", status: "open", inviteCode: inviteCode(), liveTime: input.liveTime, createdAt: t, updatedAt: t };
  d.rooms.push(room); write(d); return room;
}
export function updateRoom(id: string, patch: Partial<ClassRoom>) { const d = db(); d.rooms = d.rooms.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: now() } : r)); write(d); }
export function deleteRoom(id: string) { const d = db(); d.rooms = d.rooms.filter((r) => r.id !== id); d.members = d.members.filter((m) => m.roomId !== id); d.chat = d.chat.filter((m) => m.roomId !== id); d.archive = d.archive.filter((m) => m.roomId !== id); write(d); }
export const regenInvite = (id: string) => updateRoom(id, { inviteCode: inviteCode() });

/* ---------- สมาชิก ---------- */
export const listMembers = (roomId: string): ClassMember[] => db().members.filter((m) => m.roomId === roomId);
export function addMember(roomId: string, input: { name: string; role: ClassRole; childName?: string; approved?: boolean; id?: string }): ClassMember {
  const d = db();
  const exist = d.members.find((m) => m.roomId === roomId && (m.id === input.id || (m.name === input.name && m.role === input.role)));
  if (exist) { if (input.approved && !exist.approved) { exist.approved = true; write(d); } return exist; }
  const m: ClassMember = { id: input.id ?? uid(), roomId, name: input.name.trim(), role: input.role, childName: input.childName, approved: input.approved ?? true, stars: [], filterAllowed: true, joinedAt: now() };
  d.members.push(m); write(d); return m;
}
export function updateMember(id: string, patch: Partial<ClassMember>) { const d = db(); d.members = d.members.map((m) => (m.id === id ? { ...m, ...patch } : m)); write(d); }
export function removeMember(id: string) { const d = db(); d.members = d.members.filter((m) => m.id !== id); write(d); }
export function giveStar(memberId: string, reason: string, by: string): StarEntry { const d = db(); const e: StarEntry = { id: uid(), reason, at: now(), by }; d.members = d.members.map((m) => (m.id === memberId ? { ...m, stars: [...m.stars, e] } : m)); write(d); return e; }
export function editStar(memberId: string, starId: string, reason: string) { const d = db(); d.members = d.members.map((m) => (m.id === memberId ? { ...m, stars: m.stars.map((s) => (s.id === starId ? { ...s, reason } : s)) } : m)); write(d); }
export function removeStar(memberId: string, starId: string) { const d = db(); d.members = d.members.map((m) => (m.id === memberId ? { ...m, stars: m.stars.filter((s) => s.id !== starId) } : m)); write(d); }
export const STAR_REASONS = ["ตอบคำถามได้", "ตั้งใจฟัง", "ร่วมกิจกรรม", "กล้าแสดงความคิดเห็น", "ทำกิจกรรมเสร็จ", "ช่วยเหลือเพื่อน", "มาเรียนตรงเวลา"];

/* ---------- แชต ---------- */
export const listChat = (roomId: string): ChatMessage[] => db().chat.filter((m) => m.roomId === roomId).sort((a, b) => a.at.localeCompare(b.at));
export function addChat(msg: ChatMessage) { const d = db(); if (d.chat.some((m) => m.id === msg.id)) return; d.chat.push(msg); if (d.chat.length > 2000) d.chat = d.chat.slice(-2000); write(d); }
export function deleteChat(id: string) { const d = db(); d.chat = d.chat.filter((m) => m.id !== id); write(d); }
export const CHAT_KINDS: { id: ChatMessage["kind"]; emoji: string; label: string; teacherOnly?: boolean }[] = [
  { id: "text", emoji: "💬", label: "ข้อความ" },
  { id: "announce", emoji: "📣", label: "แจ้งข่าวสาร", teacherOnly: true },
  { id: "homework", emoji: "📝", label: "แจ้งการบ้าน", teacherOnly: true },
  { id: "activity", emoji: "🎨", label: "ส่งลิงก์กิจกรรม", teacherOnly: true },
  { id: "schedule", emoji: "📅", label: "กำหนดการเรียน", teacherOnly: true },
  { id: "file", emoji: "📎", label: "ส่งไฟล์/ส่งงาน" },
  { id: "link", emoji: "🔗", label: "ลิงก์" },
];

/* ---------- คลังย้อนหลัง ---------- */
export const ARCHIVE_KINDS: { id: ArchiveKind; emoji: string; label: string; hint: string }[] = [
  { id: "image", emoji: "🖼️", label: "ภาพ", hint: "ภาพกิจกรรม · ผลงานเด็ก · ภาพจากการเรียนออนไลน์" },
  { id: "video", emoji: "🎥", label: "วิดีโอ", hint: "บันทึกการสอน · คลิปกิจกรรม · คลิปที่ครูสร้าง" },
  { id: "file", emoji: "📄", label: "ไฟล์", hint: "ใบงาน · เอกสาร · PDF · สื่อการเรียน" },
  { id: "other", emoji: "📦", label: "อื่น ๆ", hint: "เนื้อหาประเภทอื่น" },
];
export const listArchive = (roomId: string): ArchiveItem[] => db().archive.filter((a) => a.roomId === roomId).sort((a, b) => b.date.localeCompare(a.date));
export function addArchive(item: ArchiveItem) { const d = db(); if (d.archive.some((a) => a.id === item.id)) return; d.archive.unshift(item); write(d); }
export function updateArchive(id: string, patch: Partial<ArchiveItem>) { const d = db(); d.archive = d.archive.map((a) => (a.id === id ? { ...a, ...patch } : a)); write(d); }
export function removeArchive(id: string) { const d = db(); d.archive = d.archive.filter((a) => a.id !== id); write(d); }
export const kindOfMime = (mime: string): ArchiveKind => (mime.startsWith("image/") ? "image" : mime.startsWith("video/") ? "video" : /pdf|word|powerpoint|excel|text|sheet|presentation|document/.test(mime) ? "file" : "other");

/* ---------- คาบเรียนสด ---------- */
export const listSessions = (roomId: string): LiveSession[] => db().sessions.filter((s) => s.roomId === roomId).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
export function startSession(roomId: string, title: string): LiveSession { const d = db(); const s: LiveSession = { id: uid(), roomId, title, startedAt: now(), attendees: [] }; d.sessions.push(s); write(d); return s; }
export function updateSession(id: string, patch: Partial<LiveSession>) { const d = db(); d.sessions = d.sessions.map((s) => (s.id === id ? { ...s, ...patch } : s)); write(d); }

/* ---------- ตัวฉัน ---------- */
export interface ClassMe { id: string; name: string; role: ClassRole; childName?: string; color: string }
export const ROLE_LABEL: Record<ClassRole, string> = { teacher: "ครู", child: "นักเรียน", parent: "ผู้ปกครอง" };
export const ROLE_EMOJI: Record<ClassRole, string> = { teacher: "👩‍🏫", child: "👧", parent: "👨‍👩‍👧" };
const COLORS = ["#8b5cf6", "#22c55e", "#eab308", "#ec4899", "#0ea5e9", "#f97316", "#14b8a6", "#ef4444"];
export function getClassMe(): ClassMe | null { try { const s = localStorage.getItem(KEY_ME); return s ? (JSON.parse(s) as ClassMe) : null; } catch { return null; } }
export function setClassMe(p: { name: string; role: ClassRole; childName?: string }): ClassMe {
  const prev = getClassMe();
  const me: ClassMe = { id: prev?.id ?? uid(), name: p.name.trim() || ROLE_LABEL[p.role], role: p.role, childName: p.childName?.trim() || undefined, color: prev?.color ?? COLORS[Math.floor(Math.random() * COLORS.length)] };
  try { localStorage.setItem(KEY_ME, JSON.stringify(me)); } catch { /* */ }
  return me;
}
export const isTeacher = (me: ClassMe | null) => me?.role === "teacher";

/* ---------- สติกเกอร์/ฟิลเตอร์ ---------- */
export const STICKERS: { id: StickerId; emoji: string; label: string; pos: "top" | "center" | "corner" }[] = [
  { id: "none", emoji: "🚫", label: "ไม่ใช้", pos: "corner" },
  { id: "cat", emoji: "🐱", label: "หูแมว", pos: "top" },
  { id: "dog", emoji: "🐶", label: "หน้าหมา", pos: "center" },
  { id: "bunny", emoji: "🐰", label: "กระต่าย", pos: "top" },
  { id: "crown", emoji: "👑", label: "มงกุฎ", pos: "top" },
  { id: "star", emoji: "⭐", label: "ดาว", pos: "corner" },
  { id: "flower", emoji: "🌸", label: "ดอกไม้", pos: "top" },
  { id: "happy", emoji: "😊", label: "ดีใจ", pos: "corner" },
  { id: "love", emoji: "😍", label: "ชอบมาก", pos: "corner" },
  { id: "sleepy", emoji: "😴", label: "ง่วง", pos: "corner" },
  { id: "sad", emoji: "😢", label: "เศร้า", pos: "corner" },
];

export const fmtDate = (iso: string) => { const d = new Date(iso); return d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" }); };
export const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
