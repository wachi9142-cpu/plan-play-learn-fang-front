"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShoppingBasket, Sprout, Store } from "lucide-react";
import { GameShell, shuffle, type GameOutcome } from "@/components/games/GameShell";
import { starsFor } from "@/lib/game-levels";
import {
  FARM_TIPS, FERTILIZERS, FRUITS, NEXT_STAGE, PESTS, SHOP_ITEMS, STAGES, TOOLS,
  findFruit, findShopItem, type Need, type ShopKind, type Stage,
} from "@/data/fruit-farm";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;

interface Plot {
  id: number;
  fruitId: string;
  stage: Stage;
  /** เวลาที่เหลือก่อนผลจะสุกเอง (มิลลิวินาที) — ใช้เฉพาะขั้น "ติดผล" */
  ripenMs: number;
  /** สัตว์ที่กำลังป่วนแปลงนี้ */
  pest: { id: "monkey" | "bird"; leftMs: number } | null;
}

interface OrderLine { fruitId: string; ripe: boolean; need: number }
interface Order { id: number; lines: OrderLine[]; pay: number }

/** ของในตะกร้า — นับแยกผลสุกกับผลดิบ */
type Basket = Record<string, { ripe: number; raw: number }>;

const addToBasket = (b: Basket, fruitId: string, ripe: boolean, n: number): Basket => {
  const cur = b[fruitId] ?? { ripe: 0, raw: 0 };
  return { ...b, [fruitId]: ripe ? { ...cur, ripe: cur.ripe + n } : { ...cur, raw: cur.raw + n } };
};
const countIn = (b: Basket, fruitId: string, ripe: boolean) => (ripe ? b[fruitId]?.ripe ?? 0 : b[fruitId]?.raw ?? 0);

/** เวลาที่ผลใช้สุกเอง หลังติดผลแล้ว */
const RIPEN_MS = 5000;

/**
 * 🌳 เจ้าของสวนผลไม้มหาสนุก
 *
 * วงจรเกม: หยอดเมล็ด → รดน้ำ → ใส่ปุ๋ย → ออกดอก → ติดผล → ผลสุก → เก็บใส่ตะกร้า
 *          → ส่งออเดอร์ให้ลูกค้า → ได้เงิน → ซื้อของในร้านมาพัฒนาสวน
 *
 * เด็กเลือกเครื่องมือก่อน แล้วคลิกที่แปลง — เหนือแปลงมีฟองบอกว่าต้องการอะไร
 * ไม่มีการลงโทษ: ทำผิดแค่ไม่เกิดอะไรขึ้น · เงินที่สะสมแล้วไม่ถูกหักไม่ว่ากรณีใด
 */
