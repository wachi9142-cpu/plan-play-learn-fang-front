"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GameShell, type GameOutcome } from "@/components/games/GameShell";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;
export type Opponent = "cpu-easy" | "cpu-hard" | "friend";

const OPPONENTS: { id: Opponent; emoji: string; label: string }[] = [
  { id: "cpu-easy", emoji: "👤", label: "เล่นคนเดียว · เครื่องง่าย" },
  { id: "cpu-hard", emoji: "👤", label: "เล่นคนเดียว · เครื่องเก่ง" },
  { id: "friend", emoji: "👬", label: "เล่น 2 คน" },
];

/** แถบเลือกคู่แข่ง — ใช้ร่วมกันทุกเกมกระดาน */
function OpponentPicker({ value, onChange }: { value: Opponent; onChange: (v: Opponent) => void }) {
  return (
    <div className="mb-3">
      <p className="mb-1.5 text-center text-[13px] text-ink-soft">👥 เลือกโหมดการเล่น</p>
      <div className="flex flex-wrap justify-center gap-2">
      {OPPONENTS.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          className={cn(
            "tap rounded-full px-4 py-2 text-[14px] font-medium transition",
            value === o.id ? "bg-purple-600 text-white! shadow-soft" : "bg-cream-dark text-purple-700 hover:brightness-95",
          )}
        >
          {o.emoji} {o.label}
        </button>
      ))}
      </div>
    </div>
  );
}

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

/* ══════════════════ ⭕ โอเอ็กซ์ (Tic-Tac-Toe) ══════════════════ */

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

type Mark = "x" | "o" | null;

const winnerOf = (b: Mark[]): { mark: Mark; line: number[] } | null => {
  for (const l of LINES) {
    const [a, c, d] = l;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { mark: b[a], line: l };
  }
  return null;
};

/** เครื่องเดินตาไหน — เก่ง = ชนะถ้าชนะได้ / บล็อกถ้าจะแพ้ / ชิงกลาง */
function cpuMoveTTT(b: Mark[], me: Mark, hard: boolean): number {
  const empty = b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  if (!hard) return pick(empty);
  const other: Mark = me === "x" ? "o" : "x";
  for (const m of [me, other]) {
    for (const i of empty) {
      const t = [...b]; t[i] = m;
      if (winnerOf(t)?.mark === m) return i;
    }
  }
  if (b[4] === null) return 4;
  const corners = [0, 2, 6, 8].filter((i) => b[i] === null);
  return corners.length ? pick(corners) : pick(empty);
}

