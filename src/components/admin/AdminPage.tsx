"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Database, Download, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/cn";
import { CLASS_EVENT, listArchive, listChat, listMembers, listRooms } from "@/lib/classroom-store";
import { CURRICULUM_EVENT, listCurricula } from "@/lib/curriculum-store";
import { CANVAS_EVENT, listCanvases, listPortfolio } from "@/lib/canvas-store";
import { listDev, DEV_EVENT } from "@/lib/development-store";
import { listDocs } from "@/lib/studio-store";
import { listResults, players } from "@/lib/game-store";
import { listPlayers } from "@/lib/players";
import { GAMES } from "@/data/games";
import { WORKSHEETS } from "@/data/worksheets";
import { PLANS, UNITS, GRADES } from "@/data/plans";
import { PROJECTS } from "@/data/projects";
import { NEWS } from "@/data/news";
import { CALENDAR_EVENTS } from "@/data/calendar";
import { listAllAssets } from "@/lib/studio-assets";
import { EffectAdmin } from "@/components/theme";

/**
 * 👑 Admin / CMS — ภาพรวมข้อมูลทั้งระบบ + ทางลัดไปจัดการแต่ละส่วน
 * ส่วนที่ครู/ผู้ดูแลเพิ่มเองได้จากหน้าเว็บ (ห้องเรียน หลักสูตร เอกสาร ผลงาน พัฒนาการ) แก้ได้ทันที
 * ส่วนที่เป็นเนื้อหาหลักสูตรของเว็บ (แผน เกม ใบงาน ฯลฯ) ยังอยู่ในไฟล์ข้อมูล — ระบุไว้ชัดเจนว่าอยู่ที่ไหน
 */
