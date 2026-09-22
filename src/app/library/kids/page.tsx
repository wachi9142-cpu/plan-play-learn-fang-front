import type { Metadata } from "next";
import { KidsCorner } from "@/components/library/KidsCorner";

export const metadata: Metadata = { title: "มุมหนังสือ · ห้องสมุด" };

export default function Page() {
  return <KidsCorner />;
}
