"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GAMES } from "@/data/games";
import { cn } from "@/lib/cn";
import { LEVELS, type Difficulty } from "@/lib/game-levels";
import { GAME_EVENT, getSettings, listResults, players, saveSettings, setChildLevel, setRoomLevel, type GameSettings } from "@/lib/game-store";
import { listRooms } from "@/lib/classroom-store";
import { Avatar } from "@/components/profile/Avatar";

/** 📊 พัฒนาการการเล่นเกมของเด็กแต่ละคน + ครูกำหนดระดับ/ปรับอัตโนมัติ — ไม่จัดอันดับเด็ก */
export function GameProgress() {
  const [tick, setTick] = useState(0);
  const [s, setS] = useState<GameSettings | null>(null);
  const [pick, setPick] = useState<string>("");
  useEffect(() => { const l = () => { setS(getSettings()); setTick((t) => t + 1); }; l(); window.addEventListener(GAME_EVENT, l); return () => window.removeEventListener(GAME_EVENT, l); }, []);
  if (!s) return null;
  const results = listResults(); const kids = players(); const rooms = listRooms();
  const fmt = (iso: string) => new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  void tick;

  return (
    <div className="space-y-6">
      {/* ตั้งค่าโดยครู */}
      <section className="card p-4">
        <h2 className="text-lg">👩‍🏫 ครูกำหนดระดับ</h2>
        <p className="text-[13px] text-ink-soft">เด็กเลือกระดับเองได้เสมอ — ครูกำหนดค่าเริ่มต้นต่อห้องหรือต่อเด็กเพื่อให้เหมาะกับความพร้อมของแต่ละคน</p>
        <label className="mt-3 flex items-center gap-2 text-[14px]"><input type="checkbox" checked={s.autoAdjust} onChange={(e) => saveSettings({ ...s, autoAdjust: e.target.checked })} className="size-4" /> 🔄 ปรับความยากอัตโนมัติ (ได้ 5 ดาว 2 ครั้งติด → แนะนำขึ้นระดับ · ระดับยากได้ ≤2 ดาว 2 ครั้งติด → แนะนำกลับไปฝึกระดับก่อนหน้า)</label>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
          <span>🏫 ห้องของเครื่องนี้</span>
          <select value={s.roomId ?? ""} onChange={(e) => saveSettings({ ...s, roomId: e.target.value || undefined })} className="rounded-lg border border-line bg-white px-2 py-1.5"><option value="">— ไม่ระบุ —</option>{rooms.map((r) => <option key={r.id} value={r.id}>{r.emoji} {r.nickname} · {r.code}</option>)}</select>
        </div>
        {s.roomId && (
          <div className="mt-3 overflow-x-auto">
            <p className="mb-1 text-[13px] font-medium">ระดับเริ่มต้นของห้อง (ทุกเกม / รายเกม)</p>
            <table className="min-w-[480px] text-[13px]">
              <tbody>
                {[{ id: "*", title: "✨ ทุกเกม", emoji: "" }, ...GAMES].map((g) => (
                  <tr key={g.id} className="border-b border-line/60"><td className="py-1 pr-3">{g.emoji} {g.title}</td><td><LevelPick value={s.roomLevels[s.roomId!]?.[g.id] ?? ""} onChange={(v) => setRoomLevel(s.roomId!, g.id, v)} /></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
          <span>🧒 กำหนดเฉพาะเด็ก</span>
          <select value={pick} onChange={(e) => setPick(e.target.value)} className="rounded-lg border border-line bg-white px-2 py-1.5"><option value="">— เลือกเด็ก —</option>{Array.from(new Set([...kids, ...Object.keys(s.childLevels)])).map((k) => <option key={k} value={k}>{k}</option>)}</select>
          <input placeholder="หรือพิมพ์ชื่อใหม่" onKeyDown={(e) => { if (e.key === "Enter") { setPick((e.target as HTMLInputElement).value.trim()); } }} className="rounded-lg border border-line px-2 py-1.5" />
        </div>
        {pick && (
          <div className="mt-2 overflow-x-auto">
            <table className="min-w-[480px] text-[13px]"><tbody>
              {[{ id: "*", title: "✨ ทุกเกม", emoji: "" }, ...GAMES].map((g) => (
                <tr key={g.id} className="border-b border-line/60"><td className="py-1 pr-3">{g.emoji} {g.title}</td><td><LevelPick value={s.childLevels[pick]?.[g.id] ?? ""} onChange={(v) => setChildLevel(pick, g.id, v)} /></td></tr>
              ))}
            </tbody></table>
          </div>
        )}
      </section>

      {/* พัฒนาการรายเด็ก */}
      <section>
        <h2 className="text-lg">📊 ผลการเล่นของเด็กแต่ละคน</h2>
        <p className="text-[13px] text-ink-soft">แสดงว่าเด็กเล่นอะไรไปแล้วและมีพัฒนาการอย่างไร — เด็กแต่ละคนมีพัฒนาการต่างกัน จึงไม่มีการจัดอันดับ</p>
        {kids.length === 0 && <div className="card mt-3 p-6 text-center text-[14px] text-ink-soft">ยังไม่มีผลการเล่น — เมื่อเด็กเล่นเกมและใส่ชื่อ ผลจะมาแสดงที่นี่</div>}
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {kids.map((k) => {
            const mine = results.filter((r) => r.player === k);
            const games = Array.from(new Set(mine.map((r) => r.gameId)));
            return (
              <div key={k} className="card p-4">
                <div className="flex items-center gap-3"><Avatar name={k} size={40} /><div><p className="font-display text-[16px] text-purple-800">{k}</p><p className="text-[12px] text-ink-soft">เล่น {mine.length} ครั้ง · {games.length} เกม · ล่าสุด {fmt(mine[mine.length - 1].at)}</p></div></div>
                <ul className="mt-3 space-y-2">
                  {games.map((gid) => {
                    const g = GAMES.find((x) => x.id === gid); const rs = mine.filter((r) => r.gameId === gid);
                    return (
                      <li key={gid} className="rounded-xl bg-cream px-3 py-2 text-[13px]">
                        <p className="font-medium">{g?.emoji ?? "🎮"} {g?.title ?? gid} <span className="font-normal text-ink-soft">· เล่น {rs.length} ครั้ง</span></p>
                        <div className="mt-1 grid grid-cols-3 gap-1">
                          {LEVELS.map((l) => { const lr = rs.filter((r) => r.level === l.id); const best = Math.max(0, ...lr.map((r) => r.stars)); const latest = lr[lr.length - 1]; return <div key={l.id} className={cn("rounded-lg px-2 py-1", lr.length ? "bg-white" : "opacity-40")}><span className="text-[11px]">{l.emoji} {l.en}</span><br /><span className="text-[13px]">{best ? "⭐".repeat(best) : "—"}</span>{latest && <span className="block text-[10px] text-ink-soft">ล่าสุด {latest.stars}/5 · {latest.seconds}s · {lr.length} ครั้ง</span>}</div>; })}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
      <p className="text-[12px] text-ink-soft">ข้อมูลเก็บในเครื่องนี้ (localStorage) — เมื่อเชื่อมบัญชีผู้ใช้จะรวมผลจากทุกอุปกรณ์ · <Link href="/games" className="text-purple-700 underline">← กลับคลังเกม</Link></p>
    </div>
  );
}

function LevelPick({ value, onChange }: { value: Difficulty | ""; onChange: (v: Difficulty | "") => void }) {
  return (
    <div className="flex gap-1">
      <button type="button" onClick={() => onChange("")} className={cn("rounded-full px-2 py-0.5 text-[12px]", value === "" ? "bg-purple-600 text-white" : "bg-white ring-1 ring-line")}>เด็กเลือกเอง</button>
      {LEVELS.map((l) => <button key={l.id} type="button" onClick={() => onChange(l.id)} className={cn("rounded-full px-2 py-0.5 text-[12px]", value === l.id ? "bg-purple-600 text-white" : "bg-white ring-1 ring-line")}>{l.emoji} {l.label}</button>)}
    </div>
  );
}
