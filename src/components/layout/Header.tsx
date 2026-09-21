"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogIn, Menu, X } from "lucide-react";
import { PRIMARY_NAV, SITE, TOP_LINKS, type NavItem } from "@/lib/site";
import { cn } from "@/lib/cn";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // ปิดเมนูอัตโนมัติเมื่อเปลี่ยนหน้า
  useEffect(() => setOpen(false), [pathname]);

  // ล็อกการเลื่อนหน้าเมื่อเมนูมือถือเปิดอยู่
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (item: NavItem) =>
    pathname === item.href ||
    pathname.startsWith(item.href + "/") ||
    (item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href + "/")) ?? false);

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 tap" aria-label="กลับหน้าแรก">
          <Image src="/logo-lpg.webp" alt="โลโก้ครูข้าวฟ่าง" width={44} height={44} priority className="size-11 shrink-0 rounded-full border-2 border-purple-200 object-cover shadow-soft" />
          <span className="min-w-0 leading-tight lg:hidden 2xl:block">
            <span className="block truncate font-display text-[17px] font-medium text-purple-800 sm:text-lg">💜 {SITE.brand}</span>
            <span className="block truncate text-xs text-ink-soft">{SITE.brandSub} · {SITE.credit}</span>
          </span>
        </Link>

        {/* Desktop: หน้าแรก · เกี่ยวกับ ▾ · เมนู ▾ · เข้าสู่ระบบ */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="เมนูหลัก">
          <Link href="/" className={cn("whitespace-nowrap rounded-full px-3 py-2 text-[14px] transition-colors xl:px-4 xl:text-[15px]", pathname === "/" ? "bg-purple-100 font-medium text-purple-800" : "text-ink hover:bg-purple-50 hover:text-purple-700")}>
            🏠 หน้าแรก
          </Link>
          {PRIMARY_NAV.map((item) => (
            <Dropdown key={item.href} item={item} active={isActive(item)} />
          ))}
          {TOP_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className={cn("whitespace-nowrap rounded-full px-3 py-2 text-[14px] transition-colors xl:px-4 xl:text-[15px]", isActive(item) ? "bg-purple-100 font-medium text-purple-800" : "text-ink hover:bg-purple-50 hover:text-purple-700")}>
              <span className="hidden xl:inline">{item.emoji} </span>{item.label}
            </Link>
          ))}
          <Link href="/login" className={cn("ml-2 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-[15px] font-medium shadow-soft transition", pathname === "/login" ? "bg-purple-700 text-white" : "bg-purple-600 text-white hover:bg-purple-700")}>
            <LogIn size={16} /> เข้าสู่ระบบ
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="tap grid place-items-center rounded-xl border border-line bg-white text-purple-700 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>

      {/* Mobile / tablet — อยู่นอก header เพราะ backdrop-blur ทำให้ fixed อ้างอิงกับ header */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-line bg-cream transition-opacity duration-200 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
      >
        <nav className="container-page grid gap-2 py-3 pb-6" aria-label="เมนูมือถือ">
          <MobileLink href="/" emoji="🏠" label="หน้าแรก" active={pathname === "/"} tint="bg-purple-100" />
          {PRIMARY_NAV.map((item) => (
            <MobileGroup key={item.href} item={item} pathname={pathname} active={isActive(item)} />
          ))}
          {TOP_LINKS.map((item) => (
            <MobileLink key={item.href} href={item.href} emoji={item.emoji} label={item.label} active={isActive(item)} tint={item.tint} />
          ))}
          <Link href="/login" className="tap mt-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-4 py-3 text-base font-medium text-white shadow-soft">
            <LogIn size={18} /> เข้าสู่ระบบ
          </Link>
        </nav>
      </div>
    </>
  );
}

/* ---------- Desktop dropdown ---------- */
function Dropdown({ item, active }: { item: NavItem; active: boolean }) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setShow(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setShow(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [show]);

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-expanded={show}
        aria-haspopup="menu"
        className={cn(
          "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-[14px] transition-colors xl:text-[15px]",
          active || show ? "bg-purple-100 font-medium text-purple-800" : "text-ink hover:bg-purple-50 hover:text-purple-700",
        )}
      >
        {item.emoji} {item.label}
        <ChevronDown size={15} className={cn("transition-transform", show && "rotate-180")} />
      </button>
      <div
        role="menu"
        className={cn(
          "absolute right-0 top-full z-50 w-80 pt-2 transition-all duration-150",
          show ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
        )}
      >
        <div className="card overflow-hidden p-1.5">
          <Link href={item.href} role="menuitem" onClick={() => setShow(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-[15px] font-medium text-purple-800 hover:bg-purple-50">
            {item.emoji} ดูทั้งหมด
          </Link>
          <div className="my-1 h-px bg-line" />
          {item.children!.map((c) => (
            <Link key={c.href} href={c.href} role="menuitem" onClick={() => setShow(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-[15px] text-ink hover:bg-purple-50 hover:text-purple-800">
              <span className="w-6 shrink-0 text-center">{c.emoji}</span>
              <span className="leading-snug">{c.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Mobile ---------- */
function MobileLink({ href, emoji, label, active, tint }: { href: string; emoji: string; label: string; active: boolean; tint: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-4 py-3 text-base transition-colors",
        active ? "border-purple-200 bg-purple-100 font-medium text-purple-800" : "border-line bg-white text-ink active:bg-purple-50",
      )}
    >
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl text-xl", tint)}>{emoji}</span>
      <span>{label}</span>
    </Link>
  );
}

function MobileGroup({ item, pathname, active }: { item: NavItem; pathname: string; active: boolean }) {
  const [expanded, setExpanded] = useState(active);
  if (!item.children) return <MobileLink href={item.href} emoji={item.emoji} label={item.label} active={active} tint={item.tint} />;

  return (
    <div className={cn("overflow-hidden rounded-2xl border", active ? "border-purple-200" : "border-line")}>
      <div className={cn("flex items-stretch", active ? "bg-purple-100" : "bg-white")}>
        <Link href={item.href} className={cn("flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-base", active ? "font-medium text-purple-800" : "text-ink")}>
          <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl text-xl", item.tint)}>{item.emoji}</span>
          <span className="truncate">{item.label}</span>
        </Link>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? `ซ่อนรายการ${item.label}` : `แสดงรายการ${item.label}`}
          className="tap grid w-12 place-items-center border-l border-line text-purple-700"
        >
          <ChevronDown size={20} className={cn("transition-transform", expanded && "rotate-180")} />
        </button>
      </div>
      {expanded && (
        <div className="grid gap-1 border-t border-line bg-cream p-2">
          {item.children.map((c) => {
            const on = pathname === c.href || pathname.startsWith(c.href + "/");
            return (
              <Link key={c.href} href={c.href} className={cn("tap flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[15px]", on ? "bg-white font-medium text-purple-800 shadow-soft" : "text-ink active:bg-white")}>
                <span className="w-6 shrink-0 text-center">{c.emoji}</span>
                <span className="leading-snug">{c.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
