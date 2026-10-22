"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Store } from "lucide-react";
import { GameShell, type GameOutcome } from "@/components/games/GameShell";
import { starsFor } from "@/lib/game-levels";
import {
  BUYER, FAIR_TIPS, FISH_COLORS, FISH_KINDS, SCOOPS,
  fishKind, findScoop, rollFishKind, scoopState,
  type FishColor, type FishKind,
} from "@/data/scoop-fish";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;

interface Fish {
  id: number;
  kind: FishKind;
  color: FishColor;
  /** ตำแหน่ง % ของอ่าง */
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** เวลาที่เหลือก่อนเปลี่ยนทิศ */
  turnMs: number;
  /** กำลังว่ายหนีช้อนอยู่ไหม (ปลาตัวกลางหลบเก่ง) */
  flee: number;
}

/** ปลาที่อยู่ในแก้ว */
interface Caught { id: number; kind: FishKind; color: FishColor; name: string }

/** ผิวน้ำอยู่ที่ 30% ของฉาก — ยกช้อนพ้นเส้นนี้ถือว่าช้อนปลาขึ้นมาได้ */
const WATER_TOP = 30;
const BASIN_BOTTOM = 94;

const fishName = (k: FishKind, c: FishColor) => `${fishKind(k).baseName}${c.name}`;

/**
 * 🥅 ช้อนปลางานวัด
 *
 * เลื่อนเมาส์บังคับช้อนกระดาษ · กดเมาส์ค้างเพื่อจ้วงลงไปในน้ำ
 * ช้อนแตะตัวปลา = ปลาขึ้นมาอยู่บนช้อน แล้วค่อย ๆ ยกขึ้นให้พ้นผิวน้ำ
 *   • ยกเร็ว = กระดาษเปื่อยเร็ว แต่ปลามีเวลาดิ้นน้อย
 *   • ยกช้า = กระดาษทนกว่า แต่ปลาดิ้นหลุดง่ายขึ้น
 * กระดาษขาด = หมดช้อน 1 อัน ต้องซื้อใหม่ด้วยเงินที่ขายปลาได้
 */
