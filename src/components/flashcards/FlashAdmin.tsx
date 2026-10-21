"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Download, Plus, RotateCcw, Save, Trash2, Upload } from "lucide-react";
import type { FlashCard, FlashCategory, FlashSet } from "@/types/flashcard";
import { PageHeader, Tag } from "@/components/ui";
import { BackButton } from "@/components/ui/BackButton";
import { NavIcon } from "@/components/ui/NavIcon";
import {
  addSet, downloadBackup, hasChanges, importJSON, moveCard, newId, removeCard, removeCategory,
  removeSet, resetAll, saveCard, saveCategory,
} from "@/lib/flashcards-store";
import { useFlashCategories } from "./useFlashcards";

const TINTS = ["bg-purple-100", "bg-pink-soft", "bg-mint-soft", "bg-sky-soft", "bg-yellow-soft"];
const EMPTY_CARD = { id: "", th: "", en: "", read: "", emoji: "🖼️", image: "", note: "" };

/**
 * 👑 จัดการแฟลชการ์ด — ครูเพิ่ม/แก้/ลบ หมวด ชุด และบัตรได้เอง โดยไม่ต้องแก้โค้ด
 * สิ่งที่แก้จะเก็บไว้ในเครื่องนี้ (localStorage) และกดคืนค่าเดิมได้ตลอด
 */
