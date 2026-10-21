import type { Metadata } from "next";
import { FLASH_CATEGORIES, findFlashSet } from "@/data/flashcards";
import { SetScreen } from "@/components/flashcards/SetScreen";

export const generateStaticParams = () =>
  FLASH_CATEGORIES.flatMap((c) => c.sets.map((s) => ({ category: c.id, set: s.id })));

export async function generateMetadata({ params }: { params: Promise<{ category: string; set: string }> }): Promise<Metadata> {
  const { category, set } = await params;
  const s = findFlashSet(category, set);
  return s ? { title: `แฟลชการ์ด · ${s.title}`, description: `บัตรคำศัพท์ไทย–อังกฤษ ${s.cards.length} ใบ` } : { title: "แฟลชการ์ด" };
}

export default async function FlashSetPage({ params }: { params: Promise<{ category: string; set: string }> }) {
  const { category, set } = await params;
  return <SetScreen categoryId={category} setId={set} />;
}
