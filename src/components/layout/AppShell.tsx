"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { registerSW } from "@/lib/offline";
import { Header } from "./Header";
import { FloatingDock } from "./FloatingDock";
import { Footer } from "./Footer";

/** โครงหน้าเว็บ: header + แถบลอยข้างจอ — หน้าพิมพ์ใบงานไม่มีส่วนเหล่านี้ */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => { registerSW(); }, []);
  const bare = /^\/worksheets\/[^/]+\/print/.test(pathname);
  if (bare) return <>{children}</>;

  const studioEditor = /^\/(studio|canvas)\/[^/]+/.test(pathname);
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      {!studioEditor && <Footer />}
      {!studioEditor && <FloatingDock />}
    </div>
  );
}
