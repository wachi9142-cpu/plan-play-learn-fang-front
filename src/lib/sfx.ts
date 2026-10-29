"use client";

/**
 * 🔊 เสียงเอฟเฟกต์ในเกม — สร้างด้วย Web Audio ไม่ต้องมีไฟล์เสียง (ไม่ใช่เสียงพูด)
 *
 * เว็บจึงไม่หนักขึ้นเลย และเล่นออฟไลน์ได้ด้วย
 * เสียงจะดังได้ก็ต่อเมื่อเด็กกดอะไรสักอย่างก่อน (กติกาของเบราว์เซอร์)
 *
 * เลือกได้ในหน้าตั้งค่า:
 * - 🎚️ โทนเสียง 5 แบบ (นุ่มนวล · ไม้มาริมบา · กล่องดนตรี · เกมย้อนยุค · ฟองสบู่)
 * - 🗂️ แยกตามหมวด: เกมการศึกษา · เกมเล่นสนุก · แฟลชการ์ด — แต่ละหมวดเปิด/ปิดและเลือกโทนเองได้
 * - 🎯 แยกตามจังหวะ: ตอบถูก · ตอบผิด · จบเกม · ได้แต้ม · กดปุ่ม · เกมกระดาน
 */

const KEY = "lpg-sfx-on";
const CONFIG_KEY = "lpg-sfx-config-v1";
export const SFX_EVENT = "lpg-sfx-change";

let ctx: AudioContext | null = null;

const audio = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
};

/** ตอนนี้เปิดเสียงอยู่ไหม (ค่าเริ่มต้นคือปิด — ผู้ใช้ต้องฟังแล้วเลือกเปิดเองในหน้าตั้งค่า) */
export function sfxOn(): boolean {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem(KEY) === "on"; } catch { return false; }
}

export function setSfxOn(on: boolean) {
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* เต็ม */ }
  window.dispatchEvent(new Event(SFX_EVENT));
}

/* ---------- 🎚️ โทนเสียง · 🗂️ หมวด · 🎯 จังหวะ ---------- */

export type SfxTone = "soft" | "marimba" | "musicbox" | "retro" | "bubble";
export const SFX_TONES: Record<SfxTone, { emoji: string; label: string; hint: string }> = {
  soft: { emoji: "🎐", label: "นุ่มนวล", hint: "เสียงใส ๆ เบา ๆ ไม่บาดหู" },
  marimba: { emoji: "🪵", label: "ไม้มาริมบา", hint: "เสียงไม้เคาะ อบอุ่น สั้นกระชับ" },
  musicbox: { emoji: "🎵", label: "กล่องดนตรี", hint: "เสียงกริ๊งเหมือนกล่องดนตรี หวาน ๆ" },
  retro: { emoji: "👾", label: "เกมย้อนยุค", hint: "เสียงตู้เกมสมัยก่อน สนุกคึกคัก" },
  bubble: { emoji: "🫧", label: "ฟองสบู่", hint: "เสียงป๊อบเด้ง ๆ น่ารัก" },
};

export type SfxArea = "edu" | "fun" | "flashcards";
export const SFX_AREAS: Record<SfxArea, { emoji: string; label: string; hint: string }> = {
  edu: { emoji: "🧩", label: "เกมการศึกษา", hint: "เกมฝึกทักษะในหน้า เกมการศึกษา" },
  fun: { emoji: "🎮", label: "เกมเล่นสนุก", hint: "เกมในหน้า เกม — เล่นสนุก (หมากฮอส งูตกบันได ฯลฯ)" },
  flashcards: { emoji: "🃏", label: "แฟลชการ์ด", hint: "พลิกบัตร เกมจับคู่ และเกมทายคำ" },
};

export type SfxGroup = "correct" | "wrong" | "win" | "coin" | "tap" | "board";
export const SFX_GROUPS: Record<SfxGroup, { emoji: string; label: string; hint: string }> = {
  correct: { emoji: "✅", label: "ตอบถูก", hint: "ตอบถูกหรือผ่านแต่ละข้อ" },
  wrong: { emoji: "🙈", label: "ตอบผิด", hint: "เสียงนุ่ม ๆ ไม่ดุ" },
  win: { emoji: "🏆", label: "จบเกม / ชนะ", hint: "เล่นจบหรือชนะ" },
  coin: { emoji: "⭐", label: "ได้แต้ม", hint: "ได้ดาว ได้เหรียญ เก็บของได้" },
  tap: { emoji: "👆", label: "กดปุ่ม / พลิกบัตร", hint: "เสียงสั้น ๆ ตอนกดปุ่มในเกมหรือพลิกแฟลชการ์ด" },
  board: { emoji: "🎲", label: "เกมกระดาน", hint: "ทอยเต๋า เดินหมาก ขึ้นบันได ไถลลงงู" },
};

