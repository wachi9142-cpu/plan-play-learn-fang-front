"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { PLAYER_EVENT, addPlayer, bandForAge, getCurrentPlayer, listPlayers, removePlayer, setCurrentPlayer, type PlayerProfile } from "@/lib/players";
import { Avatar, AvatarPicker } from "@/components/profile/Avatar";

/** 👋 ใครกำลังเล่นอยู่? — เลือกโปรไฟล์ในครอบครัว หรือ ＋ เพิ่มผู้เล่น (ชื่อ + อายุ → คำนวณช่วงวัยอัตโนมัติ) */
export function PlayerPicker({ onPick, emoji = "🎮" }: { onPick: (p: PlayerProfile) => void; emoji?: string }) {
  const [list, setList] = useState<PlayerProfile[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [avatarFor, setAvatarFor] = useState<string | null>(null);
  useEffect(() => { const l = () => setList(listPlayers()); l(); window.addEventListener(PLAYER_EVENT, l); return () => window.removeEventListener(PLAYER_EVENT, l); }, []);
  const band = age !== "" ? bandForAge(+age) : null;
  const showForm = adding || list.length === 0;

  return (
    <div className="card p-5 sm:p-8">
      <div className="text-center"><p className="text-4xl">{emoji}</p><h2 className="mt-2 text-xl">{list.length ? "👋 ใครกำลังเล่นอยู่?" : "👤 สร้างโปรไฟล์ผู้เล่น"}</h2><p className="text-[13px] text-ink-soft">1 ครอบครัวมีได้หลายคน — แต่ละคนมีเกม ระดับ และประวัติของตัวเอง (ไม่มีการจัดอันดับ)</p></div>
      {list.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {list.map((p) => { const b = bandForAge(p.age); return (
            <div key={p.id} className="group relative">
              <button type="button" onClick={() => { setCurrentPlayer(p.id); onPick(p); }} className="tap flex w-full flex-col items-center rounded-2xl border-2 border-line bg-white p-3 text-center hover:border-purple-300 hover:bg-purple-50">
                <Avatar name={p.name} size={56} />
                <span className="mt-1.5 font-display text-[15px] text-purple-800">{p.name}</span>
                <span className="text-[12px] text-ink-soft">{p.age} ปี · {b.emoji} {b.label}</span>
              </button>
              <div className="absolute right-1 top-1 flex gap-0.5 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
                <button type="button" onClick={() => setAvatarFor(p.name)} className="grid size-6 place-items-center rounded-full bg-white text-[12px] shadow" title="เปลี่ยน Avatar">🧸</button>
                <button type="button" onClick={() => { if (confirm(`ลบโปรไฟล์ ${p.name}?`)) removePlayer(p.id); }} className="grid size-6 place-items-center rounded-full bg-white text-red-500 shadow" title="ลบ"><Trash2 size={11} /></button>
              </div>
            </div>
          ); })}
          {!adding && <button type="button" onClick={() => setAdding(true)} className="tap flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-200 p-3 text-[13px] text-purple-700 hover:bg-purple-50"><Plus size={22} /> เพิ่มผู้เล่น</button>}
        </div>
      )}
      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); if (age === "") return; const p = addPlayer(name, +age); setAdding(false); setName(""); setAge(""); onPick(p); }} className="mx-auto mt-4 max-w-sm space-y-3">
          <label className="block text-[13px]">หนูชื่ออะไร?<input autoFocus value={name} onChange={(e) => setName(e.target.value)} required placeholder="ชื่อเล่น เช่น น้องมะลิ" className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-[15px] outline-none focus:border-purple-400" /></label>
          <label className="block text-[13px]">อายุเท่าไหร่?<span className="mt-1 flex items-center gap-2"><input type="number" min={1} max={99} value={age} onChange={(e) => setAge(e.target.value === "" ? "" : Math.max(1, Math.min(99, +e.target.value)))} required placeholder="4" className="w-24 rounded-xl border border-line px-3 py-2 text-center text-[15px] outline-none focus:border-purple-400" /> ปี{band && <span className={cn("rounded-full bg-purple-50 px-3 py-1 text-[13px] text-purple-800")}>{band.emoji} {band.label} ({band.range})</span>}</span></label>
          {band && <p className="text-[12px] text-ink-soft">เกมที่เหมาะ: {band.games.join(" · ")}</p>}
          <div className="flex gap-2">{list.length > 0 && <button type="button" onClick={() => setAdding(false)} className="rounded-full px-3 py-2 text-[13px] text-ink-soft">ยกเลิก</button>}<button type="submit" className="tap flex-1 rounded-full bg-purple-600 py-2 text-[15px] font-medium text-white">เริ่มเล่น 🎮</button></div>
        </form>
      )}
      {avatarFor && <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" onClick={() => setAvatarFor(null)}><div onClick={(e) => e.stopPropagation()}><AvatarPicker name={avatarFor} onClose={() => setAvatarFor(null)} /></div></div>}
    </div>
  );
}

export function useCurrentPlayer() {
  const [p, setP] = useState<PlayerProfile | null>(null);
  useEffect(() => { const l = () => setP(getCurrentPlayer()); l(); window.addEventListener(PLAYER_EVENT, l); return () => window.removeEventListener(PLAYER_EVENT, l); }, []);
  return p;
}

/** แถบผู้เล่นปัจจุบันบนหน้าคลังเกม — เปลี่ยนผู้เล่นได้ทันที */
export function CurrentPlayerBar() {
  const p = useCurrentPlayer();
  const [open, setOpen] = useState(false);
  const b = p ? bandForAge(p.age) : null;
  return (
    <>
      <div className="card mb-5 flex flex-wrap items-center gap-3 p-3">
        {p ? <><Avatar name={p.name} size={36} /><span className="text-[14px]">👋 กำลังเล่น: <b>{p.name}</b> <span className="text-ink-soft">· {p.age} ปี · {b!.emoji} {b!.label} — เกมที่เหมาะ: {b!.games.join(" · ")}</span></span></> : <span className="text-[14px]">👤 ยังไม่ได้เลือกผู้เล่น — สร้างโปรไฟล์เพื่อให้ระบบจำระดับและประวัติของแต่ละคน</span>}
        <button type="button" onClick={() => setOpen(true)} className="tap ml-auto rounded-full border border-purple-200 bg-white px-3 py-1.5 text-[13px] text-purple-700 hover:bg-purple-50">{p ? "เปลี่ยนผู้เล่น" : "เลือก / สร้างผู้เล่น"}</button>
      </div>
      {open && <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/40 p-4" onClick={() => setOpen(false)}><div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}><PlayerPicker onPick={() => setOpen(false)} /></div></div>}
    </>
  );
}
