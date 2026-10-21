"use client";

import type { FlashCard, FlashCategory, FlashSet } from "@/types/flashcard";
import { FLASH_CATEGORIES } from "@/data/flashcards";

/**
 * 🃏 คลังแฟลชการ์ด — ข้อมูลตั้งต้นมาจาก src/data/flashcards.ts
 * สิ่งที่ครูเพิ่ม/แก้/ลบ เก็บทับไว้ใน localStorage `lpg-flashcards-v1`
 * ครูจึงจัดการหมวด ชุด และบัตรได้เองจากหน้า /admin/flashcards โดยไม่ต้องแก้โค้ด
 */
const KEY = "lpg-flashcards-v1";
export const FLASH_EVENT = "lpg-flashcards-change";

/** สิ่งที่ครูแก้ทับข้อมูลตั้งต้น */
interface Patch {
  /** หมวดที่ครูสร้างเองทั้งหมด */
  added: FlashCategory[];
  /** หมวดตั้งต้นที่ถูกแก้ (เก็บทั้งก้อน) */
  edited: Record<string, FlashCategory>;
  /** id หมวดตั้งต้นที่ครูซ่อน/ลบ */
  removed: string[];
}

const EMPTY: Patch = { added: [], edited: {}, removed: [] };

const readPatch = (): Patch => {
  if (typeof window === "undefined") return EMPTY;
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    return v ? { ...EMPTY, ...v } : EMPTY;
  } catch {
    return EMPTY;
  }
};

const writePatch = (p: Patch) => {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* โหมดส่วนตัวเขียนไม่ได้ ไม่เป็นไร */ }
  window.dispatchEvent(new Event(FLASH_EVENT));
};

/** รายการหมวดที่ใช้แสดงจริง = ข้อมูลตั้งต้น + สิ่งที่ครูแก้ */
export function listCategories(): FlashCategory[] {
  const p = readPatch();
  const base = FLASH_CATEGORIES
    .filter((c) => !p.removed.includes(c.id))
    .map((c) => p.edited[c.id] ?? c);
  return [...base, ...p.added];
}

export const getCategory = (id: string) => listCategories().find((c) => c.id === id);
export const getSet = (catId: string, setId: string) => getCategory(catId)?.sets.find((s) => s.id === setId);

/** เขียนหมวดกลับลงคลัง (รู้เองว่าเป็นหมวดตั้งต้นหรือหมวดที่ครูสร้าง) */
export function saveCategory(cat: FlashCategory) {
  const p = readPatch();
  const isBuiltIn = FLASH_CATEGORIES.some((c) => c.id === cat.id);
  if (isBuiltIn) p.edited[cat.id] = cat;
  else {
    const i = p.added.findIndex((c) => c.id === cat.id);
    if (i >= 0) p.added[i] = cat; else p.added.push(cat);
  }
  writePatch(p);
}

export function removeCategory(id: string) {
  const p = readPatch();
  if (FLASH_CATEGORIES.some((c) => c.id === id)) {
    if (!p.removed.includes(id)) p.removed.push(id);
    delete p.edited[id];
  } else {
    p.added = p.added.filter((c) => c.id !== id);
  }
  writePatch(p);
}

/** คืนค่าหมวดตั้งต้นกลับเป็นของเดิมทั้งหมด */
export function resetAll() {
  writePatch({ ...EMPTY });
}

/** มีอะไรที่ครูแก้ไว้ไหม */
export function hasChanges() {
  const p = readPatch();
  return p.added.length > 0 || p.removed.length > 0 || Object.keys(p.edited).length > 0;
}

/* ---------- ชุดบัตร ---------- */

/** เพิ่มชุดใหม่ต่อจากชุดสุดท้ายของหมวด (ชุดที่ 2, 3, 4...) */
export function addSet(catId: string, title?: string): FlashSet | null {
  const cat = getCategory(catId);
  if (!cat) return null;
  const no = Math.max(0, ...cat.sets.map((s) => s.no)) + 1;
  const set: FlashSet = { id: `${catId}-${no}`, no, title: title || `${cat.label} ชุดที่ ${no}`, cards: [] };
  saveCategory({ ...cat, sets: [...cat.sets, set] });
  return set;
}

export function saveSet(catId: string, set: FlashSet) {
  const cat = getCategory(catId);
  if (!cat) return;
  saveCategory({ ...cat, sets: cat.sets.map((s) => (s.id === set.id ? set : s)) });
}

export function removeSet(catId: string, setId: string) {
  const cat = getCategory(catId);
  if (!cat) return;
  saveCategory({ ...cat, sets: cat.sets.filter((s) => s.id !== setId) });
}

/* ---------- บัตร ---------- */

export function saveCard(catId: string, setId: string, card: FlashCard) {
  const set = getSet(catId, setId);
  if (!set) return;
  const i = set.cards.findIndex((c) => c.id === card.id);
  const cards = i >= 0 ? set.cards.map((c) => (c.id === card.id ? card : c)) : [...set.cards, card];
  saveSet(catId, { ...set, cards });
}

export function removeCard(catId: string, setId: string, cardId: string) {
  const set = getSet(catId, setId);
  if (!set) return;
  saveSet(catId, { ...set, cards: set.cards.filter((c) => c.id !== cardId) });
}

/** ย้ายบัตรขึ้น/ลง 1 ตำแหน่ง */
export function moveCard(catId: string, setId: string, cardId: string, dir: -1 | 1) {
  const set = getSet(catId, setId);
  if (!set) return;
  const i = set.cards.findIndex((c) => c.id === cardId);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= set.cards.length) return;
  const cards = [...set.cards];
  [cards[i], cards[j]] = [cards[j], cards[i]];
  saveSet(catId, { ...set, cards });
}

/** รหัสสั้น ๆ สำหรับของที่ครูสร้างใหม่ */
export const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
