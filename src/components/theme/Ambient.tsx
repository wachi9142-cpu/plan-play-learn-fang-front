"use client";

import { useEffect, useState } from "react";
import { Snowflake } from "./Snowflake";
import { useAmbient } from "./useAmbient";

/**
 * ✨ ชั้นเอฟเฟกต์บรรยากาศของ Little Purple Garden
 * - เปิดได้ทีละ 1 อย่าง: ❄️ หิมะ · 🌠 แสงดาว · 🌸 กลีบดอกไม้ · 🍂 ใบไม้ร่วง
 * - CSS animation ล้วน (transform/opacity) ไม่แตะ JS ทุกเฟรม จึงไม่ทำให้เลื่อนหน้าหรือกดปุ่มช้า
 * - pointer-events: none ทั้งชั้น · z-index 20 (ใต้แถบเมนู 40 และ popup 50)
 * - ปิดแล้วค่อย ๆ จางหายก่อนถอดออกจากหน้า · เครื่องที่ตั้ง "ลดการเคลื่อนไหว" ไว้จะไม่เล่นเลย
 */

/** เลขสุ่มแบบคงที่ (ฝั่งเซิร์ฟเวอร์กับเบราว์เซอร์ตรงกัน แต่ยังดูสุ่มเป็นธรรมชาติ) */
const rnd = (i: number, n: number) => (Math.sin((i + 1) * n) + 1) / 2;

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
  kind: (i % 3) as 0 | 1 | 2, // 0 = เม็ดหิมะนุ่ม · 1 = คริสตัลทึบ (SVG) · 2 = คริสตัลลายเส้น (ภาพ)
  far: i % 5 === 2,
}));

/** เกล็ดลายเส้นโปร่งต้องใหญ่กว่าเล็กน้อยจึงจะเห็นลาย */
const SIZE_BOOST = [0, 6, 11] as const;

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
  /** ทุก ๆ 4 กลีบ จะมีดอกซากุระเต็มดอก 1 ดอกปลิวมาด้วย */
  bloom: i % 4 === 1 ? (["a", "b", "c"] as const)[i % 3] : null,
}));

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
  /** ทุก ๆ 3 ใบ จะเป็นใบเมเปิลภาพจริง ที่เหลือเป็นใบแปะก๊วย/เมเปิลวาดเส้น */
  photo: i % 3 === 2 ? (["a", "b", "c"] as const)[Math.floor(i / 3) % 3] : null,
}));

/** ⭐ ดาวกระพริบ — อยู่กับที่ ไม่ตก */
const STARS = Array.from({ length: 16 }, (_, i) => ({
  left: +(rnd(i, 17.331) * 96 + 2).toFixed(2),
  top: +(rnd(i, 53.117) * 88 + 2).toFixed(2),
  size: +(6 + rnd(i, 39.907) * 8).toFixed(2),
  beat: +(2.4 + rnd(i, 82.311) * 3).toFixed(2),
  delay: +(-rnd(i, 66.007) * 6).toFixed(2),
  tone: (i % 5) as 0 | 1 | 2 | 3 | 4,
}));

/** 🌠 ดาวตก — พุ่งผ่านเป็นระยะ ไม่พร้อมกัน */
const SHOOTS = [
  { top: 8, left: 62, len: 120, dur: 1.5, gap: 9, delay: 1.2, tone: 0 },
  { top: 26, left: 84, len: 150, dur: 1.8, gap: 13, delay: 5.5, tone: 1 },
  { top: 48, left: 40, len: 100, dur: 1.4, gap: 17, delay: 10.5, tone: 2 },
];

/** 🌸 ประกายดอกไม้เล็ก ๆ ที่ดาวตกทิ้งไว้ชั่วครู่ */
const SPARKS = [
  { top: 18, left: 30, dur: 11, delay: 3 },
  { top: 58, left: 72, dur: 13, delay: 8 },
  { top: 76, left: 18, dur: 12, delay: 14 },
];

export function Ambient() {
  const { effect, ready, reduced } = useAmbient();
  const [shown, setShown] = useState<typeof effect>("none");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ready || reduced || effect === "none") {
      setVisible(false);
      const t = window.setTimeout(() => setShown("none"), 700); // เฟดออกให้จบก่อนค่อยถอดออก
      return () => window.clearTimeout(t);
    }
    setShown(effect);
    const t = window.setTimeout(() => setVisible(true), 20); // เฟดเข้า
    return () => window.clearTimeout(t);
  }, [effect, ready, reduced]);

  if (shown === "none") return null;

  return (
    <div className={`fx-layer no-print fx-${shown}`} data-visible={visible ? "on" : "off"} aria-hidden>
      {shown === "winter" && <Winter />}
      {shown === "starlight" && <Starlight />}
      {shown === "sakura" && <Sakura />}
      {shown === "autumn" && <Autumn />}
    </div>
  );
}

