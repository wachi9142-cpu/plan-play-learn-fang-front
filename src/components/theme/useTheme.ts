"use client";

import { useCallback, useEffect, useState } from "react";
import { THEME_EVENT, applyTheme, readTheme, resolveTheme, setTheme, type Resolved, type ThemeMode } from "@/lib/theme";

/**
 * 💜 อ่าน/เปลี่ยนธีมจากคอมโพเนนต์ไหนก็ได้
 * - mode = สิ่งที่ผู้ใช้เลือก (light · dark · system)
 * - resolved = สิ่งที่แสดงจริงตอนนี้
 * - ready = อ่านค่าจากเครื่องเสร็จแล้ว (กัน hydration ไม่ตรงกัน)
 */
export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<Resolved>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const m = readTheme();
    setMode(m);
    setResolved(applyTheme(m));
    setReady(true);

    // เครื่องเปลี่ยนโหมด (เช่น ตั้งเวลากลางคืนไว้) — ตามให้อัตโนมัติเมื่อเลือก "ตามอุปกรณ์"
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystem = () => { const cur = readTheme(); if (cur === "system") setResolved(applyTheme("system")); };
    mq.addEventListener("change", onSystem);

    // เปลี่ยนจากแท็บอื่น หรือจากปุ่มอื่นในหน้าเดียวกัน
    const onChange = () => { const cur = readTheme(); setMode(cur); setResolved(resolveTheme(cur)); };
    window.addEventListener(THEME_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => { mq.removeEventListener("change", onSystem); window.removeEventListener(THEME_EVENT, onChange); window.removeEventListener("storage", onChange); };
  }, []);

  const change = useCallback((m: ThemeMode) => { setTheme(m); setMode(m); setResolved(resolveTheme(m)); }, []);

  return { mode, resolved, ready, setMode: change };
}
