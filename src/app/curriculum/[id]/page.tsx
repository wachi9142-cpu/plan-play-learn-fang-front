import type { Metadata } from "next";
import { CurriculumDetail } from "@/components/curriculum/CurriculumDetail";

export const metadata: Metadata = { title: "หลักสูตร" };

export default async function CurriculumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CurriculumDetail id={id} />;
}
