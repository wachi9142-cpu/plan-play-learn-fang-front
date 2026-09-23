import { EFFECT_IDS, type EffectId } from "./ambient-effects";

/** 💜 ระบบธีมการแสดงผล — ☀️ สว่าง · 🌙 มืด · ⚙️ ตามอุปกรณ์ (จำค่าที่เลือกไว้ใน localStorage) */

export type ThemeMode = "light" | "dark" | "system";
/** สิ่งที่แสดงจริงบนหน้าจอ (system จะถูกแปลงเป็นอย่างใดอย่างหนึ่ง) */
export type Resolved = "light" | "dark";

export const THEME_KEY = "lpg-theme-v1";
export const THEME_EVENT = "lpg-theme";

/** ✨ เอฟเฟกต์บรรยากาศ — เปิดได้ทีละ 1 อย่าง แยกจากธีมสว่าง-มืด และจำค่าไว้เหมือนกัน */
export const EFFECT_KEY = "lpg-effect-v1";
export const EFFECT_EVENT = "lpg-effect";
/** คีย์เดิมสมัยที่มีแต่โหมดฤดูหนาว — ใช้ย้ายค่าของผู้ใช้เก่าให้อัตโนมัติ */
export const WINTER_KEY = "lpg-winter-v1";

/** id ของเอฟเฟกต์ — รายการจริงอยู่ในทะเบียน src/lib/ambient-effects.ts */
export type AmbientEffect = EffectId;

export { SEASONS, activeEffects, findEffect, listEffects } from "./ambient-effects";

export const THEME_MODES: { id: ThemeMode; emoji: string; label: string; hint: string }[] = [
  { id: "light", emoji: "☀️", label: "โหมดสว่าง", hint: "พื้นหลังครีม–ขาว ใช้สีม่วงของสวนเป็นสีหลัก เหมาะกับการใช้งานทั่วไป" },
  { id: "dark", emoji: "🌙", label: "โหมดมืด", hint: "พื้นหลังโทนเข้ม ลดความสว่างของหน้าจอ เหมาะกับตอนกลางคืน" },
  { id: "system", emoji: "⚙️", label: "ตามอุปกรณ์", hint: "ทำตามการตั้งค่าของโทรศัพท์หรือคอมพิวเตอร์โดยอัตโนมัติ" },
];

export function themeInfo(mode: ThemeMode) {
  return THEME_MODES.find((m) => m.id === mode) ?? THEME_MODES[0];
}

/** สีของแถบบนสุดในมือถือ (theme-color) ให้กลืนกับพื้นหลังของแต่ละธีม */
export const THEME_COLOR: Record<Resolved, string> = { light: "#6D3AA8", dark: "#14101c" };

export function prefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveTheme(mode: ThemeMode): Resolved {
  return mode === "system" ? (prefersDark() ? "dark" : "light") : mode;
}

export function readTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const v = localStorage.getItem(THEME_KEY);
  return v === "light" || v === "dark" || v === "system" ? v : "system";
}

/** ทาธีมลงบน <html> — ใช้ทั้งตอนเปลี่ยนเองและตอนเครื่องเปลี่ยนค่า */
export function applyTheme(mode: ThemeMode) {
  const resolved = resolveTheme(mode);
  const el = document.documentElement;
  el.dataset.theme = resolved;
  el.dataset.themeMode = mode;
  el.style.colorScheme = resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[resolved]);
  return resolved;
}

export function setTheme(mode: ThemeMode) {
  localStorage.setItem(THEME_KEY, mode);
  const el = document.documentElement;
  el.classList.add("theme-switching");
  window.setTimeout(() => el.classList.remove("theme-switching"), 240);
  applyTheme(mode);
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: mode }));
}



export function readEffect(): AmbientEffect {
  if (typeof window === "undefined") return "none";
  const v = localStorage.getItem(EFFECT_KEY);
  if (v && EFFECT_IDS.includes(v)) return v as AmbientEffect;
  // ผู้ใช้เดิมที่เคยเปิดโหมดฤดูหนาวไว้ ให้ได้หิมะต่อโดยไม่ต้องตั้งใหม่
  return localStorage.getItem(WINTER_KEY) === "on" ? "winter" : "none";
}

export function setEffect(id: AmbientEffect) {
  localStorage.setItem(EFFECT_KEY, id);
  localStorage.removeItem(WINTER_KEY);
  document.documentElement.dataset.effect = id;
  window.dispatchEvent(new CustomEvent(EFFECT_EVENT, { detail: id }));
}

/** ผู้ใช้ตั้งให้ลดการเคลื่อนไหวไว้ที่เครื่องหรือไม่ — ถ้าใช่ จะไม่เล่นหิมะ */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * สคริปต์เล็ก ๆ ที่รันก่อนหน้าเว็บวาด เพื่อไม่ให้จอกะพริบเป็นสีขาวก่อนเข้าโหมดมืด
 * (ต้องเป็นสตริง เพราะฝังลงใน <script> ของ layout)
 */
export const THEME_INIT_SCRIPT = `(function(){try{var m=localStorage.getItem('${THEME_KEY}')||'system';var d=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var e=document.documentElement;e.dataset.theme=d?'dark':'light';e.dataset.themeMode=m;e.style.colorScheme=d?'dark':'light';var f=localStorage.getItem('${EFFECT_KEY}');if(!f)f=localStorage.getItem('${WINTER_KEY}')==='on'?'winter':'none';e.dataset.effect=f;}catch(x){}})();`;
