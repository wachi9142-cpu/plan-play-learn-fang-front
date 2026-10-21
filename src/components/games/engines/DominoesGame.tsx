"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell, type GameOutcome } from "@/components/games/GameShell";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;
type Tile = [number, number];

/** จุดบนหน้าโดมิโน — เรียงแบบลูกเต๋า */
const DOTS: Record<number, [number, number][]> = {
  0: [],
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
  6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
  7: [[0, 0], [2, 0], [0, 1], [2, 1], [1, 1], [0, 2], [2, 2]],
  8: [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2]],
  9: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]],
};

const shuffled = <T,>(a: T[]): T[] => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
};

/** หน้าโดมิโน 1 ตัว */
function Face({ n, size = 34 }: { n: number; size?: number }) {
  return (
    <span className="grid shrink-0 grid-cols-3 grid-rows-3 gap-[2px] p-[3px]" style={{ width: size, height: size }} aria-hidden>
      {Array.from({ length: 9 }, (_, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const on = (DOTS[n] ?? []).some(([c, r]) => c === col && r === row);
        return <span key={i} className={cn("rounded-full", on ? "bg-purple-800" : "bg-transparent")} />;
      })}
    </span>
  );
}

function TileView({ t, vertical = false, size = 34 }: { t: Tile; vertical?: boolean; size?: number }) {
  return (
    <span className={cn("inline-flex items-center rounded-lg border-2 border-purple-200 bg-white", vertical ? "flex-col" : "flex-row")}>
      <Face n={t[0]} size={size} />
      <span className={cn("bg-purple-200", vertical ? "h-[2px] w-[70%]" : "h-[70%] w-[2px]")} />
      <Face n={t[1]} size={size} />
    </span>
  );
}

/**
 * 🀄 โดมิโน — มีโหมดเดียว ไม่ต้องเลือกระดับ
 * ต่อเลขให้ตรงกับปลายแถว ใครหมดมือก่อนชนะ · ถ้าต่อไม่ได้ให้จั่วจากกอง
 */
