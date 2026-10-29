import type { Metadata } from "next";
import { PageHeader, Tag } from "@/components/ui";
import { CategoryGrid } from "@/components/flashcards/CategoryGrid";
import { FLASH_CATEGORIES } from "@/data/flashcards";

export const metadata: Metadata = {
  title: "สื่อประกอบการเรียนรู้ · แฟลชการ์ด",
  description: "แฟลชการ์ดคำศัพท์สองภาษา ไทย–อังกฤษ สำหรับเด็กปฐมวัย พลิกบัตร และเล่นเกมจับคู่",
};

export default function FlashcardsPage() {
  const sets = FLASH_CATEGORIES.reduce((n, c) => n + c.sets.length, 0);
  const cards = FLASH_CATEGORIES.reduce((n, c) => n + c.sets.reduce((m, s) => m + s.cards.length, 0), 0);
  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader
        emoji="🃏"
        title="สื่อประกอบการเรียนรู้ · แฟลชการ์ด"
        description="บัตรภาพคำศัพท์สองภาษา ไทย–อังกฤษ เน้นสิ่งรอบตัวเด็ก ฝึกการสังเกต การจดจำ และการเชื่อมโยงภาพกับของจริง"
      >
        <div className="flex flex-wrap gap-2">
          <Tag tone="purple">🗂️ {FLASH_CATEGORIES.length} หมวด</Tag>
          <Tag tone="sky">📚 {sets} ชุด</Tag>
          <Tag tone="mint">🃏 {cards} ใบ</Tag>
          <Tag tone="pink">🧩 มีเกมจับคู่และเกมทายคำ</Tag>
        </div>
      </PageHeader>

      <div className="card mb-8 border-mint-soft! p-5">
        <h2 className="text-lg">วิธีใช้กับเด็ก ๆ</h2>
        <ul className="mt-2 grid gap-1.5 text-[15px] leading-relaxed text-ink sm:grid-cols-2">
          <li>📖 <b>โหมดเรียนรู้</b> — ด้านหน้าเห็นภาพกับคำไทย พลิกดูคำอังกฤษของภาพเดิม</li>
          <li>🎯 <b>โหมดทบทวน</b> — เห็นแต่ภาพ ให้เด็กลองพูดเองก่อน แล้วค่อยพลิกเฉลย</li>
          <li>🗣️ <b>คำอ่าน</b> — มีคำอ่านภาษาอังกฤษให้ผู้ใหญ่อ่านออกเสียงให้เด็กฟัง</li>
          <li>🧩 <b>เล่นต่อ</b> — จับคู่ภาพกับคำ และทายคำจากภาพ ในชุดเดียวกัน</li>
        </ul>
      </div>

      <CategoryGrid />
    </div>
  );
}
