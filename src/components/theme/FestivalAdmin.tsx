"use client";

import { useEffect, useState } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { BUILT_IN_EFFECTS } from "@/lib/ambient-effects";
import {
  FESTIVAL_EVENT,
  addFestival,
  defaultWindow,
  festivalsToday,
  listFestivals,
  removeFestival,
  resetFestivals,
  todayInThailand,
  updateFestival,
  type Festival,
} from "@/lib/festival-schedule";
import { cn } from "@/lib/cn";
import { Switch } from "./ThemeMenuPanel";

/** เอฟเฟกต์ที่ใช้เป็นเทศกาลได้ */
const FESTIVAL_EFFECTS = BUILT_IN_EFFECTS.filter((e) => e.season === "festival");
const emojiOf = (id: string) => BUILT_IN_EFFECTS.find((e) => e.id === id)?.emoji ?? "🎆";

/**
 * 🎆 ผู้ดูแลระบบตั้งตารางเอฟเฟกต์เทศกาล
 * แก้วันเทศกาล (วันเริ่ม–สิ้นสุดเลื่อนตามให้ ±1 วัน) · แก้วันเริ่ม/สิ้นสุดเอง · ลำดับความสำคัญ · เปิด/ปิด · เพิ่มงานของปีถัดไป
 */
