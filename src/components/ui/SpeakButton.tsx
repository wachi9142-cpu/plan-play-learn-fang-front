"use client";

import { useEffect, useMemo, useState } from "react";
import { Square, Volume2 } from "lucide-react";
import { canSpeak, onVoicesReady, speak, speechReady, stopSpeaking } from "@/lib/speak";
import { cn } from "@/lib/cn";

/**
 * 🔊 ปุ่มอ่านออกเสียง — ใช้เสียงของเครื่อง ไม่ต้องมีไฟล์เสียง ไม่ต้องต่อเน็ต
 * เครื่องไหนไม่มีเสียงภาษานั้น ปุ่มจะซ่อนให้เอง
 *
 * ใช้ได้กับทุกข้อความในเว็บ เช่น คำสั่งใบงาน · นิทาน · โจทย์เกม
 */
export function SpeakButton({ text, lang = "th", label, size = "md", className }: {
  /** ข้อความที่จะอ่าน — ใส่หลายบรรทัดได้ ระบบจะต่อให้เอง */
  text: string | string[];
  lang?: "th" | "en";
  /** ข้อความบนปุ่ม (ไม่ใส่ = "ฟังเสียง") */
  label?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => { setReady(true); }, []);
  useEffect(() => onVoicesReady(() => setReady(true)), []);
  useEffect(() => () => stopSpeaking(), []);

  const ok = useMemo(() => ready && speechReady() && canSpeak(lang), [ready, lang]);
  const words = Array.isArray(text) ? text.join(" ") : text;

  // ถ้าเครื่องอ่านไม่ได้ก็ไม่ต้องแสดงปุ่มให้รก
  if (!ok || !words.trim()) return null;

  const toggle = () => {
    if (playing) { stopSpeaking(); setPlaying(false); return; }
    speak(words, lang);
    setPlaying(true);
    // ประมาณเวลาอ่านจบ แล้วคืนปุ่มกลับเป็นปกติ
    const ms = Math.min(60000, 350 * words.split(/\s+/).length + words.length * 55);
    setTimeout(() => setPlaying(false), ms);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={playing ? "หยุดอ่าน" : `อ่านออกเสียง${label ? ` ${label}` : ""}`}
      className={cn(
        "tap inline-flex items-center gap-1.5 rounded-full font-medium transition",
        size === "sm" ? "px-3 py-1 text-[13px]" : "px-4 py-2 text-[14px]",
        playing ? "bg-[#a8456c] text-white! shadow-soft" : "bg-cream-dark text-purple-700 hover:brightness-95",
        className,
      )}
    >
      {playing ? <Square size={size === "sm" ? 13 : 15} fill="currentColor" /> : <Volume2 size={size === "sm" ? 14 : 16} />}
      {playing ? "หยุดอ่าน" : (label ?? "ฟังเสียง")}
    </button>
  );
}
