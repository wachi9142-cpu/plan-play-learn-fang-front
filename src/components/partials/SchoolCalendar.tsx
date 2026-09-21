"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CALENDAR_EVENTS, CALENDAR_TYPES, THAI_DAYS, THAI_MONTHS, eventsOn, type CalendarEvent } from "@/data/calendar";
import { cn } from "@/lib/cn";

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

/** ปฏิทินรายเดือน — กดวันที่เพื่อดูรายละเอียด */
export function SchoolCalendar() {
  // เริ่มที่เดือนแรกที่มีเหตุการณ์ (หรือเดือนปัจจุบันถ้าอยู่ในช่วง)
  const first = CALENDAR_EVENTS.map((e) => e.date).sort()[0] ?? new Date().toISOString().slice(0, 10);
  const last = CALENDAR_EVENTS.map((e) => e.endDate ?? e.date).sort().at(-1) ?? first;
  const today = new Date().toISOString().slice(0, 10);
  const start = today >= first && today <= last ? today : first;

  const [year, setYear] = useState(Number(start.slice(0, 4)));
  const [month, setMonth] = useState(Number(start.slice(5, 7)) - 1);
  const [selected, setSelected] = useState<string | null>(start);

  const cells = useMemo(() => {
    const firstDow = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const out: (string | null)[] = Array(firstDow).fill(null);
    for (let d = 1; d <= days; d++) out.push(iso(year, month, d));
    while (out.length % 7) out.push(null);
    return out;
  }, [year, month]);

  const move = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear()); setMonth(d.getMonth()); setSelected(null);
  };

  const monthEvents = CALENDAR_EVENTS
    .filter((e) => e.date.slice(0, 7) === `${year}-${pad(month + 1)}` || (e.endDate ?? "").slice(0, 7) === `${year}-${pad(month + 1)}`)
    .sort((a, b) => a.date.localeCompare(b.date));
  const selectedEvents = selected ? eventsOn(selected) : [];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-line bg-purple-50 px-3 py-3 sm:px-5">
          <button type="button" onClick={() => move(-1)} aria-label="เดือนก่อนหน้า" className="tap grid place-items-center rounded-full bg-white text-purple-700 shadow-soft hover:bg-purple-100"><ChevronLeft size={20} /></button>
          <h2 className="text-lg sm:text-2xl">📅 {THAI_MONTHS[month]} {year + 543}</h2>
          <button type="button" onClick={() => move(1)} aria-label="เดือนถัดไป" className="tap grid place-items-center rounded-full bg-white text-purple-700 shadow-soft hover:bg-purple-100"><ChevronRight size={20} /></button>
        </div>

        <div className="grid grid-cols-7 border-b border-line bg-white text-center text-[13px] font-medium text-ink-soft">
          {THAI_DAYS.map((d, i) => <div key={d} className={cn("py-2", (i === 0 || i === 6) && "text-[#a8456c]")}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-px bg-line p-px">
          {cells.map((date, i) => {
            if (!date) return <div key={i} className="min-h-14 bg-cream/60 sm:min-h-20" />;
            const evs = eventsOn(date);
            const day = Number(date.slice(8, 10));
            const isSel = selected === date;
            const isToday = date === today;
            const weekend = i % 7 === 0 || i % 7 === 6;
            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelected(date)}
                aria-label={`${day} ${THAI_MONTHS[month]}${evs.length ? ` มี ${evs.length} รายการ` : ""}`}
                className={cn(
                  "flex min-h-14 flex-col items-start gap-0.5 bg-white p-1 text-left transition-colors hover:bg-purple-50 sm:min-h-20 sm:p-1.5",
                  isSel && "bg-purple-100 ring-2 ring-inset ring-purple-500",
                  weekend && !isSel && "bg-cream/40",
                )}
              >
                <span className={cn("grid size-6 place-items-center rounded-full text-[13px] sm:text-[14px]", isToday ? "bg-purple-600 font-medium text-white" : weekend ? "text-[#a8456c]" : "text-ink")}>{day}</span>
                <span className="flex flex-wrap gap-0.5 sm:hidden">
                  {evs.slice(0, 3).map((e) => <span key={e.id} className={cn("size-1.5 rounded-full", CALENDAR_TYPES[e.type].bg, "brightness-75")} />)}
                </span>
                <span className="hidden w-full flex-col gap-0.5 sm:flex">
                  {evs.slice(0, 2).map((e) => (
                    <span key={e.id} className={cn("truncate rounded px-1 text-[11px] leading-4", CALENDAR_TYPES[e.type].bg, CALENDAR_TYPES[e.type].color)}>{CALENDAR_TYPES[e.type].emoji} {e.title}</span>
                  ))}
                  {evs.length > 2 && <span className="text-[10px] text-ink-soft">+{evs.length - 2}</span>}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-line px-3 py-2 text-[12px] text-ink-soft sm:px-5">
          {(Object.keys(CALENDAR_TYPES) as (keyof typeof CALENDAR_TYPES)[]).map((t) => (
            <span key={t} className="inline-flex items-center gap-1"><span className={cn("size-2.5 rounded-full brightness-75", CALENDAR_TYPES[t].bg)} />{CALENDAR_TYPES[t].emoji} {CALENDAR_TYPES[t].label}</span>
          ))}
        </div>
      </div>

      {/* รายละเอียด */}
      <aside className="space-y-4">
        <div className="card p-4 sm:p-5">
          <h3 className="text-lg">
            {selected ? `📌 ${Number(selected.slice(8, 10))} ${THAI_MONTHS[Number(selected.slice(5, 7)) - 1]} ${Number(selected.slice(0, 4)) + 543}` : "📌 เลือกวันที่ในปฏิทิน"}
          </h3>
          {selected && selectedEvents.length === 0 && <p className="mt-1 text-[15px] text-ink-soft">ไม่มีกำหนดการในวันนี้</p>}
          <div className="mt-2 grid gap-2">
            {selectedEvents.map((e) => <EventRow key={e.id} e={e} />)}
          </div>
        </div>
        <div className="card p-4 sm:p-5">
          <h3 className="text-lg">🗓️ ทั้งเดือน ({monthEvents.length})</h3>
          {monthEvents.length === 0 ? <p className="mt-1 text-[15px] text-ink-soft">ไม่มีกำหนดการในเดือนนี้</p> : (
            <div className="mt-2 grid gap-2">
              {monthEvents.map((e) => (
                <button key={e.id} type="button" onClick={() => setSelected(e.date)} className="text-left">
                  <EventRow e={e} compact />
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function EventRow({ e, compact = false }: { e: CalendarEvent; compact?: boolean }) {
  const t = CALENDAR_TYPES[e.type];
  const d = (s: string) => `${Number(s.slice(8, 10))} ${THAI_MONTHS[Number(s.slice(5, 7)) - 1].slice(0, 4)}.`;
  return (
    <div className={cn("flex gap-3 rounded-xl px-3 py-2", t.bg)}>
      <span className="text-xl">{t.emoji}</span>
      <div className="min-w-0">
        <p className={cn("font-medium leading-snug", t.color)}>{e.title}</p>
        <p className="text-[12px] text-ink-soft">
          {d(e.date)}{e.endDate ? ` – ${d(e.endDate)}` : ""}{e.time ? ` · ${e.time}` : ""} · {t.label}
        </p>
        {!compact && e.description && <p className="mt-1 text-[14px] text-ink">{e.description}</p>}
      </div>
    </div>
  );
}
