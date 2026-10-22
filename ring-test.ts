/** เทสฟิสิกส์เกมโยนห่วงใต้น้ำ */
import { PHYS, stackY, step, tryCatch, type Ring, type World } from "./src/lib/ring-toss";

let pass = 0, fail = 0;
const t = (name: string, cond: boolean, extra?: unknown) => {
  if (cond) pass++; else { fail++; console.log("❌", name, JSON.stringify(extra ?? "")); }
};

const world: World = {
  w: 100, h: 66, top: 6,
  pegs: [{ x: 36, tipY: 38, baseY: 58 }, { x: 64, tipY: 38, baseY: 58 }],
  jets: [{ x: 12, y: 62 }, { x: 88, y: 62 }],
};

let id = 1;
const mkRing = (x: number, y: number, vx = 0, vy = 0): Ring =>
  ({ id: id++, x, y, vx, vy, r: 3.4, color: "#f00", onPeg: null, stack: 0, spin: 0 });

/* เลขสุ่มแบบคงที่ จะได้ผลเหมือนเดิมทุกครั้ง */
let seed = 12345;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };

/* 1) ไม่กดปุ่ม ห่วงต้องค่อย ๆ จมลง */
{
  const r = mkRing(50, 20);
  for (let i = 0; i < 60; i++) step({ rings: [r], world, dt: 1 / 60, jetLeft: false, jetRight: false, rnd });
  t("ไม่กดปุ่ม ห่วงจมลง", r.y > 20, { y: r.y.toFixed(1) });
  t("จมช้า ๆ ไม่ดิ่งพรวด", r.y < 40, { y: r.y.toFixed(1) });
}

/* 2) กดปุ่มซ้าย ห่วงฝั่งซ้ายต้องลอยขึ้น */
{
  const r = mkRing(16, 56);
  const y0 = r.y;
  for (let i = 0; i < 40; i++) step({ rings: [r], world, dt: 1 / 60, jetLeft: true, jetRight: false, rnd });
  t("กดซ้ายแล้วห่วงฝั่งซ้ายลอยขึ้น", r.y < y0 - 5, { from: y0, to: r.y.toFixed(1) });
}

/* 3) ห่วงไกลหัวฉีดต้องแทบไม่ขยับจากแรงดัน */
{
  const far = mkRing(92, 14);
  const y0 = far.y;
  for (let i = 0; i < 40; i++) step({ rings: [far], world, dt: 1 / 60, jetLeft: true, jetRight: false, rnd });
  t("ห่วงไกลหัวฉีดไม่ถูกดันขึ้น", far.y >= y0, { from: y0, to: far.y.toFixed(1) });
}

/* 4) ความเฉื่อย — ปล่อยปุ่มแล้วยังไหลต่ออีกพัก */
{
  const r = mkRing(50, 30, 40, 0);
  const x0 = r.x;
  step({ rings: [r], world, dt: 1 / 60, jetLeft: false, jetRight: false, rnd });
  const afterOne = r.x;
  for (let i = 0; i < 10; i++) step({ rings: [r], world, dt: 1 / 60, jetLeft: false, jetRight: false, rnd });
  t("ปล่อยปุ่มแล้วห่วงยังไหลต่อ", r.x > afterOne && afterOne > x0, { x0, afterOne: afterOne.toFixed(2), end: r.x.toFixed(2) });
  t("แล้วค่อย ๆ ช้าลง", Math.abs(r.vx) < 40, { vx: r.vx.toFixed(2) });
}

/* 5) คล้องเสาได้เมื่อรูห่วงครอบปลายเสาขณะเคลื่อนลง */
{
  const r = mkRing(36, 37);
  const peg = tryCatch({ ...r, y: 39 }, 37, world.pegs);
  t("รูห่วงครอบเสาแล้วคล้องได้", peg === 0, peg);
}

/* 6) เคลื่อนขึ้นผ่านเสาต้องไม่นับว่าคล้อง */
{
  const r = mkRing(36, 37);
  const peg = tryCatch({ ...r, y: 37 }, 39, world.pegs);
  t("ลอยขึ้นผ่านเสาไม่นับว่าคล้อง", peg === null, peg);
}

/* 7) ห่วงเยื้องจากเสาเกินรูต้องไม่คล้อง */
{
  const off = 36 + 3.4 * PHYS.holeRatio + 0.5;
  const peg = tryCatch({ ...mkRing(off, 37), y: 39 }, 37, world.pegs);
  t("ห่วงเยื้องเกินรูไม่คล้อง", peg === null, { off, peg });
}

