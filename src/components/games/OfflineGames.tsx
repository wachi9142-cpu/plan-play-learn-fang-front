"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, Play, Trash2, Wifi, WifiOff } from "lucide-react";
import type { Game } from "@/types";
import { GAMES } from "@/data/games";
import { cn } from "@/lib/cn";
import { LEVELS, levelOf, type Difficulty } from "@/lib/game-levels";
import { GAME_EVENT, resultsOf, getPlayer } from "@/lib/game-store";
import { OFFLINE_EVENT, downloadGame, fmtMB, isOffline, listOffline, removeOfflineGame, setOfflineLevel, useNetStatus, type OfflineGame } from "@/lib/offline";

/** 🟢 ออนไลน์ / 🟠 กำลังซิงก์ / 🔴 ออฟไลน์ */
export function NetStatus({ className }: { className?: string }) {
  const { state, pending, msg } = useNetStatus();
  const s = state === "offline" ? { dot: "bg-red-500", label: "ออฟไลน์", hint: pending ? `บันทึกไว้ในเครื่องแล้ว ${pending} รายการ จะซิงก์เมื่อกลับมาออนไลน์` : "เล่นเกมที่ดาวน์โหลดไว้ได้" } : state === "syncing" ? { dot: "bg-orange-400 animate-pulse", label: "กำลังซิงก์", hint: "" } : { dot: "bg-green-500", label: "ออนไลน์", hint: pending ? `รอซิงก์ ${pending} รายการ (ยังไม่มีเซิร์ฟเวอร์บัญชี — เก็บในเครื่อง)` : "ผลการเล่นบันทึกทันที" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[12px] ring-1 ring-line", className)} title={s.hint}>
      <span className={cn("size-2.5 rounded-full", s.dot)} /> {s.label}{msg && <span className="text-green-700"> · {msg}</span>}
      {state === "offline" && pending > 0 && <span className="text-orange-600">🟠 บันทึกไว้ในเครื่องแล้ว จะซิงก์เมื่อกลับมาออนไลน์</span>}
    </span>
  );
}

/** ปุ่มบนหน้าเกม: 🌐 เล่นออนไลน์ · 📥 ดาวน์โหลดไว้เล่นออฟไลน์ / ✅ อยู่ในเครื่องแล้ว */
export function OfflineButtons({ game }: { game: Game }) {
  const [has, setHas] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { const l = () => setHas(isOffline(game.id)); l(); window.addEventListener(OFFLINE_EVENT, l); return () => window.removeEventListener(OFFLINE_EVENT, l); }, [game.id]);
  const dl = async () => { setBusy(true); const r = await downloadGame(game.id); setMsg(`${r.ok ? "✅" : "⚠️"} ${r.message}${r.ok ? ` (${fmtMB(r.size)})` : ""}`); setBusy(false); setTimeout(() => setMsg(null), 4000); };
  return (
    <div className="flex flex-wrap items-center gap-2 text-[13px]">
      <NetStatus />
      <a href="#play" className="tap inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-3.5 py-1.5 font-medium text-white hover:bg-purple-700"><Wifi size={14} /> ▶️ เล่นออนไลน์</a>
      {has ? (
        <><span className="inline-flex items-center gap-1.5 rounded-full bg-mint-soft px-3 py-1.5 text-green-800"><WifiOff size={14} /> 📴 อยู่ในเครื่องแล้ว เล่นออฟไลน์ได้</span><button type="button" onClick={() => removeOfflineGame(game.id)} className="tap inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-red-500 hover:bg-red-50"><Trash2 size={13} /> ลบจากเครื่อง</button></>
      ) : (
        <button type="button" disabled={busy} onClick={dl} className="tap inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-white px-3.5 py-1.5 font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-60">{busy ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 📥 ดาวน์โหลดไว้เล่นออฟไลน์</button>
      )}
      {msg && <span className="basis-full text-ink-soft">{msg}</span>}
    </div>
  );
}

/** 📴 ส่วน "เกมที่เล่นออฟไลน์" บนหน้าคลังเกม — แสดงเมื่อมีเกมที่ดาวน์โหลดไว้ */
export function OfflineGames() {
  const [list, setList] = useState<OfflineGame[]>([]);
  const [tick, setTick] = useState(0);
  const { state } = useNetStatus();
  useEffect(() => { const l = () => { setList(listOffline()); setTick((t) => t + 1); }; l(); window.addEventListener(OFFLINE_EVENT, l); window.addEventListener(GAME_EVENT, l); return () => { window.removeEventListener(OFFLINE_EVENT, l); window.removeEventListener(GAME_EVENT, l); }; }, []);
  if (list.length === 0) return null;
  const player = getPlayer(); void tick;
  return (
    <section className="card mb-6 border-purple-200 bg-purple-50/50 p-4">
      <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg">📴 เกมที่เล่นออฟไลน์</h2><span className="text-[13px] text-ink-soft">เกมที่ดาวน์โหลดไว้สำหรับเล่นโดยไม่ใช้อินเทอร์เน็ต — อยู่ในเครื่องจนกว่าจะกดลบ</span><NetStatus className="ml-auto" /></div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] text-[13px]">
          <thead><tr className="text-left text-ink-soft"><th className="py-1 pr-2 font-normal">เกม</th><th className="py-1 pr-2 font-normal">ระดับ</th><th className="py-1 pr-2 font-normal">สถานะ</th><th className="py-1 pr-2 font-normal">เล่นแล้ว</th><th className="py-1 pr-2 font-normal">ขนาด</th><th /></tr></thead>
          <tbody>
            {list.map((o) => {
              const g = GAMES.find((x) => x.id === o.gameId); if (!g) return null;
              const rs = player ? resultsOf(player, g.id) : []; const last = rs[rs.length - 1];
              return (
                <tr key={o.gameId} className="border-t border-line/60">
                  <td className="py-2 pr-2">{g.emoji} {g.title}</td>
                  <td className="py-2 pr-2"><select value={o.level ?? ""} onChange={(e) => setOfflineLevel(o.gameId, (e.target.value || undefined) as Difficulty | undefined)} className="rounded-lg border border-line bg-white px-1.5 py-0.5"><option value="">เลือกตอนเล่น</option>{LEVELS.map((l) => <option key={l.id} value={l.id}>{l.emoji} {l.label}</option>)}</select></td>
                  <td className="py-2 pr-2">{state === "offline" ? "📴 เล่นออฟไลน์" : "📥 พร้อมเล่นออฟไลน์"}</td>
                  <td className="py-2 pr-2 text-ink-soft">{rs.length ? `${rs.length} ครั้ง · ล่าสุด ${"⭐".repeat(last.stars)} ${levelOf(last.level).label}` : "—"}</td>
                  <td className="py-2 pr-2 text-ink-soft">{fmtMB(o.size)}</td>
                  <td className="py-2 text-right"><a href={`/games/${o.gameId}`} className="tap inline-flex items-center gap-1 rounded-full bg-purple-600 px-3 py-1 text-white"><Play size={12} /> เล่น</a> <button type="button" onClick={() => { if (confirm(`ลบ “${g.title}” ออกจากเครื่อง?`)) removeOfflineGame(o.gameId); }} className="tap inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-red-500 hover:bg-red-50"><Trash2 size={12} /> ลบจากเครื่อง</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
