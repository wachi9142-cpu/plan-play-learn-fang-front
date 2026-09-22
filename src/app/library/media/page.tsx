import type { Metadata } from "next";
import { LibraryPage } from "@/components/library/LibraryPage";

export const metadata: Metadata = { title: "คลังสื่อรวม · ห้องสมุด" };

export default function Page() {
  return <LibraryPage />;
}
