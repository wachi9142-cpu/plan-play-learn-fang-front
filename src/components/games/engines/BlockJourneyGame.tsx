"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, Pause, Play, RotateCw } from "lucide-react";
import { GameShell, type GameOutcome } from "@/components/games/GameShell";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;

/** บล็อก 7 แบบ เขียนเป็นตารางของช่องที่มีสี */
const SHAPES: { cells: [number, number][]; color: string }[] = [
  { cells: [[0, 0], [1, 0], [2, 0], [3, 0]], color: "bg-[#38bdf8]" },  // I
  { cells: [[0, 0], [1, 0], [0, 1], [1, 1]], color: "bg-[#facc15]" },  // O
  { cells: [[1, 0], [0, 1], [1, 1], [2, 1]], color: "bg-[#c084fc]" },  // T
  { cells: [[1, 0], [2, 0], [0, 1], [1, 1]], color: "bg-[#4ade80]" },  // S
  { cells: [[0, 0], [1, 0], [1, 1], [2, 1]], color: "bg-[#f87171]" },  // Z
  { cells: [[0, 0], [0, 1], [1, 1], [2, 1]], color: "bg-[#60a5fa]" },  // J
  { cells: [[2, 0], [0, 1], [1, 1], [2, 1]], color: "bg-[#fb923c]" },  // L
];

interface Piece { cells: [number, number][]; color: string; x: number; y: number }

const rotate = (cells: [number, number][]): [number, number][] => {
  const maxY = Math.max(...cells.map(([, y]) => y));
  return cells.map(([x, y]) => [maxY - y, x] as [number, number]);
};

/** เล่นไปเรื่อย ๆ แล้วเร็วขึ้นเอง — ด่าน 1 ช้าสุด เพิ่มทุก ๆ 5 แถวที่เคลียร์ได้ */
const speedOf = (level: number) => Math.max(140, 800 - (level - 1) * 70);

/**
 * 🧱 Block Journey — เกมต่อบล็อก
 * ไม่มีระดับ ง่าย/ปานกลาง/ยาก ให้เลือก เพราะเกมจะเร็วขึ้นเองเมื่อเคลียร์แถวได้มากขึ้น
 */