export interface SfxConfig {
  /** ความดัง 0.4–1.6 (1 = ปกติ) */
  volume: number;
  areas: Record<SfxArea, { on: boolean; tone: SfxTone }>;
  groups: Record<SfxGroup, boolean>;
}

export const DEFAULT_SFX_CONFIG: SfxConfig = {
  volume: 1,
  areas: {
    edu: { on: true, tone: "soft" },
    fun: { on: true, tone: "marimba" },
    flashcards: { on: true, tone: "musicbox" },
  },
  groups: { correct: true, wrong: true, win: true, coin: true, tap: true, board: true },
};

export function readSfxConfig(): SfxConfig {
  if (typeof window === "undefined") return DEFAULT_SFX_CONFIG;
  try {
    const raw = JSON.parse(localStorage.getItem(CONFIG_KEY) || "{}") as Partial<SfxConfig>;
    return {
      volume: typeof raw.volume === "number" ? raw.volume : DEFAULT_SFX_CONFIG.volume,
      areas: {
        edu: { ...DEFAULT_SFX_CONFIG.areas.edu, ...raw.areas?.edu },
        fun: { ...DEFAULT_SFX_CONFIG.areas.fun, ...raw.areas?.fun },
        flashcards: { ...DEFAULT_SFX_CONFIG.areas.flashcards, ...raw.areas?.flashcards },
      },
      groups: { ...DEFAULT_SFX_CONFIG.groups, ...raw.groups },
    };
  } catch {
    return DEFAULT_SFX_CONFIG;
  }
}

export function writeSfxConfig(cfg: SfxConfig) {
  try { localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg)); } catch { /* เต็ม */ }
  window.dispatchEvent(new Event(SFX_EVENT));
}

export function resetSfxConfig() {
  try { localStorage.removeItem(CONFIG_KEY); } catch { /* */ }
  window.dispatchEvent(new Event(SFX_EVENT));
}

/** หมวดของหน้าที่เปิดอยู่ตอนนี้ — หน้าเกม/แฟลชการ์ดตั้งค่าให้เองตอนเปิด */
let currentArea: SfxArea = "edu";
export function setSfxArea(area: SfxArea) { currentArea = area; }

/* ---------- ตัวสร้างเสียง ---------- */

interface Voice { wave: OscillatorType; mult: number; vol: number; decay: number; partial?: { mult: number; vol: number }; blip?: boolean }

/** แต่ละโทนต่างกันที่ รูปคลื่น · ระดับเสียง · ความยาวหาง · เสียงประสาน */
const VOICES: Record<SfxTone, Voice> = {
  soft: { wave: "sine", mult: 1, vol: 0.12, decay: 1 },
  marimba: { wave: "triangle", mult: 1, vol: 0.16, decay: 0.55, partial: { mult: 4, vol: 0.25 } },
  musicbox: { wave: "sine", mult: 2, vol: 0.09, decay: 1.7, partial: { mult: 3, vol: 0.18 } },
  retro: { wave: "square", mult: 1, vol: 0.05, decay: 0.8 },
  bubble: { wave: "sine", mult: 1.5, vol: 0.12, decay: 0.7, blip: true },
};

/** โน้ตหนึ่งตัว — ค่อย ๆ ดังขึ้นแล้วค่อย ๆ เบาลง จะได้ไม่มีเสียงป๊อก */
function osc(freq: number, startAt: number, dur: number, vol: number, wave: OscillatorType, blip = false) {
  const ac = audio();
  if (!ac || vol <= 0) return;
  const t0 = ac.currentTime + startAt;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = wave;
  if (blip) {
    o.frequency.setValueAtTime(freq * 0.6, t0);
    o.frequency.exponentialRampToValueAtTime(freq, t0 + 0.06);
  } else {
    o.frequency.setValueAtTime(freq, t0);
  }
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(ac.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.03);
}

