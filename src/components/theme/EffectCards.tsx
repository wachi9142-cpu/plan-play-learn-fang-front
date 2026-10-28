"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAmbient } from "./useAmbient";
import { useTheme } from "./useTheme";
import { Switch } from "./ThemeMenuPanel";

/** ✨ การ์ดเลือกเอฟเฟกต์บรรยากาศในหน้าตั้งค่า ⚙️ — เปิดได้ทีละ 1 อย่าง */
export function EffectCards() {
  const { effect, effects, ready, reduced, choose, festival, festivalOn, festivalAuto, chooseFestivalAuto } = useAmbient();
  const { resolved, setMode } = useTheme();
  const festivalFx = festival ? effects.find((e) => e.id === festival.effectId) : undefined;
  return (
    <div>
      {/* 🎆 เอฟเฟกต์เทศกาลอัตโนมัติ — ผู้ใช้ปิดเฉพาะเครื่องตัวเองได้ แม้ระบบกำลังเปิดเทศกาลอยู่ */}
      <div className="card mb-3 flex flex-wrap items-center gap-3 p-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-purple-50 text-2xl">{festivalFx?.emoji ?? "🎆"}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[16px] text-purple-800">เอฟเฟกต์เทศกาลอัตโนมัติ</span>
          <span className="mt-0.5 block text-[13px] leading-snug text-ink-soft">
            {ready && festival
              ? festivalOn
                ? <>ตอนนี้กำลังแสดง <b className="text-purple-700">{festival.name}</b> แทนเอฟเฟกต์ที่เลือกไว้ (ถึงวันที่ {festival.end})</>
                : <>ช่วงนี้มี <b className="text-purple-700">{festival.name}</b> แต่ไม่ได้แสดง{!festivalAuto ? " เพราะปิดไว้ที่นี่" : effect === "none" ? " เพราะเลือก “ไม่มีเอฟเฟกต์” ไว้" : ""}</>
              : "ช่วงเทศกาล ระบบจะเปิดเอฟเฟกต์ของเทศกาลให้เอง 3 วัน แล้วปิดเองเมื่อครบกำหนด"}
          </span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={festivalAuto}
          aria-label={festivalAuto ? "ปิดเอฟเฟกต์เทศกาลอัตโนมัติ" : "เปิดเอฟเฟกต์เทศกาลอัตโนมัติ"}
          onClick={() => chooseFestivalAuto(!festivalAuto)}
          disabled={reduced}
          className="disabled:opacity-50"
        >
          <Switch on={ready && festivalAuto} />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {effects.map((e) => {
          const needsDark = e.darkOnly === true && resolved !== "dark";
          const on = ready && effect === e.id && !(reduced && e.id !== "none");
          const locked = reduced && e.id !== "none";
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => choose(e.id)}
              disabled={locked}
              aria-pressed={on}
              className={cn(
                "card card-hover flex items-start gap-3 p-4 text-left disabled:cursor-not-allowed disabled:opacity-60",
                on && "border-purple-400! ring-2 ring-purple-300",
              )}
            >
              <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl text-2xl transition-colors", on ? "bg-sky-soft" : "bg-purple-50")}>{e.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="font-display text-[16px] text-purple-800">{e.label}</span>
                  {on && <Check size={16} className="ml-auto shrink-0 text-purple-600" />}
                </span>
                <span className="mt-0.5 block text-[13px] leading-snug text-ink-soft">{e.hint}</span>
                {e.time && <span className="mt-1 block text-[12px] text-purple-700">🕐 แนะนำช่วง {e.time}{e.darkOnly ? "" : " — เปิดเวลาอื่นก็ได้ ระบบปรับสีให้มองเห็นชัดเอง"}</span>}
                {needsDark && (
                  <span className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px] text-ink-soft">
                    🌙 โหมดนี้ใช้ร่วมกับโหมดมืด
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(ev) => { ev.stopPropagation(); ev.preventDefault(); setMode("dark"); }}
                      onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.stopPropagation(); ev.preventDefault(); setMode("dark"); } }}
                      className="tap inline-flex cursor-pointer items-center rounded-full bg-purple-600 px-3 py-1 font-medium text-white hover:bg-purple-700"
                    >
                      เปิด Dark Mode
                    </span>
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 rounded-2xl bg-purple-50 px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
        {reduced ? (
          <>อุปกรณ์นี้ตั้งค่า <b className="text-purple-700">“ลดการเคลื่อนไหว”</b> ไว้ ระบบจึงปิดเอฟเฟกต์ให้อัตโนมัติเพื่อความสบายตา</>
        ) : (
          <>
            ⭐ เปิดได้<b className="text-purple-700">ทีละ 1 เอฟเฟกต์</b> จะได้ไม่เกิดหิมะ ดาวตก และใบไม้พร้อมกัน · ระบบจำค่าที่เลือกไว้ให้ · ทุกเอฟเฟกต์ไม่บังปุ่มหรือตัวหนังสือ และไม่ถูกพิมพ์ลงกระดาษ
            <br />
            🎯 <b className="text-purple-700">หน้าที่ต้องลงมือทำกิจกรรม</b>จะปิดเอฟเฟกต์ให้อัตโนมัติ — 🎨 Garden Canvas · 🌱 Garden Studio · 📝 ทำใบงาน · 🎮 กำลังเล่นเกม · 💻 ห้องเรียนออนไลน์ · 📚 หลักสูตร · 📈 พัฒนาการ · 👑 ผู้ดูแลระบบ เพื่อให้เด็กและครูมีสมาธิเต็มที่
          </>
        )}
      </p>
    </div>
  );
}