export function TicTacToeGame({ marks, timeLimit, onDone }: { marks?: [string, string]; timeLimit?: number; onDone?: Cb }) {
  const [A, B] = marks ?? ["❌", "⭕"];
  const [opp, setOpp] = useState<Opponent>("cpu-easy");
  const [board, setBoard] = useState<Mark[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<"x" | "o">("x");
  const [losses, setLosses] = useState(0);
  /** รอบนี้หนูเล่นเป็นอะไร — สุ่มใหม่ทุกรอบ ❌ หรือ ⭕ (X เดินก่อนเสมอตามกติกา) */
  const [myMark, setMyMark] = useState<"x" | "o">("x");

  const cpuMark: "x" | "o" = myMark === "x" ? "o" : "x";
  const mySymbol = myMark === "x" ? A : B;
  const cpuSymbol = myMark === "x" ? B : A;

  const win = winnerOf(board);
  const full = board.every(Boolean);
  const done = !!win || full;
  const vsCpu = opp !== "friend";

  const restart = useCallback(() => {
    setBoard(Array(9).fill(null));
    setTurn("x");
    setMyMark(Math.random() < 0.5 ? "x" : "o");
  }, []);
  useEffect(() => { restart(); }, [opp, restart]);

  // เครื่องเดินเมื่อถึงตาของมัน (ถ้าหนูได้ ⭕ เครื่องจะเป็น ❌ และเดินก่อน)
  useEffect(() => {
    if (!vsCpu || turn !== cpuMark || done) return;
    const t = setTimeout(() => {
      setBoard((b) => {
        if (winnerOf(b) || b.every(Boolean)) return b;
        const i = cpuMoveTTT(b, cpuMark, opp === "cpu-hard");
        const n = [...b]; n[i] = cpuMark;
        return n;
      });
      setTurn(myMark);
    }, 550);
    return () => clearTimeout(t);
  }, [turn, vsCpu, opp, done, cpuMark, myMark]);

  useEffect(() => { if (win?.mark === cpuMark && vsCpu) setLosses((n) => n + 1); }, [win, vsCpu, cpuMark]);

  const play = (i: number) => {
    if (board[i] || done) return;
    if (vsCpu && turn !== myMark) return;
    const n = [...board]; n[i] = turn;
    setBoard(n);
    setTurn(turn === "x" ? "o" : "x");
  };

  const msg = win
    ? vsCpu
      ? win.mark === myMark ? "🎉 เก่งมาก! หนูชนะแล้ว" : "เครื่องชนะรอบนี้ ลองใหม่อีกครั้งนะ 💪"
      : `🎉 ผู้เล่น ${win.mark === "x" ? A : B} ชนะ!`
    : full ? "เสมอกันพอดี 🤝 ลองใหม่อีกรอบ"
    : vsCpu ? (turn === myMark ? `ตาหนูแล้ว — แตะช่องว่างเพื่อวาง ${mySymbol}` : "เครื่องกำลังคิด…")
    : `ตาของ ${turn === "x" ? A : B}`;

  return (
    <GameShell
      instruction={msg}
      done={done}
      onRestart={restart}
      stats={vsCpu ? `รอบนี้หนูเป็น ${mySymbol} · แพ้ไป ${losses} ครั้ง` : undefined}
      mistakes={win?.mark === cpuMark ? 1 : 0}
      total={1}
      timeLimit={timeLimit}
      onDone={onDone}
    >
      <OpponentPicker value={opp} onChange={setOpp} />

      {/* รอบนี้ใครเป็นอะไร — สุ่มใหม่ทุกรอบ */}
      {vsCpu && (
        <p className="mb-3 text-center text-[15px] text-ink-soft">
          รอบนี้หนูเป็น <b className="text-[22px] align-middle text-purple-700">{mySymbol}</b>
          {"  "}· เครื่องเป็น <b className="text-[22px] align-middle text-ink-soft">{cpuSymbol}</b>
          {myMark === "o" && <span className="block text-[13px]">({A} เดินก่อนเสมอ เครื่องจึงเริ่มก่อนรอบนี้)</span>}
        </p>
      )}

      <div className="mx-auto grid w-full max-w-[22rem] grid-cols-3 gap-2">
        {board.map((v, i) => (
          <button
            key={i}
            type="button"
            onClick={() => play(i)}
            disabled={!!v || done}
            aria-label={v ? `ช่องที่ ${i + 1} มี ${v === "x" ? A : B}` : `ช่องว่างที่ ${i + 1}`}
            className={cn(
              "tap grid aspect-square place-items-center rounded-2xl border-2 text-[clamp(2.2rem,12vw,3.4rem)] leading-none transition",
              win?.line.includes(i) ? "border-mint-soft! bg-mint-soft" : "border-line bg-cream hover:brightness-95",
              !v && !done && "active:scale-95",
            )}
          >
            {v === "x" ? A : v === "o" ? B : ""}
          </button>
        ))}
      </div>
    </GameShell>
  );
}

/* ══════════════════ 🔴 เรียงสี่ (Connect Four) ══════════════════ */

const C4_COLS = 7, C4_ROWS = 6;
type Disc = 1 | 2 | 0;

const c4Drop = (g: Disc[][], col: number, p: Disc): Disc[][] | null => {
  for (let r = C4_ROWS - 1; r >= 0; r--) {
    if (g[r][col] === 0) { const n = g.map((x) => [...x]); n[r][col] = p; return n; }
  }
  return null;
};

function c4Win(g: Disc[][], p: Disc): [number, number][] | null {
  const dirs: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < C4_ROWS; r++) for (let c = 0; c < C4_COLS; c++) {
    if (g[r][c] !== p) continue;
    for (const [dr, dc] of dirs) {
      const cells: [number, number][] = [[r, c]];
      for (let k = 1; k < 4; k++) {
        const nr = r + dr * k, nc = c + dc * k;
        if (nr < 0 || nr >= C4_ROWS || nc < 0 || nc >= C4_COLS || g[nr][nc] !== p) break;
        cells.push([nr, nc]);
      }
      if (cells.length === 4) return cells;
    }
  }
  return null;
}

