/**
 * 📋 สิ่งที่รอครูเติม — ข้อมูลจริงที่ยังขาด และสิ่งที่ยืนยันแล้ว
 *
 * ไฟล์นี้คู่กับ docs/05-รอข้อมูลจริง.md — แก้ที่ไหนแก้อีกที่ด้วย
 * เมื่อครูให้ข้อมูลแล้ว: เปลี่ยน status เป็น "done" ใส่ doneAt แล้วย้ายคำอธิบายไปช่อง answer
 */

export type PendingStatus = "waiting" | "review" | "done";

export interface PendingItem {
  id: string;
  title: string;
  /** ตอนนี้เว็บแสดงอะไรอยู่ หรือยังขาดอะไร */
  detail: string;
  status: PendingStatus;
  /** หน้าที่ข้อมูลนี้ไปแสดง — กดไปดูได้เลย */
  href?: string;
  /** ไฟล์ที่ต้องแก้ (สำหรับคนทำเว็บ) */
  file?: string;
  /** วันที่ครูให้ข้อมูล (เฉพาะที่เสร็จแล้ว) */
  doneAt?: string;
  /** ⭐ อยากได้ก่อน */
  priority?: boolean;
}

export interface PendingGroup {
  id: string;
  emoji: string;
  label: string;
  hint: string;
  items: PendingItem[];
}

export const PENDING_STATUS: Record<PendingStatus, { emoji: string; label: string; tint: string; text: string }> = {
  waiting: { emoji: "⬜", label: "รอข้อมูล", tint: "bg-yellow-soft", text: "text-[#8a6a00]" },
  review: { emoji: "👀", label: "ร่างไว้แล้ว รอครูตรวจ", tint: "bg-sky-soft", text: "text-[#2b5c8a]" },
  done: { emoji: "✅", label: "ครูให้ข้อมูลแล้ว", tint: "bg-mint-soft", text: "text-[#1f6b4d]" },
};