function note(v: Voice, gain: number, freq: number, at: number, dur: number) {
  const d = Math.max(0.05, dur * v.decay);
  osc(freq * v.mult, at, d, v.vol * gain, v.wave, v.blip);
  if (v.partial) osc(freq * v.mult * v.partial.mult, at, d * 0.6, v.vol * gain * v.partial.vol, "sine");
}

/** เสียงไล่ขึ้นหรือไล่ลง เช่น ขึ้นบันได หรือไถลลงงู */
function glide(v: Voice, gain: number, from: number, to: number, dur: number) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = v.wave === "sine" ? "triangle" : v.wave;
  o.frequency.setValueAtTime(from * v.mult, t0);
  o.frequency.exponentialRampToValueAtTime(Math.max(60, to * v.mult), t0 + dur);
  g.gain.setValueAtTime(0.1 * gain * (v.wave === "square" ? 0.5 : 1), t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(ac.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.03);
}

export type SfxName =
  | "dice"      // ทอยลูกเต๋า
  | "step"      // เดินทีละช่อง
  | "ladder"    // ขึ้นบันได
  | "snake"     // ไถลลงงู
  | "correct"   // ตอบถูก
  | "wrong"     // ตอบผิด (เสียงนุ่ม ไม่ดุ)
  | "coin"      // ได้เงิน / ได้แต้ม
  | "win"       // ชนะ
  | "pop";      // กดปุ่มทั่วไป

const GROUP_OF: Record<SfxName, SfxGroup> = {
  dice: "board", step: "board", ladder: "board", snake: "board",
  correct: "correct", wrong: "wrong", coin: "coin", win: "win", pop: "tap",
};

/** กันเสียงเดียวกันซ้อนกัน (เช่น เกมเล่นเสียงชนะเอง และกรอบเกมก็เล่นอีก) */
const lastPlayed: Partial<Record<SfxName, number>> = {};

/**
 * เล่นเสียงตามชื่อ — เงียบเองถ้า: ปิดเสียงใหญ่ · ปิดหมวดนี้ · ปิดจังหวะนี้
 * opts.tone + opts.preview ใช้กับปุ่ม "ลองฟัง" ในหน้าตั้งค่า (ข้ามการปิดหมวด/จังหวะ)
 */
export function playSfx(name: SfxName, opts: { area?: SfxArea; tone?: SfxTone; preview?: boolean } = {}) {
  if (!sfxOn() && !opts.preview) return; // ปุ่ม "ลองฟัง" ฟังได้แม้ยังปิดเสียงอยู่
  const cfg = readSfxConfig();
  const area = cfg.areas[opts.area ?? currentArea];
  if (!opts.preview && (!area.on || !cfg.groups[GROUP_OF[name]])) return;
  const now = Date.now();
  if (!opts.preview && now - (lastPlayed[name] ?? 0) < 300) return;
  lastPlayed[name] = now;

  const v = VOICES[opts.tone ?? area.tone];
  const g = cfg.volume;
  switch (name) {
    case "dice":
      note(v, g * 0.7, 520, 0, 0.05); note(v, g * 0.7, 430, 0.06, 0.05); note(v, g * 0.7, 620, 0.12, 0.07);
      break;
    case "step":
      note(v, g * 0.6, 680, 0, 0.06);
      break;
    case "ladder":
      glide(v, g, 360, 900, 0.5);
      break;
    case "snake":
      glide(v, g, 760, 190, 0.6);
      break;
    case "correct":
      note(v, g, 660, 0, 0.12); note(v, g, 880, 0.1, 0.18);
      break;
    case "wrong":
      note({ ...v, wave: v.wave === "square" ? "square" : "triangle" }, g * 0.75, 330, 0, 0.14);
      note({ ...v, wave: v.wave === "square" ? "square" : "triangle" }, g * 0.75, 262, 0.12, 0.2);
      break;
    case "coin":
      note(v, g * 0.85, 990, 0, 0.08); note(v, g * 0.85, 1320, 0.07, 0.12);
      break;
    case "win":
      [523, 659, 784, 1047].forEach((f, i) => note(v, g, f, i * 0.12, 0.3));
      break;
    case "pop":
      note(v, g * 0.5, 560, 0, 0.05);
      break;
  }
}
