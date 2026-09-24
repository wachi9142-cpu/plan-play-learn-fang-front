"use client";

import type { Block, DocStatus, DocType, SheetData, Slide, SlideTheme, StudioDoc } from "@/types";
import { getPlan, getUnit } from "@/data/plans";
import { getSchedule } from "@/data/schedules";

/**
 * ที่เก็บเอกสาร Garden Studio
 * - localStorage: เก็บในเครื่องเสมอ (ทำงานได้แม้ออฟไลน์)
 * - server sync: ถ้าตั้ง NEXT_PUBLIC_STUDIO_API จะ PUT ไปยัง `${API}/docs/:id` เมื่อออนไลน์
 *   (ยังไม่มี backend → เอกสารอยู่ในเครื่องนี้เท่านั้น จนกว่าจะเชื่อมบัญชี)
 */
const KEY = "lpg-studio-docs-v1";
const API = process.env.NEXT_PUBLIC_STUDIO_API ?? "";

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const now = () => new Date().toISOString();

const canStore = () => typeof window !== "undefined" && !!window.localStorage;

function readAll(): Record<string, StudioDoc> {
  if (!canStore()) return {};
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { return {}; }
}
function writeAll(map: Record<string, StudioDoc>) {
  if (!canStore()) return;
  localStorage.setItem(KEY, JSON.stringify(map));
  window.dispatchEvent(new Event("lpg-studio-change"));
}

