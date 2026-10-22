"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FlipHorizontal2, Minus, Plus, Trash2, Undo2 } from "lucide-react";
import { GameShell, type GameOutcome } from "@/components/games/GameShell";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { findScene, SCENES, type Scene } from "@/data/scene-builder";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;

interface Placed {
  id: number;
  emoji: string;
  label: string;
  /** ตำแหน่งคิดเป็น % ของฉาก จึงยืดตามขนาดจอได้ */
  x: number;
  y: number;
  /** ขนาดคิดเป็น % ของความกว้างฉาก */
  size: number;
  flip: boolean;
}

const SIZES = [
  { id: "s", label: "เล็ก", v: 7 },
  { id: "m", label: "กลาง", v: 11 },
  { id: "l", label: "ใหญ่", v: 16 },
] as const;

const MIN_SIZE = 4;
const MAX_SIZE = 32;

/**
 * 🖼️ เกมสร้างฉาก — เลือกสติกเกอร์จากถาด แล้วคลิกบนฉากเพื่อวาง
 *
 * แทนใบงานแบบ "ระบายสี ตัด แล้วแปะ" — ไม่ต้องปริ้น ไม่ต้องใช้กรรไกรและกาว
 * ไม่มีผิดถูก · วางแล้วลากย้ายได้ · ย่อขยายได้ · พลิกซ้ายขวาได้ · ลบทีละชิ้นหรือล้างทั้งฉาก
 */
