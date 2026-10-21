"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { BackButton } from "@/components/ui/BackButton";
import { useFlashCategory } from "./useFlashcards";

/** 📚 หน้ารายชื่อชุดบัตรในหมวดหนึ่ง (ชุดละ 20 ใบ) */
export function SetList({ categoryId }: { categoryId: string }) {
  const cat = useFlashCategory(categoryId);

  if (!cat) {
    return (
      <div className="container-page py-10">
        <p className="card p-6 text-center text-[15px] text-ink-soft">ไม่พบหมวดนี้แล้ว — อาจถูกลบไปจากหน้าจัดการแฟลชการ์ด</p>
        <div className="mt-4 text-center">
          <Link href="/flashcards" className="tap rounded-full bg-purple-600 px-5 py-2.5 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700">
            กลับไปหน้าแฟลชการ์ด
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <BackButton fallback="/flashcards" label="แฟลชการ์ดทั้งหมด" />
      <PageHeader emoji={cat.emoji} image={cat.image} title={cat.label} description={cat.hint} />

      <div className="grid gap-4 sm:grid-cols-2">
        {cat.sets.map((s, i) => (
          <Link
            key={s.id}
            href={`/flashcards/${cat.id}/${s.id}`}
            className="card card-hover animate-rise group flex items-center gap-4 p-5"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-purple-100 font-display text-2xl text-purple-700">
              {s.no}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-xl text-purple-800">{s.title}</span>
              <span className="mt-0.5 block text-[14px] text-ink-soft">{s.cards.length} ใบ</span>
              <span className="mt-2 inline-flex items-center gap-1 text-[14px] font-medium text-purple-600">
                เริ่มเรียน <ArrowRight size={14} className="transition group-hover:translate-x-1" />
              </span>
            </span>
          </Link>
        ))}
      </div>

      {cat.sets.length === 0 && (
        <p className="card p-6 text-center text-[15px] text-ink-soft">
          หมวดนี้ยังไม่มีชุดบัตร — เพิ่มได้ที่หน้า <Link href="/admin/flashcards" className="font-medium text-purple-700 hover:underline">จัดการแฟลชการ์ด</Link>
        </p>
      )}
    </div>
  );
}
