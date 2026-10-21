import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JIGSAW_CATEGORIES, findJigsawCategory } from "@/data/jigsaw";
import { JigsawCategoryScreen } from "@/components/jigsaw/JigsawCategoryScreen";

export const generateStaticParams = () => JIGSAW_CATEGORIES.map((c) => ({ category: c.id }));

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const c = findJigsawCategory(category);
  return c ? { title: `จิ๊กซอว์ · ${c.label}`, description: c.hint } : { title: "เกมจิ๊กซอว์" };
}

export default async function JigsawCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!findJigsawCategory(category)) notFound();
  return <JigsawCategoryScreen categoryId={category} />;
}
