import type { Metadata } from "next";
import { CanvasLoader } from "@/components/canvas/CanvasLoader";

export const metadata: Metadata = { title: "วาดรูป · Garden Canvas" };

export default async function CanvasDocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CanvasLoader id={id} />;
}
