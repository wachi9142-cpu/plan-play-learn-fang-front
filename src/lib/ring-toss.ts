/**
 * 💧 ฟิสิกส์ของเกมโยนห่วงใต้น้ำ — แยกจากหน้าจอเพื่อให้ทดสอบได้
 *
 * จำลอง 3 อย่างตามของเล่นจริง
 *   1) แรงลอยกับแรงโน้มถ่วง — ห่วงค่อย ๆ จมลงเองเมื่อไม่มีแรงดัน
 *   2) แรงดันน้ำจากหัวฉีด — กดปุ่มค้างแล้วน้ำพุ่งขึ้น ดันห่วงลอยขึ้นและหมุนวน
 *   3) ความเฉื่อยและแรงต้านของน้ำ — ปล่อยปุ่มแล้วห่วงยังไหลต่ออีกพักหนึ่ง
 *
 * หน่วยทั้งหมดเป็น cqw (1 หน่วย = 1% ของความกว้างตู้)
 */

export interface Ring {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** รัศมีวงนอก */
  r: number;
  color: string;
  /** คล้องเสาไหนอยู่ (null = ยังลอยอยู่) */
  onPeg: number | null;
  /** ลำดับที่ซ้อนอยู่บนเสา */
  stack: number;
  /** องศาเอียงตอนลอย ใช้วาดให้ดูมีชีวิต */
  spin: number;
}

export interface Peg {
  x: number;
  /** ปลายเสาด้านบน */
  tipY: number;
  /** ฐานเสา */
  baseY: number;
}

export interface World {
  /** ความกว้าง-สูงของน้ำในตู้ */
  w: number;
  h: number;
  /** ผิวน้ำ */
  top: number;
  pegs: Peg[];
  /** ตำแหน่งหัวฉีดซ้าย-ขวา */
  jets: { x: number; y: number }[];
}

export const PHYS = {
  /** แรงโน้มถ่วงสุทธิหลังหักแรงลอย — บวก = จมช้า ๆ */
  sink: 16,
  /** แรงต้านของน้ำต่อวินาที (ยิ่งน้อยยิ่งหนืด) */
  drag: 0.12,
  /** แรงดันจากหัวฉีด */
  jet: 520,
  /** ระยะที่แรงดันยังส่งถึง */
  jetRange: 52,
  /** ความปั่นป่วนของน้ำ */
  turbulence: 22,
  /** ความยืดหยุ่นตอนชนขอบตู้ */
  bounce: 0.45,
  /** ความยืดหยุ่นตอนห่วงชนกัน */
  ringBounce: 0.6,
  /** ความกว้างของรูห่วง เทียบกับรัศมีนอก */
  holeRatio: 0.52,
  /** ความหนาของห่วงตอนซ้อนบนเสา */
  stackGap: 2.6,
  /** ซ้อนได้สูงสุดต่อเสา */
  maxStack: 8,
};

/** ห่วงคล้องเสาได้เมื่อรูห่วงครอบปลายเสาพอดีขณะเคลื่อนลง */
export function tryCatch(ring: Ring, prevY: number, pegs: Peg[]): number | null {
  if (ring.onPeg !== null) return null;
  /* ต้องเคลื่อนลงเท่านั้น — ลอยขึ้นผ่านเสาไม่นับ */
  if (ring.y <= prevY) return null;
  const hole = ring.r * PHYS.holeRatio;
  for (let i = 0; i < pegs.length; i++) {
    const p = pegs[i];
    /* รูห่วงต้องครอบแกนเสาอยู่ */
    if (Math.abs(ring.x - p.x) > hole) continue;
    /* จุดศูนย์กลางห่วงต้องข้ามปลายเสาลงมาในเฟรมนี้ */
    if (prevY <= p.tipY && ring.y > p.tipY) return i;
  }
  return null;
}

/** ความสูงที่ห่วงจะไปหยุดบนเสา */
export const stackY = (peg: Peg, stack: number) => peg.baseY - stack * PHYS.stackGap - PHYS.stackGap / 2;

export interface StepInput {
  rings: Ring[];
  world: World;
  dt: number;
  /** หัวฉีดที่กำลังกดอยู่ */
  jetLeft: boolean;
  jetRight: boolean;
  /** ใช้เลขสุ่มแบบกำหนดได้ตอนทดสอบ */
  rnd?: () => number;
}

export interface StepResult {
  /** ห่วงที่เพิ่งคล้องได้ในเฟรมนี้ */
  caught: { ring: Ring; peg: number }[];
}

