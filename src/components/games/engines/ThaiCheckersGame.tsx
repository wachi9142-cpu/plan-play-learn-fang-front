"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Brain, Undo2, Users, Volume2, VolumeX } from "lucide-react";
import { GameShell, type GameOutcome } from "@/components/games/GameShell";
import { SpeakButton } from "@/components/ui/SpeakButton";
import {
  CHECKERS_LEVELS, LESSONS, PUZZLES, RULES, SIDE_INFO,
  type CheckersLevel, type Puzzle, type Side,
} from "@/data/thai-checkers";
import {
  applyMove, boardFromPieces, countPieces, initBoard, legalMoves, other, pickMove, rc,
  type Board, type Move,
} from "@/lib/thai-checkers";
import { playSfx, setSfxOn, sfxOn } from "@/lib/sfx";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;
type Mode = "menu" | "lesson" | "cpu" | "friend" | "puzzle";

/** ผู้เล่นเป็นฝั่งม่วงเสมอ (อยู่ด้านล่าง เดินขึ้น) */
const ME: Side = "a";

/**
 * ♟️ หมากฮอสหรรษา
 *
 * 4 โหมด — ฝึกเดินหมาก · เล่นกับเครื่อง 3 ระดับ · เล่น 2 คน · โจทย์ฝึกคิด
 * ช่องที่เดินได้จะสว่างขึ้นเสมอ และช่องที่กินได้มีขอบสีส้ม เด็กจึงไม่ต้องเดา
 * มีปุ่มย้อนกลับ เดินผิดก็ถอยได้ ไม่ต้องกลัว
 */