export function AdminPage() {
  const [tick, setTick] = useState(0);
  const [assets, setAssets] = useState(0);
  useEffect(() => {
    const l = () => setTick((t) => t + 1);
    [CLASS_EVENT, CURRICULUM_EVENT, CANVAS_EVENT, DEV_EVENT, "lpg-studio-change", "lpg-assets-change"].forEach((e) => window.addEventListener(e, l));
    listAllAssets().then((a) => setAssets(a.length)).catch(() => setAssets(0));
    return () => [CLASS_EVENT, CURRICULUM_EVENT, CANVAS_EVENT, DEV_EVENT, "lpg-studio-change", "lpg-assets-change"].forEach((e) => window.removeEventListener(e, l));
  }, []);

  const [stats, setStats] = useState({ rooms: 0, kids: 0, parents: 0, chats: 0, archives: 0, stars: 0, curricula: 0, docs: 0, portfolio: 0, published: 0, dev: 0, canvases: 0, results: 0, players: 0, profiles: 0 });
  useEffect(() => {
    const rooms = listRooms();
    setStats({
      rooms: rooms.length,
      kids: rooms.reduce((a, r) => a + listMembers(r.id).filter((m) => m.role === "child").length, 0),
      parents: rooms.reduce((a, r) => a + listMembers(r.id).filter((m) => m.role === "parent").length, 0),
      chats: rooms.reduce((a, r) => a + listChat(r.id).length, 0),
      archives: rooms.reduce((a, r) => a + listArchive(r.id).length, 0),
      stars: rooms.reduce((a, r) => a + listMembers(r.id).reduce((b, m) => b + m.stars.length, 0), 0),
      curricula: listCurricula().length, docs: listDocs().length,
      portfolio: listPortfolio().length, published: listPortfolio().filter((p) => p.published).length,
      dev: listDev().length, canvases: listCanvases().length,
      results: listResults().length, players: players().length, profiles: listPlayers().length,
    });
  }, [tick]);

  const manage: { href: string; emoji: string; title: string; desc: string; stat: string }[] = [
    { href: "/online-classroom", emoji: "🏫", title: "ห้องเรียนออนไลน์", desc: "เพิ่ม/แก้/ปิดห้อง · ชื่อเล่นห้อง · เชิญเด็กและผู้ปกครอง · ดาว", stat: `${stats.rooms} ห้อง · 👧 ${stats.kids} · 👨‍👩‍👧 ${stats.parents} · ⭐ ${stats.stars}` },
    { href: "/curriculum", emoji: "📚", title: "หลักสูตร", desc: "เพิ่มหลักสูตรใหม่ · อัปโหลด PDF · จัดโครงสร้างมาตรฐาน–ตัวบ่งชี้", stat: `${stats.curricula} ฉบับ` },
    { href: "/studio", emoji: "🌱", title: "Garden Studio", desc: "เอกสาร แผน กำหนดการ สไลด์ สเปรดชีต", stat: `${stats.docs} เอกสาร` },
    { href: "/library", emoji: "🗂️", title: "Garden Library", desc: "คลังสื่อรวมทุกไฟล์ในระบบ", stat: `${assets} ไฟล์ · คลังห้องเรียน ${stats.archives}` },
    { href: "/portfolio", emoji: "🏆", title: "แฟ้มผลงานเด็ก", desc: "หมวดหมู่ · ความคิดเห็นครู · เผยแพร่/ส่วนตัว", stat: `${stats.portfolio} ผลงาน · เผยแพร่ ${stats.published}` },
    { href: "/development", emoji: "📈", title: "ติดตามพัฒนาการ", desc: "บันทึกพัฒนาการ 4 ด้านรายเด็ก", stat: `${stats.dev} บันทึก` },
    { href: "/canvas", emoji: "🎨", title: "Garden Canvas", desc: "กระดาษวาดรูป · ห้องวาดร่วมกัน", stat: `${stats.canvases} กระดาษ` },
    { href: "/games/progress", emoji: "🎮", title: "เกม: ระดับ & พัฒนาการ", desc: "กำหนดระดับต่อห้อง/ต่อเด็ก · ดูผลการเล่น", stat: `${stats.results} ครั้ง · ${stats.players} ผู้เล่น · โปรไฟล์ ${stats.profiles}` },
  ];

  const content: { emoji: string; title: string; n: number; file: string; href: string }[] = [
    { emoji: "📖", title: "แผนการจัดประสบการณ์", n: PLANS.length, file: "src/data/plans.ts", href: "/plans" },
    { emoji: "🧩", title: "หน่วยการเรียนรู้", n: UNITS.length, file: "src/data/plans.ts", href: "/plans" },
    { emoji: "🎓", title: "ระดับชั้น", n: GRADES.length, file: "src/data/plans.ts", href: "/about" },
    { emoji: "🎮", title: "เกมการศึกษา", n: GAMES.length, file: "src/data/games.ts · games-coding.ts", href: "/games" },
    { emoji: "📝", title: "ใบงาน", n: WORKSHEETS.length, file: "src/data/worksheets.ts · worksheets-coding.ts", href: "/worksheets" },
    { emoji: "🌱", title: "โครงการ", n: PROJECTS.length, file: "src/data/projects.ts", href: "/projects" },
    { emoji: "📣", title: "ประชาสัมพันธ์", n: NEWS.length, file: "src/data/news.ts", href: "/news" },
    { emoji: "📅", title: "ปฏิทินโรงเรียน", n: CALENDAR_EVENTS.length, file: "src/data/calendar.ts", href: "/calendar" },
  ];

  /** 💾 สำรอง/กู้คืนข้อมูลทั้งหมดในเครื่องนี้ (ยกเว้นไฟล์ใน IndexedDB) */
  const backup = () => {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i)!; if (k.startsWith("lpg-")) data[k] = localStorage.getItem(k)!; }
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), data }, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `little-purple-garden-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
  };
  const restore = (file: File) => {
    const fr = new FileReader();
    fr.onload = () => { try { const j = JSON.parse(String(fr.result)) as { data: Record<string, string> }; if (!confirm("กู้คืนข้อมูลทับของเดิมในเครื่องนี้?")) return; Object.entries(j.data).forEach(([k, v]) => localStorage.setItem(k, v)); location.reload(); } catch { alert("ไฟล์สำรองไม่ถูกต้อง"); } };
    fr.readAsText(file);
  };

  return (
    <div className="container-page py-6 sm:py-10">
      <section className="rounded-3xl bg-gradient-to-br from-purple-100 via-cream to-pink-soft px-4 py-8 sm:px-6">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-[13px] font-medium text-purple-700 shadow-soft">👑 Admin · ผู้ดูแลระบบ</p>
        <h1 className="mt-3 text-3xl sm:text-4xl">จัดการระบบทั้งหมด</h1>
        <p className="mt-2 max-w-3xl text-[15px] text-ink-soft">ทางลัดไปยังทุกส่วนที่เพิ่ม/แก้/ลบได้เองจากหน้าเว็บ โดยไม่ต้องแก้โค้ด พร้อมภาพรวมจำนวนข้อมูลในระบบ</p>
      </section>

      <h2 className="mt-6 text-xl">🛠️ จัดการได้จากหน้าเว็บ</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {manage.map((m) => (
          <Link key={m.href} href={m.href} className="card card-hover flex flex-col p-4">
            <span className="text-3xl">{m.emoji}</span>
            <span className="mt-1 font-display text-[16px] text-purple-800">{m.title}</span>
            <span className="mt-0.5 flex-1 text-[12px] text-ink-soft">{m.desc}</span>
            <span className="mt-2 rounded-full bg-cream px-2 py-0.5 text-[12px]">{m.stat}</span>
          </Link>
        ))}
      </div>

      <h2 className="mt-8 text-xl">📦 เนื้อหาหลักของเว็บ</h2>
      <p className="text-[13px] text-ink-soft">ตอนนี้เก็บเป็นไฟล์ข้อมูลในโปรเจกต์ — เมื่อมีฐานข้อมูลจริงจะย้ายมาแก้ผ่านหน้าเว็บได้ทั้งหมด (โครงสร้างออกแบบไว้แล้ว)</p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] text-[13px]">
          <thead><tr className="text-left text-ink-soft"><th className="py-1 font-normal">เนื้อหา</th><th className="py-1 font-normal">จำนวน</th><th className="py-1 font-normal">ไฟล์ข้อมูล</th><th /></tr></thead>
          <tbody>
            {content.map((c) => (
              <tr key={c.title} className="border-t border-line/60">
                <td className="py-2">{c.emoji} {c.title}</td>
                <td className="py-2">{c.n}</td>
                <td className="py-2"><code className="rounded bg-cream px-1.5 text-[12px]">{c.file}</code></td>
                <td className="py-2 text-right"><Link href={c.href} className="text-purple-700 hover:underline">เปิดดู →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 text-xl">✨ เอฟเฟกต์บรรยากาศ</h2>
      <div className="mt-2"><EffectAdmin /></div>

      <h2 className="mt-8 text-xl">💾 สำรอง / กู้คืนข้อมูล</h2>
      <div className="card mt-2 flex flex-wrap items-center gap-3 p-4 text-[13px]">
        <Database size={18} className="text-purple-600" />
        <span className="min-w-0 flex-1 text-ink-soft">ข้อมูลที่ครูสร้าง (ห้องเรียน หลักสูตร เอกสาร ผลงาน พัฒนาการ ดาว ผลเกม) เก็บในเบราว์เซอร์เครื่องนี้ — สำรองไว้ก่อนล้างข้อมูลหรือย้ายเครื่อง (ไฟล์ใหญ่ใน IndexedDB เช่น PDF/คลิป ไม่รวมในไฟล์สำรองนี้)</span>
        <button type="button" onClick={backup} className="tap inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-4 py-1.5 text-white"><Download size={14} /> ดาวน์โหลดไฟล์สำรอง</button>
        <label className="tap inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white px-4 py-1.5 text-purple-700"><Upload size={14} /> กู้คืนจากไฟล์<input type="file" accept="application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) restore(f); }} /></label>
      </div>

      <div className="card mt-4 flex flex-wrap items-center gap-3 p-4 text-[13px]">
        <Trash2 size={18} className="text-red-400" />
        <span className="min-w-0 flex-1 text-ink-soft">ล้างข้อมูลที่สร้างในเครื่องนี้ทั้งหมด (ใช้ตอนทดสอบ) — ทำแล้วย้อนกลับไม่ได้ ควรสำรองก่อน</span>
        <button type="button" onClick={() => { if (confirm("ล้างข้อมูลทั้งหมดในเครื่องนี้? (สำรองไว้แล้วใช่ไหม)")) { Object.keys(localStorage).filter((k) => k.startsWith("lpg-")).forEach((k) => localStorage.removeItem(k)); indexedDB.deleteDatabase("lpg-studio"); location.reload(); } }} className={cn("tap rounded-full px-4 py-1.5 text-red-600 ring-1 ring-red-200 hover:bg-red-50")}>ล้างข้อมูลในเครื่องนี้</button>
      </div>

      <p className="mt-6 text-[12px] text-ink-soft">🔐 เมื่อมีระบบบัญชีจริง หน้านี้จะเปิดเฉพาะผู้ใช้บทบาท Admin และการแก้ไขทุกอย่างจะตรวจสิทธิ์ที่เซิร์ฟเวอร์ (ดูเอกสาร ③ Roles & Permissions)</p>
    </div>
  );
}
