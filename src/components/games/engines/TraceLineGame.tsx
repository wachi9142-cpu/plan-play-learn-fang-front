"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell, type GameOutcome } from "@/components/games/GameShell";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;

export interface TraceMaze {
  /** ขนาดตาราง */
  size: number;
  /** ช่องที่เป็นถนนทั้งหมด (รวมทางตัน) */
  road: [number, number][];
  /** เส้นทางที่ถูกต้อง ตั้งแต่จุดเริ่มถึงปลายทาง */
  path: [number, number][];
  actor: string;
  goal: string;
}

/** ตัวชี้เป็นดินสอ — เหมือนเด็กจับดินสอลากเส้นบนกระดาษ */
const PENCIL_CURSOR =
  "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"44\" height=\"44\"><text y=\"34\" font-size=\"34\">✏️</text></svg>') 4 40, crosshair";

/**
 * ✏️ เกมลากเส้นในเขาวงกต — กดค้างที่ตัวละครแล้วลากไปตามถนนจนถึงปลายทาง
 * ระดับยากขึ้น = ถนนเยอะขึ้นและมี "ทางตัน" ให้หลงมากขึ้น ต้องย้อนกลับมาหาทางใหม่
 * ฝึกกล้ามเนื้อมัดเล็ก การควบคุมมือ และการวางแผนเส้นทาง
 */
export function TraceLineGame({ maze, timeLimit, onDone }: { maze: TraceMaze; timeLimit?: number; onDone?: Cb }) {
  const { size, road, path, actor, goal } = maze;
  const k = (c: number, r: number) => `${c},${r}`;

  const roadSet = new Set(road.map(([c, r]) => k(c, r)));
  const pathIndex = new Map(path.map(([c, r], i) => [k(c, r), i]));
  const start = path[0];
  const end = path[path.length - 1];

  const [pos, setPos] = useState<[number, number]>(start);
  const [drawn, setDrawn] = useState<string[]>([k(start[0], start[1])]);
  const [drawing, setDrawing] = useState(false);
  const [slips, setSlips] = useState(0);
  const [warn, setWarn] = useState(false);
  const [done, setDone] = useState(false);
  const posRef = useRef<[number, number]>(start);
  useEffect(() => { posRef.current = pos; }, [pos]);

  const restart = useCallback(() => {
    setPos(start); posRef.current = start;
    setDrawn([k(start[0], start[1])]);
    setDrawing(false); setSlips(0); setWarn(false); setDone(false);
  }, [maze]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { restart(); }, [restart]);

  const enter = (c: number, r: number) => {
    if (!drawing || done) return;
    const [px, py] = posRef.current;
    const adjacent = Math.abs(px - c) + Math.abs(py - r) === 1;
    if (!adjacent) return;                       // ข้ามช่องไม่ได้ ต้องลากติดกัน
    if (!roadSet.has(k(c, r))) {
      // ชนกำแพง — เตือนเบา ๆ ไม่ต้องเริ่มใหม่ เด็กจะได้ไม่ท้อ
      setSlips((n) => n + 1);
      setWarn(true);
      setTimeout(() => setWarn(false), 400);
      return;
    }
    posRef.current = [c, r];
    setPos([c, r]);
    setDrawn((d) => {
      // ลากย้อนกลับ = ลบรอยเส้นช่องเดิมออก (เหมือนถอยดินสอ)
      if (d.length >= 2 && d[d.length - 2] === k(c, r)) return d.slice(0, -1);
      return d.includes(k(c, r)) ? d : [...d, k(c, r)];
    });
    if (c === end[0] && r === end[1]) { setDone(true); setDrawing(false); }
  };

  const onPath = pathIndex.get(k(pos[0], pos[1]));
  const progress = onPath ?? 0;

  return (
    <GameShell
      instruction={
        done ? `🎉 เก่งมาก! พา ${actor} ถึง ${goal} แล้ว`
          : drawing ? (warn ? "⚠️ ชนกำแพงแล้ว — ลากกลับมาบนถนนนะ" : "ลากต่อไปเรื่อย ๆ ถ้าเจอทางตันให้ถอยกลับมาหาทางใหม่")
          : `✏️ กดค้างที่ ${actor} แล้วลากไปตามถนนจนถึง ${goal}`
      }
      progress={{ current: progress, total: path.length - 1 }}
      done={done}
      onRestart={restart}
      stats={`เดินแล้ว ${drawn.length} ช่อง${slips > 0 ? ` · ชนกำแพง ${slips} ครั้ง` : ""}`}
      mistakes={slips}
      total={Math.max(path.length, 10)}
      timeLimit={timeLimit}
      onDone={onDone}
    >
      <div
        className="mx-auto grid touch-none select-none gap-[2px] rounded-3xl bg-[#9ad6a8] p-2 shadow-soft"
        style={{
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          width: "min(90vw, 430px)",
          cursor: done ? "default" : PENCIL_CURSOR,
        }}
        onPointerUp={() => setDrawing(false)}
        onPointerLeave={() => setDrawing(false)}
      >
        {Array.from({ length: size * size }, (_, i) => {
          const c = i % size, r = Math.floor(i / size);
          const isRoad = roadSet.has(k(c, r));
          const isDrawn = drawn.includes(k(c, r));
          const isStart = c === start[0] && r === start[1];
          const isEnd = c === end[0] && r === end[1];
          const isHead = c === pos[0] && r === pos[1];
          return (
            <div
              key={i}
              onPointerDown={(e) => {
                e.preventDefault();
                if (done) return;
                if (isStart) { setDrawing(true); posRef.current = start; setPos(start); setDrawn([k(start[0], start[1])]); }
              }}
              onPointerEnter={() => enter(c, r)}
              className={cn(
                "relative grid aspect-square place-items-center rounded-[3px] text-[clamp(0.7rem,3.4vw,1.4rem)] transition-colors",
                isRoad ? "bg-[#4a4a55]" : "bg-[#7cc78c]",
                isDrawn && "bg-purple-400!",
                isStart && "bg-mint-soft!",
                isEnd && "bg-yellow-soft!",
              )}
            >
              {isStart && <span className="drop-shadow">{actor}</span>}
              {isEnd && <span className="drop-shadow">{goal}</span>}
              {isHead && !isStart && !isEnd && <span className="absolute text-[clamp(0.7rem,3.2vw,1.2rem)]">✏️</span>}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-center text-[13px] leading-relaxed text-ink-soft">
        ✏️ กดค้างที่ {actor} แล้วลากนิ้ว (หรือเมาส์) ไปตามถนนสีเทา · ลากย้อนกลับได้ถ้าเจอทางตัน
        <br />
        🟢 ง่าย ทางตันน้อย · 🟡 ปานกลาง ทางแยกมากขึ้น · 🔴 ยาก ถนนเยอะและทางตันเพียบ
      </p>
    </GameShell>
  );
}
