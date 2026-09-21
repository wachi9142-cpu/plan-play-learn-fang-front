import type { Metadata } from "next";
import { TEACHER_NOTES } from "@/data/content";
import { PageHeader } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "บันทึก / แนวทางสำหรับครู" };

export default function NotesPage() {
  return (
    <div className="container-page max-w-4xl py-8 sm:py-12">
      <PageHeader emoji="🌷" title="บันทึก / แนวทางสำหรับครู" description="เคล็ดลับเล็ก ๆ จากห้องเรียนอนุบาล 1 ที่อยากแบ่งปันให้คุณครูทุกคน" />

      <div className="animate-rise card mb-8 flex items-start gap-3 bg-purple-50 p-5">
        <span className="text-3xl">💜</span>
        <div>
          <p className="font-display text-lg text-purple-800">{SITE.welcome}</p>
          <p className="text-[15px] text-ink-soft">
            บันทึกเหล่านี้เขียนจากประสบการณ์จริง ปรับใช้ให้เข้ากับห้องเรียนของคุณครูได้ตามสบายเลยนะคะ
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {TEACHER_NOTES.map((n, i) => (
          <article key={n.id} className="card animate-rise p-5 sm:p-6" style={{ animationDelay: `${(i + 1) * 80}ms` }}>
            <div className="flex items-start gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-pink-soft text-2xl">{n.emoji}</span>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl">{n.title}</h2>
                <p className="text-[15px] text-ink-soft">{n.summary}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {n.points.map((p, j) => (
                <li key={j} className="flex gap-2.5 rounded-xl bg-cream px-4 py-2.5 text-[15px] sm:text-base">
                  <span className="text-purple-500">✓</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
