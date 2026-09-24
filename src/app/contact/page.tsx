import Image from "next/image";
import type { Metadata } from "next";
import { ExternalLink, MapPin, Navigation } from "lucide-react";
import { CONTACT, mapDirectionsUrl, mapEmbedUrl } from "@/data/contact";
import { PageHeader } from "@/components/ui";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "ติดต่อเรา" };

export default function ContactPage() {
  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader emoji="📞" title="ติดต่อเรา" description="ข้อมูลการติดต่อของ Little Purple Garden" />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ข้อมูลโรงเรียน + ที่อยู่ */}
        <section className="card animate-rise delay-1 p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <Image src="/logo-lpg.webp" alt="Little Purple Garden" width={80} height={80} className="size-20 rounded-full bg-white object-cover shadow-soft" />
            <div>
              <h2 className="flex items-center gap-2 text-xl sm:text-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/school/house.webp" alt="" className="block w-10 shrink-0 sm:w-12" />
                {CONTACT.school}
              </h2>
              <p className="text-[15px] text-ink-soft">{CONTACT.credit}</p>
            </div>
          </div>
          <h3 className="mt-5 text-lg">📍 ที่อยู่โรงเรียน</h3>
          <address className="mt-1 not-italic text-[15px] leading-relaxed sm:text-base">
            {CONTACT.address.lines.map((l) => <span key={l} className="block">{l}</span>)}
          </address>
          {CONTACT.address.note && <p className="mt-2 rounded-xl bg-yellow-soft px-3 py-2 text-[13px]">💡 {CONTACT.address.note}</p>}
        </section>

        {/* เวลาเปิด–ปิด */}
        <section className="card animate-rise delay-2 p-5 sm:p-6">
          <h2 className="text-xl sm:text-2xl">🕐 เวลาเปิด–ปิด</h2>
          <table className="mt-3 w-full text-[15px] sm:text-base">
            <thead>
              <tr className="bg-purple-600 text-white">
                <th className="rounded-l-xl px-4 py-2 text-left font-display font-medium">วัน</th>
                <th className="rounded-r-xl px-4 py-2 text-left font-display font-medium">เวลาเปิด–ปิด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {CONTACT.hours.map((h) => (
                <tr key={h.day} className={cn(h.closed && "text-ink-soft")}>
                  <td className="px-4 py-2">{h.day}</td>
                  <td className={cn("px-4 py-2", h.closed ? "text-[#a8456c]" : "font-medium text-purple-800")}>{h.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[13px] text-ink-soft">หมายเหตุ: {CONTACT.hoursNote}</p>
        </section>

        {/* แผนที่ */}
        <section className="card animate-rise delay-3 overflow-hidden lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl">🗺️ แผนที่โรงเรียน</h2>
            <a href={mapDirectionsUrl()} target="_blank" rel="noopener" className="tap inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700">
              <Navigation size={16} /> ดูเส้นทาง
            </a>
          </div>
          <iframe src={mapEmbedUrl()} title="แผนที่ Little Purple Garden" className="h-72 w-full border-0 sm:h-96" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
          <p className="flex items-center gap-1.5 px-5 py-3 text-[13px] text-ink-soft sm:px-6"><MapPin size={14} /> ตำแหน่งเป็นตัวอย่าง — แก้พิกัดได้ที่ src/data/contact.ts</p>
        </section>

        {/* ช่องทางติดต่อ */}
        <section className="card animate-rise delay-4 p-5 sm:p-6 lg:col-span-2">
          <h2 className="text-xl sm:text-2xl">📱 ช่องทางติดต่อ</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CONTACT.channels.map((c) => (
              <a key={c.id} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener" className="card card-hover flex items-center gap-3 p-4">
                <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-purple-100 text-2xl">
                  {"icon" in c && c.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.icon as string} alt="" className="h-[78%]! w-auto object-contain" />
                  ) : (
                    c.emoji
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] text-ink-soft">{c.label}</span>
                  <span className="block truncate font-medium text-purple-800">{c.value}</span>
                </span>
                <ExternalLink size={16} className="shrink-0 text-purple-300" />
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
