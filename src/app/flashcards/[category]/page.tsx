import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FLASH_CATEGORIES, findFlashCategory } from "@/data/flashcards";
import { SetList } from "@/components/flashcards/SetList";

export const generateStaticParams = () => FLASH_CATEGORIES.map((c) => ({ category: c.id }));

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const c = findFlashCategory(category);
  return c ? { title: `แฟลชการ์ด · ${c.label}`, description: c.hint } : { title: "แฟลชการ์ด" };
}

export default async function FlashCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  // หมวดที่ครูสร้างเองจะไม่อยู่ในข้อมูลตั้งต้น — ฝั่งเบราว์เซอร์จะหาเจอเอง
  if (!findFlashCategory(category) && !/^[a-z0-9-]+$/.test(category)) notFound();
  return <SetList categoryId={category} />;
}
