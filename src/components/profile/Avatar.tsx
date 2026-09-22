"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * 🧸 Avatar ใช้ร่วมกันทั้งระบบ (โปรไฟล์ · ห้องเรียน · แชต · งาน · Portfolio · ดาว · Online Classroom)
 * ไม่ใช้รูปเด็กจริงเป็นหลัก — ใช้ตัวการ์ตูน/อีโมจิ + สีพื้น หรืออัปโหลดภาพวาด/AI illustration ได้ภายหลัง
 * เก็บใน localStorage `lpg-avatars-v1` (key = ชื่อ) — เมื่อมีบัญชีผู้ใช้จริงจะย้ายไปผูกกับ userId
 */
export interface AvatarData { emoji?: string; bg?: string; image?: string }
const KEY = "lpg-avatars-v1";
export const AVATAR_EVENT = "lpg-avatar-change";
export const AVATAR_EMOJIS = ["🐰", "🐻", "🐼", "🐧", "🐱", "🐶", "🦊", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐥", "🦋", "🐝", "🐛", "🐞", "🐢", "🐳", "🐬", "🦄", "🐲", "🌻", "🌼", "🌷", "🌸", "🌈", "⭐", "🌙", "☀️", "🍓", "🍎", "🍉", "🍭", "🎈", "🎀", "🚀", "🧸"];
export const AVATAR_BGS = ["#ECE0F8", "#FDE4EC", "#FFF1BF", "#E2F5EC", "#E3F0FB", "#FFE4D6", "#E9E7FF", "#F5F5F5"];

const readAll = (): Record<string, AvatarData> => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } };
export const getAvatar = (name: string): AvatarData => readAll()[name] ?? {};
export function setAvatar(name: string, data: AvatarData) { const all = readAll(); all[name] = data; try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* */ } window.dispatchEvent(new Event(AVATAR_EVENT)); }

/** ค่าเริ่มต้นจากชื่อ (คงที่) เมื่อยังไม่ได้เลือก */
export function defaultAvatar(name: string): Required<Pick<AvatarData, "emoji" | "bg">> {
  let h = 0; for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { emoji: AVATAR_EMOJIS[h % AVATAR_EMOJIS.length], bg: AVATAR_BGS[(h >> 4) % AVATAR_BGS.length] };
}

export function useAvatar(name: string) {
  const [a, setA] = useState<AvatarData>({});
  useEffect(() => { const l = () => setA(getAvatar(name)); l(); window.addEventListener(AVATAR_EVENT, l); return () => window.removeEventListener(AVATAR_EVENT, l); }, [name]);
  const d = defaultAvatar(name);
  return { emoji: a.emoji ?? d.emoji, bg: a.bg ?? d.bg, image: a.image };
}

export function Avatar({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  const a = useAvatar(name);
  return (
    <span className={cn("grid shrink-0 place-items-center overflow-hidden rounded-full ring-2 ring-white", className)} style={{ width: size, height: size, background: a.bg, fontSize: size * 0.55 }} title={name} aria-label={name}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {a.image ? <img src={a.image} alt={name} className="size-full object-cover" /> : <span className="leading-none">{a.emoji}</span>}
    </span>
  );
}

/** ตัวเลือก Avatar: อีโมจิ + สีพื้น หรืออัปโหลดภาพ (ย่อ 256px) */
export function AvatarPicker({ name, onClose }: { name: string; onClose?: () => void }) {
  const cur = useAvatar(name);
  const upload = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    const img = new Image(); const u = URL.createObjectURL(f);
    img.onload = () => { const c = document.createElement("canvas"); const s = Math.min(img.width, img.height); c.width = c.height = 256; c.getContext("2d")!.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 256, 256); setAvatar(name, { ...getAvatar(name), image: c.toDataURL("image/jpeg", 0.85) }); URL.revokeObjectURL(u); };
    img.src = u;
  };
  return (
    <div className="card w-full max-w-md p-4">
      <div className="flex items-center gap-3"><Avatar name={name} size={64} /><div><p className="font-display text-[16px] text-purple-800">{name}</p><p className="text-[12px] text-ink-soft">เลือกตัวแทนน่ารัก ๆ หรืออัปโหลดภาพวาด/ภาพการ์ตูน</p></div>{onClose && <button type="button" onClick={onClose} className="ml-auto rounded-full px-2 text-ink-soft hover:bg-cream">✕</button>}</div>
      <div className="mt-3 grid grid-cols-8 gap-1">{AVATAR_EMOJIS.map((e) => <button key={e} type="button" onClick={() => setAvatar(name, { ...getAvatar(name), emoji: e, image: undefined })} className={cn("grid h-9 place-items-center rounded-xl text-[22px] hover:bg-purple-50", cur.emoji === e && !cur.image && "bg-purple-100 ring-2 ring-purple-400")}>{e}</button>)}</div>
      <div className="mt-2 flex flex-wrap items-center gap-2"><span className="text-[12px] text-ink-soft">สีพื้น</span>{AVATAR_BGS.map((b) => <button key={b} type="button" onClick={() => setAvatar(name, { ...getAvatar(name), bg: b })} className={cn("size-7 rounded-full ring-2 ring-offset-1", cur.bg === b ? "ring-purple-500" : "ring-transparent")} style={{ background: b }} aria-label={b} />)}
        <label className="ml-auto cursor-pointer rounded-full border border-line bg-white px-3 py-1 text-[12px] hover:bg-purple-50">🖼️ อัปโหลดภาพ<input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} /></label>
      </div>
    </div>
  );
}
