"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS, SITE } from "@/lib/site";
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

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 tap" aria-label="กลับหน้าแรก">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-purple-600 text-xl shadow-soft">💜</span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-[17px] font-medium text-purple-800 sm:text-lg">{SITE.name}</span>
            <span className="hidden text-xs text-ink-soft sm:block">{SITE.credit}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="เมนูหลัก">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-3.5 py-2 text-[15px] transition-colors",
                isActive(item.href)
                  ? "bg-purple-100 font-medium text-purple-800"
                  : "text-ink hover:bg-purple-50 hover:text-purple-700",
              )}
            >
              <span className="mr-1">{item.emoji}</span>
              {item.label.replace(" / แนวทางสำหรับครู", "")}
            </Link>
          ))}
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

      {/* เมนูมือถือ / แท็บเล็ต */}
      <div
        id="mobile-menu"
        className={cn(
          "lg:hidden overflow-hidden border-t border-line bg-cream transition-[max-height] duration-300 ease-out",
          open ? "max-h-[calc(100dvh-4rem)] overflow-y-auto" : "max-h-0 border-t-0",
        )}
      >
        <nav className="container-page grid gap-2 py-3" aria-label="เมนูมือถือ">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3 text-base transition-colors",
                isActive(item.href)
                  ? "border-purple-200 bg-purple-100 font-medium text-purple-800"
                  : "border-line bg-white text-ink active:bg-purple-50",
              )}
            >
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl text-xl", item.tint)}>{item.emoji}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
