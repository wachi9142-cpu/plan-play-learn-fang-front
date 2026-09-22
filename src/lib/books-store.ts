"use client";

import type { Book, CornerCategory, DocType, PublishState, ShelfCategory, Visibility } from "@/types/book";
import { getClassMe } from "./classroom-store";
import { addAsset, removeAsset } from "./studio-assets";
import { STATUS as CUR_STATUS, listCurricula, mainPdf } from "./curriculum-store";
import { uid } from "./studio-store";

/**
 * 📚 ห้องสมุด — เก็บหนังสือใน localStorage `lpg-books-v1` · ไฟล์ใน IndexedDB (docId = `book:<id>`)
 * ชั้นหนังสือ (ผู้ใหญ่) รวม PDF หลักสูตรจากระบบหลักสูตรมาแสดงในหมวด 📕 หลักสูตรและเอกสารทางการ อัตโนมัติ
 */
const KEY = "lpg-books-v1";
export const BOOK_EVENT = "lpg-books-change";
const read = (): Book[] => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const write = (v: Book[]) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* */ } window.dispatchEvent(new Event(BOOK_EVENT)); };
const now = () => new Date().toISOString();

export const SHELF_CATEGORIES: { id: ShelfCategory; emoji: string; label: string; hint: string }[] = [
  { id: "official", emoji: "📕", label: "หลักสูตรและเอกสารทางการ", hint: "หลักสูตรการศึกษาปฐมวัย ประกาศ ระเบียบ เอกสารราชการ" },
  { id: "teacher", emoji: "📚", label: "หนังสือสำหรับครู", hint: "หนังสือพัฒนาวิชาชีพครูปฐมวัย" },
  { id: "psychology", emoji: "🧠", label: "พัฒนาการและจิตวิทยาเด็ก", hint: "พัฒนาการตามวัย จิตวิทยา การดูแลพฤติกรรม" },
  { id: "teaching", emoji: "👩‍🏫", label: "การจัดประสบการณ์และการสอน", hint: "เทคนิคการสอน การจัดกิจกรรม การประเมิน" },
  { id: "guide", emoji: "📝", label: "คู่มือ / แนวทาง / เอกสารอ้างอิง", hint: "คู่มือครู แนวทางปฏิบัติ เอกสารอ้างอิง" },
  { id: "parent", emoji: "👨‍👩‍👧", label: "คู่มือสำหรับผู้ปกครอง", hint: "แนวทางดูแลและส่งเสริมลูกที่บ้าน" },
  { id: "knowledge", emoji: "📖", label: "หนังสือความรู้", hint: "ความรู้ทั่วไปที่เป็นประโยชน์กับการทำงาน" },
  { id: "kaowfang", emoji: "💜", label: "คลังหนังสือของครูข้าวฟ่าง", hint: "หนังสือและเอกสารที่ครูข้าวฟ่างรวบรวมไว้เอง" },
];

export const CORNER_CATEGORIES: { id: CornerCategory; emoji: string; label: string; tint: string }[] = [
  { id: "tale", emoji: "🐰", label: "นิทาน", tint: "bg-pink-soft" },
  { id: "animal", emoji: "🐻", label: "นิทานสัตว์", tint: "bg-yellow-soft" },
  { id: "nature", emoji: "🌱", label: "ธรรมชาติรอบตัว", tint: "bg-mint-soft" },
  { id: "adventure", emoji: "🚀", label: "การผจญภัยและจินตนาการ", tint: "bg-sky-soft" },
  { id: "family", emoji: "👨‍👩‍👧", label: "ครอบครัวและเพื่อน", tint: "bg-purple-100" },
  { id: "feeling", emoji: "💕", label: "อารมณ์และความรู้สึก", tint: "bg-pink-soft" },
  { id: "number", emoji: "🔢", label: "ตัวเลขและคณิตศาสตร์", tint: "bg-sky-soft" },
  { id: "language", emoji: "🔤", label: "ภาษาและตัวอักษร", tint: "bg-yellow-soft" },
  { id: "science", emoji: "🔬", label: "วิทยาศาสตร์น่ารู้", tint: "bg-mint-soft" },
  { id: "art", emoji: "🎨", label: "ศิลปะและความคิดสร้างสรรค์", tint: "bg-purple-100" },
  { id: "world", emoji: "🌎", label: "โลกของเรา", tint: "bg-sky-soft" },
];

