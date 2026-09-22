"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Hand, Mic, MicOff, MonitorUp, PhoneOff, Radio, Star, UserCheck, UserX, Video } from "lucide-react";
import type { ArchiveItem, ClassRoom, LiveParticipant } from "@/types/classroom";
import { cn } from "@/lib/cn";
import { ROLE_EMOJI, STAR_REASONS, STICKERS, addArchive, startSession, updateSession, type ClassMe } from "@/lib/classroom-store";
import { participation, useLiveRoom } from "@/lib/live-room";
import { addAsset } from "@/lib/studio-assets";
import { uid } from "@/lib/studio-store";

const CONN = { green: { dot: "bg-green-500", label: "การเชื่อมต่อปกติ" }, orange: { dot: "bg-orange-400", label: "สัญญาณไม่เสถียร" }, red: { dot: "bg-red-500", label: "หลุด/ไม่ตอบสนอง" } };
const PART = { green: { dot: "bg-green-500", label: "ร่วมกิจกรรม" }, yellow: { dot: "bg-yellow-400", label: "ไม่แน่ใจ" }, red: { dot: "bg-red-500", label: "ไม่ร่วมกิจกรรม" } };

/** 🔴 ห้องเรียนสด */
export function LiveRoom({ room, me, isTeacher }: { room: ClassRoom; me: ClassMe; isTeacher: boolean }) {
  const L = useLiveRoom(room.id, me, { isTeacher });
  const [joined, setJoined] = useState(false);
  const [starFor, setStarFor] = useState<LiveParticipant | null>(null);
  const [reason, setReason] = useState(STAR_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showStickers, setShowStickers] = useState(false);

  const join = async (withCam: boolean) => { if (withCam) await L.startMedia({ video: true, audio: true }); setJoined(true); L.active(); };
  const leave = () => { L.stopMedia(); setJoined(false); };

  const goLive = () => { const s = startSession(room.id, `${room.nickname} · ${new Date().toLocaleDateString("th-TH")}`); setSessionId(s.id); L.teacher.setLive(true); };
  const endLive = async () => {
    if (L.recording) await saveRecording();
    if (sessionId) updateSession(sessionId, { endedAt: new Date().toISOString(), attendees: L.others.filter((o) => o.approved).map((o) => o.name) });
    L.teacher.setLive(false); setSessionId(null);
  };
  const saveRecording = async () => {
    const blob = await L.stopRecording(); if (!blob) return;
    const file = new File([blob], `บันทึกการสอน-${new Date().toISOString().slice(0, 16).replace("T", "-")}.webm`, { type: blob.type || "video/webm" });
    const a = await addAsset(`class:${room.id}`, file);
    const item: ArchiveItem = { id: uid(), roomId: room.id, kind: "video", title: `🎥 บันทึกการสอน ${new Date().toLocaleDateString("th-TH")} ${new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`, date: new Date().toISOString(), assetId: a.id, mime: file.type, size: file.size, by: me.name, sessionId: sessionId ?? undefined, note: "บันทึกอัตโนมัติจากห้องเรียนสด" };
    addArchive(item); if (sessionId) updateSession(sessionId, { recordingId: item.id }); L.say("บันทึกคลิปการสอนไว้ในคลังย้อนหลังแล้ว 📚");
  };
  const snapshot = async () => {
    const v = document.querySelector<HTMLVideoElement>("video[data-me]"); if (!v) return;
    const cv = document.createElement("canvas"); cv.width = v.videoWidth || 640; cv.height = v.videoHeight || 480; cv.getContext("2d")!.drawImage(v, 0, 0);
    const blob = await new Promise<Blob | null>((r) => cv.toBlob(r, "image/jpeg", 0.85)); if (!blob) return;
    const a = await addAsset(`class:${room.id}`, new File([blob], `ภาพจากห้องเรียน-${Date.now()}.jpg`, { type: "image/jpeg" }));
    addArchive({ id: uid(), roomId: room.id, kind: "image", title: `🖼️ ภาพจากการเรียนออนไลน์ ${new Date().toLocaleDateString("th-TH")}`, date: new Date().toISOString(), assetId: a.id, mime: "image/jpeg", size: blob.size, by: me.name, thumb: cv.toDataURL("image/jpeg", 0.5) }); L.say("บันทึกภาพไว้ในคลังแล้ว 🖼️");
  };
  const giveStar = () => { if (!starFor) return; L.teacher.star(starFor, customReason.trim() || reason); setStarFor(null); setCustomReason(""); };

  const approvedOthers = L.others.filter((o) => o.approved || o.role === "teacher");
  const tiles: { p: LiveParticipant; stream?: MediaStream; isMe?: boolean }[] = [{ p: L.me, stream: L.screenStream ?? L.localStream ?? undefined, isMe: true }, ...approvedOthers.map((p) => ({ p, stream: L.streams[p.id] }))];

  if (!joined) {
    return (
      <div className="card p-5 text-center sm:p-8">
        <div className="text-5xl">{room.emoji}</div>
        <h2 className="mt-2 text-2xl">{room.nickname} <span className="text-[14px] font-normal text-ink-soft">— {room.code}</span></h2>
        <p className="mt-1 text-[14px] text-ink-soft">{isTeacher ? "กดเข้าห้องเพื่อเตรียมกล้อง แล้วกด “เริ่มเรียนสด” เมื่อพร้อม" : L.live ? "🔴 ครูกำลังสอนสดอยู่ — เข้าห้องได้เลย (ครูจะอนุญาตให้เข้าก่อน)" : "ยังไม่เริ่มเรียนสด — เข้ารอในห้องได้ หรือดูเนื้อหาย้อนหลังในแท็บ 📚"}</p>
        <p className="mt-1 text-[12px] text-ink-soft">{L.mode === "ws" ? "🟢 เชื่อมต่อเซิร์ฟเวอร์ห้องเรียนแล้ว" : L.mode === "local" ? "🟡 ไม่พบเซิร์ฟเวอร์ห้องเรียน (npm run canvas-server) — ทดสอบได้เฉพาะแท็บในเครื่องนี้" : "⏳ กำลังเชื่อมต่อ"}</p>
        {L.mediaError && <p className="mx-auto mt-3 max-w-md rounded-xl bg-yellow-soft px-3 py-2 text-[13px]">⚠️ {L.mediaError}</p>}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => join(true)} className="tap inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700"><Video size={18} /> เข้าห้องพร้อมกล้อง/ไมค์</button>
          <button type="button" onClick={() => join(false)} className="tap inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-5 py-2.5 text-[15px] text-purple-700 hover:bg-purple-50"><CameraOff size={18} /> เข้าห้องแบบไม่เปิดกล้อง</button>
        </div>
        {!isTeacher && <p className="mt-3 text-[12px] text-ink-soft">👨‍👩‍👧 ผู้ปกครองนั่งข้าง ๆ ช่วยเด็กได้ ไม่ต้องเปิดกล้องตลอดเวลา</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* แถบสถานะ */}
      <div className="card flex flex-wrap items-center gap-2 px-3 py-2 text-[13px]">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium", L.live ? "bg-red-50 text-red-600" : "bg-cream text-ink-soft")}><Radio size={13} className={L.live ? "animate-pulse" : ""} /> {L.live ? "LIVE กำลังเรียนสด" : "ยังไม่เริ่มเรียนสด"}</span>
        <span className="text-ink-soft">👥 {approvedOthers.length + 1} คนในห้อง</span>
        <span className="text-ink-soft">{L.mode === "ws" ? "🟢 real-time" : L.mode === "local" ? "🟡 เฉพาะเครื่องนี้" : "⏳"}</span>
        {!L.me.approved && !isTeacher && <span className="rounded-full bg-yellow-soft px-2.5 py-1">⏳ รอครูอนุญาตให้เข้าห้อง…</span>}
        <div className="ml-auto flex items-center gap-1.5">
          {isTeacher ? (
            <>
              {!L.live ? <button type="button" onClick={goLive} className="tap rounded-full bg-red-500 px-4 py-1.5 font-medium text-white hover:bg-red-600">🔴 เริ่มเรียนสด</button> : <button type="button" onClick={endLive} className="tap rounded-full bg-ink px-4 py-1.5 font-medium text-white">⏹ จบคาบเรียน</button>}
              {!L.recording ? <button type="button" onClick={L.startRecording} className="tap rounded-full border border-red-200 bg-white px-3 py-1.5 text-red-600 hover:bg-red-50" title="บันทึกการสอน">⏺ บันทึก</button> : <button type="button" onClick={saveRecording} className="tap animate-pulse rounded-full bg-red-500 px-3 py-1.5 text-white">⏹ หยุดบันทึก</button>}
              <button type="button" onClick={snapshot} className="tap rounded-full border border-line bg-white px-3 py-1.5 hover:bg-purple-50" title="บันทึกภาพจากกล้อง">📸</button>
              <button type="button" onClick={L.teacher.ping} className="tap rounded-full border border-line bg-white px-3 py-1.5 hover:bg-purple-50" title="เช็คการมีส่วนร่วม">🙋 เช็คชื่อ</button>
            </>
          ) : (
            <button type="button" onClick={L.raiseHand} className={cn("tap inline-flex items-center gap-1 rounded-full px-3 py-1.5", L.me.hand ? "bg-yellow-soft" : "border border-line bg-white hover:bg-purple-50")}><Hand size={14} /> {L.me.hand ? "ยกมืออยู่" : "ยกมือ"}</button>
          )}
        </div>
      </div>

      {/* รออนุมัติ (ครู) */}
      {isTeacher && L.pending.length > 0 && (
        <div className="card border-yellow-200 bg-yellow-soft/60 p-3">
          <p className="text-[13px] font-medium">🔔 ขอเข้าห้อง ({L.pending.length})</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {L.pending.map((p) => (
              <li key={p.id} className="flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-[13px]">
                {ROLE_EMOJI[p.role]} {p.name}{p.childName && <span className="text-ink-soft">(ของ {p.childName})</span>}
                <button type="button" onClick={() => L.teacher.admit(p, true)} className="rounded-full bg-green-500 px-2.5 py-0.5 text-white" title="อนุญาต"><UserCheck size={13} className="inline" /> อนุญาต</button>
                <button type="button" onClick={() => L.teacher.admit(p, false)} className="rounded-full bg-white px-2.5 py-0.5 text-red-500 ring-1 ring-red-200" title="ไม่อนุญาต"><UserX size={13} className="inline" /></button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* เช็คชื่อ (เด็ก) */}
      {L.pinged && (
        <button type="button" onClick={L.active} className="tap w-full animate-rise rounded-2xl bg-gradient-to-r from-purple-500 to-pink-400 px-4 py-4 text-center text-xl font-medium text-white shadow-soft">🙋 หนูอยู่ตรงนี้ค่ะ! (กดเลย)</button>
      )}

      {/* ตารางวิดีโอ */}
      <div className={cn("grid gap-2", tiles.length <= 1 ? "grid-cols-1" : tiles.length <= 4 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3")}>
        {tiles.map(({ p, stream, isMe }) => <Tile key={p.id} p={p} stream={stream} isMe={!!isMe} isTeacher={isTeacher} onStar={() => setStarFor(p)} onControl={(patch) => L.teacher.control(p.id, patch)} onKick={() => L.teacher.kick(p.id)} onActive={() => L.teacher.markActive(p.id)} big={tiles.length === 1} />)}
      </div>

      {/* ควบคุมของฉัน */}
      <div className="card flex flex-wrap items-center justify-center gap-2 p-2">
        <Ctl on={L.me.mic} onClick={L.toggleMic} label={L.me.mic ? "ปิดไมค์" : "เปิดไมค์"}>{L.me.mic ? <Mic size={18} /> : <MicOff size={18} />}</Ctl>
        <Ctl on={L.me.cam} onClick={L.localStream ? L.toggleCam : () => L.startMedia()} label={L.localStream ? (L.me.cam ? "ปิดกล้อง" : "เปิดกล้อง") : "เปิดกล้อง"}>{L.me.cam && L.localStream ? <Camera size={18} /> : <CameraOff size={18} />}</Ctl>
        {isTeacher && <Ctl on={!!L.screenStream} onClick={L.shareScreen} label={L.screenStream ? "หยุดแชร์" : "แชร์หน้าจอ/สื่อ"}><MonitorUp size={18} /></Ctl>}
        <div className="relative">
          <Ctl on={L.me.sticker !== "none"} onClick={() => setShowStickers((s) => !s)} label="ฟิลเตอร์">{STICKERS.find((s) => s.id === L.me.sticker)?.emoji ?? "🎨"}</Ctl>
          {showStickers && (
            <div className="absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-2xl border border-line bg-white p-2 shadow-lg">
              {!L.me.filterAllowed && <p className="mb-1 rounded-lg bg-yellow-soft px-2 py-1 text-[12px]">ครูขอให้งดใช้ฟิลเตอร์ก่อนนะคะ 💜</p>}
              <div className="grid grid-cols-6 gap-1">{STICKERS.map((s) => <button key={s.id} type="button" disabled={!L.me.filterAllowed && s.id !== "none"} onClick={() => { L.setSticker(s.id); setShowStickers(false); }} title={s.label} className={cn("grid h-9 place-items-center rounded-xl text-[22px] hover:bg-purple-50 disabled:opacity-30", L.me.sticker === s.id && "bg-purple-100")}>{s.emoji}</button>)}</div>
            </div>
          )}
        </div>
        <button type="button" onClick={leave} className="tap inline-flex items-center gap-1.5 rounded-full bg-red-500 px-4 py-2 text-[13px] font-medium text-white hover:bg-red-600"><PhoneOff size={16} /> ออกจากห้อง</button>
      </div>

      {/* ให้ดาว */}
      {starFor && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" onClick={() => setStarFor(null)}>
          <div className="card w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg">⭐ ให้ดาว {starFor.name}</h3>
            <p className="text-[12px] text-ink-soft">ดาวคือกำลังใจและแรงเสริมเชิงบวก 💜</p>
            <div className="mt-3 flex flex-wrap gap-1.5">{STAR_REASONS.map((r) => <button key={r} type="button" onClick={() => { setReason(r); setCustomReason(""); }} className={cn("rounded-full border border-line px-3 py-1 text-[13px] hover:bg-purple-50", reason === r && !customReason && "border-purple-400 bg-purple-100")}>{r}</button>)}</div>
            <input value={customReason} onChange={(e) => setCustomReason(e.target.value)} placeholder="หรือพิมพ์เหตุผลเอง…" className="mt-2 w-full rounded-lg border border-line px-3 py-1.5 text-[14px] outline-none focus:border-purple-400" />
            <div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => setStarFor(null)} className="rounded-full px-3 py-1.5 text-[13px] text-ink-soft">ยกเลิก</button><button type="button" onClick={giveStar} className="rounded-full bg-yellow-400 px-4 py-1.5 text-[13px] font-medium text-ink">⭐ ให้ดาว</button></div>
          </div>
        </div>
      )}
      {L.starsPopup && <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center"><div className="animate-rise rounded-3xl bg-white/95 px-8 py-6 text-center shadow-lg ring-4 ring-yellow-300"><div className="text-6xl">⭐</div><p className="mt-2 font-display text-xl text-purple-800">{L.starsPopup.toName} ได้ดาว!</p><p className="text-[14px] text-ink-soft">{L.starsPopup.reason}</p></div></div>}
      {L.toast && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-[13px] text-white shadow-lg animate-rise">{L.toast}</div>}
    </div>
  );
}

function Tile({ p, stream, isMe, isTeacher, onStar, onControl, onKick, onActive, big }: { p: LiveParticipant; stream?: MediaStream; isMe: boolean; isTeacher: boolean; onStar: () => void; onControl: (x: { mic?: boolean; cam?: boolean; filterAllowed?: boolean }) => void; onKick: () => void; onActive: () => void; big: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => { if (ref.current && stream) ref.current.srcObject = stream; }, [stream]);
  const st = STICKERS.find((s) => s.id === p.sticker);
  const hasVideo = !!stream && p.cam && stream.getVideoTracks().some((t) => t.enabled && t.readyState === "live");
  const part = participation(p);
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-ink/90 text-white", big ? "aspect-video" : "aspect-[4/3]")}>
      {hasVideo ? <video ref={ref} data-me={isMe ? "1" : undefined} autoPlay playsInline muted={isMe} className={cn("size-full object-cover", isMe && !p.sharing && "-scale-x-100")} /> : (
        <div className="grid size-full place-items-center" style={{ background: `linear-gradient(135deg, ${p.color}aa, #3b2f4a)` }}><div className="text-center"><div className="text-5xl">{ROLE_EMOJI[p.role]}</div><p className="mt-1 text-[13px] opacity-80">{p.cam ? "กำลังเปิดกล้อง…" : "ปิดกล้อง"}</p></div></div>
      )}
      {st && st.id !== "none" && <div className={cn("pointer-events-none absolute text-[64px] leading-none drop-shadow-lg", st.pos === "top" ? "left-1/2 top-1 -translate-x-1/2" : st.pos === "center" ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[96px]" : "right-2 top-2 text-[40px]")}>{st.emoji}</div>}
      {p.hand && <div className="absolute left-2 top-2 animate-bounce rounded-full bg-yellow-300 px-2 py-1 text-[16px] text-ink">🙋</div>}
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-4 text-[12px]">
        <span className="truncate">{ROLE_EMOJI[p.role]} {p.name}{isMe && " (ฉัน)"}</span>
        {!p.mic && <MicOff size={12} className="text-red-300" />}
        <span className="ml-auto flex items-center gap-1" title={`🌐 ${CONN[p.conn].label} · 🙋 ${PART[part].label}`}>
          <span className={cn("size-2.5 rounded-full ring-1 ring-white/60", CONN[p.conn].dot)} />
          {p.role === "child" && <span className={cn("size-2.5 rounded-full ring-1 ring-white/60", PART[part].dot)} />}
        </span>
      </div>
      {isTeacher && !isMe && (
        <div className="absolute right-1 top-1 flex flex-col gap-1 opacity-0 transition hover:opacity-100 [@media(hover:none)]:opacity-100">
          <TB onClick={onStar} title="ให้ดาว"><Star size={13} /></TB>
          <TB onClick={() => onControl({ mic: !p.mic })} title={p.mic ? "ปิดไมค์" : "เปิดไมค์"}>{p.mic ? <Mic size={13} /> : <MicOff size={13} />}</TB>
          <TB onClick={() => onControl({ cam: !p.cam })} title={p.cam ? "ปิดกล้อง" : "เปิดกล้อง"}>{p.cam ? <Camera size={13} /> : <CameraOff size={13} />}</TB>
          <TB onClick={() => onControl({ filterAllowed: !p.filterAllowed })} title={p.filterAllowed ? "งดใช้ฟิลเตอร์" : "อนุญาตฟิลเตอร์"}>{p.filterAllowed ? "🎨" : "🚫"}</TB>
          <TB onClick={onActive} title="บันทึกว่าร่วมกิจกรรม">✅</TB>
          <TB onClick={() => { if (confirm(`นำ ${p.name} ออกจากห้อง?`)) onKick(); }} title="นำออกจากห้อง"><UserX size={13} /></TB>
        </div>
      )}
    </div>
  );
}
const TB = ({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) => <button type="button" onClick={onClick} title={title} className="grid size-7 place-items-center rounded-full bg-white/90 text-[12px] text-purple-800 shadow hover:bg-white">{children}</button>;
const Ctl = ({ children, on, onClick, label }: { children: React.ReactNode; on: boolean; onClick: () => void; label: string }) => <button type="button" onClick={onClick} title={label} className={cn("tap flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px]", on ? "bg-purple-100 text-purple-800" : "bg-cream text-ink-soft")}><span className="text-[18px] leading-none">{children}</span>{label}</button>;
