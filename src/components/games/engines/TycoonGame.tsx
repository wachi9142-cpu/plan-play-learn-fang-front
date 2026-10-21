"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameShell, type GameOutcome } from "@/components/games/GameShell";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { BOARD_EASY, BOARD_HARD, CHANCE_CARDS, TYCOON_RULES, type BoardSquare } from "@/data/tycoon-board";
import { cn } from "@/lib/cn";

type Cb = (o: GameOutcome) => void;
type Who = "p1" | "p2";
type Mode = "cpu" | "friend";

/** ทรัพย์สินของที่ดินแต่ละแปลง */
interface Lot { owner?: Who; houses: number; hotel: boolean }

const DICE = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const baht = (n: number) => `${n.toLocaleString("th-TH")} บาท`;

/**
 * 🏘️ เกมเศรษฐีไทย — ซื้อที่ดิน สร้างบ้าน สร้างโรงแรม เก็บค่าเช่า
 * ภาษาไทยทั้งหมด · เงินจำลองหน่วยบาท ไม่มีเงินจริง
 * ระดับ 1 (4–6 ปี) กระดาน 16 ช่อง ระบบช่วยคำนวณ · ระดับ 2 (6 ปีขึ้นไป) กระดาน 24 ช่อง เต็มรูปแบบ
 */
