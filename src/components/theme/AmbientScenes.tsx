"use client";

/**
 * ✨ ตัวแสดงผลของเอฟเฟกต์บรรยากาศแต่ละแบบ
 *
 * เพิ่มเอฟเฟกต์ใหม่ = เพิ่ม component ที่นี่ + ลงทะเบียนใน SCENES ด้านล่าง
 * + เพิ่ม 1 บรรทัดในทะเบียน src/lib/ambient-effects.ts
 *
 * ทุกฉากปรับสี/ความสว่าง/glow ตามธีมอัตโนมัติผ่าน CSS (html[data-theme="dark"])
 * ไม่มีฉากไหนที่ใช้ได้เฉพาะโหมดใดโหมดหนึ่ง
 */

import { useEffect, useState } from "react";
import { Snowflake } from "./Snowflake";

/** เลขสุ่มแบบคงที่ (ฝั่งเซิร์ฟเวอร์กับเบราว์เซอร์ตรงกัน แต่ยังดูสุ่มเป็นธรรมชาติ) */
const rnd = (i: number, n: number) => (Math.sin((i + 1) * n) + 1) / 2;

/* ================= ❄️ หิมะ ================= */

const FLAKES = Array.from({ length: 26 }, (_, i) => ({
  left: +(rnd(i, 12.9898) * 100).toFixed(2),
  size: +(4 + rnd(i, 78.233) * 7).toFixed(2),
  fall: +(11 + rnd(i, 43.123) * 12).toFixed(2),
  delay: +(-rnd(i, 93.719) * 22).toFixed(2),
  drift: +(6 + rnd(i, 27.611) * 26).toFixed(2),
  sway: +(3 + rnd(i, 61.077) * 4).toFixed(2),
  opacity: +(0.55 + rnd(i, 11.337) * 0.4).toFixed(2),
  spin: +(9 + rnd(i, 55.281) * 12).toFixed(2),
  tone: (i % 4) as 0 | 1 | 2 | 3,
  kind: (i % 3) as 0 | 1 | 2,
  far: i % 5 === 2,
}));

const SIZE_BOOST = [0, 6, 11] as const;

export function Snow({ count = FLAKES.length }: { count?: number }) {
  return (
    <>
      {FLAKES.slice(0, count).map((f, i) => (
        <span key={i} className="fx-fall" style={{ left: `${f.left}%`, animationDuration: `${f.fall}s`, animationDelay: `${f.delay}s` }}>
          <span
            className={["fx-sway", f.kind === 0 ? `snow-dot snow-tone-${f.tone}` : "snow-crystal", f.far ? "fx-far" : ""].filter(Boolean).join(" ")}
            style={{
              width: `${f.size + SIZE_BOOST[f.kind]}px`,
              height: `${f.size + SIZE_BOOST[f.kind]}px`,
              opacity: f.kind === 0 ? f.opacity : Math.min(0.95, f.opacity + 0.12),
              animationDuration: `${f.sway}s`,
              ["--drift" as string]: `${f.drift}px`,
            }}
          >
            {f.kind === 1 && <Snowflake id={String(i)} className="fx-spin block size-full" style={{ animationDuration: `${f.spin}s` }} />}
            {f.kind === 2 && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/winter/flake.webp" alt="" className="fx-spin snow-flake-img block size-full" style={{ animationDuration: `${f.spin}s` }} />
            )}
          </span>
        </span>
      ))}
    </>
  );
}

function Winter() {
  return <Snow />;
}

/* ================= 🌸 ซากุระ ================= */

const PETALS = Array.from({ length: 18 }, (_, i) => ({
  left: +(rnd(i, 24.113) * 100).toFixed(2),
  size: +(9 + rnd(i, 51.907) * 9).toFixed(2),
  fall: +(13 + rnd(i, 36.441) * 12).toFixed(2),
  delay: +(-rnd(i, 71.229) * 24).toFixed(2),
  drift: +(18 + rnd(i, 19.773) * 34).toFixed(2),
  sway: +(3.5 + rnd(i, 88.019) * 4).toFixed(2),
  spin: +(4 + rnd(i, 45.331) * 6).toFixed(2),
  opacity: +(0.6 + rnd(i, 13.887) * 0.35).toFixed(2),
  tone: (i % 3) as 0 | 1 | 2,
  far: i % 6 === 1,
  bloom: i % 4 === 1 ? (["a", "b", "c"] as const)[i % 3] : null,
}));

const PETAL_COLORS = [
  ["#ffffff", "#ffc2d6"],
  ["#fff0f5", "#f2a1bd"],
  ["#f6f0fc", "#d9c3f1"],
];

function Sakura() {
  return (
    <>
      {PETALS.map((p, i) => (
        <span key={i} className="fx-fall" style={{ left: `${p.left}%`, animationDuration: `${p.fall}s`, animationDelay: `${p.delay}s` }}>
          <span
            className={`fx-sway ${p.far ? "fx-far" : ""}`}
            style={{ width: `${p.size + (p.bloom ? 10 : 0)}px`, height: `${p.size + (p.bloom ? 10 : 0)}px`, opacity: p.opacity, animationDuration: `${p.sway}s`, ["--drift" as string]: `${p.drift}px` }}
          >
            {p.bloom ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/sakura/bloom-${p.bloom}.webp`} alt="" className="fx-spin fx-bloom-img block size-full" style={{ animationDuration: `${p.spin}s` }} />
            ) : (
              <svg viewBox="0 0 24 24" className="fx-spin fx-petal block size-full" style={{ animationDuration: `${p.spin}s` }}>
                <defs>
                  <linearGradient id={`pt-${i}`} x1="20%" y1="0%" x2="80%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="45%" stopColor={PETAL_COLORS[p.tone][0]} />
                    <stop offset="100%" stopColor={PETAL_COLORS[p.tone][1]} />
                  </linearGradient>
                </defs>
                <path d="M12 1.6c4 4 7.2 8.8 7.2 13 0 3.1-1.6 5.6-4.2 6.9L12 17.2l-3 4.3c-2.6-1.3-4.2-3.8-4.2-6.9 0-4.2 3.2-9 7.2-13Z" fill={`url(#pt-${i})`} />
              </svg>
            )}
          </span>
        </span>
      ))}
    </>
  );
}

/* ================= 🍂 ใบไม้ร่วง ================= */

const LEAVES = Array.from({ length: 16 }, (_, i) => ({
  left: +(rnd(i, 31.517) * 100).toFixed(2),
  size: +(12 + rnd(i, 64.209) * 11).toFixed(2),
  fall: +(14 + rnd(i, 22.881) * 13).toFixed(2),
  delay: +(-rnd(i, 57.443) * 26).toFixed(2),
  drift: +(22 + rnd(i, 40.119) * 38).toFixed(2),
  sway: +(4 + rnd(i, 29.663) * 4).toFixed(2),
  spin: +(3.5 + rnd(i, 76.551) * 5).toFixed(2),
  opacity: +(0.65 + rnd(i, 15.223) * 0.3).toFixed(2),
  tone: (i % 3) as 0 | 1 | 2,
  far: i % 5 === 3,
  photo: i % 3 === 2 ? (["a", "b", "c"] as const)[Math.floor(i / 3) % 3] : null,
}));

const LEAF_COLORS = [
  ["#fff0b8", "#e8b52e"],
  ["#ffe08a", "#d99a1f"],
  ["#ffc59b", "#d9542e"],
];

