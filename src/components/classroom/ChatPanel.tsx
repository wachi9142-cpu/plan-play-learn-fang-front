"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip, Send, Trash2 } from "lucide-react";
import type { ChatMessage, ClassRoom } from "@/types/classroom";
import { cn } from "@/lib/cn";
import { CHAT_KINDS, CLASS_EVENT, ROLE_EMOJI, addChat, deleteChat, fmtDate, fmtTime, listChat, type ClassMe } from "@/lib/classroom-store";
import { connectRoom, type CanvasSync } from "@/lib/canvas-sync";
import type { LiveMessage } from "@/types/classroom";
import { fileEmoji, fmtSize } from "@/lib/studio-assets";
import { uid } from "@/lib/studio-store";

const MAX_INLINE = 1.5 * 1024 * 1024; // ไฟล์ ≤ 1.5MB ส่งแนบไปในข้อความ (เก็บใน localStorage ของแต่ละเครื่อง)

/** 💬 แชตประจำห้องเรียน — ครู/ผู้ปกครอง/นักเรียน · แจ้งข่าว การบ้าน ส่งงาน ส่งไฟล์ ลิงก์กิจกรรม */
export function ChatPanel({ room, me, isTeacher }: { room: ClassRoom; me: ClassMe; isTeacher: boolean }) {
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [kind, setKind] = useState<ChatMessage["kind"]>("text");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filter, setFilter] = useState<"all" | "teacher" | "parent" | "child">("all");
  const sync = useRef<CanvasSync<LiveMessage> | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = () => setMsgs(listChat(room.id)); load();
    window.addEventListener(CLASS_EVENT, load);
    const s = connectRoom<LiveMessage>(`class-${room.id}`, (m) => { if (m.t === "chat") { addChat(m.msg); } });
    sync.current = s;
    return () => { window.removeEventListener(CLASS_EVENT, load); s.close(); };
  }, [room.id]);
  useEffect(() => { bottom.current?.scrollIntoView({ block: "end" }); }, [msgs.length]);

  const submit = async () => {
    if (!text.trim() && !file && !link.trim()) return;
    const m: ChatMessage = { id: uid(), roomId: room.id, by: { id: me.id, name: me.name, role: me.role }, kind: file ? "file" : link ? "link" : kind, text: text.trim(), at: new Date().toISOString(), link: link.trim() || undefined };
    if (file) {
      if (file.size > MAX_INLINE) { alert("ไฟล์ใหญ่เกิน 1.5 MB — แนะนำอัปโหลดไว้ในคลังย้อนหลัง (📚) แล้วแจ้งในแชตแทนค่ะ"); return; }
      const data = await new Promise<string>((r) => { const fr = new FileReader(); fr.onload = () => r(String(fr.result)); fr.readAsDataURL(file); });
      m.attachment = { name: file.name, mime: file.type, size: file.size, data };
    }
    addChat(m); sync.current?.send({ t: "chat", room: `class-${room.id}`, msg: m });
    setText(""); setLink(""); setFile(null); setKind("text");
  };

  const shown = msgs.filter((m) => filter === "all" || m.by.role === filter);
  let lastDay = "";
  return (
    <div className="card flex h-[70dvh] flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2 text-[12px]">
        <span className="font-medium">💬 {room.nickname} · {room.code}</span>
        <span className="text-ink-soft">👩‍🏫 ครู · 👨‍👩‍👧 ผู้ปกครอง · 👧 นักเรียน</span>
        <div className="ml-auto flex gap-1">{(["all", "teacher", "parent", "child"] as const).map((f) => <button key={f} type="button" onClick={() => setFilter(f)} className={cn("rounded-full px-2 py-0.5", filter === f ? "bg-purple-100 text-purple-800" : "text-ink-soft hover:bg-cream")}>{f === "all" ? "ทั้งหมด" : ROLE_EMOJI[f]}</button>)}</div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {shown.length === 0 && <p className="py-10 text-center text-[13px] text-ink-soft">ยังไม่มีข้อความ — ทักทายกันได้เลยค่ะ 💜</p>}
        {shown.map((m) => {
          const day = fmtDate(m.at); const showDay = day !== lastDay; lastDay = day;
          const mine = m.by.id === me.id; const k = CHAT_KINDS.find((x) => x.id === m.kind);
          return (
            <div key={m.id}>
              {showDay && <p className="my-2 text-center text-[11px] text-ink-soft">— {day} —</p>}
              <div className={cn("flex gap-2", mine && "flex-row-reverse")}>
                <span className="mt-1 text-[20px] leading-none">{ROLE_EMOJI[m.by.role]}</span>
                <div className={cn("max-w-[85%] rounded-2xl px-3 py-2 text-[14px]", mine ? "bg-purple-600 text-white" : m.by.role === "teacher" ? "bg-purple-50" : "bg-cream", m.kind === "announce" && !mine && "ring-2 ring-yellow-300", m.kind === "homework" && !mine && "ring-2 ring-pink-300")}>
                  <p className={cn("text-[11px]", mine ? "text-white/80" : "text-ink-soft")}>{m.by.name} · {fmtTime(m.at)} {k && k.id !== "text" && <span className="ml-1 rounded-full bg-white/70 px-1.5 text-ink">{k.emoji} {k.label}</span>}</p>
                  {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                  {m.link && <a href={m.link} target="_blank" rel="noreferrer" className={cn("block break-all underline", mine ? "text-white" : "text-purple-700")}>🔗 {m.link}</a>}
                  {m.attachment && (m.attachment.mime.startsWith("image/") && m.attachment.data ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <a href={m.attachment.data} download={m.attachment.name}><img src={m.attachment.data} alt={m.attachment.name} className="mt-1 max-h-56 rounded-xl" /></a>
                  ) : (
                    <a href={m.attachment.data} download={m.attachment.name} className={cn("mt-1 flex items-center gap-2 rounded-xl px-2 py-1.5 text-[13px]", mine ? "bg-white/20" : "bg-white")}>{fileEmoji(m.attachment.mime, m.attachment.name)} <span className="truncate">{m.attachment.name}</span> <span className="opacity-70">{fmtSize(m.attachment.size)}</span></a>
                  ))}
                </div>
                {(mine || isTeacher) && <button type="button" onClick={() => deleteChat(m.id)} className="self-center text-ink-soft/50 hover:text-red-500" title="ลบ (เฉพาะเครื่องนี้)"><Trash2 size={12} /></button>}
              </div>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>
      <div className="border-t border-line p-2">
        <div className="no-scrollbar mb-1.5 flex gap-1 overflow-x-auto">{CHAT_KINDS.filter((k) => !k.teacherOnly || isTeacher).filter((k) => k.id !== "file" && k.id !== "link").map((k) => <button key={k.id} type="button" onClick={() => setKind(k.id)} className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[12px]", kind === k.id ? "bg-purple-100 text-purple-800" : "bg-cream text-ink-soft")}>{k.emoji} {k.label}</button>)}</div>
        {(kind === "activity" || link) && <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="วางลิงก์ เช่น /canvas/room/AB12CD หรือ https://…" className="mb-1.5 w-full rounded-lg border border-line px-3 py-1.5 text-[13px] outline-none focus:border-purple-400" />}
        {file && <p className="mb-1.5 flex items-center gap-2 rounded-lg bg-cream px-2 py-1 text-[12px]">{fileEmoji(file.type, file.name)} {file.name} · {fmtSize(file.size)} <button type="button" onClick={() => setFile(null)} className="ml-auto text-red-500">ลบ</button></p>}
        <div className="flex items-end gap-1.5">
          <label className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-cream text-ink-soft hover:bg-purple-50" title="แนบไฟล์/ส่งงาน (≤ 1.5MB)"><Paperclip size={16} /><input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }} rows={1} placeholder={kind === "announce" ? "📣 ข่าวสารถึงผู้ปกครอง…" : kind === "homework" ? "📝 การบ้าน/สิ่งที่ต้องเตรียม…" : kind === "schedule" ? "📅 กำหนดการเรียน…" : "พิมพ์ข้อความ… (Enter ส่ง)"} className="max-h-32 min-h-9 flex-1 resize-y rounded-2xl border border-line px-3 py-2 text-[14px] outline-none focus:border-purple-400" />
          <button type="button" onClick={submit} className="grid size-9 shrink-0 place-items-center rounded-full bg-purple-600 text-white hover:bg-purple-700" title="ส่ง"><Send size={16} /></button>
        </div>
      </div>
    </div>
  );
}
