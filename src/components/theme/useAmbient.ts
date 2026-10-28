"use client";

import { useCallback, useEffect, useState } from "react";
import { EFFECT_EVENT, EFFECT_KEY, prefersReducedMotion, readEffect, setEffect, type AmbientEffect } from "@/lib/theme";
import { EFFECT_CONFIG_EVENT, activeEffects, type EffectDef } from "@/lib/ambient-effects";
import { FESTIVAL_EVENT, activeFestival, festivalAutoOn, setFestivalAuto, type Festival } from "@/lib/festival-schedule";

/**
 * ✨ อ่าน/เปลี่ยนเอฟเฟกต์บรรยากาศ — เปิดได้ทีละ 1 อย่าง
 * reduced = เครื่องตั้งให้ลดการเคลื่อนไหวไว้ (จะไม่เล่นเอฟเฟกต์เลย)
 *
 * 🎆 ช่วงเทศกาล (ตามตารางที่ผู้ดูแลตั้ง เวลาไทย) ระบบเปิดเอฟเฟกต์ของเทศกาลแทนเอฟเฟกต์ที่เลือกไว้
 * ยกเว้นผู้ใช้ปิด "เอฟเฟกต์เทศกาลอัตโนมัติ" หรือเลือก "ไม่มีเอฟเฟกต์" ไว้เอง
 */
export function useAmbient() {
  const [effect, setLocal] = useState<AmbientEffect>("none");
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [effects, setEffects] = useState<EffectDef[]>([]);
  const [festival, setFestival] = useState<Festival | null>(null);
  const [festivalAuto, setAuto] = useState(true);
  const [chosenNone, setChosenNone] = useState(false);

  useEffect(() => {
    const readChoice = () => {
      setLocal(readEffect());
      try { setChosenNone(localStorage.getItem(EFFECT_KEY) === "none"); } catch { /* */ }
    };
    const readFestival = () => { setFestival(activeFestival()); setAuto(festivalAutoOn()); };
    readChoice();
    readFestival();
    setEffects(activeEffects());
    setReady(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onMq = () => setReduced(mq.matches);
    const onCfg = () => setEffects(activeEffects());
    const onStorage = () => { readChoice(); readFestival(); };
    // ตรวจทุกนาที — ข้ามเที่ยงคืน (เวลาไทย) แล้วเปิด/ปิดเทศกาลเองโดยไม่ต้องรีโหลดหน้า
    const tick = window.setInterval(readFestival, 60_000);
    window.addEventListener(EFFECT_CONFIG_EVENT, onCfg);
    mq.addEventListener("change", onMq);
    window.addEventListener(EFFECT_EVENT, readChoice);
    window.addEventListener(FESTIVAL_EVENT, readFestival);
    window.addEventListener("storage", onStorage);
    return () => {
      window.clearInterval(tick);
      mq.removeEventListener("change", onMq);
      window.removeEventListener(EFFECT_EVENT, readChoice);
      window.removeEventListener(EFFECT_CONFIG_EVENT, onCfg);
      window.removeEventListener(FESTIVAL_EVENT, readFestival);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const choose = useCallback((id: AmbientEffect) => { setEffect(id); setLocal(id); setChosenNone(id === "none"); }, []);
  const chooseFestivalAuto = useCallback((on: boolean) => { setFestivalAuto(on); setAuto(on); }, []);

  // เทศกาลจะแสดงได้ต้อง: ผู้ใช้ไม่ได้ปิดเอง · ไม่ได้เลือก "ไม่มีเอฟเฟกต์" · ผู้ดูแลยังเปิดเอฟเฟกต์ตัวนั้นอยู่
  const festivalOn = !!festival && festivalAuto && !chosenNone && effects.some((e) => e.id === festival.effectId);
  const shown: AmbientEffect = festivalOn && festival ? festival.effectId : effect;

  return {
    effect, shown, effects, ready, reduced, choose, prefersReducedMotion,
    festival, festivalOn, festivalAuto, chooseFestivalAuto,
  };
}
