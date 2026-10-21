import type { Metadata } from "next";
import { FlashAdmin } from "@/components/flashcards/FlashAdmin";

export const metadata: Metadata = { title: "จัดการแฟลชการ์ด" };

export default function AdminFlashcardsPage() {
  return <FlashAdmin />;
}