const c4Open = (g: Disc[][]) => Array.from({ length: C4_COLS }, (_, c) => c).filter((c) => g[0][c] === 0);

function c4Cpu(g: Disc[][], hard: boolean): number {
  const open = c4Open(g);
  if (!hard) return pick(open);
  for (const p of [2, 1] as Disc[]) {
    for (const c of open) {
      const n = c4Drop(g, c, p);
      if (n && c4Win(n, p)) return c;
    }
  }
  const mid = open.filter((c) => c >= 2 && c <= 4);
  return mid.length ? pick(mid) : pick(open);
}

export function ConnectFourGame({ timeLimit, onDone }: { timeLimit?: number; onDone?: Cb }) {
  const empty = useMemo(() => Array.from({ length: C4_ROWS }, () => Array<Disc>(C4_COLS).fill(0)), []);
  const [opp, setOpp] = useState<Opponent>("cpu-easy");
  const [grid, setGrid] = useState<Disc[][]>(empty);
  const [turn, setTurn] = useState<Disc>(1);

  const w1 = c4Win(grid, 1), w2 = c4Win(grid, 2);
  const line = w1 ?? w2;
  const full = c4Open(grid).length === 0;
  const done = !!line || full;
  const vsCpu = opp !== "friend";

  const restart = useCallback(() => { setGrid(empty.map((r) => [...r])); setTurn(1); }, [empty]);
  useEffect(() => { restart(); }, [opp, restart]);

  useEffect(() => {
    if (!vsCpu || turn !== 2 || done) return;
    const t = setTimeout(() => {
      setGrid((g) => {
        if (c4Win(g, 1) || c4Win(g, 2) || c4Open(g).length === 0) return g;
        return c4Drop(g, c4Cpu(g, opp === "cpu-hard"), 2) ?? g;
      });
      setTurn(1);
    }, 600);
    return () => clearTimeout(t);
  }, [turn, vsCpu, opp, done]);

  const drop = (c: number) => {
    if (done || (vsCpu && turn !== 1)) return;
    const n = c4Drop(grid, c, turn);
    if (!n) return;
    setGrid(n);
    setTurn(turn === 1 ? 2 : 1);
  };

  const inLine = (r: number, c: number) => !!line?.some(([a, b]) => a === r && b === c);
  const msg = w1 ? (vsCpu ? "🎉 เก่งมาก! เรียงได้ 4 เม็ดแล้ว" : "🎉 ผู้เล่นสีแดงชนะ!")
    : w2 ? (vsCpu ? "เครื่องเรียงได้ 4 ก่อน ลองใหม่นะ 💪" : "🎉 ผู้เล่นสีเหลืองชนะ!")
    : full ? "กระดานเต็มพอดี เสมอกัน 🤝"
    : vsCpu ? (turn === 1 ? "แตะช่องด้านบนเพื่อหย่อนเม็ดสีแดง" : "เครื่องกำลังคิด…")
    : `ตาของ ${turn === 1 ? "🔴 สีแดง" : "🟡 สีเหลือง"}`;

  return (
    <GameShell instruction={msg} done={done} onRestart={restart} mistakes={w2 ? 1 : 0} total={1} timeLimit={timeLimit} onDone={onDone}>
      <OpponentPicker value={opp} onChange={setOpp} />
      <div className="mx-auto w-full max-w-[30rem] rounded-3xl bg-sky-soft p-2">
        <div className="grid grid-cols-7 gap-1.5">
          {grid.flatMap((row, r) =>
            row.map((v, c) => (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => drop(c)}
                disabled={done}
                aria-label={`หลักที่ ${c + 1} แถวที่ ${r + 1}`}
                className={cn(
                  "tap grid aspect-square place-items-center rounded-full border-2 border-white/70 text-[clamp(1.1rem,5vw,1.8rem)] transition",
                  v === 0 ? "bg-white/80 hover:bg-white" : v === 1 ? "bg-pink-accent" : "bg-yellow-accent",
                  inLine(r, c) && "ring-4 ring-purple-400",
                )}
              >
                {v === 1 ? "🔴" : v === 2 ? "🟡" : ""}
              </button>
            )),
          )}
        </div>
      </div>
    </GameShell>
  );
}

/* ══════════════════ ⚫ หมากฮอสจิ๋ว 6×6 ══════════════════ */

