import type { Metadata } from "next";
import { JoinByInvite } from "@/components/classroom/JoinByInvite";

export const metadata: Metadata = { title: "เข้าห้องเรียน · ห้องเรียนออนไลน์" };

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <JoinByInvite code={code.toUpperCase()} />;
}
