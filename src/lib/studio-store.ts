"use client";

import type { Block, DocType, StudioDoc } from "@/types";
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
  return Object.values(readAll()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
export function getDoc(id: string): StudioDoc | undefined {
  return readAll()[id];
}
export function saveDocLocal(doc: StudioDoc): StudioDoc {
  const map = readAll();
  const next = { ...doc, updatedAt: now(), dirty: true };
  map[doc.id] = next;
  writeAll(map);
  return next;
}
export function deleteDoc(id: string) {
  const map = readAll();
  delete map[id];
  writeAll(map);
}
export function duplicateDoc(id: string): StudioDoc | undefined {
  const src = getDoc(id);
  if (!src) return;
  const copy: StudioDoc = { ...src, id: uid(), title: `${src.title} (สำเนา)`, createdAt: now(), updatedAt: now(), syncedAt: undefined, dirty: true };
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

export function createDoc(type: DocType, opts: { planId?: string; scheduleId?: string; title?: string } = {}): StudioDoc {
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
  } else {
    title = title || "เอกสารใหม่";
    blocks = [h(1, "หัวข้อเอกสาร"), p("เริ่มพิมพ์ที่นี่…")];
  }

  const doc: StudioDoc = { id, type, title, blocks, links, createdAt: now(), updatedAt: now(), dirty: true };
  const map = readAll(); map[id] = doc; writeAll(map);
  return doc;
}

export const DOC_TYPES: Record<DocType, { emoji: string; label: string; description: string; tint: string }> = {
  plan: { emoji: "📄", label: "แผนการจัดประสบการณ์", description: "แบบฟอร์มแผน: จุดประสงค์ สาระ กิจกรรม สื่อ การประเมิน", tint: "bg-purple-100" },
  schedule: { emoji: "📅", label: "กำหนดการสอน", description: "ตาราง 20 สัปดาห์ เชื่อมกับแผนแต่ละเรื่อง", tint: "bg-sky-soft" },
  other: { emoji: "📋", label: "เอกสาร / แบบฟอร์มอื่น ๆ", description: "เอกสารว่าง ใส่บล็อกได้อิสระ", tint: "bg-yellow-soft" },
};