const CK = 6;
type Piece = 0 | 1 | 2;           // 0 ว่าง · 1 เด็ก (ล่าง) · 2 เครื่อง (บน)
type Sq = { p: Piece; king: boolean };

const ckInit = (): Sq[][] =>
  Array.from({ length: CK }, (_, r) =>
    Array.from({ length: CK }, (_, c) => {
      const dark = (r + c) % 2 === 1;
      const p: Piece = dark && r < 2 ? 2 : dark && r > 3 ? 1 : 0;
      return { p, king: false };
    }),
  );

interface Move { from: [number, number]; to: [number, number]; jumped?: [number, number] }

function ckMoves(g: Sq[][], p: Piece): Move[] {
  const jumps: Move[] = [], steps: Move[] = [];
  const fwd = p === 1 ? -1 : 1;
  for (let r = 0; r < CK; r++) for (let c = 0; c < CK; c++) {
    const s = g[r][c];
    if (s.p !== p) continue;
    const dirs = s.king ? [-1, 1] : [fwd];
    for (const dr of dirs) for (const dc of [-1, 1]) {
      const r1 = r + dr, c1 = c + dc;
      if (r1 < 0 || r1 >= CK || c1 < 0 || c1 >= CK) continue;
      if (g[r1][c1].p === 0) { steps.push({ from: [r, c], to: [r1, c1] }); continue; }
      if (g[r1][c1].p === p) continue;
      const r2 = r + dr * 2, c2 = c + dc * 2;
      if (r2 < 0 || r2 >= CK || c2 < 0 || c2 >= CK) continue;
      if (g[r2][c2].p === 0) jumps.push({ from: [r, c], to: [r2, c2], jumped: [r1, c1] });
    }
  }
  return jumps.length ? jumps : steps;   // กินได้ต้องกิน (กติกามาตรฐาน)
}

function ckApply(g: Sq[][], m: Move): Sq[][] {
  const n = g.map((row) => row.map((s) => ({ ...s })));
  const [fr, fc] = m.from, [tr, tc] = m.to;
  n[tr][tc] = { ...n[fr][fc] };
  n[fr][fc] = { p: 0, king: false };
  if (m.jumped) n[m.jumped[0]][m.jumped[1]] = { p: 0, king: false };
  if (n[tr][tc].p === 1 && tr === 0) n[tr][tc].king = true;
  if (n[tr][tc].p === 2 && tr === CK - 1) n[tr][tc].king = true;
  return n;
}

const ckCount = (g: Sq[][], p: Piece) => g.flat().filter((s) => s.p === p).length;

