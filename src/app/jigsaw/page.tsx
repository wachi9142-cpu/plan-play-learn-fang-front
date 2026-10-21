import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader, Tag } from "@/components/ui";
import { JIGSAW_LEVELS, jigsawPictureCount, playableCategories, waitingCategories } from "@/data/jigsaw";

export const metadata: Metadata = {
  title: "เกมจิ๊กซอว์",
  description: "ต่อภาพจิ๊กซอว์ ลากชิ้นที่หายไปกลับเข้าที่ — มีหลายหมวดและ 3 ระดับ",
};

export default function JigsawPage() {
  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader
        emoji="🧩"
        title="เกมจิ๊กซอว์"
        description="ภาพมีช่องว่างหายไป — ลากชิ้นจากด้านข้างมาวางให้ตรงช่อง ฝึกการสังเกต การจับคู่รูปทรง และกล้ามเนื้อมือ"
      >
        <div className="flex flex-wrap gap-2">
          <Tag tone="purple">🗂️ {playableCategories().length} หมวดที่เล่นได้</Tag>
          <Tag tone="sky">🖼️ {jigsawPictureCount()} ภาพ</Tag>
          <Tag tone="mint">🎚️ 3 ระดับทุกภาพ</Tag>
          <Tag tone="yellow">👤 เล่นคนเดียว</Tag>
        </div>
      </PageHeader>

      <div className="card mb-8 border-mint-soft! p-5">
        <h2 className="text-lg">🎚️ แต่ละระดับต่างกันยังไง</h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {JIGSAW_LEVELS.map((l) => (
            <div key={l.id} className="rounded-2xl bg-cream-dark px-4 py-3">
              <p className="font-display text-[15px] text-purple-800">{l.emoji} {l.label}</p>
              <p className="text-[13px] text-purple-500">👧 {l.who}</p>
              <p className="mt-0.5 text-[13px] leading-snug text-ink-soft">{l.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {playableCategories().map((c, i) => (
          <Link
            key={c.id}
            href={`/jigsaw/${c.id}`}
            className="card card-hover animate-rise group overflow-hidden p-0"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span
              className="block aspect-[4/3] w-full bg-cover bg-center transition-transform group-hover:scale-105"
              style={{ backgroundImage: `url(${c.pictures[0]?.image})` }}
              role="img"
              aria-label={c.label}
            />
            <span className="block p-4">
              <span className="block font-display text-xl text-purple-800">{c.emoji} {c.label}</span>
              <span className="mt-0.5 block text-[14px] leading-snug text-ink-soft">{c.hint}</span>
              <span className="mt-2 inline-flex items-center gap-1 text-[14px] font-medium text-purple-600">
                {c.pictures.length} ภาพ · เริ่มต่อ <ArrowRight size={14} className="transition group-hover:translate-x-1" />
              </span>
            </span>
          </Link>
        ))}
      </div>

      {/* หมวดที่ครูอยากได้ แต่ยังไม่มีภาพ */}
      {waitingCategories().length > 0 && (
        <section className="mt-10">
          <h2 className="mb-1 text-2xl sm:text-3xl">🖼️ หมวดที่กำลังรอภาพ</h2>
          <p className="mb-4 text-[15px] leading-relaxed text-ink-soft">
            หมวดเหล่านี้เตรียมที่ไว้ให้แล้ว แค่ส่งภาพมาก็เปิดเล่นได้ทันที —
            ภาพที่เหมาะคือ <b>สีสดใส รายละเอียดชัด สัดส่วน 4:3</b> หมวดละ 5–6 ภาพ
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {waitingCategories().map((c) => (
              <div key={c.id} className="card border-dashed! p-4 opacity-90">
                <p className="font-display text-lg text-purple-800">{c.emoji} {c.label}</p>
                <p className="mt-0.5 text-[14px] leading-snug text-ink-soft">{c.hint}</p>
                {c.need && (
                  <p className="mt-2 rounded-2xl bg-yellow-soft px-3 py-2 text-[13px] leading-relaxed text-[#8a6a00]">{c.need}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
