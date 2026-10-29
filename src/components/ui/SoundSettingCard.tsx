"use client";

import { useEffect, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import {
  DEFAULT_SFX_CONFIG,
  SFX_AREAS,
  SFX_EVENT,
  SFX_GROUPS,
  SFX_TONES,
  playSfx,
  readSfxConfig,
  resetSfxConfig,
  setSfxOn,
  sfxOn,
  writeSfxConfig,
  type SfxArea,
  type SfxConfig,
  type SfxGroup,
  type SfxName,
  type SfxTone,
} from "@/lib/sfx";
import { Switch } from "@/components/theme/ThemeMenuPanel";
import { cn } from "@/lib/cn";

const VOLUMES = [
  { v: 0.5, label: "🔈 เบา" },
  { v: 1, label: "🔉 ปกติ" },
  { v: 1.5, label: "🔊 ดัง" },
];

/** เสียงตัวอย่างของแต่ละจังหวะ เวลากด "ลองฟัง" */
const SAMPLE: Record<SfxGroup, SfxName> = { correct: "correct", wrong: "wrong", win: "win", coin: "coin", tap: "pop", board: "ladder" };

/**
 * 🔊 ตั้งค่าเสียงเอฟเฟกต์ (ไม่ใช่เสียงพูด)
 * สวิตช์ใหญ่ · ความดัง · แต่ละหมวด (เกมการศึกษา / เกมเล่นสนุก / แฟลชการ์ด) เลือกโทนเองได้ · เลือกจังหวะที่มีเสียง
 */
export function SoundSettingCard() {
  const [on, setOn] = useState(true);
  const [cfg, setCfg] = useState<SfxConfig>(DEFAULT_SFX_CONFIG);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const read = () => { setOn(sfxOn()); setCfg(readSfxConfig()); };
    read();
    setReady(true);
    window.addEventListener(SFX_EVENT, read);
    window.addEventListener("storage", read);
    return () => { window.removeEventListener(SFX_EVENT, read); window.removeEventListener("storage", read); };
  }, []);

  const save = (next: SfxConfig) => { setCfg(next); writeSfxConfig(next); };
  const setArea = (a: SfxArea, patch: Partial<SfxConfig["areas"][SfxArea]>) => save({ ...cfg, areas: { ...cfg.areas, [a]: { ...cfg.areas[a], ...patch } } });
  const toggleMaster = () => {
    const next = !on;
    setSfxOn(next);
    setOn(next);
    if (next) playSfx("correct", { preview: true });
  };
  /** ลองฟังทั้งชุด: ถูก → ได้แต้ม → ชนะ */
  const demo = (tone: SfxTone) => {
    playSfx("correct", { tone, preview: true });
    setTimeout(() => playSfx("coin", { tone, preview: true }), 420);
    setTimeout(() => playSfx("win", { tone, preview: true }), 850);
  };

  return (
    <div className="grid gap-3">
      {/* สวิตช์ใหญ่ */}
      <div className="card flex items-center gap-3 p-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-purple-50 text-2xl">{on ? "🔊" : "🔇"}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[16px] text-purple-800">เสียงเอฟเฟกต์ทั้งหมด</span>
          <span className="mt-0.5 block text-[13px] leading-snug text-ink-soft">
            {on ? "เปิดอยู่ — เสียงดนตรีสั้น ๆ ตอนตอบถูก ได้ดาว และจบเกม (ไม่มีเสียงพูด)" : "ปิดอยู่ — ทุกหมวดเงียบหมด เหมาะกับห้องเรียนหรือตอนกลางคืน"}
          </span>
        </span>
        <button type="button" role="switch" aria-checked={on} aria-label={on ? "ปิดเสียงเอฟเฟกต์ทั้งหมด" : "เปิดเสียงเอฟเฟกต์ทั้งหมด"} onClick={toggleMaster}>
          <Switch on={ready && on} />
        </button>
      </div>

      <div className={cn("grid gap-3 transition-opacity", !on && "pointer-events-none opacity-50")} aria-disabled={!on}>
        {/* ความดัง */}
        <div className="card flex flex-wrap items-center gap-2 p-4">
          <span className="mr-auto font-display text-[15px] text-purple-800">ความดัง</span>
          {VOLUMES.map((x) => (
            <button
              key={x.v}
              type="button"
              aria-pressed={cfg.volume === x.v}
              onClick={() => { save({ ...cfg, volume: x.v }); setTimeout(() => playSfx("correct", { preview: true }), 30); }}
              className={cn("tap rounded-full border px-3.5 py-1.5 text-[14px]", cfg.volume === x.v ? "border-purple-400 bg-purple-600 text-white" : "border-line bg-white text-purple-700 hover:bg-purple-50")}
            >
              {x.label}
            </button>
          ))}
        </div>

        {/* แต่ละหมวด: เปิด/ปิด + เลือกโทน */}
        {(Object.keys(SFX_AREAS) as SfxArea[]).map((a) => {
          const area = cfg.areas[a];
          return (
            <div key={a} className="card p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-purple-50 text-2xl">{SFX_AREAS[a].emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[16px] text-purple-800">{SFX_AREAS[a].label}</span>
                  <span className="block text-[12px] leading-snug text-ink-soft">{SFX_AREAS[a].hint}</span>
                </span>
                <button type="button" role="switch" aria-checked={area.on} aria-label={`${area.on ? "ปิด" : "เปิด"}เสียงหมวด${SFX_AREAS[a].label}`} onClick={() => setArea(a, { on: !area.on })}>
                  <Switch on={ready && area.on} />
                </button>
              </div>
              <div className={cn("mt-3 flex flex-wrap gap-1.5", !area.on && "opacity-40")}>
                {(Object.keys(SFX_TONES) as SfxTone[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={area.tone === t}
                    disabled={!area.on}
                    title={SFX_TONES[t].hint}
                    onClick={() => { setArea(a, { tone: t }); demo(t); }}
                    className={cn("tap rounded-full border px-3 py-1.5 text-[13px]", area.tone === t ? "border-purple-400 bg-purple-600 text-white" : "border-line bg-white text-purple-700 hover:bg-purple-50")}
                  >
                    {SFX_TONES[t].emoji} {SFX_TONES[t].label}
                  </button>
                ))}
                <button type="button" disabled={!area.on} onClick={() => demo(area.tone)} className="tap ml-auto inline-flex items-center gap-1 rounded-full bg-cream-dark px-3 py-1.5 text-[13px] text-purple-700 hover:brightness-95">
                  <Play size={13} /> ลองฟัง
                </button>
              </div>
            </div>
          );
        })}

        {/* จังหวะที่มีเสียง */}
        <div className="card p-4">
          <p className="font-display text-[16px] text-purple-800">มีเสียงตอนไหนบ้าง</p>
          <p className="text-[12px] text-ink-soft">ใช้กับทุกหมวด — ปิดจังหวะที่ไม่อยากได้ยินได้ เช่น ปิดเสียงตอบผิด</p>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {(Object.keys(SFX_GROUPS) as SfxGroup[]).map((g) => (
              <li key={g} className="flex items-center gap-2 rounded-2xl border border-line bg-cream-dark/40 px-3 py-2">
                <span className="text-xl">{SFX_GROUPS[g].emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium text-purple-800">{SFX_GROUPS[g].label}</span>
                  <span className="block text-[12px] leading-snug text-ink-soft">{SFX_GROUPS[g].hint}</span>
                </span>
                <button type="button" aria-label={`ลองฟังเสียง${SFX_GROUPS[g].label}`} onClick={() => playSfx(SAMPLE[g], { preview: true })} className="grid size-8 place-items-center rounded-full text-purple-600 hover:bg-white">
                  <Play size={14} />
                </button>
                <button type="button" role="switch" aria-checked={cfg.groups[g]} aria-label={`${cfg.groups[g] ? "ปิด" : "เปิด"}เสียง${SFX_GROUPS[g].label}`} onClick={() => save({ ...cfg, groups: { ...cfg.groups, [g]: !cfg.groups[g] } })}>
                  <Switch on={ready && cfg.groups[g]} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={() => { if (confirm("คืนค่าเสียงทั้งหมดกลับเป็นค่าเริ่มต้น?")) resetSfxConfig(); }}
          className="tap inline-flex items-center gap-1.5 justify-self-start rounded-full border border-line px-3.5 py-1.5 text-[13px] text-ink-soft hover:bg-purple-50"
        >
          <RotateCcw size={14} /> คืนค่าเริ่มต้น
        </button>
      </div>
    </div>
  );
}