/* ---------- ❄️ หิมะ ---------- */
function Winter() {
  return (
    <>
      {FLAKES.map((f, i) => (
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

/* ---------- 🌸 กลีบซากุระ ---------- */
const PETAL_COLORS = [
  ["#ffffff", "#ffc2d6"], // ชมพูอ่อน
  ["#fff0f5", "#f2a1bd"], // ชมพูเข้มขึ้นนิด
  ["#f6f0fc", "#d9c3f1"], // ลาเวนเดอร์
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
                {/* กลีบซากุระ — ปลายกลีบเว้าเป็นรูปตัว V ตามดอกจริง */}
                <path d="M12 1.6c4 4 7.2 8.8 7.2 13 0 3.1-1.6 5.6-4.2 6.9L12 17.2l-3 4.3c-2.6-1.3-4.2-3.8-4.2-6.9 0-4.2 3.2-9 7.2-13Z" fill={`url(#pt-${i})`} />
              </svg>
            )}
          </span>
        </span>
      ))}
    </>
  );
}

/* ---------- 🍂 ใบไม้ร่วง — ใบแปะก๊วยสีทองเป็นหลัก แซมใบเมเปิลส้ม/แดง ---------- */
const LEAF_COLORS = [
  ["#fff0b8", "#e8b52e"], // แปะก๊วยเหลืองทอง
  ["#ffe08a", "#d99a1f"], // แปะก๊วยทองเข้ม
  ["#ffc59b", "#d9542e"], // เมเปิลส้ม–แดง
];

function Autumn() {
  return (
    <>
      {LEAVES.map((l, i) => (
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
                {/* 🌿 ใบแปะก๊วย — พัดกว้าง เว้าตรงกลาง มีก้านเล็ก ๆ */}
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

/* ---------- 🌠 แสงดาว ---------- */
const STAR_COLORS = ["#ffffff", "#dcd2f5", "#dcebfa", "#ffd9e6", "#ffe9b8"];

function Starlight() {
  return (
    <>
      {/* 🌙 พระจันทร์เสี้ยวเล็ก ๆ มุมขวาบน */}
      <svg viewBox="0 0 40 40" className="fx-moon">
        <defs>
          <linearGradient id="fx-moon-g" x1="20%" y1="10%" x2="80%" y2="90%">
            <stop offset="0%" stopColor="#fff6da" />
            <stop offset="100%" stopColor="#f7d35a" />
          </linearGradient>
        </defs>
        <path d="M26 4a16 16 0 1 0 10 28A18 18 0 0 1 26 4Z" fill="url(#fx-moon-g)" />
      </svg>

      {STARS.map((s, i) => (
        <span
          key={i}
          className="fx-star"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.size}px`, height: `${s.size}px`, animationDuration: `${s.beat}s`, animationDelay: `${s.delay}s` }}
        >
          <Sparkle color={STAR_COLORS[s.tone]} />
        </span>
      ))}

      {SHOOTS.map((s, i) => (
        <span
          key={i}
          className="fx-shoot"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            ["--tail" as string]: `${s.len}px`,
            ["--hue" as string]: STAR_COLORS[s.tone],
            animationDuration: `${s.gap}s`,
            animationDelay: `${s.delay}s`,
          }}
        >
          <span className="fx-shoot-tail" />
          <span className="fx-shoot-head">
            <Sparkle color={STAR_COLORS[s.tone]} />
          </span>
        </span>
      ))}

      {/* 🌸 ประกายดอกไม้เล็ก ๆ ที่ดาวตกทิ้งไว้ชั่วครู่ */}
      {SPARKS.map((p, i) => (
        <span key={i} className="fx-bloom" style={{ top: `${p.top}%`, left: `${p.left}%`, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}>
          <svg viewBox="0 0 24 24" className="block size-full">
            {[0, 72, 144, 216, 288].map((deg) => (
              <ellipse key={deg} cx="12" cy="6.5" rx="3.1" ry="5" fill="#f6ecff" transform={`rotate(${deg} 12 12)`} />
            ))}
            <circle cx="12" cy="12" r="2.4" fill="#f7d35a" />
          </svg>
        </span>
      ))}
    </>
  );
}

/** ประกายดาว 4 แฉกนุ่ม ๆ */
function Sparkle({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="block size-full">
      <path d="M12 0c.7 6.6 4.7 10.6 12 12-7.3 1.4-11.3 5.4-12 12-.7-6.6-4.7-10.6-12-12C7.3 10.6 11.3 6.6 12 0Z" fill={color} />
    </svg>
  );
}
