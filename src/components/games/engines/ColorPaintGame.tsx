"use client";

import { useCallback, useEffect, useState } from "react";
import { Eraser, Paintbrush } from "lucide-react";
import { GameShell, type GameOutcome } from "@/components/games/GameShell";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;
type ShapeId = "circle" | "square" | "triangle" | "star" | "heart";

const SHAPES: { id: ShapeId; label: string; path: string }[] = [
  { id: "circle", label: "วงกลม", path: "M50 14a38 38 0 1 0 0.001 0z" },
  { id: "square", label: "สี่เหลี่ยม", path: "M20 20h60a8 8 0 0 1 8 8v44a8 8 0 0 1-8 8H20a8 8 0 0 1-8-8V28a8 8 0 0 1 8-8z" },
  { id: "triangle", label: "สามเหลี่ยม", path: "M50 12 90 86 H10 Z" },
  { id: "star", label: "ดาว", path: "M50 10 61 38 92 40 68 60 76 90 50 73 24 90 32 60 8 40 39 38 Z" },
  { id: "heart", label: "หัวใจ", path: "M50 88C20 66 10 48 10 36c0-14 12-22 24-22 8 0 14 5 16 10 2-5 8-10 16-10 12 0 24 8 24 22 0 12-10 30-40 52z" },
];

const PALETTE: { id: string; label: string; hex: string }[] = [
  { id: "red", label: "แดง", hex: "#ef4444" },
  { id: "orange", label: "ส้ม", hex: "#fb923c" },
  { id: "yellow", label: "เหลือง", hex: "#facc15" },
  { id: "green", label: "เขียว", hex: "#4ade80" },
  { id: "blue", label: "ฟ้า", hex: "#38bdf8" },
  { id: "purple", label: "ม่วง", hex: "#c084fc" },
  { id: "pink", label: "ชมพู", hex: "#f9a8d4" },
  { id: "brown", label: "น้ำตาล", hex: "#a78b6a" },
];