export const DOC_TYPES: { id: DocType; emoji: string; label: string }[] = [
  { id: "curriculum", emoji: "📕", label: "หลักสูตร" },
  { id: "manual", emoji: "📘", label: "คู่มือ" },
  { id: "official", emoji: "📄", label: "เอกสารทางการ" },
  { id: "notice", emoji: "📑", label: "ประกาศ / แนวทาง" },
  { id: "reference", emoji: "📚", label: "หนังสืออ้างอิง" },
  { id: "other", emoji: "🗂️", label: "อื่น ๆ" },
];
export const PUBLISH_STATES: Record<PublishState, { emoji: string; label: string; cls: string }> = {
  draft: { emoji: "📝", label: "แบบร่าง", cls: "bg-cream text-ink-soft" },
  review: { emoji: "👀", label: "รอตรวจสอบ", cls: "bg-yellow-soft text-yellow-800" },
  published: { emoji: "🟢", label: "เผยแพร่", cls: "bg-mint-soft text-green-800" },
};
export const VISIBILITIES: Record<Visibility, { emoji: string; label: string }> = {
  admin: { emoji: "👑", label: "ผู้ดูแลเท่านั้น" },
  teacher: { emoji: "👩‍🏫", label: "ครูและผู้ดูแล" },
  parent: { emoji: "👨‍👩‍👧", label: "ครู + ผู้ปกครอง" },
  student: { emoji: "👧", label: "ครู + ผู้ปกครอง + นักเรียน" },
  public: { emoji: "🌐", label: "สาธารณะ (ทุกคน)" },
};

/** สิทธิ์ของผู้ใช้เครื่องนี้ — ยังไม่มีระบบบัญชีจริง ใช้บทบาทที่ระบุไว้ในห้องเรียนออนไลน์ */
export type Role = "admin" | "teacher" | "parent" | "student" | "guest";
export function currentRole(): Role {
  const me = getClassMe();
  if (!me) return "guest";
  return me.role === "teacher" ? "teacher" : me.role === "parent" ? "parent" : "student";
}
export const canManageBooks = (role = currentRole()) => role === "admin" || role === "teacher";
/**
 * ครู/ผู้ดูแลเพิ่มหนังสือได้ทุกหมวด — เมื่อมีระบบบัญชีจริง จะจำกัดหมวดที่ครูแต่ละคนได้รับอนุญาต
 * (เช่น สงวนหมวด 📕 หลักสูตรและเอกสารทางการ ไว้ให้ Admin) ผ่าน `allowedCategories` ของบัญชีนั้น
 */
export const canAddToCategory = (_cat: ShelfCategory, role = currentRole()) => role === "admin" || role === "teacher";
const RANK: Record<Visibility, number> = { admin: 4, teacher: 3, parent: 2, student: 1, public: 0 };
const ROLE_RANK: Record<Role, number> = { admin: 4, teacher: 3, parent: 2, student: 1, guest: 0 };
/** เห็นเล่มนี้ไหม: เผยแพร่แล้ว + สิทธิ์ถึง (ครู/ผู้ดูแลเห็นทุกเล่มรวมแบบร่าง) */
export function canSeeBook(b: Book, role = currentRole()) {
  if (role === "admin" || role === "teacher") return true;
  if ((b.publish ?? "published") !== "published") return false;
  return ROLE_RANK[role] >= RANK[b.visibility ?? "public"];
}

