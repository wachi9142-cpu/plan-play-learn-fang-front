/**
 * 🥚 ตรรกะกระดานของเกมยิงไข่ — แยกจากหน้าจอเพื่อให้ทดสอบได้
 *
 * กระดานเป็นแบบรังผึ้ง แถวคี่เยื้องไปครึ่งช่อง
 * ยิงไข่ไปติดช่องว่าง → ถ้าไข่แบบเดียวกันติดกันครบ 3 ฟองขึ้นไปจะแตก
 * ไข่ที่เหลือซึ่งไม่ต่อกับแถวบนสุดแล้วจะร่วงลงมาเองด้วย
 */

export interface Egg { r: number; c: number; kind: string }
export type EggMap = Record<string, Egg>;

export const key = (r: number, c: number) => `${r},${c}`;

/** จำนวนช่องของแถวนั้น — แถวคี่เยื้องครึ่งช่องจึงมีน้อยกว่า 1 ช่อง */
export const widthOf = (cols: number, r: number) => (r % 2 === 1 ? cols - 1 : cols);

/** เพื่อนบ้าน 6 ทิศของช่องแบบรังผึ้ง */
export function neighbours(r: number, c: number): [number, number][] {
  return r % 2 === 1
    ? [[r, c - 1], [r, c + 1], [r - 1, c], [r - 1, c + 1], [r + 1, c], [r + 1, c + 1]]
    : [[r, c - 1], [r, c + 1], [r - 1, c - 1], [r - 1, c], [r + 1, c - 1], [r + 1, c]];
}

/** ช่องที่ยังต่อถึงแถวบนสุด */
export function connected(map: EggMap): Set<string> {
  const seen = new Set<string>();
  const stack: string[] = [];
  for (const k in map) if (map[k].r === 0) { seen.add(k); stack.push(k); }
  while (stack.length) {
    const e = map[stack.pop()!];
    for (const [nr, nc] of neighbours(e.r, e.c)) {
      const nk = key(nr, nc);
      if (map[nk] && !seen.has(nk)) { seen.add(nk); stack.push(nk); }
    }
  }
  return seen;
}

/** กลุ่มไข่แบบเดียวกันที่ติดกันกับช่องเริ่มต้น */
export function sameGroup(map: EggMap, r: number, c: number): Set<string> {
  const start = key(r, c);
  const kind = map[start]?.kind;
  if (!kind) return new Set();
  const group = new Set([start]);
  const stack = [start];
  while (stack.length) {
    const e = map[stack.pop()!];
    for (const [nr, nc] of neighbours(e.r, e.c)) {
      const nk = key(nr, nc);
      if (map[nk]?.kind === kind && !group.has(nk)) { group.add(nk); stack.push(nk); }
    }
  }
  return group;
}

export interface SettleResult {
  map: EggMap;
  /** ช่องที่ไข่ไปติด */
  landed: { r: number; c: number };
  /** ไข่ที่แตกเพราะครบ 3 */
  popped: Egg[];
  /** ไข่ที่ร่วงเพราะขาดจากแถวบน */
  dropped: Egg[];
}

/**
 * วางไข่ลงช่องว่างที่ใกล้จุดชนที่สุด แล้วคิดผลที่ตามมา
 * cxy คือฟังก์ชันแปลงช่องเป็นพิกัดบนจอ ใช้หาช่องที่ใกล้ที่สุด
 */
export function settleEgg(
  map: EggMap,
  kind: string,
  hit: { x: number; y: number },
  cols: number,
  maxRows: number,
  cxy: (r: number, c: number) => { x: number; y: number },
): SettleResult {
  const next: EggMap = { ...map };

  let best: { r: number; c: number; d: number } | null = null;
  for (let r = 0; r <= maxRows; r++) {
    for (let c = 0; c < widthOf(cols, r); c++) {
      if (next[key(r, c)]) continue;
      /* ช่องที่ติดกับไข่เดิมเท่านั้น (หรือแถวบนสุด) จึงจะวางได้ */
      const touching = r === 0 || neighbours(r, c).some(([nr, nc]) => next[key(nr, nc)]);
      if (!touching) continue;
      const p = cxy(r, c);
      const d = (p.x - hit.x) ** 2 + (p.y - hit.y) ** 2;
      if (!best || d < best.d) best = { r, c, d };
    }
  }
  if (!best) return { map: next, landed: { r: 0, c: 0 }, popped: [], dropped: [] };

  next[key(best.r, best.c)] = { r: best.r, c: best.c, kind };

  const group = sameGroup(next, best.r, best.c);
  const popped: Egg[] = [];
  const dropped: Egg[] = [];

  if (group.size >= 3) {
    for (const k of group) { popped.push(next[k]); delete next[k]; }
    const keep = connected(next);
    for (const k in next) if (!keep.has(k)) { dropped.push(next[k]); delete next[k]; }
  }

  return { map: next, landed: { r: best.r, c: best.c }, popped, dropped };
}

/** ดันไข่ทั้งกระดานลง 1 แถว แล้วเติมแถวใหม่ด้านบน */
export function pushDown(map: EggMap, cols: number, kinds: string[]): EggMap {
  const moved: EggMap = {};
  for (const k in map) { const e = map[k]; moved[key(e.r + 1, e.c)] = { ...e, r: e.r + 1 }; }
  for (let c = 0; c < widthOf(cols, 0); c++) {
    moved[key(0, c)] = { r: 0, c, kind: kinds[Math.floor(Math.random() * kinds.length)] };
  }
  return moved;
}

/** แถวล่างสุดที่มีไข่อยู่ */
export const lowestRow = (map: EggMap) => {
  const rows = Object.values(map).map((e) => e.r);
  return rows.length ? Math.max(...rows) : -1;
};
