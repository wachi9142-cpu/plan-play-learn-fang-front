import type { Metadata } from "next";
import { CanvasHome } from "@/components/canvas/CanvasHome";

export const metadata: Metadata = { title: "Garden Canvas · กระดาษสร้างสรรค์" };

export default function CanvasPage() {
  return <CanvasHome />;
}
