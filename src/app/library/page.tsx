import type { Metadata } from "next";
import { LibraryHub } from "@/components/library/LibraryHub";

export const metadata: Metadata = { title: "ห้องสมุด" };

export default function Page() {
  return <LibraryHub />;
}
