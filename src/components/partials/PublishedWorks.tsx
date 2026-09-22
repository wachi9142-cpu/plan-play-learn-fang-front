"use client";

import { useEffect, useState } from "react";
import type { PortfolioItem } from "@/types/canvas";
import { CANVAS_EVENT, listPublished } from "@/lib/canvas-store";
import { THAI_MONTHS_SHORT } from "@/data/calendar";

/** ผลงานจาก Garden Canvas ที่ครูเลือกเผยแพร่ (เก็บในเครื่องนี้) */
export function PublishedWorks() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  useEffect(() => { const load = () => setItems(listPublished()); load(); window.addEventListener(CANVAS_EVENT, load); return () => window.removeEventListener(CANVAS_EVENT, load); }, []);
  if (items.length === 0) return null;
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl">🎨 ผลงานจาก Garden Canvas <span className="text-[13px] font-normal text-ink-soft">({items.length})</span></h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p, i) => {
          const d = new Date(p.date);
          return (
            <figure key={p.id} className="card card-hover animate-rise flex flex-col overflow-hidden" style={{ animationDelay: `${Math.min(i, 7) * 60}ms` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.title} className="aspect-square w-full object-cover" loading="lazy" />
              <figcaption className="p-3 sm:p-4">
                <p className="text-[12px] text-ink-soft">{d.getDate()} {THAI_MONTHS_SHORT[d.getMonth()]} {d.getFullYear() + 543}</p>
                <h3 className="text-base leading-snug sm:text-lg">{p.title}</h3>
                <p className="mt-1 text-[13px] text-ink-soft">🧒 {p.childName}{(p.authors ?? []).filter((a) => a !== p.childName).length ? ` · วาดร่วมกับ ${(p.authors ?? []).filter((a) => a !== p.childName).join(", ")}` : ""}</p>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
