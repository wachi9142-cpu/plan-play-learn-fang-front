"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { BigTile, GameShell, shuffle, type GameOutcome } from "@/components/games/GameShell";

type Done = { timeLimit?: number; onDone?: (o: GameOutcome) => void };

/* ---------- ➡️ เลือกทิศทาง ---------- */
export type DirRound = { actor: string; goal: string; dir: "up" | "down" | "left" | "right" };
const ARROW = { up: "⬆️", down: "⬇️", left: "⬅️", right: "➡️" } as const;
const OFFS = { up: [1, 0], down: [1, 2], left: [0, 1], right: [2, 1] } as const;
export function DirectionGame({ rounds, timeLimit, onDone }: { rounds: DirRound[] } & Done) {
  const [i, setI] = useState(0); const [wrongs, setWrongs] = useState(0); const [picked, setPicked] = useState<string | null>(null); const [done, setDone] = useState(false);
  const restart = () => { setI(0); setWrongs(0); setPicked(null); setDone(false); };
  useEffect(restart, [rounds]);
  const r = rounds[i];
  const pick = (d: DirRound["dir"]) => { if (picked || done) return; setPicked(d); if (d !== r.dir) { setWrongs((w) => w + 1); setTimeout(() => setPicked(null), 700); return; } setTimeout(() => { setPicked(null); if (i + 1 >= rounds.length) setDone(true); else setI(i + 1); }, 800); };
  const [gc, gr] = OFFS[r.dir];
  return (
    <GameShell instruction={`${r.actor} ต้องไปทางไหนถึงจะเจอ ${r.goal}?`} progress={{ current: done ? rounds.length : i, total: rounds.length }} done={done} onRestart={restart} mistakes={wrongs} total={rounds.length} timeLimit={timeLimit} onDone={onDone}>
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-10">
        <div className="grid grid-cols-3 gap-1 rounded-3xl bg-white p-2 shadow-soft ring-1 ring-line" style={{ width: "min(70vw, 240px)" }}>
          {Array.from({ length: 9 }, (_, k) => { const c = k % 3, rr = Math.floor(k / 3); return <div key={k} className={cn("flex aspect-square items-center justify-center rounded-xl text-3xl", (c + rr) % 2 ? "bg-mint-soft" : "bg-sky-soft")}>{c === 1 && rr === 1 ? r.actor : c === gc && rr === gr ? r.goal : ""}</div>; })}
        </div>
        <div className="grid grid-cols-3 gap-2" style={{ width: "min(70vw, 220px)" }}>
          <span /><BigTile onClick={() => pick("up")} state={picked === "up" ? (r.dir === "up" ? "correct" : "wrong") : "idle"} className="text-3xl!">{ARROW.up}</BigTile><span />
          <BigTile onClick={() => pick("left")} state={picked === "left" ? (r.dir === "left" ? "correct" : "wrong") : "idle"} className="text-3xl!">{ARROW.left}</BigTile>
          <BigTile onClick={() => pick("down")} state={picked === "down" ? (r.dir === "down" ? "correct" : "wrong") : "idle"} className="text-3xl!">{ARROW.down}</BigTile>
          <BigTile onClick={() => pick("right")} state={picked === "right" ? (r.dir === "right" ? "correct" : "wrong") : "idle"} className="text-3xl!">{ARROW.right}</BigTile>
        </div>
      </div>
    </GameShell>
  );
}

/* ---------- 🔁 Pattern: เติมช่องถัดไปให้ถูกแบบแผน ---------- */
export type PatternRound = { seq: string[]; options: string[]; answer: string };
export function PatternGame({ rounds, timeLimit, onDone }: { rounds: PatternRound[] } & Done) {
  const [i, setI] = useState(0); const [wrongs, setWrongs] = useState(0); const [picked, setPicked] = useState<string | null>(null); const [done, setDone] = useState(false); const [opts, setOpts] = useState<string[]>([]);
  const restart = () => { setI(0); setWrongs(0); setPicked(null); setDone(false); setOpts(shuffle(rounds[0].options)); };
  useEffect(restart, [rounds]); // eslint-disable-line react-hooks/exhaustive-deps
  const r = rounds[i];
  const pick = (o: string) => { if (picked || done) return; setPicked(o); if (o !== r.answer) { setWrongs((w) => w + 1); setTimeout(() => setPicked(null), 700); return; } setTimeout(() => { setPicked(null); if (i + 1 >= rounds.length) setDone(true); else { setI(i + 1); setOpts(shuffle(rounds[i + 1].options)); } }, 800); };
  return (
    <GameShell instruction="ดูแบบแผน แล้วเลือกว่าช่อง ❓ ควรเป็นอะไร" progress={{ current: done ? rounds.length : i, total: rounds.length }} done={done} onRestart={restart} mistakes={wrongs} total={rounds.length} timeLimit={timeLimit} onDone={onDone}>
      <div className="mb-5 flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-cream p-3">
        {r.seq.map((s, k) => <span key={k} className="grid size-12 place-items-center rounded-xl bg-white text-3xl shadow-soft sm:size-14">{s}</span>)}
        <span className="grid size-12 place-items-center rounded-xl border-2 border-dashed border-purple-400 bg-yellow-soft text-3xl sm:size-14">{picked === r.answer ? r.answer : "❓"}</span>
      </div>
      <div className="mx-auto grid max-w-md grid-cols-3 gap-3">{opts.map((o) => <BigTile key={o} onClick={() => pick(o)} state={picked === o ? (o === r.answer ? "correct" : "wrong") : "idle"}>{o}</BigTile>)}</div>
    </GameShell>
  );
}

