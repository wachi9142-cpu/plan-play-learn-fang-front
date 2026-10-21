"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, Eye, GraduationCap, Lightbulb, MessageCircleQuestion, Sparkles, Target } from "lucide-react";
import type { Game } from "@/types";
import { getDossier } from "@/data/game-dossier";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { cn } from "@/lib/cn";

/**
 * 📁 แฟ้มข้อมูลเกมเพื่อการเรียนรู้ — แผงข้อมูลมาตรฐานที่ทุกเกมใช้เหมือนกัน
 *
 * แบ่ง 2 ฝั่งชัดเจนตามที่ครูขอ
 *  • ฝั่งเด็ก — วิธีเล่น + เกร็ดความรู้ ปุ่มใหญ่ ภาษาง่าย มีปุ่มฟังเสียงทุกแผง
 *  • ฝั่งครูและผู้ปกครอง — การ์ดสีม่วงแยกออกมาชัด ไม่ปนกับพื้นที่เล่นเกม
 *
 * ทุกแผงปิดอยู่ตอนเข้าหน้า หน้าเกมจึงสะอาด เด็กเห็นเกมก่อนเสมอ
 */

type PanelId = "how" | "facts" | "objective" | "growth" | "observe" | "extend" | "assess";

function Panel({ id, open, onToggle, icon, title, sub, tone = "kid", children, speak }: {
  id: PanelId;
  open: PanelId | null;
  onToggle: (id: PanelId) => void;
  icon: React.ReactNode;
  title: string;
  sub: string;
  tone?: "kid" | "teacher";
  children: React.ReactNode;
  /** ข้อความที่ปุ่ม 🔊 จะอ่านให้ฟัง (ใส่เฉพาะแผงฝั่งเด็ก) */
  speak?: string[];
}) {
  const isOpen = open === id;
  return (
    <div className={cn("overflow-hidden rounded-2xl border transition", isOpen ? "border-purple-300 shadow-soft" : "border-line", tone === "teacher" ? "bg-white" : "bg-white")}>
      <button
        type="button"
        onClick={() => onToggle(id)}
        aria-expanded={isOpen}
        className="tap flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-purple-50"
      >
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", tone === "teacher" ? "bg-purple-100 text-purple-700" : "bg-yellow-soft text-[#8a6a00]")}>{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[16px] leading-snug text-purple-800">{title}</span>
          <span className="block text-[13px] leading-snug text-ink-soft">{sub}</span>
        </span>
        <ChevronDown size={20} className={cn("shrink-0 text-purple-400 transition", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="border-t border-line bg-cream/60 px-4 py-4 text-[15px] leading-relaxed">
          {speak && <div className="mb-3"><SpeakButton text={speak} size="sm" label="ฟังทั้งหมด" /></div>}
          {children}
        </div>
      )}
    </div>
  );
}

const Bullets = ({ items, marker = "•" }: { items: string[]; marker?: string }) => (
  <ul className="grid gap-1.5">
    {items.map((t, i) => (
      <li key={i} className="flex gap-2">
        <span className="shrink-0 text-purple-400">{marker}</span>
        <span>{t}</span>
      </li>
    ))}
  </ul>
);

export function GameDossier({ game }: { game: Game }) {
  const d = getDossier(game);
  const [open, setOpen] = useState<PanelId | null>(null);
  const toggle = (id: PanelId) => setOpen((o) => (o === id ? null : id));

  return (
    <div className="grid gap-5">
      {/* ───── ฝั่งเด็ก ───── */}
      <section>
        <h2 className="mb-2 flex items-center gap-2 text-[15px] font-medium text-purple-500">
          <Sparkles size={16} /> เลือกดูข้อมูลเพิ่มเติม
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <Panel
            id="how" open={open} onToggle={toggle}
            icon={<BookOpen size={20} />}
            title="วิธีเล่น"
            sub="กติกาและขั้นตอน"
            speak={[`วิธีเล่น ${game.title}`, ...d.how.steps, d.how.win]}
          >
            <ol className="grid gap-2">
              {d.how.steps.map((s, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-purple-100 text-[13px] font-medium text-purple-700">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 rounded-xl bg-mint-soft px-3 py-2 text-[14px] text-[#1f6b4d]">🏁 เล่นจบเมื่อ: {d.how.win}</p>
          </Panel>

          <Panel
            id="facts" open={open} onToggle={toggle}
            icon={<Lightbulb size={20} />}
            title="เกร็ดความรู้"
            sub="ความรู้จากภาพในเกม"
            speak={d.facts.map((f) => f.text)}
          >
            <ul className="grid gap-2.5">
              {d.facts.map((f, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="shrink-0 text-2xl leading-none">{f.emoji}</span>
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </section>

      {/* ───── ฝั่งครูและผู้ปกครอง ───── */}
      <section className="rounded-3xl border border-purple-200 bg-purple-50/70 p-4 sm:p-5">
        <div className="mb-3 flex items-start gap-2.5">
          <GraduationCap size={22} className="mt-0.5 shrink-0 text-purple-600" />
          <div>
            <h2 className="font-display text-lg leading-snug text-purple-800">สำหรับครูและผู้ปกครอง</h2>
            <p className="text-[13px] leading-snug text-ink-soft">พื้นที่ข้อมูลแยกจากหน้าเล่นเกม ไม่รบกวนประสบการณ์ของเด็ก</p>
          </div>
        </div>

        <div className="grid gap-2">
          <Panel id="objective" open={open} onToggle={toggle} tone="teacher" icon={<Target size={20} />} title="จุดประสงค์การเรียนรู้" sub="เด็กควรได้ฝึกหรือเรียนรู้อะไรจากกิจกรรมนี้">
            <Bullets items={d.teacher.objective} marker="🎯" />
          </Panel>

          <Panel id="growth" open={open} onToggle={toggle} tone="teacher" icon={<Sparkles size={20} />} title="พัฒนาการและทักษะที่ส่งเสริม" sub="แยกเป็นด้าน พร้อมคำอธิบายที่ตรงกับกิจกรรมจริงในเกม">
            <div className="grid gap-2.5">
              {d.teacher.growth.map((g, i) => (
                <div key={i} className="flex gap-2.5">
                  <span className="shrink-0 text-xl leading-none">{g.emoji}</span>
                  <p><b className="text-purple-800">{g.area}</b> — {g.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 rounded-xl bg-white px-3 py-2 text-[13px] text-ink-soft">
              ℹ️ ข้อมูลนี้อธิบายว่ากิจกรรมในเกมเปิดโอกาสให้เด็กได้ฝึกอะไร ไม่ได้รับประกันว่าเล่นเกมแล้วเด็กจะมีทักษะนั้นทันที
            </p>
          </Panel>

          <Panel id="observe" open={open} onToggle={toggle} tone="teacher" icon={<Eye size={20} />} title="พฤติกรรมที่ครูสังเกตได้" sub="ตัวอย่างสิ่งที่มองเห็นระหว่างเด็กเล่น">
            <Bullets items={d.teacher.observe} marker="👁️" />
          </Panel>

          <Panel id="extend" open={open} onToggle={toggle} tone="teacher" icon={<MessageCircleQuestion size={20} />} title="คำถามชวนคิดและกิจกรรมต่อยอด" sub="ใช้คุยกับเด็กหลังเล่น และต่อยอดเป็นกิจกรรมนอกจอ">
            <p className="mb-1.5 font-medium text-purple-800">💬 คำถามชวนคิดหลังเล่น</p>
            <ul className="mb-4 grid gap-1.5">
              {d.teacher.ask.map((q, i) => (
                <li key={i} className="rounded-xl bg-white px-3 py-2">“{q}”</li>
              ))}
            </ul>
            <p className="mb-1.5 font-medium text-purple-800">🧺 กิจกรรมเสริมนอกจอ</p>
            <Bullets items={d.teacher.activity} marker="→" />
          </Panel>

          <Panel id="assess" open={open} onToggle={toggle} tone="teacher" icon={<GraduationCap size={20} />} title="แนวทางประเมินการเรียนรู้" sub="ข้อสังเกตสำหรับครู ไม่ใช่การให้คะแนนเด็ก">
            <Bullets items={d.teacher.assess} marker="✓" />
          </Panel>
        </div>
      </section>
    </div>
  );
}