export function FestivalAdmin() {
  const [items, setItems] = useState<Festival[]>([]);
  const [today, setToday] = useState("");
  const [draft, setDraft] = useState({ effectId: FESTIVAL_EFFECTS[0]?.id ?? "", name: "", date: "" });

  useEffect(() => {
    const load = () => { setItems(listFestivals()); setToday(todayInThailand()); };
    load();
    window.addEventListener(FESTIVAL_EVENT, load);
    const tick = window.setInterval(load, 60_000);
    return () => { window.removeEventListener(FESTIVAL_EVENT, load); window.clearInterval(tick); };
  }, []);

  const running = festivalsToday(items);
  const showing = running[0];

  const add = () => {
    if (!draft.effectId || !draft.date) return;
    const fx = BUILT_IN_EFFECTS.find((e) => e.id === draft.effectId);
    addFestival({
      effectId: draft.effectId,
      name: draft.name.trim() || `${fx?.label.split(" — ")[1] ?? fx?.label ?? "เทศกาล"} ${Number(draft.date.slice(0, 4)) + 543}`,
      date: draft.date,
      ...defaultWindow(draft.date),
      enabled: true,
      priority: 10,
    });
    setDraft({ ...draft, name: "", date: "" });
  };

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-xl">🎆 ตารางเอฟเฟกต์เทศกาล</h3>
          <p className="mt-1 text-[13px] text-ink-soft">
            ถึงช่วงเทศกาล ระบบเปิดเอฟเฟกต์ให้ทุกคนเอง แล้วปิดเองเมื่อครบกำหนด · ค่าเริ่มต้นเปิด 3 วัน (ก่อนวันงาน 1 วัน · วันงาน · หลังวันงาน 1 วัน)
          </p>
        </div>
        <button
          type="button"
          onClick={() => { if (confirm("คืนค่าตารางเทศกาลกลับเป็นค่าเริ่มต้น? รายการที่เพิ่มเองจะหายไป")) resetFestivals(); }}
          className="tap inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-[13px] text-ink-soft hover:bg-purple-50"
        >
          <RotateCcw size={14} /> คืนค่าเริ่มต้น
        </button>
      </div>

      <p className="mt-3 rounded-2xl bg-purple-50 px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
        🕐 วันนี้ตามเวลาไทย: <b className="text-purple-700">{today}</b>
        {showing ? (
          <> · กำลังเปิด <b className="text-purple-700">{emojiOf(showing.effectId)} {showing.name}</b>{running.length > 1 && <> (ตรงกับอีก {running.length - 1} งาน — แสดงงานที่ลำดับความสำคัญสูงกว่าเพียงงานเดียว)</>}</>
        ) : " · ตอนนี้ไม่มีเทศกาลที่เปิดอยู่"}
        <br />
        🔢 ลำดับความสำคัญ: <b className="text-purple-700">เลขน้อยชนะ</b> เมื่อหลายงานตรงกัน · ผู้ใช้ปิดเอฟเฟกต์เทศกาลในเครื่องตัวเองได้ที่หน้าตั้งค่า · หน้าเกม ใบงาน Studio และห้องเรียนออนไลน์ยังปิดเอฟเฟกต์ตามเดิม
      </p>

      <ul className="mt-4 grid gap-2">
        {items.map((f) => {
          const live = showing?.id === f.id;
          const past = today > f.end;
          return (
            <li key={f.id} className={cn("rounded-2xl border border-line p-3 text-[13px]", live ? "bg-purple-50 ring-2 ring-purple-300" : "bg-cream-dark/40", past && "opacity-60")}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-xl">{emojiOf(f.effectId)}</span>
                <input
                  value={f.name}
                  onChange={(ev) => updateFestival(f.id, { name: ev.target.value })}
                  aria-label="ชื่อเทศกาล"
                  className="min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-1.5 font-display text-[15px] text-purple-800"
                />
                {live && <span className="rounded-full bg-purple-600 px-2.5 py-0.5 text-[12px] text-white">กำลังเปิด</span>}
                {past && <span className="rounded-full bg-line px-2.5 py-0.5 text-[12px] text-ink-soft">ผ่านไปแล้ว</span>}
                {f.unconfirmed && (
                  <button
                    type="button"
                    onClick={() => updateFestival(f.id, { unconfirmed: false })}
                    title="วันเทศกาลตามจันทรคติเปลี่ยนทุกปี — ตรวจวันจัดงานจริงแล้วกดยืนยัน"
                    className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[12px] text-amber-800 hover:bg-amber-200"
                  >
                    ⚠️ รอยืนยันวันที่ · กดยืนยัน
                  </button>
                )}
                <button type="button" onClick={() => updateFestival(f.id, { enabled: !f.enabled })} aria-label={f.enabled ? "ปิดงานนี้" : "เปิดงานนี้"}>
                  <Switch on={f.enabled} />
                </button>
                <button
                  type="button"
                  aria-label="ลบงานนี้"
                  onClick={() => { if (confirm(`ลบ “${f.name}” ออกจากตาราง?`)) removeFestival(f.id); }}
                  className="grid size-8 place-items-center rounded-lg text-ink-soft hover:bg-white hover:text-red-500"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="mt-2 grid gap-2 sm:grid-cols-5">
                <label className="grid gap-1">
                  <span className="text-ink-soft">เอฟเฟกต์</span>
                  <select value={f.effectId} onChange={(ev) => updateFestival(f.id, { effectId: ev.target.value })} className="rounded-lg border border-line bg-white px-2 py-1.5">
                    {FESTIVAL_EFFECTS.map((e) => <option key={e.id} value={e.id}>{e.emoji} {e.label}</option>)}
                  </select>
                </label>
                <label className="grid gap-1">
                  <span className="text-ink-soft">วันเทศกาล</span>
                  <input
                    type="date"
                    value={f.date}
                    // เปลี่ยนวันงาน → ตั้งช่วงเปิดใหม่เป็นค่าเริ่มต้น ±1 วัน (แก้วันเริ่ม/สิ้นสุดเองทีหลังได้)
                    onChange={(ev) => ev.target.value && updateFestival(f.id, { date: ev.target.value, ...defaultWindow(ev.target.value), unconfirmed: false })}
                    className="rounded-lg border border-line bg-white px-2 py-1.5"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-ink-soft">เริ่มเปิด</span>
                  <input type="date" value={f.start} max={f.end} onChange={(ev) => ev.target.value && updateFestival(f.id, { start: ev.target.value })} className="rounded-lg border border-line bg-white px-2 py-1.5" />
                </label>
                <label className="grid gap-1">
                  <span className="text-ink-soft">ปิดหลังวันที่</span>
                  <input type="date" value={f.end} min={f.start} onChange={(ev) => ev.target.value && updateFestival(f.id, { end: ev.target.value })} className="rounded-lg border border-line bg-white px-2 py-1.5" />
                </label>
                <label className="grid gap-1">
                  <span className="text-ink-soft">ลำดับความสำคัญ</span>
                  <input type="number" min={1} value={f.priority} onChange={(ev) => updateFestival(f.id, { priority: Number(ev.target.value) || 1 })} className="rounded-lg border border-line bg-white px-2 py-1.5" />
                </label>
              </div>
            </li>
          );
        })}
      </ul>

      {/* ➕ เพิ่มเทศกาลของปีถัดไป หรืองานใหม่ */}
      <div className="mt-4 rounded-2xl border border-dashed border-purple-300 p-3 text-[13px]">
        <p className="font-medium text-purple-800">➕ เพิ่มเทศกาล (เช่น ลอยกระทงปีหน้า)</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1.4fr_1fr_auto]">
          <select value={draft.effectId} onChange={(ev) => setDraft({ ...draft, effectId: ev.target.value })} aria-label="เอฟเฟกต์" className="rounded-lg border border-line bg-white px-2 py-1.5">
            {FESTIVAL_EFFECTS.map((e) => <option key={e.id} value={e.id}>{e.emoji} {e.label}</option>)}
          </select>
          <input value={draft.name} onChange={(ev) => setDraft({ ...draft, name: ev.target.value })} placeholder="ชื่องาน (ไม่ใส่ก็ได้)" aria-label="ชื่องาน" className="rounded-lg border border-line bg-white px-3 py-1.5" />
          <input type="date" value={draft.date} onChange={(ev) => setDraft({ ...draft, date: ev.target.value })} aria-label="วันเทศกาล" className="rounded-lg border border-line bg-white px-2 py-1.5" />
          <button type="button" onClick={add} disabled={!draft.date} className="tap inline-flex items-center justify-center gap-1.5 rounded-full bg-purple-600 px-4 py-1.5 text-white disabled:opacity-50">
            <Plus size={14} /> เพิ่ม
          </button>
        </div>
        <p className="mt-2 text-[12px] text-ink-soft">ระบบตั้งช่วงเปิดให้ก่อน–หลังวันงาน 1 วันอัตโนมัติ แล้วแก้วันเริ่ม/สิ้นสุดเองได้ในรายการด้านบน</p>
      </div>
    </div>
  );
}
