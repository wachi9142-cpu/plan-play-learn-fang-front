"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NavIcon } from "@/components/ui/NavIcon";
import { useFlashCategories } from "./useFlashcards";

/** 🗂️ หน้ารวมหมวดแฟลชการ์ด — แบ่งเป็นกลุ่มใหญ่ ไม่ให้เลื่อนยาวเกินไป */
export function CategoryGrid() {
  const cats = useFlashCategories();
  const groups = [...new Set(cats.map((c) => c.group))];

  return (
    <div className="grid gap-10">
      {groups.map((g) => {
        const items = cats.filter((c) => c.group === g);
        return (
          <section key={g}>
            <h2 className="mb-3 text-2xl sm:text-3xl">{g === "สัตว์" ? "🐾" : "🌍"} หมวด{g}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((c, i) => {
                const cards = c.sets.reduce((n, s) => n + s.cards.length, 0);
                return (
                  <Link
                    key={c.id}
                    href={`/flashcards/${c.id}`}
                    className="card card-hover animate-rise group flex gap-4 p-5"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <NavIcon emoji={c.emoji} image={c.image} label={c.label} tint={c.tint} className="size-16 text-4xl" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-xl text-purple-800">{c.label}</span>
                      <span className="mt-0.5 block text-[14px] leading-relaxed text-ink-soft">{c.hint}</span>
                      <span className="mt-2 flex flex-wrap items-center gap-1.5 text-[13px]">
                        <span className="rounded-full bg-cream-dark px-2.5 py-0.5 text-purple-700">{c.sets.length} ชุด</span>
                        <span className="rounded-full bg-cream-dark px-2.5 py-0.5 text-purple-700">{cards} ใบ</span>
                      </span>
                      <span className="mt-2 inline-flex items-center gap-1 text-[14px] font-medium text-purple-600">
                        เปิดดูบัตร <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
