import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CalendarDays, Phone } from "lucide-react";
import { ADMISSION, feesPending } from "@/data/admission";
import { CONTACT } from "@/data/contact";
import { PageHeader, Tag } from "@/components/ui";

export const metadata: Metadata = {
  title: "สมัครเรียน",
  description: "รับสมัครเด็กอายุ 1.5–6 ปี · ดูแลแบบกลุ่มเล็ก ครู 3 คนต่อห้อง · ขั้นตอนการสมัคร เอกสารที่ใช้ และคำถามที่พบบ่อย",
};

const phone = CONTACT.channels.find((c) => c.id === "phone");
const line = CONTACT.channels.find((c) => c.id === "line");

export default function AdmissionPage() {
  return (
    <div className="container-page max-w-4xl py-8 sm:py-12">
      <PageHeader emoji="🎒" image="/nav/book.webp" title="สมัครเรียน" description={ADMISSION.intro}>
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="purple">รับอายุ 1.5–6 ปี</Tag>
          <Tag tone="pink">ครู 3 คน / ห้อง</Tag>
          <Tag tone="mint">{ADMISSION.period ?? "รับสมัครตลอดปี"}</Tag>
          {ADMISSION.trial.enabled && <Tag tone="yellow">🌼 ทดลองเรียนฟรี 1 วัน</Tag>}
          {ADMISSION.summer.enabled && <Tag tone="sky">☀️ มีซัมเมอร์แคมป์</Tag>}
        </div>
      </PageHeader>

      {/* ---------- ติดต่อก่อนเลย ---------- */}
      <section className="card animate-rise mb-8 border-purple-300! bg-gradient-to-br from-purple-50 to-pink-soft p-5 sm:p-6">
        <h2 className="text-xl sm:text-2xl">💜 สนใจให้ลูกเรียนที่นี่?</h2>
        <p className="mt-1 text-[15px] leading-relaxed text-ink">
          ทักมาคุยกับครูได้เลยค่ะ ไม่ต้องกรอกฟอร์มยาว ๆ — บอกแค่อายุของลูกกับระดับชั้นที่สนใจ แล้วครูจะแนะนำขั้นตอนให้
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {phone && (
            <a href={phone.href} className="tap inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-[15px] font-medium text-white shadow-soft transition hover:bg-purple-700">
              <Phone size={16} /> โทร {phone.value}
            </a>
          )}
          {line && (
            <a href={line.href} target="_blank" rel="noopener" className="tap inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-5 py-2.5 text-[15px] font-medium text-purple-700 transition hover:bg-purple-50">
              💬 ทักไลน์ {line.value}
            </a>
          )}
          <Link href="/contact" className="tap inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-[15px] text-ink-soft transition hover:bg-purple-50">
            ดูช่องทางติดต่อทั้งหมด <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ---------- ทำไมต้องที่นี่ ---------- */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl">🌱 ทำไมผู้ปกครองเลือก Little Purple Garden</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {ADMISSION.reasons.map((r, i) => (
            <div key={r.title} className="card animate-rise flex gap-3 p-4" style={{ animationDelay: `${i * 50}ms` }}>
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-purple-50 text-2xl">{r.emoji}</span>
              <span className="min-w-0">
                <span className="block font-display text-[16px] text-purple-800">{r.title}</span>
                <span className="mt-0.5 block text-[14px] leading-relaxed text-ink-soft">{r.detail}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- ขั้นตอนการสมัคร ---------- */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl">📋 ขั้นตอนการสมัคร</h2>
        <ol className="mt-3 grid gap-3 sm:grid-cols-2">
          {ADMISSION.steps.map((s) => (
            <li key={s.no} className="card flex gap-3 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-purple-600 font-display text-[17px] text-white">{s.no}</span>
              <span className="min-w-0">
                <span className="block font-display text-[16px] text-purple-800">{s.emoji} {s.title}</span>
                <span className="mt-0.5 block text-[14px] leading-relaxed text-ink-soft">{s.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- ค่าเทอม + เอกสาร ---------- */}
      <section className="mb-8 grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-xl">💰 ค่าธรรมเนียมการเรียน</h2>
          {feesPending() ? (
            <>
              <p className="mt-2 rounded-2xl bg-yellow-soft px-4 py-3 text-[14px] leading-relaxed text-ink">
                ค่าธรรมเนียมแต่ละระดับชั้นอยู่ระหว่างจัดทำ — สอบถามได้โดยตรงทางโทรศัพท์หรือไลน์ ครูยินดีแจ้งรายละเอียดและส่วนลดพี่น้องให้ค่ะ
              </p>
              <ul className="mt-3 grid gap-1.5 text-[14px]">
                {ADMISSION.fees.map((f) => (
                  <li key={f.gradeId} className="flex items-center justify-between gap-2 rounded-xl bg-cream-dark px-3 py-2">
                    <span>{f.emoji} {f.label}</span>
                    <span className="text-[13px] text-ink-soft">{f.note}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <ul className="mt-3 grid gap-1.5 text-[14px]">
              {ADMISSION.fees.map((f) => (
                <li key={f.gradeId} className="flex items-center justify-between gap-2 rounded-xl bg-cream-dark px-3 py-2">
                  <span>{f.emoji} {f.label}</span>
                  <span className="font-medium text-purple-800">{f.term ?? "สอบถามครู"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <h2 className="text-xl">📄 เอกสารที่ใช้สมัคร</h2>
          <ul className="mt-3 grid gap-1.5 text-[15px]">
            {ADMISSION.documents.map((d) => (
              <li key={d} className="flex gap-2"><span className="text-purple-400">✓</span><span>{d}</span></li>
            ))}
          </ul>
          <p className="mt-3 text-[13px] text-ink-soft">💡 เตรียมมาไม่ครบก็มาคุยก่อนได้ค่ะ ค่อยส่งเอกสารตามภายหลังได้</p>
        </div>
      </section>

      {/* ---------- 🌼 วันทดลองเรียน ---------- */}
      {ADMISSION.trial.enabled && (
        <section className="card animate-rise mb-8 border-mint-soft! p-5 sm:p-6">
          <div className="flex flex-wrap items-start gap-3">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-mint-soft text-3xl">🌼</span>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl">
                {ADMISSION.trial.title}
                {ADMISSION.trial.free && <span className="ml-2 rounded-full bg-mint-soft px-3 py-1 align-middle text-[13px] font-medium text-[#1f6b4d]">ไม่มีค่าใช้จ่าย</span>}
              </h2>
              <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">{ADMISSION.trial.tagline}</p>
            </div>
          </div>

          <dl className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-2xl bg-cream-dark px-4 py-3">
              <dt className="text-[13px] text-ink-soft">⏰ ระยะเวลา</dt>
              <dd className="mt-0.5 font-medium text-purple-800">{ADMISSION.trial.duration}</dd>
            </div>
            <div className="rounded-2xl bg-cream-dark px-4 py-3">
              <dt className="text-[13px] text-ink-soft">📅 วันที่เปิดรับ</dt>
              <dd className="mt-0.5 font-medium text-purple-800">{ADMISSION.trial.days}</dd>
            </div>
            <div className="rounded-2xl bg-cream-dark px-4 py-3">
              <dt className="text-[13px] text-ink-soft">👶 สำหรับ</dt>
              <dd className="mt-0.5 font-medium text-purple-800">{ADMISSION.trial.forAges}</dd>
            </div>
          </dl>

          <h3 className="mt-5 text-lg">วันนั้นลูกจะได้ทำอะไรบ้าง</h3>
          <ol className="mt-2 grid gap-2">
            {ADMISSION.trial.flow.map((f) => (
              <li key={f.time} className="flex gap-3 rounded-2xl bg-cream-dark px-4 py-3">
                <span className="w-14 shrink-0 font-display text-[15px] text-purple-600">{f.time}</span>
                <span className="min-w-0">
                  <span className="block font-medium text-purple-800">{f.emoji} {f.title}</span>
                  <span className="mt-0.5 block text-[14px] leading-relaxed text-ink-soft">{f.detail}</span>
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-4 rounded-2xl bg-yellow-soft px-4 py-3 text-[14px]">
            <p className="font-medium text-[#8a6a00]">🎒 สิ่งที่ต้องเตรียมมา</p>
            <ul className="mt-1 list-inside list-disc leading-relaxed text-ink">
              {ADMISSION.trial.bring.map((b) => <li key={b}>{b}</li>)}
            </ul>
          </div>
          <p className="mt-2 text-[13px] leading-snug text-ink-soft">💬 {ADMISSION.trial.note}</p>

          {phone && (
            <a href={phone.href} className="tap mt-4 inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700">
              <CalendarDays size={16} /> นัดวันทดลองเรียน
            </a>
          )}
        </section>
      )}

      {/* ---------- ☀️ ซัมเมอร์แคมป์ ---------- */}
      {ADMISSION.summer.enabled && (
        <section className="card animate-rise mb-8 border-yellow-accent! bg-gradient-to-br from-yellow-soft to-cream p-5 sm:p-6">
          <div className="flex flex-wrap items-start gap-3">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/70 text-3xl">☀️</span>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl">{ADMISSION.summer.title}</h2>
              <p className="mt-1 text-[15px] leading-relaxed text-ink">{ADMISSION.summer.tagline}</p>
            </div>
          </div>

          <dl className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/70 px-4 py-3">
              <dt className="text-[13px] text-ink-soft">📅 ช่วงเวลา</dt>
              <dd className="mt-0.5 font-medium text-purple-800">{ADMISSION.summer.period ?? "สอบถามครู"}</dd>
            </div>
            <div className="rounded-2xl bg-white/70 px-4 py-3">
              <dt className="text-[13px] text-ink-soft">⏰ เวลาเรียน</dt>
              <dd className="mt-0.5 font-medium text-purple-800">{ADMISSION.summer.days}</dd>
            </div>
            <div className="rounded-2xl bg-white/70 px-4 py-3">
              <dt className="text-[13px] text-ink-soft">👶 สำหรับ</dt>
              <dd className="mt-0.5 font-medium text-purple-800">{ADMISSION.summer.forAges}</dd>
            </div>
          </dl>

          <h3 className="mt-5 text-lg">กิจกรรมในแคมป์</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ADMISSION.summer.highlights.map((h) => (
              <div key={h.title} className="rounded-2xl bg-white/70 px-4 py-3">
                <p className="font-medium text-purple-800">{h.emoji} {h.title}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">{h.detail}</p>
              </div>
            ))}
          </div>

          <p className="mt-3 text-[13px] leading-snug text-ink-soft">💡 {ADMISSION.summer.note}</p>

          {phone && (
            <a href={phone.href} className="tap mt-4 inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700">
              <Phone size={16} /> สอบถามซัมเมอร์แคมป์
            </a>
          )}
        </section>
      )}

      {/* ---------- นัดเยี่ยมชม ---------- */}
      <section className="card mb-8 flex flex-wrap items-center gap-4 p-5">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-sky-soft text-3xl">🏫</span>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl">หรือแค่มาเยี่ยมชมโรงเรียนก่อนก็ได้</h2>
          <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
            ยังไม่พร้อมให้ลูกทดลองเรียนก็ไม่เป็นไรค่ะ นัดเข้ามาดูห้องเรียน สนามเด็กเล่น และพูดคุยกับครูก่อนได้
          </p>
        </div>
        {phone && (
          <a href={phone.href} className="tap inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-5 py-2.5 text-[15px] font-medium text-purple-700 hover:bg-purple-50">
            <CalendarDays size={16} /> นัดเยี่ยมชม
          </a>
        )}
      </section>

      {/* ---------- คำถามที่พบบ่อย ---------- */}
      <section>
        <h2 className="text-xl sm:text-2xl">❓ คำถามที่พบบ่อย</h2>
        <div className="mt-3 grid gap-2">
          {ADMISSION.faqs.map((f) => (
            <details key={f.q} className="card group p-4">
              <summary className="tap cursor-pointer list-none font-display text-[16px] text-purple-800 marker:content-none">
                <span className="inline-block w-5 transition-transform group-open:rotate-90">▸</span> {f.q}
              </summary>
              <p className="mt-2 pl-5 text-[15px] leading-relaxed text-ink">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
