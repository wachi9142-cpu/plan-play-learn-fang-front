"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Download, Save, Trash2, Upload } from "lucide-react";
import type { Scene } from "@/components/games/engines/SpotDiffGame";
import { SPOT_CATEGORIES } from "@/data/spot-diff";
import { SPOT_EVENT, customScenes, downloadSpotBackup, importSpot, newSceneId, removeScene, saveScene } from "@/lib/spot-store";
import { PageHeader, Tag } from "@/components/ui";
import { BackButton } from "@/components/ui/BackButton";
import { cn } from "@/lib/cn";

const PALETTE = ["🦁", "🐘", "🦒", "🐯", "🐼", "🐧", "🐢", "🐠", "🦋", "🐝", "🌳", "🌴", "🌻", "🌷", "🌺", "☀️", "☁️", "🌈", "⛱️", "🧸", "📚", "✏️", "🎒", "🪣", "🎈", "⭐", "🍎", "🍌", "🧁", "🚗"];
const SKY = ["#cbeafb", "#ffd9b8", "#9fd8ef", "#fdeccd", "#e8ddf7"];
const GROUND = ["#9ad6a8", "#f5e3b8", "#e7d2b0", "#5fb6d9", "#d8b982"];

const blank = (): Scene => ({
  id: newSceneId(), title: "ฉากใหม่", titleEn: "New Scene",
  sky: SKY[0], ground: GROUND[0], items: [], diffs: [],
});

/**
 * 👑 หลังบ้านเกมจับผิดภาพ — ครูสร้างฉากเองได้โดยไม่ต้องแก้โค้ด
 * วิธีใช้: เลือกอีโมจิ → คลิกบนภาพเพื่อวาง → ติ๊กว่าชิ้นไหนให้ต่างกัน → บันทึก
 */
