import type { Metadata } from "next";
import { CanvasLoader } from "@/components/canvas/CanvasLoader";

export const metadata: Metadata = { title: "ห้องวาดร่วมกัน · Garden Canvas" };

export default async function CanvasRoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <CanvasLoader room={code.toUpperCase()} />;
}