export function SceneBuilderGame({ sceneId, onDone }: { sceneId?: string; onDone?: Cb }) {
  const scene: Scene = (sceneId ? findScene(sceneId) : undefined) ?? SCENES[0];

  const [group, setGroup] = useState(0);
  const [pick, setPick] = useState<{ emoji: string; label: string } | null>(null);
  const [size, setSize] = useState<number>(SIZES[1].v);
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [tellIdx, setTellIdx] = useState<number | null>(null);

  const area = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  /** ระหว่างลาก — เก็บไว้ใน ref เพื่อไม่ให้ re-render ทุกการขยับ */
  const drag = useRef<{ id: number; dx: number; dy: number; moved: boolean } | null>(null);

  const reset = useCallback(() => {
    setPlaced([]); setPick(null); setSel(null); setDone(false); setTellIdx(null); setGroup(0);
    nextId.current = 1;
  }, []);

  /* ---------- ลากย้ายสติกเกอร์ที่วางแล้ว (ใช้ได้ทั้งเมาส์และนิ้ว) ---------- */
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current; const el = area.current;
      if (!d || !el) return;
      const b = el.getBoundingClientRect();
      const x = ((e.clientX - b.left) / b.width) * 100 - d.dx;
      const y = ((e.clientY - b.top) / b.height) * 100 - d.dy;
      d.moved = true;
      setPlaced((p) => p.map((s) => (s.id === d.id ? { ...s, x: Math.min(98, Math.max(2, x)), y: Math.min(98, Math.max(2, y)) } : s)));
    };
    const up = () => { drag.current = null; };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up); };
  }, []);

  /** คลิกบนฉาก = วางสติกเกอร์ที่เลือกไว้ (ถ้ายังไม่ได้เลือก ถือว่าเลิกเลือกชิ้นที่กำลังแก้) */
  const place = (e: React.PointerEvent) => {
    if (done) return;
    if (!pick) { setSel(null); return; }
    const el = area.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    const x = ((e.clientX - b.left) / b.width) * 100;
    const y = ((e.clientY - b.top) / b.height) * 100;
    const id = nextId.current++;
    setPlaced((p) => [...p, { id, emoji: pick.emoji, label: pick.label, x, y, size, flip: false }]);
    setSel(id);
  };

  const grab = (e: React.PointerEvent, s: Placed) => {
    e.stopPropagation();
    if (done) return;
    const el = area.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    drag.current = {
      id: s.id,
      dx: ((e.clientX - b.left) / b.width) * 100 - s.x,
      dy: ((e.clientY - b.top) / b.height) * 100 - s.y,
      moved: false,
    };
    setSel(s.id);
    setPick(null); // หยิบของในฉากแล้ว เลิกโหมดวางของใหม่
  };

  const edit = (patch: (s: Placed) => Placed) => setPlaced((p) => p.map((s) => (s.id === sel ? patch(s) : s)));
  const removeSel = () => { setPlaced((p) => p.filter((s) => s.id !== sel)); setSel(null); };
  const undo = () => { setPlaced((p) => p.slice(0, -1)); setSel(null); };

  const chosen = placed.find((s) => s.id === sel);
  const g = scene.groups[group];

  return (
    <GameShell
      instruction={
        done ? `🎉 ภาพสวยมาก! หนูวางไป ${placed.length} ชิ้น`
          : chosen ? `เลือก ${chosen.label} อยู่ — ลากย้ายได้ หรือใช้ปุ่มด้านล่างเพื่อย่อ ขยาย พลิก หรือลบ`
          : pick ? `เลือก ${pick.label} แล้ว — คลิกบนภาพตรงที่อยากวางได้เลย`
          : scene.hint
      }
      done={done}
      onRestart={reset}
      stats={`${scene.emoji} ${scene.label} · วางไปแล้ว ${placed.length} ชิ้น`}
      mistakes={0}
      total={1}
      onDone={onDone}
    >
      {/* ───────── ฉาก ───────── */}
      <div
        ref={area}
        onPointerDown={place}
        className={cn(
          "relative mx-auto aspect-[4/3] w-full max-w-3xl touch-none select-none overflow-hidden rounded-3xl shadow-soft ring-1 ring-line",
          !done && pick && "cursor-copy",
        )}
        /* containerType ทำให้หน่วย cqw ของสติกเกอร์อิงความกว้างฉาก — ย่อขยายตามจอได้ */
        style={{ background: `linear-gradient(${scene.sky[0]}, ${scene.sky[1]})`, containerType: "inline-size" }}
        role="application"
        aria-label={`ฉาก${scene.label} — คลิกเพื่อวางสติกเกอร์`}
      >
        {/* พื้น */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ height: `${100 - scene.groundAt}%`, background: `linear-gradient(${scene.ground[0]}, ${scene.ground[1]})`, borderTopLeftRadius: "48% 28%", borderTopRightRadius: "52% 30%" }}
        />

        {/* ฉากหลังไกล ๆ ที่วาดไว้ให้แล้ว */}
        <div className="pointer-events-none absolute inset-x-0 flex items-end justify-around opacity-55" style={{ bottom: `${100 - scene.groundAt}%` }}>
          {scene.backdrop.map((b, i) => (
            <span key={i} className="leading-none" style={{ fontSize: `clamp(1.5rem, ${6 + (i % 3) * 1.6}vw, ${3.4 + (i % 3) * 0.7}rem)` }}>{b}</span>
          ))}
        </div>

        {/* สติกเกอร์ที่เด็กวาง */}
        {placed.map((s) => (
          <button
            key={s.id}
            type="button"
            onPointerDown={(e) => grab(e, s)}
            aria-label={`${s.label} — ลากเพื่อย้าย`}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 leading-none drop-shadow-md",
              sel === s.id && !done && "rounded-xl outline-2 outline-dashed outline-purple-600",
              !done && "cursor-grab active:cursor-grabbing",
            )}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              fontSize: `${s.size}cqw`,
              transform: `translate(-50%,-50%) scaleX(${s.flip ? -1 : 1})`,
            }}
          >
            {s.emoji}
          </button>
        ))}

        {placed.length === 0 && (
          <p className="pointer-events-none absolute inset-x-0 top-[38%] text-center text-[15px] font-medium text-purple-800/60">
            เลือกสติกเกอร์ด้านล่าง แล้วคลิกตรงนี้เพื่อวาง
          </p>
        )}
      </div>

      {/* ───────── แถบแก้ไขชิ้นที่เลือก ───────── */}
      {chosen && !done && (
        <div className="mx-auto mt-3 flex max-w-3xl flex-wrap items-center justify-center gap-2 rounded-2xl bg-purple-50 px-3 py-2">
          <span className="text-[14px] text-purple-800">{chosen.emoji} {chosen.label}</span>
          <button type="button" onClick={() => edit((s) => ({ ...s, size: Math.min(MAX_SIZE, s.size + 2) }))}
            className="tap inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-purple-700 hover:bg-cream">
            <Plus size={14} /> ใหญ่ขึ้น
          </button>
          <button type="button" onClick={() => edit((s) => ({ ...s, size: Math.max(MIN_SIZE, s.size - 2) }))}
            className="tap inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-purple-700 hover:bg-cream">
            <Minus size={14} /> เล็กลง
          </button>
          <button type="button" onClick={() => edit((s) => ({ ...s, flip: !s.flip }))}
            className="tap inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-purple-700 hover:bg-cream">
            <FlipHorizontal2 size={14} /> กลับด้าน
          </button>
          <button type="button" onClick={removeSel}
            className="tap inline-flex items-center gap-1 rounded-full bg-pink-soft px-3 py-1.5 text-[13px] font-medium text-[#a8456c] hover:brightness-95">
            <Trash2 size={14} /> ลบชิ้นนี้
          </button>
        </div>
      )}

      {/* ───────── ถาดสติกเกอร์ ───────── */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {scene.groups.map((x, i) => (
          <button
            key={x.label}
            type="button"
            onClick={() => { setGroup(i); setPick(null); }}
            aria-pressed={group === i}
            className={cn(
              "tap rounded-full px-3.5 py-1.5 text-[14px] font-medium transition",
              group === i ? "bg-purple-600 text-white! shadow-soft" : "bg-cream-dark text-purple-700 hover:brightness-95",
            )}
          >
            {x.emoji} {x.label}
          </button>
        ))}
      </div>

      <div className="mx-auto mt-3 grid max-w-3xl grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
        {g.items.map((it) => (
          <button
            key={it.emoji + it.label}
            type="button"
            onClick={() => { setPick(it); setSel(null); }}
            aria-pressed={pick?.emoji === it.emoji}
            aria-label={it.label}
            title={it.label}
            className={cn(
              "tap grid aspect-square place-items-center rounded-2xl border-2 bg-white transition",
              pick?.emoji === it.emoji ? "scale-110 border-purple-500! shadow-lift" : "border-line hover:scale-105 hover:bg-cream",
            )}
          >
            <span className="text-[clamp(1.3rem,5vw,1.9rem)] leading-none">{it.emoji}</span>
            <span className="px-0.5 text-center text-[10px] leading-tight text-ink-soft">{it.label}</span>
          </button>
        ))}
      </div>

      {/* ───────── ขนาดที่จะวาง + ปุ่มเครื่องมือ ───────── */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="text-[13px] text-ink-soft">ขนาดที่จะวาง</span>
        {SIZES.map((s) => (
          <button key={s.id} type="button" onClick={() => setSize(s.v)} aria-pressed={size === s.v}
            className={cn("tap rounded-full px-3 py-1.5 text-[13px] font-medium transition",
              size === s.v ? "bg-purple-600 text-white! shadow-soft" : "bg-cream-dark text-purple-700 hover:brightness-95")}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={undo} disabled={placed.length === 0}
          className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-4 py-2 text-[14px] font-medium text-purple-700 hover:brightness-95 disabled:opacity-40">
          <Undo2 size={16} /> ย้อนกลับ 1 ชิ้น
        </button>
        <button type="button" onClick={() => { setPlaced([]); setSel(null); }} disabled={placed.length === 0}
          className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-4 py-2 text-[14px] font-medium text-purple-700 hover:brightness-95 disabled:opacity-40">
          <Trash2 size={16} /> ล้างภาพเริ่มใหม่
        </button>
        <button type="button" onClick={() => setTellIdx((i) => (i === null ? 0 : (i + 1) % scene.tell.length))}
          className="tap inline-flex items-center gap-1.5 rounded-full bg-yellow-soft px-4 py-2 text-[14px] font-medium text-[#8a6a00] hover:brightness-95">
          💬 ชวนเล่าเรื่อง
        </button>
        <button type="button" onClick={() => setDone(true)} disabled={placed.length === 0 || done}
          className="tap inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-5 py-2 text-[14px] font-medium text-white shadow-soft hover:bg-purple-700 disabled:opacity-40">
          🎉 ทำเสร็จแล้ว
        </button>
      </div>

      {tellIdx !== null && (
        <div className="mx-auto mt-3 flex max-w-xl items-center justify-center gap-2 rounded-2xl bg-yellow-soft px-4 py-3 text-center">
          <p className="text-[15px] text-[#8a6a00]">“{scene.tell[tellIdx]}”</p>
          <SpeakButton text={scene.tell[tellIdx]} size="sm" label="" />
        </div>
      )}

      <p className="mt-3 text-center text-[13px] leading-relaxed text-ink-soft">
        🖱️ เลือกสติกเกอร์แล้วคลิกบนภาพเพื่อวาง · ลากชิ้นที่วางแล้วเพื่อย้าย · คลิกชิ้นนั้นเพื่อย่อ ขยาย กลับด้าน หรือลบ
        <br />ไม่มีผิดถูกนะ จัดภาพตามใจหนูได้เลย
      </p>
    </GameShell>
  );
}