const page = (emoji: string, text: string) => ({ id: uid(), emoji, text });
/** นิทานตั้งต้น 5 เรื่อง — ครูเพิ่ม/แก้/ลบได้เอง */
function seedStories(): Book[] {
  const t = now();
  const base = { audience: "kid" as const, addedBy: "ครูข้าวฟ่าง", createdAt: t, updatedAt: t, ages: "3–6 ปี" };
  return [
    { ...base, id: "story-rabbit-garden", category: "tale", emoji: "🐰", title: "กระต่ายน้อยกับสวนสีม่วง", description: "กระต่ายน้อยออกไปหาเพื่อนในสวน แล้วได้เรียนรู้ว่าการแบ่งปันทำให้ทุกคนมีความสุข", tags: ["แบ่งปัน", "เพื่อน", "สวน"],
      pages: [page("🐰", "เช้าวันหนึ่ง กระต่ายน้อยตื่นขึ้นมาในสวนสีม่วง\nแดดอุ่น ๆ ส่องผ่านใบไม้ลงมา"), page("🥕", "กระต่ายน้อยเจอแครอทอวบใหญ่หนึ่งหัว\n“อร่อยจัง! เราจะกินคนเดียวดีไหมนะ”"), page("🐿️", "กระรอกน้อยเดินมาพร้อมท้องร้องจ๊อก ๆ\n“วันนี้เรายังไม่ได้กินอะไรเลย”"), page("🤝", "กระต่ายน้อยคิดอยู่ครู่หนึ่ง แล้วหักแครอทแบ่งครึ่ง\n“มากินด้วยกันนะ”"), page("🌻", "กระรอกยิ้มกว้าง แล้วพาเพื่อน ๆ มาช่วยกันปลูกแครอทเพิ่ม\nสวนสีม่วงจึงมีแครอทเต็มไปหมด"), page("💜", "กระต่ายน้อยได้เรียนรู้ว่า\nเมื่อเราแบ่งปัน ความสุขก็จะกลับมาหาเรามากขึ้น")],
      activities: [{ emoji: "🎨", label: "วาดสวนของเรา", href: "/canvas" }, { emoji: "🎮", label: "เล่นเกมพากระต่ายกลับบ้าน", href: "/games/code-rabbit-home" }, { emoji: "💬", label: "ชวนคุย: หนูเคยแบ่งของให้เพื่อนไหม?" }] },
    { ...base, id: "story-bear-feelings", category: "feeling", emoji: "🐻", title: "หมีน้อยกับความรู้สึกในใจ", description: "หมีน้อยรู้จักอารมณ์ต่าง ๆ ของตัวเอง และเรียนรู้วิธีบอกความรู้สึกให้คนอื่นฟัง", tags: ["อารมณ์", "ความรู้สึก"],
      pages: [page("🐻", "หมีน้อยตื่นมาแล้วรู้สึกแปลก ๆ ในใจ\nแต่บอกไม่ถูกว่ามันคืออะไร"), page("😊", "ตอนได้กินน้ำผึ้ง หมีน้อยยิ้มกว้าง\nนี่คือความรู้สึก “ดีใจ”"), page("😢", "ตอนของเล่นหาย น้ำตาก็ไหล\nนี่คือความรู้สึก “เสียใจ”"), page("😠", "ตอนเพื่อนแย่งของ หมีน้อยหน้าแดง\nนี่คือความรู้สึก “โกรธ”"), page("🫂", "คุณแม่กอดหมีน้อยแล้วบอกว่า\n“ทุกความรู้สึกเป็นเรื่องปกตินะลูก”"), page("💛", "หมีน้อยหายใจเข้าลึก ๆ แล้วบอกความรู้สึกออกมา\nใจก็เบาสบายขึ้น")],
      activities: [{ emoji: "🎨", label: "วาดหน้าตาอารมณ์ของหนู", href: "/canvas" }, { emoji: "🎭", label: "เล่นทายอารมณ์จากสีหน้า" }] },
    { ...base, id: "story-seed", category: "nature", emoji: "🌱", title: "เมล็ดน้อยอยากเป็นดอกไม้", description: "เมล็ดเล็ก ๆ เรียนรู้ว่าการเติบโตต้องใช้เวลา น้ำ แสงแดด และความอดทน", tags: ["ธรรมชาติ", "การเติบโต", "ต้นไม้"],
      pages: [page("🌰", "เมล็ดน้อยนอนอยู่ใต้ดินสีน้ำตาล\n“เมื่อไรเราจะได้เห็นท้องฟ้านะ”"), page("💧", "ฝนตกลงมา ดินชุ่มน้ำ\nเมล็ดน้อยเริ่มแตกรากเล็ก ๆ"), page("☀️", "แดดอุ่นส่องลงมา\nยอดอ่อนสีเขียวโผล่พ้นดินขึ้นมาทีละนิด"), page("🌿", "วันแล้ววันเล่า ต้นน้อยสูงขึ้น\nมีใบเขียวแผ่ออกรับแสง"), page("🌸", "แล้ววันหนึ่ง ดอกสีม่วงก็บานออกมา\nสวยที่สุดในสวน"), page("🌳", "เมล็ดน้อยเข้าใจแล้วว่า\nการเติบโตต้องใช้เวลา และทุกวันเราโตขึ้นเสมอ")],
      activities: [{ emoji: "🌱", label: "ปลูกถั่วงอกที่บ้าน" }, { emoji: "📝", label: "ใบงานลำดับการเติบโต", href: "/worksheets/ws-code-sequence-pics" }] },
    { ...base, id: "story-counting-stars", category: "number", emoji: "🔢", title: "นับดาวก่อนนอน", description: "นับ 1 ถึง 10 ไปพร้อมกับดาวบนท้องฟ้า", tags: ["ตัวเลข", "นับ", "ก่อนนอน"],
      pages: [page("⭐", "ดาวดวงที่ 1 ส่องแสงวิบวับ"), page("⭐⭐", "ดาวดวงที่ 2 มาอยู่ข้าง ๆ กัน"), page("⭐⭐⭐", "ดาวดวงที่ 3 กะพริบทักทาย"), page("✨", "นับต่อไปเรื่อย ๆ 4 5 6 7 8 9\nดาวเต็มท้องฟ้าไปหมด"), page("🌙", "ดวงที่ 10 คือดวงที่สว่างที่สุด\nอยู่ข้าง ๆ พระจันทร์"), page("😴", "นับครบสิบแล้ว หลับตาลง\nราตรีสวัสดิ์นะ")],
      activities: [{ emoji: "🎮", label: "เล่นเกมเรียงลำดับตัวเลข", href: "/games/slide-numbers" }, { emoji: "🔢", label: "นับของใกล้ตัว 10 ชิ้น" }] },
    { ...base, id: "story-space", category: "adventure", emoji: "🚀", title: "จรวดกระดาษของหนู", description: "เด็กน้อยสร้างจรวดกระดาษ แล้วออกเดินทางในจินตนาการไปยังดวงดาว", tags: ["จินตนาการ", "อวกาศ", "ผจญภัย"],
      pages: [page("📄", "หนูพับกระดาษเป็นจรวดลำเล็ก ๆ"), page("🚀", "ปล่อยจรวดขึ้นฟ้า… วื้ดดด!\nจรวดพาหนูลอยขึ้นไปสูงขึ้นเรื่อย ๆ"), page("🌍", "มองลงมาเห็นโลกกลม ๆ สีฟ้า\nสวยจังเลย"), page("🪐", "แวะทักทายดาวเสาร์ที่มีวงแหวนรอบตัว"), page("👽", "เจอเพื่อนใหม่ตัวเขียวโบกมือให้"), page("🛏️", "แล้วจรวดก็พาหนูกลับมาที่เตียง\nพรุ่งนี้เราจะผจญภัยกันอีกนะ")],
      activities: [{ emoji: "✂️", label: "พับจรวดกระดาษ" }, { emoji: "🎨", label: "วาดดาวที่หนูอยากไป", href: "/canvas" }] },
  ];
}

