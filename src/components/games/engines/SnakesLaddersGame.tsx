"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { GameShell, shuffle, type GameOutcome } from "@/components/games/GameShell";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { MISSION_CATEGORIES, missionsOf, type Mission, type MissionCat } from "@/data/snakes-missions";
import { playSfx, setSfxOn, sfxOn } from "@/lib/sfx";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;

const COLS = 6;
const ROWS = 5;
const LAST = COLS * ROWS; // 30 ช่อง — กำลังดีสำหรับเด็กอนุบาล

/** 🪜 บันได: ขึ้นจากช่องซ้ายไปช่องขวา */
const LADDERS: Record<number, number> = { 3: 12, 8: 16, 14: 24, 20: 27 };
/** 🐍 งู: ลงจากช่องซ้ายไปช่องขวา */
const SNAKES: Record<number, number> = { 18: 6, 23: 11, 26: 15, 28: 10 };
/** ⭐ ช่องภารกิจ — ตกแล้วตอบคำถามก่อนเล่นต่อ */
const MISSION_CELLS = [5, 10, 13, 17, 21, 25, 29];

const DICE = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

const TOKENS = [
  { emoji: "🔴", name: "แดง" },
  { emoji: "🔵", name: "น้ำเงิน" },
  { emoji: "🟢", name: "เขียว" },
  { emoji: "🟡", name: "เหลือง" },
];

interface Player { id: number; emoji: string; name: string; pos: number; cpu: boolean; missions: number }

/** ช่องหมายเลข n อยู่แถวไหน คอลัมน์ไหน (เดินสลับซ้าย-ขวาแบบกระดานจริง) */
function cellOf(n: number) {
  const idx = n - 1;
  const row = Math.floor(idx / COLS);
  const col = row % 2 === 0 ? idx % COLS : COLS - 1 - (idx % COLS);
  return { row: ROWS - 1 - row, col };
}

/**
 * 🐍 บันไดงูหรรษา
 *
 * • เล่นคนเดียวแข่งกับคอมพิวเตอร์ หรือ 2–4 คนบนเครื่องเดียวกัน
 * • เดินทีละช่องให้เห็นชัด เด็กจะได้นับตาม
 * • ตกช่อง ⭐ ต้องตอบภารกิจสั้น ๆ ก่อนเล่นต่อ — ตอบผิดมีคำใบ้ ไม่ลงโทษ
 * • ช่องสุดท้ายต้องทอยได้แต้มพอดี ถ้าเกินจะเด้งกลับ
 */
