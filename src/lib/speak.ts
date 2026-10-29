"use client";

/**
 * 🔊 อ่านออกเสียงคำศัพท์ — ใช้เสียงสังเคราะห์ของเครื่อง (Web Speech API)
 * ไม่ต้องมีไฟล์เสียง ไม่ต้องต่อเน็ต และใช้ได้ทั้งมือถือ แท็บเล็ต และคอมพิวเตอร์
 * เครื่องไหนไม่มีเสียงภาษานั้น ระบบจะซ่อนปุ่มให้เอง
 */
export type SpeakLang = "th" | "en";

const CODE: Record<SpeakLang, string> = { th: "th-TH", en: "en-US" };

/**
 * 🔇 ปิดเสียงพูดทั้งเว็บไว้ก่อน (29 ต.ค. 2569) — เสียงสังเคราะห์ของเครื่องฟังแล้วไม่เป็นธรรมชาติ
 * ทุกปุ่มลำโพงและการอ่านออกเสียงอัตโนมัติจะซ่อน/เงียบเอง · อยากเปิดคืนให้เปลี่ยนเป็น true
 */
export const SPEECH_ENABLED = false;

export const speechReady = () =>
  SPEECH_ENABLED && typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

/** เสียงที่เครื่องนี้มีสำหรับภาษานั้น */
function pickVoice(lang: SpeakLang): SpeechSynthesisVoice | undefined {
  const want = CODE[lang].toLowerCase();
  const all = window.speechSynthesis.getVoices();
  return all.find((v) => v.lang.toLowerCase() === want)
    ?? all.find((v) => v.lang.toLowerCase().startsWith(lang));
}

/** เครื่องนี้พูดภาษานี้ได้ไหม (ก่อนรายชื่อเสียงโหลดเสร็จ ให้ถือว่าได้ไว้ก่อน) */
export function canSpeak(lang: SpeakLang): boolean {
  if (!speechReady()) return false;
  const all = window.speechSynthesis.getVoices();
  if (all.length === 0) return true;
  return !!pickVoice(lang);
}

/** อ่านข้อความ — ช้าลงเล็กน้อยให้เด็กฟังทัน */
export function speak(text: string, lang: SpeakLang, rate = lang === "th" ? 0.9 : 0.8) {
  if (!speechReady() || !text) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = CODE[lang];
    u.rate = rate;
    u.pitch = 1.05;
    const v = pickVoice(lang);
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch { /* เครื่องไม่รองรับ ไม่ต้องทำอะไร */ }
}

export function stopSpeaking() {
  if (speechReady()) { try { window.speechSynthesis.cancel(); } catch { /* */ } }
}

/** แจ้งเมื่อรายชื่อเสียงโหลดเสร็จ (บางเบราว์เซอร์โหลดช้า) */
export function onVoicesReady(cb: () => void): () => void {
  if (!speechReady()) return () => {};
  const h = () => cb();
  window.speechSynthesis.addEventListener("voiceschanged", h);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", h);
}
