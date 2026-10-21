"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { BackButton } from "@/components/ui/BackButton";
import { cn } from "@/lib/cn";
import { FlashcardPlayer } from "./FlashcardPlayer";
import { MatchGame } from "./MatchGame";
import { QuizGame } from "./QuizGame";
import { useFlashCategory } from "./useFlashcards";

type Tab = "cards" | "match" | "quiz";

const TABS: { id: Tab; emoji: string; label: string }[] = [
  { id: "cards", emoji: "🃏", label: "บัตรคำ" },
  { id: "match", emoji: "🧩", label: "เกมจับคู่" },
  { id: "quiz", emoji: "🎯", label: "เกมทายคำ" },
];

/** 🃏 หน้าเล่นชุดบัตร — บัตรคำ · เกมจับคู่ · เกมทายคำ อยู่ในหน้าเดียว */
export function SetScreen({ categoryId, setId }: { categoryId: string; setId: string }) {
  const cat = useFlashCategory(categoryId);
  const set = cat?.sets.find((s) => s.id === setId);
  const [tab, setTab] = useState<Tab>("cards");
  const [lang, setLang] = useState<"th" | "en">("en");

  if (!cat || !set) {
    return (
      <div className="container-page py-10">
        <p className="card p-6 text-center text-[15px] text-ink-soft">ไม่พบชุดบัตรนี้แล้ว — อาจถูกลบไปจากหน้าจัดการแฟลชการ์ด</p>
        <div className="mt-4 text-center">
          <Link href="/flashcards" className="tap rounded-full bg-purple-600 px-5 py-2.5 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700">
            กลับไปหน้าแฟลชการ์ด
          </Link>
        </div>
      </div>
    );
  }

  const back = `/flashcards/${cat.id}`;
  const empty = set.cards.length === 0;

  return (
    <div className="container-page py-8 sm:py-12">
      <BackButton fallback={back} label={cat.label} />
      <PageHeader emoji={cat.emoji} image={cat.image} title={set.title} description={`${set.cards.length} ใบ · ${cat.hint}`} />

      {/* เลือกกิจกรรม */}
      <div className="mx-auto mb-4 grid max-w-2xl grid-cols-3 gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-pressed={tab === t.id}
            className={cn(
              "tap rounded-2xl border-2 px-2 py-2.5 text-center text-[15px] font-medium transition",
              tab === t.id ? "border-purple-400! bg-purple-50 text-purple-800" : "border-line bg-white text-purple-700 hover:bg-cream",
            )}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* เกมใช้ภาษาไหน */}
      {tab !== "cards" && (
        <div className="mx-auto mb-4 flex max-w-2xl items-center justify-center gap-2 text-[14px]">
          <span className="text-ink-soft">เล่นด้วยภาษา</span>
          {([["th", "🇹🇭 ไทย"], ["en", "🇬🇧 อังกฤษ"]] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setLang(id)}
              aria-pressed={lang === id}
              className={cn(
                "tap rounded-full px-4 py-1.5 font-medium transition",
                lang === id ? "bg-purple-600 text-white shadow-soft" : "bg-cream-dark text-purple-700 hover:brightness-95",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {empty ? (
        <p className="card mx-auto max-w-xl p-6 text-center text-[15px] text-ink-soft">
          ชุดนี้ยังไม่มีบัตร — เพิ่มได้ที่หน้า{" "}
          <Link href="/admin/flashcards" className="font-medium text-purple-700 hover:underline">จัดการแฟลชการ์ด</Link>
        </p>
      ) : tab === "cards" ? (
        <FlashcardPlayer key={set.id} cards={set.cards} backHref={back} />
      ) : tab === "match" ? (
        <MatchGame key={`${set.id}-${lang}`} cards={set.cards} lang={lang} backHref={back} />
      ) : (
        <QuizGame key={`${set.id}-${lang}`} cards={set.cards} lang={lang} backHref={back} />
      )}
    </div>
  );
}
