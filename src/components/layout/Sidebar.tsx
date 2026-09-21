"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PRIMARY_NAV, SITE, type NavItem } from "@/lib/site";
import { cn } from "@/lib/cn";

/** แถบเมนูด้านข้าง (desktop ≥ lg) */
export function Sidebar() {
  const pathname = usePathname();
  const isActive = (item: NavItem) =>
    pathname === item.href ||
    pathname.startsWith(item.href + "/") ||
    (item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href + "/")) ?? false);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-white/80 backdrop-blur lg:flex" aria-label="เมนูหลัก">
      <Link href="/" className="flex items-center gap-3 px-5 pb-4 pt-5">
        <Image src="/logo.jpg" alt="โลโก้ครูข้าวฟ่าง" width={44} height={44} priority className="size-11 shrink-0 rounded-full border-2 border-purple-200 object-cover shadow-soft" />
        <span className="min-w-0 leading-tight">
          <span className="block font-display text-[17px] font-medium text-purple-800">💜 แผนเล่นเรียน</span>
          <span className="block font-display text-[15px] text-purple-600">อนุบาล 1</span>
        </span>
      </Link>

      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 pb-4">
        <SideLink href="/" emoji="🏠" label="หน้าหลัก" active={pathname === "/"} />
        {PRIMARY_NAV.map((item) => (
          <SideGroup key={item.href} item={item} pathname={pathname} active={isActive(item)} />
        ))}
      </nav>

      <div className="border-t border-line px-5 py-3 text-[12px] text-ink-soft">
        <p>{SITE.credit}</p>
        <p className="truncate">{SITE.nameEn}</p>
      </div>
    </aside>
  );
}

function SideLink({ href, emoji, label, active, sub = false }: { href: string; emoji?: string; label: string; active: boolean; sub?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-xl transition-colors",
        sub ? "px-3 py-1.5 text-[14px]" : "px-3 py-2.5 text-[15px]",
        active ? "bg-purple-100 font-medium text-purple-800" : "text-ink hover:bg-purple-50 hover:text-purple-700",
      )}
    >
      <span className={cn("shrink-0 text-center", sub ? "w-5 text-sm" : "w-6 text-lg")}>{emoji}</span>
      <span className="min-w-0 flex-1 truncate leading-snug">{label}</span>
    </Link>
  );
}

function SideGroup({ item, pathname, active }: { item: NavItem; pathname: string; active: boolean }) {
  const [open, setOpen] = useState(active);
  const expanded = open || active;
  if (!item.children) return <div className="mt-1"><SideLink href={item.href} emoji={item.emoji} label={item.label} active={active} /></div>;

  return (
    <div className="mt-1">
      <div className={cn("flex items-center rounded-xl", active ? "bg-purple-100" : "hover:bg-purple-50")}>
        <Link href={item.href} className={cn("flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-[15px]", active ? "font-medium text-purple-800" : "text-ink hover:text-purple-700")}>
          <span className="w-6 shrink-0 text-center text-lg">{item.emoji}</span>
          <span className="truncate">{item.label}</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? `ซ่อนรายการ${item.label}` : `แสดงรายการ${item.label}`}
          className="grid size-9 shrink-0 place-items-center rounded-lg text-purple-600 hover:bg-white/60"
        >
          <ChevronDown size={16} className={cn("transition-transform", expanded && "rotate-180")} />
        </button>
      </div>
      {expanded && (
        <div className="mt-0.5 ml-4 grid gap-0.5 border-l-2 border-purple-100 pl-2">
          {item.children.map((c) => (
            <SideLink key={c.href} href={c.href} emoji={c.emoji} label={c.label} sub active={pathname === c.href || pathname.startsWith(c.href + "/")} />
          ))}
        </div>
      )}
    </div>
  );
}