/* ---------- 🔀 If / Then: ถ้า…ให้… ---------- */
export type ConditionRound = { rule: string; item: string; branches: { label: string; emoji: string }[]; answer: number };
export function ConditionGame({ rounds, timeLimit, onDone }: { rounds: ConditionRound[] } & Done) {
  const [i, setI] = useState(0); const [wrongs, setWrongs] = useState(0); const [picked, setPicked] = useState<number | null>(null); const [done, setDone] = useState(false);
  const restart = () => { setI(0); setWrongs(0); setPicked(null); setDone(false); };
  useEffect(restart, [rounds]);
  const r = rounds[i];
  const pick = (b: number) => { if (picked !== null || done) return; setPicked(b); if (b !== r.answer) { setWrongs((w) => w + 1); setTimeout(() => setPicked(null), 700); return; } setTimeout(() => { setPicked(null); if (i + 1 >= rounds.length) setDone(true); else setI(i + 1); }, 800); };
  return (
    <GameShell instruction={r.rule} progress={{ current: done ? rounds.length : i, total: rounds.length }} done={done} onRestart={restart} mistakes={wrongs} total={rounds.length} timeLimit={timeLimit} onDone={onDone}>
      <div className="mb-5 text-center"><span className="inline-grid size-24 place-items-center rounded-3xl bg-white text-6xl shadow-lift">{r.item}</span><p className="mt-2 font-display text-lg text-purple-800">เจอสิ่งนี้ → ทำอะไรดี?</p></div>
      <div className="mx-auto grid max-w-md gap-3" style={{ gridTemplateColumns: `repeat(${r.branches.length}, minmax(0, 1fr))` }}>
        {r.branches.map((b, k) => <button key={k} type="button" onClick={() => pick(k)} className={cn("tap flex flex-col items-center rounded-2xl border-4 bg-white p-3 shadow-soft transition active:scale-95", picked === k ? (k === r.answer ? "border-[#43a047] bg-mint-soft" : "animate-shake border-red-400 bg-red-50") : "border-purple-100 hover:border-purple-300")}><span className="text-4xl">{b.emoji}</span><span className="mt-1 text-[14px]">{b.label}</span></button>)}
      </div>
    </GameShell>
  );
}

/* ---------- 🧠 Quiz: ตรรกะ / ทายผลลัพธ์โค้ด / หาบั๊ก (ประถม–มัธยม) ---------- */
export type QuizRound = { q: string; code?: string; options: string[]; answer: number; explain?: string };
export function QuizGame({ rounds, title, timeLimit, onDone }: { rounds: QuizRound[]; title: string } & Done) {
  const [i, setI] = useState(0); const [wrongs, setWrongs] = useState(0); const [picked, setPicked] = useState<number | null>(null); const [done, setDone] = useState(false); const [show, setShow] = useState(false);
  const restart = () => { setI(0); setWrongs(0); setPicked(null); setDone(false); setShow(false); };
  useEffect(restart, [rounds]);
  const r = rounds[i];
  const pick = (k: number) => { if (picked !== null || done) return; setPicked(k); if (k !== r.answer) { setWrongs((w) => w + 1); setTimeout(() => setPicked(null), 800); return; } setShow(true); setTimeout(() => { setPicked(null); setShow(false); if (i + 1 >= rounds.length) setDone(true); else setI(i + 1); }, r.explain ? 1800 : 800); };
  return (
    <GameShell instruction={title} progress={{ current: done ? rounds.length : i, total: rounds.length }} done={done} onRestart={restart} mistakes={wrongs} total={rounds.length} timeLimit={timeLimit} onDone={onDone}>
      <p className="font-display text-lg text-purple-800">{r.q}</p>
      {r.code && <pre className="mt-2 overflow-x-auto rounded-2xl bg-ink p-4 text-[14px] leading-relaxed text-green-200"><code>{r.code}</code></pre>}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {r.options.map((o, k) => <button key={k} type="button" onClick={() => pick(k)} className={cn("tap rounded-2xl border-2 bg-white px-4 py-3 text-left text-[15px] shadow-soft transition active:scale-[0.98]", picked === k ? (k === r.answer ? "border-[#43a047] bg-mint-soft" : "animate-shake border-red-400 bg-red-50") : "border-purple-100 hover:border-purple-300")}><span className="mr-2 font-display text-purple-500">{String.fromCharCode(65 + k)}.</span><code className="whitespace-pre-wrap">{o}</code></button>)}
      </div>
      {show && r.explain && <p className="mt-3 animate-rise rounded-xl bg-mint-soft px-3 py-2 text-[14px]">💡 {r.explain}</p>}
    </GameShell>
  );
}
