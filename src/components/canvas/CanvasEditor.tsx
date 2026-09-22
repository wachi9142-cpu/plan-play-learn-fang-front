"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Copy, Download, Eraser, ImagePlus, Link2, Loader2, Printer, Redo2, Save, Share2, Trash2, Undo2, Users } from "lucide-react";
import type { CanvasDoc, CanvasOp, CanvasTemplateId, CanvasTool, Participant, Pt, SyncMessage } from "@/types/canvas";
import { cn } from "@/lib/cn";
import { CANVAS_TEMPLATES } from "@/lib/canvas-render";
import { ROLE_EMOJI, addToPortfolio, getMe, saveCanvas } from "@/lib/canvas-store";
import { connectRoom, type CanvasSync, type SyncMode } from "@/lib/canvas-sync";
import { uid } from "@/lib/studio-store";
import { CanvasBoard, type BoardHandle } from "./CanvasBoard";
import { JoinDialog } from "./JoinDialog";

const TOOLS: { id: CanvasTool; emoji: string; label: string }[] = [
  { id: "pen", emoji: "✏️", label: "ดินสอ" },
  { id: "brush", emoji: "🖌️", label: "แปรง" },
  { id: "line", emoji: "📏", label: "เส้นตรง" },
  { id: "rect", emoji: "🟪", label: "สี่เหลี่ยม" },
  { id: "ellipse", emoji: "🔵", label: "วงกลม" },
  { id: "triangle", emoji: "🔺", label: "สามเหลี่ยม" },
  { id: "star", emoji: "⭐", label: "ดาว" },
  { id: "fill", emoji: "🪣", label: "เทสี" },
  { id: "text", emoji: "🔤", label: "ข้อความ" },
  { id: "image", emoji: "🖼️", label: "รูปภาพ" },
  { id: "move", emoji: "✋", label: "ย้าย" },
  { id: "eraser", emoji: "🧽", label: "ยางลบ" },
];
const COLORS = ["#1f1f1f", "#7c3aed", "#ec4899", "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#0ea5e9", "#3b82f6", "#a16207", "#ffffff"];
const SIZES = [3, 6, 12, 20, 32];

