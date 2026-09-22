import type { Metadata } from "next";
import { LibraryPage } from "@/components/library/LibraryPage";

export const metadata: Metadata = { title: "Garden Library · คลังสื่อ" };

export default function Page() {
  return <LibraryPage />;
}
