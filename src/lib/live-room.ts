"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ArchiveItem, ChatMessage, ConnStatus, LiveMessage, LiveParticipant, PartStatus, StickerId } from "@/types/classroom";
import { connectRoom, type CanvasSync, type SyncMode } from "./canvas-sync";
import { addArchive, addChat, addMember, giveStar, listMembers, updateMember, type ClassMe } from "./classroom-store";
import { uid } from "./studio-store";

/**
 * 🎥 เครื่องยนต์ห้องเรียนสด — WebRTC แบบ mesh (ทุกคนเชื่อมตรงถึงกัน) ใช้ relay ws เป็น signaling
 * เหมาะกับห้องเล็ก (≈ 6–8 คน) · ครูเป็นผู้อนุมัติคนเข้าห้อง · ควบคุมไมค์/กล้อง/ฟิลเตอร์รายคน · ให้ดาว · เช็คการมีส่วนร่วม
 * ต้องเปิดจาก https:// หรือ localhost เท่านั้น (เบราว์เซอร์จึงจะให้ใช้กล้อง/ไมค์)
 */
const ICE = [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }];

export const participation = (p: LiveParticipant): PartStatus => { const dt = Date.now() - p.lastActive; return dt < 3 * 60000 ? "green" : dt < 8 * 60000 ? "yellow" : "red"; };

export interface LiveState {
  mode: SyncMode;
  live: boolean;
  me: LiveParticipant;
  others: LiveParticipant[];
  streams: Record<string, MediaStream>;
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  recording: boolean;
  pending: LiveParticipant[];
  pinged: boolean;
  toast: string | null;
  starsPopup: { toName: string; reason: string } | null;
  mediaError: string | null;
}