export function SpotDiffAdmin() {
  const [catId, setCatId] = useState(SPOT_CATEGORIES[0].id);
  const [scene, setScene] = useState<Scene>(blank);
  const [brush, setBrush] = useState(PALETTE[0]);
  const [mine, setMine] = useState<Scene[]>([]);
  const [flash, setFlash] = useState(false);

  const sync = useCallback(() => setMine(customScenes(catId)), [catId]);
  useEffect(() => {
    sync();
    window.addEventListener(SPOT_EVENT, sync);
    return () => window.removeEventListener(SPOT_EVENT, sync);
  }, [sync]);

  const place = (e: React.MouseEvent<HTMLDivElement>) => {
    const b = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - b.left) / b.width) * 100);
    const y = Math.round(((e.clientY - b.top) / b.height) * 100);
    setScene((s) => ({ ...s, items: [...s.items, { emoji: brush, x, y, size: 340 }] }));
  };

  const removeItem = (idx: number) =>
    setScene((s) => ({
      ...s,
      items: s.items.filter((_, i) => i !== idx),
      diffs: s.diffs.filter((d) => d.index !== idx).map((d) => ({ ...d, index: d.index > idx ? d.index - 1 : d.index })),
    }));

  const toggleDiff = (idx: number) =>
    setScene((s) => {
      const has = s.diffs.some((d) => d.index === idx);
      return has
        ? { ...s, diffs: s.diffs.filter((d) => d.index !== idx) }
        : { ...s, diffs: [...s.diffs, { index: idx, hide: true }] };
    });

  const setDiffMode = (idx: number, mode: "hide" | "to" | "grow", to?: string) =>
    setScene((s) => ({
      ...s,
      diffs: s.diffs.map((d) => (d.index === idx
        ? mode === "hide" ? { index: idx, hide: true }
          : mode === "grow" ? { index: idx, grow: 1.35 }
          : { index: idx, to: to ?? brush }
        : d)),
    }));

  const save = () => {
    if (scene.items.length === 0 || scene.diffs.length === 0) {
      alert("วางของอย่างน้อย 1 ชิ้น และเลือกจุดที่ให้ต่างกันอย่างน้อย 1 จุดก่อนนะคะ");
      return;
    }
    saveScene(catId, scene);
    setFlash(true);
    setTimeout(() => setFlash(false), 1500);
  };

  const preview = (right: boolean) => {
    const items = scene.items.map((it) => ({ ...it }));
    if (right) scene.diffs.forEach((d) => {
      const it = items[d.index]; if (!it) return;
      if (d.hide) it.emoji = ""; else if (d.to) it.emoji = d.to;
      if (d.grow) it.size = Math.round(it.size * d.grow);
    });
    return items;
  };

  const Pic = ({ right }: { right: boolean }) => (
    <div
      onClick={right ? undefined : place}
      className={cn("relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-4 border-purple-200", !right && "cursor-crosshair")}
      style={{ background: `linear-gradient(${scene.sky} 0%, ${scene.sky} 62%, ${scene.ground} 62%, ${scene.ground} 100%)` }}
    >
      {preview(right).map((it, k) => it.emoji ? (
        <span key={k} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 leading-none"
          style={{ left: `${it.x}%`, top: `${it.y}%`, fontSize: `${it.size}%` }}>{it.emoji}</span>
      ) : null)}
      <span className="absolute left-2 top-2 rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-medium text-purple-800">
        {right ? "ภาพขวา (ของที่ต่าง)" : "ภาพซ้าย — คลิกเพื่อวางของ"}
      </span>
    </div>
  );

  return (
    <div className="container-page py-8 sm:py-12">
      <BackButton fallback="/admin" label="ผู้ดูแลระบบ" />
      <PageHeader emoji="👀" title="สร้างฉากจับผิดภาพ" description="วางของบนภาพซ้าย แล้วเลือกว่าชิ้นไหนให้ต่างกันในภาพขวา — ไม่ต้องแก้โค้ด">
        <div className="flex flex-wrap gap-2">
          <Tag tone="purple">🗂️ {SPOT_CATEGORIES.length} หมวด</Tag>
          <Tag tone="sky">🖼️ ฉากของครู {mine.length} ฉาก</Tag>
          <Link href="/games/spot-diff" className="tap rounded-full bg-cream-dark px-3 py-0.5 text-[13px] font-medium leading-6 text-purple-700 hover:brightness-95">👀 ลองเล่น</Link>
        </div>
      </PageHeader>

      {/* ตั้งค่าฉาก */}
      <div className="card mb-4 grid gap-3 p-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[13px] text-ink-soft">🗂️ หมวด</span>
          <select value={catId} onChange={(e) => setCatId(e.target.value)}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[15px] text-ink outline-none focus:border-purple-400">
            {SPOT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[13px] text-ink-soft">ชื่อฉาก (ไทย)</span>
          <input value={scene.title} onChange={(e) => setScene({ ...scene, title: e.target.value })}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[15px] text-ink outline-none focus:border-purple-400" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[13px] text-ink-soft">ชื่อฉาก (อังกฤษ)</span>
          <input value={scene.titleEn} onChange={(e) => setScene({ ...scene, titleEn: e.target.value })}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[15px] text-ink outline-none focus:border-purple-400" />
        </label>
        <div className="flex flex-wrap gap-3">
          <div>
            <span className="mb-1 block text-[13px] text-ink-soft">สีท้องฟ้า</span>
            <div className="flex gap-1.5">
              {SKY.map((c) => (
                <button key={c} type="button" onClick={() => setScene({ ...scene, sky: c })}
                  aria-label={`สีท้องฟ้า ${c}`}
                  className={cn("size-8 rounded-lg border-2", scene.sky === c ? "border-purple-600" : "border-white")} style={{ background: c }} />
              ))}
            </div>
          </div>
          <div>
            <span className="mb-1 block text-[13px] text-ink-soft">สีพื้น</span>
            <div className="flex gap-1.5">
              {GROUND.map((c) => (
                <button key={c} type="button" onClick={() => setScene({ ...scene, ground: c })}
                  aria-label={`สีพื้น ${c}`}
                  className={cn("size-8 rounded-lg border-2", scene.ground === c ? "border-purple-600" : "border-white")} style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* อีโมจิที่จะวาง */}
      <p className="mb-2 text-[14px] text-ink-soft">1️⃣ เลือกของที่จะวาง แล้วคลิกบนภาพซ้าย</p>
      <div className="mb-4 grid grid-cols-8 gap-1.5 sm:grid-cols-15">
        {PALETTE.map((e) => (
          <button key={e} type="button" onClick={() => setBrush(e)} aria-label={`เลือก ${e}`}
            className={cn("tap grid aspect-square place-items-center rounded-xl border-2 bg-white text-xl transition",
              brush === e ? "scale-110 border-purple-500! shadow-soft" : "border-line hover:bg-cream")}>
            {e}
          </button>
        ))}
      </div>

      {/* ภาพซ้าย-ขวา */}
      <div className="mb-4 grid gap-3 lg:grid-cols-2">
        <Pic right={false} />
        <Pic right />
      </div>

      {/* รายการของที่วางไว้ */}
      <p className="mb-2 text-[14px] text-ink-soft">2️⃣ ติ๊กว่าชิ้นไหนให้ต่างกันในภาพขวา</p>
      {scene.items.length === 0 ? (
        <p className="card p-4 text-center text-[14px] text-ink-soft">ยังไม่ได้วางของเลย — คลิกบนภาพซ้ายเพื่อวาง</p>
      ) : (
        <div className="mb-4 grid gap-1.5">
          {scene.items.map((it, idx) => {
            const d = scene.diffs.find((x) => x.index === idx);
            return (
              <div key={idx} className="card flex flex-wrap items-center gap-2 p-2.5">
                <span className="text-2xl">{it.emoji}</span>
                <span className="text-[13px] text-ink-soft">ตำแหน่ง {it.x}%, {it.y}%</span>
                <label className="ml-auto flex items-center gap-1.5 text-[13px]">
                  <input type="checkbox" checked={!!d} onChange={() => toggleDiff(idx)} className="size-4 accent-purple-600" />
                  ให้ต่างกัน
                </label>
                {d && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {([["hide", "ซ่อนไป"], ["to", `เปลี่ยนเป็น ${brush}`], ["grow", "ขยายใหญ่ขึ้น"]] as const).map(([m, label]) => (
                      <button key={m} type="button" onClick={() => setDiffMode(idx, m)}
                        className={cn("tap rounded-full px-2.5 py-1 text-[12px] font-medium transition",
                          (m === "hide" && d.hide) || (m === "to" && d.to) || (m === "grow" && d.grow)
                            ? "bg-purple-600 text-white!" : "bg-cream-dark text-purple-700 hover:brightness-95")}>
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                <button type="button" onClick={() => removeItem(idx)} aria-label="ลบของชิ้นนี้"
                  className="tap rounded-lg px-1.5 py-1 text-[#a8456c] hover:bg-pink-soft"><Trash2 size={15} /></button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={save}
          className={cn("tap inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[15px] font-medium text-white shadow-soft transition",
            flash ? "bg-[#1f6b4d]" : "bg-purple-600 hover:bg-purple-700")}>
          <Save size={16} /> {flash ? "บันทึกแล้ว" : "บันทึกฉากนี้"}
        </button>
        <button type="button" onClick={() => setScene(blank())}
          className="tap rounded-full bg-cream-dark px-5 py-2.5 text-[15px] font-medium text-purple-700 hover:brightness-95">
          ✨ เริ่มฉากใหม่
        </button>
        <button type="button" onClick={() => { const n = downloadSpotBackup(); alert(`สำรองไว้แล้ว: ${n}`); }}
          className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-5 py-2.5 text-[15px] font-medium text-purple-700 hover:brightness-95">
          <Download size={16} /> สำรองเป็นไฟล์
        </button>
        <label className="tap inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-cream-dark px-5 py-2.5 text-[15px] font-medium text-purple-700 hover:brightness-95">
          <Upload size={16} /> นำไฟล์สำรองกลับเข้ามา
          <input type="file" accept="application/json,.json" className="hidden"
            onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ""; if (!f) return; alert(importSpot(await f.text()).message); }} />
        </label>
      </div>

      {/* ฉากที่ครูสร้างไว้ */}
      {mine.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-xl">🖼️ ฉากที่ครูสร้างไว้ในหมวดนี้</h2>
          <div className="grid gap-2">
            {mine.map((s) => (
              <div key={s.id} className="card flex items-center gap-3 p-3">
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[15px] text-purple-800">{s.title}</span>
                  <span className="text-[13px] text-ink-soft">{s.titleEn} · ของ {s.items.length} ชิ้น · จุดต่าง {s.diffs.length} จุด</span>
                </span>
                <button type="button" onClick={() => setScene(s)}
                  className="tap rounded-full bg-cream-dark px-3 py-1.5 text-[13px] font-medium text-purple-700">แก้ไข</button>
                <button type="button" onClick={() => { if (confirm(`ลบฉาก “${s.title}”?`)) removeScene(catId, s.id); }}
                  aria-label="ลบฉาก" className="tap rounded-lg px-1.5 py-1 text-[#a8456c] hover:bg-pink-soft"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="mt-6 rounded-2xl bg-yellow-soft px-4 py-3 text-[13px] leading-relaxed text-[#8a6a00]">
        💾 ฉากที่ครูสร้างเก็บไว้ในเครื่องนี้เครื่องเดียว — กดสำรองเป็นไฟล์เก็บไว้ด้วยนะคะ
      </p>
    </div>
  );
}
