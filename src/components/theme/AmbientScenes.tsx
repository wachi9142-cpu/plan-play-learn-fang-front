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
  opacity: +(0.3 + rnd(i, 26.881) * 0.4).toFixed(2),
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

const BUTTERFLIES = [
  { top: 22, size: 26, dur: 13, gap: 26, delay: 2, dir: 1, tone: 0 },
  { top: 54, size: 20, dur: 17, gap: 34, delay: 11, dir: -1, tone: 1 },
  { top: 72, size: 30, dur: 15, gap: 30, delay: 19, dir: 1, tone: 2 },
  { top: 38, size: 22, dur: 19, gap: 38, delay: 27, dir: -1, tone: 3 },
];

const WING_COLORS = ["--wing-0", "--wing-1", "--wing-2", "--wing-3"];

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
            <Wings color={`var(${WING_COLORS[b.tone]})`} id={i} />
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

const LANTERNS = [
  { left: 8, top: 16, size: 16, dur: 3.6, delay: 0 },
  { left: 88, top: 40, size: 13, dur: 4.4, delay: 1.3 },
  { left: 66, top: 74, size: 15, dur: 4, delay: 2.4 },
];

function Halloween() {
  return (
    <>
      <Moon className="fx-moon fx-moon-warm" />
      <Leaves count={9} />
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

const FIREWORKS = [
  { left: 24, top: 16, size: 90, gap: 14, delay: 2, tone: 0 },
  { left: 68, top: 10, size: 110, gap: 19, delay: 8, tone: 1 },
  { left: 46, top: 24, size: 80, gap: 23, delay: 14.5, tone: 3 },
];

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
      {FIREWORKS.map((f, i) => (
        <span
          key={i}
          className="fx-firework"
          style={{ left: `${f.left}%`, top: `${f.top}%`, ["--spread" as string]: `${f.size}px`, ["--hue" as string]: `var(${STAR_VARS[f.tone]})`, animationDuration: `${f.gap}s`, animationDelay: `${f.delay}s` }}
        >
          {Array.from({ length: 12 }, (_, k) => (
            <span key={k} className="fx-spark" style={{ transform: `rotate(${k * 30}deg)` }} />
          ))}
        </span>
      ))}
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
          <span className="fx-firefly block" style={{ width: `${f.size}px`, height: `${f.size}px`, animationDuration: `${f.beat}s`, animationDelay: `${f.delay}s` }} />
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
  purplenight: PurpleNight,
};
