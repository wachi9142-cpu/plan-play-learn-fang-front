import type { Scene } from "@/components/games/engines/SpotDiffGame";

/**
 * 👀 ฉากสำหรับเกมจับผิดภาพ
 *
 * แต่ละฉากวางของเป็นเปอร์เซ็นต์ของกรอบภาพ (x = ซ้าย-ขวา, y = บน-ล่าง, size = ขนาดตัวอักษร %)
 * ภาพขวาสร้างจากภาพซ้าย + รายการใน diffs — จึงการันตีว่าต่างกันตรงจุดที่กำหนดเสมอ
 *
 * เพิ่มฉากใหม่ = เพิ่ม 1 object ในหมวดที่ใช่ · ครูเพิ่มเองได้ที่ /admin/spot-diff
 */

export interface SpotCategory {
  id: string;
  emoji: string;
  label: string;
  labelEn: string;
  hint: string;
  tint: string;
  scenes: Scene[];
}

const sky = { day: "#cbeafb", sunset: "#ffd9b8", sea: "#9fd8ef", room: "#fdeccd", night: "#2f2550" };
const ground = { grass: "#9ad6a8", sand: "#f5e3b8", floor: "#e7d2b0", water: "#5fb6d9", wood: "#d8b982" };

export const SPOT_CATEGORIES: SpotCategory[] = [
  {
    id: "zoo",
    emoji: "🦁",
    label: "สวนสัตว์",
    labelEn: "At the Zoo",
    hint: "สัตว์ในสวนสัตว์ ลองดูว่าตัวไหนเปลี่ยนไป",
    tint: "bg-yellow-soft",
    scenes: [
      {
        id: "zoo-1", title: "สวนสัตว์ตอนเช้า", titleEn: "Zoo in the Morning",
        sky: sky.day, ground: ground.grass,
        items: [
          { emoji: "☀️", x: 86, y: 14, size: 320 },
          { emoji: "☁️", x: 24, y: 16, size: 300 },
          { emoji: "🦁", x: 22, y: 72, size: 420 },
          { emoji: "🐘", x: 52, y: 70, size: 440 },
          { emoji: "🦒", x: 78, y: 66, size: 420 },
          { emoji: "🌳", x: 10, y: 48, size: 340 },
          { emoji: "🌳", x: 92, y: 48, size: 340 },
          { emoji: "🌻", x: 38, y: 88, size: 240 },
          { emoji: "🦋", x: 64, y: 40, size: 220 },
        ],
        diffs: [{ index: 2, to: "🐯" }, { index: 4, hide: true }, { index: 7, to: "🌷" }],
      },
      {
        id: "zoo-2", title: "สวนสัตว์ตอนเย็น", titleEn: "Zoo in the Evening",
        sky: sky.sunset, ground: ground.grass,
        items: [
          { emoji: "🌇", x: 84, y: 16, size: 320 },
          { emoji: "🐼", x: 20, y: 70, size: 420 },
          { emoji: "🐧", x: 42, y: 76, size: 340 },
          { emoji: "🦓", x: 66, y: 70, size: 420 },
          { emoji: "🦜", x: 88, y: 40, size: 260 },
          { emoji: "🌴", x: 10, y: 46, size: 360 },
          { emoji: "🪣", x: 54, y: 90, size: 220 },
          { emoji: "🐢", x: 32, y: 90, size: 240 },
        ],
        diffs: [{ index: 2, to: "🐥" }, { index: 4, hide: true }, { index: 6, to: "🧺" }, { index: 3, grow: 1.3 }],
      },
    ],
  },
  {
    id: "classroom",
    emoji: "🏫",
    label: "ในห้องเรียน",
    labelEn: "In the Classroom",
    hint: "ห้องเรียนของเรา ของบางอย่างหายหรือเปลี่ยนไป",
    tint: "bg-purple-100",
    scenes: [
      {
        id: "class-1", title: "ห้องเรียนตอนเช้า", titleEn: "Classroom Morning",
        sky: sky.room, ground: ground.floor,
        items: [
          { emoji: "🪧", x: 24, y: 28, size: 380 },
          { emoji: "🕐", x: 80, y: 20, size: 260 },
          { emoji: "👩‍🏫", x: 18, y: 66, size: 400 },
          { emoji: "🧒", x: 48, y: 72, size: 360 },
          { emoji: "👧", x: 68, y: 72, size: 360 },
          { emoji: "📚", x: 88, y: 76, size: 300 },
          { emoji: "✏️", x: 38, y: 90, size: 240 },
          { emoji: "🎒", x: 60, y: 92, size: 260 },
        ],
        diffs: [{ index: 1, to: "🕔" }, { index: 4, hide: true }, { index: 6, to: "🖍️" }],
      },
      {
        id: "class-2", title: "มุมหนังสือ", titleEn: "Book Corner",
        sky: sky.room, ground: ground.wood,
        items: [
          { emoji: "📖", x: 26, y: 66, size: 400 },
          { emoji: "🧸", x: 52, y: 70, size: 400 },
          { emoji: "🪴", x: 78, y: 64, size: 340 },
          { emoji: "🖼️", x: 20, y: 26, size: 300 },
          { emoji: "🪟", x: 72, y: 26, size: 320 },
          { emoji: "🧦", x: 40, y: 90, size: 220 },
          { emoji: "🐱", x: 88, y: 84, size: 280 },
          { emoji: "🎈", x: 58, y: 24, size: 260 },
        ],
        diffs: [{ index: 1, to: "🐰" }, { index: 5, hide: true }, { index: 7, to: "⭐" }, { index: 2, grow: 1.35 }],
      },
    ],
  },
  {
    id: "sea",
    emoji: "🐠",
    label: "ใต้ทะเล",
    labelEn: "Under the Sea",
    hint: "โลกใต้ทะเล ปลาตัวไหนเปลี่ยนไป",
    tint: "bg-sky-soft",
    scenes: [
      {
        id: "sea-1", title: "ใต้ทะเลสดใส", titleEn: "Bright Sea",
        sky: sky.sea, ground: ground.water,
        items: [
          { emoji: "🐠", x: 24, y: 34, size: 380 },
          { emoji: "🐟", x: 56, y: 26, size: 340 },
          { emoji: "🐙", x: 78, y: 56, size: 400 },
          { emoji: "🐢", x: 34, y: 66, size: 380 },
          { emoji: "🪸", x: 14, y: 84, size: 320 },
          { emoji: "🐚", x: 48, y: 90, size: 240 },
          { emoji: "⭐", x: 68, y: 86, size: 260 },
          { emoji: "🫧", x: 88, y: 24, size: 220 },
        ],
        diffs: [{ index: 1, to: "🦈" }, { index: 6, hide: true }, { index: 4, to: "🌿" }],
      },
      {
        id: "sea-2", title: "ชายหาดแสนสนุก", titleEn: "Fun at the Beach",
        sky: sky.day, ground: ground.sand,
        items: [
          { emoji: "☀️", x: 84, y: 14, size: 320 },
          { emoji: "⛱️", x: 24, y: 58, size: 420 },
          { emoji: "🏖️", x: 56, y: 62, size: 380 },
          { emoji: "🦀", x: 40, y: 88, size: 280 },
          { emoji: "🐚", x: 70, y: 90, size: 240 },
          { emoji: "⛵", x: 86, y: 44, size: 300 },
          { emoji: "🪁", x: 14, y: 22, size: 260 },
          { emoji: "🧺", x: 60, y: 86, size: 240 },
        ],
        diffs: [{ index: 3, to: "🐠" }, { index: 5, hide: true }, { index: 6, to: "🎈" }, { index: 1, grow: 1.25 }],
      },
    ],
  },
  {
    id: "garden",
    emoji: "🌼",
    label: "สวนดอกไม้",
    labelEn: "Flower Garden",
    hint: "สวนดอกไม้และแมลงตัวเล็ก ๆ",
    tint: "bg-mint-soft",
    scenes: [
      {
        id: "garden-1", title: "สวนดอกไม้บาน", titleEn: "Blooming Garden",
        sky: sky.day, ground: ground.grass,
        items: [
          { emoji: "🌻", x: 18, y: 70, size: 400 },
          { emoji: "🌷", x: 40, y: 76, size: 360 },
          { emoji: "🌺", x: 62, y: 72, size: 380 },
          { emoji: "🌹", x: 84, y: 76, size: 360 },
          { emoji: "🐝", x: 30, y: 36, size: 240 },
          { emoji: "🦋", x: 70, y: 32, size: 260 },
          { emoji: "☁️", x: 16, y: 18, size: 300 },
          { emoji: "🐞", x: 52, y: 92, size: 220 },
        ],
        diffs: [{ index: 1, to: "🌼" }, { index: 5, hide: true }, { index: 7, to: "🐌" }],
      },
    ],
  },
];

export const findSpotCategory = (id: string) => SPOT_CATEGORIES.find((c) => c.id === id);
export const allScenes = () => SPOT_CATEGORIES.flatMap((c) => c.scenes);
export const sceneCount = () => allScenes().length;
