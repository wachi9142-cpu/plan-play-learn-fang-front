"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Eye, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * 🧩 เกมจิ๊กซอว์แบบ "เติมช่องว่าง"
 *
 * ภาพใหญ่จะมีช่องว่างกลม ๆ เจาะไว้ · ชิ้นที่หายไปวางอยู่ด้านล่าง
 * เด็กลากชิ้นไปวางให้ตรงช่อง (หรือจะแตะชิ้น แล้วแตะช่องก็ได้ — เด็กเล็กลากไม่ถนัดก็ยังเล่นได้)
 *
 * ลากด้วย Pointer Events จึงใช้ได้ทั้งนิ้วบนแท็บเล็ต/มือถือ และเมาส์บนคอม
 */

interface Hole { id: number; x: number; y: number }   // ตำแหน่งกึ่งกลางเป็นสัดส่วน 0–1 ของภาพ

const RATIO = 0.75;              // สัดส่วนภาพ 4:3
const RADIUS: Record<number, number> = { 3: 0.15, 6: 0.125, 10: 0.105 };

/**
 * วางช่องว่างแบบ "ตารางสั่น" — แบ่งภาพเป็นช่องตาราง สุ่มเลือกช่อง แล้วขยับเล็กน้อยในช่องนั้น
 * วิธีนี้การันตีว่าช่องไม่ทับกัน และได้ครบจำนวนที่ขอเสมอ (สุ่มล้วนจะวางไม่ครบเมื่อชิ้นเยอะ)
 */
const GRID: Record<number, [number, number]> = { 3: [2, 2], 6: [3, 2], 10: [4, 3] };

function makeHoles(count: number, r: number, seed: number): Hole[] {
  const rnd = (i: number) => {
    const v = Math.sin((seed + i) * 12.9898) * 43758.5453;
    return v - Math.floor(v);
  };
  const [cols, rows] = GRID[count] ?? [Math.ceil(Math.sqrt(count)), Math.ceil(Math.sqrt(count))];
  const cw = 1 / cols, ch = RATIO / rows;
  const cells = Array.from({ length: cols * rows }, (_, i) => i);
  // สุ่มลำดับช่องตาราง แล้วหยิบมาเท่าจำนวนที่ต้องการ
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rnd(i) * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  // ขยับได้แค่ไหนโดยไม่ชนขอบช่อง
  const jx = Math.max(0, cw / 2 - r), jy = Math.max(0, ch / 2 - r);
  return cells.slice(0, count).map((cell, id) => {
    const col = cell % cols, row = Math.floor(cell / cols);
    return {
      id,
      x: (col + 0.5) * cw + (rnd(id * 2 + 1) - 0.5) * 2 * jx,
      y: (row + 0.5) * ch + (rnd(id * 2 + 2) - 0.5) * 2 * jy,
    };
  });
}

