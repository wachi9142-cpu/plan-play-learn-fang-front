import type { Metadata } from "next";
import { ClassroomHub } from "@/components/classroom/ClassroomHub";

export const metadata: Metadata = { title: "ห้องเรียนออนไลน์" };

export default function OnlineClassroomPage() {
  return <ClassroomHub />;
}