export function ThaiCheckersGame({ onDone }: { onDone?: Cb }) {
  const [mode, setMode] = useState<Mode>("menu");
  const [lv, setLv] = useState<CheckersLevel>(CHECKERS_LEVELS[0]);
  const [force, setForce] = useState(false);
  const [sound, setSound] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [ready, setReady] = useState(false);

  const [size, setSize] = useState<number>(6);
  const [board, setBoard] = useState<Board>([]);
  const [turn, setTurn] = useState<Side>(ME);
  const [sel, setSel] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [over, setOver] = useState<{ winner: Side | null; why: string } | null>(null);
  const [history, setHistory] = useState<{ board: Board; turn: Side }[]>([]);
  const [lessonStep, setLessonStep] = useState(0);

  /* โจทย์ฝึกคิด */
  const [pz, setPz] = useState(0);
  const [pzDone, setPzDone] = useState<string[]>([]);
  const puzzle: Puzzle | undefined = PUZZLES[pz];

  const busy = useRef(false);

  useEffect(() => { setReady(true); setSound(sfxOn()); }, []);

  /* ---------- เริ่มโหมดต่าง ๆ ---------- */
  const startGame = useCallback((m: Mode, level?: CheckersLevel) => {
    const L = level ?? lv;
    const n = m === "lesson" ? 6 : m === "friend" ? 8 : L.size;
    const rows = m === "lesson" ? 1 : 2;
    setSize(n);
    setBoard(initBoard(n, rows));
    setTurn(ME); setSel(null); setMsg(null); setOver(null); setHistory([]);
    setForce(m === "cpu" ? L.forceCapture : false);
    setLessonStep(0);
    setMode(m);
    busy.current = false;
  }, [lv]);

  const startPuzzle = useCallback((i: number) => {
    const p = PUZZLES[i];
    if (!p) return;
    setPz(i);
    setSize(p.size);
    setBoard(boardFromPieces(p.size, p.pieces));
    setTurn(ME); setSel(null); setMsg(null); setOver(null); setHistory([]);
    setForce(false);
    setMode("puzzle");
    busy.current = false;
  }, []);

  const toMenu = useCallback(() => {
    setMode("menu"); setBoard([]); setSel(null); setMsg(null); setOver(null); setHistory([]);
    busy.current = false;
  }, []);

  /* ---------- ตาเดินที่เป็นไปได้ ---------- */
  const myMoves = useMemo(
    () => (board.length ? legalMoves(size, board, turn, force) : []),
    [board, size, turn, force],
  );
  const fromSel = useMemo(() => (sel === null ? [] : myMoves.filter((m) => m.from === sel)), [myMoves, sel]);
  const movable = useMemo(() => new Set(myMoves.map((m) => m.from)), [myMoves]);
  const targets = useMemo(() => new Map(fromSel.map((m) => [m.to, m])), [fromSel]);

  /* ---------- ตรวจจบเกม ---------- */
  useEffect(() => {
    if (!board.length || mode === "menu" || mode === "puzzle" || over) return;
    const a = countPieces(board, "a");
    const b = countPieces(board, "b");
    if (a === 0) { setOver({ winner: "b", why: "หมากม่วงหมดกระดาน" }); return; }
    if (b === 0) { setOver({ winner: "a", why: "หมากส้มหมดกระดาน" }); return; }
    if (myMoves.length === 0) {
      setOver({ winner: other(turn), why: `${SIDE_INFO[turn].name}เดินต่อไม่ได้แล้ว` });
    }
  }, [board, myMoves, turn, mode, over]);

  useEffect(() => {
    if (!over) return;
    playSfx(over.winner === ME ? "win" : "pop");
  }, [over]);

  /* ---------- รายงานผล ---------- */
  const reported = useRef(false);
  useEffect(() => {
    if (!over || reported.current) return;
    reported.current = true;
    const won = over.winner === ME;
    onDone?.({ mistakes: won ? 0 : 1, total: 2, seconds: 0, timeUp: false, stars: won ? 5 : 3 });
  }, [over, onDone]);
  useEffect(() => { if (!over) reported.current = false; }, [over]);

  /* ---------- เดิน ---------- */
  const doMove = useCallback((m: Move) => {
    setHistory((h) => [...h, { board, turn }].slice(-20));
    const nb = applyMove(size, board, m);
    setBoard(nb);
    setSel(null);
    if (m.captures.length) playSfx("coin");
    else playSfx("step");
    if (m.promote) { playSfx("correct"); setMsg("👑 ได้ฮอสแล้ว! ต่อไปเดินทแยงได้ไกลและทุกทิศ"); }
    else if (m.captures.length >= 2) setMsg(`🦘 กินต่อเนื่อง ${m.captures.length} ตัวเลย เก่งมาก!`);
    else if (m.captures.length === 1) setMsg("🦘 กินหมากได้ 1 ตัว");
    else setMsg(null);
    return nb;
  }, [board, size, turn]);

  /** โหมดโจทย์ — ตรวจว่าทำสำเร็จไหม */
  const checkPuzzle = useCallback((m: Move) => {
    if (!puzzle) return;
    const ok = puzzle.goal === "capture" ? m.captures.length > 0 : m.promote;
    if (ok) {
      playSfx("win");
      setMsg(`⭐ ${puzzle.praise}`);
      setPzDone((l) => (l.includes(puzzle.id) ? l : [...l, puzzle.id]));
      setOver({ winner: ME, why: "ทำโจทย์สำเร็จ" });
    } else {
      playSfx("wrong");
      setMsg(`💡 ยังไม่ใช่ทางที่โจทย์ต้องการ — ${puzzle.hint} (กดย้อนกลับแล้วลองใหม่ได้)`);
    }
  }, [puzzle]);

  const clickCell = (i: number) => {
    if (over || busy.current) return;
    if (mode === "cpu" && turn !== ME) return;

    const t = targets.get(i);
    if (t) {
      doMove(t);
      if (mode === "puzzle") { checkPuzzle(t); return; }
      setTurn(other(turn));
      return;
    }

    const p = board[i];
    if (p && p.side === turn) {
      if (!movable.has(i)) {
        playSfx("wrong");
        setMsg(force && myMoves.some((m) => m.captures.length)
          ? "ตานี้มีหมากที่กินได้ ต้องเลือกตัวที่กินได้ก่อนนะ (กติกาบังคับกิน)"
          : "หมากตัวนี้ยังเดินไม่ได้ ลองเลือกตัวอื่นดู");
        return;
      }
      playSfx("pop");
      setSel(i === sel ? null : i);
      setMsg(null);
      return;
    }
    setSel(null);
  };

  const undo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    playSfx("pop");
    setBoard(last.board);
    setTurn(last.turn);
    setHistory((h) => h.slice(0, -1));
    setSel(null); setMsg(null); setOver(null);
  };

  /* ---------- ตาของเครื่อง ---------- */
  useEffect(() => {
    if (mode !== "cpu" || over || turn === ME || !board.length) return;
    busy.current = true;
    const t = window.setTimeout(() => {
      const m = pickMove(size, board, turn, lv.ai, force);
      if (m) {
        setHistory((h) => [...h, { board, turn }].slice(-20));
        setBoard(applyMove(size, board, m));
        if (m.captures.length) { playSfx("coin"); setMsg(`🟠 เครื่องกินหมากเราไป ${m.captures.length} ตัว ไม่เป็นไรนะ สู้ต่อ!`); }
        else { playSfx("step"); setMsg(null); }
      }
      setTurn(ME);
      busy.current = false;
    }, 750);
    return () => { clearTimeout(t); busy.current = false; };
  }, [mode, over, turn, board, size, lv.ai, force]);

  const toggleSound = () => { const on = !sound; setSound(on); setSfxOn(on); if (on) playSfx("pop"); };

  if (!ready) return null;

  /* ───────────── เมนูเลือกโหมด ───────────── */
  if (mode === "menu") {
    return (
      <GameShell instruction="เลือกโหมดที่อยากเล่น — เริ่มจากฝึกเดินหมากก่อนก็ได้นะ" done={false} onRestart={toMenu} mistakes={0} total={1} hideClock>
        <div className="mx-auto grid max-w-2xl gap-3">
          <button type="button" onClick={() => { playSfx("pop"); startGame("lesson"); }}
            className="tap flex items-center gap-3 rounded-2xl border-2 border-mint-soft bg-mint-soft px-4 py-3 text-left hover:brightness-95">
            <BookOpen size={22} className="shrink-0 text-[#1f6b4d]" />
            <span>
              <span className="block font-display text-[16px] text-purple-800">🎓 ฝึกเดินหมาก</span>
              <span className="block text-[13px] text-ink-soft">กระดานเล็ก หมากน้อย มีคำแนะนำทีละขั้น ไม่มีใครมาแข่ง</span>
            </span>
          </button>

          <div className="rounded-2xl border border-line bg-white p-3">
            <p className="mb-2 flex items-center gap-2 font-display text-[16px] text-purple-800"><Users size={18} /> 🤖 เล่นกับเครื่อง</p>
            <div className="grid gap-2">
              {CHECKERS_LEVELS.map((L) => (
                <button key={L.id} type="button" onClick={() => { playSfx("pop"); setLv(L); startGame("cpu", L); }}
                  className="tap rounded-xl bg-cream px-3 py-2 text-left hover:bg-purple-50">
                  <span className="block text-[15px] text-purple-800">{L.emoji} {L.label} <span className="text-[12px] text-ink-soft">· {L.tag}</span></span>
                  <span className="block text-[12px] leading-snug text-ink-soft">{L.about}</span>
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={() => { playSfx("pop"); startGame("friend"); }}
            className="tap flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-left hover:bg-cream">
            <Users size={22} className="shrink-0 text-purple-600" />
            <span>
              <span className="block font-display text-[16px] text-purple-800">👫 เล่น 2 คนบนเครื่องเดียวกัน</span>
              <span className="block text-[13px] text-ink-soft">กระดานเต็ม 8×8 ผลัดกันเดินกับเพื่อนหรือคุณครู</span>
            </span>
          </button>

          <button type="button" onClick={() => { playSfx("pop"); startPuzzle(0); }}
            className="tap flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-left hover:bg-cream">
            <Brain size={22} className="shrink-0 text-purple-600" />
            <span>
              <span className="block font-display text-[16px] text-purple-800">🧠 โจทย์ฝึกคิด <span className="text-[12px] font-normal text-ink-soft">({pzDone.length}/{PUZZLES.length} ข้อ)</span></span>
              <span className="block text-[13px] text-ink-soft">สถานการณ์สั้น ๆ เช่น ควรเดินหมากตัวไหนจึงจะได้เปรียบ</span>
            </span>
          </button>

          <button type="button" onClick={() => { playSfx("pop"); setShowRules((v) => !v); }} aria-expanded={showRules}
            className="tap rounded-2xl bg-cream-dark px-4 py-2.5 text-[15px] font-medium text-purple-700 hover:brightness-95">
            📖 วิธีเล่นและกติกาหมากฮอสไทย {showRules ? "(ซ่อน)" : ""}
          </button>

          {showRules && (
            <div className="grid gap-2 rounded-2xl bg-cream p-3">
              {RULES.map((r) => (
                <div key={r.title} className="flex gap-2.5">
                  <span className="shrink-0 text-xl leading-none">{r.emoji}</span>
                  <p className="text-[14px] leading-snug"><b className="text-purple-800">{r.title}</b> — {r.text}</p>
                </div>
              ))}
              <p className="rounded-xl bg-white px-3 py-2 text-[12px] leading-snug text-ink-soft">
                ℹ️ กติกาหมากฮอสมีหลายแบบในแต่ละประเทศ เกมนี้ใช้แบบที่นิยมเล่นในไทย
                ส่วนกติกา “บังคับกิน” จะเปิดให้เฉพาะระดับ 3 เพราะเด็กเล็กยังไม่ควรถูกบังคับ
              </p>
            </div>
          )}
        </div>
      </GameShell>
    );
  }

  /* ───────────── กระดาน ───────────── */
  const turnName = mode === "friend" ? `ผู้เล่น ${turn === "a" ? "1" : "2"} ${SIDE_INFO[turn].emoji}` : turn === ME ? "หนู 🟣" : "เครื่อง 🟠";
  const title =
    mode === "lesson" ? "🎓 ฝึกเดินหมาก"
    : mode === "puzzle" ? `🧠 โจทย์ข้อ ${pz + 1}/${PUZZLES.length} — ${puzzle?.title}`
    : mode === "friend" ? "👫 เล่น 2 คน"
    : `🤖 ${lv.emoji} ${lv.label}`;

  return (
    <GameShell
      instruction={
        over ? (mode === "puzzle" ? `⭐ ${puzzle?.praise}` : over.winner === ME || mode === "friend" ? `🎉 ${SIDE_INFO[over.winner ?? ME].emoji} ฝ่าย${SIDE_INFO[over.winner ?? ME].name}ชนะ! (${over.why})` : `เครื่องชนะรอบนี้ (${over.why}) — ลองใหม่ได้เลย เก่งขึ้นทุกครั้งแน่นอน`)
          : mode === "puzzle" ? (puzzle?.q ?? "")
          : sel !== null ? "คลิกช่องสีเขียวเพื่อเดิน · ช่องขอบส้มคือเดินไปแล้วได้กินหมาก"
          : `ตาของ ${turnName} — คลิกหมากของตัวเองก่อน`
      }
      done={!!over}
      onRestart={() => (mode === "puzzle" ? startPuzzle(pz) : startGame(mode))}
      stats={`🟣 ${countPieces(board, "a")} ตัว · 🟠 ${countPieces(board, "b")} ตัว`}
      mistakes={over && over.winner !== ME && mode !== "friend" ? 1 : 0}
      total={2}
      hideClock
    >
      {/* แถบบน */}
      <div className="mx-auto mb-3 flex max-w-2xl flex-wrap items-center justify-center gap-2">
        <span className="rounded-full bg-purple-100 px-3 py-1.5 text-[14px] text-purple-800">{title}</span>
        <span className={cn("rounded-full px-3 py-1.5 text-[14px]", turn === "a" ? "bg-purple-600 text-white!" : "bg-cream-dark text-purple-700")}>
          🟣 ม่วง {countPieces(board, "a")}
        </span>
        <span className={cn("rounded-full px-3 py-1.5 text-[14px]", turn === "b" ? "bg-purple-600 text-white!" : "bg-cream-dark text-purple-700")}>
          🟠 ส้ม {countPieces(board, "b")}
        </span>
        <button type="button" onClick={undo} disabled={history.length === 0}
          className="tap inline-flex items-center gap-1 rounded-full bg-cream-dark px-3 py-1.5 text-[13px] font-medium text-purple-700 hover:brightness-95 disabled:opacity-40">
          <Undo2 size={14} /> ย้อนกลับ
        </button>
        <button type="button" onClick={toggleSound} aria-pressed={sound}
          className="tap inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-purple-700 hover:bg-cream">
          {sound ? <Volume2 size={14} /> : <VolumeX size={14} />} {sound ? "เสียง: เปิด" : "เสียง: ปิด"}
        </button>
        <button type="button" onClick={() => { playSfx("pop"); toMenu(); }}
          className="tap rounded-full bg-cream-dark px-3 py-1.5 text-[13px] font-medium text-purple-700 hover:brightness-95">
          ← เลือกโหมดใหม่
        </button>
      </div>

      {/* บทเรียน */}
      {mode === "lesson" && (
        <div className="mx-auto mb-3 max-w-2xl rounded-2xl border-2 border-mint-soft bg-mint-soft px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">{LESSONS[lessonStep].emoji}</span>
            <p className="min-w-0 flex-1 text-[15px] leading-snug text-[#1f6b4d]">
              <b>{LESSONS[lessonStep].title}</b> — {LESSONS[lessonStep].text}
            </p>
            <SpeakButton text={`${LESSONS[lessonStep].title} ${LESSONS[lessonStep].text}`} size="sm" label="" />
          </div>
          <div className="mt-2 flex justify-center gap-2">
            <button type="button" onClick={() => { playSfx("pop"); setLessonStep((i) => Math.max(0, i - 1)); }} disabled={lessonStep === 0}
              className="tap rounded-full bg-white px-3 py-1 text-[13px] text-purple-700 disabled:opacity-40">ก่อนหน้า</button>
            <span className="self-center text-[13px] text-[#1f6b4d]">{lessonStep + 1}/{LESSONS.length}</span>
            <button type="button" onClick={() => { playSfx("pop"); setLessonStep((i) => Math.min(LESSONS.length - 1, i + 1)); }} disabled={lessonStep === LESSONS.length - 1}
              className="tap rounded-full bg-white px-3 py-1 text-[13px] text-purple-700 disabled:opacity-40">ถัดไป</button>
          </div>
        </div>
      )}

      {/* โจทย์ */}
      {mode === "puzzle" && puzzle && (
        <div className="mx-auto mb-3 flex max-w-2xl items-center justify-center gap-2 rounded-2xl bg-purple-50 px-4 py-2.5">
          <p className="text-center text-[15px] leading-snug text-purple-800">{puzzle.q}</p>
          <SpeakButton text={puzzle.q} size="sm" label="" />
        </div>
      )}

      {/* กระดาน */}
      <div className="mx-auto w-full max-w-lg rounded-3xl bg-[#8d5a2b] p-2 shadow-soft sm:p-3">
        <div className="grid gap-0 overflow-hidden rounded-xl" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
          {board.map((p, i) => {
            const { r, c } = rc(size, i);
            const dark = (r + c) % 2 === 1;
            const canGo = targets.has(i);
            const isCap = canGo && (targets.get(i)?.captures.length ?? 0) > 0;
            const canPick = !!p && p.side === turn && movable.has(i) && !over && (mode !== "cpu" || turn === ME);
            return (
              <button
                key={i}
                type="button"
                onClick={() => clickCell(i)}
                disabled={!dark}
                aria-label={`แถว ${r + 1} ช่อง ${c + 1}${p ? ` มีหมาก${SIDE_INFO[p.side].name}${p.king ? " ฮอส" : ""}` : " ว่าง"}`}
                className={cn(
                  "relative grid aspect-square place-items-center transition",
                  dark ? "bg-[#a9714b]" : "bg-[#f3e3c3]",
                  canGo && (isCap ? "ring-4 ring-inset ring-[#f08c3a]" : "ring-4 ring-inset ring-[#5ec489]"),
                  canPick && "cursor-pointer hover:brightness-110",
                  sel === i && "ring-4 ring-inset ring-purple-500",
                )}
              >
                {p && (
                  <span className={cn("relative grid place-items-center", canPick && "drop-shadow-md")}>
                    <span className="text-[clamp(1.1rem,6vw,2.1rem)] leading-none">{SIDE_INFO[p.side].emoji}</span>
                    {p.king && <span className="absolute text-[clamp(0.6rem,3vw,1.1rem)] leading-none">👑</span>}
                  </span>
                )}
                {canGo && !p && (
                  <span className={cn("size-[26%] rounded-full", isCap ? "bg-[#f08c3a]" : "bg-[#5ec489]")} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {msg && (
        <p role="status" className="animate-rise mx-auto mt-3 max-w-lg rounded-2xl bg-white px-4 py-2.5 text-center text-[15px] leading-snug text-purple-800 shadow-soft">
          {msg}
        </p>
      )}

      {/* ปุ่มล่าง */}
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {mode === "cpu" && (
          <button type="button" onClick={() => { setForce((v) => !v); playSfx("pop"); }} aria-pressed={force}
            className={cn("tap rounded-full px-4 py-2 text-[13px] font-medium transition", force ? "bg-purple-600 text-white!" : "bg-cream-dark text-purple-700")}>
            {force ? "บังคับกิน: เปิด (กติกาจริง)" : "บังคับกิน: ปิด"}
          </button>
        )}
        {mode === "puzzle" && (
          <>
            <button type="button" onClick={() => { playSfx("pop"); startPuzzle((pz + PUZZLES.length - 1) % PUZZLES.length); }}
              className="tap rounded-full bg-cream-dark px-4 py-2 text-[13px] font-medium text-purple-700">← ข้อก่อนหน้า</button>
            <button type="button" onClick={() => { playSfx("pop"); startPuzzle((pz + 1) % PUZZLES.length); }}
              className="tap rounded-full bg-purple-600 px-4 py-2 text-[13px] font-medium text-white">ข้อถัดไป →</button>
          </>
        )}
      </div>

      {/* คำอธิบายสี */}
      <div className="mx-auto mt-3 flex max-w-lg flex-wrap justify-center gap-2 text-[13px] text-ink-soft">
        <span className="rounded-full bg-cream px-3 py-1">🟣 หมากของหนู</span>
        <span className="rounded-full bg-cream px-3 py-1">🟠 หมากอีกฝ่าย</span>
        <span className="rounded-full bg-cream px-3 py-1">🟩 ช่องที่เดินได้</span>
        <span className="rounded-full bg-cream px-3 py-1">🟧 เดินไปแล้วได้กินหมาก</span>
        <span className="rounded-full bg-cream px-3 py-1">👑 ฮอส</span>
      </div>
    </GameShell>
  );
}
