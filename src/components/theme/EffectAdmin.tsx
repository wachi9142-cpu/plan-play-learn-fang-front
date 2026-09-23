"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import {
  EFFECT_CONFIG_EVENT,
  SEASONS,
  listEffects,
  resetEffectConfig,
  updateEffect,
  type EffectDef,
  type EffectSeason,
} from "@/lib/ambient-effects";
import { cn } from "@/lib/cn";
import { Switch } from "./ThemeMenuPanel";

/**
 * ✨ ผู้ดูแลระบบจัดการเอฟเฟกต์บรรยากาศ
 * แก้ชื่อ · คำอธิบาย · เปิด/ปิด · ฤดูที่แนะนำ · ช่วงเวลาที่แนะนำ · ลำดับการแสดง
 * (เก็บทับไว้ในเครื่อง — ไม่ต้องแก้โค้ด · เอฟเฟกต์ใหม่ที่เพิ่มในโค้ดจะโผล่ที่นี่เอง)
 */
export function EffectAdmin() {
  const [items, setItems] = useState<EffectDef[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const load = () => setItems(listEffects());
    load();
    window.addEventListener(EFFECT_CONFIG_EVENT, load);
    return () => window.removeEventListener(EFFECT_CONFIG_EVENT, load);
  }, []);

  if (items.length === 0) return null;

  /** สลับตำแหน่งกับรายการข้างบน/ข้างล่าง */
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    updateEffect(items[i].id, { order: items[j].order });
    updateEffect(items[j].id, { order: items[i].order });
  };

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-xl">✨ จัดการเอฟเฟกต์บรรยากาศ</h3>
          <p className="mt-1 text-[13px] text-ink-soft">
            เปิด/ปิด แก้ชื่อ คำอธิบาย ฤดูที่แนะนำ และลำดับการแสดงผล — ผู้ใช้จะเห็นเฉพาะเอฟเฟกต์ที่เปิดไว้
          </p>
        </div>
        <button
          type="button"
          onClick={() => { if (confirm("คืนค่าเอฟเฟกต์ทั้งหมดกลับเป็นค่าเริ่มต้น?")) resetEffectConfig(); }}
          className="tap inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-[13px] text-ink-soft hover:bg-purple-50"
        >
          <RotateCcw size={14} /> คืนค่าเริ่มต้น
        </button>
      </div>

      <ul className="mt-4 grid gap-2">
        {items.map((e, i) => {
          const editing = open === e.id;
          const locked = e.id === "none";
          return (
            <li key={e.id} className={cn("rounded-2xl border border-line", editing ? "bg-purple-50" : "bg-cream-dark/40")}>
              <div className="flex items-center gap-2 p-2.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-xl">{e.emoji}</span>
                <button type="button" onClick={() => setOpen(editing ? null : e.id)} className="min-w-0 flex-1 text-left">
                  <span className="block truncate font-display text-[15px] text-purple-800">{e.label}</span>
                  <span className="block truncate text-[12px] text-ink-soft">
                    {SEASONS[e.season]}{e.time ? ` · 🕐 ${e.time}` : ""} · ลำดับ {e.order}
                  </span>
                </button>
                <span className="flex shrink-0 items-center gap-1">
                  <button type="button" aria-label="เลื่อนขึ้น" onClick={() => move(i, -1)} disabled={i === 0} className="grid size-7 place-items-center rounded-lg text-ink-soft hover:bg-white disabled:opacity-30"><ChevronUp size={16} /></button>
                  <button type="button" aria-label="เลื่อนลง" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="grid size-7 place-items-center rounded-lg text-ink-soft hover:bg-white disabled:opacity-30"><ChevronDown size={16} /></button>
                  <button
                    type="button"
                    onClick={() => !locked && updateEffect(e.id, { enabled: !e.enabled })}
                    disabled={locked}
                    aria-label={e.enabled ? "ปิดเอฟเฟกต์นี้" : "เปิดเอฟเฟกต์นี้"}
                    title={locked ? "“ไม่มีเอฟเฟกต์” ต้องเปิดไว้เสมอ เพื่อให้ผู้ใช้ปิดเอฟเฟกต์ได้" : undefined}
                    className="ml-1 disabled:opacity-50"
                  >
                    <Switch on={e.enabled} />
                  </button>
                </span>
              </div>

              {editing && (
                <div className="grid gap-2 border-t border-line p-3 text-[13px] sm:grid-cols-2">
                  <label className="grid gap-1 sm:col-span-2">
                    <span className="text-ink-soft">ชื่อที่แสดง</span>
                    <input value={e.label} onChange={(ev) => updateEffect(e.id, { label: ev.target.value })} className="rounded-lg border border-line bg-white px-3 py-1.5" />
                  </label>
                  <label className="grid gap-1 sm:col-span-2">
                    <span className="text-ink-soft">คำอธิบาย</span>
                    <textarea value={e.hint} rows={2} onChange={(ev) => updateEffect(e.id, { hint: ev.target.value })} className="rounded-lg border border-line bg-white px-3 py-1.5" />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-ink-soft">ฤดู/ช่วงที่แนะนำ</span>
                    <select value={e.season} onChange={(ev) => updateEffect(e.id, { season: ev.target.value as EffectSeason })} className="rounded-lg border border-line bg-white px-3 py-1.5">
                      {Object.entries(SEASONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-1">
                    <span className="text-ink-soft">ช่วงเวลาที่แนะนำ (ไม่บังคับ)</span>
                    <input value={e.time ?? ""} placeholder="เช่น 18:00–06:00" onChange={(ev) => updateEffect(e.id, { time: ev.target.value })} className="rounded-lg border border-line bg-white px-3 py-1.5" />
                  </label>
                  <p className="text-[12px] leading-snug text-ink-soft sm:col-span-2">
                    💬 ช่วงเวลาที่แนะนำเป็นเพียงคำแนะนำ — ผู้ใช้ยังเปิดเอฟเฟกต์นี้เวลาไหนก็ได้ และระบบจะปรับสีให้มองเห็นชัดตามธีมเอง
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
