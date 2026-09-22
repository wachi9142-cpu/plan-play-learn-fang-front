import type { Metadata } from "next";
import { ShelfPage } from "@/components/library/ShelfPage";

export const metadata: Metadata = { title: "ชั้นหนังสือ · ห้องสมุด" };

export default function Page() {
  return <ShelfPage />;
}
