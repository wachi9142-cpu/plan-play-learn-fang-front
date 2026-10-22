/**
 * ♟️ กติกาหมากฮอสไทย — ส่วนคิดกติกาล้วน ๆ แยกจากหน้าจอ
 *
 * กติกาที่ใช้
 *  • หมากธรรมดา เดินทแยงไปข้างหน้า 1 ช่อง · กินโดยกระโดดข้ามไปข้างหน้า
 *  • ฮอส เดินทแยงได้ทุกทิศและไกลหลายช่อง · กินได้จากระยะไกล แต่ต้องลงช่องถัดจากตัวที่กินทันที
 *  • กินแล้วถ้ายังกินต่อได้ ต้องกินต่อจนสุด
 *  • ถึงแถวสุดท้ายของอีกฝ่ายแล้วเป็นฮอส และจบตาทันที
 */

import type { CheckerPiece, Side } from "@/data/thai-checkers";

export type Board = (CheckerPiece | null)[];

export interface Step {
  from: number;
  to: number;
  /** ช่องของหมากที่ถูกกินในก้าวนี้ (ถ้ามี) */
  captured: number | null;
}

/** การเดิน 1 ตา — อาจมีหลายก้าวถ้ากินต่อเนื่อง */
export interface Move {
  from: number;
  to: number;
  steps: Step[];
  captures: number[];
  promote: boolean;
}

export const idx = (n: number, r: number, c: number) => r * n + c;
export const rc = (n: number, i: number) => ({ r: Math.floor(i / n), c: i % n });
export const isDark = (n: number, i: number) => { const { r, c } = rc(n, i); return (r + c) % 2 === 1; };
const inside = (n: number, r: number, c: number) => r >= 0 && r < n && c >= 0 && c < n;

/** ตั้งกระดานเริ่มต้น */
export function initBoard(n: number, rows: number): Board {
  const b: Board = Array(n * n).fill(null);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < n; c++) {
      if ((r + c) % 2 === 1) b[idx(n, r, c)] = { side: "b", king: false };
    }
  }
  for (let r = n - rows; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if ((r + c) % 2 === 1) b[idx(n, r, c)] = { side: "a", king: false };
    }
  }
  return b;
}

/** อ่านกระดานจากข้อความของโจทย์ เช่น "4,1,a,0|3,2,b,0" */
export function boardFromPieces(n: number, pieces: string): Board {
  const b: Board = Array(n * n).fill(null);
  for (const part of pieces.split("|")) {
    const [r, c, side, king] = part.split(",");
    b[idx(n, Number(r), Number(c))] = { side: side as Side, king: king === "1" };
  }
  return b;
}

const DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const;
const forwardDirs = (side: Side) => (side === "a" ? ([[-1, -1], [-1, 1]] as const) : ([[1, -1], [1, 1]] as const));

/** แถวสุดท้ายที่ทำให้เป็นฮอส */
const promoteRow = (n: number, side: Side) => (side === "a" ? 0 : n - 1);

/** ก้าวกินที่เป็นไปได้จากช่องหนึ่ง (ก้าวเดียว ยังไม่รวมกินต่อเนื่อง) */
function captureSteps(n: number, b: Board, from: number, piece: CheckerPiece): Step[] {
  const { r, c } = rc(n, from);
  const out: Step[] = [];
  const dirs = piece.king ? DIRS : forwardDirs(piece.side);

  for (const [dr, dc] of dirs) {
    if (piece.king) {
      /* ฮอส — ไถลไปตามแนวทแยงจนเจอหมาก ถ้าเป็นของอีกฝ่ายและช่องถัดไปว่าง ให้ลงช่องนั้น */
      let rr = r + dr, cc = c + dc;
      while (inside(n, rr, cc) && !b[idx(n, rr, cc)]) { rr += dr; cc += dc; }
      if (!inside(n, rr, cc)) continue;
      const victim = b[idx(n, rr, cc)]!;
      if (victim.side === piece.side) continue;
      const lr = rr + dr, lc = cc + dc;
      if (!inside(n, lr, lc) || b[idx(n, lr, lc)]) continue;
      out.push({ from, to: idx(n, lr, lc), captured: idx(n, rr, cc) });
    } else {
      const mr = r + dr, mc = c + dc;
      const lr = r + dr * 2, lc = c + dc * 2;
      if (!inside(n, lr, lc)) continue;
      const victim = b[idx(n, mr, mc)];
      if (!victim || victim.side === piece.side) continue;
      if (b[idx(n, lr, lc)]) continue;
      out.push({ from, to: idx(n, lr, lc), captured: idx(n, mr, mc) });
    }
  }
  return out;
}

/** ก้าวเดินธรรมดา (ไม่กิน) */
function quietSteps(n: number, b: Board, from: number, piece: CheckerPiece): Step[] {
  const { r, c } = rc(n, from);
  const out: Step[] = [];
  const dirs = piece.king ? DIRS : forwardDirs(piece.side);
  for (const [dr, dc] of dirs) {
    if (piece.king) {
      let rr = r + dr, cc = c + dc;
      while (inside(n, rr, cc) && !b[idx(n, rr, cc)]) {
        out.push({ from, to: idx(n, rr, cc), captured: null });
        rr += dr; cc += dc;
      }
    } else {
      const rr = r + dr, cc = c + dc;
      if (inside(n, rr, cc) && !b[idx(n, rr, cc)]) out.push({ from, to: idx(n, rr, cc), captured: null });
    }
  }
  return out;
}

