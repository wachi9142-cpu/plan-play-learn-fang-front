"use client";

import type { EngineExtras, GameConfig } from "@/types";
import { MemoryGame } from "./engines/MemoryGame";
import { OddOneOutGame } from "./engines/OddOneOutGame";
import { SortGame } from "./engines/SortGame";
import { ColorMatchGame } from "./engines/ColorMatchGame";
import { TilePuzzleGame } from "./engines/TilePuzzleGame";
import { PairColumnsGame } from "./engines/PairColumnsGame";
import { SlidingGame } from "./engines/SlidingGame";

/** ตัวเลือก engine จาก config — เพิ่ม engine ใหม่ที่นี่ที่เดียว · extras มาจากระดับความยาก (เวลา/ตัวช่วย/ผลลัพธ์) */
export function GamePlayer({ config, extras = {} }: { config: GameConfig; extras?: EngineExtras }) {
  const x = { timeLimit: extras.timeLimit, onDone: extras.onDone };
  switch (config.engine) {
    case "memory": return <MemoryGame pairs={config.pairs} {...x} />;
    case "odd-one-out": return <OddOneOutGame rounds={config.rounds} {...x} />;
    case "sort": return <SortGame rounds={config.rounds} {...x} />;
    case "color-match": return <ColorMatchGame rounds={config.rounds} {...x} />;
    case "tile-puzzle": return <TilePuzzleGame scene={config.scene} size={config.size} hints={extras.hints} {...x} />;
    case "pair-columns": return <PairColumnsGame pairs={config.pairs} {...x} />;
    case "sliding": return <SlidingGame items={config.items} size={config.size ?? 3} theme={config.theme} scramble={extras.scramble ?? 6} {...x} />;
    case "shadow-match":
      return (
        <PairColumnsGame
          pairs={config.items.map((i) => ({ left: i.emoji, right: i.emoji, label: i.label }))}
          shadowRight
          instruction={{ idle: "แตะรูปก่อน แล้วแตะเงาที่เหมือนกัน", picked: (l) => `เลือก ${l} แล้ว → แตะเงาของมัน` }}
          {...x}
        />
      );
  }
}