export function BlockJourneyGame({ cols = 8, rows = 14, onDone }: { cols?: number; rows?: number; onDone?: Cb }) {
  const empty = useCallback(() => Array.from({ length: rows }, () => Array<string | null>(cols).fill(null)), [cols, rows]);
  const [grid, setGrid] = useState<(string | null)[][]>(empty);
  const [piece, setPiece] = useState<Piece | null>(null);
  const [lines, setLines] = useState(0);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const gridRef = useRef(grid);
  const pieceRef = useRef(piece);
  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { pieceRef.current = piece; }, [piece]);

  const level = Math.floor(lines / 5) + 1;

  const spawn = useCallback((): Piece => {
    const s = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const w = Math.max(...s.cells.map(([x]) => x)) + 1;
    return { cells: s.cells, color: s.color, x: Math.floor((cols - w) / 2), y: 0 };
  }, [cols]);

  const fits = useCallback((p: Piece, g: (string | null)[][]) =>
    p.cells.every(([cx, cy]) => {
      const x = p.x + cx, y = p.y + cy;
      return x >= 0 && x < cols && y < rows && (y < 0 || !g[y][x]);
    }), [cols, rows]);

  const restart = useCallback(() => {
    const g = empty();
    setGrid(g); gridRef.current = g;
    const p = spawn();
    setPiece(p); pieceRef.current = p;
    setLines(0); setScore(0); setOver(false); setPaused(false);
  }, [empty, spawn]);

  useEffect(() => { setReady(true); restart(); }, [restart]);

  /** วางบล็อกลงกระดาน แล้วเคลียร์แถวที่เต็ม */
  const land = useCallback((p: Piece) => {
    const g = gridRef.current.map((row) => [...row]);
    p.cells.forEach(([cx, cy]) => {
      const x = p.x + cx, y = p.y + cy;
      if (y >= 0 && y < rows && x >= 0 && x < cols) g[y][x] = p.color;
    });
    const keep = g.filter((row) => row.some((c) => !c));
    const cleared = rows - keep.length;
    const ng = [...Array.from({ length: cleared }, () => Array<string | null>(cols).fill(null)), ...keep];
    setGrid(ng); gridRef.current = ng;
    if (cleared > 0) {
      setLines((n) => n + cleared);
      setScore((s) => s + [0, 10, 30, 60, 100][cleared]);
    }
    const next = spawn();
    if (!fits(next, ng)) { setOver(true); setPiece(null); pieceRef.current = null; return; }
    setPiece(next); pieceRef.current = next;
  }, [cols, rows, spawn, fits]);

  const move = useCallback((dx: number, dy: number) => {
    const p = pieceRef.current;
    if (!p || over || paused) return false;
    const np = { ...p, x: p.x + dx, y: p.y + dy };
    if (fits(np, gridRef.current)) { setPiece(np); pieceRef.current = np; return true; }
    if (dy > 0) land(p);
    return false;
  }, [over, paused, fits, land]);

  const turn = () => {
    const p = pieceRef.current;
    if (!p || over || paused) return;
    for (const dx of [0, -1, 1, -2, 2]) {
      const np = { ...p, cells: rotate(p.cells), x: p.x + dx };
      if (fits(np, gridRef.current)) { setPiece(np); pieceRef.current = np; return; }
    }
  };

  const drop = () => { let n = 0; while (move(0, 1) && n < rows) n++; setScore((s) => s + n); };

  /** นาฬิกาของเกม — เร็วขึ้นเองตามด่าน */
  useEffect(() => {
    if (!ready || over || paused) return;
    const t = setInterval(() => move(0, 1), speedOf(level));
    return () => clearInterval(t);
  }, [ready, over, paused, level, move]);

  /** ปุ่มลูกศรบนคอม */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (over) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); move(-1, 0); }
      else if (e.key === "ArrowRight") { e.preventDefault(); move(1, 0); }
      else if (e.key === "ArrowDown") { e.preventDefault(); move(0, 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); turn(); }
      else if (e.key === " ") { e.preventDefault(); drop(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }); // ผูกใหม่ทุกเรนเดอร์ เพื่อให้อ่านสถานะล่าสุดเสมอ

  /** กระดานที่เห็นจริง = กระดาน + บล็อกที่กำลังตก */
  const view = grid.map((row) => [...row]);
  if (piece) {
    piece.cells.forEach(([cx, cy]) => {
      const x = piece.x + cx, y = piece.y + cy;
      if (y >= 0 && y < rows && x >= 0 && x < cols) view[y][x] = piece.color;
    });
  }

  return (
    <GameShell
      instruction={over ? `🎉 จบเกม! เคลียร์ได้ ${lines} แถว · ${score} คะแนน` : `🧱 ต่อบล็อกให้เต็มแถว — ด่าน ${level} ${paused ? "(หยุดชั่วคราว)" : ""}`}
      done={over}
      onRestart={restart}
      stats={`ด่าน ${level} · ${lines} แถว · ${score} คะแนน`}
      mistakes={0}
      total={1}
      onDone={onDone}
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center sm:gap-8">
        {/* กระดาน */}
        <div
          className="grid gap-[2px] rounded-2xl bg-[#1b1430] p-1.5 shadow-lift"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, width: "min(70vw, 260px)" }}
        >
          {view.flatMap((row, y) =>
            row.map((cell, x) => (
              <span
                key={`${x}-${y}`}
                className={cn(
                  "aspect-square rounded-[3px]",
                  cell ? `${cell} shadow-[inset_0_-2px_0_rgba(0,0,0,0.25)]` : "bg-white/5",
                )}
              />
            )),
          )}
        </div>

        {/* ตัวเลขและปุ่มควบคุม */}
        <div className="w-full max-w-[18rem]">
          <dl className="mb-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-cream-dark px-2 py-2">
              <dt className="text-[12px] text-ink-soft">ด่าน</dt>
              <dd className="font-display text-xl text-purple-800">{level}</dd>
            </div>
            <div className="rounded-2xl bg-cream-dark px-2 py-2">
              <dt className="text-[12px] text-ink-soft">แถว</dt>
              <dd className="font-display text-xl text-purple-800">{lines}</dd>
            </div>
            <div className="rounded-2xl bg-cream-dark px-2 py-2">
              <dt className="text-[12px] text-ink-soft">คะแนน</dt>
              <dd className="font-display text-xl text-purple-800">{score}</dd>
            </div>
          </dl>

          <div className="grid grid-cols-3 gap-2">
            <Ctrl onClick={() => move(-1, 0)} label="ซ้าย"><ArrowLeft size={22} /></Ctrl>
            <Ctrl onClick={turn} label="หมุน"><RotateCw size={22} /></Ctrl>
            <Ctrl onClick={() => move(1, 0)} label="ขวา"><ArrowRight size={22} /></Ctrl>
            <Ctrl onClick={() => move(0, 1)} label="ลงทีละช่อง"><ArrowDown size={22} /></Ctrl>
            <Ctrl onClick={drop} label="ปล่อยลงเลย"><span className="text-[15px] font-medium">ปล่อย</span></Ctrl>
            <Ctrl onClick={() => setPaused((p) => !p)} label={paused ? "เล่นต่อ" : "หยุดพัก"}>
              {paused ? <Play size={22} /> : <Pause size={22} />}
            </Ctrl>
          </div>

          <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
            🔼 หมุนบล็อก · ◀️ ▶️ เลื่อนซ้ายขวา · 🔽 ลงเร็วขึ้น · ต่อให้เต็มแถวแล้วแถวนั้นจะหายไป
            <br />
            ⚡ <b>ไม่ต้องเลือกระดับ</b> — เคลียร์ได้ทุก 5 แถว เกมจะเร็วขึ้นเอง
            <br />
            💻 บนคอมใช้ปุ่มลูกศรและเคาะ Space เพื่อปล่อยบล็อกได้
          </p>
        </div>
      </div>
    </GameShell>
  );
}

function Ctrl({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="tap grid h-14 place-items-center rounded-2xl border-4 border-purple-200 bg-white text-purple-700 shadow-soft transition active:scale-95 hover:bg-purple-50"
    >
      {children}
    </button>
  );
}