/** ไล่หาทุกทางกินต่อเนื่องของหมากตัวหนึ่ง */
function captureChains(n: number, b: Board, from: number, piece: CheckerPiece, acc: Step[], out: Move[]) {
  const steps = captureSteps(n, b, from, piece);
  if (steps.length === 0) {
    if (acc.length > 0) {
      const last = acc[acc.length - 1];
      const { r } = rc(n, last.to);
      out.push({
        from: acc[0].from,
        to: last.to,
        steps: [...acc],
        captures: acc.map((s) => s.captured!).filter((x) => x !== null),
        promote: !piece.king && r === promoteRow(n, piece.side),
      });
    }
    return;
  }
  for (const st of steps) {
    const nb = b.slice();
    nb[st.captured!] = null;
    nb[st.from] = null;
    const { r } = rc(n, st.to);
    /* ถึงแถวสุดท้ายระหว่างกิน = เป็นฮอสแล้วจบตา (กติกาไทย) */
    const becameKing = !piece.king && r === promoteRow(n, piece.side);
    const moved: CheckerPiece = { ...piece, king: piece.king || becameKing };
    nb[st.to] = moved;
    if (becameKing) {
      out.push({
        from: acc.length ? acc[0].from : st.from,
        to: st.to,
        steps: [...acc, st],
        captures: [...acc.map((s) => s.captured!), st.captured!].filter((x) => x !== null),
        promote: true,
      });
      continue;
    }
    captureChains(n, nb, st.to, moved, [...acc, st], out);
  }
}

/** ทางเดินทั้งหมดของฝ่ายหนึ่ง */
export function legalMoves(n: number, b: Board, side: Side, forceCapture: boolean): Move[] {
  const caps: Move[] = [];
  const quiet: Move[] = [];

  for (let i = 0; i < b.length; i++) {
    const p = b[i];
    if (!p || p.side !== side) continue;
    captureChains(n, b, i, p, [], caps);
    for (const st of quietSteps(n, b, i, p)) {
      const { r } = rc(n, st.to);
      quiet.push({
        from: st.from,
        to: st.to,
        steps: [st],
        captures: [],
        promote: !p.king && r === promoteRow(n, side),
      });
    }
  }

  if (caps.length > 0 && forceCapture) return caps;
  return [...caps, ...quiet];
}

/** เดินตามตาที่เลือก แล้วคืนกระดานใหม่ */
export function applyMove(n: number, b: Board, m: Move): Board {
  const nb = b.slice();
  const piece = nb[m.from];
  if (!piece) return nb;
  nb[m.from] = null;
  for (const cap of m.captures) nb[cap] = null;
  nb[m.to] = { side: piece.side, king: piece.king || m.promote };
  return nb;
}

export const countPieces = (b: Board, side: Side) => b.reduce((n, p) => n + (p && p.side === side ? 1 : 0), 0);

/* ───────────── สมองของเครื่อง ───────────── */

const value = (n: number, p: CheckerPiece, i: number) => {
  const { r } = rc(n, i);
  /* ฮอสมีค่ามากกว่า · หมากที่เดินใกล้แถวสุดท้ายมีค่ามากขึ้นนิดหน่อย */
  const adv = p.side === "a" ? (n - 1 - r) : r;
  return (p.king ? 9 : 4) + adv * 0.18;
};

function evaluate(n: number, b: Board, me: Side): number {
  let s = 0;
  for (let i = 0; i < b.length; i++) {
    const p = b[i];
    if (!p) continue;
    s += (p.side === me ? 1 : -1) * value(n, p, i);
  }
  return s;
}

function search(n: number, b: Board, side: Side, me: Side, depth: number, force: boolean, alpha: number, beta: number): number {
  const moves = legalMoves(n, b, side, force);
  if (moves.length === 0) return side === me ? -500 : 500;
  if (depth === 0) return evaluate(n, b, me);

  if (side === me) {
    let best = -Infinity;
    for (const m of moves) {
      best = Math.max(best, search(n, applyMove(n, b, m), other(side), me, depth - 1, force, alpha, beta));
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }
  let best = Infinity;
  for (const m of moves) {
    best = Math.min(best, search(n, applyMove(n, b, m), other(side), me, depth - 1, force, alpha, beta));
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

export const other = (s: Side): Side => (s === "a" ? "b" : "a");

/** เครื่องเลือกตาเดิน */
export function pickMove(n: number, b: Board, side: Side, ai: "easy" | "medium" | "hard", force: boolean): Move | null {
  const moves = legalMoves(n, b, side, force);
  if (moves.length === 0) return null;

  if (ai === "easy") {
    /* ส่วนใหญ่เดินมั่ว แต่ถ้ามีโอกาสกินก็กินบ้าง — เด็กจะได้ไม่แพ้รวดเดียว */
    const caps = moves.filter((m) => m.captures.length > 0);
    if (caps.length && Math.random() < 0.55) return caps[Math.floor(Math.random() * caps.length)];
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const depth = ai === "medium" ? 2 : 4;
  let best: Move | null = null;
  let bestScore = -Infinity;
  for (const m of moves) {
    const sc = search(n, applyMove(n, b, m), other(side), side, depth - 1, force, -Infinity, Infinity)
      + (ai === "medium" ? Math.random() * 0.4 : 0); // ระดับกลางเดินไม่เป๊ะเสมอ จะได้ไม่น่าเบื่อ
    if (sc > bestScore) { bestScore = sc; best = m; }
  }
  return best ?? moves[0];
}
