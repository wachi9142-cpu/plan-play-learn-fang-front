import type { Metadata } from "next";
import { StudioDocLoader } from "./StudioDocLoader";

export const metadata: Metadata = { title: "แก้ไขเอกสาร · Garden Studio" };

export default async function StudioDocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StudioDocLoader id={id} />;
}
