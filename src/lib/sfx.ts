"use client";

/**
 * 🔊 เสียงเอฟเฟกต์ในเกม — สร้างด้วย Web Audio ไม่ต้องมีไฟล์เสียง
 *
 * เว็บจึงไม่หนักขึ้นเลย และเล่นออฟไลน์ได้ด้วย
 * เสียงจะดังได้ก็ต่อเมื่อเด็กกดอะไรสักอย่างก่อน (กติกาของเบราว์เซอร์)
 */

const KEY = "lpg-sfx-on";
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

/** ตอนนี้เปิดเสียงอยู่ไหม (ค่าเริ่มต้นคือเปิด) */
export function sfxOn(): boolean {
  if (typeof window === "undefined") return true;
  try { return localStorage.getItem(KEY) !== "off"; } catch { return true; }
}

export function setSfxOn(on: boolean) {
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* เต็ม */ }
  window.dispatchEvent(new Event(SFX_EVENT));
}

/** โน้ตหนึ่งตัว — เสียงนุ่ม ไม่แหลมบาดหูเด็ก */
function tone(freq: number, startAt: number, dur: number, vol = 0.12, type: OscillatorType = "sine") {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + startAt;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  /* ค่อย ๆ ดังขึ้นแล้วค่อย ๆ เบาลง จะได้ไม่มีเสียงป๊อก */
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

/** เสียงไล่ขึ้นหรือไล่ลง เช่น ขึ้นบันได หรือไถลลงงู */
function glide(from: number, to: number, dur: number, vol = 0.1) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(from, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(60, to), t0 + dur);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
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

/** เล่นเสียงตามชื่อ — ถ้าปิดเสียงอยู่จะเงียบ */
export function playSfx(name: SfxName) {
  if (!sfxOn()) return;
  switch (name) {
    case "dice":
      tone(520, 0, 0.05, 0.08, "square");
      tone(430, 0.06, 0.05, 0.08, "square");
      tone(620, 0.12, 0.07, 0.08, "square");
      break;
    case "step":
      tone(680, 0, 0.06, 0.07);
      break;
    case "ladder":
      glide(360, 900, 0.5);
      break;
    case "snake":
      glide(760, 190, 0.6);
      break;
    case "correct":
      tone(660, 0, 0.12);
      tone(880, 0.1, 0.18);
      break;
    case "wrong":
      tone(330, 0, 0.14, 0.09, "triangle");
      tone(262, 0.12, 0.2, 0.09, "triangle");
      break;
    case "coin":
      tone(990, 0, 0.08, 0.1);
      tone(1320, 0.07, 0.12, 0.1);
      break;
    case "win":
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, 0.12));
      break;
    case "pop":
      tone(560, 0, 0.05, 0.06);
      break;
  }
}