export const PENDING_GROUPS: PendingGroup[] = [
  {
    id: "contact",
    emoji: "📞",
    label: "ข้อมูลติดต่อ",
    hint: "สิ่งที่ผู้ปกครองใช้หาโรงเรียนและติดต่อครู",
    items: [
      { id: "phone", title: "เบอร์โทรศัพท์", detail: "091-756-0513 — กดโทรจากมือถือได้แล้ว", status: "done", doneAt: "19 ต.ค. 2569", href: "/contact", file: "src/data/contact.ts" },
      { id: "hours", title: "เวลาเปิด–ปิด", detail: "จันทร์–ศุกร์ 08:00–16:00 น. · เสาร์–อาทิตย์ปิด", status: "done", doneAt: "17 ต.ค. 2569", href: "/contact", file: "src/data/contact.ts" },
      { id: "address", title: "ที่อยู่โรงเรียน", detail: "ตอนนี้ยังเป็นที่อยู่ตัวอย่าง — ผู้ปกครองหาทางมาไม่ได้", status: "waiting", priority: true, href: "/contact", file: "src/data/contact.ts" },
      { id: "map", title: "พิกัดแผนที่", detail: "แผนที่ยังชี้กลางกรุงเทพฯ — ส่งลิงก์ Google Maps ของโรงเรียนมาก็ได้", status: "waiting", priority: true, href: "/contact", file: "src/data/contact.ts" },
      { id: "social", title: "LINE / Facebook / Instagram", detail: "ยังเป็นลิงก์ตัวอย่าง ปุ่ม “ทักไลน์” ในหน้าสมัครเรียนจึงยังกดไปไม่ถูกที่", status: "waiting", priority: true, href: "/contact", file: "src/data/contact.ts" },
    ],
  },
  {
    id: "school",
    emoji: "🏫",
    label: "ข้อมูลโรงเรียน",
    hint: "ใช้ในหน้าเกี่ยวกับและหน้าสมัครเรียน",
    items: [
      { id: "students", title: "จำนวนนักเรียนต่อห้อง", detail: "เนอสเซอรี่/เตรียมอนุบาล 3–8 คน (สูงสุด 10) · อนุบาล 1–3 เริ่มต้น 8–15 คน", status: "done", doneAt: "17 ต.ค. 2569", href: "/about#students", file: "src/data/about.ts" },
      { id: "staff", title: "จำนวนบุคลากรต่อห้อง", detail: "ครูประจำชั้น 1 · ครูฝึกสอน 1 · พี่เลี้ยง 1 — ทุกห้องมีผู้ดูแล 3 คน", status: "done", doneAt: "19 ต.ค. 2569", href: "/about#staff", file: "src/data/about.ts" },
      { id: "ages", title: "ช่วงอายุแต่ละระดับชั้น", detail: "1.5–2 · 2–3 · 3–4 · 4–5 · 5–6 ขวบ — และขึ้นอยู่กับพัฒนาการของเด็กแต่ละคน", status: "done", doneAt: "20 ต.ค. 2569", href: "/about", file: "src/data/plans.ts" },
      { id: "k0-count", title: "เตรียมอนุบาลรับกี่คน", detail: "ตอนนี้ใส่เท่าเนอสเซอรี่ไว้ก่อน (3–8 คน) — ครูยังไม่ได้ยืนยัน", status: "review", href: "/about#students", file: "src/data/about.ts" },
      { id: "facility", title: "ข้อมูลอาคาร / สถานที่", detail: "มีห้องอะไรบ้าง · สนามเด็กเล่น · ห้องน้ำ ฯลฯ", status: "waiting", href: "/about#facilities", file: "src/data/about.ts" },
    ],
  },
  {
    id: "admission",
    emoji: "🎒",
    label: "รับสมัครเรียน",
    hint: "หน้าสมัครเรียนใช้งานได้แล้ว แต่ยังไม่มีตัวเลขจริง",
    items: [
      { id: "fees", title: "ค่าธรรมเนียมการเรียน", detail: "ทั้ง 5 ระดับชั้นยังขึ้นว่า “สอบถามครู”", status: "waiting", priority: true, href: "/admission", file: "src/data/admission.ts" },
      { id: "period", title: "ช่วงเปิดรับสมัคร", detail: "ตอนนี้ขึ้นว่า “รับสมัครตลอดปี”", status: "waiting", href: "/admission", file: "src/data/admission.ts" },
      { id: "documents", title: "เอกสารที่ใช้สมัคร", detail: "ใส่รายการมาตรฐานไว้ 5 อย่าง (สูติบัตร · ทะเบียนบ้าน · บัตรผู้ปกครอง · รูปถ่าย · สมุดวัคซีน)", status: "review", href: "/admission", file: "src/data/admission.ts" },
      { id: "trial", title: "วันทดลองเรียน", detail: "ร่างไว้: ฟรี 1 วัน · 09:00–11:30 น. · กิจกรรม 5 ช่วง — ตรงกับที่ทำจริงไหม", status: "review", href: "/admission", file: "src/data/admission.ts" },
      { id: "camp", title: "ค่ายวันเดียว (อนุบาล 3)", detail: "ยังไม่มี: วันที่จัด · ค่าใช้จ่ายต่อคน · จำนวนที่รับ · มีข้าวกลางวันกับเกียรติบัตรไหม", status: "waiting", href: "/admission", file: "src/data/admission.ts" },
      { id: "fieldtrip", title: "ทัศนศึกษา", detail: "ยังไม่มี: ไปที่ไหน · วันไหน · ค่าใช้จ่าย · ชั้นไหนได้ไปบ้าง · ปีละกี่ครั้ง", status: "waiting", href: "/admission", file: "src/data/admission.ts" },
    ],
  },
  {
    id: "care",
    emoji: "🧸",
    label: "การดูแลรายวัน",
    hint: "สมุดสื่อสาร · เมนูอาหาร · แจ้งลา · คนมารับเด็ก — โครงเสร็จแล้ว รอเริ่มใช้จริง",
    items: [
      { id: "rooms", title: "สร้างห้องเรียนและใส่รายชื่อเด็ก", detail: "ทุกระบบการดูแลรายวันผูกกับรายชื่อเด็กในห้องเรียน — ต้องทำข้อนี้ก่อนถึงจะใช้ได้", status: "waiting", priority: true, href: "/online-classroom", file: "src/lib/classroom-store.ts" },
      { id: "lunch-menu", title: "เมนูอาหารประจำสัปดาห์", detail: "ยังไม่มีเมนูในระบบ — ใส่ทีเดียวได้ทั้งสัปดาห์", status: "waiting", href: "/teacher/lunch", file: "src/lib/care-store.ts" },
      { id: "allergy", title: "ของแพ้ของเด็กแต่ละคน", detail: "เรื่องความปลอดภัย — ใส่แล้วจะขึ้นเตือนในสมุดสื่อสารและหน้าเมนูอาหารอัตโนมัติ", status: "waiting", priority: true, href: "/teacher/lunch", file: "src/lib/care-store.ts" },
      { id: "pickup", title: "รายชื่อคนที่มารับเด็กได้", detail: "ผู้ปกครองใส่เองได้ที่หน้าแจ้งลา — ครูตรวจก่อนส่งเด็กทุกครั้ง", status: "waiting", href: "/teacher/leave", file: "src/lib/care-store.ts" },
    ],
  },
  {
    id: "media",
    emoji: "🖼️",
    label: "ภาพและไฟล์",
    hint: "ส่งมาเป็นชุดก็ได้ เดี๋ยวแปลงเป็นไฟล์เว็บแล้วใส่ให้",
    items: [
      { id: "flash-img", title: "ภาพแฟลชการ์ด 340 ใบ", detail: "ตอนนี้ใช้อีโมจิแทนทั้งหมด — ส่งมาทีละหมวดก็ได้ (1 ภาพ ต่อ 1 คำ ใช้ทั้งด้านหน้าและหลัง)", status: "waiting", href: "/flashcards", file: "public/flashcards/" },
      { id: "jigsaw-img", title: "ภาพสำหรับจิ๊กซอว์", detail: "ตอนนี้ใช้ภาพที่มีอยู่แล้วในเว็บ — ภาพที่เหมาะคือสีสด รายละเอียดชัด สัดส่วน 4:3", status: "waiting", href: "/jigsaw", file: "public/jigsaw/" },
      { id: "event-img", title: "ภาพกิจกรรมที่ยังใช้อิโมจิ", detail: "🎨 สัปดาห์ศิลปะ · 🌱 วันปลูกต้นไม้ · 🪷 ลอยกระทงน้อย · 👨 วันพ่อ", status: "waiting", href: "/school-events", file: "src/data/school-events.ts" },
      { id: "project-img", title: "ภาพโครงการและผลงาน", detail: "🐛 หนอนไหม · 🌳 ไม้หนึ่งมีเรื่องราว · 🥛 แก้วนมใบนี้ · 🏠 วาดครอบครัวของฉัน", status: "waiting", href: "/projects", file: "src/data/projects.ts" },
      { id: "school-img", title: "ภาพบ้านโรงเรียนสำหรับการ์ดแผน", detail: "ใช้ในการ์ด “เรื่อง โรงเรียนของเรา” (หน่วยโรงเรียน 2 สัปดาห์)", status: "waiting", href: "/plans", file: "src/data/plans.ts" },
      { id: "pdf", title: "ไฟล์ PDF หลักสูตรจริง", detail: "ระบบอ่าน PDF พร้อมใช้แล้ว (เปิดอ่าน/ค้นหา/บุ๊กมาร์ก) แต่ยังไม่มีไฟล์จริง", status: "waiting", href: "/curriculum", file: "public/curriculum/" },
    ],
  },
  {
    id: "system",
    emoji: "🔐",
    label: "ระบบที่รอขั้นตอนถัดไป",
    hint: "ไม่ใช่ข้อมูลที่ครูต้องให้ แต่เป็นงานที่ต้องทำเพิ่ม",
    items: [
      { id: "login", title: "ระบบบัญชีจริง", detail: "ตอนนี้ซ่อนโซนห้องครูจากเมนูได้ แต่ยังล็อกจริงไม่ได้ — ใครรู้ลิงก์ก็ยังเข้าได้", status: "waiting", priority: true, href: "/login", file: "src/app/login" },
      { id: "server", title: "ย้ายข้อมูลขึ้นเซิร์ฟเวอร์", detail: "ข้อมูลที่ครูสร้าง (แฟลชการ์ด · เอกสาร · ผลงาน · พัฒนาการ) เก็บในเบราว์เซอร์เครื่องเดียว ยังไม่ข้ามเครื่อง", status: "waiting", priority: true, file: "src/lib/*-store.ts" },
      { id: "sound", title: "เสียงอ่านออกเสียงในใบงาน / นิทาน / เกม", detail: "แฟลชการ์ดมีแล้ว เอาไปใส่ที่อื่นได้อีก — ทำได้เลยโดยไม่ต้องอัดเสียง", status: "waiting", href: "/worksheets", file: "src/lib/speak.ts" },
      { id: "video", title: "บริการวิดีโอห้องเรียนออนไลน์", detail: "เรียนสดข้ามเครื่องในวงแลนได้ แต่ยังไม่มีเซิร์ฟเวอร์กลาง", status: "waiting", href: "/online-classroom" },
    ],
  },
];

export const pendingStats = () => {
  const all = PENDING_GROUPS.flatMap((g) => g.items);
  return {
    total: all.length,
    done: all.filter((i) => i.status === "done").length,
    review: all.filter((i) => i.status === "review").length,
    waiting: all.filter((i) => i.status === "waiting").length,
    priority: all.filter((i) => i.status !== "done" && i.priority).length,
  };
};
