import type { Metadata, Viewport } from "next";
import { Mitr, Sarabun } from "next/font/google";
import { AppShell } from "@/components/layout";
import { SITE } from "@/lib/site";
import "./globals.css";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sarabun",
  display: "swap",
});

const mitr = Mitr({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mitr",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.brand} · ${SITE.name}`,
    template: `%s · ${SITE.brand}`,
  },
  description: SITE.description,
  icons: { icon: "/logo-lpg.webp", apple: "/logo-lpg.webp" },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Purple Garden", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6D3AA8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${sarabun.variable} ${mitr.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
