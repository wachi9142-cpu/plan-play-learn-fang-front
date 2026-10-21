import type { Metadata } from "next";
import { SpotDiffAdmin } from "@/components/games/SpotDiffAdmin";

export const metadata: Metadata = { title: "สร้างฉากจับผิดภาพ" };

export default function Page() {
  return <SpotDiffAdmin />;
}