/** 🎨 ตัวแก้ไข Garden Canvas — วาดคนเดียว หรือวาดร่วมกันเมื่อมี doc.room */
export function CanvasEditor({ initial }: { initial: CanvasDoc }) {
  const router = useRouter();
  const board = useRef<BoardHandle>(null);
  const [doc, setDoc] = useState<CanvasDoc>(initial);
  const [ops, setOps] = useState<CanvasOp[]>(initial.ops);
  const opsRef = useRef(ops); opsRef.current = ops;
  const redo = useRef<CanvasOp[]>([]);
  const [tool, setTool] = useState<CanvasTool>("pen");
  const [color, setColor] = useState("#7c3aed");
  const [fill, setFill] = useState("");
  const [size, setSize] = useState(6);
  const [eraser, setEraser] = useState<"s" | "m" | "l">("m");
  const ERASER = { s: 16, m: 36, l: 72 } as const;
  const [me, setMe] = useState<Participant | null>(() => (typeof window !== "undefined" ? getMe() : null));
  const [others, setOthers] = useState<Participant[]>([]);
  const [mode, setMode] = useState<SyncMode>("connecting");
  const [saved, setSaved] = useState<"saved" | "saving" | "dirty">("saved");
  const [textAt, setTextAt] = useState<Pt | null>(null);
  const [textVal, setTextVal] = useState("");
  const [share, setShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState(false);
  const [childName, setChildName] = useState(initial.childName ?? "");
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const sync = useRef<CanvasSync | null>(null);
  const room = doc.room;
  const meId = me?.id ?? "me";

  const say = (m: string) => { setToast(m); setTimeout(() => setToast(null), 1800); };

  /* ---- บันทึกอัตโนมัติ ---- */
  useEffect(() => {
    setSaved("dirty");
    const t = setTimeout(() => {
      setSaved("saving");
      const cv = board.current?.compose(); let thumb: string | undefined;
      if (cv) { const s = document.createElement("canvas"); s.width = 240; s.height = Math.round((240 * cv.height) / cv.width); s.getContext("2d")!.drawImage(cv, 0, 0, s.width, s.height); thumb = s.toDataURL("image/jpeg", 0.7); }
      saveCanvas({ ...doc, ops, thumb }); setSaved("saved");
    }, 800);
    return () => clearTimeout(t);
  }, [ops, doc]);

  /* ---- ซิงก์ห้อง ---- */
  const applyRemote = useCallback((m: SyncMessage) => {
    if (m.t === "state") { if (m.ops.length || opsRef.current.length === 0) setOps(m.ops); if (m.title || m.template) setDoc((d) => ({ ...d, title: m.title ?? d.title, template: m.template ?? d.template })); }
    else if (m.t === "op") setOps((o) => (o.some((x) => x.id === m.op.id) ? o.map((x) => (x.id === m.op.id ? m.op : x)) : [...o, m.op]));
    else if (m.t === "undo") setOps((o) => o.filter((x) => x.id !== m.opId));
    else if (m.t === "clear") setOps([]);
    else if (m.t === "meta") setDoc((d) => ({ ...d, title: m.title ?? d.title, template: m.template ?? d.template }));
    else if (m.t === "hello" || m.t === "presence") { if (m.who.id === meId) return; setOthers((os) => [...os.filter((o) => o.id !== m.who.id), { ...m.who, cursor: os.find((o) => o.id === m.who.id)?.cursor, lastSeen: Date.now() }]); if (m.t === "hello" && me) { sync.current?.send({ t: "presence", room: room!, who: me }); if (opsRef.current.length) sync.current?.send({ t: "state", room: room!, ops: opsRef.current, title: doc.title, template: doc.template }); } }
    else if (m.t === "cursor") setOthers((os) => os.map((o) => (o.id === m.who ? { ...o, cursor: m.at ?? undefined, lastSeen: Date.now() } : o)));
    else if (m.t === "bye") setOthers((os) => os.filter((o) => o.id !== m.who));
  }, [meId, me, room, doc.title, doc.template]);
  const applyRef = useRef(applyRemote); applyRef.current = applyRemote;

  useEffect(() => {
    if (!room || !me) return;
    const s = connectRoom(room, (m) => applyRef.current(m), (md) => { setMode(md); if (md !== "connecting") s.send({ t: "hello", room, who: me, ops: opsRef.current }); });
    sync.current = s;
    const hb = setInterval(() => { s.send({ t: "presence", room, who: { ...me, lastSeen: Date.now() } }); setOthers((os) => os.filter((o) => Date.now() - o.lastSeen < 40000)); }, 10000);
    return () => { clearInterval(hb); s.send({ t: "bye", room, who: me.id }); s.close(); sync.current = null; };
  }, [room, me]);

  const send = (m: SyncMessage) => sync.current?.send(m);
  const cursorT = useRef(0);

  /* ---- การวาด ---- */
  const addOp = (op: CanvasOp) => { setOps((o) => [...o, op]); redo.current = []; if (room) send({ t: "op", room, op }); };
  const replaceOp = (op: CanvasOp) => { setOps((o) => o.map((x) => (x.id === op.id ? op : x))); if (room) send({ t: "op", room, op }); };
  const undo = () => { const mine = [...ops].reverse().find((o) => o.by === meId); if (!mine) return; redo.current.push(mine); setOps((o) => o.filter((x) => x.id !== mine.id)); if (room) send({ t: "undo", room, opId: mine.id }); };
  const doRedo = () => { const op = redo.current.pop(); if (!op) return; setOps((o) => [...o, op]); if (room) send({ t: "op", room, op }); };
  const clearAll = () => { if (ops.length === 0) return; if (!confirm("ล้างกระดาษทั้งหมด? (ลบทุกอย่างที่วาดไว้)")) return; setOps([]); redo.current = []; if (room) send({ t: "clear", room, by: meId }); };
  const addText = () => { if (!textAt || !textVal.trim()) { setTextAt(null); return; } addOp({ id: uid(), by: meId, kind: "text", text: textVal.trim(), color, size: Math.max(18, size * 5), at: textAt }); setTextAt(null); setTextVal(""); };
  const addImage = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 900; const k = Math.min(1, max / Math.max(img.width, img.height));
      const cv = document.createElement("canvas"); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k); cv.getContext("2d")!.drawImage(img, 0, 0, cv.width, cv.height);
      const src = cv.toDataURL("image/jpeg", 0.85); URL.revokeObjectURL(url);
      const w = Math.min(doc.width * 0.5, cv.width), h = (w * cv.height) / cv.width;
      addOp({ id: uid(), by: meId, kind: "image", src, x: (doc.width - w) / 2, y: (doc.height - h) / 2, w, h }); setTool("move"); say("วางรูปแล้ว ลากย้ายได้ด้วย ✋");
    };
    img.src = url;
  };
  const changeTemplate = (t: CanvasTemplateId) => { setDoc((d) => ({ ...d, template: t })); if (room) send({ t: "meta", room, template: t }); };
  const changeTitle = (title: string) => { setDoc((d) => ({ ...d, title })); if (room) send({ t: "meta", room, title }); };

  /* ---- ส่งออก ---- */
  const dl = (kind: "png" | "jpg") => { const cv = board.current?.compose(); if (!cv) return; const a = document.createElement("a"); a.href = kind === "png" ? cv.toDataURL("image/png") : cv.toDataURL("image/jpeg", 0.92); a.download = `${doc.title || "ภาพวาด"}.${kind}`; a.click(); say("ดาวน์โหลดแล้ว ✅"); };
  const [printSrc, setPrintSrc] = useState<string | null>(null);
  const printPdf = () => { const cv = board.current?.compose(); if (!cv) return; setPrintSrc(cv.toDataURL("image/png")); setTimeout(() => { window.print(); setTimeout(() => setPrintSrc(null), 500); }, 200); };
  const saveToPortfolio = (publish: boolean) => {
    const cv = board.current?.compose(); if (!cv) return;
    setBusy("portfolio");
    const name = childName.trim() || me?.name || "หนู";
    addToPortfolio({ canvasId: doc.id, title: doc.title, childName: name, image: cv.toDataURL("image/jpeg", 0.85), published: publish, planId: doc.planId, authors: [me?.name ?? "", ...others.map((o) => o.name)].filter(Boolean) });
    setDoc((d) => ({ ...d, childName: name })); setBusy(null); setPortfolio(false);
    say(publish ? "เก็บในแฟ้ม + เผยแพร่ในผลงานเด็กแล้ว 🏆" : "เก็บในแฟ้มผลงานเด็กแล้ว 📚");
  };

  const link = useMemo(() => (typeof window !== "undefined" && room ? `${window.location.origin}/canvas/room/${room}` : ""), [room]);
  const copyLink = async () => { try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ไม่รองรับ */ } };
  const shareNative = async () => { if (navigator.share) { try { await navigator.share({ title: doc.title, text: `มาวาดด้วยกัน: ${doc.title} · รหัสห้อง ${room}`, url: link }); } catch { /* ยกเลิก */ } } else copyLink(); };

  if (room && !me) return <JoinDialog title={doc.title} room={room} onJoin={setMe} />;
  const meSafe: Participant = me ?? { id: "me", name: "ฉัน", role: "teacher", color: "#7c3aed", lastSeen: 0 };

  return (
    <div className="min-h-dvh bg-cream">
      {/* แถบบน */}
      <div className="no-print sticky top-16 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 sm:px-4">
          <Link href="/canvas" className="tap inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[14px] text-purple-700 hover:bg-purple-50"><ArrowLeft size={16} /> Canvas</Link>
          <span className="rounded-full bg-pink-soft px-2.5 py-0.5 text-[12px] text-purple-800">🎨 {room ? "วาดร่วมกัน" : "วาดคนเดียว"}</span>
          <input value={doc.title} onChange={(e) => changeTitle(e.target.value)} placeholder="ชื่อกิจกรรม" className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1 font-display text-[16px] text-purple-800 outline-none hover:bg-purple-50 focus:bg-purple-50" aria-label="ชื่อกิจกรรม" />
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <span className="hidden text-[12px] text-ink-soft sm:inline">{saved === "saved" ? "🟢 บันทึกแล้ว" : saved === "saving" ? "🟡 กำลังบันทึก" : "🟡 มีการเปลี่ยนแปลง"}</span>
            {room && (
              <button type="button" onClick={() => setShare((s) => !s)} className="tap inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-white px-3 py-1.5 text-[13px] font-medium text-purple-700 hover:bg-purple-50"><Share2 size={14} /> เชิญเพื่อน · <b className="tracking-widest">{room}</b></button>
            )}
            <Menu label={<><Download size={14} /> ดาวน์โหลด</>}>
              <MI onClick={() => dl("png")}>🖼️ PNG</MI>
              <MI onClick={() => dl("jpg")}>🖼️ JPG</MI>
              <MI onClick={printPdf}>📄 PDF / <Printer size={12} className="inline" /> พิมพ์</MI>
            </Menu>
            <button type="button" onClick={() => setPortfolio(true)} className="tap inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-4 py-1.5 text-[14px] font-medium text-white shadow-soft hover:bg-purple-700"><Save size={15} /> บันทึกผลงาน</button>
          </div>
        </div>

        {/* แถบเครื่องมือ */}
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 px-3 pb-2 sm:px-4">
          {TOOLS.map((t) => (
            <button key={t.id} type="button" title={t.label} onClick={() => { if (t.id === "image") fileRef.current?.click(); else setTool(t.id); }} className={cn("tap flex shrink-0 flex-col items-center rounded-xl px-2 py-1 text-[10px] text-ink-soft hover:bg-purple-50", tool === t.id && "bg-purple-100 text-purple-800")}>
              <span className="text-[18px] leading-none">{t.emoji}</span>{t.label}
            </button>
          ))}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) addImage(f); e.target.value = ""; }} />
          <span className="mx-1 h-6 w-px shrink-0 bg-line" />
          <div className="flex shrink-0 items-center gap-1">
            {COLORS.map((c) => <button key={c} type="button" onClick={() => setColor(c)} className={cn("size-6 rounded-full ring-2 ring-offset-1", color === c ? "ring-purple-500" : "ring-transparent", c === "#ffffff" && "border border-line")} style={{ background: c }} aria-label={c} />)}
            <label className="relative size-6 cursor-pointer overflow-hidden rounded-full border border-line" style={{ background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }} title="สีอื่น ๆ"><input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" /></label>
          </div>
          <span className="mx-1 h-6 w-px shrink-0 bg-line" />
          <div className="flex shrink-0 items-center gap-1" title="ขนาดหัวปากกา">
            {SIZES.map((s) => <button key={s} type="button" onClick={() => setSize(s)} className={cn("grid size-8 place-items-center rounded-full hover:bg-purple-50", size === s && "bg-purple-100")}><span className="rounded-full bg-ink" style={{ width: Math.min(22, s + 2), height: Math.min(22, s + 2) }} /></button>)}
          </div>
          {tool === "eraser" && (
            <div className="ml-1 flex shrink-0 items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[12px]">
              <span className="text-ink-soft">🧽 ขนาด</span>
              {(["s", "m", "l"] as const).map((k) => <button key={k} type="button" onClick={() => setEraser(k)} className={cn("rounded-full px-2 py-0.5", eraser === k ? "bg-purple-600 text-white" : "hover:bg-white")}>{k === "s" ? "เล็ก" : k === "m" ? "กลาง" : "ใหญ่"}</button>)}
            </div>
          )}
          {["rect", "ellipse", "triangle", "star"].includes(tool) && (
            <label className="ml-1 inline-flex shrink-0 items-center gap-1 text-[12px] text-ink-soft">ทึบ <input type="checkbox" checked={!!fill} onChange={(e) => setFill(e.target.checked ? color : "")} /> {fill && <input type="color" value={fill} onChange={(e) => setFill(e.target.value)} className="size-6 rounded border border-line p-0" />}</label>
          )}
          <span className="mx-1 h-6 w-px shrink-0 bg-line" />
          <Tb onClick={undo} title="ย้อนกลับ (Ctrl+Z)"><Undo2 size={15} /></Tb>
          <Tb onClick={doRedo} title="ทำซ้ำ (Ctrl+Y)"><Redo2 size={15} /></Tb>
          <button type="button" onClick={() => setTool("eraser")} title="ยางลบ (ลบเฉพาะจุด)" className={cn("tap inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[12px]", tool === "eraser" ? "bg-purple-600 text-white" : "border border-line bg-white text-ink-soft hover:bg-purple-50")}><Eraser size={14} /> ยางลบ</button>
          <button type="button" onClick={clearAll} title="ล้างทั้งหมด (ลบทุกอย่างบนกระดาษ)" className="tap inline-flex shrink-0 items-center gap-1 rounded-full border border-red-200 bg-white px-3 py-1.5 text-[12px] text-red-500 hover:bg-red-50"><Trash2 size={14} /> ล้างทั้งหมด</button>
          <Tb onClick={() => fileRef.current?.click()} title="เพิ่มรูป"><ImagePlus size={15} /></Tb>
        </div>
      </div>

      {/* แชร์ */}
      {share && room && (
        <div className="no-print container-page mt-3">
          <div className="card flex flex-wrap items-center gap-3 p-3 sm:p-4">
            <div className="text-[13px] text-ink-soft">ส่งลิงก์หรือรหัสห้องให้เด็ก/ผู้ปกครองเปิดจากมือถือ แท็บเล็ต หรือคอม แล้ววาดบนกระดาษเดียวกันได้เลย</div>
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-cream px-3 py-2 text-[13px]"><Link2 size={14} className="text-purple-600" /><span className="min-w-0 flex-1 truncate">{link}</span></div>
            <span className="rounded-xl bg-purple-600 px-3 py-2 font-display text-[18px] tracking-[0.3em] text-white">{room}</span>
            <button type="button" onClick={copyLink} className="tap rounded-full border border-purple-200 bg-white px-3 py-1.5 text-[13px] text-purple-700 hover:bg-purple-50">{copied ? <><Check size={13} className="inline" /> คัดลอกแล้ว</> : <><Copy size={13} className="inline" /> คัดลอกลิงก์</>}</button>
            <button type="button" onClick={shareNative} className="tap rounded-full bg-purple-600 px-3 py-1.5 text-[13px] text-white hover:bg-purple-700"><Share2 size={13} className="inline" /> แชร์</button>
            <p className="w-full text-[12px] text-ink-soft">
              {mode === "ws" ? "🟢 เชื่อมต่อเซิร์ฟเวอร์ห้องวาดแล้ว — ทุกเครื่องเห็นภาพเดียวกันแบบ real-time" : mode === "local" ? "🟡 ยังไม่พบเซิร์ฟเวอร์ห้องวาด: ตอนนี้ซิงก์ได้เฉพาะแท็บในเครื่องเดียวกัน · ให้ครูรัน npm run canvas-server (พอร์ต 3003) แล้วเด็กเปิดเว็บด้วย IP ของเครื่องครูใน Wi-Fi เดียวกัน" : "⏳ กำลังเชื่อมต่อ…"}
            </p>
          </div>
        </div>
      )}

      <div className="container-page flex flex-col gap-4 py-4 lg:flex-row">
        {/* กระดาษ */}
        <div className="min-w-0 flex-1">
          <CanvasBoard ref={board} width={doc.width} height={doc.height} template={doc.template} ops={ops} tool={tool} color={color} size={size} fill={fill} eraserSize={ERASER[eraser]} me={meSafe} others={others}
            onOp={addOp} onMove={replaceOp}
            onCursor={(p) => { if (!room) return; const now = Date.now(); if (now - cursorT.current < 60 && p) return; cursorT.current = now; send({ t: "cursor", room, who: meId, at: p }); }}
            onTextAt={(p) => { setTextAt(p); setTextVal(""); }}
          />
          {textAt && (
            <div className="no-print card mt-3 flex flex-wrap items-center gap-2 p-3">
              <span className="text-[13px] text-ink-soft">🔤 พิมพ์ข้อความ</span>
              <input autoFocus value={textVal} onChange={(e) => setTextVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addText(); if (e.key === "Escape") setTextAt(null); }} placeholder="เช่น สวนของเรา" className="min-w-0 flex-1 rounded-lg border border-line px-3 py-1.5 text-[15px] outline-none focus:border-purple-400" />
              <button type="button" onClick={addText} className="rounded-full bg-purple-600 px-4 py-1.5 text-[13px] text-white">วาง</button>
              <button type="button" onClick={() => setTextAt(null)} className="rounded-full px-3 py-1.5 text-[13px] text-ink-soft">ยกเลิก</button>
            </div>
          )}
        </div>

        {/* ข้าง: ผู้ร่วมวาด + แม่แบบ */}
        <aside className="no-print w-full shrink-0 space-y-3 lg:w-[240px]">
          <div className="card p-3">
            <h3 className="flex items-center gap-1.5 text-[14px]"><Users size={15} className="text-purple-600" /> {room ? "กำลังวาดอยู่" : "ผู้วาด"} <span className="ml-auto text-[12px] text-ink-soft">{others.length + 1} คน</span></h3>
            <ul className="mt-2 space-y-1.5 text-[13px]">
              <li className="flex items-center gap-2"><span className="size-3 rounded-full" style={{ background: meSafe.color }} /> {ROLE_EMOJI[meSafe.role]} {meSafe.name} <span className="text-[11px] text-ink-soft">(ฉัน)</span></li>
              {others.map((o) => <li key={o.id} className="flex items-center gap-2"><span className="size-3 rounded-full" style={{ background: o.color }} /> {ROLE_EMOJI[o.role]} {o.name} {o.cursor && <span className="text-[11px] text-ink-soft">✏️ กำลังวาด</span>}</li>)}
            </ul>
            {room && <p className="mt-2 text-[11px] text-ink-soft">{mode === "ws" ? "🟢 real-time" : mode === "local" ? "🟡 ซิงก์เฉพาะเครื่องนี้ (ยังไม่มีเซิร์ฟเวอร์)" : "⏳ กำลังเชื่อมต่อ"}</p>}
          </div>
          <div className="card p-3">
            <h3 className="text-[14px]">🌱 แม่แบบกิจกรรม</h3>
            <div className="mt-2 grid grid-cols-4 gap-1 lg:grid-cols-2">
              {CANVAS_TEMPLATES.map((t) => <button key={t.id} type="button" onClick={() => changeTemplate(t.id)} title={t.description} className={cn("rounded-xl px-1 py-1.5 text-center text-[11px] hover:bg-purple-50", doc.template === t.id && "bg-purple-100 text-purple-800")}><span className="block text-[18px]">{t.emoji}</span>{t.title}</button>)}
            </div>
          </div>
          <div className="card p-3 text-[12px] text-ink-soft">
            💡 ใช้นิ้ว/ปากกา/เมาส์วาดได้ · กด Shift ค้างตอนลากรูปทรงให้ได้สัดส่วนเท่ากัน · ✋ ย้ายรูปและข้อความ · Ctrl+Z ย้อนกลับ
          </div>
        </aside>
      </div>

      {/* แฟ้มผลงาน */}
      {portfolio && (
        <div className="no-print fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" onClick={() => setPortfolio(false)}>
          <div className="card w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg">💾 บันทึกผลงาน</h3>
            <p className="mt-1 text-[13px] text-ink-soft">ภาพจะถูกบันทึกในเครื่องนี้แล้ว (อัตโนมัติ) — เลือกเก็บเข้าแฟ้มผลงานเด็ก และเผยแพร่ในหน้า “ผลงานเด็ก” ได้</p>
            <label className="mt-3 block text-[13px]">ชื่อเด็กเจ้าของผลงาน<input value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="เช่น น้องเอ" className="mt-1 w-full rounded-lg border border-line px-3 py-2 outline-none focus:border-purple-400" /></label>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setPortfolio(false)} className="rounded-full px-3 py-1.5 text-[13px] text-ink-soft">ยกเลิก</button>
              <button type="button" disabled={!!busy} onClick={() => saveToPortfolio(false)} className="rounded-full border border-purple-200 bg-white px-4 py-1.5 text-[13px] text-purple-700 hover:bg-purple-50">📚 เก็บในแฟ้มผลงาน</button>
              <button type="button" disabled={!!busy} onClick={() => saveToPortfolio(true)} className="rounded-full bg-purple-600 px-4 py-1.5 text-[13px] text-white hover:bg-purple-700">{busy ? <Loader2 size={14} className="inline animate-spin" /> : "🏆"} เก็บ + เผยแพร่ในผลงานเด็ก</button>
            </div>
          </div>
        </div>
      )}

      {/* สำหรับพิมพ์/PDF */}
      {printSrc && <div className="canvas-print"><img src={printSrc} alt={doc.title} /></div>}
      {toast && <div className="no-print fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-[13px] text-white shadow-lg animate-rise">{toast}</div>}
      <KeyBinds onUndo={undo} onRedo={doRedo} />
    </div>
  );
}

function KeyBinds({ onUndo, onRedo }: { onUndo: () => void; onRedo: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.target as HTMLElement).tagName === "INPUT") return; if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); if (e.shiftKey) onRedo(); else onUndo(); } if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") { e.preventDefault(); onRedo(); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [onUndo, onRedo]);
  return null;
}

function Tb({ children, onClick, title, danger = false }: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) {
  return <button type="button" title={title} onClick={onClick} className={cn("grid size-8 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-purple-50 hover:text-purple-700", danger && "hover:text-red-500")}>{children}</button>;
}
function Menu({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="tap inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-white px-3 py-1.5 text-[13px] font-medium text-purple-700 hover:bg-purple-50">{label}</button>
      {open && <div className="absolute right-0 z-40 mt-1 w-44 rounded-2xl border border-line bg-white p-1.5 shadow-lg" onClick={() => setOpen(false)}>{children}</div>}
    </div>
  );
}
const MI = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => <button type="button" onClick={onClick} className="block w-full rounded-xl px-3 py-1.5 text-left text-[13px] hover:bg-purple-50">{children}</button>;