function Leaves({ count = LEAVES.length }: { count?: number }) {
  return (
    <>
      {LEAVES.slice(0, count).map((l, i) => (
        <span key={i} className="fx-fall" style={{ left: `${l.left}%`, animationDuration: `${l.fall}s`, animationDelay: `${l.delay}s` }}>
          <span
            className={`fx-sway ${l.far ? "fx-far" : ""}`}
            style={{ width: `${l.size + (l.photo ? 5 : 0)}px`, height: `${l.size + (l.photo ? 5 : 0)}px`, opacity: l.opacity, animationDuration: `${l.sway}s`, ["--drift" as string]: `${l.drift}px` }}
          >
            {l.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/autumn/leaf-${l.photo}.webp`} alt="" className="fx-spin fx-leaf-img block size-full" style={{ animationDuration: `${l.spin}s` }} />
            ) : (
              <svg viewBox="0 0 24 24" className="fx-spin fx-leaf block size-full" style={{ animationDuration: `${l.spin}s` }}>
                <defs>
                  <linearGradient id={`lf-${i}`} x1="10%" y1="0%" x2="90%" y2="100%">
                    <stop offset="0%" stopColor={LEAF_COLORS[l.tone][0]} />
                    <stop offset="100%" stopColor={LEAF_COLORS[l.tone][1]} />
                  </linearGradient>
                </defs>
                <path d="M12 14.6c-4.7 0-8.4-1.7-8.4-3.9C3.6 6.9 7.5 3 11 2.1l1 3.6 1-3.6c3.5.9 7.4 4.8 7.4 8.6 0 2.2-3.7 3.9-8.4 3.9Z" fill={`url(#lf-${i})`} />
                <path d="M12 14.4v7.2" stroke={LEAF_COLORS[l.tone][1]} strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            )}
          </span>
        </span>
      ))}
    </>
  );
}

function Autumn() {
  return <Leaves />;
}

/* ================= 🌠 แสงดาว ================= */

const STARS = Array.from({ length: 16 }, (_, i) => ({
  left: +(rnd(i, 17.331) * 96 + 2).toFixed(2),
  top: +(rnd(i, 53.117) * 88 + 2).toFixed(2),
  size: +(6 + rnd(i, 39.907) * 8).toFixed(2),
  beat: +(2.4 + rnd(i, 82.311) * 3).toFixed(2),
  delay: +(-rnd(i, 66.007) * 6).toFixed(2),
  tone: (i % 5) as 0 | 1 | 2 | 3 | 4,
}));

const SHOOTS = [
  { top: 8, left: 62, len: 120, gap: 9, delay: 1.2, tone: 0 },
  { top: 26, left: 84, len: 150, gap: 13, delay: 5.5, tone: 1 },
  { top: 48, left: 40, len: 100, gap: 17, delay: 10.5, tone: 2 },
];

const SPARKS = [
  { top: 18, left: 30, dur: 11, delay: 3 },
  { top: 58, left: 72, dur: 13, delay: 8 },
  { top: 76, left: 18, dur: 12, delay: 14 },
];

/** สีดาว: ตัวแปร CSS ปรับตามธีมเอง (โหมดสว่างใช้โทนม่วง/ฟ้าให้เห็นชัด) */
const STAR_VARS = ["--star-0", "--star-1", "--star-2", "--star-3", "--star-4"];

export function Moon({ className = "fx-moon" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <defs>
        <linearGradient id="fx-moon-g" x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#fff6da" />
          <stop offset="100%" stopColor="#f7d35a" />
        </linearGradient>
      </defs>
      <path d="M26 4a16 16 0 1 0 10 28A18 18 0 0 1 26 4Z" fill="url(#fx-moon-g)" />
    </svg>
  );
}

export function TwinkleStars({ count = STARS.length }: { count?: number }) {
  return (
    <>
      {STARS.slice(0, count).map((s, i) => (
        <span
          key={i}
          className="fx-star"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.size}px`, height: `${s.size}px`, animationDuration: `${s.beat}s`, animationDelay: `${s.delay}s` }}
        >
          <Sparkle color={`var(${STAR_VARS[s.tone]})`} />
        </span>
      ))}
    </>
  );
}

function Starlight() {
  return (
    <>
      <Moon />
      <TwinkleStars />
      {SHOOTS.map((s, i) => (
        <span
          key={i}
          className="fx-shoot"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            ["--tail" as string]: `${s.len}px`,
            ["--hue" as string]: `var(${STAR_VARS[s.tone]})`,
            animationDuration: `${s.gap}s`,
            animationDelay: `${s.delay}s`,
          }}
        >
          <span className="fx-shoot-tail" />
          <span className="fx-shoot-head"><Sparkle color={`var(${STAR_VARS[s.tone]})`} /></span>
        </span>
      ))}
      {SPARKS.map((p, i) => (
        <span key={i} className="fx-bloom" style={{ top: `${p.top}%`, left: `${p.left}%`, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}>
          <Flower />
        </span>
      ))}
    </>
  );
}

/* ================= 🌧️ ฝนตกเบา ๆ ================= */

const DROPS = Array.from({ length: 34 }, (_, i) => ({
  left: +(rnd(i, 14.771) * 100).toFixed(2),
  len: +(10 + rnd(i, 58.117) * 16).toFixed(2),
  fall: +(1.1 + rnd(i, 37.229) * 1.5).toFixed(2),
  delay: +(-rnd(i, 91.443) * 3).toFixed(2),
  opacity: +(0.55 + rnd(i, 26.881) * 0.4).toFixed(2),
  far: i % 4 === 1,
}));

const RIPPLES = [
  { left: 18, bottom: 6, dur: 4.5, delay: 0.6 },
  { left: 52, bottom: 12, dur: 5.5, delay: 2.1 },
  { left: 78, bottom: 4, dur: 6, delay: 3.4 },
  { left: 36, bottom: 18, dur: 5, delay: 4.7 },
];

function Rainy() {
  return (
    <>
      {DROPS.map((d, i) => (
        <span
          key={i}
          className={`fx-drop ${d.far ? "fx-far" : ""}`}
          style={{ left: `${d.left}%`, height: `${d.len}px`, opacity: d.opacity, animationDuration: `${d.fall}s`, animationDelay: `${d.delay}s` }}
        />
      ))}
      {RIPPLES.map((r, i) => (
        <span key={i} className="fx-ripple" style={{ left: `${r.left}%`, bottom: `${r.bottom}%`, animationDuration: `${r.dur}s`, animationDelay: `${r.delay}s` }} />
      ))}
    </>
  );
}

/* ================= 🌼 ดอกไม้ผลิบาน ================= */

const BLOOMS = Array.from({ length: 13 }, (_, i) => ({
  left: +(rnd(i, 21.917) * 92 + 4).toFixed(2),
  top: +(rnd(i, 48.233) * 84 + 8).toFixed(2),
  size: +(16 + rnd(i, 63.119) * 14).toFixed(2),
  dur: +(9 + rnd(i, 35.771) * 7).toFixed(2),
  delay: +(-rnd(i, 72.113) * 14).toFixed(2),
  tone: (i % 4) as 0 | 1 | 2 | 3,
  leaf: i % 3 === 0,
}));

const BLOOM_COLORS = ["--bloom-0", "--bloom-1", "--bloom-2", "--bloom-3"];

function Spring() {
  return (
    <>
      {BLOOMS.map((b, i) => (
        <span
          key={i}
          className="fx-grow"
          style={{ left: `${b.left}%`, top: `${b.top}%`, width: `${b.size}px`, height: `${b.size}px`, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
        >
          {b.leaf ? <Leaf /> : <Flower petal={`var(${BLOOM_COLORS[b.tone]})`} />}
        </span>
      ))}
    </>
  );
}

/* ================= 🦋 ผีเสื้อ ================= */

/** ผีเสื้อ 8 ตัว 8 สี — เส้นทาง ความสูง ความเร็ว และจังหวะออกมาต่างกันทุกตัว */
const BUTTERFLIES: { top: number; size: number; dur: number; gap: number; delay: number; dir: 1 | -1; tone: number; photo?: "a" | "b" }[] = [
  { top: 18, size: 26, dur: 13, gap: 24, delay: 2, dir: 1, tone: 0 },
  { top: 52, size: 20, dur: 17, gap: 31, delay: 7, dir: -1, tone: 1 },
  { top: 70, size: 30, dur: 15, gap: 27, delay: 12, dir: 1, tone: 2, photo: "a" },
  { top: 34, size: 22, dur: 19, gap: 35, delay: 17, dir: -1, tone: 3 },
  { top: 62, size: 24, dur: 14, gap: 29, delay: 22, dir: 1, tone: 4 },
  { top: 48, size: 34, dur: 16, gap: 30, delay: 25, dir: -1, tone: 3, photo: "b" },
  { top: 26, size: 18, dur: 21, gap: 37, delay: 28, dir: -1, tone: 5 },
  { top: 80, size: 28, dur: 16, gap: 26, delay: 33, dir: 1, tone: 6 },
  { top: 44, size: 21, dur: 18, gap: 33, delay: 39, dir: -1, tone: 7 },
];

const WING_COLORS = ["--wing-0", "--wing-1", "--wing-2", "--wing-3", "--wing-4", "--wing-5", "--wing-6", "--wing-7"];

function Butterfly() {
  return (
    <>
      {BUTTERFLIES.map((b, i) => (
        <span
          key={i}
          className={`fx-fly ${b.dir < 0 ? "fx-fly-rtl" : ""}`}
          style={{ top: `${b.top}%`, width: `${b.size}px`, height: `${b.size}px`, animationDuration: `${b.gap}s`, animationDelay: `${b.delay}s` }}
        >
          <span className="fx-bob block size-full" style={{ animationDuration: `${(b.dur / 6).toFixed(2)}s` }}>
            {b.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/butterfly/bf-${b.photo}.webp`} alt="" className="fx-bf-img block size-full" />
            ) : (
              <Wings color={`var(${WING_COLORS[b.tone]})`} id={i} />
            )}
          </span>
        </span>
      ))}
    </>
  );
}

