"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { CanvasOp, CanvasTemplateId, CanvasTool, Participant, Pt } from "@/types/canvas";
import { drawOp, drawTemplate, hitTest, moveOp, preloadImages, renderAll } from "@/lib/canvas-render";
import { uid } from "@/lib/studio-store";

export interface BoardHandle {
  /** ภาพรวม (แม่แบบ + ผลงาน) เป็น canvas ใหม่ */
  compose: () => HTMLCanvasElement;
  redraw: () => void;
}

export interface BoardProps {
  width: number; height: number;
  template: CanvasTemplateId;
  ops: CanvasOp[];
  tool: CanvasTool; color: string; size: number; fill?: string;
  me: Participant;
  others: Participant[];
  onOp: (op: CanvasOp) => void;
  onMove: (op: CanvasOp) => void;
  onCursor: (p: Pt | null) => void;
  onTextAt: (p: Pt) => void;
  readOnly?: boolean;
}

/** พื้นที่วาด: 2 layer (แม่แบบ / ผลงาน) + layer พรีวิวขณะลาก · รองรับเมาส์ ปากกา นิ้ว (pointer events) */
export const CanvasBoard = forwardRef<BoardHandle, BoardProps>(function CanvasBoard({ width, height, template, ops, tool, color, size, fill, me, others, onOp, onMove, onCursor, onTextAt, readOnly }, ref) {
  const wrap = useRef<HTMLDivElement>(null);
  const tplRef = useRef<HTMLCanvasElement>(null);
  const artRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef<{ op: CanvasOp; start: Pt; moved?: CanvasOp; last?: Pt } | null>(null);
  const [scale, setScale] = useState(1);

  /* ---- ขนาดตามหน้าจอ ---- */
  useEffect(() => {
    const el = wrap.current; if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / width)));
    ro.observe(el); return () => ro.disconnect();
  }, [width]);

  /* ---- วาดแม่แบบ ---- */
  useEffect(() => { const c = tplRef.current?.getContext("2d"); if (!c) return; c.clearRect(0, 0, width, height); drawTemplate(c, template, width, height); }, [template, width, height]);

  /* ---- วาดผลงานทั้งหมดเมื่อ ops เปลี่ยน ---- */
  const redraw = useCallback(() => { const c = artRef.current?.getContext("2d"); if (c) renderAll(c, ops, width, height); }, [ops, width, height]);
  useEffect(() => { preloadImages(ops, redraw); redraw(); }, [ops, redraw]);

  useImperativeHandle(ref, () => ({
    redraw,
    compose: () => {
      const out = document.createElement("canvas"); out.width = width; out.height = height;
      const c = out.getContext("2d")!; c.fillStyle = "#fff"; c.fillRect(0, 0, width, height);
      if (tplRef.current) c.drawImage(tplRef.current, 0, 0); if (artRef.current) c.drawImage(artRef.current, 0, 0);
      return out;
    },
  }), [redraw, width, height]);

  /* ---- พิกัด ---- */
  const pt = (e: React.PointerEvent): Pt => { const r = liveRef.current!.getBoundingClientRect(); return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale }; };
  const liveCtx = () => liveRef.current?.getContext("2d") ?? null;
  const clearLive = () => liveCtx()?.clearRect(0, 0, width, height);

  const down = (e: React.PointerEvent) => {
    if (readOnly) return;
    if (e.button !== 0 && e.pointerType === "mouse") return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const p = pt(e);
    if (tool === "fill") { onOp({ id: uid(), by: me.id, kind: "fill", color, at: p }); return; }
    if (tool === "text") { onTextAt(p); return; }
    if (tool === "move") { const hit = hitTest(ops, p, artRef.current?.getContext("2d") ?? undefined); if (hit) drawing.current = { op: hit, start: p, moved: hit, last: p }; return; }
    if (tool === "image") return;
    let op: CanvasOp;
    if (tool === "pen" || tool === "brush" || tool === "eraser") op = { id: uid(), by: me.id, kind: "stroke", tool, color: tool === "eraser" ? "#000" : color, size: tool === "eraser" ? size * 2.5 : size, points: [p] };
    else op = { id: uid(), by: me.id, kind: "shape", shape: tool, color, size, fill: fill || undefined, from: p, to: p };
    drawing.current = { op, start: p };
    const c = liveCtx(); if (c) { c.clearRect(0, 0, width, height); if (op.kind === "stroke" && op.tool !== "eraser") drawOp(c, op); }
  };

  const move = (e: React.PointerEvent) => {
    const p = pt(e);
    onCursor(p);
    const d = drawing.current; if (!d) return;
    if (tool === "move" && d.moved) {
      const dx = p.x - (d.last?.x ?? p.x), dy = p.y - (d.last?.y ?? p.y); d.moved = moveOp(d.moved, dx, dy); d.last = p;
      // แสดงตัวอย่างการย้ายบน layer พรีวิว: วาดผลงานยกเว้นตัวที่ย้าย + ตัวที่ย้าย
      const c = artRef.current?.getContext("2d"); if (c) { renderAll(c, ops.filter((o) => o.id !== d.op.id), width, height); drawOp(c, d.moved); }
      return;
    }
    if (d.op.kind === "stroke") {
      const last = d.op.points[d.op.points.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) < 1.5) return;
      d.op.points.push(p);
      if (d.op.tool === "eraser") { const c = artRef.current?.getContext("2d"); if (c) { c.save(); c.globalCompositeOperation = "destination-out"; c.lineCap = "round"; c.lineWidth = d.op.size; c.beginPath(); c.moveTo(last.x, last.y); c.lineTo(p.x, p.y); c.stroke(); c.restore(); } }
      else { const c = liveCtx(); if (c) { c.clearRect(0, 0, width, height); drawOp(c, d.op); } }
    } else if (d.op.kind === "shape") {
      d.op.to = e.shiftKey && d.op.shape !== "line" ? { x: d.start.x + Math.sign(p.x - d.start.x) * Math.max(Math.abs(p.x - d.start.x), Math.abs(p.y - d.start.y)), y: d.start.y + Math.sign(p.y - d.start.y) * Math.max(Math.abs(p.x - d.start.x), Math.abs(p.y - d.start.y)) } : p;
      const c = liveCtx(); if (c) { c.clearRect(0, 0, width, height); drawOp(c, d.op); }
    }
  };

  const up = () => {
    const d = drawing.current; drawing.current = null; clearLive();
    if (!d) return;
    if (tool === "move") { if (d.moved && d.moved !== d.op) onMove(d.moved); else redraw(); return; }
    if (d.op.kind === "stroke" && d.op.points.length === 1) d.op.points.push({ x: d.op.points[0].x + 0.5, y: d.op.points[0].y });
    onOp(d.op);
  };

  const cursorCls = tool === "move" ? "cursor-move" : tool === "text" ? "cursor-text" : tool === "fill" ? "cursor-cell" : "cursor-crosshair";

  return (
    <div ref={wrap} className="relative w-full select-none" style={{ aspectRatio: `${width} / ${height}` }}>
      <div className="absolute left-0 top-0 origin-top-left overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-line" style={{ width, height, transform: `scale(${scale})` }}>
        <canvas ref={tplRef} width={width} height={height} className="absolute inset-0" />
        <canvas ref={artRef} width={width} height={height} className="absolute inset-0" />
        <canvas
          ref={liveRef} width={width} height={height}
          className={`absolute inset-0 touch-none ${cursorCls}`}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={() => { onCursor(null); if (drawing.current) up(); }}
          onContextMenu={(e) => e.preventDefault()}
        />
        {/* เคอร์เซอร์ของเพื่อนร่วมวาด */}
        {others.filter((o) => o.cursor).map((o) => (
          <div key={o.id} className="pointer-events-none absolute z-10 -translate-x-1 -translate-y-1 transition-transform duration-75" style={{ left: o.cursor!.x, top: o.cursor!.y }}>
            <span className="block size-3 rounded-full ring-2 ring-white" style={{ background: o.color }} />
            <span className="mt-0.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] text-white shadow" style={{ background: o.color }}>{o.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
});
