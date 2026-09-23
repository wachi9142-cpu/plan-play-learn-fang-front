"use client";

import { useCallback, useEffect, useState } from "react";
import { EFFECT_EVENT, prefersReducedMotion, readEffect, setEffect, type AmbientEffect } from "@/lib/theme";
import { EFFECT_CONFIG_EVENT, activeEffects, type EffectDef } from "@/lib/ambient-effects";

/**
 * ✨ อ่าน/เปลี่ยนเอฟเฟกต์บรรยากาศ — เปิดได้ทีละ 1 อย่าง
 * reduced = เครื่องตั้งให้ลดการเคลื่อนไหวไว้ (จะไม่เล่นเอฟเฟกต์เลย)
 */
export function useAmbient() {
  const [effect, setLocal] = useState<AmbientEffect>("none");
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [effects, setEffects] = useState<EffectDef[]>([]);

  useEffect(() => {
    setLocal(readEffect());
    setEffects(activeEffects());
    setReady(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onMq = () => setReduced(mq.matches);
    const onChange = () => setLocal(readEffect());
    const onCfg = () => setEffects(activeEffects());
    window.addEventListener(EFFECT_CONFIG_EVENT, onCfg);
    mq.addEventListener("change", onMq);
    window.addEventListener(EFFECT_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => { mq.removeEventListener("change", onMq); window.removeEventListener(EFFECT_EVENT, onChange); window.removeEventListener(EFFECT_CONFIG_EVENT, onCfg); window.removeEventListener("storage", onChange); };
  }, []);

  const choose = useCallback((id: AmbientEffect) => { setEffect(id); setLocal(id); }, []);

  return { effect, effects, ready, reduced, choose, prefersReducedMotion };
}