/* ================= ✨ ประกายเวทมนตร์ ================= */

const SPARKLES = Array.from({ length: 20 }, (_, i) => ({
  left: +(rnd(i, 19.443) * 96 + 2).toFixed(2),
  top: +(rnd(i, 44.117) * 90 + 4).toFixed(2),
  size: +(5 + rnd(i, 67.331) * 11).toFixed(2),
  dur: +(3 + rnd(i, 28.909) * 4).toFixed(2),
  delay: +(-rnd(i, 83.221) * 8).toFixed(2),
  tone: (i % 4) as 0 | 1 | 2 | 3,
  drift: i % 3 === 0,
}));

function Magic() {
  return (
    <>
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className={`fx-star ${s.drift ? "fx-glide" : ""}`}
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.size}px`, height: `${s.size}px`, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }}
        >
          <Sparkle color={`var(${STAR_VARS[s.tone]})`} />
        </span>
      ))}
    </>
  );
}

/* ================= 🎃 ฮาโลวีนน่ารัก ================= */

const PUMPKINS = Array.from({ length: 7 }, (_, i) => ({
  left: +(rnd(i, 33.119) * 92 + 4).toFixed(2),
  size: +(18 + rnd(i, 59.773) * 12).toFixed(2),
  fall: +(16 + rnd(i, 41.229) * 10).toFixed(2),
  delay: +(-rnd(i, 77.881) * 20).toFixed(2),
  drift: +(14 + rnd(i, 23.117) * 22).toFixed(2),
  sway: +(4 + rnd(i, 66.443) * 3).toFixed(2),
  spin: +(7 + rnd(i, 51.229) * 6).toFixed(2),
}));

/** 👻 ผีน้อยน่ารัก — ลอยขึ้นช้า ๆ ส่ายซ้ายขวา แล้วค่อย ๆ จางหาย */
const GHOSTS = [
  { left: 14, size: 44, dur: 17, delay: 1, sway: 5, drift: 20 },
  { left: 72, size: 34, dur: 21, delay: 7, sway: 6.5, drift: 26 },
  { left: 42, size: 52, dur: 19, delay: 13, sway: 5.5, drift: 16 },
  { left: 88, size: 30, dur: 23, delay: 19, sway: 7, drift: 30 },
  { left: 28, size: 38, dur: 20, delay: 25, sway: 6, drift: 22 },
];

const LANTERNS = [
  { left: 8, top: 16, size: 16, dur: 3.6, delay: 0 },
  { left: 88, top: 40, size: 13, dur: 4.4, delay: 1.3 },
  { left: 66, top: 74, size: 15, dur: 4, delay: 2.4 },
];

function Halloween() {
  return (
    <>
      <Moon className="fx-moon fx-moon-warm" />
      {GHOSTS.map((g, i) => (
        <span key={i} className={`fx-float ${i >= 3 ? "fx-sm-hide" : ""}`} style={{ left: `${g.left}%`, width: `${g.size}px`, height: `${g.size}px`, animationDuration: `${g.dur}s`, animationDelay: `${g.delay}s` }}>
          <span className="fx-sway block size-full" style={{ animationDuration: `${g.sway}s`, ["--drift" as string]: `${g.drift}px` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/halloween/ghost.webp" alt="" className="fx-ghost block size-full" />
          </span>
        </span>
      ))}
      {PUMPKINS.map((p, i) => (
        <span key={i} className="fx-fall" style={{ left: `${p.left}%`, animationDuration: `${p.fall}s`, animationDelay: `${p.delay}s` }}>
          <span className="fx-sway" style={{ width: `${p.size}px`, height: `${p.size}px`, animationDuration: `${p.sway}s`, ["--drift" as string]: `${p.drift}px` }}>
            <span className="fx-spin fx-pumpkin block size-full" style={{ animationDuration: `${p.spin}s` }}><Pumpkin id={i} /></span>
          </span>
        </span>
      ))}
      {LANTERNS.map((l, i) => (
        <span key={i} className="fx-lantern" style={{ left: `${l.left}%`, top: `${l.top}%`, width: `${l.size}px`, height: `${l.size}px`, animationDuration: `${l.dur}s`, animationDelay: `${l.delay}s` }} />
      ))}
    </>
  );
}

/* ================= 🎄 คริสต์มาส ================= */

const LIGHTS = Array.from({ length: 18 }, (_, i) => ({
  left: +((i / 17) * 100).toFixed(2),
  dip: +(6 + Math.sin(i * 0.9) * 5).toFixed(2),
  beat: +(1.6 + rnd(i, 47.113) * 1.8).toFixed(2),
  delay: +(-rnd(i, 61.773) * 3).toFixed(2),
  tone: (i % 4) as 0 | 1 | 2 | 3,
}));

const LIGHT_COLORS = ["--xmas-0", "--xmas-1", "--xmas-2", "--xmas-3"];

function Christmas() {
  return (
    <>
      <Snow count={16} />
      <span className="fx-wire" />
      {LIGHTS.map((l, i) => (
        <span
          key={i}
          className="fx-light"
          style={{ left: `${l.left}%`, top: `${l.dip}px`, background: `var(${LIGHT_COLORS[l.tone]})`, animationDuration: `${l.beat}s`, animationDelay: `${l.delay}s` }}
        />
      ))}
      <span className="fx-tree fx-tree-l"><Tree /></span>
      <span className="fx-tree fx-tree-r"><Tree /></span>
      <TwinkleStars count={6} />
    </>
  );
}

/* ================= 🎆 ปีใหม่ ================= */

/** 🎆 พลุ — ยิงขึ้นจากด้านล่าง แล้วแตกเป็นดอกที่ด้านบนของจอ (ไม่ถี่ ไม่กะพริบแรง) */
const FIREWORKS = [
  { left: 22, height: 62, spread: 74, cycle: 13, delay: 1.5, tone: 0 },
  { left: 70, height: 72, spread: 88, cycle: 17, delay: 6, tone: 1 },
  { left: 46, height: 56, spread: 66, cycle: 15, delay: 10.5, tone: 4 },
  { left: 86, height: 66, spread: 72, cycle: 19, delay: 15, tone: 3 },
  { left: 12, height: 76, spread: 80, cycle: 21, delay: 20, tone: 2 },
];

/** จำนวนเส้นประกายในดอกพลุ 1 ดอก */
const RAYS = 16;

const RISERS = Array.from({ length: 10 }, (_, i) => ({
  left: +(rnd(i, 27.881) * 94 + 3).toFixed(2),
  size: +(4 + rnd(i, 55.117) * 5).toFixed(2),
  dur: +(7 + rnd(i, 38.229) * 6).toFixed(2),
  delay: +(-rnd(i, 69.443) * 12).toFixed(2),
  tone: (i % 5) as 0 | 1 | 2 | 3 | 4,
}));

function NewYear() {
  return (
    <>
      {FIREWORKS.map((f, i) => {
        const timing = { animationDuration: `${f.cycle}s`, animationDelay: `${f.delay}s` };
        return (
          <span
            key={i}
            className="fx-fw"
            style={{ left: `${f.left}%`, ["--h" as string]: `${f.height}vh`, ["--spread" as string]: `${f.spread}px`, ["--hue" as string]: `var(${STAR_VARS[f.tone]})` }}
          >
            {/* ลูกพลุวิ่งขึ้น */}
            <span className="fx-fw-rocket" style={timing} />
            {/* ดอกพลุที่แตกออก */}
            <span className="fx-fw-burst" style={timing}>
              {/* วงนอก: ประกายใหญ่ */}
              {Array.from({ length: RAYS }, (_, k) => (
                <span key={`o${k}`} className="fx-fw-ray" style={{ transform: `rotate(${(k * 360) / RAYS}deg)` }}>
                  <span className="fx-fw-dot" style={timing} />
                </span>
              ))}
              {/* วงใน: ประกายเล็กกว่า สลับมุม ให้ดอกพลุดูฟู */}
              {Array.from({ length: RAYS / 2 }, (_, k) => (
                <span key={`i${k}`} className="fx-fw-ray" style={{ transform: `rotate(${(k * 720) / RAYS + 360 / RAYS / 2}deg)` }}>
                  <span className="fx-fw-dot fx-fw-dot-sm" style={timing} />
                </span>
              ))}
            </span>
          </span>
        );
      })}

      {RISERS.map((r, i) => (
        <span
          key={i}
          className="fx-rise-dot"
          style={{ left: `${r.left}%`, width: `${r.size}px`, height: `${r.size}px`, background: `var(${STAR_VARS[r.tone]})`, animationDuration: `${r.dur}s`, animationDelay: `${r.delay}s` }}
        />
      ))}
    </>
  );
}

/* ================= 💜 สวนกลางคืนโทนม่วง ================= */

const FIREFLIES = Array.from({ length: 9 }, (_, i) => ({
  left: +(rnd(i, 35.117) * 90 + 5).toFixed(2),
  top: +(rnd(i, 62.881) * 80 + 10).toFixed(2),
  size: +(5 + rnd(i, 44.229) * 5).toFixed(2),
  dur: +(11 + rnd(i, 71.443) * 9).toFixed(2),
  beat: +(2 + rnd(i, 26.117) * 2).toFixed(2),
  delay: +(-rnd(i, 88.331) * 10).toFixed(2),
}));

function PurpleNight() {
  return (
    <>
      <Moon />
      <TwinkleStars count={12} />
      {FIREFLIES.map((f, i) => (
        <span key={i} className="fx-glide" style={{ position: "absolute", left: `${f.left}%`, top: `${f.top}%`, animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s` }}>
          <span className="pn-firefly block" style={{ width: `${f.size}px`, height: `${f.size}px`, animationDuration: `${f.beat}s`, animationDelay: `${f.delay}s` }} />
        </span>
      ))}
    </>
  );
}

