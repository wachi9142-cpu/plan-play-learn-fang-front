"use client";

/**
 * 👤 โปรไฟล์ผู้เล่น — 1 ครอบครัว (เครื่อง/บัญชี) มีได้หลายคน แยกประวัติ/ระดับ/เกมตามช่วงวัย
 * เก็บใน localStorage `lpg-players-v1` · เมื่อมีบัญชีครอบครัวจริงจะย้ายไปผูก familyId
 */
export interface PlayerProfile { id: string; name: string; age: number; createdAt: string; lastPlayedAt?: string }
export { AGE_BANDS, bandForAge, bandsForRange, type AgeBand, type AgeBandId } from "./age-bands";

const KEY = "lpg-players-v1";
const KEY_CUR = "lpg-current-player";
export const PLAYER_EVENT = "lpg-player-change";
const uid = () => Math.random().toString(36).slice(2, 10);
const read = (): PlayerProfile[] => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const write = (v: PlayerProfile[]) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* */ } window.dispatchEvent(new Event(PLAYER_EVENT)); };

export const listPlayers = read;
export function addPlayer(name: string, age: number): PlayerProfile {
  const all = read(); const exist = all.find((p) => p.name === name.trim());
  if (exist) { exist.age = age; write(all); setCurrentPlayer(exist.id); return exist; }
  const p: PlayerProfile = { id: uid(), name: name.trim() || "หนู", age, createdAt: new Date().toISOString() };
  all.push(p); write(all); setCurrentPlayer(p.id); return p;
}
export function updatePlayer(id: string, patch: Partial<PlayerProfile>) { write(read().map((p) => (p.id === id ? { ...p, ...patch } : p))); }
export function removePlayer(id: string) { write(read().filter((p) => p.id !== id)); if (getCurrentId() === id) setCurrentPlayer(null); }
export const getCurrentId = () => { try { return localStorage.getItem(KEY_CUR); } catch { return null; } };
export function setCurrentPlayer(id: string | null) {
  try { if (id) localStorage.setItem(KEY_CUR, id); else localStorage.removeItem(KEY_CUR); } catch { /* */ }
  const p = id ? read().find((x) => x.id === id) : null;
  try { localStorage.setItem("lpg-game-player", p?.name ?? ""); } catch { /* */ } // ให้ระบบผลการเล่นใช้ชื่อเดียวกัน
  window.dispatchEvent(new Event(PLAYER_EVENT));
}
export const getCurrentPlayer = (): PlayerProfile | null => { const id = getCurrentId(); return id ? read().find((p) => p.id === id) ?? null : null; };
export const touchPlayer = (id: string) => updatePlayer(id, { lastPlayedAt: new Date().toISOString() });
