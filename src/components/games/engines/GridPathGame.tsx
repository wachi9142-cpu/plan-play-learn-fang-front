"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { GameShell, type GameOutcome } from "@/components/games/GameShell";

export type Dir = "up" | "down" | "left" | "right";
export interface GridLevel {
  size: number;
  start: [number, number];   // [col,row]
  target: [number, number];
  obstacles?: [number, number][];
  /** จำนวนช่องคำสั่งสูงสุด (บังคับใช้ 🔁 ทำซ้ำ เมื่อเส้นทางยาวกว่านี้) */
  maxCmds?: number;
  /** อนุญาตบล็อก 🔁 ทำซ้ำ (x2 / x3) */
  repeat?: boolean;
  /** โหมด: free = คิดเอง · trace = มีเส้นทางให้ดู เรียงคำสั่งตาม · debug = มีคำสั่งให้แล้ว 1 คำสั่งผิด ให้แก้ */
  mode?: "free" | "trace" | "debug";
  /** คำสั่งเริ่มต้น (โหมด debug) */
  preset?: Cmd[];
}
export type Cmd = { dir: Dir; times: number };
const ARROW: Record<Dir, string> = { up: "⬆️", down: "⬇️", left: "⬅️", right: "➡️" };
const DELTA: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const TILE = ["bg-mint-soft", "bg-sky-soft", "bg-yellow-soft", "bg-pink-soft"];

/**
 * 💻 เกมเดินตามคำสั่ง (Coding ไม่ต้องเขียนโค้ด) — เด็กเรียงคำสั่ง ⬆️➡️ ก่อน แล้วกด ▶️ ตัวละครค่อย ๆ เดินตาม
 * ผิดทาง = "🌱 ลองใหม่อีกครั้งนะ" ไม่ใช้คำว่าผิด · รองรับ 🔁 ทำซ้ำ, สิ่งกีดขวาง, โหมดดูเส้นทาง/แก้บั๊ก
 */
