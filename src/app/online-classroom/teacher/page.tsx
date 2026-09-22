import type { Metadata } from "next";
import { TeacherDashboard } from "@/components/classroom/TeacherDashboard";

export const metadata: Metadata = { title: "Teacher Dashboard · ห้องเรียนออนไลน์" };

export default function TeacherPage() {
  return <TeacherDashboard />;
}