export function CheckersGame({ timeLimit, onDone }: { timeLimit?: number; onDone?: Cb }) {
  const [opp, setOpp] = useState<Opponent>("cpu-easy");
  const [grid, setGrid] = useState<Sq[][]>(ckInit);
  const [turn, setTurn] = useState<Piece>(1);
  const [sel, setSel] = useState<[number, number] | null>(null);

  const vsCpu = opp !== "friend";
  const my = ckCount(grid, 1), theirs = ckCount(grid, 2);
  const moves = useMemo(() => ckMoves(grid, turn), [grid, turn]);
  const stuck = moves.length === 0;
  const done = my === 0 || theirs === 0 || stuck;

  const restart = useCallback(() => { setGrid(ckInit()); setTurn(1); setSel(null); }, []);
  useEffect(() => { restart(); }, [opp, restart]);

  useEffect(() => {
    if (!vsCpu || turn !== 2 || done) return;
    const t = setTimeout(() => {
      setGrid((g) => {
        const ms = ckMoves(g, 2);
        if (!ms.length) return g;
        const hard = opp === "cpu-hard";
        const best = hard ? (ms.filter((m) => m.jumped)[0] ?? pick(ms)) : pick(ms);
        return ckApply(g, best);
      });
      setTurn(1);
    }, 650);
    return () => clearTimeout(t);
  }, [turn, vsCpu, opp, done]);

  const legalFrom = (r: number, c: number) => moves.some((m) => m.from[0] === r && m.from[1] === c);
  const legalTo = (r: number, c: number) =>
    sel ? moves.find((m) => m.from[0] === sel[0] && m.from[1] === sel[1] && m.to[0] === r && m.to[1] === c) : undefined;

  const tap = (r: number, c: number) => {
    if (done || (vsCpu && turn !== 1)) return;
    const m = legalTo(r, c);
    if (m) {
      setGrid(ckApply(grid, m));
      setSel(null);
      setTurn(turn === 1 ? 2 : 1);
      return;
    }
    if (legalFrom(r, c)) setSel([r, c]);
    else setSel(null);
  };

  const msg = theirs === 0 ? "🎉 เก่งมาก! กินหมากอีกฝ่ายหมดแล้ว"
    : my === 0 ? "หมากหมดแล้ว ลองใหม่อีกรอบนะ 💪"
    : stuck ? `เดินต่อไม่ได้แล้ว — ${turn === 1 ? "อีกฝ่าย" : "หนู"}ชนะ!`
    : vsCpu ? (turn === 1 ? (sel ? "แตะช่องเรืองแสงเพื่อเดิน" : "แตะหมากของหนู (วงสีม่วง) ก่อน") : "เครื่องกำลังคิด…")
    : `ตาของ ${turn === 1 ? "🟣 สีม่วง" : "🟠 สีส้ม"}`;

  return (
    <GameShell
      instruction={msg}
      done={done}
      onRestart={restart}
      stats={`หมากหนู ${my} · อีกฝ่าย ${theirs}`}
      mistakes={my === 0 ? 1 : 0}
      total={1}
      timeLimit={timeLimit}
      onDone={onDone}
    >
      <OpponentPicker value={opp} onChange={setOpp} />
      <div className="mx-auto w-full max-w-[26rem] overflow-hidden rounded-2xl border-4 border-purple-200">
        <div className="grid grid-cols-6">
          {grid.flatMap((row, r) =>
            row.map((s, c) => {
              const dark = (r + c) % 2 === 1;
              const canGo = !!legalTo(r, c);
              const isSel = sel?.[0] === r && sel?.[1] === c;
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => tap(r, c)}
                  disabled={done}
                  aria-label={`แถว ${r + 1} ช่อง ${c + 1}`}
                  className={cn(
                    "grid aspect-square place-items-center text-[clamp(1.2rem,6vw,2rem)] leading-none transition",
                    dark ? "bg-purple-100" : "bg-cream",
                    canGo && "bg-mint-soft! ring-2 ring-inset ring-green-400",
                    isSel && "ring-4 ring-inset ring-purple-500",
                  )}
                >
                  {s.p === 1 ? (s.king ? "👑" : "🟣") : s.p === 2 ? (s.king ? "🤴" : "🟠") : canGo ? "·" : ""}
                </button>
              );
            }),
          )}
        </div>
      </div>
      <p className="mt-2 text-center text-[13px] text-ink-soft">
        เดินทแยงไปข้างหน้าทีละช่อง · กระโดดข้ามหมากอีกฝ่ายเพื่อกิน · ถ้ากินได้ต้องกิน · ไปถึงแถวสุดท้ายได้เป็น 👑 เดินถอยหลังได้
      </p>
    </GameShell>
  );
}

/* ══════════════════ 🗼 หอคอยฮานอย ══════════════════ */