/** เดินฟิสิกส์ไป 1 เฟรม — แก้ไข rings ในที่ */
export function step({ rings, world, dt, jetLeft, jetRight, rnd = Math.random }: StepInput): StepResult {
  const caught: { ring: Ring; peg: number }[] = [];
  const pressed = [jetLeft, jetRight];

  for (const ring of rings) {
    /* ห่วงที่คล้องแล้วค่อย ๆ ไหลลงไปกองที่ฐานเสา */
    if (ring.onPeg !== null) {
      const peg = world.pegs[ring.onPeg];
      const target = stackY(peg, ring.stack);
      ring.x = peg.x;
      ring.y = Math.min(target, ring.y + 42 * dt);
      ring.vx = 0; ring.vy = 0;
      continue;
    }

    const prevY = ring.y;

    /* แรงโน้มถ่วงสุทธิ */
    ring.vy += PHYS.sink * dt;

    /* แรงดันจากหัวฉีดที่กดอยู่ */
    for (let j = 0; j < world.jets.length; j++) {
      if (!pressed[j]) continue;
      const jet = world.jets[j];
      const dx = ring.x - jet.x;
      const dy = ring.y - jet.y;
      const dist = Math.hypot(dx, dy);
      if (dist > PHYS.jetRange) continue;
      /* ใกล้หัวฉีดแรงมาก ไกลออกไปแรงลดลง */
      const falloff = 1 - dist / PHYS.jetRange;
      const power = PHYS.jet * falloff * falloff * dt;
      /* น้ำพุ่งขึ้นเป็นหลัก แล้วบานออกด้านข้างตามตำแหน่งห่วง */
      ring.vy -= power;
      ring.vx += (dx / (dist || 1)) * power * 0.45;
      /* ความปั่นป่วน ทำให้ห่วงส่ายไปมาเหมือนของจริง */
      ring.vx += (rnd() - 0.5) * PHYS.turbulence * falloff;
      ring.vy += (rnd() - 0.5) * PHYS.turbulence * falloff * 0.5;
      ring.spin += (rnd() - 0.5) * 220 * dt;
    }

    /* แรงต้านของน้ำ — ทำให้มีความเฉื่อย ไม่หยุดทันทีที่ปล่อยปุ่ม */
    const damp = Math.pow(PHYS.drag, dt);
    ring.vx *= damp;
    ring.vy *= damp;

    ring.x += ring.vx * dt;
    ring.y += ring.vy * dt;
    ring.spin += ring.vx * dt * 2;

    /* ชนขอบตู้ */
    if (ring.x < ring.r) { ring.x = ring.r; ring.vx = Math.abs(ring.vx) * PHYS.bounce; }
    if (ring.x > world.w - ring.r) { ring.x = world.w - ring.r; ring.vx = -Math.abs(ring.vx) * PHYS.bounce; }
    if (ring.y < world.top + ring.r) { ring.y = world.top + ring.r; ring.vy = Math.abs(ring.vy) * PHYS.bounce; }
    if (ring.y > world.h - ring.r) { ring.y = world.h - ring.r; ring.vy = -Math.abs(ring.vy) * PHYS.bounce; }

    /* คล้องเสาได้ไหม */
    const peg = tryCatch(ring, prevY, world.pegs);
    if (peg !== null) {
      const stack = rings.filter((r) => r.onPeg === peg).length;
      if (stack < PHYS.maxStack) {
        ring.onPeg = peg;
        ring.stack = stack;
        ring.vx = 0; ring.vy = 0;
        caught.push({ ring, peg });
      }
    }
  }

  /* ห่วงชนกันเอง — ดันออกจากกันเบา ๆ */
  for (let i = 0; i < rings.length; i++) {
    const a = rings[i];
    if (a.onPeg !== null) continue;
    for (let j = i + 1; j < rings.length; j++) {
      const b = rings[j];
      if (b.onPeg !== null) continue;
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.hypot(dx, dy);
      const min = a.r + b.r;
      if (d === 0 || d >= min) continue;
      const push = (min - d) / 2;
      const nx = dx / d, ny = dy / d;
      a.x -= nx * push; a.y -= ny * push;
      b.x += nx * push; b.y += ny * push;
      const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if (rel < 0) {
        const imp = rel * PHYS.ringBounce;
        a.vx += nx * imp; a.vy += ny * imp;
        b.vx -= nx * imp; b.vy -= ny * imp;
      }
    }
  }

  return { caught };
}
