"use client";

import type { Difficulty } from "./game-levels";

/**
 * 📊 ผลการเล่นเกม + การตั้งค่าระดับโดยครู (localStorage — ย้ายไปฐานข้อมูลเมื่อมีบัญชีจริง)
 * ไม่จัดอันดับเด็ก — ใช้ดูว่าเด็กเล่นอะไรไปแล้วและมีพัฒนาการอย่างไร
 */
export interface GameResult { id: string; gameId: string; player: string; level: Difficulty; stars: number; mistakes: number; total: number; seconds: number; timeUp?: boolean; at: string }
export interface GameSettings {
  /** ปรับความยากอัตโนมัติ (แนะนำขึ้น/ลงระดับ) */
  autoAdjust: boolean;
  /** ระดับที่ครูกำหนดต่อห้อง: roomId → gameId → level ("*" = ทุกเกม) */
  roomLevels: Record<string, Record<string, Difficulty>>;
  /** ระดับที่ครูกำหนดต่อเด็ก: ชื่อเด็ก → gameId → level */
  childLevels: Record<string, Record<string, Difficulty>>;
  /** ห้องของเครื่องนี้ (เลือกในหน้าเกม) */
  roomId?: string;
}
const KEY_R = "lpg-game-results-v1";
const KEY_S = "lpg-game-settings-v1";
const KEY_P = "lpg-game-player";
export const GAME_EVENT = "lpg-game-change";
const read = <T>(k: string, d: T): T => { try { const s = localStorage.getItem(k); return s ? { ...d, ...(JSON.parse(s) as T) } : d; } catch { return d; } };
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* */ } window.dispatchEvent(new Event(GAME_EVENT)); };

export const listResults = (): GameResult[] => { try { return JSON.parse(localStorage.getItem(KEY_R) || "[]"); } catch { return []; } };
export function addResult(r: Omit<GameResult, "id" | "at">): GameResult {
  const all = listResults(); const it: GameResult = { ...r, id: Math.random().toString(36).slice(2, 10), at: new Date().toISOString() };
  all.push(it); write(KEY_R, all.slice(-2000)); return it;
}
export const resultsOf = (player: string, gameId?: string) => listResults().filter((r) => r.player === player && (!gameId || r.gameId === gameId));
export const bestStars = (player: string, gameId: string, level: Difficulty) => Math.max(0, ...resultsOf(player, gameId).filter((r) => r.level === level).map((r) => r.stars));
export const players = () => Array.from(new Set(listResults().map((r) => r.player)));

export const getSettings = (): GameSettings => read<GameSettings>(KEY_S, { autoAdjust: true, roomLevels: {}, childLevels: {} });
export const saveSettings = (s: GameSettings) => write(KEY_S, s);
export function setRoomLevel(roomId: string, gameId: string, level: Difficulty | "") { const s = getSettings(); s.roomLevels[roomId] = { ...(s.roomLevels[roomId] ?? {}) }; if (level) s.roomLevels[roomId][gameId] = level; else delete s.roomLevels[roomId][gameId]; saveSettings(s); }
export function setChildLevel(child: string, gameId: string, level: Difficulty | "") { const s = getSettings(); s.childLevels[child] = { ...(s.childLevels[child] ?? {}) }; if (level) s.childLevels[child][gameId] = level; else delete s.childLevels[child][gameId]; saveSettings(s); }

/** ระดับที่ครูกำหนดสำหรับเด็กคนนี้/ห้องนี้ (เด็ก > ห้อง > ไม่กำหนด) */
export function fixedLevel(player: string, gameId: string): { level: Difficulty; by: "child" | "room" } | null {
  const s = getSettings();
  const c = s.childLevels[player]?.[gameId] ?? s.childLevels[player]?.["*"]; if (c) return { level: c, by: "child" };
  if (s.roomId) { const r = s.roomLevels[s.roomId]?.[gameId] ?? s.roomLevels[s.roomId]?.["*"]; if (r) return { level: r, by: "room" }; }
  return null;
}

/** ปรับความยากอัตโนมัติ: ง่าย 5/5 ติดกัน 2 ครั้ง → แนะนำขึ้น · ยากได้ ≤2 ดาว 2 ครั้งติด → แนะนำลง */
export function suggestLevel(player: string, gameId: string, level: Difficulty): { to: Difficulty; text: string } | null {
  if (!getSettings().autoAdjust) return null;
  const last = resultsOf(player, gameId).filter((r) => r.level === level).slice(-2);
  if (last.length < 2) return null;
  if (level !== "hard" && last.every((r) => r.stars === 5)) { const to = level === "easy" ? "medium" : "hard"; return { to, text: `หนูเก่งมาก ได้ 5 ดาวติดกัน 2 ครั้ง — ลองระดับ${to === "medium" ? "ปานกลาง" : "ยาก"}ไหม? 🌱` }; }
  if (level !== "easy" && last.every((r) => r.stars <= 2)) { const to = level === "hard" ? "medium" : "easy"; return { to, text: `ลองกลับไปฝึกระดับ${to === "medium" ? "ปานกลาง" : "ง่าย"}กันก่อนนะ 💜` }; }
  return null;
}

export const getPlayer = (): string => { try { return localStorage.getItem(KEY_P) || ""; } catch { return ""; } };
export const setPlayer = (n: string) => { try { localStorage.setItem(KEY_P, n.trim()); } catch { /* */ } };