/* 8) คล้องแล้วต้องไหลลงไปกองที่ฐานและหยุดนิ่ง */
{
  const r = mkRing(36, 37, 0, 20);
  const rings = [r];
  let got = 0;
  for (let i = 0; i < 180; i++) {
    const out = step({ rings, world, dt: 1 / 60, jetLeft: false, jetRight: false, rnd });
    got += out.caught.length;
  }
  t("คล้องได้ 1 ครั้ง", got === 1, got);
  t("ห่วงอยู่บนเสา", r.onPeg === 0, r.onPeg);
  t("ไหลลงไปหยุดที่ฐานเสา", Math.abs(r.y - stackY(world.pegs[0], 0)) < 0.5, { y: r.y.toFixed(2), want: stackY(world.pegs[0], 0) });
  t("ห่วงที่คล้องแล้วหยุดนิ่ง", r.vx === 0 && r.vy === 0);
}

/* 9) ไม่นับคะแนนซ้ำ */
{
  const r = mkRing(36, 37, 0, 20);
  const rings = [r];
  let got = 0;
  for (let i = 0; i < 400; i++) got += step({ rings, world, dt: 1 / 60, jetLeft: true, jetRight: true, rnd }).caught.length;
  t("ห่วงเดิมไม่ถูกนับซ้ำ", got === 1, got);
}

/* 10) ซ้อนกันบนเสา ไม่ทับที่เดียวกัน */
{
  const rings = [mkRing(36, 37, 0, 20), mkRing(36, 30, 0, 20), mkRing(36, 24, 0, 20)];
  for (let i = 0; i < 400; i++) step({ rings, world, dt: 1 / 60, jetLeft: false, jetRight: false, rnd });
  const on = rings.filter((r) => r.onPeg === 0);
  t("คล้องได้ทั้ง 3 วง", on.length === 3, on.length);
  const ys = on.map((r) => Math.round(r.y * 10) / 10);
  t("ซ้อนกันคนละชั้น ไม่ทับกัน", new Set(ys).size === 3, ys);
  t("ชั้นล่างสุดอยู่ต่ำกว่าชั้นบน", Math.max(...ys) > Math.min(...ys), ys);
}

/* 11) ห่วงต้องไม่หลุดออกนอกตู้ */
{
  const rings = Array.from({ length: 16 }, (_, i) => mkRing(8 + (i % 8) * 11, 12 + Math.floor(i / 8) * 8, (rnd() - 0.5) * 120, (rnd() - 0.5) * 120));
  let bad = "";
  for (let i = 0; i < 1200; i++) {
    step({ rings, world, dt: 1 / 60, jetLeft: i % 40 < 12, jetRight: i % 40 >= 20 && i % 40 < 32, rnd });
    for (const r of rings) {
      if (!Number.isFinite(r.x) || !Number.isFinite(r.y)) { bad = `ค่าพัง id ${r.id}`; break; }
      if (r.onPeg !== null) continue;
      if (r.x < r.r - 0.6 || r.x > world.w - r.r + 0.6) { bad = `หลุดด้านข้าง x=${r.x.toFixed(1)}`; break; }
      if (r.y < world.top + r.r - 0.6 || r.y > world.h - r.r + 0.6) { bad = `หลุดบน/ล่าง y=${r.y.toFixed(1)}`; break; }
    }
    if (bad) break;
  }
  t("เล่น 1200 เฟรม ห่วงไม่หลุดออกนอกตู้และค่าไม่พัง", bad === "", bad);
  const caughtCount = rings.filter((r) => r.onPeg !== null).length;
  t("กดสลับซ้ายขวาแล้วมีห่วงคล้องได้จริง", caughtCount > 0, { caughtCount });
}

/* 12) ห่วงไม่ซ้อนทับกันจนกลายเป็นวงเดียว */
{
  const rings = [mkRing(50, 30), mkRing(50.5, 30.2)];
  for (let i = 0; i < 30; i++) step({ rings, world, dt: 1 / 60, jetLeft: false, jetRight: false, rnd });
  const d = Math.hypot(rings[0].x - rings[1].x, rings[0].y - rings[1].y);
  t("ห่วงสองวงดันออกจากกัน", d > rings[0].r, { d: d.toFixed(2), r: rings[0].r });
}

console.log(`\n✅ ผ่าน ${pass} ข้อ · ❌ ไม่ผ่าน ${fail} ข้อ`);
process.exit(fail ? 1 : 0);
