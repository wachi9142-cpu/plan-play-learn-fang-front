"use client";

import { useCallback, useEffect, useState } from "react";
import { WINTER_EVENT, prefersReducedMotion, readWinter, setWinter } from "@/lib/theme";

/** ❄️ อ่าน/สลับโหมดฤดูหนาว — reduced = เครื่องตั้งให้ลดการเคลื่อนไหวไว้ */
export function useWinter() {
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setOn(readWinter());
    setReady(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onMq = () => setReduced(mq.matches);
    const onChange = () => setOn(readWinter());
    mq.addEventListener("change", onMq);
    window.addEventListener(WINTER_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => { mq.removeEventListener("change", onMq); window.removeEventListener(WINTER_EVENT, onChange); window.removeEventListener("storage", onChange); };
  }, []);

  const toggle = useCallback((next?: boolean) => {
    const v = next ?? !readWinter();
    setWinter(v);
    setOn(v);
  }, []);

  return { on, ready, reduced, toggle };
}