export function TycoonGame({ level = "easy", rounds = 10, onDone }: {
  level?: "easy" | "hard"; rounds?: number; onDone?: Cb;
}) {
  const board = level === "easy" ? BOARD_EASY : BOARD_HARD;
  const canBuild = level !== "easy";

  const [mode, setMode] = useState<Mode>("cpu");
  const [pos, setPos] = useState<Record<Who, number>>({ p1: 0, p2: 0 });
  const [cash, setCash] = useState<Record<Who, number>>({ p1: TYCOON_RULES.startMoney, p2: TYCOON_RULES.startMoney });
  const [lots, setLots] = useState<Record<number, Lot>>({});
  const [turn, setTurn] = useState<Who>("p1");
  const [turnsDone, setTurnsDone] = useState<Record<Who, number>>({ p1: 0, p2: 0 });
  const [dice, setDice] = useState(0);
  const [busy, setBusy] = useState(false);
  const [offer, setOffer] = useState<number | null>(null);
  const [card, setCard] = useState<typeof CHANCE_CARDS[number] | null>(null);
  const [msg, setMsg] = useState<string>("กดปุ่ม “ทอยลูกเต๋า” เพื่อเริ่มเล่นได้เลย");
  const [over, setOver] = useState(false);
  const timers = useRef<number[]>([]);

  const name = (w: Who) => (mode === "friend" ? (w === "p1" ? "ผู้เล่น 1 🔴" : "ผู้เล่น 2 🔵") : w === "p1" ? "หนู 🔴" : "คอมพิวเตอร์ 🔵");

  const restart = useCallback(() => {
    timers.current.forEach(clearTimeout); timers.current = [];
    setPos({ p1: 0, p2: 0 });
    setCash({ p1: TYCOON_RULES.startMoney, p2: TYCOON_RULES.startMoney });
    setLots({}); setTurn("p1"); setTurnsDone({ p1: 0, p2: 0 });
    setDice(0); setBusy(false); setOffer(null); setCard(null); setOver(false);
    setMsg("กดปุ่ม “ทอยลูกเต๋า” เพื่อเริ่มเล่นได้เลย");
  }, []);

  useEffect(() => { restart(); }, [restart, mode, level]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /** มูลค่าทรัพย์สินรวม = เงินสด + ราคาที่ดิน + ค่าก่อสร้าง */
  const netWorth = useCallback((w: Who) => {
    let v = cash[w];
    Object.entries(lots).forEach(([i, lot]) => {
      if (lot.owner !== w) return;
      const sq = board[Number(i)];
      v += sq.price ?? 0;
      v += lot.houses * TYCOON_RULES.housePrice;
      if (lot.hotel) v += TYCOON_RULES.hotelPrice;
    });
    return v;
  }, [cash, lots, board]);

  const myLots = (w: Who) => Object.entries(lots).filter(([, l]) => l.owner === w).map(([i]) => Number(i));

  const endTurn = (w: Who) => {
    const t = window.setTimeout(() => {
      setTurnsDone((x) => {
        const next = { ...x, [w]: x[w] + 1 };
        if (next.p1 >= rounds && next.p2 >= rounds) setOver(true);
        return next;
      });
      setBusy(false);
      setCard(null);
      setTurn(w === "p1" ? "p2" : "p1");
    }, 700);
    timers.current.push(t);
  };

  const pay = (from: Who, to: Who | "bank", amount: number) => {
    setCash((c) => {
      const next = { ...c, [from]: c[from] - amount };
      if (to !== "bank") next[to] = c[to] + amount;
      return next;
    });
  };

  const land = (w: Who, at: number) => {
    const sq = board[at];

    if (sq.kind === "chance") {
      const c = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
      setCard(c);
      setCash((x) => ({ ...x, [w]: Math.max(0, x[w] + c.money) }));
      setMsg(`${name(w)} จั่วการ์ดโอกาส: ${c.text}`);
      endTurn(w); return;
    }
    if (sq.kind === "bank") {
      setCash((x) => ({ ...x, [w]: x[w] + (sq.amount ?? 0) }));
      setMsg(`${name(w)} แวะ ${sq.emoji} ${sq.label} — รับ ${baht(sq.amount ?? 0)}`);
      endTurn(w); return;
    }
    if (sq.kind === "tax") {
      pay(w, "bank", sq.amount ?? 0);
      setMsg(`${name(w)} หยุดที่ ${sq.emoji} ${sq.label} — จ่าย ${baht(sq.amount ?? 0)} ให้ธนาคาร`);
      endTurn(w); return;
    }
    if (sq.kind !== "land") {
      setMsg(`${name(w)} หยุดที่ ${sq.emoji} ${sq.label} — พักหนึ่งตา`);
      endTurn(w); return;
    }

    const lot = lots[at];
    // ที่ดินของคนอื่น → จ่ายค่าเช่า
    if (lot?.owner && lot.owner !== w) {
      const rent = lot.hotel ? (sq.rentHotel ?? 0) : lot.houses > 0 ? (sq.rentHouse ?? 0) : (sq.rent ?? 0);
      const due = Math.min(rent, cash[w]);
      pay(w, lot.owner, due);
      const what = lot.hotel ? "มีโรงแรม" : lot.houses > 0 ? "มีบ้าน" : "ที่ดินเปล่า";
      setMsg(
        cash[w] >= rent
          ? `${sq.emoji} ${sq.label} เป็นของ ${name(lot.owner)} (${what}) — ${name(w)} จ่ายค่าเช่า ${baht(rent)}`
          : `${name(w)} เงินไม่พอจ่ายค่าเช่า ${baht(rent)} จ่ายได้เท่าที่มี ${baht(due)} — ลองขายทรัพย์สินดูนะ`,
      );
      endTurn(w); return;
    }
    // ที่ดินของตัวเอง
    if (lot?.owner === w) {
      setMsg(`${sq.emoji} ${sq.label} เป็นที่ดินของ ${name(w)} เองอยู่แล้ว`);
      if (canBuild && w === "p1") { setOffer(at); return; }      // เสนอให้สร้างบ้าน/โรงแรม
      endTurn(w); return;
    }
    // ที่ดินว่าง
    if (cash[w] < (sq.price ?? 0)) {
      setMsg(`${sq.emoji} ${sq.label} ราคา ${baht(sq.price ?? 0)} แต่ ${name(w)} มีเงิน ${baht(cash[w])} ยังไม่พอ`);
      endTurn(w); return;
    }
    if (w === "p2" && mode === "cpu") {
      setCash((c) => ({ ...c, p2: c.p2 - (sq.price ?? 0) }));
      setLots((l) => ({ ...l, [at]: { owner: "p2", houses: 0, hotel: false } }));
      setMsg(`คอมพิวเตอร์ซื้อ ${sq.emoji} ${sq.label} ราคา ${baht(sq.price ?? 0)}`);
      endTurn(w); return;
    }
    setOffer(at);
    setMsg(`${sq.emoji} ${sq.label} ยังไม่มีเจ้าของ ราคา ${baht(sq.price ?? 0)} · ค่าเช่า ${baht(sq.rent ?? 0)} — ${name(w)} จะซื้อไหม?`);
  };

  const buy = (yes: boolean) => {
    if (offer === null) return;
    const at = offer, sq = board[at], w = turn;
    if (yes) {
      setCash((c) => ({ ...c, [w]: c[w] - (sq.price ?? 0) }));
      setLots((l) => ({ ...l, [at]: { owner: w, houses: 0, hotel: false } }));
      setMsg(`${name(w)} ซื้อ ${sq.emoji} ${sq.label} แล้ว! ใครมาหยุดต้องจ่ายค่าเช่า ${baht(sq.rent ?? 0)}`);
    } else setMsg(`${name(w)} ไม่ซื้อ ${sq.emoji} ${sq.label} ที่ดินยังเป็นของธนาคาร`);
    setOffer(null);
    endTurn(w);
  };

  const build = (what: "house" | "hotel") => {
    if (offer === null) return;
    const at = offer, sq = board[at], w = turn;
    const price = what === "house" ? TYCOON_RULES.housePrice : TYCOON_RULES.hotelPrice;
    if (cash[w] < price) { setMsg(`เงินไม่พอ ต้องใช้ ${baht(price)} แต่มี ${baht(cash[w])}`); return; }
    setCash((c) => ({ ...c, [w]: c[w] - price }));
    setLots((l) => ({
      ...l,
      [at]: what === "house"
        ? { ...l[at], houses: Math.min(2, (l[at]?.houses ?? 0) + 1) }
        : { ...l[at], hotel: true },
    }));
    setMsg(what === "house"
      ? `${name(w)} สร้างบ้านที่ ${sq.emoji} ${sq.label} จ่าย ${baht(price)} — ค่าเช่าเพิ่มเป็น ${baht(sq.rentHouse ?? 0)}`
      : `${name(w)} สร้างโรงแรมที่ ${sq.emoji} ${sq.label} จ่าย ${baht(price)} — ค่าเช่าเพิ่มเป็น ${baht(sq.rentHotel ?? 0)}`);
    setOffer(null);
    endTurn(w);
  };

  /** ขายทรัพย์สินคืนธนาคารครึ่งราคา — ใช้ตอนเงินไม่พอ */
  const sell = (at: number) => {
    const sq = board[at], lot = lots[at];
    if (!lot) return;
    const value = Math.round(((sq.price ?? 0) + lot.houses * TYCOON_RULES.housePrice + (lot.hotel ? TYCOON_RULES.hotelPrice : 0)) * TYCOON_RULES.sellBack);
    setCash((c) => ({ ...c, [turn]: c[turn] + value }));
    setLots((l) => { const n = { ...l }; delete n[at]; return n; });
    setMsg(`${name(turn)} ขาย ${sq.emoji} ${sq.label} คืนธนาคาร ได้เงิน ${baht(value)} (ครึ่งราคา)`);
  };

  const roll = (w: Who) => {
    if (busy || over || offer !== null) return;
    setBusy(true); setCard(null);
    const n = 1 + Math.floor(Math.random() * 6);
    let spins = 0;
    const spin = window.setInterval(() => {
      setDice(1 + Math.floor(Math.random() * 6));
      if (++spins >= 6) {
        clearInterval(spin);
        setDice(n);
        const to = (pos[w] + n) % board.length;
        const passed = pos[w] + n >= board.length;
        setPos((p) => ({ ...p, [w]: to }));
        if (passed) {
          setCash((c) => ({ ...c, [w]: c[w] + TYCOON_RULES.passStart }));
          setMsg(`${name(w)} ทอยได้ ${n} แต้ม · เดินผ่าน 🏁 จุดเริ่มต้น รับเงินเดือน ${baht(TYCOON_RULES.passStart)}`);
        } else setMsg(`${name(w)} ทอยได้ ${n} แต้ม`);
        const t = window.setTimeout(() => land(w, to), passed ? 1000 : 400);
        timers.current.push(t);
      }
    }, 90);
    timers.current.push(spin);
  };

  // คอมพิวเตอร์เล่นเอง
  useEffect(() => {
    if (over || mode !== "cpu" || turn !== "p2" || busy || offer !== null) return;
    const t = window.setTimeout(() => roll("p2"), 900);
    timers.current.push(t);
    return () => clearTimeout(t);
  }, [turn, over, mode, busy, offer]); // eslint-disable-line react-hooks/exhaustive-deps

  const myTurn = mode === "friend" || turn === "p1";
  const offerSq = offer !== null ? board[offer] : null;
  const offerLot = offer !== null ? lots[offer] : undefined;
  const isMine = offerLot?.owner === turn;

  const w1 = netWorth("p1"), w2 = netWorth("p2");
  const winner = over ? (w1 === w2 ? "draw" : w1 > w2 ? "p1" : "p2") : null;

  const tierColor = (t?: BoardSquare["tier"]) =>
    t === "cheap" ? "bg-mint-soft" : t === "mid" ? "bg-sky-soft" : t === "rich" ? "bg-pink-soft" : "bg-white";

  return (
    <GameShell
      instruction={
        over
          ? winner === "draw" ? `🤝 เสมอกัน! มูลค่าทรัพย์สินเท่ากันคนละ ${baht(w1)}`
            : `🎉 ${name(winner as Who)} ชนะ! มูลค่าทรัพย์สินรวม ${baht(winner === "p1" ? w1 : w2)} ต่อ ${baht(winner === "p1" ? w2 : w1)}`
          : msg
      }
      done={over}
      onRestart={restart}
      stats={`${name("p1")} ${baht(cash.p1)} · ${name("p2")} ${baht(cash.p2)} · เหลืออีก ${Math.max(0, rounds - turnsDone[turn])} ตา`}
      mistakes={winner === "p2" && mode === "cpu" ? 1 : 0}
      total={1}
      onDone={onDone}
    >
      {/* โหมด */}
      <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
        {([["cpu", "👤 เล่นกับคอมพิวเตอร์"], ["friend", "👬 เล่น 2 คน"]] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setMode(id)} aria-pressed={mode === id}
            className={cn("tap rounded-full px-4 py-2 text-[14px] font-medium transition",
              mode === id ? "bg-purple-600 text-white! shadow-soft" : "bg-cream-dark text-purple-700 hover:brightness-95")}>
            {label}
          </button>
        ))}
        <SpeakButton text={msg} size="sm" label="อ่านให้ฟัง" />
      </div>

      {/* เงินและทรัพย์สิน */}
      <div className="mx-auto mb-3 grid max-w-xl grid-cols-2 gap-2">
        {(["p1", "p2"] as Who[]).map((w) => (
          <div key={w} className={cn("rounded-2xl px-3 py-2", turn === w && !over ? "bg-purple-100 ring-2 ring-purple-300" : "bg-cream-dark")}>
            <p className="text-[13px] text-ink-soft">{name(w)}</p>
            <p className="font-display text-xl text-purple-800">💵 {baht(cash[w])}</p>
            <p className="text-[12px] text-ink-soft">
              ที่ดิน {myLots(w).length} แปลง · มูลค่ารวม {baht(netWorth(w))}
            </p>
          </div>
        ))}
      </div>

      {/* การ์ดโอกาส */}
      {card && (
        <div className="mx-auto mb-3 max-w-md rounded-2xl bg-yellow-soft px-4 py-3 text-center">
          <p className="text-3xl leading-none">{card.emoji}</p>
          <p className="mt-1 text-[15px] leading-relaxed text-ink">{card.text}</p>
        </div>
      )}

      {/* กระดาน */}
      <div className={cn("mx-auto grid w-full gap-1.5", level === "easy" ? "max-w-[30rem] grid-cols-4" : "max-w-[40rem] grid-cols-6")}>
        {board.map((sq, i) => {
          const lot = lots[i];
          const here = (["p1", "p2"] as Who[]).filter((w) => pos[w] === i);
          return (
            <div key={i}
              className={cn("relative grid aspect-square place-items-center rounded-xl border-2 p-1 text-center transition",
                lot?.owner === "p1" ? "border-red-400 bg-red-50"
                  : lot?.owner === "p2" ? "border-blue-400 bg-blue-50"
                  : sq.kind === "start" ? "border-yellow-accent bg-yellow-soft"
                  : sq.kind === "chance" ? "border-purple-300 bg-purple-50"
                  : sq.kind === "tax" ? "border-pink-accent bg-pink-soft"
                  : sq.kind === "bank" ? "border-mint-soft bg-mint-soft"
                  : cn("border-line", tierColor(sq.tier)))}>
              <span className="text-[clamp(0.9rem,4vw,1.4rem)] leading-none">{sq.emoji}</span>
              <span className="text-[8px] leading-tight text-ink-soft">{sq.label}</span>
              {sq.kind === "land" && <span className="text-[8px] font-medium text-purple-700">{sq.price} ฿</span>}
              {lot && (lot.hotel || lot.houses > 0) && (
                <span className="text-[9px] leading-none">{lot.hotel ? "🏨" : "🏠".repeat(lot.houses)}</span>
              )}
              {here.length > 0 && (
                <span className="absolute right-0.5 top-0.5 flex gap-0.5">
                  {here.map((w) => <span key={w} className={cn("size-2.5 rounded-full ring-2 ring-white", w === "p1" ? "bg-red-500" : "bg-blue-500")} />)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* ปุ่มตัดสินใจ */}
      {offer !== null && offerSq && myTurn && (
        <div className="mx-auto mt-4 max-w-md rounded-2xl bg-cream-dark p-3 text-center">
          <p className="font-display text-[16px] text-purple-800">{offerSq.emoji} {offerSq.label}</p>
          {!isMine ? (
            <>
              <p className="mt-0.5 text-[14px] text-ink">
                ราคา {baht(offerSq.price ?? 0)} · ค่าเช่า {baht(offerSq.rent ?? 0)}
                <br />ซื้อแล้วจะเหลือเงิน {baht(cash[turn] - (offerSq.price ?? 0))}
              </p>
              <div className="mt-2 flex justify-center gap-2">
                <button type="button" onClick={() => buy(true)}
                  className="tap rounded-full bg-purple-600 px-5 py-2.5 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700">
                  💵 ซื้อที่ดิน
                </button>
                <button type="button" onClick={() => buy(false)}
                  className="tap rounded-full bg-white px-5 py-2.5 text-[15px] font-medium text-purple-700 shadow-soft hover:bg-cream">
                  ไม่ซื้อ
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-0.5 text-[14px] text-ink">
                ที่ดินของหนูเอง — จะลงทุนเพิ่มไหม?
                <br />สร้างบ้าน {baht(TYCOON_RULES.housePrice)} (ค่าเช่าเป็น {baht(offerSq.rentHouse ?? 0)}) · สร้างโรงแรม {baht(TYCOON_RULES.hotelPrice)} (ค่าเช่าเป็น {baht(offerSq.rentHotel ?? 0)})
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <button type="button" onClick={() => build("house")} disabled={(offerLot?.houses ?? 0) >= 2 || offerLot?.hotel}
                  className="tap rounded-full bg-purple-600 px-4 py-2 text-[14px] font-medium text-white shadow-soft hover:bg-purple-700 disabled:opacity-40">
                  🏠 สร้างบ้าน
                </button>
                <button type="button" onClick={() => build("hotel")} disabled={offerLot?.hotel || (offerLot?.houses ?? 0) < 1}
                  className="tap rounded-full bg-purple-600 px-4 py-2 text-[14px] font-medium text-white shadow-soft hover:bg-purple-700 disabled:opacity-40">
                  🏨 สร้างโรงแรม
                </button>
                <button type="button" onClick={() => { setOffer(null); endTurn(turn); }}
                  className="tap rounded-full bg-white px-4 py-2 text-[14px] font-medium text-purple-700 shadow-soft hover:bg-cream">
                  ยังไม่สร้าง
                </button>
              </div>
              {(offerLot?.houses ?? 0) < 1 && !offerLot?.hotel && (
                <p className="mt-1 text-[12px] text-ink-soft">ต้องสร้างบ้านก่อนถึงจะอัปเกรดเป็นโรงแรมได้</p>
              )}
            </>
          )}
        </div>
      )}

      {/* ลูกเต๋า */}
      {offer === null && !over && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <span className="grid size-16 place-items-center rounded-2xl bg-white text-[2.6rem] leading-none shadow-soft ring-2 ring-purple-200">
            {dice ? DICE[dice] : "🎲"}
          </span>
          <button type="button" onClick={() => roll(turn)} disabled={busy || !myTurn}
            className="tap rounded-full bg-purple-600 px-6 py-3 text-[16px] font-medium text-white shadow-soft hover:bg-purple-700 disabled:opacity-40">
            🎲 {busy ? "กำลังทอย…" : `ทอยลูกเต๋า — ตาของ ${name(turn)}`}
          </button>
        </div>
      )}

      {/* ขายทรัพย์สินเมื่อเงินน้อย */}
      {myTurn && !over && cash[turn] < 100 && myLots(turn).length > 0 && (
        <div className="mx-auto mt-4 max-w-md rounded-2xl bg-pink-soft p-3 text-center">
          <p className="text-[14px] font-medium text-[#a8456c]">เงินเหลือน้อยแล้ว — ขายที่ดินคืนธนาคารได้ครึ่งราคานะ</p>
          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            {myLots(turn).map((i) => (
              <button key={i} type="button" onClick={() => sell(i)}
                className="tap rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-purple-700 shadow-soft">
                ขาย {board[i].emoji} {board[i].label}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 text-center text-[13px] leading-relaxed text-ink-soft">
        💡 เงินเริ่มต้นคนละ {baht(TYCOON_RULES.startMoney)} · ผ่านจุดเริ่มต้นรับ {baht(TYCOON_RULES.passStart)} · เล่นคนละ {rounds} ตา
        <br />จบเกมนับ <b>เงินสด + มูลค่าที่ดินและสิ่งปลูกสร้าง</b> ใครมากกว่าชนะ
        <br />🪙 เป็นเงินจำลองในเกมเท่านั้น ไม่มีการใช้เงินจริง
      </p>
    </GameShell>
  );
}
