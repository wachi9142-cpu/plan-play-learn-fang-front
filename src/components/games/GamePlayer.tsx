"use client";

import type { GameConfig } from "@/types";
import { MemoryGame } from "./engines/MemoryGame";
import { OddOneOutGame } from "./engines/OddOneOutGame";
import { SortGame } from "./engines/SortGame";
import { ColorMatchGame } from "./engines/ColorMatchGame";
import { TilePuzzleGame } from "./engines/TilePuzzleGame";
import { PairColumnsGame } from "./engines/PairColumnsGame";

/** ตัวเลือก engine จาก config — เพิ่ม engine ใหม่ที่นี่ที่เดียว */
export function GamePlayer({ config }: { config: GameConfig }) {
  switch (config.engine) {
    case "memory": return <MemoryGame pairs={config.pairs} />;
    case "odd-one-out": return <OddOneOutGame rounds={config.rounds} />;
    case "sort": return <SortGame rounds={config.rounds} />;
    case "color-match": return <ColorMatchGame rounds={config.rounds} />;
    case "tile-puzzle": return <TilePuzzleGame scene={config.scene} size={config.size} />;
    case "pair-columns": return <PairColumnsGame pairs={config.pairs} />;
  }
}