export function FruitFarmGame({
  plots: plotCount = 6,
  fruitIds = ["mango"],
  orders: orderGoal = 5,
  maxPerLine = 3,
  withRipeness = false,
  withPests = false,
  withShop = false,
  startMoney = 20,
  onDone,
}: {
  plots?: number;
  /** ผลไม้ที่ปลูกได้ในระดับนี้ */
  fruitIds?: string[];
  /** ทำออเดอร์ครบกี่ใบถึงจบ */
  orders?: number;
  /** ออเดอร์ขอได้มากสุดกี่ลูกต่อรายการ */
  maxPerLine?: number;
  /** แยกผลดิบ–ผลสุกในออเดอร์ไหม */
  withRipeness?: boolean;
  /** มีลิงกับนกเข้ามารบกวนไหม */
  withPests?: boolean;
  /** เปิดร้านค้าให้ซื้อของพัฒนาสวนไหม */
  withShop?: boolean;
  /** เงินตั้งต้น — คุณยายให้มาซื้อปุ๋ยถุงแรก ไม่งั้นเด็กจะติดตันตั้งแต่ต้น */
  startMoney?: number;
  onDone?: Cb;
}) {
  const fruits = useMemo(() => fruitIds.map(findFruit), [fruitIds]);

  const [plots, setPlots] = useState<Plot[]>([]);
  const [tool, setTool] = useState<Need>("seed");
  const [seedFruit, setSeedFruit] = useState(fruits[0].id);
  const [fertId, setFertId] = useState(FERTILIZERS[0].id);
  const [basket, setBasket] = useState<Basket>({});
  const [order, setOrder] = useState<Order | null>(null);
  const [filled, setFilled] = useState(0);
  const [money, setMoney] = useState(0);
  const [owned, setOwned] = useState<ShopKind[]>([]);
  const [shopOpen, setShopOpen] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone: "good" | "info" | "oops" } | null>(null);
  const [lost, setLost] = useState(0);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  const nextOrderId = useRef(1);
  const ownedRef = useRef<ShopKind[]>([]);
  useEffect(() => { ownedRef.current = owned; }, [owned]);

  /* ---------- สร้างออเดอร์ใหม่ ---------- */
  const makeOrder = useCallback((): Order => {
    const lineCount = withRipeness && maxPerLine > 2 ? (Math.random() < 0.45 ? 2 : 1) : 1;
    const picks = shuffle(fruits).slice(0, Math.min(lineCount, fruits.length));
    const lines: OrderLine[] = picks.map((f) => ({
      fruitId: f.id,
      ripe: withRipeness ? Math.random() < 0.65 : true,
      need: 1 + Math.floor(Math.random() * maxPerLine),
    }));
    const pay = lines.reduce((n, l) => {
      const f = findFruit(l.fruitId);
      return n + l.need * (l.ripe ? f.price : f.rawPrice);
    }, 0);
    return { id: nextOrderId.current++, lines, pay };
  }, [fruits, maxPerLine, withRipeness]);

  const reset = useCallback(() => {
    setPlots(Array.from({ length: plotCount }, (_, i) => ({ id: i + 1, fruitId: fruits[0].id, stage: "empty" as Stage, ripenMs: 0, pest: null })));
    setTool("seed"); setSeedFruit(fruits[0].id); setFertId(FERTILIZERS[0].id);
    setBasket({}); setFilled(0); setMoney(startMoney); setOwned([]); setShopOpen(false);
    setMsg(null); setLost(0); setDone(false);
    nextOrderId.current = 1;
    setOrder(makeOrder());
    setReady(true);
  }, [plotCount, fruits, makeOrder, startMoney]);

  // เตรียมสวนหลังหน้าเว็บพร้อม เพื่อไม่ให้ฝั่งเซิร์ฟเวอร์กับเบราว์เซอร์ต่างกัน
  useEffect(() => { reset(); }, [reset]);

  /* ---------- นาฬิกาของสวน: ผลสุกเอง · สัตว์เข้ามา · ผู้ช่วยทำงาน ---------- */
  useEffect(() => {
    if (!ready || done) return;
    const STEP = 500;
    const t = setInterval(() => {
      setPlots((list) => {
        const has = (k: ShopKind) => ownedRef.current.includes(k);
        let next = list.map((p) => {
          let { stage, ripenMs, pest } = p;

          /* ผลค่อย ๆ สุกเอง */
          if (stage === "fruit") {
            ripenMs -= STEP;
            if (ripenMs <= 0) { stage = "ripe"; ripenMs = 0; }
          }

          /* สัตว์ที่ป่วนอยู่ — หมดเวลาแล้วคาบผลไปหนึ่งลูก */
          if (pest) {
            pest = { ...pest, leftMs: pest.leftMs - STEP };
            /* สุนัข/เหยี่ยวช่วยไล่ให้เองบางครั้ง */
            const helper = (pest.id === "monkey" && has("dog")) || (pest.id === "bird" && has("hawk"));
            if (helper && Math.random() < 0.25) {
              setMsg({ text: pest.id === "monkey" ? "🐕 สุนัขเห่าไล่ลิงให้แล้ว!" : "🦅 เหยี่ยวบินไล่นกให้แล้ว!", tone: "good" });
              pest = null;
            } else if (pest.leftMs <= 0) {
              /* ถุงห่อผลไม้ช่วยให้รอดได้ครึ่งหนึ่ง */
              if (has("bag") && Math.random() < 0.5) {
                setMsg({ text: "🛍️ ถุงห่อผลไม้ช่วยไว้ได้ ผลไม้ไม่เสียหาย", tone: "good" });
              } else {
                setLost((n) => n + 1);
                setMsg({ text: `${pest.id === "monkey" ? "🐒 ลิง" : "🐦 นก"} เอาผลไม้ไปหนึ่งลูก คราวหน้าคลิกไล่ให้ทันนะ`, tone: "oops" });
                stage = stage === "ripe" || stage === "fruit" ? "tree" : stage;
              }
              pest = null;
            }
          }
          return { ...p, stage, ripenMs, pest };
        });

        /* คนเก็บผลไม้ — เก็บผลสุกให้เองเป็นระยะ */
        if (has("picker") && Math.random() < 0.25) {
          const idx = next.findIndex((p) => p.stage === "ripe");
          if (idx >= 0) {
            const f = findFruit(next[idx].fruitId);
            setBasket((b) => addToBasket(b, f.id, true, f.yield));
            setMsg({ text: `🧑‍🌾 คนเก็บผลไม้เก็บ${f.name}สุกให้ ${f.yield} ลูก`, tone: "info" });
            next = next.map((p, i) => (i === idx ? { ...p, stage: "tree" as Stage } : p));
          }
        }

        /* สัตว์เข้ามาใหม่ — เฉพาะแปลงที่กำลังมีผล */
        if (withPests) {
          const chance = has("guard") ? 0.05 : 0.11;
          if (Math.random() < chance && !next.some((p) => p.pest)) {
            const targets = next.map((p, i) => ({ p, i })).filter(({ p }) => p.stage === "fruit" || p.stage === "ripe");
            if (targets.length) {
              const { i } = targets[Math.floor(Math.random() * targets.length)];
              const pest = PESTS[Math.floor(Math.random() * PESTS.length)];
              next = next.map((p, k) => (k === i ? { ...p, pest: { id: pest.id, leftMs: pest.grace } } : p));
              setMsg({ text: `⚠️ ${pest.emoji} ${pest.name}มาแล้ว “${pest.sound}” คลิกที่ตัวมันเพื่อไล่!`, tone: "oops" });
            }
          }
        }
        return next;
      });
    }, STEP);
    return () => clearInterval(t);
  }, [ready, done, withPests]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2200);
    return () => clearTimeout(t);
  }, [msg]);

  /* ---------- ลงมือทำกับแปลง ---------- */
  const act = (p: Plot) => {
    if (done) return;

    /* มีสัตว์อยู่ = คลิกเพื่อไล่ก่อน */
    if (p.pest) {
      const pest = PESTS.find((x) => x.id === p.pest!.id)!;
      setPlots((list) => list.map((x) => (x.id === p.id ? { ...x, pest: null } : x)));
      setMsg({ text: `${pest.emoji} ไล่${pest.name}ไปแล้ว “${pest.sound}” เก่งมาก!`, tone: "good" });
      return;
    }

    const info = STAGES[p.stage];

    /* ขั้นรอผลสุก ไม่ต้องทำอะไร */
    if (info.need === "wait") {
      setMsg({ text: "⏳ ต้นนี้กำลังติดผลอยู่ รออีกนิดให้ผลสุกก่อนนะ", tone: "info" });
      return;
    }

    /* เลือกเครื่องมือไม่ตรงกับที่ต้นต้องการ — บอกใบ้ ไม่หักอะไร */
    if (tool !== info.need) {
      const want = TOOLS.find((t) => t.id === info.need);
      setMsg({ text: `ต้นนี้อยากได้ ${want?.emoji} ${want?.label} นะ ลองเลือกเครื่องมือให้ตรงดู`, tone: "info" });
      return;
    }

    if (info.need === "harvest") {
      const f = findFruit(p.fruitId);
      setBasket((b) => addToBasket(b, f.id, true, f.yield));
      setPlots((list) => list.map((x) => (x.id === p.id ? { ...x, stage: NEXT_STAGE.ripe, ripenMs: 0 } : x)));
      setMsg({ text: `🧺 เก็บ${f.name}สุกได้ ${f.yield} ลูก! ${f.fact}`, tone: "good" });
      return;
    }

    if (info.need === "seed") {
      const f = findFruit(seedFruit);
      if (f.seedPrice > 0 && money < f.seedPrice) { setMsg({ text: `เมล็ด${f.name}ราคา ${f.seedPrice} บาท เงินยังไม่พอ ลองขายผลไม้ก่อนนะ`, tone: "info" }); return; }
      if (f.seedPrice > 0) setMoney((m) => m - f.seedPrice);
      setPlots((list) => list.map((x) => (x.id === p.id ? { ...x, fruitId: f.id, stage: "seed" as Stage } : x)));
      setMsg({ text: `🌰 หยอดเมล็ด${f.name}แล้ว ต่อไปรดน้ำให้หน่อยนะ`, tone: "good" });
      return;
    }

    if (info.need === "fert") {
      const fz = FERTILIZERS.find((x) => x.id === fertId)!;
      if (money < fz.price) { setMsg({ text: `${fz.emoji} ${fz.name} ราคา ${fz.price} บาท เงินยังไม่พอ ลองเลือกปุ๋ยที่ถูกกว่า หรือเก็บผลไม้ไปส่งออเดอร์ก่อนนะ`, tone: "info" }); return; }
      setMoney((m) => m - fz.price);
      setPlots((list) => list.map((x) => (x.id === p.id ? { ...x, stage: "flower" as Stage } : x)));
      setMsg({ text: `${fz.emoji} ใส่${fz.name}แล้ว — ${fz.about}`, tone: "good" });
      return;
    }

    /* รดน้ำ */
    setPlots((list) => list.map((x) => {
      if (x.id !== p.id) return x;
      const nextStage = NEXT_STAGE[x.stage];
      return { ...x, stage: nextStage, ripenMs: nextStage === "fruit" ? RIPEN_MS : x.ripenMs };
    }));
    setMsg({ text: "💧 รดน้ำแล้ว ต้นไม้ชอบมาก!", tone: "good" });
  };

  /* ---------- ส่งออเดอร์ ---------- */
  const canFill = order?.lines.every((l) => countIn(basket, l.fruitId, l.ripe) >= l.need) ?? false;

  const sendOrder = () => {
    if (!order || !canFill || done) return;
    setBasket((b) => {
      const copy: Basket = { ...b };
      for (const l of order.lines) {
        const cur = copy[l.fruitId] ?? { ripe: 0, raw: 0 };
        copy[l.fruitId] = l.ripe ? { ...cur, ripe: cur.ripe - l.need } : { ...cur, raw: cur.raw - l.need };
      }
      return copy;
    });
    setMoney((m) => m + order.pay);
    const n = filled + 1;
    setFilled(n);
    setMsg({ text: `💰 ส่งออเดอร์สำเร็จ! ได้เงิน ${order.pay} บาท`, tone: "good" });
    if (n >= orderGoal) { setDone(true); return; }
    setOrder(makeOrder());
  };

  /* ---------- ร้านค้า ---------- */
  const buy = (id: ShopKind) => {
    const item = findShopItem(id);
    if (owned.includes(id) || money < item.price) return;
    setMoney((m) => m - item.price);
    setOwned((o) => [...o, id]);
    setMsg({ text: `${item.emoji} ซื้อ${item.name}แล้ว — ${item.effect}`, tone: "good" });
  };

  const onFinish = useCallback((o: GameOutcome) => onDone?.(o), [onDone]);
  const miss = Math.max(0, lost);
  const total = Math.max(1, orderGoal);

  if (!ready || !order) return null;

  const tip = FARM_TIPS[(filled + lost) % FARM_TIPS.length];

  return (
    <GameShell
      instruction={
        done ? `🎉 เก่งมาก! ทำออเดอร์ครบ ${filled} ใบ มีเงิน ${money} บาท`
          : `เลือกเครื่องมือด้านล่าง แล้วคลิกที่แปลง — ดูฟองเหนือต้นว่าต้นไหนอยากได้อะไร`
      }
      progress={{ current: filled, total: orderGoal }}
      done={done}
      onRestart={reset}
      stats={`ออเดอร์สำเร็จ ${filled}/${orderGoal} · เงิน ${money} บาท${lost > 0 ? ` · ผลไม้เสียหาย ${lost} ลูก` : ""}`}
      mistakes={miss}
      total={total}
      onDone={onFinish}
    >
      {/* ───────── แถบสถานะ ───────── */}
      <div className="mx-auto mb-3 flex max-w-4xl flex-wrap items-center justify-center gap-2">
        <span className="rounded-full bg-yellow-soft px-3.5 py-1.5 font-display text-[16px] text-[#8a6a00]">💰 {money} บาท</span>
        <span className="rounded-full bg-mint-soft px-3.5 py-1.5 font-display text-[16px] text-[#1f6b4d]">📋 ออเดอร์ {filled}/{orderGoal}</span>
        {lost > 0 && <span className="rounded-full bg-pink-soft px-3.5 py-1.5 font-display text-[16px] text-[#a8456c]">🐒 เสียหาย {lost}</span>}
        {owned.map((o) => { const it = findShopItem(o); return <span key={o} title={it.effect} className="rounded-full bg-white px-3 py-1.5 text-[15px]">{it.emoji}</span>; })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        {/* ───────── สวน ───────── */}
        <div>
          <div
            className="rounded-3xl p-3 shadow-soft ring-1 ring-line sm:p-4"
            style={{ background: "linear-gradient(#d6efff 0%, #e9f7d8 40%, #cfe6a8 100%)" }}
          >
            <div className={cn("grid gap-2 sm:gap-3", plotCount <= 4 ? "grid-cols-2" : plotCount <= 6 ? "grid-cols-3" : "grid-cols-3 sm:grid-cols-4")}>
              {plots.map((p) => {
                const info = STAGES[p.stage];
                const f = findFruit(p.fruitId);
                const showEmoji = p.stage === "ripe" ? f.emoji : p.stage === "fruit" ? f.rawEmoji : info.emoji;
                const matches = !p.pest && info.need !== "wait" && tool === info.need;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => act(p)}
                    aria-label={`แปลงที่ ${p.id} — ${info.label}${p.pest ? " มีสัตว์มารบกวน" : ""}`}
                    className={cn(
                      "tap relative grid aspect-square place-items-center rounded-2xl border-2 bg-white/70 transition",
                      p.pest ? "animate-pulse border-pink-accent!" : matches ? "border-mint-soft! ring-2 ring-mint-soft hover:scale-105" : "border-line hover:bg-white",
                    )}
                  >
                    <span className="text-[clamp(1.8rem,8vw,3rem)] leading-none">{showEmoji}</span>
                    <span className="px-1 text-center text-[10px] leading-tight text-ink-soft">{info.label}</span>

                    {/* ฟองบอกว่าต้นนี้ต้องการอะไร */}
                    {!p.pest && (
                      <span className="absolute -top-1.5 right-1 rounded-full bg-white px-1.5 py-0.5 text-[13px] shadow-soft">{info.bubble}</span>
                    )}

                    {/* สัตว์ที่มาป่วน — คลิกที่แปลงเพื่อไล่ */}
                    {p.pest && (
                      <span className="absolute inset-0 grid place-items-center">
                        <span className="animate-float text-[clamp(2rem,9vw,3.2rem)] leading-none">
                          {PESTS.find((x) => x.id === p.pest!.id)!.emoji}
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ───────── เครื่องมือ ───────── */}
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTool(t.id)}
                aria-pressed={tool === t.id}
                title={t.hint}
                className={cn(
                  "tap inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-medium transition",
                  tool === t.id ? "scale-105 bg-purple-600 text-white! shadow-soft" : "bg-cream-dark text-purple-700 hover:brightness-95",
                )}
              >
                <span className="text-lg leading-none">{t.emoji}</span> {t.label}
              </button>
            ))}
          </div>

          {/* เลือกชนิดเมล็ด / ชนิดปุ๋ย ตามเครื่องมือที่ถืออยู่ */}
          {tool === "seed" && fruits.length > 1 && (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
              <span className="text-[13px] text-ink-soft">เมล็ดที่จะปลูก</span>
              {fruits.map((f) => (
                <button key={f.id} type="button" onClick={() => setSeedFruit(f.id)} aria-pressed={seedFruit === f.id}
                  className={cn("tap rounded-full px-3 py-1 text-[13px] transition", seedFruit === f.id ? "bg-purple-600 text-white!" : "bg-cream-dark text-purple-700")}>
                  {f.emoji} {f.name}{f.seedPrice > 0 ? ` ${f.seedPrice}฿` : " ฟรี"}
                </button>
              ))}
            </div>
          )}
          {tool === "fert" && (
            <div className="mt-2">
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <span className="text-[13px] text-ink-soft">ปุ๋ยที่จะใส่</span>
                {FERTILIZERS.map((fz) => (
                  <button key={fz.id} type="button" onClick={() => setFertId(fz.id)} aria-pressed={fertId === fz.id}
                    className={cn("tap rounded-full px-3 py-1 text-[13px] transition", fertId === fz.id ? "bg-purple-600 text-white!" : "bg-cream-dark text-purple-700")}>
                    {fz.emoji} {fz.name} {fz.price}฿
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-center text-[12px] leading-snug text-ink-soft">
                {FERTILIZERS.find((x) => x.id === fertId)!.about}
                <br />ปุ๋ยทุกชนิดในเกมช่วยให้ออกดอกเหมือนกัน — ของจริงความเหมาะสมขึ้นกับดินและชนิดพืช
              </p>
            </div>
          )}

          {msg && (
            <p
              role="status"
              className={cn(
                "animate-rise mt-3 rounded-2xl px-4 py-2.5 text-center text-[15px] leading-snug",
                msg.tone === "good" ? "bg-mint-soft text-[#1f6b4d]" : msg.tone === "oops" ? "bg-pink-soft text-[#a8456c]" : "bg-yellow-soft text-[#8a6a00]",
              )}
            >
              {msg.text}
            </p>
          )}
        </div>

        {/* ───────── ออเดอร์ · ตะกร้า · ร้านค้า ───────── */}
        <div className="grid gap-3">
          {/* ออเดอร์ */}
          <div className="card p-4">
            <h3 className="mb-2 flex items-center gap-1.5 font-display text-[16px] text-purple-800">
              🧺 ออเดอร์ของลูกค้า
            </h3>
            <ul className="grid gap-1.5">
              {order.lines.map((l, i) => {
                const f = findFruit(l.fruitId);
                const have = countIn(basket, l.fruitId, l.ripe);
                const ok = have >= l.need;
                return (
                  <li key={i} className={cn("flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-[15px]", ok ? "bg-mint-soft" : "bg-cream")}>
                    <span className="text-xl leading-none">{l.ripe ? f.emoji : f.rawEmoji}</span>
                    <span className="min-w-0 flex-1">
                      {f.name}{withRipeness ? (l.ripe ? "สุก" : "ดิบ") : ""} {l.need} ลูก
                    </span>
                    <span className={cn("font-display text-[14px]", ok ? "text-[#1f6b4d]" : "text-ink-soft")}>{Math.min(have, l.need)}/{l.need}</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-center text-[14px] text-ink-soft">ส่งครบได้ <b className="text-purple-700">{order.pay} บาท</b></p>
            <button
              type="button"
              onClick={sendOrder}
              disabled={!canFill}
              className="tap mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-purple-600 px-4 py-2.5 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700 disabled:opacity-40"
            >
              <ShoppingBasket size={17} /> ส่งออเดอร์
            </button>
          </div>

          {/* ตะกร้า */}
          <div className="card p-4">
            <h3 className="mb-2 font-display text-[16px] text-purple-800">🧺 ตะกร้าของเรา</h3>
            {Object.keys(basket).length === 0 ? (
              <p className="text-[14px] text-ink-soft">ยังไม่มีผลไม้ — ปลูกแล้วเก็บผลมาใส่ตะกร้ากันนะ</p>
            ) : (
              <ul className="grid gap-1 text-[15px]">
                {Object.entries(basket).map(([id, n]) => {
                  const f = findFruit(id);
                  if (n.ripe === 0 && n.raw === 0) return null;
                  return (
                    <li key={id} className="flex items-center gap-2">
                      <span className="text-xl leading-none">{f.emoji}</span>
                      <span className="min-w-0 flex-1">{f.name}</span>
                      <span className="text-ink-soft">สุก {n.ripe}{withRipeness ? ` · ดิบ ${n.raw}` : ""}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* ร้านค้า */}
          {withShop && (
            <div className="card p-4">
              <button type="button" onClick={() => setShopOpen((v) => !v)} aria-expanded={shopOpen}
                className="tap flex w-full items-center gap-2 text-left font-display text-[16px] text-purple-800">
                <Store size={18} /> ร้านพัฒนาสวน <span className="ml-auto text-[13px] font-normal text-ink-soft">{shopOpen ? "ซ่อน" : "เปิดดู"}</span>
              </button>
              {shopOpen && (
                <div className="mt-2 grid gap-2">
                  {SHOP_ITEMS.map((it) => {
                    const has = owned.includes(it.id);
                    const afford = money >= it.price;
                    return (
                      <div key={it.id} className={cn("rounded-2xl px-3 py-2", has ? "bg-mint-soft" : "bg-cream")}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl leading-none">{it.emoji}</span>
                          <span className="min-w-0 flex-1 text-[15px] text-purple-800">{it.name}</span>
                          <span className="font-display text-[14px] text-purple-700">{it.price}฿</span>
                        </div>
                        <p className="mt-0.5 text-[12px] leading-snug text-ink-soft">{it.about} — <b>{it.effect}</b></p>
                        <button type="button" onClick={() => buy(it.id)} disabled={has || !afford}
                          className="tap mt-1.5 w-full rounded-full bg-purple-600 px-3 py-1.5 text-[13px] font-medium text-white disabled:opacity-40">
                          {has ? "ซื้อแล้ว ✓" : afford ? `ซื้อ ${it.price} บาท` : `เงินยังไม่พอ (มี ${money} บาท)`}
                        </button>
                      </div>
                    );
                  })}
                  <p className="text-[12px] leading-snug text-ink-soft">
                    💡 ดูราคาและผลที่ได้ก่อนตัดสินใจซื้อนะ เงินมีจำกัด ต้องเลือกให้คุ้มที่สุด
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ───────── ขั้นการเติบโต (ช่วยให้เด็กเห็นภาพรวม) ───────── */}
      <div className="mx-auto mt-4 flex max-w-4xl flex-wrap items-center justify-center gap-1.5 rounded-2xl bg-cream px-3 py-2 text-[13px] text-ink-soft">
        <Sprout size={15} className="text-purple-500" />
        {(["empty", "seed", "sprout", "tree", "flower", "fruit", "ripe"] as Stage[]).map((s, i) => (
          <span key={s} className="inline-flex items-center gap-1">
            {i > 0 && <span className="text-purple-300">→</span>}
            <span>{STAGES[s].emoji} {STAGES[s].label}</span>
          </span>
        ))}
      </div>

      <p className="mt-2 text-center text-[13px] leading-relaxed text-ink-soft">
        🌱 {tip}
        <br />ตารางรดน้ำและใส่ปุ๋ยในเกมนี้เป็นตารางของเกม ไม่ใช่คำแนะนำการปลูกพืชจริงทุกชนิด
      </p>
    </GameShell>
  );
}

export { starsFor };