const db = (): Book[] => { const d = read(); if (d.length === 0 && !localStorage.getItem(`${KEY}-seeded`)) { const s = seedStories(); write(s); localStorage.setItem(`${KEY}-seeded`, "1"); return s; } return d; };

export const listBooks = (audience?: "adult" | "kid"): Book[] => db().filter((b) => (!audience || b.audience === audience) && canSeeBook(b)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
export const getBook = (id: string) => db().find((b) => b.id === id) ?? curriculumBooks().find((b) => b.id === id);
export function createBook(input: Partial<Book> & Pick<Book, "audience" | "category" | "title">): Book {
  const t = now();
  const b: Book = { id: uid(), emoji: input.audience === "kid" ? "📖" : "📘", tags: [], addedBy: getClassMe()?.name ?? "ผู้ดูแล", publish: input.audience === "kid" ? "published" : "draft", visibility: input.audience === "kid" ? "public" : "teacher", ...input, createdAt: t, updatedAt: t };
  const all = db(); all.unshift(b); write(all); return b;
}
export function updateBook(id: string, patch: Partial<Book>) { write(db().map((b) => (b.id === id ? { ...b, ...patch, updatedAt: now() } : b))); }
export async function deleteBook(id: string) { const b = db().find((x) => x.id === id); if (b?.file) await removeAsset(b.file.assetId, `book:${id}`); write(db().filter((x) => x.id !== id)); }
export async function attachBookFile(id: string, file: File) {
  const a = await addAsset(`book:${id}`, file);
  updateBook(id, { file: { assetId: a.id, name: file.name, mime: file.type, size: file.size } });
}
export async function setBookCover(id: string, file: File) {
  const img = new Image(); const url = URL.createObjectURL(file);
  await new Promise((r) => { img.onload = r; img.src = url; });
  const c = document.createElement("canvas"); const k = Math.min(1, 400 / img.width); c.width = img.width * k; c.height = img.height * k;
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
  updateBook(id, { cover: c.toDataURL("image/jpeg", 0.8) });
}

/** 📕 หลักสูตรที่อัปโหลด PDF ไว้ → แสดงบนชั้นหนังสือโดยอัตโนมัติ (อ่านอย่างเดียว) */
/** ไอคอนหนังสือไล่ตามปี ให้แต่ละฉบับมีสีต่างกันบนชั้น */
const YEAR_EMOJI = ["📘", "📗", "📙", "📕", "📔", "📒", "📓", "📖", "📚"];
export const yearEmoji = (year: number) => YEAR_EMOJI[year % YEAR_EMOJI.length];

export function curriculumBooks(): Book[] {
  return listCurricula().map((c) => {
    const f = mainPdf(c);
    return { id: `cur-book-${c.id}`, audience: "adult" as const, category: "official" as ShelfCategory, title: c.title, emoji: yearEmoji(c.year), description: c.description, tags: ["หลักสูตร", `พ.ศ. ${c.year}`, CUR_STATUS[c.status].label], file: f ? { assetId: f.assetId, name: f.name, mime: f.mime, size: f.size } : undefined, addedBy: c.addedBy, createdAt: c.createdAt, updatedAt: c.updatedAt, curriculumId: c.id, year: c.year, status: c.status, docType: "curriculum" as DocType, level: "ปฐมวัย", announcedAt: c.announcedAt, note: c.note, publish: "published" as PublishState, visibility: "teacher" as Visibility };
  }).sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
}
export const shelfBooks = (): Book[] => [...curriculumBooks(), ...listBooks("adult")];

export const fmtSize = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
