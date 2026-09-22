"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Trash2, Users } from "lucide-react";
import type { CanvasDoc, CanvasTemplateId, PortfolioItem } from "@/types/canvas";
import { cn } from "@/lib/cn";
import { CANVAS_TEMPLATES } from "@/lib/canvas-render";
import { CANVAS_EVENT, createCanvas, deleteCanvas, listCanvases, listPortfolio, newRoomCode, removePortfolio, updatePortfolio } from "@/lib/canvas-store";

const IDEAS = ["🎨 วาดภาพตามจินตนาการ", "🌈 เติมสีให้ภาพ", "✏️ ลากเส้นตามรอย", "🐛 วาดสิ่งที่พบจากการสำรวจ", "🌳 ช่วยกันสร้าง “สวนของเรา”", "🏠 วาดบ้านในฝัน", "👨‍👩‍👧 วาดภาพกับผู้ปกครอง", "📖 วาดภาพประกอบนิทาน", "💭 วาดสิ่งที่เด็กอยากเล่า", "🔢 ฝึกเขียนตัวเลข", "🔤 ฝึกเขียนตัวอักษร"];

/** 🎨 หน้าแรก Garden Canvas — วาดคนเดียว / สร้างห้องวาดร่วมกัน / เข้าห้องด้วยรหัส / แฟ้มผลงาน */
export function CanvasHome() {
  const router = useRouter();
  const [mode, setMode] = useState<"solo" | "room">("solo");
  const [tpl, setTpl] = useState<CanvasTemplateId>("blank");
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [docs, setDocs] = useState<CanvasDoc[]>([]);
  const [port, setPort] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    const load = () => { setDocs(listCanvases()); setPort(listPortfolio()); };
    load(); window.addEventListener(CANVAS_EVENT, load); return () => window.removeEventListener(CANVAS_EVENT, load);
  }, []);

  const start = () => {
    if (mode === "room") { const room = newRoomCode(); createCanvas({ template: tpl, title: title || undefined, room }); router.push(`/canvas/room/${room}`); }
    else router.push(`/canvas/${createCanvas({ template: tpl, title: title || undefined }).id}`);
  };

  return (
    <div className="container-page py-6 sm:py-10">
      <section className="rounded-3xl bg-gradient-to-br from-pink-soft via-yellow-soft to-mint-soft px-4 pb-6 pt-10 text-center sm:px-6 sm:pt-14">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-[13px] font-medium text-purple-700 shadow-soft">🎨 Garden Canvas · กระดาษสร้างสรรค์</p>
        <h1 className="mt-4 text-3xl sm:text-5xl">วันนี้จะวาดอะไรดีคะ?</h1>
        <p className="mt-2 text-[15px] text-ink-soft sm:text-base">พื้นที่สำหรับวาด เล่น ทดลอง และสร้างสรรค์ร่วมกัน — ครู เด็ก และผู้ปกครอง 💜</p>

        <div className="card mx-auto mt-6 max-w-3xl p-4 text-left sm:p-5">
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setMode("solo")} className={cn("rounded-2xl border border-line p-3 text-left hover:bg-purple-50", mode === "solo" && "border-purple-400 bg-purple-50")}><span className="text-[20px]">🖍️</span><b className="block text-[15px]">วาดคนเดียว</b><span className="text-[12px] text-ink-soft">Personal Canvas — วาด ทำใบงาน ลากเส้น</span></button>
            <button type="button" onClick={() => setMode("room")} className={cn("rounded-2xl border border-line p-3 text-left hover:bg-purple-50", mode === "room" && "border-purple-400 bg-purple-50")}><span className="text-[20px]">👩‍🏫👧</span><b className="block text-[15px]">วาดร่วมกัน</b><span className="text-[12px] text-ink-soft">Collaborative Canvas — สร้างห้อง ส่งลิงก์/รหัส วาดพร้อมกัน real-time</span></button>
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={mode === "room" ? "ชื่อกิจกรรม เช่น มาวาดสวนของเรา 🌱" : "ชื่อภาพ (ไม่ใส่ก็ได้)"} className="mt-3 w-full rounded-xl border border-line px-3 py-2 text-[15px] outline-none focus:border-purple-400" />
          <p className="mt-3 text-[13px] text-ink-soft">เลือกแม่แบบ</p>
          <div className="mt-1 grid grid-cols-4 gap-1.5 sm:grid-cols-8">
            {CANVAS_TEMPLATES.map((t) => <button key={t.id} type="button" onClick={() => setTpl(t.id)} title={t.description} className={cn("rounded-xl border border-transparent px-1 py-2 text-center text-[11px] hover:bg-purple-50", tpl === t.id && "border-purple-300 bg-purple-100 text-purple-800")}><span className="block text-[22px]">{t.emoji}</span>{t.title}</button>)}
          </div>
          <button type="button" onClick={start} className="tap mt-4 w-full rounded-full bg-purple-600 py-2.5 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700">{mode === "room" ? "สร้างห้องกิจกรรม ✨" : "เริ่มวาดเลย 🖍️"}</button>
          <form onSubmit={(e) => { e.preventDefault(); const c = code.trim().toUpperCase(); if (c.length >= 4) router.push(`/canvas/room/${c}`); }} className="mt-3 flex items-center gap-2 rounded-xl bg-cream px-3 py-2">
            <Users size={16} className="text-purple-600" /><span className="text-[13px] text-ink-soft">มีรหัสห้อง?</span>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="เช่น AB3K9Z" maxLength={8} className="min-w-0 flex-1 rounded-lg border border-line px-3 py-1.5 font-mono text-[15px] tracking-widest outline-none focus:border-purple-400" />
            <button type="submit" className="rounded-full bg-white px-3 py-1.5 text-[13px] text-purple-700 ring-1 ring-purple-200 hover:bg-purple-50">เข้าห้อง</button>
          </form>
        </div>
      </section>

      {/* ไอเดีย */}
      <section className="mt-6">
        <h2 className="text-lg">🌱 ตัวอย่างกิจกรรม</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">{IDEAS.map((i) => <span key={i} className="rounded-full bg-white px-3 py-1 text-[13px] ring-1 ring-line">{i}</span>)}</div>
      </section>

      {/* ล่าสุด */}
      <section className="mt-8">
        <h2 className="text-lg">🗂️ กระดาษของฉัน <span className="text-[13px] font-normal text-ink-soft">({docs.length})</span></h2>
        {docs.length === 0 ? <p className="mt-2 text-[14px] text-ink-soft">ยังไม่มีกระดาษ — เริ่มวาดด้านบนได้เลย</p> : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {docs.map((d) => (
              <div key={d.id} className="card card-hover flex flex-col overflow-hidden">
                <Link href={d.room ? `/canvas/room/${d.room}` : `/canvas/${d.id}`} className="block aspect-[10/7] bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {d.thumb ? <img src={d.thumb} alt={d.title} className="size-full object-cover" /> : <div className="grid size-full place-items-center text-4xl">{CANVAS_TEMPLATES.find((t) => t.id === d.template)?.emoji ?? "🎨"}</div>}
                </Link>
                <div className="flex items-center gap-1 p-2">
                  <Link href={d.room ? `/canvas/room/${d.room}` : `/canvas/${d.id}`} className="min-w-0 flex-1 truncate text-[13px] text-purple-800 hover:underline">{d.room && "👥 "}{d.title}</Link>
                  <button type="button" onClick={() => { if (confirm(`ลบ “${d.title}”?`)) deleteCanvas(d.id); }} className="text-ink-soft hover:text-red-500" title="ลบ"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* แฟ้มผลงานเด็ก */}
      <section className="mt-8">
        <h2 className="text-lg">📚 แฟ้มผลงานเด็ก <span className="text-[13px] font-normal text-ink-soft">({port.length}) · ที่เผยแพร่จะไปแสดงในหน้า <Link href="/gallery/works" className="text-purple-700 underline">ผลงานเด็ก</Link></span></h2>
        {port.length === 0 ? <p className="mt-2 text-[14px] text-ink-soft">ยังไม่มีผลงานในแฟ้ม — กด “บันทึกผลงาน” ในกระดาษวาดรูป</p> : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {port.map((p) => (
              <div key={p.id} className="card flex flex-col overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.title} className="aspect-[10/7] w-full object-cover" />
                <div className="p-2 text-[12px]">
                  <b className="block truncate text-[13px]">{p.title}</b>
                  <span className="text-ink-soft">🧒 {p.childName}</span>
                  <div className="mt-1.5 flex items-center gap-1">
                    <button type="button" onClick={() => updatePortfolio(p.id, { published: !p.published })} className={cn("rounded-full px-2 py-0.5 text-[11px] ring-1", p.published ? "bg-mint-soft text-green-800 ring-green-200" : "bg-white text-ink-soft ring-line")}>{p.published ? "🏆 เผยแพร่แล้ว" : "ยังไม่เผยแพร่"}</button>
                    <button type="button" onClick={() => { if (confirm("ลบออกจากแฟ้ม?")) removePortfolio(p.id); }} className="ml-auto text-ink-soft hover:text-red-500" title="ลบ"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