export function HanoiGame({ discs = 3, timeLimit, onDone }: { discs?: number; timeLimit?: number; onDone?: Cb }) {
  const COLORS = ["bg-pink-accent", "bg-yellow-accent", "bg-[#7bd1a8]", "bg-[#8fc4ef]", "bg-purple-300"];
  const NAMES = ["ชมพู", "เหลือง", "เขียว", "ฟ้า", "ม่วง"];
  const init = useCallback(() => [Array.from({ length: discs }, (_, i) => discs - i), [], []] as number[][], [discs]);
  const [towers, setTowers] = useState<number[][]>(init);
  const [from, setFrom] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [bad, setBad] = useState(0);
  const [shake, setShake] = useState<number | null>(null);

  const restart = useCallback(() => { setTowers(init()); setFrom(null); setMoves(0); setBad(0); setShake(null); }, [init]);
  useEffect(() => { restart(); }, [discs, restart]);

  const best = Math.pow(2, discs) - 1;
  const done = towers[2].length === discs;

  /** จานที่กำลังถืออยู่ (ยกลอยขึ้นมาจากหอ) */
  const held = from === null ? null : towers[from][towers[from].length - 1] ?? null;

  /** วางลงหอนี้ได้ไหม */
  const canDrop = (i: number) => {
    if (held === null || from === null || i === from) return false;
    const top = towers[i][towers[i].length - 1];
    return top === undefined || top > held;
  };

  const tap = (i: number) => {
    if (done) return;
    if (from === null) { if (towers[i].length) setFrom(i); return; }
    if (from === i) { setFrom(null); return; }
    if (!canDrop(i)) {
      setBad((n) => n + 1);
      setShake(i);
      setTimeout(() => setShake(null), 500);
      return;
    }
    const n = towers.map((t) => [...t]);
    n[i].push(n[from].pop()!);
    setTowers(n); setFrom(null); setMoves((m) => m + 1);
  };

  const discWidth = (d: number) => `${34 + (d / discs) * 58}%`;

  return (
    <GameShell
      instruction={
        done ? `🎉 สำเร็จ! ย้ายครบใน ${moves} ครั้ง (น้อยที่สุดคือ ${best} ครั้ง)`
          : held === null ? "แตะหอที่จะหยิบจานบนสุด"
          : `✋ กำลังถือจาน${NAMES[(held - 1) % NAMES.length]}อยู่ — แตะหอที่เรืองแสงเพื่อวาง`
      }
      done={done}
      onRestart={restart}
      stats={`ย้ายแล้ว ${moves} ครั้ง · น้อยที่สุด ${best}`}
      mistakes={bad}
      total={best}
      timeLimit={timeLimit}
      onDone={onDone}
    >
      <div className="mx-auto grid w-full max-w-[34rem] grid-cols-3 gap-2">
        {towers.map((t, i) => {
          const picked = from === i;
          const visible = picked ? t.slice(0, -1) : t;      // จานบนสุดถูกยกขึ้นไปลอยอยู่
          const ok = canDrop(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => tap(i)}
              aria-label={`หอที่ ${i + 1} มี ${t.length} จาน${ok ? " (วางได้)" : ""}`}
              className={cn(
                "tap relative flex h-52 flex-col-reverse items-center justify-start gap-1 rounded-2xl border-2 p-2 pt-12 transition sm:h-64",
                ok ? "border-[#3fae7a]! bg-mint-soft ring-4 ring-[#7bd1a8]"
                  : picked ? "border-purple-500! bg-purple-50 ring-4 ring-purple-300"
                  : "border-line bg-cream hover:brightness-95",
                shake === i && "border-pink-accent! bg-pink-soft",
              )}
            >
              {/* ฐานและเสา */}
              <span className="absolute inset-x-0 bottom-1 mx-auto h-1.5 w-[86%] rounded-full bg-purple-200" aria-hidden />
              <span className="absolute bottom-1 h-[62%] w-2 rounded-full bg-purple-200" aria-hidden />

              {/* จานที่อยู่ในหอ */}
              {visible.map((d) => (
                <span
                  key={d}
                  className={cn("relative z-10 h-6 rounded-full shadow-soft sm:h-7", COLORS[(d - 1) % COLORS.length])}
                  style={{ width: discWidth(d) }}
                />
              ))}

              {/* ✋ จานที่ถืออยู่ — ลอยเหนือหอให้เห็นชัดว่าหยิบติดมือแล้ว */}
              {picked && held !== null && (
                <span className="pointer-events-none absolute inset-x-2 top-2 z-20 flex flex-col items-center gap-1">
                  <span
                    className={cn("hanoi-lift h-6 rounded-full shadow-lift ring-2 ring-white sm:h-7", COLORS[(held - 1) % COLORS.length])}
                    style={{ width: discWidth(held) }}
                  />
                  <span className="text-[12px] font-medium text-purple-700">✋ ถืออยู่</span>
                </span>
              )}

              {ok && <span className="absolute inset-x-0 top-3 z-20 text-center text-[13px] font-medium text-[#1f6b4d]">⬇️ วางตรงนี้ได้</span>}
              {shake === i && <span className="absolute inset-x-0 top-3 z-20 text-center text-[13px] font-medium text-[#a8456c]">วางไม่ได้นะ</span>}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-center text-[13px] text-ink-soft">
        ย้ายจานทั้งหมดไปหอขวาสุด · หยิบได้ทีละจาน · ห้ามวางจานใหญ่ทับจานเล็ก · แตะหอเดิมซ้ำเพื่อวางคืน
      </p>
    </GameShell>
  );
}
