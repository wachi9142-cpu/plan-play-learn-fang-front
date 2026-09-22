import type { Metadata } from "next";
import { CurriculumHome } from "@/components/curriculum/CurriculumHome";

export const metadata: Metadata = { title: "หลักสูตร" };

export default function CurriculumPage() {
  return <CurriculumHome />;
}