export function useLiveRoom(roomId: string, me0: ClassMe, opts: { isTeacher: boolean; onChat?: (m: ChatMessage) => void; onArchive?: (a: ArchiveItem) => void }) {
  const roomKey = `class-${roomId}`;
  const [mode, setMode] = useState<SyncMode>("connecting");
  const [live, setLive] = useState(false);
  const [others, setOthers] = useState<LiveParticipant[]>([]);
  const [streams, setStreams] = useState<Record<string, MediaStream>>({});
  const [localStream, setLocal] = useState<MediaStream | null>(null);
  const [screenStream, setScreen] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [pinged, setPinged] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [starsPopup, setStarsPopup] = useState<{ toName: string; reason: string } | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [me, setMeState] = useState<LiveParticipant>(() => ({ id: me0.id, name: me0.name, role: me0.role, childName: me0.childName, color: me0.color, approved: opts.isTeacher, mic: true, cam: true, sticker: "none", filterAllowed: true, hand: false, conn: "green", lastActive: Date.now(), lastSeen: Date.now() }));
  const meRef = useRef(me); meRef.current = me;
  const sync = useRef<CanvasSync<LiveMessage> | null>(null);
  const pcs = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localRef = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const kicked = useRef(false);
  const say = (t: string) => { setToast(t); setTimeout(() => setToast(null), 2200); };

  const send = useCallback((m: LiveMessage) => sync.current?.send(m), []);
  const setMe = useCallback((patch: Partial<LiveParticipant>) => { const next = { ...meRef.current, ...patch, lastSeen: Date.now() }; meRef.current = next; setMeState(next); send({ t: "presence", room: roomKey, who: next }); }, [roomKey, send]);

  /* ---- WebRTC ---- */
  const attachLocal = (pc: RTCPeerConnection) => { const s = localRef.current; if (!s) return; for (const tr of s.getTracks()) pc.addTrack(tr, s); };
  const makePc = useCallback((peer: string) => {
    if (pcs.current.has(peer)) return pcs.current.get(peer)!;
    const pc = new RTCPeerConnection({ iceServers: ICE });
    pcs.current.set(peer, pc);
    attachLocal(pc);
    pc.onicecandidate = (e) => { if (e.candidate) send({ t: "rtc", room: roomKey, from: meRef.current.id, to: peer, kind: "ice", data: e.candidate.toJSON() }); };
    pc.ontrack = (e) => { const st = e.streams[0]; if (st) setStreams((s) => ({ ...s, [peer]: st })); };
    pc.onconnectionstatechange = () => { if (["failed", "closed", "disconnected"].includes(pc.connectionState)) setStreams((s) => { const n = { ...s }; delete n[peer]; return n; }); };
    pc.onnegotiationneeded = async () => { if (meRef.current.id < peer) { try { const o = await pc.createOffer(); await pc.setLocalDescription(o); send({ t: "rtc", room: roomKey, from: meRef.current.id, to: peer, kind: "offer", data: o }); } catch { /* */ } } };
    return pc;
  }, [roomKey, send]);
  const connectTo = useCallback(async (peer: string) => {
    const pc = makePc(peer);
    if (meRef.current.id < peer && pc.signalingState === "stable" && !pc.currentRemoteDescription) {
      try { const o = await pc.createOffer(); await pc.setLocalDescription(o); send({ t: "rtc", room: roomKey, from: meRef.current.id, to: peer, kind: "offer", data: o }); } catch { /* */ }
    }
  }, [makePc, roomKey, send]);
  const dropPeer = (peer: string) => { pcs.current.get(peer)?.close(); pcs.current.delete(peer); setStreams((s) => { const n = { ...s }; delete n[peer]; return n; }); };

  /* ---- รับข้อความ ---- */
  const onMsg = useCallback(async (m: LiveMessage) => {
    const my = meRef.current;
    switch (m.t) {
      case "hello": case "presence": {
        if (m.who.id === my.id) return;
        setOthers((os) => [...os.filter((o) => o.id !== m.who.id), { ...m.who, lastSeen: Date.now() }]);
        if (m.t === "hello") { send({ t: "presence", room: roomKey, who: my }); if (opts.isTeacher) send({ t: "live", room: roomKey, on: liveRef.current, by: my.id }); }
        // เชื่อม WebRTC เมื่อทั้งคู่ได้รับอนุมัติแล้ว และเรียนสดอยู่
        if (liveRef.current && my.approved && m.who.approved && !pcs.current.has(m.who.id)) connectTo(m.who.id);
        break;
      }
      case "bye": setOthers((os) => os.filter((o) => o.id !== m.who)); dropPeer(m.who); break;
      case "admit": if (m.to !== my.id) return; if (m.ok) { setMe({ approved: true }); say("ครูอนุญาตให้เข้าห้องแล้ว 💜"); } else { kicked.current = true; say("ครูยังไม่อนุญาตให้เข้าห้องค่ะ"); } break;
      case "kick": if (m.to === my.id) { kicked.current = true; setMe({ approved: false }); say("ครูนำออกจากห้องแล้ว"); stopMedia(); } break;
      case "control": {
        if (m.to !== my.id) return;
        const patch: Partial<LiveParticipant> = {};
        if (m.mic !== undefined) { localRef.current?.getAudioTracks().forEach((t) => (t.enabled = m.mic!)); patch.mic = m.mic; }
        if (m.cam !== undefined) { localRef.current?.getVideoTracks().forEach((t) => (t.enabled = m.cam!)); patch.cam = m.cam; }
        if (m.filterAllowed !== undefined) { patch.filterAllowed = m.filterAllowed; if (!m.filterAllowed) patch.sticker = "none"; say(m.filterAllowed ? "ครูอนุญาตให้ใช้ฟิลเตอร์แล้ว 🎨" : "ครูขอให้งดใช้ฟิลเตอร์ก่อนนะคะ"); }
        setMe(patch); break;
      }
      case "star": if (m.to === my.id || m.to === my.childName) { setStarsPopup({ toName: m.toName, reason: m.reason }); setTimeout(() => setStarsPopup(null), 3500); } break;
      case "ping": if (!opts.isTeacher) setPinged(true); break;
      case "pong": setOthers((os) => os.map((o) => (o.id === m.who ? { ...o, lastActive: Date.now() } : o))); break;
      case "chat": addChat(m.msg); opts.onChat?.(m.msg); if (m.msg.by.id !== my.id) setOthers((os) => os.map((o) => (o.id === m.msg.by.id ? { ...o, lastActive: Date.now() } : o))); break;
      case "archive": addArchive(m.item); opts.onArchive?.(m.item); break;
      case "live": { liveRef.current = m.on; setLive(m.on); if (!m.on) { for (const k of Array.from(pcs.current.keys())) dropPeer(k); } else if (my.approved) { for (const o of othersRef.current) if (o.approved && !pcs.current.has(o.id)) connectTo(o.id); } break; }
      case "rtc": {
        if (m.to !== my.id) return;
        const pc = makePc(m.from);
        try {
          if (m.kind === "offer") { await pc.setRemoteDescription(m.data as RTCSessionDescriptionInit); const a = await pc.createAnswer(); await pc.setLocalDescription(a); send({ t: "rtc", room: roomKey, from: my.id, to: m.from, kind: "answer", data: a }); }
          else if (m.kind === "answer") { if (pc.signalingState === "have-local-offer") await pc.setRemoteDescription(m.data as RTCSessionDescriptionInit); }
          else if (m.kind === "ice") { try { await pc.addIceCandidate(m.data as RTCIceCandidateInit); } catch { /* */ } }
        } catch { /* */ }
        break;
      }
    }
  }, [roomKey, send, setMe, opts, connectTo, makePc]);
  const liveRef = useRef(false);
  const othersRef = useRef(others); othersRef.current = others;
  const onMsgRef = useRef(onMsg); onMsgRef.current = onMsg;

  /* ---- เชื่อมต่อ relay ---- */
  useEffect(() => {
    const s = connectRoom<LiveMessage>(roomKey, (m) => onMsgRef.current(m), (md) => { setMode(md); if (md !== "connecting") s.send({ t: "hello", room: roomKey, who: meRef.current }); });
    sync.current = s;
    const hb = setInterval(() => {
      s.send({ t: "presence", room: roomKey, who: { ...meRef.current, lastSeen: Date.now() } });
      setOthers((os) => os.filter((o) => Date.now() - o.lastSeen < 35000));
    }, 8000);
    return () => { clearInterval(hb); s.send({ t: "bye", room: roomKey, who: meRef.current.id }); s.close(); for (const k of Array.from(pcs.current.keys())) { pcs.current.get(k)?.close(); } pcs.current.clear(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomKey]);

  /* ---- คุณภาพการเชื่อมต่อของฉัน (จาก RTC stats) ---- */
  useEffect(() => {
    const t = setInterval(async () => {
      if (mode !== "ws" && mode !== "local") { if (meRef.current.conn !== "red") setMe({ conn: "red" }); return; }
      let worst: ConnStatus = "green";
      for (const pc of pcs.current.values()) {
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") { worst = "orange"; continue; }
        try {
          const st = await pc.getStats();
          st.forEach((r) => {
            if (r.type === "candidate-pair" && r.state === "succeeded" && typeof r.currentRoundTripTime === "number" && r.currentRoundTripTime > 0.4) worst = "orange";
            if (r.type === "inbound-rtp" && r.kind === "video" && r.packetsReceived > 200 && r.packetsLost / (r.packetsLost + r.packetsReceived) > 0.08) worst = "orange";
          });
        } catch { /* */ }
      }
      if (!navigator.onLine) worst = "red";
      if (worst !== meRef.current.conn) setMe({ conn: worst });
    }, 4000);
    return () => clearInterval(t);
  }, [mode, setMe]);

  /* ---- สื่อของฉัน ---- */
  const startMedia = useCallback(async (want: { video: boolean; audio: boolean } = { video: true, audio: true }) => {
    if (localRef.current) return localRef.current;
    setMediaError(null);
    if (!navigator.mediaDevices?.getUserMedia) { setMediaError("เบราว์เซอร์นี้ไม่รองรับกล้อง/ไมค์ หรือหน้าเว็บไม่ได้เปิดผ่าน https:// (เข้าห้องแบบไม่เปิดกล้องได้)"); return null; }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: want.video ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" } : false, audio: want.audio });
      localRef.current = s; setLocal(s);
      for (const pc of pcs.current.values()) for (const tr of s.getTracks()) pc.addTrack(tr, s);
      setMe({ cam: want.video, mic: want.audio });
      return s;
    } catch (e) {
      const name = (e as Error).name;
      setMediaError(name === "NotAllowedError" ? "ไม่ได้รับอนุญาตให้ใช้กล้อง/ไมค์ — กดอนุญาตที่แถบที่อยู่ของเบราว์เซอร์ หรือเข้าห้องแบบไม่เปิดกล้อง" : name === "NotFoundError" ? "ไม่พบกล้อง/ไมค์ในเครื่องนี้ — เข้าห้องแบบไม่เปิดกล้องได้" : `เปิดกล้องไม่ได้ (${name})`);
      return null;
    }
  }, [setMe]);
  const stopMedia = () => { localRef.current?.getTracks().forEach((t) => t.stop()); localRef.current = null; setLocal(null); };
  const toggleMic = () => { const on = !meRef.current.mic; localRef.current?.getAudioTracks().forEach((t) => (t.enabled = on)); setMe({ mic: on }); };
  const toggleCam = () => { const on = !meRef.current.cam; localRef.current?.getVideoTracks().forEach((t) => (t.enabled = on)); setMe({ cam: on }); };
  const setSticker = (s: StickerId) => { if (!meRef.current.filterAllowed && s !== "none") return say("ครูขอให้งดใช้ฟิลเตอร์ก่อนนะคะ"); setMe({ sticker: s, lastActive: Date.now() }); };
  const raiseHand = () => { setMe({ hand: !meRef.current.hand, lastActive: Date.now() }); };
  const active = () => { setPinged(false); setMe({ lastActive: Date.now() }); send({ t: "pong", room: roomKey, who: meRef.current.id }); };

  /* ---- แชร์หน้าจอ ---- */
  const shareScreen = async () => {
    if (screenStream) { screenStream.getTracks().forEach((t) => t.stop()); setScreen(null); const cam = localRef.current?.getVideoTracks()[0]; for (const pc of pcs.current.values()) { const sd = pc.getSenders().find((x) => x.track?.kind === "video"); if (sd && cam) sd.replaceTrack(cam); } setMe({ sharing: false }); return; }
    try {
      const s = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      setScreen(s); const tr = s.getVideoTracks()[0];
      for (const pc of pcs.current.values()) { const sd = pc.getSenders().find((x) => x.track?.kind === "video"); if (sd) sd.replaceTrack(tr); }
      tr.onended = () => { setScreen(null); const cam = localRef.current?.getVideoTracks()[0]; for (const pc of pcs.current.values()) { const sd = pc.getSenders().find((x) => x.track?.kind === "video"); if (sd && cam) sd.replaceTrack(cam); } setMe({ sharing: false }); };
      setMe({ sharing: true });
    } catch { /* ยกเลิก */ }
  };

  /* ---- บันทึกการสอน (ครู) ---- */
  const startRecording = () => {
    const src = screenStream ?? localRef.current; if (!src) return say("เปิดกล้องหรือแชร์หน้าจอก่อนบันทึกนะคะ");
    const mixed = new MediaStream([...src.getVideoTracks(), ...(localRef.current?.getAudioTracks() ?? [])]);
    const mime = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"].find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
    const r = new MediaRecorder(mixed, mime ? { mimeType: mime } : undefined);
    chunks.current = []; r.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data); };
    r.start(1000); recorder.current = r; setRecording(true); say("🔴 เริ่มบันทึกการสอน");
  };
  const stopRecording = (): Promise<Blob | null> => new Promise((res) => {
    const r = recorder.current; if (!r) return res(null);
    r.onstop = () => { const b = new Blob(chunks.current, { type: r.mimeType || "video/webm" }); recorder.current = null; setRecording(false); res(b); };
    r.stop();
  });

  /* ---- ครูควบคุม ---- */
  const teacher = {
    setLive: (on: boolean) => { liveRef.current = on; setLive(on); send({ t: "live", room: roomKey, on, by: meRef.current.id }); if (on) { for (const o of othersRef.current) if (o.approved) connectTo(o.id); } else { for (const k of Array.from(pcs.current.keys())) dropPeer(k); } },
    admit: (p: LiveParticipant, ok: boolean) => { send({ t: "admit", room: roomKey, to: p.id, ok, by: meRef.current.id }); if (ok) { addMember(roomId, { id: p.id, name: p.name, role: p.role, childName: p.childName, approved: true }); setOthers((os) => os.map((o) => (o.id === p.id ? { ...o, approved: true } : o))); if (liveRef.current) connectTo(p.id); } else setOthers((os) => os.filter((o) => o.id !== p.id)); },
    kick: (id: string) => { send({ t: "kick", room: roomKey, to: id }); dropPeer(id); setOthers((os) => os.filter((o) => o.id !== id)); },
    control: (id: string, patch: { mic?: boolean; cam?: boolean; filterAllowed?: boolean }) => { send({ t: "control", room: roomKey, to: id, ...patch }); setOthers((os) => os.map((o) => (o.id === id ? { ...o, ...patch, sticker: patch.filterAllowed === false ? "none" : o.sticker } : o))); if (patch.filterAllowed !== undefined) { const mem = listMembers(roomId).find((m) => m.id === id); if (mem) updateMember(mem.id, { filterAllowed: patch.filterAllowed }); } },
    star: (p: LiveParticipant, reason: string) => { const memberId = listMembers(roomId).find((m) => m.id === p.id)?.id ?? addMember(roomId, { id: p.id, name: p.name, role: p.role, childName: p.childName, approved: true }).id; giveStar(memberId, reason, meRef.current.name); send({ t: "star", room: roomKey, to: p.id, toName: p.name, reason, by: meRef.current.name }); say(`⭐ ให้ดาว ${p.name}: ${reason}`); },
    ping: () => { send({ t: "ping", room: roomKey, by: meRef.current.id }); say("ส่งเช็คการมีส่วนร่วมแล้ว 🙋"); },
    markActive: (id: string) => setOthers((os) => os.map((o) => (o.id === id ? { ...o, lastActive: Date.now() } : o))),
    publishArchive: (item: ArchiveItem) => send({ t: "archive", room: roomKey, item }),
  };
  const sendChat = (msg: Omit<ChatMessage, "id" | "at" | "roomId" | "by">) => { const m: ChatMessage = { id: uid(), roomId, at: new Date().toISOString(), by: { id: meRef.current.id, name: meRef.current.name, role: meRef.current.role }, ...msg }; addChat(m); send({ t: "chat", room: roomKey, msg: m }); setMe({ lastActive: Date.now() }); return m; };

  const pending = others.filter((o) => !o.approved && o.role !== "teacher");
  const state: LiveState = { mode, live, me, others, streams, localStream, screenStream, recording, pending, pinged, toast, starsPopup, mediaError };
  return { ...state, startMedia, stopMedia, toggleMic, toggleCam, setSticker, raiseHand, active, shareScreen, startRecording, stopRecording, teacher, sendChat, kicked: kicked.current, say };
}
