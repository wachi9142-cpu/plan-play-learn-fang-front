"use client";

import type { EngineExtras, GameConfig } from "@/types";
import { MemoryGame } from "./engines/MemoryGame";
import { OddOneOutGame } from "./engines/OddOneOutGame";
import { SortGame } from "./engines/SortGame";
import { ColorMatchGame } from "./engines/ColorMatchGame";
import { TilePuzzleGame } from "./engines/TilePuzzleGame";
import { PairColumnsGame } from "./engines/PairColumnsGame";
import { SlidingGame } from "./engines/SlidingGame";
import { GridPathGame } from "./engines/GridPathGame";
import { ConditionGame, DirectionGame, PatternGame, QuizGame } from "./engines/LogicGames";
import { CheckersGame, ConnectFourGame, HanoiGame, TicTacToeGame } from "./engines/BoardGames";
import { FlashMemoryGame } from "./engines/FlashMemoryGame";
import { WhackGame } from "./engines/WhackGame";
import { BlockJourneyGame } from "./engines/BlockJourneyGame";
import { DominoesGame } from "./engines/DominoesGame";
import { SnakesLaddersGame } from "./engines/SnakesLaddersGame";
import { TycoonGame } from "./engines/TycoonGame";
import { ColorPaintGame } from "./engines/ColorPaintGame";
import { CakeDecorGame } from "./engines/CakeDecorGame";
import { SortBasketGame } from "./engines/SortBasketGame";
import { DressUpGame } from "./engines/DressUpGame";
import { SpotDiffGame } from "./engines/SpotDiffGame";
import { ShadowQuizGame } from "./engines/ShadowQuizGame";
import { SceneBuilderGame } from "./engines/SceneBuilderGame";
import { HealthyFoodGame } from "./engines/HealthyFoodGame";
import { scenesFor } from "@/data/spot-diff-helpers";
import { IQGame } from "./engines/IQGame";
import { TraceLineGame } from "./engines/TraceLineGame";
import { SpellGame } from "./engines/SpellGame";
import { MathQuizGame } from "./engines/MathQuizGame";

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
    case "grid-path": return <GridPathGame actor={config.actor} goal={config.goal} hint={config.hint} level={config.levels[extras.level ?? "easy"]} {...x} />;
    case "direction": return <DirectionGame rounds={config.rounds} {...x} />;
    case "pattern": return <PatternGame rounds={config.rounds} {...x} />;
    case "condition": return <ConditionGame rounds={config.rounds} {...x} />;
    case "tic-tac-toe": return <TicTacToeGame marks={config.marks} {...x} />;
    case "connect-four": return <ConnectFourGame {...x} />;
    case "checkers": return <CheckersGame {...x} />;
    case "hanoi": return <HanoiGame discs={config.discs ?? 3} {...x} />;
    case "flash-memory": return <FlashMemoryGame pairs={config.pairs ?? 6} {...x} />;
    case "block-journey": return <BlockJourneyGame cols={config.cols} rows={config.rows} onDone={x.onDone} />;
    case "trace-line": {
      const lv = config.levels[extras.level ?? "easy"];
      return <TraceLineGame maze={{ size: lv.size, road: lv.road, path: lv.path, actor: config.actor, goal: config.goal }} {...x} />;
    }
    case "math-quiz": return <MathQuizGame mode={config.mode} count={config.count} {...x} />;
    case "spell": return <SpellGame count={config.count} maxLen={config.maxLen} {...x} />;
    case "iq": return <IQGame rounds={config.rounds} {...x} />;
    case "sort-basket": return <SortBasketGame rounds={config.rounds} pick={config.pick} {...x} />;
    case "dress-up": return <DressUpGame jobs={config.jobs} pickCount={config.pickCount} decoys={config.decoys} {...x} />;
    case "spot-diff": return <SpotDiffGame scenes={scenesFor(config.categoryId, config.diffs)} {...x} />;
    case "shadow-quiz": return <ShadowQuizGame categoryId={config.categoryId} choices={config.choices} count={config.count} tricky={config.tricky} {...x} />;
    case "cake-decor": return <CakeDecorGame onDone={x.onDone} />;
    case "scene-builder": return <SceneBuilderGame sceneId={config.sceneId} onDone={x.onDone} />;
    case "healthy-food": return <HealthyFoodGame count={config.count} {...x} />;
    case "color-paint": return <ColorPaintGame size={config.size} colors={config.colors} task={config.task} {...x} />;
    case "tycoon": return <TycoonGame level={config.level} rounds={config.rounds} onDone={x.onDone} />;
    case "snakes-ladders": return <SnakesLaddersGame onDone={x.onDone} />;
    case "dominoes": return <DominoesGame max={config.max ?? 6} onDone={x.onDone} />;
    case "whack": return <WhackGame items={config.items} prompt={config.prompt} holes={extras.holes} lifeMs={extras.lifeMs} gapMs={extras.gapMs} rounds={extras.rounds} {...x} />;
    case "quiz": return <QuizGame title={config.title} rounds={config.rounds} {...x} />;
    case "sliding": return <SlidingGame items={config.items} size={config.size ?? 3} theme={config.theme} scramble={extras.scramble ?? 6} {...x} />;
    case "color-pair":
      return (
        <PairColumnsGame
          pairs={config.pairs}
          instruction={{ idle: "แตะสีทางซ้ายก่อน แล้วแตะของที่มีสีนั้น", picked: (l) => `เลือก ${l} แล้ว → หาของที่มีสีนี้` }}
          {...x}
        />
      );
    case "gray-match":
      return (
        <PairColumnsGame
          pairs={config.items.map((i) => ({ left: i.emoji, right: i.emoji, label: i.label }))}
          grayRight
          instruction={{ idle: "แตะภาพสีก่อน แล้วแตะภาพขาวดำที่เป็นสิ่งเดียวกัน", picked: (l) => `เลือก ${l} แล้ว → หาภาพขาวดำของมัน` }}
          {...x}
        />
      );
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