export function ScoopFishGame({
  goal = 10,
  fishCount = 12,
  scoopsStart = 4,
  wearRate = 1,
  startMoney = 10,
  onDone,
}: {
  /** ช้อนปลาให้ได้กี่ตัวถึงจบรอบ */
  goal?: number;
  /** จำนวนปลาในอ่าง */
  fishCount?: number;
  /** ช้อนที่มีตอนเริ่ม */
  scoopsStart?: number;
  /** ตัวคูณความเปื่อยของกระดาษ — ระดับยากเปื่อยเร็วกว่า */
  wearRate?: number;
  startMoney?: number;
  onDone?: Cb;
}) {
  const [phase, setPhase] = useState<"ready" | "play" | "pause" | "over">("ready");
  const [score, setScore] = useState(0);
  const [money, setMoney] = useState(startMoney);
  const [cup, setCup] = useState<Caught[]>([]);
  const [scoops, setScoops] = useState(scoopsStart);
  const [scoopId, setScoopId] = useState(SCOOPS[0].id);
  /** % ความสมบูรณ์ของกระดาษที่เหลือ — เริ่มที่ 100 คือใหม่เอี่ยม */
  const [wear, setWear] = useState(100);
  const [toast, setToast] = useState<{ text: string; tone: "good" | "oops" | "info" } | null>(null);
  const [ids, setIds] = useState<{ id: number; kind: FishKind; color: FishColor }[]>([]);
  const [holding, setHolding] = useState<{ kind: FishKind; color: FishColor } | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [buyerOpen, setBuyerOpen] = useState(false);
  const [tipIdx, setTipIdx] = useState(0);

  const wrap = useRef<HTMLDivElement>(null);
  const fish = useRef<Fish[]>([]);
  const els = useRef<Map<number, HTMLSpanElement>>(new Map());
  const scoopEl = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const box = useRef({ w: 0, h: 0 });

  /** สถานะช้อนที่อัปเดตทุกเฟรม เก็บใน ref เพื่อไม่ให้ re-render รัว */
  const sc = useRef({ x: 50, y: 18, down: false, wear: 0, hold: null as Fish | null, prevY: 18 });
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  const strengthRef = useRef(findScoop(SCOOPS[0].id).strength);
  useEffect(() => { strengthRef.current = findScoop(scoopId).strength; }, [scoopId]);

  const makeFish = useCallback((edge = true): Fish => {
    const k = rollFishKind();
    const t = fishKind(k);
    const color = FISH_COLORS[Math.floor(Math.random() * FISH_COLORS.length)];
    const dir = Math.random() < 0.5 ? -1 : 1;
    const sp = t.speed[0] + Math.random() * (t.speed[1] - t.speed[0]);
    return {
      id: nextId.current++,
      kind: k,
      color,
      x: edge ? (dir === 1 ? -8 : 108) : 8 + Math.random() * 84,
      y: WATER_TOP + 8 + Math.random() * (BASIN_BOTTOM - WATER_TOP - 14),
      vx: sp * dir,
      vy: (Math.random() - 0.5) * 6,
      turnMs: 800 + Math.random() * 1600,
      flee: 0,
    };
  }, []);

  const reset = useCallback(() => {
    fish.current = Array.from({ length: fishCount }, () => makeFish(false));
    setIds(fish.current.map((f) => ({ id: f.id, kind: f.kind, color: f.color })));
    els.current.clear();
    sc.current = { x: 50, y: 18, down: false, wear: 0, hold: null, prevY: 18 };
    setScore(0); setMoney(startMoney); setCup([]); setScoops(scoopsStart);
    setScoopId(SCOOPS[0].id); setWear(100); setHolding(null);
    setToast(null); setShopOpen(false); setBuyerOpen(false);
    setPhase("ready");
  }, [fishCount, makeFish, scoopsStart, startMoney]);

  // เตรียมอ่างหลังหน้าเว็บพร้อม เพื่อไม่ให้ฝั่งเซิร์ฟเวอร์กับเบราว์เซอร์ต่างกัน
  useEffect(() => { reset(); }, [reset]);

  /* ---------- ขนาดอ่าง ---------- */
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const read = () => { const b = el.getBoundingClientRect(); box.current = { w: b.width, h: b.height }; };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ---------- สลับแท็บแล้วพักเอง เวลาจะได้ไม่เดินทิ้ง ---------- */
  useEffect(() => {
    const onHide = () => { if (document.hidden && phaseRef.current === "play") setPhase("pause"); };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  /* ---------- กระดาษขาด ---------- */
  const tearPaper = useCallback(() => {
    const s = sc.current;
    const lost = s.hold;
    s.hold = null; s.wear = 0; s.down = false;
    setHolding(null); setWear(100);
    setScoops((n) => {
      const left = n - 1;
      setToast({
        text: lost
          ? `✂️ กระดาษขาด! ${fishName(lost.kind, lost.color)} หลุดกลับลงอ่าง — เหลือช้อนอีก ${Math.max(0, left)} อัน`
          : `✂️ กระดาษขาด — เหลือช้อนอีก ${Math.max(0, left)} อัน`,
        tone: "oops",
      });
      return left;
    });
    if (lost) {
      /* ปลาว่ายหนีออกไปทางเดิม */
      fish.current.push({ ...lost, id: nextId.current++, y: WATER_TOP + 12, flee: 1.2 });
      setIds((l) => [...l, { id: nextId.current - 1, kind: lost.kind, color: lost.color }]);
    }
  }, []);

  /* ---------- ลูปเกม ---------- */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const { w, h } = box.current;
      if (!w || !h) return;
      const running = phaseRef.current === "play";
      const s = sc.current;

      if (running) {
        /* ---- ปลาว่าย ---- */
        for (const f of fish.current) {
          f.turnMs -= dt * 1000;
          if (f.turnMs <= 0) {
            f.turnMs = 700 + Math.random() * 1800;
            const t2 = fishKind(f.kind);
            const sp = t2.speed[0] + Math.random() * (t2.speed[1] - t2.speed[0]);
            f.vx = sp * (Math.random() < 0.5 ? -1 : 1);
            f.vy = (Math.random() - 0.5) * 8;
          }

          /* ปลาตัวกลางและหางสวยหลบช้อนเก่ง */
          if (s.down && f.kind !== "guppy") {
            const dx = f.x - s.x, dy = f.y - s.y;
            const d = Math.hypot(dx, dy);
            if (d < 16 && d > 0.1) {
              const push = (f.kind === "fancy" ? 26 : 18) * (1 - d / 16);
              f.vx += (dx / d) * push * dt * 10;
              f.vy += (dy / d) * push * dt * 10;
            }
          }
          if (f.flee > 0) { f.flee -= dt; f.vx *= 1.01; }

          f.x += f.vx * dt;
          f.y += f.vy * dt;
          if (f.x < -10) f.x = 110;
          if (f.x > 110) f.x = -10;
          if (f.y < WATER_TOP + 6) { f.y = WATER_TOP + 6; f.vy = Math.abs(f.vy); }
          if (f.y > BASIN_BOTTOM - 4) { f.y = BASIN_BOTTOM - 4; f.vy = -Math.abs(f.vy); }
        }

        /* ---- ช้อน ---- */
        const strength = strengthRef.current;
        /* ระยะที่ยกขึ้นในเฟรมนี้ (หน่วย % ของความสูงอ่าง) */
        const upDist = Math.max(0, s.prevY - s.y);
        s.prevY = s.y;

        if (s.down && s.y > WATER_TOP) {
          /* จุ่มน้ำเฉย ๆ กระดาษเปียกช้า ๆ — ไม่ลงโทษการส่องหาปลา */
          s.wear += 3.5 * wearRate * dt;

          /* ยังไม่มีปลาบนช้อน — เช็กว่าแตะตัวปลาไหม */
          if (!s.hold) {
            for (let i = 0; i < fish.current.length; i++) {
              const f = fish.current[i];
              const ft = fishKind(f.kind);
              const dx = ((f.x - s.x) / 100) * w;
              const dy = ((f.y - s.y) / 100) * h;
              const r = ((ft.size + 5) / 100) * w * 0.55;
              if (dx * dx + dy * dy <= r * r) {
                s.hold = f;
                fish.current.splice(i, 1);
                els.current.delete(f.id);
                setIds((l) => l.filter((x) => x.id !== f.id));
                setHolding({ kind: f.kind, color: f.color });
                setToast({ text: `🥅 ${fishName(f.kind, f.color)} ขึ้นช้อนแล้ว! ค่อย ๆ ยกขึ้นนะ`, tone: "info" });
                break;
              }
            }
          }
        }

        /* มีปลาบนช้อน */
        if (s.hold) {
          const ft = fishKind(s.hold.kind);
          /* ถือปลาไว้ = หนักขึ้นตามน้ำหนักปลา · ยกขึ้นเป็นระยะทางยาว = เปื่อยเพิ่มตามระยะ
             ปลาตัวใหญ่จึงเสี่ยงกระดาษขาดกว่าปลาตัวเล็กชัดเจน */
          s.wear += ft.weight * 2.5 * wearRate * dt;
          s.wear += upDist * ft.weight * 0.5 * wearRate;
          /* ปลาดิ้น — กระดาษเปื่อยมากยิ่งหลุดง่าย */
          const slip = ft.wriggle * (1 + s.wear / strength) * dt;
          if (Math.random() < slip * 0.55) {
            const lost = s.hold;
            s.hold = null;
            setHolding(null);
            setToast({ text: `💦 ${fishName(lost.kind, lost.color)} ดิ้นหลุดว่ายหนีไปแล้ว ลองใหม่นะ`, tone: "oops" });
            fish.current.push({ ...lost, id: nextId.current++, y: Math.min(BASIN_BOTTOM - 6, s.y + 6), flee: 1.2 });
            setIds((l) => [...l, { id: nextId.current - 1, kind: lost.kind, color: lost.color }]);
          } else if (s.y <= WATER_TOP) {
            /* ยกพ้นผิวน้ำแล้ว = ช้อนได้! */
            const got = s.hold;
            s.hold = null;
            setHolding(null);
            const name = fishName(got.kind, got.color);
            setScore((n) => n + ft.score);
            setCup((c) => [...c, { id: got.id, kind: got.kind, color: got.color, name }]);
            setToast({ text: `🎉 ช้อนได้ ${name}! +${ft.score} คะแนน · ขายได้ ${ft.price} บาท`, tone: "good" });
            /* ปล่อยปลาตัวใหม่ลงอ่างแทน */
            const nf = makeFish(true);
            fish.current.push(nf);
            setIds((l) => [...l, { id: nf.id, kind: nf.kind, color: nf.color }]);
          }
        }

        /* กระดาษแห้งคืนตัวนิดหน่อยตอนยกขึ้นพ้นน้ำและไม่ได้จุ่ม */
        if (!s.down && s.y < WATER_TOP) s.wear = Math.max(0, s.wear - 1.5 * dt);

        if (s.wear >= strength) tearPaper();

        /* อัปเดตหลอดกระดาษให้ UI เห็น (ปัดเป็นจำนวนเต็ม ลด re-render) */
        const pct = Math.max(0, Math.round(100 - (s.wear / strength) * 100));
        setWear((prev) => (prev === pct ? prev : pct));
      }

      /* ---- วาด ---- */
      for (const f of fish.current) {
        const el = els.current.get(f.id);
        if (!el) continue;
        el.style.transform = `translate3d(${(f.x / 100) * w}px, ${(f.y / 100) * h}px, 0) translate(-50%, -50%) scaleX(${f.vx < 0 ? -1 : 1})`;
      }
      if (scoopEl.current) {
        scoopEl.current.style.transform = `translate3d(${(s.x / 100) * w}px, ${(s.y / 100) * h}px, 0) translate(-50%, -50%) rotate(${s.down ? 8 : -6}deg)`;
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [makeFish, tearPaper, wearRate]);

  /* ---------- หมดช้อน / ครบเป้า ---------- */
  useEffect(() => {
    if (phase !== "play") return;
    if (score >= goal) { setPhase("over"); return; }
    const cheapest = Math.min(...SCOOPS.map((s) => s.price));
    if (scoops <= 0 && money < cheapest && cup.length === 0) setPhase("over");
  }, [score, goal, scoops, money, cup.length, phase]);

  const reported = useRef(false);
  useEffect(() => {
    if (phase !== "over" || reported.current) return;
    reported.current = true;
    const miss = Math.max(0, goal - score);
    onDone?.({ mistakes: miss, total: goal, seconds: 0, timeUp: false, stars: starsFor(miss, goal, false) });
  }, [phase, score, goal, onDone]);
  useEffect(() => { if (phase === "play") reported.current = false; }, [phase]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---------- เมาส์ ---------- */
  const aim = (e: React.PointerEvent) => {
    const el = wrap.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    sc.current.x = Math.min(95, Math.max(5, ((e.clientX - b.left) / b.width) * 100));
    sc.current.y = Math.min(BASIN_BOTTOM - 2, Math.max(8, ((e.clientY - b.top) / b.height) * 100));
  };
  const dip = (e: React.PointerEvent) => {
    if (phaseRef.current !== "play") return;
    if (scoops <= 0) { setToast({ text: "ช้อนหมดแล้ว ไปซื้อช้อนใหม่ที่ร้านก่อนนะ", tone: "info" }); return; }
    /* จับ pointer ไว้ เด็กลากเลยขอบอ่างแล้วปลาจะได้ไม่หลุดกลางคัน */
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* บางเบราว์เซอร์ไม่รองรับ */ }
    aim(e);
    sc.current.down = true;
  };
  const lift = () => {
    const s = sc.current;
    s.down = false;
    /* ปล่อยปุ่มขณะปลายังอยู่ใต้น้ำ = ปลาหลุด */
    if (s.hold && s.y > WATER_TOP) {
      const lost = s.hold;
      s.hold = null;
      setHolding(null);
      setToast({ text: `💦 ปล่อยเร็วไป ${fishName(lost.kind, lost.color)} ว่ายหนีไปแล้ว — กดค้างไว้จนยกพ้นน้ำนะ`, tone: "oops" });
      fish.current.push({ ...lost, id: nextId.current++, flee: 1 });
      setIds((l) => [...l, { id: nextId.current - 1, kind: lost.kind, color: lost.color }]);
    }
  };

  /* ---------- ร้านค้า / ขายปลา ---------- */
  const buyScoop = (id: string) => {
    const s = findScoop(id);
    if (money < s.price) { setToast({ text: `เงินไม่พอ ${s.name} ราคา ${s.price} บาท — ลองเอาปลาในแก้วไปขายก่อน`, tone: "info" }); return; }
    setMoney((m) => m - s.price);
    setScoops((n) => n + 1);
    setScoopId(id);
    sc.current.wear = 0; setWear(100);
    setToast({ text: `${s.emoji} ซื้อ${s.name}แล้ว — ${s.about}`, tone: "good" });
  };

  const sellOne = (c: Caught) => {
    const ft = fishKind(c.kind);
    const before = money;
    setMoney((m) => m + ft.price);
    setCup((list) => list.filter((x) => x.id !== c.id));
    setToast({ text: `💰 ขาย${c.name} ได้ ${ft.price} บาท · เงิน ${before} → ${before + ft.price} บาท`, tone: "good" });
  };

  const sellAll = () => {
    if (cup.length === 0) return;
    const sum = cup.reduce((n, c) => n + fishKind(c.kind).price, 0);
    const before = money;
    setMoney((m) => m + sum);
    setCup([]);
    setToast({ text: `💰 ${BUYER.thanks} ขายทั้งหมด ${cup.length} ตัว ได้ ${sum} บาท · เงิน ${before} → ${before + sum} บาท`, tone: "good" });
  };

  const paper = scoopState(wear);
  const done = phase === "over";
  const cupValue = cup.reduce((n, c) => n + fishKind(c.kind).price, 0);

  return (
    <GameShell
      instruction={
        done ? `🎉 จบรอบ! ช้อนปลาได้ ${score} คะแนน · มีเงิน ${money} บาท · ในแก้วเหลือปลา ${cup.length} ตัว`
          : phase === "ready" ? "🎪 ยินดีต้อนรับสู่ซุ้มช้อนปลางานวัด — กด ▶ เริ่มเกม"
          : phase === "pause" ? "⏸ พักอยู่ — กดเล่นต่อได้เลย"
          : holding ? "ค่อย ๆ เลื่อนเมาส์ขึ้นจนช้อนพ้นผิวน้ำ อย่าปล่อยปุ่มนะ!"
          : "เลื่อนเมาส์บังคับช้อน · กดเมาส์ค้างเพื่อจ้วงลงน้ำ · ช้อนแตะตัวปลาแล้วยกขึ้น"
      }
      progress={{ current: Math.min(score, goal), total: goal }}
      done={done}
      onRestart={reset}
      stats={`${score} คะแนน · เงิน ${money} บาท · ปลาในแก้ว ${cup.length} ตัว`}
      mistakes={Math.max(0, goal - score)}
      total={goal}
      hideClock
      onDone={undefined}
    >
      {/* ───────── แถบสถานะ — แยกคะแนนกับเงินให้เห็นชัด ───────── */}
      <div className="mx-auto mb-3 flex max-w-4xl flex-wrap items-center justify-center gap-2">
        <span className="rounded-full bg-mint-soft px-3.5 py-1.5 font-display text-[16px] text-[#1f6b4d]">🥅 คะแนนช้อนปลา {score}/{goal}</span>
        <span className="rounded-full bg-yellow-soft px-3.5 py-1.5 font-display text-[16px] text-[#8a6a00]">💰 เงิน {money} บาท</span>
        <span className="rounded-full bg-sky-soft px-3.5 py-1.5 font-display text-[16px] text-purple-800">🥤 ในแก้ว {cup.length} ตัว</span>
        <span className="rounded-full bg-white px-3.5 py-1.5 font-display text-[16px] text-purple-800">{findScoop(scoopId).emoji} ช้อน {scoops} อัน</span>
      </div>

      {/* หลอดความทนของกระดาษ */}
      <div className="mx-auto mb-3 max-w-md">
        <div className="mb-1 flex items-center justify-between text-[13px]">
          <span className="text-ink-soft">กระดาษช้อน</span>
          <span className={cn(paper.tone === "good" ? "text-[#1f6b4d]" : paper.tone === "warn" ? "text-[#8a6a00]" : "text-[#a8456c]")}>
            {paper.emoji} {paper.label} {wear}%
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-cream-dark">
          <div
            className={cn("h-full rounded-full transition-[width]", wear > 60 ? "bg-mint-soft" : wear > 30 ? "bg-yellow-soft" : "bg-pink-accent")}
            style={{ width: `${wear}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        {/* ───────── ซุ้มและอ่างปลา ───────── */}
        <div>
          <div className="overflow-hidden rounded-3xl shadow-soft ring-1 ring-line">
            {/* ป้ายซุ้มและไฟประดับ */}
            <div className="relative bg-gradient-to-b from-[#e8453c] to-[#c5342c] px-3 py-2 text-center">
              <p className="font-display text-[17px] text-white!">🎪 ซุ้มช้อนปลางานวัด 🎏</p>
              <div className="mt-1 flex justify-center gap-1.5">
                {["#ffe066", "#ff8fab", "#8ce99a", "#74c0fc", "#ffd43b", "#f783ac", "#63e6be"].map((c, i) => (
                  <span key={i} className="inline-block size-2 rounded-full" style={{ background: c, opacity: 0.95 }} />
                ))}
              </div>
            </div>

            <div
              ref={wrap}
              onPointerMove={aim}
              onPointerDown={dip}
              onPointerUp={lift}
              /* เมาส์เลยขอบอ่าง ไม่ถือว่าปล่อยปลา — แค่หยุดจุ่ม ปลายังอยู่บนช้อน */
              onPointerLeave={() => { sc.current.down = false; }}
              className={cn("relative aspect-[4/3] w-full touch-none select-none", phase === "play" && "cursor-none")}
              style={{ background: "linear-gradient(#ffe9c7 0%, #ffd9a0 29%, #bfe9fb 30%, #6ec5e8 70%, #3f9fc9 100%)", containerType: "inline-size" }}
              role="application"
              aria-label="อ่างช้อนปลา — เลื่อนเมาส์บังคับช้อน กดค้างเพื่อจ้วงลงน้ำ"
            >
              {/* ขอบอ่าง */}
              <div className="pointer-events-none absolute inset-x-0 h-2 bg-white/60" style={{ top: `${WATER_TOP}%` }} />
              {/* พื้นอ่าง */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-around opacity-70" style={{ height: "10%" }}>
                {["🪨", "🌿", "🪨", "🌿", "🪨"].map((d, i) => <span key={i} style={{ fontSize: "4cqw" }}>{d}</span>)}
              </div>

              {/* ปลาในอ่าง */}
              {ids.map((f) => {
                const t = fishKind(f.kind);
                return (
                  <span
                    key={f.id}
                    ref={(el) => { if (el) els.current.set(f.id, el); else els.current.delete(f.id); }}
                    aria-hidden
                    className="pointer-events-none absolute left-0 top-0 grid place-items-center leading-none will-change-transform"
                    style={{ fontSize: `${t.size}cqw` }}
                  >
                    {f.kind === "fancy" && <span className="fish-aura absolute left-1/2 top-1/2 size-[2em] rounded-full" />}
                    <span
                      className={cn("relative leading-none", f.kind === "fancy" && "fish-special")}
                      style={f.kind !== "fancy" ? { filter: `hue-rotate(${f.color.hue}deg) saturate(1.5)` } : undefined}
                    >
                      {t.emoji}
                    </span>
                  </span>
                );
              })}

              {/* ช้อนกระดาษ */}
              <div ref={scoopEl} className="pointer-events-none absolute left-0 top-0 grid place-items-center will-change-transform">
                <span className="block leading-none" style={{ fontSize: "13cqw", opacity: wear > 30 ? 1 : 0.65 }}>
                  {findScoop(scoopId).emoji}
                </span>
                {holding && (
                  <span
                    aria-hidden
                    className="absolute leading-none"
                    style={{
                      fontSize: `${fishKind(holding.kind).size}cqw`,
                      filter: holding.kind !== "fancy" ? `hue-rotate(${holding.color.hue}deg) saturate(1.5)` : undefined,
                    }}
                  >
                    {fishKind(holding.kind).emoji}
                  </span>
                )}
              </div>

              {/* ข้อความตอบรับ */}
              {toast && (
                <p
                  role="status"
                  className={cn(
                    "animate-rise pointer-events-none absolute inset-x-3 mx-auto max-w-sm rounded-2xl px-3.5 py-2 text-center font-display text-[14px] leading-snug shadow-lift sm:text-[15px]",
                    toast.tone === "good" ? "bg-mint-soft text-[#1f6b4d]" : toast.tone === "oops" ? "bg-pink-soft text-[#a8456c]" : "bg-white/95 text-purple-800",
                  )}
                  style={{ top: "33%" }}
                >
                  {toast.text}
                </p>
              )}

              {/* ก่อนเริ่ม / ตอนพัก */}
              {(phase === "ready" || phase === "pause") && (
                <div className="absolute inset-0 grid place-items-center gap-3 bg-white/55 backdrop-blur-[2px]">
                  {phase === "ready" && (
                    <p className="mx-auto max-w-xs rounded-2xl bg-white/90 px-4 py-2.5 text-center font-display text-[16px] leading-snug text-purple-800">
                      🧑‍🦱 “{BUYER.greet}”
                    </p>
                  )}
                  <button
                    type="button"
                    onPointerDown={(e) => { e.stopPropagation(); setPhase("play"); }}
                    className="tap inline-flex items-center gap-2 rounded-full bg-purple-600 px-7 py-3.5 font-display text-xl text-white shadow-lift hover:bg-purple-700"
                  >
                    <Play size={22} /> {phase === "ready" ? "เริ่มเกม" : "เล่นต่อ"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ปุ่มควบคุม */}
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {phase === "play" && (
              <button type="button" onClick={() => setPhase("pause")}
                className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-4 py-2 text-[14px] font-medium text-purple-700 hover:brightness-95">
                <Pause size={16} /> หยุดพัก
              </button>
            )}
            <button type="button" onClick={reset}
              className="tap inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-4 py-2 text-[14px] font-medium text-purple-700 hover:brightness-95">
              <RotateCcw size={16} /> เล่นใหม่
            </button>
          </div>

          {/* ตารางปลา */}
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {FISH_KINDS.map((t) => (
              <div key={t.kind} className="flex items-start gap-2 rounded-2xl bg-cream px-3 py-2">
                <span className={cn("text-2xl leading-none", t.kind === "fancy" && "fish-special")}>{t.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] leading-tight text-purple-800">{t.baseName}</span>
                  <span className="block text-[11px] leading-tight text-ink-soft">{t.hint}</span>
                  <span className="mt-0.5 block text-[12px] text-purple-700">🥅 {t.score} คะแนน · 💰 {t.price} บาท</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ───────── แก้วปลา · คนรับซื้อ · ร้านช้อน ───────── */}
        <div className="grid gap-3">
          {/* แก้วใส */}
          <div className="card p-4">
            <h3 className="mb-2 font-display text-[16px] text-purple-800">🥤 แก้วเก็บปลาของเรา</h3>
            {cup.length === 0 ? (
              <p className="text-[14px] text-ink-soft">ยังไม่มีปลาในแก้ว — ช้อนปลาขึ้นมาก่อนนะ</p>
            ) : (
              <>
                <div className="mb-2 grid max-h-44 gap-1 overflow-auto">
                  {cup.map((c) => {
                    const t = fishKind(c.kind);
                    return (
                      <div key={c.id} className="flex items-center gap-2 rounded-xl bg-cream px-2.5 py-1.5">
                        <span className={cn("text-lg leading-none", c.kind === "fancy" && "fish-special")}
                          style={c.kind !== "fancy" ? { filter: `hue-rotate(${c.color.hue}deg) saturate(1.5)` } : undefined}>
                          {t.emoji}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[14px] text-purple-800">{c.name}</span>
                        <button type="button" onClick={() => sellOne(c)}
                          className="tap shrink-0 rounded-full bg-purple-100 px-2.5 py-1 text-[12px] font-medium text-purple-700 hover:bg-purple-200">
                          ขาย {t.price}฿
                        </button>
                      </div>
                    );
                  })}
                </div>
                <p className="text-center text-[14px] text-ink-soft">รวมขายได้ <b className="text-purple-700">{cupValue} บาท</b></p>
              </>
            )}
          </div>

          {/* คนรับซื้อปลา */}
          <div className="card p-4">
            <button type="button" onClick={() => setBuyerOpen((v) => !v)} aria-expanded={buyerOpen}
              className="tap flex w-full items-center gap-2 text-left font-display text-[16px] text-purple-800">
              <span className="text-xl leading-none">{BUYER.emoji}</span> {BUYER.name}
              <span className="ml-auto text-[13px] font-normal text-ink-soft">{buyerOpen ? "ซ่อน" : "ไปขายปลา"}</span>
            </button>
            {buyerOpen && (
              <div className="mt-2">
                <p className="mb-2 rounded-xl bg-cream px-3 py-2 text-[14px] leading-snug text-ink-soft">“{BUYER.greet}”</p>
                <p className="mb-2 text-[14px]">เงินตอนนี้ <b className="text-purple-700">{money} บาท</b> · ขายทั้งแก้วจะได้ <b className="text-purple-700">{cupValue} บาท</b> รวมเป็น <b className="text-purple-700">{money + cupValue} บาท</b></p>
                <button type="button" onClick={sellAll} disabled={cup.length === 0}
                  className="tap w-full rounded-full bg-purple-600 px-4 py-2.5 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700 disabled:opacity-40">
                  ขายปลาทั้งแก้ว ({cup.length} ตัว)
                </button>
                <p className="mt-2 text-[12px] leading-snug text-ink-soft">
                  จะเลือกขายทีละตัวจากรายการด้านบนก็ได้ ปลาตัวไหนชอบมากเก็บไว้ในแก้วได้เลย
                </p>
              </div>
            )}
          </div>

          {/* ร้านช้อน */}
          <div className="card p-4">
            <button type="button" onClick={() => setShopOpen((v) => !v)} aria-expanded={shopOpen}
              className="tap flex w-full items-center gap-2 text-left font-display text-[16px] text-purple-800">
              <Store size={18} /> ร้านขายช้อน
              <span className="ml-auto text-[13px] font-normal text-ink-soft">{shopOpen ? "ซ่อน" : "เปิดดู"}</span>
            </button>
            {shopOpen && (
              <div className="mt-2 grid gap-2">
                {SCOOPS.map((s) => (
                  <div key={s.id} className={cn("rounded-2xl px-3 py-2", scoopId === s.id ? "bg-mint-soft" : "bg-cream")}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl leading-none">{s.emoji}</span>
                      <span className="min-w-0 flex-1 text-[15px] text-purple-800">{s.name}</span>
                      <span className="font-display text-[14px] text-purple-700">{s.price}฿</span>
                    </div>
                    <p className="mt-0.5 text-[12px] leading-snug text-ink-soft">{s.about}</p>
                    <button type="button" onClick={() => buyScoop(s.id)} disabled={money < s.price}
                      className="tap mt-1.5 w-full rounded-full bg-purple-600 px-3 py-1.5 text-[13px] font-medium text-white disabled:opacity-40">
                      {money >= s.price ? `ซื้อ ${s.price} บาท` : `เงินยังไม่พอ (มี ${money} บาท)`}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ───────── คำอธิบายคะแนน vs เงิน ───────── */}
      <div className="mx-auto mt-4 grid max-w-4xl gap-2 sm:grid-cols-2">
        <p className="rounded-2xl bg-mint-soft px-3.5 py-2.5 text-[14px] leading-snug text-[#1f6b4d]">
          🥅 <b>คะแนนช้อนปลา</b> ได้ตอนช้อนปลาขึ้นมาได้ — เป็นคะแนนความเก่ง ไม่ลดลงแม้จะเอาปลาไปขาย
        </p>
        <p className="rounded-2xl bg-yellow-soft px-3.5 py-2.5 text-[14px] leading-snug text-[#8a6a00]">
          💰 <b>เงิน</b> ได้ตอนเอาปลาในแก้วไปขายให้พี่คนรับซื้อ — เอาไปซื้อช้อนใหม่ได้
        </p>
      </div>

      <button
        type="button"
        onClick={() => setTipIdx((i) => (i + 1) % FAIR_TIPS.length)}
        className="tap mx-auto mt-3 block rounded-2xl bg-cream px-4 py-2.5 text-center text-[13px] leading-relaxed text-ink-soft hover:brightness-95"
      >
        🎏 {FAIR_TIPS[tipIdx]} <span className="text-purple-500">(กดดูเกร็ดถัดไป)</span>
      </button>
    </GameShell>
  );
}