const shuffled = <T,>(a: T[], seed: number): T[] => {
  const r = [...a];
  const rnd = (i: number) => { const v = Math.sin((seed + i) * 78.233) * 43758.5453; return v - Math.floor(v); };
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(rnd(i) * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

export function JigsawBoard({ image, title, pieces, onSolved }: {
  image: string;
  title: string;
  /** จำนวนชิ้นที่หายไป (3 ง่าย · 6 ปานกลาง · 10 ยาก) */
  pieces: number;
  onSolved?: (tries: number, seconds: number) => void;
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(0);
  const [seed, setSeed] = useState(1);
  const [placed, setPlaced] = useState<number[]>([]);
  const [tray, setTray] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [drag, setDrag] = useState<{ id: number; x: number; y: number } | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  const [tries, setTries] = useState(0);
  const [peek, setPeek] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [ready, setReady] = useState(false);

  const r = RADIUS[pieces] ?? 0.12;
  const holes = useMemo(() => makeHoles(pieces, r, seed), [pieces, r, seed]);

  const reset = useCallback((s: number) => {
    setSeed(s);
    setPlaced([]);
    setTray(shuffled(Array.from({ length: pieces }, (_, i) => i), s + 7));
    setPicked(null); setDrag(null); setWrong(null); setTries(0);
    setStartedAt(Date.now()); setSeconds(0);
  }, [pieces]);

  // เริ่มเกมหลังหน้าเว็บพร้อม (กันฝั่งเซิร์ฟเวอร์กับเบราว์เซอร์ไม่ตรงกัน)
  useEffect(() => { setReady(true); reset(Math.floor(Math.random() * 9999) + 1); }, [reset, image]);

  // วัดความกว้างจริงของกระดาน เพื่อตัดชิ้นให้พอดีภาพ
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, [ready]);

  const solved = ready && placed.length === pieces;

  useEffect(() => {
    if (solved || !ready) return;
    const t = setInterval(() => setSeconds(Math.floor((Date.now() - startedAt) / 1000)), 500);
    return () => clearInterval(t);
  }, [solved, ready, startedAt]);

  useEffect(() => { if (solved) onSolved?.(tries, seconds); }, [solved]); // eslint-disable-line react-hooks/exhaustive-deps

  const H = W * RATIO;
  const R = r * W;                                   // รัศมีชิ้นเป็นพิกเซล

  /** หน้าตาของชิ้นที่ตัดจากภาพ */
  const pieceStyle = (id: number): React.CSSProperties => {
    const h = holes[id];
    if (!h || !W) return {};
    return {
      width: R * 2, height: R * 2,
      backgroundImage: `url(${image})`,
      backgroundSize: `${W}px ${H}px`,
      backgroundPosition: `${-(h.x * W - R)}px ${-(h.y * W - R)}px`,
    };
  };

  /** วางชิ้นลงช่อง — ถูกก็ติด ผิดก็เด้งกลับ */
  const tryPlace = (pieceId: number, holeId: number) => {
    setTries((t) => t + 1);
    if (pieceId === holeId) {
      setPlaced((p) => [...p, pieceId]);
      setTray((t) => t.filter((x) => x !== pieceId));
      setPicked(null);
    } else {
      setWrong(holeId);
      setTimeout(() => setWrong(null), 550);
    }
  };

  /** หาช่องที่ใกล้จุดที่ปล่อยนิ้วที่สุด */
  const holeAt = (clientX: number, clientY: number): number | null => {
    const el = boardRef.current;
    if (!el || !W) return null;
    const b = el.getBoundingClientRect();
    const x = (clientX - b.left) / W, y = (clientY - b.top) / W;
    let best: number | null = null, bestD = Infinity;
    for (const h of holes) {
      if (placed.includes(h.id)) continue;
      const d = Math.hypot(h.x - x, h.y - y);
      if (d < bestD) { bestD = d; best = h.id; }
    }
    return bestD <= r * 1.35 ? best : null;
  };

  /**
   * เริ่มลาก — ฟัง pointermove/pointerup ที่ window เพื่อให้ลากออกนอกกรอบแล้วยังตามอยู่
   * ถ้าปล่อยโดยไม่ได้ขยับ = ถือว่า "แตะเลือกชิ้น" แล้วค่อยแตะช่องทีหลังได้
   */
  const onPointerDown = (e: React.PointerEvent, id: number) => {
    e.preventDefault();
    setPicked(id);
    setDrag({ id, x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (!drag) return;
    const move = (ev: PointerEvent) => setDrag((d) => (d ? { ...d, x: ev.clientX, y: ev.clientY } : d));
    const up = (ev: PointerEvent) => {
      setDrag(null);
      const h = holeAt(ev.clientX, ev.clientY);
      if (h !== null) tryPlace(drag.id, h);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", () => setDrag(null), { once: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [drag]); // eslint-disable-line react-hooks/exhaustive-deps

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div
      className="mx-auto w-full max-w-[52rem] touch-none select-none"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[14px]">
        <span className="text-ink-soft">
          🧩 ใส่แล้ว <b className="text-purple-700">{placed.length}</b>/{pieces} ชิ้น · ลองไป {tries} ครั้ง
        </span>
        <span className="font-mono tabular-nums text-ink-soft">⏱ {mm}:{ss}</span>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      {/* ภาพใหญ่ที่มีช่องว่าง */}
      <div
        ref={boardRef}
        className={cn(
          "relative w-full overflow-hidden rounded-3xl border-4 bg-cream-dark bg-cover bg-center transition lg:flex-1",
          solved ? "border-mint-soft!" : "border-purple-200",
        )}
        style={{ aspectRatio: "4 / 3", backgroundImage: `url(${image})` }}
        role="img"
        aria-label={title}
      >
        {holes.map((h) => {
          const done = placed.includes(h.id);
          const isTarget = !done && picked !== null;
          return (
            <button
              key={h.id}
              type="button"
              onClick={() => { if (!done && picked !== null) tryPlace(picked, h.id); }}
              disabled={done || picked === null}
              aria-label={done ? `ช่องที่ ${h.id + 1} ใส่แล้ว` : `ช่องว่างที่ ${h.id + 1}`}
              className={cn(
                "absolute rounded-full transition",
                done ? "ring-2 ring-white/70" : "bg-[#fdfbff] shadow-[inset_0_2px_10px_rgba(90,60,130,0.18)]",
                !done && "border-2 border-dashed border-purple-300",
                isTarget && "ring-4 ring-purple-400 animate-pulse",
                wrong === h.id && "ring-4 ring-pink-accent!",
              )}
              style={{
                left: h.x * W - R, top: h.y * W - R,
                width: R * 2, height: R * 2,
                ...(done ? pieceStyle(h.id) : {}),
              }}
            />
          );
        })}

        {peek && !solved && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="pointer-events-none absolute inset-0 h-full! w-full! object-cover" />
        )}

        {solved && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-white/65">
            <span className="rounded-2xl bg-white px-5 py-3 text-center shadow-lift">
              <span className="block text-4xl">🎉</span>
              <span className="mt-1 block font-display text-xl text-purple-800">ต่อภาพสำเร็จ!</span>
              <span className="mt-0.5 block text-[14px] text-ink-soft">{tries} ครั้ง · {mm}:{ss} นาที</span>
            </span>
          </div>
        )}
      </div>

      {/* ชิ้นที่ยังไม่ได้ใส่ — อยู่ข้างภาพบนจอใหญ่ อยู่ใต้ภาพบนมือถือ */}
      {!solved && (
        <div className="lg:w-56 lg:shrink-0">
          <p className="mb-2 text-center text-[14px] text-ink-soft">
            {picked === null
              ? "ลากชิ้นด้านล่างไปวางในช่องว่าง (หรือแตะชิ้น แล้วแตะช่องก็ได้)"
              : "แตะช่องว่างที่คิดว่าใช่ได้เลย"}
          </p>
          <div className="flex min-h-[6rem] flex-wrap items-center justify-center gap-3 rounded-3xl bg-cream-dark p-3 lg:min-h-[14rem]">
            {tray.map((id) => (
              <button
                key={id}
                type="button"
                onPointerDown={(e) => onPointerDown(e, id)}
                aria-label={`ชิ้นส่วนที่ ${id + 1}`}
                className={cn(
                  "shrink-0 rounded-full bg-cover shadow-soft transition",
                  "ring-2 ring-white",
                  picked === id && "scale-110 ring-4 ring-purple-500!",
                  drag?.id === id && "opacity-30",
                )}
                style={pieceStyle(id)}
              />
            ))}
          </div>
        </div>
      )}
      </div>

      {/* ชิ้นที่กำลังลาก — ลอยตามนิ้ว */}
      {drag && (
        <div
          className="pointer-events-none fixed z-50 rounded-full bg-cover shadow-lift ring-4 ring-purple-500"
          style={{
            ...pieceStyle(drag.id),
            left: drag.x - R, top: drag.y - R,
          }}
        />
      )}

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onPointerDown={() => setPeek(true)}
          onPointerUp={() => setPeek(false)}
          onPointerLeave={() => setPeek(false)}
          className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-4 py-2 text-[14px] font-medium text-purple-700 hover:brightness-95"
        >
          <Eye size={16} /> กดค้างเพื่อดูภาพเต็ม
        </button>
        <button
          type="button"
          onClick={() => reset(Math.floor(Math.random() * 9999) + 1)}
          className="tap inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-4 py-2 text-[14px] font-medium text-white shadow-soft hover:bg-purple-700"
        >
          <RotateCcw size={16} /> {solved ? "เล่นใหม่" : "สลับช่องใหม่"}
        </button>
      </div>
    </div>
  );
}