export function SnakesLaddersGame({ missions = true, cats = [], onDone }: {
  /** เปิดโหมดภารกิจการเรียนรู้ไหม — ปิด = บันไดงูทั่วไป */
  missions?: boolean;
  /** หมวดคำถามที่ครูเลือก (ว่าง = ทุกหมวด) */
  cats?: MissionCat[];
  onDone?: Cb;
}) {
  const [count, setCount] = useState(2);
  const [vsCpu, setVsCpu] = useState(true);
  const [started, setStarted] = useState(false);
  const [useMission, setUseMission] = useState(missions);
  const [pickCats, setPickCats] = useState<MissionCat[]>(cats);

  const [players, setPlayers] = useState<Player[]>([]);
  const [turn, setTurn] = useState(0);
  const [dice, setDice] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [quiz, setQuiz] = useState<{ m: Mission; playerId: number; tries: number; show: boolean } | null>(null);
  const [sound, setSound] = useState(true);
  const [ready, setReady] = useState(false);

  /* เก็บค่าตั้งค่าไว้ใน ref ด้วย — เพราะ walk/afterWalk เรียกผ่าน setTimeout
     ถ้าอ่านจาก state ตรง ๆ จะได้ค่าเก่าตอนที่ฟังก์ชันถูกสร้าง (stale closure) */
  const missionRef = useRef(missions);
  const catsRef = useRef<MissionCat[]>(cats);
  useEffect(() => { missionRef.current = useMission; }, [useMission]);
  useEffect(() => { catsRef.current = pickCats; }, [pickCats]);

  const timers = useRef<number[]>([]);
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms) as unknown as number); };

  useEffect(() => { setReady(true); setSound(sfxOn()); }, []);
  useEffect(() => () => clearTimers(), []);

  const begin = useCallback(() => {
    clearTimers();
    const n = vsCpu ? 2 : count;
    setPlayers(Array.from({ length: n }, (_, i) => ({
      id: i,
      emoji: TOKENS[i].emoji,
      name: vsCpu ? (i === 0 ? "หนู" : "เครื่อง") : `ผู้เล่น ${i + 1}`,
      pos: 0,
      cpu: vsCpu && i === 1,
      missions: 0,
    })));
    setTurn(0); setDice(0); setBusy(false); setMsg(null); setWinner(null); setQuiz(null);
    setStarted(true);
  }, [count, vsCpu]);

  const restart = useCallback(() => {
    clearTimers();
    setStarted(false); setPlayers([]); setTurn(0); setDice(0);
    setBusy(false); setMsg(null); setWinner(null); setQuiz(null);
  }, []);

  const nextTurn = useCallback((from: number, total: number) => {
    setTurn((from + 1) % total);
    setBusy(false);
  }, []);

  /** เดินทีละช่องให้เห็นชัด แล้วค่อยเช็กบันได งู และช่องภารกิจ */
  const walk = useCallback((pid: number, steps: number) => {
    setPlayers((list) => list); // กันพลาดกรณี state ยังไม่พร้อม
    let done = 0;
    const stepOnce = () => {
      done += 1;
      playSfx("step");
      setPlayers((list) => list.map((p) => (p.id === pid ? { ...p, pos: p.pos + 1 } : p)));
      if (done < steps) later(stepOnce, 230);
      else later(() => afterWalk(pid), 320);
    };
    later(stepOnce, 120);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** ถึงช่องแล้ว — ตรวจบันได งู ภารกิจ และเส้นชัย */
  const afterWalk = useCallback((pid: number) => {
    setPlayers((list) => {
      const me = list.find((p) => p.id === pid);
      if (!me) return list;
      const total = list.length;

      /* ถึงเส้นชัยพอดี */
      if (me.pos >= LAST) {
        playSfx("win");
        setMsg(`🏁 ${me.name} ${me.emoji} ถึงเส้นชัยแล้ว!`);
        setWinner(me);
        return list;
      }

      const up = LADDERS[me.pos];
      const down = SNAKES[me.pos];

      if (up) {
        playSfx("ladder");
        setMsg(`🪜 ${me.name} เจอบันได! ปีนขึ้นจากช่อง ${me.pos} ไปช่อง ${up}`);
        later(() => {
          setPlayers((l) => l.map((p) => (p.id === pid ? { ...p, pos: up } : p)));
          later(() => afterWalk(pid), 450);
        }, 500);
        return list;
      }

      if (down) {
        playSfx("snake");
        setMsg(`🐍 ${me.name} เจองู! ไถลลงจากช่อง ${me.pos} ไปช่อง ${down} ไม่เป็นไรนะ`);
        later(() => {
          setPlayers((l) => l.map((p) => (p.id === pid ? { ...p, pos: down } : p)));
          later(() => afterWalk(pid), 450);
        }, 500);
        return list;
      }

      /* ⭐ ช่องภารกิจ */
      if (missionRef.current && MISSION_CELLS.includes(me.pos)) {
        const pool = missionsOf(catsRef.current);
        const m = shuffle(pool)[0];
        if (m) {
          if (me.cpu) {
            /* เครื่องตอบเอง ไม่ต้องให้เด็กรอ */
            setMsg(`⭐ ${me.name} ตกช่องภารกิจ และตอบคำถามได้`);
            later(() => nextTurn(pid, total), 900);
          } else {
            setMsg(`⭐ ช่องภารกิจ! ตอบคำถามให้ได้ก่อนเล่นต่อนะ`);
            setQuiz({ m, playerId: pid, tries: 0, show: true });
          }
          return list;
        }
      }

      setMsg(null);
      later(() => nextTurn(pid, total), 250);
      return list;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextTurn]);

  /** ทอยลูกเต๋า */
  const roll = useCallback((pid: number) => {
    if (busy || winner || quiz) return;
    setBusy(true);
    setMsg(null);
    playSfx("dice");

    let spins = 0;
    const spin = () => {
      spins += 1;
      setDice(1 + Math.floor(Math.random() * 6));
      if (spins < 8) later(spin, 70);
      else {
        const n = 1 + Math.floor(Math.random() * 6);
        setDice(n);
        setPlayers((list) => {
          const me = list.find((p) => p.id === pid);
          if (!me) return list;
          /* ช่องสุดท้ายต้องทอยพอดี ถ้าเกินให้อยู่ที่เดิม */
          if (me.pos + n > LAST) {
            setMsg(`ทอยได้ ${n} แต้ม — เกินช่อง ${LAST} ไป ต้องทอยให้พอดีนะ รอบนี้อยู่ที่เดิมก่อน`);
            later(() => nextTurn(pid, list.length), 1100);
            return list;
          }
          setMsg(`🎲 ${me.name} ทอยได้ ${n} แต้ม — เดิน ${n} ช่อง`);
          walk(pid, n);
          return list;
        });
      }
    };
    later(spin, 60);
  }, [busy, winner, quiz, walk, nextTurn]);

  /** ตอบภารกิจ */
  const answer = (i: number) => {
    if (!quiz) return;
    const right = i === quiz.m.answer;
    if (right) {
      playSfx("correct");
      setPlayers((list) => list.map((p) => (p.id === quiz.playerId ? { ...p, missions: p.missions + 1 } : p)));
      setMsg("⭐ ตอบถูก! เก่งมาก เล่นต่อได้เลย");
      setQuiz(null);
      setPlayers((list) => { later(() => nextTurn(quiz.playerId, list.length), 700); return list; });
    } else {
      playSfx("wrong");
      setQuiz((q) => (q ? { ...q, tries: q.tries + 1 } : q));
      setMsg(`💡 ยังไม่ใช่นะ — ${quiz.m.hint}`);
    }
  };

  /* ตาคอมพิวเตอร์ */
  useEffect(() => {
    if (!started || winner || quiz || busy) return;
    const me = players[turn];
    if (!me?.cpu) return;
    const t = window.setTimeout(() => roll(me.id), 900);
    return () => clearTimeout(t);
  }, [started, winner, quiz, busy, turn, players, roll]);

  /* รายงานผลตอนจบ */
  const reported = useRef(false);
  useEffect(() => {
    if (!winner || reported.current) return;
    reported.current = true;
    const me = players.find((p) => !p.cpu);
    const iWon = winner.id === (me?.id ?? 0);
    onDone?.({ mistakes: iWon ? 0 : 1, total: 2, seconds: 0, timeUp: false, stars: iWon ? 5 : 3 });
  }, [winner, players, onDone]);
  useEffect(() => { if (started && !winner) reported.current = false; }, [started, winner]);

  const toggleSound = () => { const on = !sound; setSound(on); setSfxOn(on); if (on) playSfx("pop"); };

  if (!ready) return null;

  /* ───────── หน้าตั้งค่าก่อนเริ่ม ───────── */
  if (!started) {
    return (
      <GameShell
        instruction="เลือกจำนวนผู้เล่นและรูปแบบเกม แล้วกดเริ่มเล่นได้เลย"
        done={false}
        onRestart={restart}
        mistakes={0}
        total={1}
        hideClock
      >
        <div className="mx-auto grid max-w-xl gap-4">
          <div>
            <p className="mb-2 font-display text-[16px] text-purple-800">👥 เล่นกี่คน</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => { setVsCpu(true); playSfx("pop"); }} aria-pressed={vsCpu}
                className={cn("tap rounded-2xl px-4 py-2.5 text-[15px] font-medium transition", vsCpu ? "bg-purple-600 text-white! shadow-soft" : "bg-cream-dark text-purple-700")}>
                🧒 เล่นคนเดียว แข่งกับเครื่อง
              </button>
              {[2, 3, 4].map((n) => (
                <button key={n} type="button" onClick={() => { setVsCpu(false); setCount(n); playSfx("pop"); }}
                  aria-pressed={!vsCpu && count === n}
                  className={cn("tap rounded-2xl px-4 py-2.5 text-[15px] font-medium transition", !vsCpu && count === n ? "bg-purple-600 text-white! shadow-soft" : "bg-cream-dark text-purple-700")}>
                  {TOKENS.slice(0, n).map((t) => t.emoji).join("")} {n} คน
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 font-display text-[16px] text-purple-800">🎯 รูปแบบเกม</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => { setUseMission(false); playSfx("pop"); }} aria-pressed={!useMission}
                className={cn("tap rounded-2xl px-4 py-2.5 text-left text-[15px] font-medium transition", !useMission ? "bg-purple-600 text-white! shadow-soft" : "bg-cream-dark text-purple-700")}>
                🐍 บันไดงูทั่วไป
                <span className="block text-[12px] font-normal opacity-85">ทอยลูกเต๋า เดินช่อง เจอบันไดกับงู</span>
              </button>
              <button type="button" onClick={() => { setUseMission(true); playSfx("pop"); }} aria-pressed={useMission}
                className={cn("tap rounded-2xl px-4 py-2.5 text-left text-[15px] font-medium transition", useMission ? "bg-purple-600 text-white! shadow-soft" : "bg-cream-dark text-purple-700")}>
                ⭐ บันไดงูภารกิจ
                <span className="block text-[12px] font-normal opacity-85">มีช่องคำถามการเรียนรู้แทรกอยู่</span>
              </button>
            </div>
          </div>

          {useMission && (
            <div>
              <p className="mb-2 font-display text-[16px] text-purple-800">📚 หมวดคำถาม <span className="text-[13px] font-normal text-ink-soft">(ไม่เลือก = ทุกหมวด)</span></p>
              <div className="grid gap-2 sm:grid-cols-2">
                {MISSION_CATEGORIES.map((c) => {
                  const on = pickCats.includes(c.id);
                  return (
                    <button key={c.id} type="button"
                      onClick={() => { setPickCats((l) => (on ? l.filter((x) => x !== c.id) : [...l, c.id])); playSfx("pop"); }}
                      aria-pressed={on}
                      className={cn("tap rounded-2xl border-2 px-3 py-2 text-left transition", on ? "border-purple-500! bg-purple-50" : "border-line bg-white hover:bg-cream")}>
                      <span className="block text-[15px] text-purple-800">{c.emoji} {c.label}</span>
                      <span className="block text-[12px] leading-snug text-ink-soft">{c.about}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button type="button" onClick={() => { playSfx("pop"); begin(); }}
            className="tap mx-auto rounded-full bg-purple-600 px-8 py-3.5 font-display text-xl text-white shadow-lift hover:bg-purple-700">
            ▶ เริ่มเล่น
          </button>
        </div>
      </GameShell>
    );
  }

  /* ───────── กระดาน ───────── */
  const me = players[turn];
  const human = players.find((p) => !p.cpu);

  return (
    <GameShell
      instruction={
        winner ? `🎉 ${winner.name} ${winner.emoji} ชนะแล้ว!`
          : quiz ? "⭐ ช่องภารกิจ — ตอบคำถามให้ได้ก่อนเล่นต่อนะ"
          : me?.cpu ? "⏳ ตาของเครื่อง รอสักครู่นะ"
          : `ตาของ ${me?.name} ${me?.emoji} — กดทอยลูกเต๋าได้เลย`
      }
      done={!!winner}
      onRestart={restart}
      stats={players.map((p) => `${p.emoji} ${p.name} ช่อง ${p.pos}`).join(" · ")}
      mistakes={winner && human && winner.id !== human.id ? 1 : 0}
      total={2}
      hideClock
    >
      {/* แถบผู้เล่น */}
      <div className="mx-auto mb-3 flex max-w-3xl flex-wrap items-center justify-center gap-2">
        {players.map((p, i) => (
          <span key={p.id}
            className={cn("rounded-full px-3 py-1.5 text-[15px] transition", i === turn && !winner ? "bg-purple-600 text-white! shadow-soft" : "bg-cream-dark text-purple-700")}>
            {p.emoji} {p.name} · ช่อง {p.pos}{useMission && p.missions > 0 ? ` · ⭐${p.missions}` : ""}
          </span>
        ))}
        <button type="button" onClick={toggleSound} aria-pressed={sound} title={sound ? "ปิดเสียง" : "เปิดเสียง"}
          className="tap inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-purple-700 hover:bg-cream">
          {sound ? <Volume2 size={15} /> : <VolumeX size={15} />} {sound ? "เสียง: เปิด" : "เสียง: ปิด"}
        </button>
      </div>

      {/* กระดาน */}
      <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-b from-sky-soft to-mint-soft p-2.5 shadow-soft ring-1 ring-line sm:p-3">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
          {Array.from({ length: ROWS * COLS }, (_, i) => {
            /* วาดจากแถวบนลงล่าง */
            const row = Math.floor(i / COLS);
            const col = i % COLS;
            /* หาเลขช่องที่ตรงกับตำแหน่งนี้ */
            const r = ROWS - 1 - row;
            const n = r % 2 === 0 ? r * COLS + col + 1 : r * COLS + (COLS - col);
            const here = players.filter((p) => p.pos === n);
            const isLadder = !!LADDERS[n];
            const isSnake = !!SNAKES[n];
            const isMission = useMission && MISSION_CELLS.includes(n);
            return (
              <div key={i}
                className={cn(
                  "relative grid aspect-square place-items-center rounded-xl border text-[11px] transition sm:text-[12px]",
                  n === LAST ? "border-yellow-soft bg-yellow-soft" :
                  isLadder ? "border-mint-soft bg-mint-soft" :
                  isSnake ? "border-pink-accent bg-pink-soft" :
                  isMission ? "border-purple-300 bg-purple-50" :
                  "border-line bg-white/85",
                )}
              >
                <span className="absolute left-1 top-0.5 text-[10px] text-ink-soft">{n}</span>
                <span className="text-[clamp(0.9rem,3.4vw,1.4rem)] leading-none">
                  {n === LAST ? "🏁" : isLadder ? "🪜" : isSnake ? "🐍" : isMission ? "⭐" : ""}
                </span>
                {here.length > 0 && (
                  <span className="absolute bottom-0.5 flex gap-0.5 text-[clamp(0.8rem,3vw,1.1rem)] leading-none">
                    {here.map((p) => <span key={p.id} className="animate-float">{p.emoji}</span>)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ลูกเต๋าและปุ่มทอย */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <span className="text-5xl leading-none" aria-label={dice ? `ลูกเต๋าออก ${dice} แต้ม` : "ยังไม่ได้ทอย"}>{dice ? DICE[dice] : "🎲"}</span>
        {msg && <p role="status" className="animate-rise mx-auto max-w-md rounded-2xl bg-white px-4 py-2 text-center text-[15px] leading-snug text-purple-800 shadow-soft">{msg}</p>}
        {!winner && !quiz && !me?.cpu && (
          <button type="button" onClick={() => roll(me.id)} disabled={busy}
            className="tap rounded-full bg-purple-600 px-7 py-3 font-display text-lg text-white shadow-soft hover:bg-purple-700 disabled:opacity-40">
            🎲 ทอยลูกเต๋า
          </button>
        )}
      </div>

      {/* ⭐ ภารกิจ */}
      {quiz && (
        <div className="mx-auto mt-4 max-w-lg rounded-3xl border-2 border-purple-300 bg-purple-50 p-4">
          <p className="mb-1 text-center text-[13px] font-medium text-purple-500">
            ⭐ ช่องภารกิจ · {MISSION_CATEGORIES.find((c) => c.id === quiz.m.cat)?.emoji} {MISSION_CATEGORIES.find((c) => c.id === quiz.m.cat)?.label}
          </p>
          {quiz.m.art && <p className="mb-1 text-center text-3xl leading-none">{quiz.m.art}</p>}
          <div className="mb-3 flex items-center justify-center gap-2">
            <p className="text-center font-display text-[17px] leading-snug text-purple-800">{quiz.m.q}</p>
            <SpeakButton text={quiz.m.q} size="sm" label="" />
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {quiz.m.options.map((o, i) => (
              <button key={i} type="button" onClick={() => answer(i)}
                className="tap rounded-2xl border-2 border-line bg-white px-3 py-2.5 text-[16px] text-purple-800 transition hover:scale-105 hover:border-purple-300">
                {o}
              </button>
            ))}
          </div>
          {quiz.tries > 0 && (
            <p className="mt-2 text-center text-[13px] text-ink-soft">ตอบผิดไม่เป็นไรนะ ลองใหม่ได้เรื่อย ๆ จนกว่าจะถูก 💜</p>
          )}
        </div>
      )}

      {/* คำอธิบายช่อง */}
      <div className="mx-auto mt-4 flex max-w-2xl flex-wrap justify-center gap-2 text-[13px] text-ink-soft">
        <span className="rounded-full bg-mint-soft px-3 py-1 text-[#1f6b4d]">🪜 บันได — ปีนขึ้น</span>
        <span className="rounded-full bg-pink-soft px-3 py-1 text-[#a8456c]">🐍 งู — ไถลลง</span>
        {useMission && <span className="rounded-full bg-purple-50 px-3 py-1 text-purple-700">⭐ ภารกิจ — ตอบคำถาม</span>}
        <span className="rounded-full bg-yellow-soft px-3 py-1 text-[#8a6a00]">🏁 ช่อง {LAST} — ต้องทอยให้พอดี</span>
      </div>
    </GameShell>
  );
}
