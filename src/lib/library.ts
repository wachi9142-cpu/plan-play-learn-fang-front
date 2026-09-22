"use client";

import type { StudioAsset } from "@/types";
import { listAllAssets } from "./studio-assets";
import { getDoc } from "./studio-store";
import { getRoom, listRooms, listArchive } from "./classroom-store";
import { getCurriculum, listCurricula } from "./curriculum-store";
import { listPortfolio } from "./canvas-store";
import { listCanvases } from "./canvas-store";

/**
 * 📚 Garden Library — คลังสื่อรวมของทั้งเว็บ
 * รวมไฟล์จาก: Garden Studio (เอกสาร/รูป/แนบ) · ห้องเรียนออนไลน์ (คลังย้อนหลัง/คลิปการสอน) · หลักสูตร (PDF) · Garden Canvas (ผลงาน)
 * ทุกชิ้นชี้กลับไปยังต้นทางได้ และกรองตามประเภท/ที่มา/ห้อง/หน่วย/วันที่
 */
export type LibKind = "image" | "video" | "audio" | "pdf" | "doc" | "slide" | "sheet" | "other";
export type LibSource = "studio" | "classroom" | "curriculum" | "canvas";

export interface LibItem {
  id: string;
  title: string;
  kind: LibKind;
  source: LibSource;
  sourceLabel: string;
  href?: string;            // ลิงก์กลับต้นทาง
  assetId?: string;         // ไฟล์ใน IndexedDB
  dataUrl?: string;         // รูปที่เก็บเป็น data URL (ผลงาน Canvas)
  mime?: string;
  size?: number;
  date: string;
  roomId?: string;
  unitId?: string;
  tags: string[];
}

export const LIB_KINDS: { id: LibKind; emoji: string; label: string }[] = [
  { id: "image", emoji: "🖼️", label: "รูปภาพ" },
  { id: "video", emoji: "🎥", label: "วิดีโอ" },
  { id: "audio", emoji: "🎵", label: "เสียง" },
  { id: "pdf", emoji: "📕", label: "PDF" },
  { id: "doc", emoji: "📄", label: "เอกสาร/Word" },
  { id: "slide", emoji: "📊", label: "สไลด์/PPT" },
  { id: "sheet", emoji: "📈", label: "สเปรดชีต" },
  { id: "other", emoji: "📦", label: "อื่น ๆ" },
];
export const LIB_SOURCES: Record<LibSource, { emoji: string; label: string }> = {
  studio: { emoji: "🌱", label: "Garden Studio" },
  classroom: { emoji: "💻", label: "ห้องเรียนออนไลน์" },
  curriculum: { emoji: "📚", label: "หลักสูตร" },
  canvas: { emoji: "🎨", label: "Garden Canvas" },
};

export function kindOf(mime = "", name = ""): LibKind {
  const n = name.toLowerCase();
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime === "application/pdf" || n.endsWith(".pdf")) return "pdf";
  if (/word|document/.test(mime) || /\.docx?$/.test(n)) return "doc";
  if (/presentation|powerpoint/.test(mime) || /\.pptx?$/.test(n)) return "slide";
  if (/sheet|excel|csv/.test(mime) || /\.(xlsx?|csv)$/.test(n)) return "sheet";
  if (mime.startsWith("text/")) return "doc";
  return "other";
}

/** รวมทุกแหล่งเป็นรายการเดียว */
export async function buildLibrary(): Promise<LibItem[]> {
  const items: LibItem[] = [];
  const assets: StudioAsset[] = await listAllAssets().catch(() => []);
  const archiveByAsset = new Map<string, { roomId: string; title: string; unitId?: string }>();
  for (const r of listRooms()) for (const a of listArchive(r.id)) if (a.assetId) archiveByAsset.set(a.assetId, { roomId: r.id, title: a.title, unitId: a.unitId });
  const curFileIds = new Map<string, { id: string; title: string }>();
  for (const c of listCurricula()) for (const f of c.files) curFileIds.set(f.assetId, { id: c.id, title: c.title });

  for (const a of assets) {
    const arch = archiveByAsset.get(a.id);
    const cur = curFileIds.get(a.id);
    if (arch) {
      const room = getRoom(arch.roomId);
      items.push({ id: a.id, title: arch.title || a.name, kind: kindOf(a.mime, a.name), source: "classroom", sourceLabel: room ? `${room.emoji} ${room.nickname}` : "ห้องเรียน", href: `/online-classroom/${arch.roomId}?tab=archive`, assetId: a.id, mime: a.mime, size: a.size, date: a.createdAt, roomId: arch.roomId, unitId: arch.unitId, tags: ["คลังย้อนหลัง"] });
    } else if (cur) {
      items.push({ id: a.id, title: a.name, kind: kindOf(a.mime, a.name), source: "curriculum", sourceLabel: `📕 ${cur.title}`, href: `/curriculum/${cur.id}`, assetId: a.id, mime: a.mime, size: a.size, date: a.createdAt, tags: ["หลักสูตร"] });
    } else {
      const doc = a.docId.startsWith("class:") || a.docId.startsWith("curriculum:") ? null : getDoc(a.docId);
      items.push({ id: a.id, title: a.name, kind: kindOf(a.mime, a.name), source: "studio", sourceLabel: doc ? `📄 ${doc.title}` : "Garden Studio", href: doc ? `/studio/${doc.id}` : "/studio", assetId: a.id, mime: a.mime, size: a.size, date: a.createdAt, tags: doc ? [doc.type] : [] });
    }
  }

  // ผลงานจาก Garden Canvas (เก็บเป็น data URL)
  for (const p of listPortfolio()) items.push({ id: `pf-${p.id}`, title: p.title, kind: "image", source: "canvas", sourceLabel: `🧒 ${p.childName}`, href: "/portfolio", dataUrl: p.image, mime: "image/jpeg", date: p.date, tags: p.published ? ["ผลงานเด็ก", "เผยแพร่"] : ["ผลงานเด็ก"] });
  for (const c of listCanvases()) if (c.thumb) items.push({ id: `cv-${c.id}`, title: c.title, kind: "image", source: "canvas", sourceLabel: "🎨 กระดาษวาดรูป", href: c.room ? `/canvas/room/${c.room}` : `/canvas/${c.id}`, dataUrl: c.thumb, mime: "image/jpeg", date: c.updatedAt, tags: ["กระดาษวาดรูป"] });

  return items.sort((a, b) => b.date.localeCompare(a.date));
}

export const libCurriculumTitle = (id: string) => getCurriculum(id)?.title ?? "";