/* ================= 🌌 สวนหิ่งห้อย (เฉพาะโหมดมืด) ================= */

/** หิ่งห้อย 22 ตัว — ขนาด ความสว่าง ความเร็ว และทิศทางต่างกันทุกตัว */
const FLIES = Array.from({ length: 22 }, (_, i) => ({
  left: +(rnd(i, 13.773) * 92 + 4).toFixed(2),
  top: +(rnd(i, 47.229) * 84 + 8).toFixed(2),
  size: +(3.5 + rnd(i, 68.117) * 4.5).toFixed(2),      // ตัวเล็ก 3.5–8px
  drift: +(26 + rnd(i, 31.441) * 28).toFixed(2),        // บินช้ามาก 26–54 วิ ต่อรอบ
  glow: +(3.4 + rnd(i, 55.907) * 4.2).toFixed(2),       // จังหวะเรืองแสง 3.4–7.6 วิ
  delay: +(-rnd(i, 79.331) * 26).toFixed(2),            // ไม่สว่างพร้อมกัน
  dx: +(30 + rnd(i, 24.881) * 70).toFixed(0),           // ระยะบินแนวนอน
  dy: +(20 + rnd(i, 61.117) * 46).toFixed(0),           // ระยะบินแนวตั้ง
  dir: i % 2 === 0 ? 1 : -1,                            // บินคนละทิศ
  tone: (i % 4) as 0 | 1 | 2 | 3,
  far: i % 3 === 1,                                     // บางตัวอยู่ไกล (เล็กลง จางลง)
}));

const FLY_COLORS = ["--ff-0", "--ff-1", "--ff-2", "--ff-3"];

function Firefly() {
  return (
    <>
      {/* บรรยากาศสวนกลางคืนแบบเบามาก — หิ่งห้อยต้องเป็นพระเอก */}
      <Moon className="fx-moon fx-moon-dim" />
      <TwinkleStars count={5} />

      {FLIES.map((f, i) => (
        <span
          key={i}
          className={`ff-path ${f.far ? "ff-far" : ""}`}
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            ["--dx" as string]: `${+f.dx * f.dir}px`,
            ["--dy" as string]: `${f.dy}px`,
            animationDuration: `${f.drift}s`,
            animationDelay: `${f.delay}s`,
          }}
        >
          <span
            className="ff-body block"
            style={{
              width: `${f.size}px`,
              height: `${f.size}px`,
              ["--ff" as string]: `var(${FLY_COLORS[f.tone]})`,
              animationDuration: `${f.glow}s`,
              animationDelay: `${f.delay}s`,
            }}
          />
        </span>
      ))}
    </>
  );
}

/* ================= ชิ้นส่วนที่ใช้ร่วมกัน ================= */

function Sparkle({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="block size-full">
      <path d="M12 0c.7 6.6 4.7 10.6 12 12-7.3 1.4-11.3 5.4-12 12-.7-6.6-4.7-10.6-12-12C7.3 10.6 11.3 6.6 12 0Z" fill={color} />
    </svg>
  );
}

