import type { CanvasOp, CanvasTemplateId, Pt } from "@/types/canvas";

/* ---------- แม่แบบพื้นหลัง (วาดใต้ผลงาน ลบไม่ได้) ---------- */
export const CANVAS_TEMPLATES: { id: CanvasTemplateId; emoji: string; title: string; description: string }[] = [
  { id: "blank", emoji: "⬜", title: "กระดาษเปล่า", description: "วาดภาพตามจินตนาการ" },
  { id: "garden", emoji: "🌳", title: "สวนของเรา", description: "ช่วยกันเติมต้นไม้ ดอกไม้ ผีเสื้อ" },
  { id: "trace-lines", emoji: "〰️", title: "ลากเส้นตามรอย", description: "เส้นตรง โค้ง ซิกแซก" },
  { id: "trace-numbers", emoji: "🔢", title: "ฝึกเขียนตัวเลข", description: "1 – 5 ตามรอยประ" },
  { id: "trace-letters", emoji: "🔤", title: "ฝึกเขียนตัวอักษร", description: "ก ข ค ง จ" },
  { id: "color-in", emoji: "🌈", title: "เติมสีให้ภาพ", description: "รูปทรงง่าย ๆ ให้ระบายสี" },
  { id: "house", emoji: "🏠", title: "บ้านในฝัน", description: "เติมบ้าน ครอบครัว และสิ่งรอบตัว" },
  { id: "story", emoji: "📖", title: "ภาพประกอบนิทาน", description: "ช่องสี่เหลี่ยม 2 ช่อง เล่าเรื่อง" },
];

const dashed = (ctx: CanvasRenderingContext2D, fn: () => void, color = "#b9a7d6") => {
  ctx.save(); ctx.setLineDash([10, 10]); ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.lineCap = "round"; fn(); ctx.restore();
};
const bigText = (ctx: CanvasRenderingContext2D, t: string, x: number, y: number, size: number, color = "#d9cdee") => {
  ctx.save(); ctx.font = `${size}px Mitr, Sarabun, sans-serif`; ctx.fillStyle = color; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(t, x, y); ctx.restore();
};