/** รูปน่ารักมีหน้า — ระบายได้ด้วยการแตะ */
function CuteShape({ shape, fill }: { shape: ShapeId; fill: string | null }) {
  const s = SHAPES.find((x) => x.id === shape)!;
  const eyeY = shape === "triangle" ? 62 : shape === "heart" ? 46 : 48;
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <path d={s.path} fill={fill ?? "#ffffff"} stroke="#3b2f4a" strokeWidth={5} strokeLinejoin="round" />
      <circle cx={39} cy={eyeY} r={4} fill="#3b2f4a" />
      <circle cx={61} cy={eyeY} r={4} fill="#3b2f4a" />
      <ellipse cx={30} cy={eyeY + 9} rx={5} ry={3} fill="#f9a8d4" opacity={0.85} />
      <ellipse cx={70} cy={eyeY + 9} rx={5} ry={3} fill="#f9a8d4" opacity={0.85} />
      <path d={`M44 ${eyeY + 10} q6 6 12 0`} stroke="#3b2f4a" strokeWidth={3} fill="none" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 🎨 เกมระบายสี — จุ่มสีจากแถบข้าง แล้วแตะรูปเพื่อระบาย
 * โหมดอิสระ: ระบายตามใจชอบ · โหมดตามโจทย์: ระบายให้ตรงกับที่โจทย์บอก
 */
export function ColorPaintGame({ size = 4, colors = 5, task = true, timeLimit, onDone }: {
  /** ตารางรูป size × size */
  size?: number;
  /** จำนวนสีในแถบ */
  colors?: number;
  /** true = มีโจทย์ให้ทำ · false = ระบายอิสระ */
  task?: boolean;
  timeLimit?: number;
  onDone?: Cb;
}) {
  const palette = PALETTE.slice(0, Math.max(3, Math.min(colors, PALETTE.length)));
  const [cells, setCells] = useState<{ shape: ShapeId; color: string | null }[]>([]);
  const [pick, setPick] = useState<string | null>(palette[0]?.id ?? null);
  const [goal, setGoal] = useState<{ shape: ShapeId; color: string } | null>(null);
  const [wrongs, setWrongs] = useState(0);
  const [free, setFree] = useState(!task);
  const [done, setDone] = useState(false);

  const restart = useCallback(() => {
    const shapes = SHAPES.slice(0, Math.min(SHAPES.length, 3 + Math.floor(size / 2)));
    const next = Array.from({ length: size * size }, () => ({
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      color: null as string | null,
    })).map((c) => ({ ...c, shape: c.shape.id as ShapeId }));
    setCells(next);
    if (task) {
      const sh = shapes[Math.floor(Math.random() * shapes.length)].id as ShapeId;
      const co = palette[Math.floor(Math.random() * palette.length)].id;
      setGoal({ shape: sh, color: co });
      setPick(co);
    } else setGoal(null);
    setWrongs(0); setDone(false);
  }, [size, task]); // eslint-disable-line react-hooks/exhaustive-deps

  // สุ่มหลังหน้าเว็บพร้อม เพื่อไม่ให้ฝั่งเซิร์ฟเวอร์กับเบราว์เซอร์ต่างกัน
  useEffect(() => { restart(); }, [restart]);
  useEffect(() => { setFree(!task); }, [task]);

  const goalShape = goal ? SHAPES.find((s) => s.id === goal.shape)!.label : "";
  const goalColor = goal ? palette.find((c) => c.id === goal.color)?.label ?? "" : "";
  const targets = goal ? cells.filter((c) => c.shape === goal.shape).length : 0;
  const filled = goal ? cells.filter((c) => c.shape === goal.shape && c.color === goal.color).length : 0;

  const paint = (i: number) => {
    if (done) return;
    setCells((cs) => {
      const next = cs.map((c, k) => (k === i ? { ...c, color: pick } : c));
      if (goal && !free) {
        const target = next[i];
        // ระบายผิดรูป หรือผิดสี = นับเป็นพลาด (แต่ลบออกแก้ได้)
        if (pick !== null && (target.shape !== goal.shape || pick !== goal.color)) setWrongs((w) => w + 1);
        const ok = next.filter((c) => c.shape === goal.shape && c.color === goal.color).length;
        const bad = next.some((c) => c.shape !== goal.shape && c.color === goal.color);
        if (ok === next.filter((c) => c.shape === goal.shape).length && !bad) setTimeout(() => setDone(true), 350);
      }
      return next;
    });
  };

  return (
    <GameShell
      instruction={
        done ? `🎉 เก่งมาก! ระบาย${goalShape}เป็นสี${goalColor}ครบแล้ว`
          : free ? "🎨 จุ่มสีจากแถบด้านข้าง แล้วแตะรูปเพื่อระบายได้ตามใจเลย"
          : goal ? `ระบาย “${goalShape}” ทุกอันให้เป็นสี “${goalColor}” — รูปอื่นไม่ต้องระบายนะ`
          : "เลือกสีแล้วแตะรูปเพื่อระบาย"
      }
      progress={goal && !free ? { current: filled, total: Math.max(targets, 1) } : undefined}
      done={done}
      onRestart={restart}
      stats={free ? "ระบายอิสระ" : wrongs === 0 ? "ยังไม่ระบายผิดเลย!" : `ระบายผิด ${wrongs} ครั้ง`}
      mistakes={wrongs}
      total={Math.max(targets, 1)}
      timeLimit={timeLimit}
      onDone={onDone}
    >
      {/* สลับโหมด */}
      {task && (
        <div className="mb-3 flex flex-wrap justify-center gap-2">
          {([[false, "🎯 ทำตามโจทย์"], [true, "🖌️ ระบายอิสระ"]] as const).map(([v, label]) => (
            <button key={String(v)} type="button" onClick={() => { setFree(v); setWrongs(0); setDone(false); }}
              aria-pressed={free === v}
              className={cn("tap rounded-full px-4 py-1.5 text-[14px] font-medium transition",
                free === v ? "bg-purple-600 text-white! shadow-soft" : "bg-cream-dark text-purple-700 hover:brightness-95")}>
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center sm:gap-6">
        {/* ตารางรูป */}
        <div
          className="grid gap-2 rounded-3xl bg-white p-3 shadow-soft ring-1 ring-line"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, width: "min(86vw, 360px)" }}
        >
          {cells.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => paint(i)}
              aria-label={`${SHAPES.find((s) => s.id === c.shape)?.label} ${c.color ? `ระบายสี${palette.find((p) => p.id === c.color)?.label ?? ""}แล้ว` : "ยังไม่ได้ระบาย"}`}
              className="tap aspect-square rounded-xl transition hover:scale-105 active:scale-95"
            >
              <CuteShape shape={c.shape} fill={c.color ? palette.find((p) => p.id === c.color)?.hex ?? null : null} />
            </button>
          ))}
        </div>

        {/* แถบสี */}
        <div className="w-full max-w-[20rem] sm:w-28">
          <p className="mb-2 text-center text-[13px] text-ink-soft">🎨 จุ่มสี</p>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-2">
            {palette.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setPick(c.id)}
                aria-label={`สี${c.label}`}
                aria-pressed={pick === c.id}
                className={cn(
                  "tap grid aspect-square place-items-center rounded-2xl border-4 transition",
                  pick === c.id ? "scale-110 border-purple-600 shadow-lift" : "border-white shadow-soft hover:scale-105",
                )}
                style={{ backgroundColor: c.hex }}
              >
                {pick === c.id && <Paintbrush size={18} className="text-white drop-shadow" />}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPick(null)}
              aria-label="ยางลบ ลบสีออก"
              aria-pressed={pick === null}
              className={cn(
                "tap grid aspect-square place-items-center rounded-2xl border-4 bg-white transition",
                pick === null ? "scale-110 border-purple-600 shadow-lift" : "border-line shadow-soft hover:scale-105",
              )}
            >
              <Eraser size={18} className="text-purple-700" />
            </button>
          </div>
          <p className="mt-2 text-center text-[12px] leading-snug text-ink-soft">
            แตะสีที่อยากใช้ แล้วแตะรูปเพื่อระบาย · ระบายผิดใช้ยางลบลบออกได้
          </p>
        </div>
      </div>
    </GameShell>
  );
}
