"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameShell, type GameOutcome } from "@/components/games/GameShell";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;

interface Mole { slot: number; label: string; good: boolean; bornAt: number }

/**
 * 🔨 เกมตีตุ่น
 *
 * โหมด "เร็ว"  — ตุ่นโผล่มาก็ตีได้เลย ฝึกการตอบสนองและสมาธิ
 * โหมด "เลือก" — ตีเฉพาะตัวที่ครูบอก (เช่น ตีตัว ก เท่านั้น) ตีผิดเสียคะแนน ฝึกการจำและการยับยั้งใจ
 *
 * ปรับความยากด้วย: จำนวนรู · ตุ่นโผล่ถี่แค่ไหน · โผล่ค้างนานเท่าไร
 */
export function WhackGame({
  items, prompt, holes = 6, lifeMs = 1500, gapMs = 800, rounds = 20, timeLimit, onDone,
}: {
  /** ตัวที่จะโผล่ขึ้นมา — ถ้าไม่ใส่จะใช้ตุ่นล้วน (โหมดเร็ว) */
  items?: string[];
  /** ข้อความบอกว่าให้ตีอะไร เช่น "ตีตัวอักษร" (มี = โหมดเลือก) */
  prompt?: string;
  holes?: number;
  lifeMs?: number;
  gapMs?: number;
  rounds?: number;
  timeLimit?: number;
  onDone?: Cb;
}) {
  const pickMode = !!prompt && !!items?.length;
  // ยึดรายการให้คงที่ ไม่งั้นสร้าง array ใหม่ทุกครั้งที่เรนเดอร์ แล้วตัวจับเวลาจะถูกรีเซ็ตจนตุ่นไม่โผล่
  const pool = useMemo(() => (items?.length ? items : ["🐹"]), [items]);
  const poolKey = pool.join("|");

  const [target, setTarget] = useState<string>(() => pool[0]);
  const [moles, setMoles] = useState<Mole[]>([]);
  const [hit, setHit] = useState(0);
  const [miss, setMiss] = useState(0);
  const [shown, setShown] = useState(0);
  const [bonk, setBonk] = useState<{ slot: number; ok: boolean } | null>(null);
  const [ready, setReady] = useState(false);
  const tick = useRef(0);

  /** สำเนาของตุ่นปัจจุบัน ไว้ให้ตัวจับเวลาอ่านโดยไม่ต้องพึ่ง state ใน dependency */
  const molesRef = useRef<Mole[]>([]);
  useEffect(() => { molesRef.current = moles; }, [moles]);

  const done = shown >= rounds && moles.length === 0;

  const restart = useCallback(() => {
    setMoles([]); molesRef.current = [];
    setHit(0); setMiss(0); setShown(0); setBonk(null);
    tick.current = 0;
    setTarget(pool[Math.floor(Math.random() * pool.length)]);
  }, [pool]);

  useEffect(() => { setReady(true); restart(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** ปล่อยตุ่นตัวใหม่เรื่อย ๆ จนครบจำนวนรอบ */
  useEffect(() => {
    if (!ready || done) return;
    const t = setInterval(() => {
      if (tick.current >= rounds) return;
      const cur = molesRef.current;
      const free = Array.from({ length: holes }, (_, i) => i).filter((i) => !cur.some((m) => m.slot === i));
      if (free.length === 0) return;
      const slot = free[Math.floor(Math.random() * free.length)];
      // โหมดเลือก: ให้ตัวที่ถูกโผล่ประมาณ 40% ของรอบ
      const good = !pickMode || Math.random() < 0.4;
      const others = pool.filter((p) => p !== target);
      const label = !pickMode ? "🐹" : good ? target : (others[Math.floor(Math.random() * others.length)] ?? target);
      tick.current += 1;
      const next = [...cur, { slot, label, good, bornAt: Date.now() }];
      molesRef.current = next;
      setMoles(next);
      setShown((n) => n + 1);
    }, gapMs);
    return () => clearInterval(t);
  }, [ready, done, gapMs, holes, rounds, pickMode, poolKey, target]); // eslint-disable-line react-hooks/exhaustive-deps

  /** ตุ่นมุดกลับเองถ้าไม่โดนตี — เช็คจาก ref แล้วค่อยอัปเดต state เฉพาะตอนมีตัวมุดจริง */
  useEffect(() => {
    if (!ready) return;
    const t = setInterval(() => {
      const now = Date.now();
      const cur = molesRef.current;
      const gone = cur.filter((m) => now - m.bornAt >= lifeMs);
      if (gone.length === 0) return;
      const keep = cur.filter((m) => now - m.bornAt < lifeMs);
      molesRef.current = keep;
      setMoles(keep);
      // ปล่อยตัวที่ "ควรตี" หลุดไป = พลาด
      const escaped = gone.filter((m) => m.good).length;
      if (escaped > 0) setMiss((n) => n + escaped);
    }, 150);
    return () => clearInterval(t);
  }, [ready, lifeMs]);

  const whack = (slot: number) => {
    const m = molesRef.current.find((x) => x.slot === slot);
    if (!m) return;
    if (m.good) setHit((n) => n + 1);
    else setMiss((n) => n + 1);
    setBonk({ slot, ok: m.good });
    setTimeout(() => setBonk(null), 320);
    const keep = molesRef.current.filter((x) => x.slot !== slot);
    molesRef.current = keep;
    setMoles(keep);
  };

  const cols = holes <= 4 ? 2 : 3;

  return (
    <GameShell
      instruction={
        done ? `🎉 จบเกม! ตีโดน ${hit} ตัว`
          : pickMode ? `${prompt} “${target}” เท่านั้น — ตัวอื่นอย่าตีนะ`
          : "🔨 ตุ่นโผล่มาเมื่อไหร่ เอาค้อนตีให้ไวเลย!"
      }
      progress={{ current: Math.min(shown, rounds), total: rounds }}
      done={done}
      onRestart={restart}
      stats={`ตีโดน ${hit} · พลาด ${miss}`}
      mistakes={miss}
      total={rounds}
      timeLimit={timeLimit}
      onDone={onDone}
    >
      {pickMode && (
        <div className="mb-4 text-center">
          <p className="text-[15px] text-ink-soft">{prompt}</p>
          <p className="font-display text-[clamp(3rem,16vw,5rem)] leading-none text-purple-700">{target}</p>
        </div>
      )}

      <div
        className="mx-auto grid w-full max-w-[32rem] gap-3"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: holes }, (_, i) => {
          const m = moles.find((x) => x.slot === i);
          const b = bonk?.slot === i ? bonk : null;
          return (
            <button
              key={i}
              type="button"
              onClick={() => whack(i)}
              disabled={done}
              aria-label={m ? `รูที่ ${i + 1} มี ${m.label}` : `รูที่ ${i + 1} ว่าง`}
              style={{ containerType: "inline-size" }}
              className={cn(
                "tap relative grid aspect-square cursor-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2256%22 height=%2256%22><text y=%2244%22 font-size=%2244%22>🔨</text></svg>')_12_12,pointer] items-end justify-items-center overflow-hidden rounded-3xl border-4 border-[#caa86f] bg-gradient-to-b from-[#f0dcb4] to-[#d8b982] pb-[8%] transition",
                b?.ok && "border-mint-soft!",
                b && !b.ok && "border-pink-accent!",
              )}
            >
              {/* ปากรู */}
              <span className="absolute inset-x-[10%] bottom-[7%] h-[26%] rounded-[50%] bg-[#8a6a3d]/70" aria-hidden />
              {/* ตัวตุ่น */}
              <span
                className={cn(
                  "relative z-10 block text-[58cqw] leading-none transition-all duration-150",
                  m ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
                )}
              >
                {m?.label ?? ""}
              </span>
              {b && (
                <span className="absolute inset-0 z-20 grid place-items-center">
                  <span className="whack-hammer text-[40cqw]" aria-hidden>🔨</span>
                  <span className="absolute text-[34cqw]">{b.ok ? "💥" : "❌"}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-[13px] text-ink-soft">
        {pickMode ? "ตีถูกได้แต้ม · ตีผิดหรือปล่อยตัวที่ถูกหลุดไป จะเสียแต้ม" : "ตีให้ทันก่อนตุ่นมุดลงรู"}
      </p>
    </GameShell>
  );
}
