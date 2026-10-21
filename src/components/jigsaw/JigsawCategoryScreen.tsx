"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader, Tag } from "@/components/ui";
import { BackButton } from "@/components/ui/BackButton";
import { JIGSAW_LEVELS, findJigsawCategory, type JigsawLevelId } from "@/data/jigsaw";
import { cn } from "@/lib/cn";
import { JigsawBoard } from "./JigsawBoard";

/** 🧩 หน้าหมวดจิ๊กซอว์ — เลือกภาพ แล้วเลือกระดับ จากนั้นต่อภาพได้ในหน้าเดียวกัน */
export function JigsawCategoryScreen({ categoryId }: { categoryId: string }) {
  const cat = findJigsawCategory(categoryId);
  const [picId, setPicId] = useState<string | null>(null);
  const [level, setLevel] = useState<JigsawLevelId>("easy");

  if (!cat) {
    return (
      <div className="container-page py-10 text-center">
        <p className="card p-6 text-[15px] text-ink-soft">ไม่พบหมวดนี้ค่ะ</p>
        <Link href="/jigsaw" className="tap mt-4 inline-block rounded-full bg-purple-600 px-5 py-2.5 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700">
          กลับไปหน้าจิ๊กซอว์
        </Link>
      </div>
    );
  }

  const pic = cat.pictures.find((p) => p.id === picId);
  const lv = JIGSAW_LEVELS.find((l) => l.id === level)!;

  return (
    <div className="container-page py-8 sm:py-12">
      <BackButton fallback="/jigsaw" label="จิ๊กซอว์ทั้งหมด" />
      <PageHeader emoji={cat.emoji} title={cat.label} description={cat.hint}>
        <div className="flex flex-wrap gap-2">
          <Tag tone="purple">🖼️ {cat.pictures.length} ภาพ</Tag>
          <Tag tone="mint">🎚️ 3 ระดับ</Tag>
        </div>
      </PageHeader>

      {/* ระดับความยาก */}
      <div className="mb-5">
        <p className="mb-2 text-[15px] font-medium text-purple-700">🎚️ เลือกระดับ</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {JIGSAW_LEVELS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLevel(l.id)}
              aria-pressed={level === l.id}
              className={cn(
                "tap rounded-2xl border-2 px-4 py-3 text-left transition",
                level === l.id ? "border-purple-400! bg-purple-50" : "border-line bg-white hover:bg-cream",
              )}
            >
              <span className="block font-display text-[16px] text-purple-800">{l.emoji} {l.label}</span>
              <span className="mt-0.5 block text-[13px] text-purple-500">👧 {l.who}</span>
              <span className="mt-0.5 block text-[13px] leading-snug text-ink-soft">{l.note}</span>
            </button>
          ))}
        </div>
      </div>

      {/* กระดานเล่น */}
      {pic ? (
        <section className="card p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl">{pic.title}</h2>
              <p className="text-[14px] text-ink-soft">{lv.emoji} ระดับ{lv.label} · {lv.note}</p>
            </div>
            <button
              type="button"
              onClick={() => setPicId(null)}
              className="tap rounded-full bg-cream-dark px-4 py-2 text-[14px] font-medium text-purple-700 hover:brightness-95"
            >
              🖼️ เปลี่ยนภาพ
            </button>
          </div>
          <JigsawBoard key={`${pic.id}-${level}`} image={pic.image} title={pic.title} pieces={lv.pieces} />
        </section>
      ) : (
        <>
          <p className="mb-3 text-[15px] font-medium text-purple-700">🖼️ เลือกภาพที่อยากต่อ</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {cat.pictures.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPicId(p.id)}
                className="card card-hover animate-rise group overflow-hidden p-0 text-left"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span
                  className="block aspect-[4/3] w-full bg-cover bg-center transition-transform group-hover:scale-105"
                  style={{ backgroundImage: `url(${p.image})` }}
                  role="img"
                  aria-label={p.title}
                />
                <span className="block p-3">
                  <span className="block font-display text-[15px] leading-snug text-purple-800">{p.title}</span>
                  <span className="mt-0.5 block text-[13px] text-purple-600">เริ่มต่อภาพ →</span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
