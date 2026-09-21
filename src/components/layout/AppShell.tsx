"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

/** โครงหน้าเว็บ: sidebar (desktop) + header (มือถือ) — หน้าพิมพ์ใบงานไม่มีส่วนเหล่านี้ */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = /^\/worksheets\/[^/]+\/print/.test(pathname);
  if (bare) return <>{children}</>;

  return (
    <>
      <Sidebar />
      <div className="flex min-h-dvh flex-col lg:pl-64">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </>
  );
}
