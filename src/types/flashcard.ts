/**
 * 🃏 แฟลชการ์ดสองภาษา (Thai–English Flashcards)
 * ด้านหน้า = ภาพ + คำไทย · ด้านหลัง = ภาพเดิม + คำอังกฤษ
 * ภาพต้องเป็นสิ่งเดียวกันทั้งสองด้าน เพื่อให้เด็กเชื่อมโยงคำไทย–อังกฤษได้ถูกต้อง
 */
export interface FlashCard {
  id: string;
  /** คำศัพท์ภาษาไทย (ด้านหน้า) */
  th: string;
  /** คำศัพท์ภาษาอังกฤษ (ด้านหลัง) */
  en: string;
  /** คำอ่านภาษาอังกฤษแบบง่าย สำหรับครูและผู้ปกครอง */
  read: string;
  /** อีโมจิ — ใช้แทนภาพจนกว่าจะมีภาพจริง */
  emoji: string;
  /** ภาพจริง เช่น "/flashcards/animals/cat.webp" (ใช้ทั้งสองด้าน) */
  image?: string;
  /** เกร็ดความรู้สั้น ๆ ที่เหมาะกับวัย */
  note?: string;
}

/** ชุดบัตร — ชุดละ 20 ใบ เพิ่มชุดที่ 2, 3, 4... ได้ไม่จำกัด */
export interface FlashSet {
  id: string;
  /** ลำดับชุด (1, 2, 3...) */
  no: number;
  title: string;
  cards: FlashCard[];
}

/** หมวดแฟลชการ์ด */
export interface FlashCategory {
  id: string;
  emoji: string;
  label: string;
  hint: string;
  tint: string;
  /** ภาพปกหมวด (ถ้ามี) */
  image?: string;
  /** กลุ่มใหญ่ เช่น "สัตว์" · "รอบตัวเด็ก" */
  group: string;
  sets: FlashSet[];
}

/** โหมดการใช้งาน */
export type FlashMode =
  | "learn"    // 📖 โหมดเรียนรู้ — เห็นคำไทยก่อน แล้วพลิกดูอังกฤษ
  | "review";  // 🎯 โหมดทบทวน — เห็นแต่ภาพ ให้เด็กลองพูดอังกฤษก่อนเฉลย