export function DominoesGame({ max = 6, onDone }: { max?: number; onDone?: Cb }) {
  const [board, setBoard] = useState<Tile[]>([]);
  const [hand, setHand] = useState<Tile[]>([]);
  const [cpu, setCpu] = useState<Tile[]>([]);
  const [pool, setPool] = useState<Tile[]>([]);
  const [turn, setTurn] = useState<"me" | "cpu">("me");
  const [sel, setSel] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [over, setOver] = useState<"me" | "cpu" | "draw" | null>(null);
  const [ready, setReady] = useState(false);
  const passes = useRef(0);

  const left = board.length ? board[0][0] : null;
  const right = board.length ? board[board.length - 1][1] : null;

  const restart = useCallback(() => {
    const all: Tile[] = [];
    for (let a = 0; a <= max; a++) for (let b = a; b <= max; b++) all.push([a, b]);
    const deck = shuffled(all);
    setHand(deck.slice(0, 7));
    setCpu(deck.slice(7, 14));
    setPool(deck.slice(14));
    setBoard([]); setTurn("me"); setSel(null); setMsg(null); setOver(null);
    passes.current = 0;
  }, [max]);

  useEffect(() => { setReady(true); restart(); }, [restart]);

  const fitsLeft = (t: Tile) => left === null || t[0] === left || t[1] === left;
  const fitsRight = (t: Tile) => right === null || t[0] === right || t[1] === right;
  const playable = (t: Tile) => fitsLeft(t) || fitsRight(t);

  const place = (t: Tile, side: "left" | "right") => {
    setBoard((b) => {
      if (b.length === 0) return [t];
      if (side === "left") {
        const end = b[0][0];
        const tile: Tile = t[1] === end ? t : [t[1], t[0]];
        return [tile, ...b];
      }
      const end = b[b.length - 1][1];
      const tile: Tile = t[0] === end ? t : [t[1], t[0]];
      return [...b, tile];
    });
  };

  const myPlay = (i: number, side?: "left" | "right") => {
    if (over || turn !== "me") return;
    const t = hand[i];
    const L = fitsLeft(t), R = fitsRight(t);
    if (!L && !R) { setMsg("ตัวนี้ต่อไม่ได้นะ ลองตัวอื่นดู"); setTimeout(() => setMsg(null), 1200); return; }
    if (L && R && board.length > 0 && !side) { setSel(i); setMsg("ต่อฝั่งไหนดี? แตะปุ่ม ซ้าย หรือ ขวา"); return; }
    place(t, side ?? (L ? "left" : "right"));
    const rest = hand.filter((_, j) => j !== i);
    setHand(rest); setSel(null); setMsg(null);
    passes.current = 0;
    if (rest.length === 0) { setOver("me"); return; }
    setTurn("cpu");
  };

  const draw = () => {
    if (over || turn !== "me") return;
    if (pool.length === 0) {
      passes.current += 1;
      setMsg("กองหมดแล้ว — ข้ามตาให้อีกฝ่าย");
      setTurn("cpu");
      return;
    }
    const [t, ...rest] = pool;
    setPool(rest); setHand((h) => [...h, t]);
    setMsg(`จั่วได้ ${t[0]}-${t[1]}`);
    setTimeout(() => setMsg(null), 1200);
  };

  /** ตาเครื่อง */
  useEffect(() => {
    if (!ready || over || turn !== "cpu") return;
    const t = setTimeout(() => {
      let myCpu = [...cpu], myPool = [...pool];
      const idx = myCpu.findIndex((x) => fitsLeft(x) || fitsRight(x));
      if (idx >= 0) {
        const tile = myCpu[idx];
        place(tile, fitsRight(tile) ? "right" : "left");
        myCpu = myCpu.filter((_, j) => j !== idx);
        setCpu(myCpu);
        passes.current = 0;
        if (myCpu.length === 0) { setOver("cpu"); return; }
      } else if (myPool.length > 0) {
        const [d, ...rest] = myPool;
        myCpu = [...myCpu, d]; myPool = rest;
        setCpu(myCpu); setPool(myPool);
      } else {
        passes.current += 1;
        if (passes.current >= 2) {
          const mine = hand.reduce((a, x) => a + x[0] + x[1], 0);
          const theirs = myCpu.reduce((a, x) => a + x[0] + x[1], 0);
          setOver(mine === theirs ? "draw" : mine < theirs ? "me" : "cpu");
          return;
        }
      }
      setTurn("me");
    }, 750);
    return () => clearTimeout(t);
  }, [turn, ready, over]); // eslint-disable-line react-hooks/exhaustive-deps

  const canPlayAny = hand.some(playable);

  return (
    <GameShell
      instruction={
        over === "me" ? "🎉 เก่งมาก! หนูหมดมือก่อน ชนะแล้ว"
          : over === "cpu" ? "เครื่องหมดมือก่อนรอบนี้ ลองใหม่นะ 💪"
          : over === "draw" ? "เสมอกันพอดี 🤝"
          : turn === "cpu" ? "เครื่องกำลังคิด…"
          : msg ?? (board.length === 0 ? "แตะโดมิโนของหนู 1 ตัวเพื่อเริ่มวางตัวแรก" : `ต่อเลขให้ตรงกับปลายแถว — ซ้าย ${left} · ขวา ${right}`)
      }
      done={!!over}
      onRestart={restart}
      stats={`มือหนู ${hand.length} · เครื่อง ${cpu.length} · ในกอง ${pool.length}`}
      mistakes={over === "cpu" ? 1 : 0}
      total={1}
      onDone={onDone}
    >
      {/* แถวที่ต่อไว้ */}
      <div className="mb-4 min-h-[4.5rem] overflow-x-auto rounded-2xl bg-mint-soft p-3">
        {board.length === 0 ? (
          <p className="text-center text-[14px] text-ink-soft">ยังไม่มีใครวาง — หนูเริ่มก่อนได้เลย</p>
        ) : (
          <div className="flex w-max items-center gap-1">
            {board.map((t, i) => <TileView key={`${t[0]}-${t[1]}-${i}`} t={t} size={30} />)}
          </div>
        )}
      </div>

      {/* ปุ่มเลือกฝั่ง เมื่อต่อได้ทั้งสองข้าง */}
      {sel !== null && (
        <div className="mb-3 flex items-center justify-center gap-2">
          <button type="button" onClick={() => myPlay(sel, "left")}
            className="tap rounded-full bg-purple-600 px-5 py-2 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700">
            ◀ ต่อฝั่งซ้าย ({left})
          </button>
          <button type="button" onClick={() => myPlay(sel, "right")}
            className="tap rounded-full bg-purple-600 px-5 py-2 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700">
            ต่อฝั่งขวา ({right}) ▶
          </button>
          <button type="button" onClick={() => { setSel(null); setMsg(null); }}
            className="tap rounded-full bg-cream-dark px-4 py-2 text-[14px] font-medium text-purple-700">ยกเลิก</button>
        </div>
      )}

      {/* มือของหนู */}
      <p className="mb-2 text-center text-[14px] text-ink-soft">🀄 โดมิโนของหนู — ตัวที่ต่อได้จะเรืองแสง</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {hand.map((t, i) => {
          const ok = playable(t);
          return (
            <button
              key={`${t[0]}-${t[1]}-${i}`}
              type="button"
              onClick={() => myPlay(i)}
              disabled={!!over || turn !== "me"}
              aria-label={`โดมิโน ${t[0]} กับ ${t[1]}${ok ? " ต่อได้" : ""}`}
              className={cn(
                "tap rounded-xl p-0.5 transition",
                sel === i ? "ring-4 ring-purple-500" : ok ? "ring-4 ring-[#7bd1a8]" : "opacity-50",
              )}
            >
              <TileView t={t} size={34} />
            </button>
          );
        })}
      </div>

      {!over && turn === "me" && !canPlayAny && (
        <div className="mt-4 text-center">
          <p className="text-[14px] text-ink-soft">ไม่มีตัวที่ต่อได้เลย — จั่วเพิ่มได้นะ</p>
          <button type="button" onClick={draw}
            className="tap mt-2 rounded-full bg-yellow-accent px-5 py-2.5 text-[15px] font-medium text-[#5a4600] shadow-soft hover:brightness-95">
            🫳 จั่วจากกอง ({pool.length})
          </button>
        </div>
      )}

      <p className="mt-4 text-center text-[13px] leading-relaxed text-ink-soft">
        ต่อเลขให้ตรงกับปลายแถว · ใครหมดมือก่อนชนะ · ต่อไม่ได้ให้จั่วจากกอง
        <br />⚡ เกมนี้มีโหมดเดียว ไม่ต้องเลือกระดับ
      </p>
    </GameShell>
  );
}
