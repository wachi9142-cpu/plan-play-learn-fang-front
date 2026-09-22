import type { Metadata } from "next";
import { DevelopmentPage } from "@/components/development/DevelopmentPage";

export const metadata: Metadata = { title: "ติดตามพัฒนาการ" };

export default function Page() {
  return <DevelopmentPage />;
}