export function drawTemplate(ctx: CanvasRenderingContext2D, id: CanvasTemplateId, W: number, H: number) {
  ctx.save();
  switch (id) {
    case "garden": {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#e3f0fb"); g.addColorStop(0.7, "#f6fbff"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#dff3e6"; ctx.beginPath(); ctx.ellipse(W / 2, H, W * 0.75, H * 0.3, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = "#fff1bf"; ctx.beginPath(); ctx.arc(W - 90, 90, 48, 0, Math.PI * 2); ctx.fill();
      bigText(ctx, "🌱 สวนของเรา", W / 2, 50, 30, "#8b6cc2");
      break;
    }
    case "trace-lines": {
      const rows = 4; const gap = H / (rows + 1);
      for (let i = 1; i <= rows; i++) {
        const y = gap * i;
        dashed(ctx, () => {
          ctx.beginPath();
          if (i === 1) { ctx.moveTo(60, y); ctx.lineTo(W - 60, y); }
          if (i === 2) { ctx.moveTo(60, y); for (let x = 60; x <= W - 60; x += 40) ctx.lineTo(x, y + ((x / 40) % 2 ? -30 : 30)); }
          if (i === 3) { ctx.moveTo(60, y); ctx.bezierCurveTo(W * 0.3, y - 60, W * 0.7, y + 60, W - 60, y); }
          if (i === 4) { for (let x = 60; x <= W - 60; x += 100) { ctx.moveTo(x + 60, y); ctx.arc(x + 30, y, 30, 0, Math.PI * 2); } }
          ctx.stroke();
        });
        ctx.fillStyle = "#8b6cc2"; ctx.beginPath(); ctx.arc(60, y, 8, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case "trace-numbers": { ["1", "2", "3", "4", "5"].forEach((n, i) => { bigText(ctx, n, ((i + 0.5) * W) / 5, H * 0.32, H * 0.42); dashed(ctx, () => { ctx.beginPath(); ctx.moveTo(((i + 0.1) * W) / 5, H * 0.78); ctx.lineTo(((i + 0.9) * W) / 5, H * 0.78); ctx.stroke(); }); }); break; }
    case "trace-letters": { ["ก", "ข", "ค", "ง", "จ"].forEach((n, i) => { bigText(ctx, n, ((i + 0.5) * W) / 5, H * 0.32, H * 0.42); dashed(ctx, () => { ctx.beginPath(); ctx.moveTo(((i + 0.1) * W) / 5, H * 0.78); ctx.lineTo(((i + 0.9) * W) / 5, H * 0.78); ctx.stroke(); }); }); break; }
    case "color-in": {
      ctx.strokeStyle = "#5b4a7a"; ctx.lineWidth = 5; ctx.lineJoin = "round";
      const cx = W / 2, cy = H / 2;
      ctx.beginPath(); ctx.arc(cx, cy - 20, 80, 0, Math.PI * 2); ctx.stroke(); // หน้า
      ctx.beginPath(); ctx.arc(cx - 28, cy - 40, 10, 0, Math.PI * 2); ctx.arc(cx + 28, cy - 40, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy - 10, 40, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * 130, cy - 20 + Math.sin(a) * 130, 40, 24, a, 0, Math.PI * 2); ctx.stroke(); } // กลีบ
      ctx.beginPath(); ctx.moveTo(cx, cy + 60); ctx.lineTo(cx, H - 40); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx - 50, H - 90, 50, 22, -0.5, 0, Math.PI * 2); ctx.stroke();
      break;
    }
    case "house": {
      ctx.fillStyle = "#f6fbff"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = "#e2f5ec"; ctx.fillRect(0, H * 0.72, W, H * 0.28);
      dashed(ctx, () => { const x = W / 2 - 140, y = H * 0.72; ctx.beginPath(); ctx.rect(x, y - 180, 280, 180); ctx.moveTo(x - 20, y - 180); ctx.lineTo(x + 140, y - 300); ctx.lineTo(x + 300, y - 180); ctx.moveTo(x + 110, y); ctx.lineTo(x + 110, y - 90); ctx.lineTo(x + 170, y - 90); ctx.lineTo(x + 170, y); ctx.stroke(); });
      bigText(ctx, "🏠 บ้านในฝันของหนู", W / 2, 46, 28, "#8b6cc2");
      break;
    }
    case "story": {
      ctx.strokeStyle = "#c9b8e8"; ctx.lineWidth = 4; const m = 40, g = 30, w = (W - m * 2 - g) / 2;
      [0, 1].forEach((i) => { const x = m + i * (w + g); ctx.strokeRect(x, 90, w, H - 90 - m - 60); bigText(ctx, `${i + 1}`, x + 26, 116, 26, "#8b6cc2"); dashed(ctx, () => { ctx.beginPath(); ctx.moveTo(x, H - m - 20); ctx.lineTo(x + w, H - m - 20); ctx.stroke(); }, "#d9cdee"); });
      bigText(ctx, "📖 นิทานของเรา", W / 2, 50, 28, "#8b6cc2");
      break;
    }
  }
  ctx.restore();
}

/* ---------- วาด op ---------- */
export function drawOp(ctx: CanvasRenderingContext2D, op: CanvasOp) {
  ctx.save();
  if (op.kind === "stroke") {
    if (op.points.length === 0) { ctx.restore(); return; }
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = op.size; ctx.strokeStyle = op.color;
    if (op.tool === "eraser") ctx.globalCompositeOperation = "destination-out";
    if (op.tool === "brush") { ctx.globalAlpha = 0.55; ctx.shadowColor = op.color; ctx.shadowBlur = op.size * 0.6; }
    ctx.beginPath(); ctx.moveTo(op.points[0].x, op.points[0].y);
    if (op.points.length === 1) ctx.lineTo(op.points[0].x + 0.01, op.points[0].y);
    for (let i = 1; i < op.points.length - 1; i++) { const p = op.points[i], n = op.points[i + 1]; ctx.quadraticCurveTo(p.x, p.y, (p.x + n.x) / 2, (p.y + n.y) / 2); }
    const last = op.points[op.points.length - 1]; ctx.lineTo(last.x, last.y); ctx.stroke();
  } else if (op.kind === "shape") {
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = op.size; ctx.strokeStyle = op.color;
    const { from: a, to: b } = op; const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y), w = Math.abs(b.x - a.x), h = Math.abs(b.y - a.y);
    ctx.beginPath();
    if (op.shape === "line") { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
    else if (op.shape === "rect") ctx.rect(x, y, w, h);
    else if (op.shape === "ellipse") ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    else if (op.shape === "triangle") { ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath(); }
    else if (op.shape === "star") { const cx = x + w / 2, cy = y + h / 2, R = Math.min(w, h) / 2, r = R * 0.45; for (let i = 0; i < 10; i++) { const rad = i % 2 ? r : R; const ang = (Math.PI / 5) * i - Math.PI / 2; ctx.lineTo(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad); } ctx.closePath(); }
    if (op.fill && op.shape !== "line") { ctx.fillStyle = op.fill; ctx.fill(); }
    ctx.stroke();
  } else if (op.kind === "text") {
    ctx.font = `${op.size}px ${op.font ?? "Mitr"}, Sarabun, sans-serif`; ctx.fillStyle = op.color; ctx.textBaseline = "top";
    op.text.split("\n").forEach((l, i) => ctx.fillText(l, op.at.x, op.at.y + i * op.size * 1.25));
  } else if (op.kind === "image") {
    const img = imageCache.get(op.src);
    if (img?.complete) ctx.drawImage(img, op.x, op.y, op.w, op.h);
  } else if (op.kind === "fill") {
    floodFill(ctx, op.at, op.color);
  }
  ctx.restore();
}

const imageCache = new Map<string, HTMLImageElement>();
/** โหลดรูปของ op image ล่วงหน้า (คืน true ถ้าต้องวาดใหม่หลังโหลดเสร็จ) */
export function preloadImages(ops: CanvasOp[], onLoaded: () => void) {
  for (const op of ops) {
    if (op.kind !== "image" || imageCache.has(op.src)) continue;
    const img = new Image(); img.onload = onLoaded; img.src = op.src; imageCache.set(op.src, img);
  }
}

/** เทสี (flood fill) บนพิกเซลปัจจุบัน — ใช้ค่าความต่างสีเล็กน้อยเพื่อเก็บขอบ anti-alias */
export function floodFill(ctx: CanvasRenderingContext2D, at: Pt, color: string) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const sx = Math.floor(at.x), sy = Math.floor(at.y);
  if (sx < 0 || sy < 0 || sx >= W || sy >= H) return;
  const img = ctx.getImageData(0, 0, W, H); const d = img.data;
  const idx = (sy * W + sx) * 4; const tr = d[idx], tg = d[idx + 1], tb = d[idx + 2], ta = d[idx + 3];
  const c = hexToRgb(color); if (!c) return;
  if (Math.abs(tr - c[0]) + Math.abs(tg - c[1]) + Math.abs(tb - c[2]) < 6 && ta === 255) return;
  const tol = 40; const seen = new Uint8Array(W * H); const stack = [sx, sy];
  const match = (i: number) => Math.abs(d[i] - tr) + Math.abs(d[i + 1] - tg) + Math.abs(d[i + 2] - tb) + Math.abs(d[i + 3] - ta) <= tol;
  while (stack.length) {
    const y = stack.pop()!, x = stack.pop()!;
    let xl = x; while (xl >= 0 && !seen[y * W + xl] && match((y * W + xl) * 4)) xl--;
    let xr = x; while (xr < W && !seen[y * W + xr] && match((y * W + xr) * 4)) xr++;
    for (let i = xl + 1; i < xr; i++) {
      const p = y * W + i; seen[p] = 1; const q = p * 4; d[q] = c[0]; d[q + 1] = c[1]; d[q + 2] = c[2]; d[q + 3] = 255;
      if (y > 0 && !seen[p - W] && match((p - W) * 4)) stack.push(i, y - 1);
      if (y < H - 1 && !seen[p + W] && match((p + W) * 4)) stack.push(i, y + 1);
    }
  }
  ctx.putImageData(img, 0, 0);
}
const hexToRgb = (h: string) => { const m = /^#?([0-9a-f]{6})$/i.exec(h); if (!m) return null; const n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const; };

/** วาดทั้งหมด: แม่แบบ (บน layer แยก) + ops ตามลำดับ */
export function renderAll(ctx: CanvasRenderingContext2D, ops: CanvasOp[], W: number, H: number) {
  ctx.clearRect(0, 0, W, H);
  for (const op of ops) drawOp(ctx, op);
}

/** ตรวจว่าจุดอยู่บนรูป/ข้อความไหน (ตัวบนสุดก่อน) สำหรับเครื่องมือย้าย */
export function hitTest(ops: CanvasOp[], p: Pt, ctx?: CanvasRenderingContext2D): CanvasOp | null {
  for (let i = ops.length - 1; i >= 0; i--) {
    const op = ops[i];
    if (op.kind === "image" && p.x >= op.x && p.x <= op.x + op.w && p.y >= op.y && p.y <= op.y + op.h) return op;
    if (op.kind === "text") {
      let w = op.text.length * op.size * 0.6; if (ctx) { ctx.save(); ctx.font = `${op.size}px ${op.font ?? "Mitr"}, Sarabun`; w = Math.max(...op.text.split("\n").map((l) => ctx.measureText(l).width)); ctx.restore(); }
      const h = op.text.split("\n").length * op.size * 1.25;
      if (p.x >= op.at.x && p.x <= op.at.x + w && p.y >= op.at.y && p.y <= op.at.y + h) return op;
    }
  }
  return null;
}

/** ย้าย op รูป/ข้อความ */
export function moveOp(op: CanvasOp, dx: number, dy: number): CanvasOp {
  if (op.kind === "image") return { ...op, x: op.x + dx, y: op.y + dy };
  if (op.kind === "text") return { ...op, at: { x: op.at.x + dx, y: op.at.y + dy } };
  return op;
}
