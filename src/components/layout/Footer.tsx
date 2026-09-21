import Link from "next/link";
import Image from "next/image";
import { NAV_ITEMS, SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-white/60">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/logo.webp" alt="" width={48} height={48} className="size-12 rounded-full border-2 border-purple-200 object-cover" />
            <div>
              <p className="font-display text-xl leading-tight text-purple-800">💜 {SITE.brand}</p>
              <p className="text-sm text-ink-soft">{SITE.credit} · 🌱 {SITE.motto}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-ink-soft">{SITE.name} · {SITE.nameEn}</p>
          <p className="mt-3 max-w-xs text-[15px] text-ink-soft">“{SITE.concept}”</p>
        </div>
        <div>
          <p className="mb-2 font-display text-lg text-purple-800">เมนู</p>
          <ul className="grid grid-cols-1 gap-1.5 text-[15px]">
            <li><Link href="/" className="inline-block py-1 text-ink hover:text-purple-700">🏠 หน้าหลัก</Link></li>
            {NAV_ITEMS.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="inline-block py-1 text-ink hover:text-purple-700">
                  {n.emoji} {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 font-display text-lg text-purple-800">🌷 {SITE.welcome}</p>
          <p className="text-[15px] text-ink-soft">
            เว็บไซต์นี้รวบรวมแผนการจัดประสบการณ์และกิจกรรมสำหรับเด็กอนุบาล 1
            เพื่อให้คุณครูปฐมวัยหยิบไปใช้ได้ง่าย ๆ ทุกวัน
          </p>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-sm text-ink-soft">
        © {new Date().getFullYear()} {SITE.brand} · {SITE.credit}
      </div>
    </footer>
  );
}
