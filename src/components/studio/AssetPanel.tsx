"use client";

import { useEffect, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import type { StudioAsset } from "@/types";
import { addAsset, fileEmoji, fmtSize, listAssets, removeAsset } from "@/lib/studio-assets";
import { cn } from "@/lib/cn";

export const DRAG_MIME = "application/x-lpg-asset";

/** object URL ของ asset (สร้าง/ล้างอัตโนมัติ) */
export function useAssetUrl(asset?: StudioAsset | null) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    if (!asset) { setUrl(""); return; }
    const u = URL.createObjectURL(asset.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [asset]);
  return url;
}

/** รายการ asset ของเอกสาร (อัปเดตอัตโนมัติเมื่อมีการเพิ่ม/ลบ) */
export function useAssets(docId: string) {
  const [assets, setAssets] = useState<StudioAsset[]>([]);
  useEffect(() => {
    let alive = true;
    const load = () => listAssets(docId).then((a) => alive && setAssets(a)).catch(() => {});
    load();
    const h = (e: Event) => { if ((e as CustomEvent).detail === docId) load(); };
    window.addEventListener("lpg-assets-change", h);
    return () => { alive = false; window.removeEventListener("lpg-assets-change", h); };
  }, [docId]);
  return assets;
}

/** 📎 แถบด้านซ้าย: อัปโหลดรูป/ไฟล์ แล้วลากเข้าเอกสาร */
export function AssetPanel({ docId, onInsert }: { docId: string; onInsert: (a: StudioAsset) => void }) {
  const assets = useAssets(docId);
  const [tab, setTab] = useState<"image" | "file">("image");
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const upload = async (files: FileList | File[]) => {
    setBusy(true);
    for (const f of Array.from(files)) await addAsset(docId, f);
    setBusy(false);
  };

  const list = assets.filter((a) => a.kind === tab);

  return (
    <div className="card flex h-full flex-col overflow-hidden">
      <div className="border-b border-line p-3">
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) upload(e.dataTransfer.files); }}
          className={cn("tap flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed bg-purple-600 px-3 py-3 text-center text-white shadow-soft transition hover:bg-purple-700", dragOver ? "border-yellow-accent bg-purple-700" : "border-transparent")}
        >
          <Upload size={18} />
          <span className="text-[14px] font-medium">{busy ? "กำลังอัปโหลด…" : "อัปโหลดรูป / ไฟล์"}</span>
          <span className="text-[11px] opacity-80">รูปภาพ · PDF · Word · PowerPoint</span>
          <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" className="hidden" onChange={(e) => e.target.files && upload(e.target.files)} />
        </label>
        <div className="mt-3 flex gap-1 rounded-xl bg-cream p-1 text-[13px]">
          <button type="button" onClick={() => setTab("image")} className={cn("flex-1 rounded-lg py-1", tab === "image" ? "bg-white font-medium text-purple-800 shadow-soft" : "text-ink-soft")}>🖼️ รูปภาพ ({assets.filter((a) => a.kind === "image").length})</button>
          <button type="button" onClick={() => setTab("file")} className={cn("flex-1 rounded-lg py-1", tab === "file" ? "bg-white font-medium text-purple-800 shadow-soft" : "text-ink-soft")}>📎 ไฟล์ ({assets.filter((a) => a.kind === "file").length})</button>
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto p-3">
        {list.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-ink-soft">{tab === "image" ? "ยังไม่มีรูป — อัปโหลดแล้วลากไปวางในเอกสารได้เลย" : "ยังไม่มีไฟล์แนบ"}</p>
        ) : tab === "image" ? (
          <div className="grid grid-cols-2 gap-2">
            {list.map((a) => <AssetThumb key={a.id} asset={a} onInsert={() => onInsert(a)} onRemove={() => removeAsset(a.id, docId)} />)}
          </div>
        ) : (
          <ul className="grid gap-1.5">
            {list.map((a) => <AssetFileRow key={a.id} asset={a} onInsert={() => onInsert(a)} onRemove={() => removeAsset(a.id, docId)} />)}
          </ul>
        )}
      </div>
      <p className="border-t border-line px-3 py-2 text-[11px] text-ink-soft">💡 ลากรูปไปวางบนเอกสาร หรือกด “แทรก” · ไฟล์เก็บในเครื่องนี้ (IndexedDB) จนกว่าจะเชื่อมบัญชี</p>
    </div>
  );
}

function AssetThumb({ asset, onInsert, onRemove }: { asset: StudioAsset; onInsert: () => void; onRemove: () => void }) {
  const url = useAssetUrl(asset);
  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.setData(DRAG_MIME, asset.id); e.dataTransfer.effectAllowed = "copy"; }}
      className="group relative cursor-grab overflow-hidden rounded-xl border border-line bg-white active:cursor-grabbing"
      title={`${asset.name} · ${fmtSize(asset.size)} — ลากไปวางในเอกสาร`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {url && <img src={url} alt={asset.name} className="aspect-square w-full object-cover" draggable={false} />}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/50 px-1.5 py-1 text-[11px] text-white opacity-0 transition group-hover:opacity-100">
        <button type="button" onClick={onInsert} className="rounded-md bg-white/20 px-1.5 hover:bg-white/40">แทรก</button>
        <button type="button" onClick={onRemove} aria-label="ลบรูป" className="rounded-md p-0.5 hover:bg-red-500"><Trash2 size={12} /></button>
      </div>
    </div>
  );
}

function AssetFileRow({ asset, onInsert, onRemove }: { asset: StudioAsset; onInsert: () => void; onRemove: () => void }) {
  const url = useAssetUrl(asset);
  return (
    <li
      draggable
      onDragStart={(e) => { e.dataTransfer.setData(DRAG_MIME, asset.id); e.dataTransfer.effectAllowed = "copy"; }}
      className="flex cursor-grab items-center gap-2 rounded-xl border border-line bg-white px-2 py-1.5 active:cursor-grabbing"
    >
      <span className="text-xl">{fileEmoji(asset.mime, asset.name)}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] text-ink">{asset.name}</span>
        <span className="block text-[11px] text-ink-soft">{fmtSize(asset.size)}</span>
      </span>
      {url && <a href={url} target="_blank" rel="noopener" className="text-[12px] text-purple-700 hover:underline">เปิด</a>}
      <button type="button" onClick={onInsert} className="text-[12px] text-purple-700 hover:underline">แทรก</button>
      <button type="button" onClick={onRemove} aria-label="ลบไฟล์" className="text-ink-soft hover:text-red-500"><Trash2 size={13} /></button>
    </li>
  );
}