function Flower({ petal = "#f6ecff" }: { petal?: string }) {
  return (
    <svg viewBox="0 0 24 24" className="block size-full">
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse key={deg} cx="12" cy="6.5" rx="3.1" ry="5" fill={petal} transform={`rotate(${deg} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="2.4" fill="#f7d35a" />
    </svg>
  );
}

function Leaf() {
  return (
    <svg viewBox="0 0 24 24" className="block size-full">
      <path d="M20 4c0 9-5.6 15-13 15-1.4 0-2.6-.2-3.7-.6C4.6 10.7 11 5 20 4Z" fill="var(--leaf-green)" />
      <path d="M20 4C13 8 8 13 5 19" stroke="var(--leaf-vein)" strokeWidth="1.1" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function Wings({ color, id }: { color: string; id: number }) {
  return (
    <svg viewBox="0 0 32 24" className="block size-full">
      <defs>
        <linearGradient id={`bf-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      </defs>
      <g className="fx-wing fx-wing-l">
        <path d="M16 12C13 4 8 2 4 4c-3 1.5-2.5 7 1 9 2.6 1.5 7 1 11-1Z" fill={`url(#bf-${id})`} />
        <path d="M16 12c-3 6-7 9-10.5 8-2.6-.8-3-4.6-.5-6.4C7 12.3 12 11.4 16 12Z" fill={`url(#bf-${id})`} opacity="0.85" />
      </g>
      <g className="fx-wing fx-wing-r">
        <path d="M16 12c3-8 8-10 12-8 3 1.5 2.5 7-1 9-2.6 1.5-7 1-11-1Z" fill={`url(#bf-${id})`} />
        <path d="M16 12c3 6 7 9 10.5 8 2.6-.8 3-4.6.5-6.4C25 12.3 20 11.4 16 12Z" fill={`url(#bf-${id})`} opacity="0.85" />
      </g>
      <ellipse cx="16" cy="12" rx="1.1" ry="4.6" fill="var(--wing-body)" />
      <path d="M16 7.6c-1-1.6-2.2-2.4-3.4-2.6M16 7.6c1-1.6 2.2-2.4 3.4-2.6" stroke="var(--wing-body)" strokeWidth="0.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function Pumpkin({ id }: { id: number }) {
  return (
    <svg viewBox="0 0 24 24" className="block size-full">
      <defs>
        <linearGradient id={`pk-${id}`} x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#ffb85c" />
          <stop offset="100%" stopColor="#e8701f" />
        </linearGradient>
      </defs>
      <path d="M12 5.2c-1-1.4-.6-2.6.6-3.2l.5 1.2c.7-.5 1.6-.4 2 .2-1 .5-1.7 1.2-2 2Z" fill="#5f9c3f" />
      <ellipse cx="12" cy="14" rx="9" ry="8" fill={`url(#pk-${id})`} />
      <ellipse cx="7.6" cy="14" rx="3" ry="7.6" fill="#ffffff" opacity="0.14" />
      <ellipse cx="16.4" cy="14" rx="3" ry="7.6" fill="#8a3c08" opacity="0.12" />
      {/* หน้ายิ้มน่ารัก ไม่น่ากลัว */}
      <circle cx="9.2" cy="12.4" r="1.15" fill="#6b3008" />
      <circle cx="14.8" cy="12.4" r="1.15" fill="#6b3008" />
      <path d="M9.4 16c1.5 1.4 3.7 1.4 5.2 0" stroke="#6b3008" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <circle cx="7.2" cy="15.4" r="1.1" fill="#ff9aa8" opacity="0.55" />
      <circle cx="16.8" cy="15.4" r="1.1" fill="#ff9aa8" opacity="0.55" />
    </svg>
  );
}

function Tree() {
  return (
    <svg viewBox="0 0 24 32" className="block size-full">
      <path d="M12 1 19 11h-4l5 8h-4l4 7H4l4-7H4l5-8H5L12 1Z" fill="var(--pine)" />
      <rect x="10.6" y="26" width="2.8" height="4.6" rx="1" fill="#8a5a2b" />
      <circle cx="9" cy="14" r="1" fill="var(--xmas-0)" />
      <circle cx="15" cy="18" r="1" fill="var(--xmas-1)" />
      <circle cx="11" cy="22" r="1" fill="var(--xmas-2)" />
      <path d="M12 0.4l.9 2 2-.1-1.4 1.5.7 2-2.2-1-2.2 1 .7-2L9.1 2.3l2 .1L12 .4Z" fill="var(--xmas-3)" />
    </svg>
  );
}

/* ================= 🏮 เทศกาลลอยโคม ================= */

/** 🏠 บ้านในหมู่บ้าน — left เป็น % ของจอ · sm = ซ่อนบนมือถือ */
const HOUSES = [
  { left: -1, w: 120, h: 92, v: 0 },
  { left: 11, w: 96, h: 74, v: 1, sm: true },
  { left: 24, w: 128, h: 100, v: 0 },
  { left: 40, w: 100, h: 78, v: 1, sm: true },
  { left: 55, w: 120, h: 96, v: 0 },
  { left: 70, w: 100, h: 76, v: 1, sm: true },
  { left: 84, w: 130, h: 98, v: 0 },
];

type PersonKind = "release" | "hold" | "watch" | "kid" | "kid-point";

/**
 * 🧑‍🤝‍🧑 ผู้คนที่ลานหมู่บ้าน — "release" คือคนที่ยกโคมขึ้นแล้วปล่อย
 * โคมของคนนั้นใช้รอบเวลาเดียวกับท่าแขน จึงลอยออกจากมือจริง ๆ
 */
const PEOPLE: { left: number; kind: PersonKind; d?: number; delay?: number; sway?: number; sm?: boolean }[] = [
  { left: 5, kind: "release", d: 16, delay: -2 },
  { left: 7.6, kind: "kid-point", sway: 4.2 },
  { left: 15, kind: "hold", sway: 5.4 },
  { left: 17.2, kind: "kid", sway: 3.6, sm: true },
  { left: 21, kind: "watch", sway: 6.2, sm: true },
  { left: 22.6, kind: "watch", sm: true },
  { left: 31, kind: "release", d: 19, delay: -9 },
  { left: 35, kind: "hold", sway: 4.8, sm: true },
  { left: 37.2, kind: "kid", sm: true },
  { left: 46, kind: "release", d: 15, delay: -5, sm: true },
  { left: 49, kind: "watch", sway: 5.8 },
  { left: 50.6, kind: "watch" },
  { left: 52.6, kind: "kid-point", sway: 3.9 },
  { left: 61, kind: "release", d: 18, delay: -13 },
  { left: 65, kind: "hold", sway: 5.1, sm: true },
  { left: 76, kind: "release", d: 17, delay: -7, sm: true },
  { left: 79, kind: "kid", sway: 4.4, sm: true },
  { left: 88, kind: "hold", sway: 6 },
  { left: 92, kind: "release", d: 20, delay: -15 },
  { left: 95.4, kind: "kid-point", sm: true },
];

/**
 * 🏮 โคมจากลานหลังหมู่บ้าน (ชั้นหลังสุด) — ทุกดวงเริ่มที่พื้นหลังหลังคาบ้าน แล้วลอยขึ้นจนเล็กและจางไปบนฟ้า
 * ไม่มีดวงไหนโผล่กลางอากาศ · ที่เห็นอยู่สูงแล้วตอนเปิดหน้า คือดวงที่ปล่อยไปก่อนหน้า (delay ติดลบ)
 * ดวงไกลเล็กกว่า เบลอกว่า และช้ากว่า
 */
const SKY_LANTERNS = Array.from({ length: 16 }, (_, i) => {
  const far = i % 3 === 2;
  return {
    left: +(rnd(i, 21.773) * 94 + 3).toFixed(2),
    base: +(6 + rnd(i, 47.119) * 36).toFixed(0),
    size: +((far ? 11 : 16) + rnd(i, 63.337) * (far ? 5 : 10)).toFixed(1),
    dur: +((far ? 30 : 22) + rnd(i, 35.881) * 12).toFixed(2),
    delay: +(-rnd(i, 89.443) * 34).toFixed(2),
    dx: +((rnd(i, 14.227) - 0.5) * 120).toFixed(0),
    tilt: +(3 + rnd(i, 72.991) * 3).toFixed(2),
    far,
  };
});

function LanternFest() {
  // เครื่องที่ CPU/RAM น้อย ลดจำนวนโคมและคนลงอีกครึ่ง (นอกเหนือจากที่ลดตามขนาดจอใน CSS)
  const [lite, setLite] = useState(false);
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    setLite((nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4);
  }, []);

  return (
    <div className={`lf-scene ${lite ? "lf-lite" : ""}`}>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <linearGradient id="lf-paper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffe7a6" />
            <stop offset="55%" stopColor="#ffb44f" />
            <stop offset="100%" stopColor="#f0782c" />
          </linearGradient>
        </defs>
      </svg>

      <TwinkleStars count={10} />

      <div className="lf-sky">
        {SKY_LANTERNS.map((l, i) => (
          <span
            key={i}
            className={`lf-rise ${l.far ? "fx-far" : ""} ${i % 2 ? "lf-x" : ""}`}
            style={{ left: `${l.left}%`, bottom: `${l.base}px`, animationDuration: `${l.dur}s`, animationDelay: `${l.delay}s`, ["--lf-dx" as string]: `${l.dx}px` }}
          >
            <SkyLantern size={l.size} tilt={l.tilt} />
          </span>
        ))}
      </div>

      <div className="lf-village">
        <span className="lf-ground" />
        {HOUSES.map((h, i) => (
          <span key={i} className={`lf-house ${h.sm ? "fx-sm-hide lf-x" : ""}`} style={{ left: `${h.left}%`, width: `calc(${h.w}px * var(--lf-s))`, height: `calc(${h.h}px * var(--lf-s))` }}>
            <House variant={h.v} id={i} />
          </span>
        ))}
        {PEOPLE.map((p, i) => (
          <Person key={i} {...p} />
        ))}
      </div>
    </div>
  );
}

function SkyLantern({ size, tilt }: { size: number; tilt: number }) {
  return (
    <span className="lf-lantern" style={{ width: `${size}px`, height: `${size * 1.25}px`, animationDuration: `${tilt}s` }}>
      <span className="lf-glow" />
      <svg viewBox="0 0 24 30" className="relative block size-full">
        <path d="M4 3Q12 0 20 3L18 23Q12 25.6 6 23Z" fill="url(#lf-paper)" />
        <path d="M9.4 2.2 8.6 23.8M14.6 2.2l.8 21.6" stroke="#e8823a" strokeWidth=".6" opacity=".45" fill="none" />
        <path d="M6 23Q12 25.6 18 23" stroke="#d9622a" strokeWidth="1.1" fill="none" />
        <ellipse cx="12" cy="23.9" rx="3.4" ry="1.3" fill="#fff4c9" />
      </svg>
    </span>
  );
}

/** 🏡 บ้านทรงจั่วสูง มีกาแลบนยอด หน้าต่างมีไฟ ไฟประดับใต้ชายคา และโคมแขวน */
function House({ variant, id }: { variant: number; id: number }) {
  const lights = [18, 30, 42, 58, 70, 82];
  return (
    <svg viewBox="0 0 100 80" preserveAspectRatio="xMidYMax meet" className="block size-full">
      {variant === 0 ? (
        <>
          <path d="M44 10 37 0M56 10l7-10" stroke="var(--lf-house)" strokeWidth="3" strokeLinecap="round" />
          <path d="M0 36 50 6l50 30Z" fill="var(--lf-house)" />
          <rect x="12" y="34" width="76" height="46" fill="var(--lf-house)" />
          <rect className="lf-win" x="22" y="45" width="14" height="12" rx="1.5" style={{ animationDelay: `${-id * 1.3}s` }} />
          <rect className="lf-win" x="64" y="45" width="14" height="12" rx="1.5" style={{ animationDelay: `${-id * 1.3 - 2}s` }} />
          <rect className="lf-door" x="44" y="54" width="12" height="26" rx="1" />
        </>
      ) : (
        <>
          <path d="M6 44 50 18l44 26Z" fill="var(--lf-house)" />
          <rect x="16" y="42" width="68" height="38" fill="var(--lf-house)" />
          <rect className="lf-win" x="28" y="52" width="16" height="12" rx="1.5" style={{ animationDelay: `${-id * 1.1}s` }} />
          <rect className="lf-door" x="58" y="56" width="12" height="24" rx="1" />
        </>
      )}
      {/* ไฟประดับใต้ชายคา */}
      {lights.map((x, i) => (
        <circle key={i} className={`lf-bulb lf-bulb-${i % 3}`} cx={x} cy={variant === 0 ? 38 : 46} r="1.8" style={{ animationDelay: `${-(i + id) * 0.45}s` }} />
      ))}
      <path d={variant === 0 ? "M8 37v5" : "M12 45v5"} stroke="var(--lf-house)" strokeWidth="1" />
      <ellipse className="lf-hang" cx={variant === 0 ? 8 : 12} cy={variant === 0 ? 46 : 54} rx="3.4" ry="4.4" />
    </svg>
  );
}

/** 🧍 คนเงาดำ — แต่ละท่ามีแขนต่างกัน · คนที่ "release" สลับท่ายกโคม/ลดแขนตามรอบของโคม */
function Person({ left, kind, d = 16, delay = 0, sway, sm }: (typeof PEOPLE)[number]) {
  const kid = kind === "kid" || kind === "kid-point";
  const k = kid ? 0.62 : 0.9;
  const timing = { animationDuration: `${d}s`, animationDelay: `${delay}s` };
  const arm = { stroke: "var(--lf-people)", strokeWidth: 2.6, strokeLinecap: "round" as const, fill: "none" };

  return (
    <span
      className={`lf-person ${sway ? "lf-sway" : ""} ${sm ? "fx-sm-hide lf-x" : ""}`}
      style={{ left: `${left}%`, width: `calc(${20 * k}px * var(--lf-s))`, height: `calc(${44 * k}px * var(--lf-s))`, animationDuration: sway ? `${sway}s` : undefined }}
    >
      <svg viewBox="0 -4 20 44" className="block size-full overflow-visible">
        <circle cx="10" cy="6" r="4" fill="var(--lf-people)" />
        <path d="M6 12Q10 10 14 12L16 30Q16 33 13 33V40H11V33H9V40H7V33Q4 33 4 30Z" fill="var(--lf-people)" />
        {kind === "release" && (
          <>
            <g className="lf-arms-up" style={timing}><path d="M6.5 13.5 5 -2M13.5 13.5 15 -2" {...arm} /></g>
            <g className="lf-arms-down" style={timing}><path d="M6.5 13.5 4 25M13.5 13.5 16 25" {...arm} /></g>
          </>
        )}
        {kind === "hold" && <path d="M6.5 13.5 9 21M13.5 13.5 11 21" {...arm} />}
        {(kind === "watch" || kind === "kid") && <path d="M6.5 13.5 4 25M13.5 13.5 16 25" {...arm} />}
        {kind === "kid-point" && <path d="M6.5 13.5 4 25M13.5 13.5 19 1" {...arm} />}
      </svg>

      {kind === "hold" && (
        <span className="lf-held">
          <SkyLantern size={13} tilt={4.5} />
        </span>
      )}
      {kind === "release" && (
        <span className="lf-launch-anchor">
          <span className="lf-launch" style={{ ...timing, ["--lf-dx" as string]: `${(rnd(left, 9.17) - 0.5) * 90}px` }}>
            <SkyLantern size={22} tilt={3.8} />
          </span>
        </span>
      )}
    </span>
  );
}

/* ================= 🐉 ลูกไฟพญานาค ================= */

/**
 * 🔥 ลูกไฟแต่ละดวงมี 1 รอบเวลา ใช้ร่วมกันทุกชั้น:
 * แสงเรืองใต้น้ำ → ระลอกวงที่ผิวน้ำ → ผุดพ้นน้ำ → ลอยขึ้นฟ้า เล็กลงและจางหาย → พักก่อนดวงใหม่
 * เงาสะท้อนบนแม่น้ำใช้รอบเดียวกัน จึงสว่างตอนลูกไฟอยู่ต่ำ และจางเมื่อลอยสูง
 */
const FIREBALLS = Array.from({ length: 10 }, (_, i) => ({
  left: +(4 + rnd(i, 31.417) * 70).toFixed(2),
  size: +(10 + rnd(i, 57.203) * 8).toFixed(1),
  dur: +(9 + rnd(i, 23.887) * 7).toFixed(2),
  delay: +(-rnd(i, 81.559) * 16).toFixed(2),
  dx: +((rnd(i, 44.903) - 0.5) * 70).toFixed(0),
}));

/** 〰️ เส้นระลอกบนผิวน้ำ */
const WAVES = Array.from({ length: 7 }, (_, i) => ({
  left: +(rnd(i, 15.331) * 86).toFixed(2),
  top: +(18 + rnd(i, 66.719) * 70).toFixed(2),
  w: +(50 + rnd(i, 38.117) * 90).toFixed(0),
  dur: +(6 + rnd(i, 92.443) * 5).toFixed(2),
  delay: +(-rnd(i, 12.661) * 8).toFixed(2),
}));

function NagaFire() {
  const [lite, setLite] = useState(false);
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    setLite((nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4);
  }, []);
  const timing = (f: (typeof FIREBALLS)[number]) => ({ animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s` });

  return (
    <div className={`nf-scene ${lite ? "nf-lite" : ""}`}>
      <TwinkleStars count={9} />
      <RiverBank />

      {/* ชั้นพญานาค — อยู่หลังผิวน้ำ ลำตัวส่วนล่างจึงดูจมอยู่ในแม่น้ำ */}
      <div className="nf-naga">
        <Naga />
      </div>

      {/* ชั้นลูกไฟ — เริ่มใต้ผิวน้ำ (ถูกน้ำบังไว้) แล้วผุดขึ้น */}
      <div className="nf-balls">
        {FIREBALLS.map((f, i) => (
          <span key={i} className={`nf-ball-anchor ${i % 2 ? "nf-x" : ""}`} style={{ left: `${f.left}%` }}>
            <span className="nf-ball" style={{ ...timing(f), width: `${f.size}px`, height: `${f.size}px`, ["--nf-dx" as string]: `${f.dx}px` }}>
              <span className="nf-spark nf-spark-a" />
              <span className="nf-spark nf-spark-b" />
            </span>
          </span>
        ))}
      </div>

      {/* ชั้นผิวน้ำ — ระลอก แสงเรืองใต้น้ำ วงคลื่น และเงาสะท้อนของลูกไฟแต่ละดวง */}
      <div className="nf-water">
        {WAVES.map((w, i) => (
          <span key={i} className="nf-wave" style={{ left: `${w.left}%`, top: `${w.top}%`, width: `${w.w}px`, animationDuration: `${w.dur}s`, animationDelay: `${w.delay}s` }} />
        ))}
        <div className="nf-fx">
          {FIREBALLS.map((f, i) => (
            <span key={i} className={`nf-spot ${i % 2 ? "nf-x" : ""}`} style={{ left: `${f.left}%` }}>
              <span className="nf-under" style={timing(f)} />
              <span className="nf-ring" style={timing(f)} />
              <span className="nf-reflect" style={timing(f)} />
            </span>
          ))}
        </div>
      </div>
      <div className="nf-mist" />
    </div>
  );
}

/** 🌳 เงาตลิ่งและแนวไม้ฝั่งไกล เหนือผิวน้ำ */
function RiverBank() {
  return (
    <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="nf-bank" aria-hidden>
      <path d="M0 60V38c60-6 110-18 170-14s90 14 150 8 100-22 170-20 110 18 170 16 90-14 160-16 120 12 180 10 70-8 200-6V60Z" fill="var(--nf-bank)" />
      <path d="M0 60V46c80 2 140-8 220-6s120 10 210 6 150-12 240-10 140 10 230 8 180-6 300-4V60Z" fill="var(--nf-bank-near)" />
    </svg>
  );
}

/** 🐉 พญานาค — ลำตัวเกล็ดทองโค้งขึ้นจากน้ำ หงอนกนก แผงคอสีมรกต ส่ายหัวและหายใจช้า ๆ */
function Naga() {
  const body = "M122 176C132 132 70 124 78 90C84 64 98 54 80 41";
  return (
    <svg viewBox="0 0 200 180" className="block size-full overflow-visible">
      <defs>
        <linearGradient id="nf-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe9a3" />
          <stop offset="50%" stopColor="#e9b44c" />
          <stop offset="100%" stopColor="#a8641f" />
        </linearGradient>
        <linearGradient id="nf-jade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5fe0b0" />
          <stop offset="100%" stopColor="#0f7a63" />
        </linearGradient>
      </defs>

      {/* โค้งลำตัวช่วงท้ายที่โผล่พ้นน้ำ */}
      <g className="nf-hump">
        <path d="M148 178C154 146 186 146 194 178" stroke="url(#nf-gold)" strokeWidth="15" fill="none" strokeLinecap="round" />
        <path d="M148 178C154 146 186 146 194 178" stroke="#8a4d16" strokeWidth="9" strokeDasharray="2 5" fill="none" opacity=".55" />
        <path d="M160 152l6-12 4 10 6-10 3 12" fill="url(#nf-jade)" />
      </g>

      <g className="nf-body">
        <path d={body} stroke="url(#nf-gold)" strokeWidth="22" fill="none" strokeLinecap="round" />
        <path d={body} stroke="#8a4d16" strokeWidth="15" strokeDasharray="2.4 5" fill="none" opacity=".5" />
        <path d={body} stroke="#fff1c2" strokeWidth="3" fill="none" opacity=".55" transform="translate(-4 1)" />
        {/* ครีบหลัง */}
        <path d="M104 118l8-10 1 12 9-8-2 13M92 78l9-7-1 11 9-5-4 11" fill="url(#nf-jade)" />

        <g className="nf-head">
          {/* แผงคอ */}
          <path className="nf-hood" d="M84 34C102 22 114 38 104 50C114 54 108 66 94 62C98 54 92 44 84 42Z" fill="url(#nf-jade)" stroke="#f3c96a" strokeWidth="1.2" />
          {/* หัวและขากรรไกร */}
          <path d="M86 34C78 22 58 22 44 31L32 37C38 42 52 44 60 45C70 49 80 48 88 43Z" fill="url(#nf-gold)" />
          <path d="M46 40 36 45C48 50 62 51 74 48" stroke="#a8641f" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* หงอนกนกเปลวไฟ */}
          <path d="M66 27C63 15 72 10 69 1C78 9 81 16 76 24C82 15 91 13 93 6C96 17 91 26 85 32Z" fill="url(#nf-gold)" stroke="#fff1c2" strokeWidth=".8" />
          {/* หนวดม้วน */}
          <path d="M36 40C28 46 24 56 30 62s12-2 8-8" stroke="#f3c96a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <circle className="nf-eye" cx="62" cy="33" r="2.6" />
        </g>
      </g>
    </svg>
  );
}

/* ================= 🪷 ลอยกระทง ================= */

type BankKind = "kneel" | "hold" | "watch" | "kid";

/**
 * 🧑‍🧑‍🧒 ผู้คนริมตลิ่งฝั่งใกล้ — "kneel" คือคนที่นั่งคุกเข่าวางกระทงลงน้ำ
 * กระทงของคนนั้นใช้รอบเวลาเดียวกับท่าแขน: ถือไว้ → วางลงน้ำ → ลอยตามกระแสออกไป → หยิบใบใหม่
 */
const BANK_PEOPLE: { left: number; kind: BankKind; d?: number; delay?: number; run?: number; lane?: number; sway?: number; sm?: boolean }[] = [
  { left: 6, kind: "kneel", d: 40, delay: -4, run: 52, lane: 0.42 },
  { left: 12, kind: "hold", sway: 5.2 },
  { left: 18.5, kind: "watch", sway: 6.1, sm: true },
  { left: 20.2, kind: "kid", sway: 4.3, sm: true },
  { left: 28, kind: "kneel", d: 46, delay: -21, run: 46, lane: 0.6 },
  { left: 36, kind: "hold", sway: 4.7, sm: true },
  { left: 43, kind: "watch", sway: 5.6 },
  { left: 44.8, kind: "kid", sway: 3.8 },
  { left: 52, kind: "kneel", d: 38, delay: -12, run: 40, lane: 0.5, sm: true },
  { left: 61, kind: "hold", sway: 5.9 },
  { left: 68, kind: "kneel", d: 44, delay: -30, run: 30, lane: 0.36 },
  { left: 77, kind: "watch", sway: 6.4, sm: true },
  { left: 78.7, kind: "watch", sm: true },
  { left: 86, kind: "hold", sway: 5 },
  { left: 92, kind: "kid", sway: 4.1, sm: true },
];

/** 🪷 กระทงที่ลอยมาจากต้นน้ำ — 3 ระยะ: ไกล (เล็ก ช้า ใกล้ตลิ่งฝั่งโน้น) · กลาง · ใกล้ */
const DRIFTERS = Array.from({ length: 9 }, (_, i) => {
  const depth = i % 3; // 0 ไกล · 1 กลาง · 2 ใกล้
  return {
    lane: [0.14, 0.38, 0.62][depth] + rnd(i, 27.551) * 0.1,
    scale: [0.5, 0.72, 0.95][depth],
    dur: +([84, 66, 52][depth] + rnd(i, 61.093) * 16).toFixed(2),
    delay: +(-rnd(i, 39.307) * 80).toFixed(2),
    bob: +(3 + rnd(i, 17.719) * 2).toFixed(2),
    tone: i % 3,
    depth,
  };
});

/** ✨ ประกายแสงบนผิวน้ำ — วิบขึ้นนาน ๆ ครั้ง */
const GLINTS = Array.from({ length: 8 }, (_, i) => ({
  left: +(rnd(i, 52.117) * 94 + 3).toFixed(2),
  top: +(15 + rnd(i, 74.551) * 70).toFixed(2),
  dur: +(5 + rnd(i, 33.903) * 6).toFixed(2),
  delay: +(-rnd(i, 18.227) * 10).toFixed(2),
}));

function LoyKrathong() {
  const [lite, setLite] = useState(false);
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    setLite((nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4);
  }, []);

  return (
    <div className={`lk-scene ${lite ? "lk-lite" : ""}`}>
      <span className="lk-moon" />
      <TwinkleStars count={9} />
      <RiverBank />

      {/* แม่น้ำ — กระทงจากต้นน้ำลอยอยู่ในชั้นนี้ */}
      <div className="lk-river">
        {GLINTS.map((g, i) => (
          <span key={i} className="lk-glint" style={{ left: `${g.left}%`, top: `${g.top}%`, animationDuration: `${g.dur}s`, animationDelay: `${g.delay}s` }} />
        ))}
        <div className="lk-drift">
          {DRIFTERS.map((k, i) => (
            <span
              key={i}
              className={`lk-drifter ${k.depth === 0 ? "fx-far" : ""} ${i % 2 ? "lk-x" : ""}`}
              style={{ top: `${k.lane * 100}%`, animationDuration: `${k.dur}s`, animationDelay: `${k.delay}s`, zIndex: k.depth }}
            >
              <Krathong scale={k.scale} bob={k.bob} tone={k.tone} />
            </span>
          ))}
        </div>
      </div>

      {/* ตลิ่งฝั่งใกล้ + ผู้คน */}
      <div className="lk-bank">
        <span className="lk-ground" />
        {BANK_PEOPLE.map((p, i) => (
          <BankPerson key={i} {...p} />
        ))}
      </div>
    </div>
  );
}

/** 🪷 กระทงใบตอง กลีบพับ ดอกไม้ เทียนกับธูป · เปลวเทียนสั่นไหว และเงาสะท้อนใต้กระทง */
function Krathong({ scale = 1, bob = 4, tone = 0 }: { scale?: number; bob?: number; tone?: number }) {
  const flowers = [["#f59ac7", "#b38be8", "#fff1d6"], ["#b38be8", "#fff1d6", "#f59ac7"], ["#fff1d6", "#f59ac7", "#ffd27a"]][tone];
  return (
    <span className="lk-krathong" style={{ width: `${36 * scale}px`, height: `${27 * scale}px`, animationDuration: `${bob}s` }}>
      <span className="lk-reflect" />
      <span className="lk-halo" />
      <svg viewBox="0 0 40 30" className="relative block size-full overflow-visible">
        <ellipse cx="20" cy="25" rx="18" ry="4.6" fill="#2f7d48" />
        <path d="M3 24 7 14l4 10ZM10 24l4-12 4 12ZM22 24l4-12 4 12ZM29 24l4-10 4 10Z" fill="#4fae69" stroke="#2f7d48" strokeWidth=".7" />
        <path d="M16 24 20 11l4 13Z" fill="#62c07c" stroke="#2f7d48" strokeWidth=".7" />
        <path d="M16.5 7.5 17.6 17M23.5 7.5 22.4 17" stroke="#c46a3a" strokeWidth=".9" />
        <rect x="18.9" y="5" width="2.4" height="12" rx=".8" fill="#fff4dc" />
        {[13, 20, 27].map((x, i) => (
          <g key={x}>
            <circle cx={x} cy={i === 1 ? 18 : 19} r="3.6" fill={flowers[i]} />
            <circle cx={x} cy={i === 1 ? 18 : 19} r="1.2" fill="#f2b84b" />
          </g>
        ))}
      </svg>
      <span className="lk-flame" style={{ animationDuration: `${0.7 + tone * 0.13}s` }} />
    </span>
  );
}

/** 🧍 คนริมตลิ่ง — คนคุกเข่ายื่นมือวางกระทง · คนยืนถือกระทง · คนยืนชม · เด็ก */
function BankPerson({ left, kind, d = 40, delay = 0, run = 40, lane = 0.5, sway, sm }: (typeof BANK_PEOPLE)[number]) {
  const k = kind === "kid" ? 0.62 : 0.9;
  const timing = { animationDuration: `${d}s`, animationDelay: `${delay}s` };
  const arm = { stroke: "var(--lk-people)", strokeWidth: 2.6, strokeLinecap: "round" as const, fill: "none" };

  return (
    <span
      className={`lk-person ${sway ? "lf-sway" : ""} ${sm ? "fx-sm-hide lk-x" : ""}`}
      style={{ left: `${left}%`, width: `calc(${24 * k}px * var(--lk-s))`, height: `calc(${44 * k}px * var(--lk-s))`, animationDuration: sway ? `${sway}s` : undefined }}
    >
      <svg viewBox="0 -4 24 44" className="block size-full overflow-visible">
        {kind === "kneel" ? (
          <>
            <circle cx="12" cy="16" r="4" fill="var(--lk-people)" />
            <path d="M5 40V31Q5 24 9 21.5Q13 19.5 15 22.5L16 31H21Q23.5 31 23.5 34V40Z" fill="var(--lk-people)" />
            <g className="lk-arms-reach" style={timing}><path d="M13 23.5 21 30" {...arm} /></g>
            <g className="lk-arms-rest" style={timing}><path d="M13 23.5 17 31" {...arm} /></g>
          </>
        ) : (
          <>
            <circle cx="12" cy="6" r="4" fill="var(--lk-people)" />
            <path d="M8 12Q12 10 16 12L18 30Q18 33 15 33V40H13V33H11V40H9V33Q6 33 6 30Z" fill="var(--lk-people)" />
            {kind === "hold" ? <path d="M8.5 13.5 11 21M15.5 13.5 13 21" {...arm} /> : <path d="M8.5 13.5 6 25M15.5 13.5 18 25" {...arm} />}
          </>
        )}
      </svg>

      {kind === "hold" && (
        <span className="lk-held-chest">
          <Krathong scale={0.42} bob={4.6} />
        </span>
      )}
      {kind === "kneel" && (
        <span className="lk-place-anchor">
          <span className="lk-held" style={timing}><Krathong scale={0.62} bob={9} /></span>
          <span
            className="lk-place"
            style={{ ...timing, ["--lk-run" as string]: `${run}vw`, ["--lk-lane" as string]: `calc(var(--lk-river) * ${lane})` }}
          >
            <Krathong scale={0.62} bob={3.8} tone={Math.round(left) % 3} />
          </span>
        </span>
      )}
    </span>
  );
}

/* ================= ทะเบียนตัวแสดงผล ================= */

export const SCENES: Record<string, () => React.JSX.Element> = {
  winter: Winter,
  sakura: Sakura,
  autumn: Autumn,
  starlight: Starlight,
  rainy: Rainy,
  spring: Spring,
  butterfly: Butterfly,
  magic: Magic,
  halloween: Halloween,
  christmas: Christmas,
  newyear: NewYear,
  firefly: Firefly,
  purplenight: PurpleNight,
  lanternfest: LanternFest,
  nagafire: NagaFire,
  loykrathong: LoyKrathong,
};