export function FlashAdmin() {
  const cats = useFlashCategories();
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [openSet, setOpenSet] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { setDirty(hasChanges()); }, [cats]);

  const addCategory = () => {
    const label = prompt("ชื่อหมวดใหม่ เช่น เครื่องดนตรี");
    if (!label?.trim()) return;
    const cat: FlashCategory = {
      id: newId("cat"), emoji: "🗂️", label: label.trim(),
      hint: "หมวดที่ครูสร้างเอง", tint: TINTS[cats.length % TINTS.length],
      group: "รอบตัวเด็ก", sets: [],
    };
    saveCategory(cat);
    setOpenCat(cat.id);
  };

  return (
    <div className="container-page py-8 sm:py-12">
      <BackButton fallback="/admin" label="ผู้ดูแลระบบ" />
      <PageHeader emoji="🃏" title="จัดการแฟลชการ์ด" description="เพิ่ม แก้ไข หรือลบหมวด ชุดบัตร และคำศัพท์ได้เอง ไม่ต้องแก้โค้ด">
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="purple">🗂️ {cats.length} หมวด</Tag>
          <Tag tone="sky">📚 {cats.reduce((n, c) => n + c.sets.length, 0)} ชุด</Tag>
          <Tag tone="mint">🃏 {cats.reduce((n, c) => n + c.sets.reduce((m, s) => m + s.cards.length, 0), 0)} ใบ</Tag>
          {dirty && <Tag tone="yellow">✏️ มีการแก้ไขที่เครื่องนี้</Tag>}
        </div>
      </PageHeader>

      <div className="mb-5 flex flex-wrap gap-2">
        <button type="button" onClick={addCategory}
          className="tap inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-5 py-2.5 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700">
          <Plus size={16} /> เพิ่มหมวดใหม่
        </button>
        <Link href="/flashcards" className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-5 py-2.5 text-[15px] font-medium text-purple-700 hover:brightness-95">
          👀 ดูหน้าแฟลชการ์ด
        </Link>
        <button type="button" onClick={() => { const n = downloadBackup(); alert(`สำรองไว้แล้ว: ${n}
เก็บไฟล์นี้ไว้นะคะ ถ้าเครื่องมีปัญหาจะนำกลับเข้ามาได้`); }}
          className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-5 py-2.5 text-[15px] font-medium text-purple-700 hover:brightness-95">
          <Download size={16} /> สำรองเป็นไฟล์
        </button>
        <label className="tap inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-cream-dark px-5 py-2.5 text-[15px] font-medium text-purple-700 hover:brightness-95">
          <Upload size={16} /> นำไฟล์สำรองกลับเข้ามา
          <input
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              if (!confirm("นำไฟล์สำรองกลับเข้ามา? ข้อมูลที่แก้ไว้ในเครื่องนี้ตอนนี้จะถูกแทนที่ทั้งหมด")) return;
              const r = importJSON(await f.text());
              alert(r.message);
            }}
          />
        </label>
        {dirty && (
          <button type="button" onClick={() => { if (confirm("คืนค่าหมวดและบัตรทั้งหมดกลับเป็นของเดิม? สิ่งที่ครูเพิ่มเองจะหายไป")) resetAll(); }}
            className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-5 py-2.5 text-[15px] font-medium text-[#a8456c] hover:brightness-95">
            <RotateCcw size={16} /> คืนค่าเดิมทั้งหมด
          </button>
        )}
      </div>

      <p className="card mb-5 p-4 text-[14px] leading-relaxed text-ink-soft">
        💾 สิ่งที่แก้ที่นี่จะเก็บไว้ใน <b>เครื่องนี้เครื่องเดียว</b> (ยังไม่ข้ามเครื่อง)
        — ถ้าทำบัตรเพิ่มเยอะแล้ว <b>กด &ldquo;สำรองเป็นไฟล์&rdquo; เก็บไว้ด้วยนะคะ</b> เผื่อเครื่องมีปัญหาหรือเบราว์เซอร์ถูกล้างข้อมูล
        จะได้นำกลับเข้ามาได้ และเอาไปเปิดที่เครื่องอื่นได้ด้วย (การย้ายขึ้นเซิร์ฟเวอร์อยู่ในรายการรอทำข้อ 6.2)
      </p>

      <div className="grid gap-3">
        {cats.map((cat) => (
          <CategoryRow
            key={cat.id}
            cat={cat}
            open={openCat === cat.id}
            onToggle={() => setOpenCat(openCat === cat.id ? null : cat.id)}
            openSet={openSet}
            setOpenSet={setOpenSet}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryRow({ cat, open, onToggle, openSet, setOpenSet }: {
  cat: FlashCategory; open: boolean; onToggle: () => void;
  openSet: string | null; setOpenSet: (v: string | null) => void;
}) {
  const [draft, setDraft] = useState(cat);
  useEffect(() => setDraft(cat), [cat]);
  const cards = cat.sets.reduce((n, s) => n + s.cards.length, 0);

  return (
    <article className="card overflow-hidden p-0">
      <button type="button" onClick={onToggle} className="tap flex w-full items-center gap-3 p-4 text-left">
        <NavIcon emoji={cat.emoji} image={cat.image} label={cat.label} tint={cat.tint} className="size-12 text-2xl" />
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[17px] text-purple-800">{cat.label}</span>
          <span className="text-[13px] text-ink-soft">{cat.group} · {cat.sets.length} ชุด · {cards} ใบ</span>
        </span>
        {open ? <ChevronUp size={18} className="text-purple-400" /> : <ChevronDown size={18} className="text-purple-400" />}
      </button>

      {open && (
        <div className="border-t border-line px-4 pt-4 pb-5">
          {/* แก้ข้อมูลหมวด */}
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="ชื่อหมวด" value={draft.label} onChange={(v) => setDraft({ ...draft, label: v })} />
            <Field label="อีโมจิ" value={draft.emoji} onChange={(v) => setDraft({ ...draft, emoji: v })} />
            <Field label="คำอธิบายสั้น ๆ" value={draft.hint} onChange={(v) => setDraft({ ...draft, hint: v })} />
            <Field label="ภาพปก (ไม่ใส่ก็ได้)" value={draft.image ?? ""} placeholder="/flashcards/animals/cover.webp"
              onChange={(v) => setDraft({ ...draft, image: v || undefined })} />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => saveCategory(draft)}
              className="tap inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-4 py-2 text-[14px] font-medium text-white shadow-soft hover:bg-purple-700">
              <Save size={15} /> บันทึกหมวด
            </button>
            <button type="button" onClick={() => addSet(cat.id)}
              className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-4 py-2 text-[14px] font-medium text-purple-700 hover:brightness-95">
              <Plus size={15} /> เพิ่มชุดที่ {Math.max(0, ...cat.sets.map((s) => s.no)) + 1}
            </button>
            <button type="button" onClick={() => { if (confirm(`ลบหมวด "${cat.label}" ทั้งหมด?`)) removeCategory(cat.id); }}
              className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-4 py-2 text-[14px] font-medium text-[#a8456c] hover:brightness-95">
              <Trash2 size={15} /> ลบหมวดนี้
            </button>
          </div>

          {/* ชุดบัตร */}
          <div className="mt-4 grid gap-2">
            {cat.sets.map((set) => (
              <SetRow
                key={set.id}
                catId={cat.id}
                set={set}
                open={openSet === set.id}
                onToggle={() => setOpenSet(openSet === set.id ? null : set.id)}
              />
            ))}
            {cat.sets.length === 0 && <p className="text-[14px] text-ink-soft">ยังไม่มีชุดบัตรในหมวดนี้</p>}
          </div>
        </div>
      )}
    </article>
  );
}

function SetRow({ catId, set, open, onToggle }: { catId: string; set: FlashSet; open: boolean; onToggle: () => void }) {
  const [adding, setAdding] = useState(false);
  const [nc, setNc] = useState(EMPTY_CARD);

  const add = () => {
    if (!nc.th.trim() || !nc.en.trim()) { alert("กรอกคำไทยและคำอังกฤษก่อนนะคะ"); return; }
    const card: FlashCard = {
      id: newId("card"), th: nc.th.trim(), en: nc.en.trim(), read: nc.read.trim(),
      emoji: nc.emoji.trim() || "🖼️",
      image: nc.image.trim() || undefined,
      note: nc.note.trim() || undefined,
    };
    saveCard(catId, set.id, card);
    setNc(EMPTY_CARD);
  };

  return (
    <div className="rounded-2xl bg-cream">
      <button type="button" onClick={onToggle} className="tap flex w-full items-center gap-3 px-4 py-3 text-left">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-purple-100 font-display text-[15px] text-purple-700">{set.no}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[15px] text-purple-800">{set.title}</span>
          <span className="text-[12px] text-ink-soft">{set.cards.length} ใบ</span>
        </span>
        {open ? <ChevronUp size={16} className="text-purple-400" /> : <ChevronDown size={16} className="text-purple-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4">
          <div className="mb-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => setAdding((a) => !a)}
              className="tap inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-4 py-1.5 text-[13px] font-medium text-white shadow-soft hover:bg-purple-700">
              <Plus size={14} /> {adding ? "ปิดแบบฟอร์ม" : "เพิ่มบัตรใหม่"}
            </button>
            <button type="button" onClick={() => { if (confirm(`ลบ "${set.title}" ทั้งชุด?`)) removeSet(catId, set.id); }}
              className="tap inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[13px] font-medium text-[#a8456c] hover:brightness-95">
              <Trash2 size={14} /> ลบชุดนี้
            </button>
          </div>

          {adding && (
            <div className="mb-3 rounded-2xl bg-white p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="คำไทย *" value={nc.th} onChange={(v) => setNc({ ...nc, th: v })} />
                <Field label="คำอังกฤษ *" value={nc.en} onChange={(v) => setNc({ ...nc, en: v })} />
                <Field label="คำอ่านอังกฤษ" value={nc.read} placeholder="แค้ท" onChange={(v) => setNc({ ...nc, read: v })} />
                <Field label="อีโมจิ" value={nc.emoji} onChange={(v) => setNc({ ...nc, emoji: v })} />
                <Field label="ภาพ (ไม่ใส่ก็ได้)" value={nc.image} placeholder="/flashcards/pets/cat.webp" onChange={(v) => setNc({ ...nc, image: v })} />
                <Field label="เกร็ดความรู้" value={nc.note} onChange={(v) => setNc({ ...nc, note: v })} />
              </div>
              <button type="button" onClick={add}
                className="tap mt-2 inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-4 py-2 text-[14px] font-medium text-white shadow-soft hover:bg-purple-700">
                <Save size={15} /> เพิ่มบัตรนี้
              </button>
            </div>
          )}

          <div className="grid gap-1.5">
            {set.cards.map((c, i) => (
              <CardRow key={c.id} catId={catId} setId={set.id} card={c} index={i} total={set.cards.length} />
            ))}
            {set.cards.length === 0 && <p className="text-[13px] text-ink-soft">ยังไม่มีบัตรในชุดนี้</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function CardRow({ catId, setId, card, index, total }: { catId: string; setId: string; card: FlashCard; index: number; total: number }) {
  const [edit, setEdit] = useState(false);
  const [d, setD] = useState(card);
  useEffect(() => setD(card), [card]);

  return (
    <div className="rounded-xl bg-white px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="w-6 shrink-0 text-center text-[12px] text-ink-soft">{index + 1}</span>
        <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-cream text-xl">
          {card.image
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={card.image} alt="" className="h-full! w-full! object-contain" />
            : card.emoji}
        </span>
        <span className="min-w-0 flex-1 truncate text-[14px]">
          <b className="text-purple-800">{card.th}</b> <span className="text-ink-soft">· {card.en}</span>
        </span>
        <button type="button" onClick={() => moveCard(catId, setId, card.id, -1)} disabled={index === 0}
          aria-label="เลื่อนขึ้น" className="tap rounded-lg px-1.5 py-1 text-purple-400 hover:bg-cream disabled:opacity-30">
          <ChevronUp size={15} />
        </button>
        <button type="button" onClick={() => moveCard(catId, setId, card.id, 1)} disabled={index === total - 1}
          aria-label="เลื่อนลง" className="tap rounded-lg px-1.5 py-1 text-purple-400 hover:bg-cream disabled:opacity-30">
          <ChevronDown size={15} />
        </button>
        <button type="button" onClick={() => setEdit((e) => !e)}
          className="tap rounded-lg px-2 py-1 text-[13px] font-medium text-purple-700 hover:bg-cream">
          {edit ? "ปิด" : "แก้ไข"}
        </button>
        <button type="button" onClick={() => { if (confirm(`ลบบัตร "${card.th}"?`)) removeCard(catId, setId, card.id); }}
          aria-label="ลบบัตร" className="tap rounded-lg px-1.5 py-1 text-[#a8456c] hover:bg-pink-soft">
          <Trash2 size={15} />
        </button>
      </div>

      {edit && (
        <div className="mt-2 border-t border-line pt-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="คำไทย" value={d.th} onChange={(v) => setD({ ...d, th: v })} />
            <Field label="คำอังกฤษ" value={d.en} onChange={(v) => setD({ ...d, en: v })} />
            <Field label="คำอ่านอังกฤษ" value={d.read} onChange={(v) => setD({ ...d, read: v })} />
            <Field label="อีโมจิ" value={d.emoji} onChange={(v) => setD({ ...d, emoji: v })} />
            <Field label="ภาพ" value={d.image ?? ""} placeholder="/flashcards/pets/cat.webp" onChange={(v) => setD({ ...d, image: v || undefined })} />
            <Field label="เกร็ดความรู้" value={d.note ?? ""} onChange={(v) => setD({ ...d, note: v || undefined })} />
          </div>
          <button type="button" onClick={() => { saveCard(catId, setId, d); setEdit(false); }}
            className="tap mt-2 inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-4 py-1.5 text-[13px] font-medium text-white shadow-soft hover:bg-purple-700">
            <Save size={14} /> บันทึก
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-0.5 block text-[12px] text-ink-soft">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-purple-400"
      />
    </label>
  );
}
