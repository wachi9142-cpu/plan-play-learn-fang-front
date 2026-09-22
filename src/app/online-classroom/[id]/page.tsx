import type { Metadata } from "next";
import { RoomPage } from "@/components/classroom/RoomPage";

export const metadata: Metadata = { title: "ห้องเรียนออนไลน์" };

export default async function OnlineRoomPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { id } = await params;
  const { tab } = await searchParams;
  const tabs = ["live", "chat", "archive", "stars", "members", "settings"] as const;
  const t = tabs.find((x) => x === tab);
  return <RoomPage id={id} initialTab={t} />;
}