export function listDocs(): StudioDoc[] {
  return Object.values(readAll()).map(normalizeDoc).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
export function getDoc(id: string): StudioDoc | undefined {
  const d = readAll()[id];
  return d ? normalizeDoc(d) : undefined;
}
export function saveDocLocal(doc: StudioDoc): StudioDoc {
  const map = readAll();
  const next = { ...doc, updatedAt: now(), dirty: true };
  map[doc.id] = next;
  writeAll(map);
  return next;
}
export async function deleteDoc(id: string) {
  const map = readAll();
  delete map[id];
  writeAll(map);
  try { const { removeAssetsOfDoc } = await import("./studio-assets"); await removeAssetsOfDoc(id); } catch { /* ไม่มี IndexedDB */ }
}
export async function duplicateDoc(id: string): Promise<StudioDoc | undefined> {
  const src = getDoc(id);
  if (!src) return;
  const newId = uid();
  let blocks = src.blocks;
  try {
    const { copyAssets } = await import("./studio-assets");
    const idMap = await copyAssets(src.id, newId);
    blocks = src.blocks.map((b) => ("assetId" in b && b.assetId && idMap[b.assetId] ? { ...b, assetId: idMap[b.assetId] } : b)) as Block[];
  } catch { /* ไม่มี IndexedDB */ }
  const copy: StudioDoc = { ...src, id: newId, blocks, title: `${src.title} (สำเนา)`, status: "draft", createdAt: now(), updatedAt: now(), syncedAt: undefined, dirty: true };
  const map = readAll(); map[copy.id] = copy; writeAll(map);
  return copy;
}

/** ซิงก์ขึ้นเซิร์ฟเวอร์ — คืนค่า "synced" | "local-only" (ไม่มี API) | "error" */
export async function syncDoc(doc: StudioDoc): Promise<"synced" | "local-only" | "error"> {
  if (!API) return "local-only";
  if (typeof navigator !== "undefined" && !navigator.onLine) return "error";
  try {
    const res = await fetch(`${API}/docs/${doc.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(doc) });
    if (!res.ok) return "error";
    const map = readAll();
    map[doc.id] = { ...doc, syncedAt: now(), dirty: false };
    writeAll(map);
    return "synced";
  } catch {
    return "error";
  }
}

/** ซิงก์ทุกเอกสารที่ค้าง (เรียกเมื่อกลับมาออนไลน์) */
export async function syncPending() {
  if (!API) return;
  for (const d of listDocs()) if (d.dirty) await syncDoc(d);
}

/* ---------------- Templates ---------------- */
const h = (level: 1 | 2 | 3, html: string): Block => ({ id: uid(), type: "heading", level, html });
const p = (html: string): Block => ({ id: uid(), type: "paragraph", html });
const ul = (items: string[]): Block => ({ id: uid(), type: "bullets", items });
const ol = (items: string[]): Block => ({ id: uid(), type: "bullets", items, ordered: true });
const table = (rows: string[][], header = true): Block => ({ id: uid(), type: "table", rows, header });
const callout = (emoji: string, html: string, tone: "purple" | "yellow" | "mint" | "pink" = "purple"): Block => ({ id: uid(), type: "callout", emoji, html, tone });
const fields = (f: { label: string; value: string }[]): Block => ({ id: uid(), type: "fields", fields: f });

/** ตารางแผนหน่วยการจัดประสบการณ์ (ตามแบบฟอร์มจริง): มาตรฐาน/ตัวบ่งชี้ | จุดประสงค์ | สาระการเรียนรู้ (ประสบการณ์สำคัญ | สาระที่ควรเรียนรู้) */
export const unitPlanTable = (): Block => ({
  id: uid(), type: "table", header: true,
  rows: [
    ["<b>มาตรฐาน/ตัวบ่งชี้/สภาพที่พึงประสงค์</b>", "<b>จุดประสงค์การเรียนรู้</b>", "<b>สาระการเรียนรู้</b>", ""],
    ["", "", "<b>ประสบการณ์สำคัญ</b>", "<b>สาระที่ควรเรียนรู้</b>"],
    ["<b>มฐ 1 ตบช 1.3</b><br>๑.๓.1 เล่นและทำกิจกรรมอย่างปลอดภัยด้วยตนเอง<br><b>มฐ 2 ตบช 2.1</b><br>2.1.1 …", "๑. เล่นและทำกิจกรรมอย่างปลอดภัยด้วยตนเอง<br><br>2. …", "<u>ด้านร่างกาย</u><br>๑. การปฏิบัติตามสุขอนามัย สุขนิสัยที่ดีในกิจวัตรประจำวัน<br>๒. การเคลื่อนไหวเคลื่อนที่<br>๓. …", "1. ส่วนประกอบต่าง ๆ ของร่างกาย/หน้าที่ของอวัยวะส่วนต่าง ๆ<br> - ตามีไว้ดู<br> - หูมีไว้ฟัง<br>2. …"],
  ],
  colWidths: [165, 165, 165, 165],
  rowHeights: [0, 0, 320],
  merges: [{ r: 0, c: 2, rowSpan: 1, colSpan: 2 }, { r: 0, c: 0, rowSpan: 2, colSpan: 1 }, { r: 0, c: 1, rowSpan: 2, colSpan: 1 }],
});

export const newSlide = (theme: SlideTheme = "white", blocks: Block[] = []): Slide => ({ id: uid(), theme, blocks });

/** แม่แบบงานนำเสนอ (เหมือน "เริ่มงานนำเสนอใหม่") */
export const SLIDE_TEMPLATES: { id: string; emoji: string; title: string; description: string; make: (planTitle?: string) => Slide[] }[] = [
  { id: "blank", emoji: "➕", title: "งานนำเสนอเปล่า", description: "เริ่มจากสไลด์ว่าง 1 หน้า", make: () => [newSlide("white", [h(1, "ชื่อเรื่อง"), p("คำอธิบาย…")])] },
  { id: "album", emoji: "📷", title: "อัลบั้มรูปถ่าย", description: "หน้าปก + หน้ารูป 3 หน้า (ลากรูปมาวาง)", make: () => [newSlide("purple", [h(1, "📷 อัลบั้มกิจกรรม"), p("Little Purple Garden · ภาคเรียนที่ …")]), ...[1, 2, 3].map(() => newSlide("white", [h(2, "ชื่อกิจกรรม"), { id: uid(), type: "image", src: "", caption: "", width: 80, align: "center", rotate: 0 } as Block]))] },
  { id: "story", emoji: "📖", title: "นิทาน / เล่าเรื่อง", description: "ปก + 4 ฉาก + จบ สำหรับเล่านิทานหน้าห้อง", make: () => [newSlide("yellow", [h(1, "📖 ชื่อนิทาน"), p("เล่าโดย Teacher Kaowfang")]), ...[1, 2, 3, 4].map((i) => newSlide("white", [h(2, `ฉากที่ ${i}`), { id: uid(), type: "image", src: "", caption: "", width: 60, align: "center", rotate: 0 } as Block, p("…")])), newSlide("pink", [h(1, "🌷 จบแล้วจ้า"), p("เด็ก ๆ ชอบตอนไหนที่สุดคะ?")])] },
  { id: "lesson", emoji: "🎈", title: "บทเรียนตามหน่วย", description: "ปก · จุดประสงค์ · เนื้อหา · กิจกรรม · สรุป", make: (pt) => [newSlide("purple", [h(1, pt ? `หน่วย ${pt}` : "ชื่อหน่วย"), p("อนุบาล 1 · Little Purple Garden")]), newSlide("white", [h(2, "🎯 วันนี้เราจะเรียนรู้"), ul(["…", "…"])]), newSlide("white", [h(2, "📚 มาดูกันเถอะ"), { id: uid(), type: "image", src: "", caption: "", width: 60, align: "center", rotate: 0 } as Block]), newSlide("mint", [h(2, "🧸 กิจกรรม"), ol(["…", "…"])]), newSlide("sky", [h(2, "⭐ สรุป"), p("วันนี้หนูได้เรียนรู้อะไรบ้าง?")])] },
  { id: "plan", emoji: "📋", title: "แผนงาน", description: "ภาพรวม · เป้าหมาย · ขั้นตอน · ตาราง", make: () => [newSlide("dark", [h(1, "แผนงาน"), p("ระบุภาคเรียน / โครงการ")]), newSlide("white", [h(2, "🎯 เป้าหมาย"), ul(["…"])]), newSlide("white", [h(2, "🗓️ ขั้นตอน"), table([["ช่วงเวลา", "กิจกรรม", "ผู้รับผิดชอบ"], ["", "", ""], ["", "", ""]])])] },
];

const grid = (r: number, c: number) => Array.from({ length: r }, () => Array.from({ length: c }, () => ""));

/** แม่แบบสเปรดชีต (เหมือน "เริ่มสเปรดชีตใหม่") */
export const SHEET_TEMPLATES: { id: string; emoji: string; title: string; description: string; make: () => SheetData }[] = [
  { id: "blank", emoji: "➕", title: "สเปรดชีตเปล่า", description: "ตาราง 20 แถว × 8 คอลัมน์", make: () => ({ rows: grid(20, 8), headerRow: false }) },
  { id: "todo", emoji: "✅", title: "รายการสิ่งที่ต้องทำ", description: "งาน · กำหนดส่ง · สถานะ · หมายเหตุ", make: () => ({ rows: [["✔", "สิ่งที่ต้องทำ", "กำหนดส่ง", "สถานะ", "หมายเหตุ"], ...grid(15, 5)], headerRow: true }) },
  { id: "attendance", emoji: "🧒", title: "เช็คชื่อ / รายชื่อนักเรียน", description: "เลขที่ · ชื่อ · จ.–ศ. · รวม", make: () => ({ rows: [["เลขที่", "ชื่อ–นามสกุล", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "รวม"], ...Array.from({ length: 20 }, (_, i) => [String(i + 1), "", "", "", "", "", "", `=COUNT(C${i + 2}:G${i + 2})`])], headerRow: true }) },
  { id: "development", emoji: "🌱", title: "บันทึกพัฒนาการ", description: "ชื่อ · ร่างกาย · อารมณ์ · สังคม · สติปัญญา · เฉลี่ย", make: () => ({ rows: [["เลขที่", "ชื่อ–นามสกุล", "ร่างกาย", "อารมณ์–จิตใจ", "สังคม", "สติปัญญา", "เฉลี่ย"], ...Array.from({ length: 20 }, (_, i) => [String(i + 1), "", "", "", "", "", `=AVERAGE(C${i + 2}:F${i + 2})`])], headerRow: true }) },
  { id: "budget", emoji: "💰", title: "งบประมาณกิจกรรม", description: "รายการ · จำนวน · ราคา/หน่วย · รวม (สูตรอัตโนมัติ)", make: () => ({ rows: [["รายการ", "จำนวน", "ราคา/หน่วย", "รวม"], ...Array.from({ length: 12 }, (_, i) => ["", "", "", `=B${i + 2}*C${i + 2}`]), ["รวมทั้งหมด", "", "", "=SUM(D2:D13)"]], headerRow: true }) },
];

export function createDoc(type: DocType, opts: { planId?: string; scheduleId?: string; title?: string; slideTemplate?: string; sheetTemplate?: string } = {}): StudioDoc {
  const id = uid();
  let title = opts.title ?? "";
  let blocks: Block[] = [];
  const links: StudioDoc["links"] = { planId: opts.planId, scheduleId: opts.scheduleId };

  if (type === "plan") {
    const plan = opts.planId ? getPlan(opts.planId) : undefined;
    const unit = plan ? getUnit(plan.unitId) : undefined;
    title = title || (plan ? `แผนการจัดประสบการณ์ เรื่อง ${plan.title}` : "แผนการจัดประสบการณ์ (ใหม่)");
    links.gradeId = plan?.gradeId ?? "k1";
    const weekRows = plan && plan.weeks.length
      ? plan.weeks.map((w) => [`สัปดาห์ที่ ${w.number}`, w.title, w.summary])
      : [["สัปดาห์ที่ 1", "", ""], ["สัปดาห์ที่ 2", "", ""]];
    blocks = [
      h(2, `หน่วยการจัดประสบการณ์ ชั้นอนุบาลศึกษาปีที่ 1 สัปดาห์ที่ … หน่วย ${unit?.name ?? "…"}`),
      unitPlanTable(),
      fields([
        { label: "ระดับชั้น", value: "อนุบาล 1" },
        { label: "หน่วยการเรียนรู้", value: unit?.name ?? "" },
        { label: "เรื่อง", value: plan?.title ?? "" },
        { label: "สาระการเรียนรู้", value: plan?.strand ?? "" },
        { label: "ระยะเวลา", value: plan?.duration ?? "" },
        { label: "ครูผู้สอน", value: "Teacher Kaowfang" },
      ]),
      h(2, "🎯 จุดประสงค์"),
      ul(plan?.objectives.length ? plan.objectives : ["เด็กสามารถ…", "เด็กสามารถ…"]),
      h(2, "📚 สาระการเรียนรู้"),
      ul(plan?.content.length ? plan.content : ["…"]),
      h(2, "🧸 กิจกรรม"),
      table([["สัปดาห์", "หัวข้อ", "สรุปกิจกรรม"], ...weekRows]),
      h(3, "ขั้นตอนการจัดกิจกรรม"),
      ol(["ขั้นนำ: …", "ขั้นสอน: …", "ขั้นสรุป: …"]),
      h(2, "🧺 สื่อ / อุปกรณ์"),
      ul(plan?.materials.length ? plan.materials : ["…"]),
      h(2, "📋 การประเมิน"),
      ul(plan?.assessment.length ? plan.assessment : ["สังเกต…", "ตรวจผลงาน…"]),
      callout("💜", "บันทึกหลังสอน: …", "yellow"),
    ];
  } else if (type === "schedule") {
    const sch = opts.scheduleId ? getSchedule(opts.scheduleId) : undefined;
    title = title || (sch ? sch.title : "กำหนดการสอน (ใหม่)");
    links.gradeId = sch?.gradeId ?? "k1";
    const rows = sch
      ? sch.rows.map((r) => [String(r.week), r.dates, r.strand ?? "", r.planId ? (getPlan(r.planId)?.title ?? "") : (r.title ?? ""), r.note ?? ""])
      : Array.from({ length: 20 }, (_, i) => [String(i + 1), "", "", "", ""]);
    blocks = [
      h(1, `กำหนดการสอนชั้นอนุบาล 1 ${sch ? `${sch.semester} ${sch.year}` : "ภาคเรียนที่ … ปีการศึกษา …"}`),
      p(`โรงเรียน Little Purple Garden · ครูผู้สอน ${sch?.teacher ?? "Teacher Kaowfang"}`),
      table([["สัปดาห์ที่", "วัน เดือน ปี", "สาระการเรียนรู้", "หน่วยการจัดประสบการณ์", "หมายเหตุ"], ...rows]),
      callout("📌", sch?.footer ?? "ปิดเทอม", "mint"),
    ];
  } else if (type === "worksheet") {
    const plan = opts.planId ? getPlan(opts.planId) : undefined;
    title = title || (plan ? `ใบงาน เรื่อง ${plan.title}` : "ใบงาน (ใหม่)");
    links.gradeId = plan?.gradeId ?? "k1";
    blocks = [
      fields([{ label: "ชื่อ", value: "" }, { label: "นามสกุล", value: "" }, { label: "ห้อง", value: "" }, { label: "วันที่", value: "" }]),
      h(2, `📝 ${plan ? `ใบงาน เรื่อง ${plan.title}` : "ชื่อใบงาน"}`),
      callout("📌", "คำสั่ง: …", "yellow"),
      p("ลากรูปจากแถบด้านซ้ายมาวางตรงนี้ หรือเพิ่มตาราง/ข้อความได้ตามต้องการ"),
      table([["", "", ""], ["", "", ""]], false),
    ];
  } else if (type === "media") {
    const plan = opts.planId ? getPlan(opts.planId) : undefined;
    title = title || (plan ? `สื่อการเรียนการสอน เรื่อง ${plan.title}` : "สื่อการเรียนการสอน (ใหม่)");
    links.gradeId = plan?.gradeId ?? "k1";
    blocks = [
      h(1, plan ? `🎨 สื่อ เรื่อง ${plan.title}` : "🎨 ชื่อสื่อการเรียนการสอน"),
      fields([{ label: "ประเภทสื่อ", value: "บัตรภาพ / โปสเตอร์ / เพลง / นิทาน" }, { label: "ใช้กับหน่วย", value: plan ? (getUnit(plan.unitId)?.name ?? "") : "" }, { label: "ระดับชั้น", value: "อนุบาล 1" }]),
      p("ลากรูปสื่อจากแถบด้านซ้ายมาวางตรงนี้ ปรับขนาด/หมุน/ครอปได้"),
      h(2, "วิธีใช้"),
      ol(["…", "…"]),
    ];
  } else if (type === "slides") {
    const plan = opts.planId ? getPlan(opts.planId) : undefined;
    const tpl = SLIDE_TEMPLATES.find((t) => t.id === (opts.slideTemplate ?? "blank")) ?? SLIDE_TEMPLATES[0];
    title = title || (plan ? `สไลด์ เรื่อง ${plan.title}` : tpl.id === "blank" ? "งานนำเสนอใหม่" : tpl.title);
    links.gradeId = plan?.gradeId ?? "k1";
    const doc: StudioDoc = { id, type, status: "draft", title, blocks: [], slides: tpl.make(plan?.title), links, createdAt: now(), updatedAt: now(), dirty: true };
    const map = readAll(); map[id] = doc; writeAll(map);
    return doc;
  } else if (type === "sheet") {
    const tpl = SHEET_TEMPLATES.find((t) => t.id === (opts.sheetTemplate ?? "blank")) ?? SHEET_TEMPLATES[0];
    title = title || (tpl.id === "blank" ? "สเปรดชีตใหม่" : tpl.title);
    links.gradeId = "k1";
    const doc: StudioDoc = { id, type, status: "draft", title, blocks: [], sheet: tpl.make(), links, createdAt: now(), updatedAt: now(), dirty: true };
    const map = readAll(); map[id] = doc; writeAll(map);
    return doc;
  } else {
    title = title || "เอกสารใหม่";
    blocks = [h(1, "หัวข้อเอกสาร"), p("เริ่มพิมพ์ที่นี่…")];
  }

  const doc: StudioDoc = { id, type, status: "draft", title, blocks, links, createdAt: now(), updatedAt: now(), dirty: true };
  const map = readAll(); map[id] = doc; writeAll(map);
  return doc;
}

export const DOC_TYPES: Record<DocType, { emoji: string; label: string; description: string; tint: string; icon?: string }> = {
  plan: { emoji: "📖", label: "แผนการจัดประสบการณ์", description: "แบบฟอร์มแผน: จุดประสงค์ สาระ กิจกรรม สื่อ การประเมิน", tint: "bg-purple-100" },
  schedule: { emoji: "📅", label: "กำหนดการสอน", description: "ตาราง 20 สัปดาห์ เชื่อมกับแผนแต่ละเรื่อง", tint: "bg-sky-soft" },
  worksheet: { emoji: "📝", label: "ใบงาน", description: "หัวกระดาษ ชื่อ–นามสกุล–ห้อง + คำสั่ง + พื้นที่ใบงาน", tint: "bg-mint-soft" },
  media: { emoji: "🎨", label: "สื่อการเรียนการสอน", description: "บัตรภาพ โปสเตอร์ สื่อทำมือ พร้อมวิธีใช้", tint: "bg-pink-soft", icon: "/art/palette.webp" },
  slides: { emoji: "🎞️", label: "สไลด์ / งานนำเสนอ", description: "สไลด์ 16:9 สำหรับสอนหน้าห้อง เล่านิทาน อัลบั้มรูป", tint: "bg-[#ffe3c8]" },
  sheet: { emoji: "📊", label: "สเปรดชีต", description: "ตารางข้อมูล เช็คชื่อ บันทึกพัฒนาการ งบประมาณ พร้อมสูตร", tint: "bg-mint-soft" },
  other: { emoji: "📄", label: "เอกสารอื่น ๆ", description: "เอกสารว่าง ใส่บล็อกได้อิสระ", tint: "bg-yellow-soft" },
};

export const DOC_STATUS: Record<DocStatus, { emoji: string; label: string; cls: string }> = {
  draft: { emoji: "📝", label: "แบบร่าง", cls: "bg-yellow-soft text-[#8a6a00]" },
  saved: { emoji: "🟢", label: "บันทึกแล้ว", cls: "bg-mint-soft text-[#2e6b4c]" },
  ready: { emoji: "📤", label: "พร้อมใช้งาน", cls: "bg-purple-100 text-purple-800" },
};

/** เอกสารเก่าที่ยังไม่มี status/blocks ใหม่ → เติมค่าเริ่มต้น */
export function normalizeDoc(d: StudioDoc): StudioDoc {
  return { ...d, status: d.status ?? "draft", tags: d.tags ?? [] };
}
