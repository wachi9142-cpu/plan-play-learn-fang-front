"use client";

import { useEffect, useState } from "react";
import type { FlashCategory } from "@/types/flashcard";
import { FLASH_CATEGORIES } from "@/data/flashcards";
import { FLASH_EVENT, listCategories } from "@/lib/flashcards-store";

/**
 * อ่านคลังแฟลชการ์ด (ข้อมูลตั้งต้น + สิ่งที่ครูแก้ไว้)
 * เรนเดอร์ครั้งแรกใช้ข้อมูลตั้งต้นเสมอ เพื่อให้ฝั่งเซิร์ฟเวอร์กับเบราว์เซอร์ตรงกัน
 * แล้วค่อยอัปเดตเป็นของครูหลังหน้าเว็บพร้อม
 */
export function useFlashCategories(): FlashCategory[] {
  const [cats, setCats] = useState<FlashCategory[]>(FLASH_CATEGORIES);

  useEffect(() => {
    const sync = () => setCats(listCategories());
    sync();
    window.addEventListener(FLASH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(FLASH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return cats;
}

export function useFlashCategory(id: string) {
  return useFlashCategories().find((c) => c.id === id);
}
