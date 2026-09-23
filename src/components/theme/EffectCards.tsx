"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAmbient } from "./useAmbient";

/** ✨ การ์ดเลือกเอฟเฟกต์บรรยากาศในหน้าตั้งค่า ⚙️ — เปิดได้ทีละ 1 อย่าง */
export function EffectCards() {
  const { effect, effects, ready, reduced, choose } = useAmbient();
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {effects.map((e) => {
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
                {e.time && <span className="mt-1 block text-[12px] text-purple-700">🕐 แนะนำช่วง {e.time} — เปิดเวลาอื่นก็ได้ ระบบปรับสีให้มองเห็นชัดเอง</span>}
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
