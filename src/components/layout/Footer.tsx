import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/site";
import { CONTACT } from "@/data/contact";

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
          <p className="mt-3 max-w-xs text-[15px] text-ink-soft">“{SITE.concept}”</p>
        </div>
        <div>
          <p className="mb-2 font-display text-lg text-purple-800">📞 ติดต่อเรา</p>
          <address className="not-italic text-[15px] text-ink-soft">
            {CONTACT.address.lines.map((l) => <span key={l} className="block">{l}</span>)}
          </address>
          <ul className="mt-2 grid gap-1 text-[15px]">
            {CONTACT.channels.slice(0, 3).map((c) => (
              <li key={c.id}><a href={c.href} className="text-ink hover:text-purple-700">{c.emoji} {c.value}</a></li>
            ))}
          </ul>
          <Link href="/contact" className="mt-2 inline-block text-[14px] font-medium text-purple-700 hover:underline">ดูแผนที่และเวลาเปิด–ปิด →</Link>
        </div>
        <div>
          <p className="mb-2 font-display text-lg text-purple-800">🌷 {SITE.welcome}</p>
          <p className="text-[15px] text-ink-soft">{SITE.intro} เพื่อให้คุณครูและผู้ปกครองหยิบไปใช้กับเด็ก ๆ ได้ง่าย ๆ ทุกวัน</p>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-sm text-ink-soft">
        © {new Date().getFullYear()} {SITE.brand} · {SITE.credit}
      </div>
    </footer>
  );
}
