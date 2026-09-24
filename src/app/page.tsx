import Link from "next/link";
import { NewsIcon } from "@/components/ui/NewsIcon";
import Image from "next/image";
import { NavIcon } from "@/components/ui/NavIcon";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { MENU_ITEMS, SITE } from "@/lib/site";
import { NEWS_CATEGORIES, sortedNews } from "@/data/news";
import { Tag } from "@/components/ui";
import { GRADES } from "@/data/plans";
import { PROJECTS } from "@/data/projects";
import { CALENDAR_EVENTS, CALENDAR_TYPES, THAI_MONTHS_SHORT } from "@/data/calendar";
import { EVENT_CATEGORIES, SCHOOL_EVENTS } from "@/data/school-events";
import { getGalleryByKind } from "@/data/gallery";
import { CONTACT } from "@/data/contact";
import { HeroBanner } from "@/components/partials/HeroBanner";
import { PrepThisWeek, UpcomingEvents } from "@/components/events";
import { PinnedNotice } from "@/components/partials/PinnedNotice";
import { cn } from "@/lib/cn";

const thaiDate = (iso: string) => `${Number(iso.slice(8, 10))} ${THAI_MONTHS_SHORT[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(0, 4)) + 543 - 2500}`;

export default function HomePage() {
  // การ์ดแผนเล่นเรียน 6 ใบ (ไม่รวม 6 กิจกรรมหลัก ตามบรีฟหน้าแรก)
  const PLAN_MENU = MENU_ITEMS.filter((m) => m.href !== "/core-activities");
  const latestNews = sortedNews().slice(0, 4);

  // กิจกรรมที่กำลังจะมาถึง (ตั้งแต่วันนี้) 3 รายการ — ถ้าไม่มี แสดง 3 รายการแรก
  const today = new Date().toISOString().slice(0, 10);
  const sortedEvents = [...CALENDAR_EVENTS].sort((a, b) => a.date.localeCompare(b.date));
  const future = sortedEvents.filter((e) => (e.endDate ?? e.date) >= today);
  const upcoming = (future.length ? future : sortedEvents).slice(0, 3);

  const recentEvents = [...SCHOOL_EVENTS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const recentWorks = getGalleryByKind("work").slice(0, 3);
  const featuredProjects = PROJECTS.filter((p) => ["egg-explorer", "mango-lab", "coconut"].includes(p.id));

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="bg-dots pointer-events-none absolute inset-0" aria-hidden />
        <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-purple-100 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 -right-16 size-64 rounded-full bg-pink-soft blur-3xl" aria-hidden />

        <HeroBanner />

        <div className="container-page relative py-10 text-center sm:py-14 lg:py-16">
          <div className="animate-rise mx-auto max-w-3xl">
            <Image src="/logo-lpg.webp" alt="Little Purple Garden by Teacher Kaowfang" width={288} height={288} priority className="animate-float mx-auto size-52 rounded-full bg-white object-cover shadow-lift sm:size-64 lg:size-72" />
            <h1 className="mt-5 font-display text-[2.2rem] leading-tight text-purple-800 sm:text-5xl lg:text-6xl">Little Purple Garden</h1>
            <p className="mt-1 font-display text-lg text-purple-500 sm:text-2xl">{SITE.brandSub}</p>
            <p className="mt-1 text-base text-ink-soft sm:text-lg">{SITE.credit}</p>
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-5 py-2 font-display text-base text-purple-700 shadow-soft sm:text-lg">🌱 {SITE.motto}</p>
            <p className="mx-auto mt-6 max-w-2xl font-display text-lg text-purple-800 sm:text-2xl">🌱 “{SITE.tagline}”</p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/about" className="tap inline-flex w-full items-center justify-center gap-2 rounded-full bg-purple-600 px-7 py-3 text-base font-medium text-white shadow-soft transition hover:bg-purple-700 hover:shadow-lift sm:w-auto">
                <Image src="/school/house.webp" alt="" width={120} height={178} className="h-7! w-[19px]! shrink-0" /> รู้จักโรงเรียน <ArrowRight size={18} />
              </Link>
              <Link href="/menu" className="tap inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-purple-200 bg-white px-7 py-3 text-base font-medium text-purple-700 transition hover:border-purple-300 hover:bg-purple-50 sm:w-auto">
                💜 เข้าสู่แผนเล่นเรียน
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- แนะนำโรงเรียนแบบสั้น ๆ ---------- */}
      <section className="container-page -mt-4 sm:-mt-8">
        <div className="animate-rise delay-1 card grid gap-5 p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-8">
          <span className="mx-auto block w-24 shrink-0 sm:mx-0 sm:w-32">
            <Image src="/school/house.webp" alt="" width={360} height={533} className="h-auto w-full drop-shadow-sm" />
          </span>
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl">ยินดีต้อนรับสู่ Little Purple Garden</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink sm:text-base">{SITE.welcomeIntro}</p>
          </div>
          <Link href="/about" className="tap inline-flex items-center justify-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-base font-medium text-white shadow-soft transition hover:bg-purple-700">
            อ่านเพิ่มเติม <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ---------- 📢 ประกาศสำคัญ ---------- */}
      <PinnedNotice />

      {/* ---------- ⭐ 📅 กิจกรรมที่กำลังจะมาถึง (ผู้ปกครองต้องเตรียมของ) ---------- */}
      <UpcomingEvents />

      {/* ---------- 📢 ข่าวสารและประชาสัมพันธ์ ---------- */}
      <section className="container-page pb-12 sm:pb-16">
        <div className="mb-5 flex items-end justify-between gap-3">
          <h2 className="flex items-center gap-2 text-2xl sm:text-3xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/news/announce.webp" alt="" className="h-9! w-auto object-contain sm:h-11!" />
            ประชาสัมพันธ์ล่าสุด
          </h2>
          <Link href="/news" className="tap hidden items-center gap-1 text-[15px] font-medium text-purple-700 hover:underline sm:inline-flex">
            ดูประชาสัมพันธ์ทั้งหมด <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {latestNews.map((n, i) => {
            const c = NEWS_CATEGORIES[n.category];
            return (
              <Link key={n.id} href={`/news/${n.id}`} className="card card-hover animate-rise group flex gap-4 p-4 sm:p-5" style={{ animationDelay: `${i * 60}ms` }}>
                <NewsIcon emoji={c.emoji} image={c.image} label={c.label} className="size-12 rounded-xl text-2xl" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <Tag tone={c.tone}>{c.label}</Tag>
                    <span className="text-[13px] text-ink-soft">{n.dateLabel}</span>
                    {n.pinned && <span className="text-[12px] font-medium text-[#a8456c]">📌 ปักหมุด</span>}
                  </span>
                  <span className="mt-1 block font-display text-[17px] leading-snug text-purple-800">{n.title}</span>
                  <span className="mt-1 line-clamp-2 block text-[14px] text-ink-soft">{n.summary}</span>
                </span>
                <ArrowRight size={18} className="shrink-0 self-center text-purple-300 transition group-hover:translate-x-1 group-hover:text-purple-600" />
              </Link>
            );
          })}
        </div>
        <Link href="/news" className="tap mt-4 inline-flex items-center gap-1 text-[15px] font-medium text-purple-700 hover:underline sm:hidden">
          ดูประชาสัมพันธ์ทั้งหมด <ArrowRight size={16} />
        </Link>
      </section>

      {/* ---------- 🎒 สัปดาห์นี้ต้องเตรียมอะไร? ---------- */}
      <PrepThisWeek />

      {/* ---------- 🗓️ ปฏิทินโรงเรียน ---------- */}
      <section className="container-page pb-12 sm:pb-16">
        <div className="card p-5 sm:p-6">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-2xl sm:text-3xl">🗓️ ปฏิทินโรงเรียน</h2>
            <Link href="/calendar" className="tap hidden items-center gap-1 text-[15px] font-medium text-purple-700 hover:underline sm:inline-flex">ดูปฏิทินทั้งหมด <ArrowRight size={16} /></Link>
          </div>
          <ul className="grid gap-2 md:grid-cols-3">
            {upcoming.map((e) => {
              const t = CALENDAR_TYPES[e.type];
              return (
                <li key={e.id}>
                  <Link href="/calendar" className={cn("flex items-center gap-3 rounded-2xl px-4 py-3 transition hover:brightness-95", t.bg)}>
                    <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/80 text-xl">
                      {t.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.icon} alt="" className="h-[78%]! w-auto object-contain" />
                      ) : (
                        "📅"
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className={cn("block text-[13px] font-medium", t.color)}>{thaiDate(e.date)}{e.endDate ? ` – ${thaiDate(e.endDate)}` : ""} · {t.emoji} {t.label}</span>
                      <span className="block truncate font-display text-[16px] text-purple-800">{e.title}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link href="/calendar" className="tap mt-3 inline-flex items-center gap-1 text-[15px] font-medium text-purple-700 hover:underline sm:hidden">ดูปฏิทินทั้งหมด <ArrowRight size={16} /></Link>
        </div>
      </section>

      {/* ---------- ห้องสมุด: ชั้นหนังสือ / มุมหนังสือ ---------- */}
      <section className="container-page pt-12 sm:pt-16">
        <h2 className="mb-2 text-center text-2xl sm:text-3xl">📚 ห้องสมุดของสวนสีม่วง</h2>
        <p className="mb-6 text-center text-[15px] text-ink-soft">สองพื้นที่ที่มีหน้าที่ต่างกัน — สำหรับผู้ใหญ่ และสำหรับเด็ก</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/library/shelf" className="card card-hover animate-rise group flex items-center gap-4 p-5">
            <span className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-3xl bg-gradient-to-br from-purple-100 to-sky-soft shadow-soft transition-transform group-hover:scale-105">
              <Image src="/library/shelf.webp" alt="" width={256} height={256} className="size-full object-cover object-[center_62%]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xl">📚 ชั้นหนังสือ</span>
              <span className="mt-0.5 block text-[14px] text-ink-soft">สำหรับครูและผู้ปกครอง — หลักสูตร เอกสารทางการ คู่มือ และหนังสือความรู้</span>
              <span className="mt-2 inline-flex items-center gap-1 text-[14px] font-medium text-purple-700">เปิดชั้นหนังสือ <ArrowRight size={15} /></span>
            </span>
          </Link>
          <Link href="/library/kids" className="card card-hover animate-rise delay-1 group flex items-center gap-4 p-5">
            <span className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-3xl bg-gradient-to-br from-pink-soft to-yellow-soft shadow-soft transition-transform group-hover:scale-105">
              <Image src="/library/kids.webp" alt="" width={256} height={256} className="size-full object-cover object-[center_52%]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xl">🧸 มุมหนังสือ</span>
              <span className="mt-0.5 block text-[14px] text-ink-soft">นิทานและเรื่องราวสำหรับเด็ก — อ่าน ฟัง และทำกิจกรรมต่อยอด</span>
              <span className="mt-2 inline-flex items-center gap-1 text-[14px] font-medium text-purple-700">เข้ามุมหนังสือ <ArrowRight size={15} /></span>
            </span>
          </Link>
        </div>
      </section>

      {/* ---------- ระดับชั้น (4 Card) ---------- */}
      <section className="container-page pt-12 sm:pt-16">
        <h2 className="mb-2 text-center text-2xl sm:text-3xl">🌱 ระดับการดูแลและการศึกษา</h2>
        <p className="mb-6 text-center text-[15px] text-ink-soft">👶 Nursery · 🎒 Kindergarten</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {GRADES.map((g, i) => (
            <Link key={g.id} href={`/about/${g.id}`} className="card card-hover animate-rise group flex flex-col items-center p-6 text-center" style={{ animationDelay: `${i * 80}ms` }}>
              <span className="text-[12px] font-medium text-purple-500">{g.group === "nursery" ? "👶 Nursery" : "🎒 Kindergarten"}</span>
              <span className={cn("mt-2 grid size-28 place-items-center overflow-hidden rounded-2xl text-4xl shadow-soft transition-transform group-hover:scale-105 sm:size-32", g.tint)} aria-hidden>
                {g.cover ? <Image src={g.cover} alt="" width={256} height={256} className="size-full object-cover" /> : g.stage.emoji}
              </span>
              <span className="mt-3 font-display text-xl text-purple-800">{g.name}</span>
              <span className="mt-0.5 text-[13px] font-medium text-purple-600">{g.stage.emoji} {g.stage.name}</span>
              <span className="mt-1 text-[15px] text-ink-soft">{g.stage.short}</span>
              <span className="mt-3 inline-flex items-center gap-1 text-[14px] font-medium text-purple-600">ดูข้อมูล <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- 📚 แนะนำ "แผนเล่นเรียน" (จุดเด่นของเว็บ) ---------- */}
      <section className="container-page py-12 sm:py-16">
        <div className="card relative overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-pink-soft p-6 sm:p-8 lg:p-10">
          <div className="bg-dots pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-1.5 text-[14px] font-medium text-white shadow-soft">📚 จุดเด่นของเว็บไซต์</span>
              <h2 className="mt-4 font-display text-3xl text-purple-800 sm:text-4xl lg:text-5xl">แผนเล่นเรียน</h2>
              <p className="mt-1 font-display text-lg text-purple-500 sm:text-xl">🌱 Play • Learn • Grow</p>
              <p className="mx-auto mt-3 max-w-2xl text-[15px] text-ink-soft sm:text-base">รวมทุกอย่างที่ครูและผู้ปกครองใช้จัดประสบการณ์ให้เด็ก ๆ — เชื่อมโยงกันตั้งแต่กำหนดการสอน → แผน → กิจกรรม → เกม → ใบงาน</p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {PLAN_MENU.map((item, i) => (
                <Link key={item.href} href={item.href} className="card card-hover animate-rise group flex flex-col items-center p-4 text-center sm:flex-row sm:items-center sm:gap-4 sm:p-5 sm:text-left" style={{ animationDelay: `${i * 70}ms` }}>
                  <NavIcon emoji={item.emoji} image={item.image} label={item.label} tint={item.tint} className="size-14 text-3xl transition-transform group-hover:-rotate-6 group-hover:scale-105 sm:size-16 sm:text-4xl" />
                  <span className="mt-2 min-w-0 flex-1 sm:mt-0">
                    <span className="block font-display text-[16px] leading-snug text-purple-800 sm:text-lg">{item.label}</span>
                    <span className="mt-0.5 hidden text-[14px] text-ink-soft sm:block">{item.description}</span>
                  </span>
                  <ArrowRight size={18} className="hidden shrink-0 text-purple-300 transition group-hover:translate-x-1 group-hover:text-purple-600 sm:block" />
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link href="/menu" className="tap inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-3.5 text-base font-medium text-white shadow-lift transition hover:bg-purple-700 sm:text-lg">
                เข้าสู่แผนเล่นเรียน <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- 📸 กิจกรรมโรงเรียน + 🏆 ผลงานเด็ก ---------- */}
      <section className="container-page pb-12 sm:pb-16">
        <h2 className="mb-5 flex items-center gap-2 text-2xl sm:text-3xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art/palette.webp" alt="" className="h-9! w-auto object-contain sm:h-11!" />
          กิจกรรมและผลงานเด็ก
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card p-5">
            <div className="mb-3 flex items-end justify-between gap-2">
              <h3 className="text-xl">📸 กิจกรรมโรงเรียน</h3>
              <Link href="/school-events" className="text-[14px] font-medium text-purple-700 hover:underline">ดูทั้งหมด →</Link>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {recentEvents.map((e) => {
                const c = EVENT_CATEGORIES[e.category];
                return (
                  <Link key={e.id} href={`/school-events/${e.id}`} className="group overflow-hidden rounded-2xl border border-line">
                    {e.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e.image} alt={e.title} className="aspect-square w-full object-cover transition group-hover:scale-105" />
                    ) : (
                      <span className={cn("grid aspect-square place-items-center text-4xl transition group-hover:scale-110 sm:text-5xl", c.tint)}>{e.emoji}</span>
                    )}
                    <span className="block truncate px-2 py-1.5 text-[12px] text-ink sm:text-[13px]">{e.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="card p-5">
            <div className="mb-3 flex items-end justify-between gap-2">
              <h3 className="text-xl">🏆 ผลงานของเด็ก</h3>
              <Link href="/gallery/works" className="text-[14px] font-medium text-purple-700 hover:underline">ดูทั้งหมด →</Link>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {recentWorks.map((w, i) => (
                <Link key={w.id} href="/gallery/works" className="group overflow-hidden rounded-2xl border border-line">
                  {w.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={w.image} alt={w.title} className="aspect-square w-full object-cover transition group-hover:scale-105" />
                  ) : (
                    <span className={cn("grid aspect-square place-items-center overflow-hidden text-4xl transition group-hover:scale-110 sm:text-5xl", ["bg-pink-soft", "bg-yellow-soft", "bg-mint-soft"][i % 3])}>
                      {w.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={w.icon} alt="" className="h-[62%]! w-auto object-contain" />
                      ) : (
                        w.emoji
                      )}
                    </span>
                  )}
                  <span className="block truncate px-2 py-1.5 text-[12px] text-ink sm:text-[13px]">{w.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- 🌟 โครงการเด่น ---------- */}
      <section className="container-page pb-12 sm:pb-16">
        <div className="mb-5 flex items-end justify-between gap-3">
          <h2 className="text-2xl sm:text-3xl">🌟 โครงการเด่น</h2>
          <Link href="/projects" className="tap hidden items-center gap-1 text-[15px] font-medium text-purple-700 hover:underline sm:inline-flex">ดูโครงการทั้งหมด <ArrowRight size={16} /></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {featuredProjects.map((p, i) => (
            <Link key={p.id} href={`/projects/${p.id}`} className="card card-hover animate-rise group flex flex-col p-5" style={{ animationDelay: `${i * 70}ms` }}>
              <span className="grid size-16 place-items-center rounded-2xl bg-yellow-soft text-4xl transition-transform group-hover:-rotate-6">{p.emoji}</span>
              <span className="mt-3 font-display text-lg leading-snug text-purple-800">{p.title}</span>
              <span className="mt-1 flex-1 text-[14px] text-ink-soft">{p.description}</span>
              <span className="mt-3 inline-flex items-center gap-1 text-[14px] font-medium text-purple-600">ดูโครงการ <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
        <Link href="/projects" className="tap mt-4 inline-flex items-center gap-1 text-[15px] font-medium text-purple-700 hover:underline sm:hidden">ดูโครงการทั้งหมด <ArrowRight size={16} /></Link>
      </section>

      {/* ---------- 👩‍🏫 Teacher Kaowfang ---------- */}
      <section className="container-page pb-12 sm:pb-16">
        <div className="card grid gap-5 bg-gradient-to-r from-purple-50 to-pink-soft p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-8">
          <Image src="/logo-lpg.webp" alt="Teacher Kaowfang" width={128} height={128} className="mx-auto size-28 rounded-full border-4 border-white object-cover shadow-lift sm:size-32" />
          <div className="text-center sm:text-left">
            <p className="text-[13px] font-medium text-purple-500">👩‍🏫 ผู้จัดทำ</p>
            <h2 className="text-2xl sm:text-3xl">Teacher Kaowfang</h2>
            <p className="mt-1 text-[15px] text-ink sm:text-base">ผู้สร้างสรรค์สื่อและกิจกรรมการเรียนรู้สำหรับเด็กปฐมวัย</p>
            <p className="mt-1 text-[14px] text-ink-soft">“{SITE.concept}”</p>
          </div>
          <Link href="/about#staff" className="tap inline-flex items-center justify-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-base font-medium text-white shadow-soft transition hover:bg-purple-700">
            รู้จัก Teacher Kaowfang <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ---------- 📞 ติดต่อโรงเรียน ---------- */}
      <section className="container-page">
        <div className="card p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl">📞 มีข้อสงสัยหรือต้องการสอบถามข้อมูล?</h2>
              <ul className="mt-4 grid gap-2 text-[15px] sm:grid-cols-2">
                <li className="flex items-start gap-2"><MapPin size={18} className="mt-1 shrink-0 text-purple-500" /><span>{CONTACT.address.lines.join(" ")}</span></li>
                <li className="flex items-center gap-2"><Phone size={18} className="shrink-0 text-purple-500" /><a href={CONTACT.channels[0].href} className="hover:underline">{CONTACT.channels[0].value}</a></li>
                <li className="flex items-center gap-2"><Mail size={18} className="shrink-0 text-purple-500" /><a href={CONTACT.channels[1].href} className="hover:underline">{CONTACT.channels[1].value}</a></li>
                <li className="flex items-center gap-2"><span className="text-lg">📱</span><span className="flex flex-wrap gap-2">{CONTACT.channels.slice(2).map((c) => <a key={c.id} href={c.href} target="_blank" rel="noopener" className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[13px] text-purple-800 hover:bg-purple-200">{c.emoji} {c.label}</a>)}</span></li>
              </ul>
            </div>
            <Link href="/contact" className="tap inline-flex items-center justify-center gap-2 rounded-full bg-purple-600 px-7 py-3 text-base font-medium text-white shadow-soft transition hover:bg-purple-700">
              ติดต่อเรา <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