export function GridPathGame({ actor, goal, level, hint, timeLimit, onDone }: { actor: string; goal: string; level: GridLevel; hint?: string; timeLimit?: number; onDone?: (o: GameOutcome) => void }) {
  const [cmds, setCmds] = useState<Cmd[]>(level.preset ?? []);
  const [pos, setPos] = useState<[number, number]>(level.start);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState<number>(-1);
  const [done, setDone] = useState(false);
  const [tries, setTries] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [visited, setVisited] = useState<string[]>([]);
  const timer = useRef<number[]>([]);
  const mode = level.mode ?? "free";
  const maxCmds = level.maxCmds ?? 12;

  const restart = () => { timer.current.forEach(clearTimeout); setCmds(level.preset ?? []); setPos(level.start); setRunning(false); setStep(-1); setDone(false); setTries(0); setMsg(null); setVisited([]); };
  useEffect(restart, [level]); // eslint-disable-line react-hooks/exhaustive-deps

  const blocked = (c: number, r: number) => c < 0 || r < 0 || c >= level.size || r >= level.size || (level.obstacles ?? []).some(([oc, or]) => oc === c && or === r);
  const expanded = cmds.flatMap((c) => Array.from({ length: c.times }, () => c.dir));

  /** เส้นทางเฉลย (BFS) สำหรับโหมด trace */
  const solution = (() => {
    const q: [[number, number], Dir[]][] = [[level.start, []]]; const seen = new Set([level.start.join(",")]);
    while (q.length) { const [[c, r], p] = q.shift()!; if (c === level.target[0] && r === level.target[1]) return p; for (const d of ["up", "right", "down", "left"] as Dir[]) { const n: [number, number] = [c + DELTA[d][0], r + DELTA[d][1]]; if (blocked(n[0], n[1]) || seen.has(n.join(","))) continue; seen.add(n.join(",")); q.push([n, [...p, d]]); } }
    return [] as Dir[];
  })();
  const tracePath = (() => { const cells = [level.start.join(",")]; let [c, r] = level.start; for (const d of solution) { c += DELTA[d][0]; r += DELTA[d][1]; cells.push(`${c},${r}`); } return cells; })();

  const run = () => {
    if (running || expanded.length === 0) return;
    setRunning(true); setMsg(null); setVisited([]); let [c, r] = level.start; setPos([c, r]);
    timer.current.forEach(clearTimeout); timer.current = [];
    expanded.forEach((d, i) => {
      timer.current.push(window.setTimeout(() => {
        const nc = c + DELTA[d][0], nr = r + DELTA[d][1]; setStep(i);
        if (blocked(nc, nr)) { setRunning(false); setStep(-1); setTries((t) => t + 1); setMsg(`🌱 ลองใหม่อีกครั้งนะ ${actor} เดินไปทางไหนก่อนดี?`); timer.current.forEach(clearTimeout); return; }
        c = nc; r = nr; setPos([c, r]); setVisited((v) => [...v, `${c},${r}`]);
        if (i === expanded.length - 1) { setRunning(false); setStep(-1); if (c === level.target[0] && r === level.target[1]) setDone(true); else { setTries((t) => t + 1); setMsg(`💪 เกือบแล้ว! ${actor} ยังไปไม่ถึง ${goal} ลองเพิ่มหรือแก้คำสั่งดูนะ`); } }
      }, 450 * (i + 1)));
    });
  };
  const add = (dir: Dir) => { if (running || done) return; setCmds((cs) => { if (cs.length >= maxCmds) { setMsg(`ช่องคำสั่งเต็มแล้ว (${maxCmds}) ลองใช้ 🔁 ทำซ้ำ หรือลบคำสั่งที่ไม่จำเป็นออก`); return cs; } const last = cs[cs.length - 1]; if (level.repeat && last && last.dir === dir && last.times < 3) return [...cs.slice(0, -1), { dir, times: last.times + 1 }]; return [...cs, { dir, times: 1 }]; }); };
  const removeAt = (i: number) => !running && setCmds((cs) => cs.filter((_, j) => j !== i));
  const rotateAt = (i: number) => { if (running) return; const order: Dir[] = ["up", "right", "down", "left"]; setCmds((cs) => cs.map((c, j) => (j === i ? { ...c, dir: order[(order.indexOf(c.dir) + 1) % 4] } : c))); };
  const instruction = mode === "debug" ? `มีคำสั่ง 1 อันที่ทำให้ ${actor} ไปไม่ถึง ${goal} — แตะคำสั่งเพื่อเปลี่ยนทิศ แล้วกด ▶️` : mode === "trace" ? `ดูเส้นทางจุด ๆ แล้วเรียงคำสั่งให้ ${actor} เดินตามไปหา ${goal}` : hint ?? `คิดลำดับคำสั่งให้ ${actor} ไปหา ${goal} แล้วกด ▶️ เริ่ม`;

  return (
    <GameShell instruction={instruction} done={done} onRestart={restart} stats={`ลอง ${tries + 1} ครั้ง · ${expanded.length} ก้าว`} mistakes={tries} total={Math.max(3, solution.length)} timeLimit={timeLimit} onDone={onDone}>
      <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:justify-center lg:gap-8">
        {/* กระดาน */}
        <div className="grid gap-1 rounded-3xl bg-white p-2 shadow-soft ring-1 ring-line" style={{ gridTemplateColumns: `repeat(${level.size}, minmax(0, 1fr))`, width: "min(88vw, 380px)" }}>
          {Array.from({ length: level.size * level.size }, (_, i) => {
            const c = i % level.size, r = Math.floor(i / level.size); const key = `${c},${r}`;
            const isActor = pos[0] === c && pos[1] === r; const isGoal = level.target[0] === c && level.target[1] === r; const ob = (level.obstacles ?? []).some(([oc, or]) => oc === c && or === r);
            const onTrace = mode === "trace" && tracePath.includes(key) && !isGoal;
            return (
              <div key={i} className={cn("relative flex aspect-square items-center justify-center rounded-xl text-2xl sm:text-3xl", ob ? "bg-ink/80" : TILE[(c + r) % TILE.length], visited.includes(key) && !isActor && "ring-2 ring-inset ring-purple-300")}>
                {ob && "🌳"}{isGoal && !isActor && goal}
                {onTrace && !isActor && <span className="absolute size-2.5 rounded-full bg-purple-400/70" />}
                {isActor && <span className="animate-rise drop-shadow">{actor}</span>}
              </div>
            );
          })}
        </div>

        {/* คำสั่ง */}
        <div className="w-full max-w-sm">
          <p className="text-[13px] text-ink-soft">คำสั่ง ({expanded.length}/{maxCmds}){level.repeat && " · กดทิศเดิมซ้ำ = 🔁 ทำซ้ำ"}</p>
          <div className="mt-1 flex min-h-14 flex-wrap items-center gap-1.5 rounded-2xl border-2 border-dashed border-purple-200 bg-cream p-2">
            {cmds.length === 0 && <span className="px-1 text-[13px] text-ink-soft">แตะลูกศรด้านล่างเพื่อเพิ่มคำสั่ง →</span>}
            {cmds.map((c, i) => { const startIdx = cmds.slice(0, i).reduce((a, x) => a + x.times, 0); const active = step >= startIdx && step < startIdx + c.times; return (
              <span key={i} className={cn("group relative inline-flex items-center gap-0.5 rounded-xl bg-white px-2 py-1 text-[22px] shadow-soft transition", active && "scale-110 ring-2 ring-purple-500")}>
                <button type="button" onClick={() => (mode === "debug" ? rotateAt(i) : removeAt(i))} title={mode === "debug" ? "แตะเพื่อเปลี่ยนทิศ" : "แตะเพื่อลบ"} className="leading-none">{ARROW[c.dir]}</button>
                {c.times > 1 && <span className="rounded-full bg-purple-600 px-1.5 text-[11px] text-white">🔁×{c.times}</span>}
              </span>
            ); })}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            <span /><Arrow onClick={() => add("up")} disabled={running || done || mode === "debug"}>⬆️</Arrow><span />
            <Arrow onClick={() => add("left")} disabled={running || done || mode === "debug"}>⬅️</Arrow>
            <Arrow onClick={() => add("down")} disabled={running || done || mode === "debug"}>⬇️</Arrow>
            <Arrow onClick={() => add("right")} disabled={running || done || mode === "debug"}>➡️</Arrow>
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={run} disabled={running || done || expanded.length === 0} className="tap inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-purple-600 py-2.5 text-[16px] font-medium text-white shadow-soft hover:bg-purple-700 disabled:opacity-50"><Play size={18} fill="currentColor" /> เริ่ม</button>
            <button type="button" onClick={() => { timer.current.forEach(clearTimeout); setRunning(false); setStep(-1); setPos(level.start); setVisited([]); setMsg(null); }} disabled={done} className="tap rounded-full border border-line bg-white px-3 py-2.5 text-purple-700 hover:bg-purple-50" title="กลับจุดเริ่ม"><RotateCcw size={16} /></button>
            {mode !== "debug" && <button type="button" onClick={() => !running && setCmds([])} disabled={done} className="tap rounded-full border border-line bg-white px-3 py-2.5 text-red-500 hover:bg-red-50" title="ล้างคำสั่ง"><Trash2 size={16} /></button>}
          </div>
          {msg && <p className="mt-3 animate-rise rounded-xl bg-yellow-soft px-3 py-2 text-[14px]">{msg}</p>}
        </div>
      </div>
    </GameShell>
  );
}

const Arrow = ({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled: boolean }) => (
  <button type="button" onClick={onClick} disabled={disabled} className="tap grid h-14 place-items-center rounded-2xl border-4 border-purple-100 bg-white text-3xl shadow-soft transition active:scale-95 hover:border-purple-300 disabled:opacity-40">{children}</button>
);
