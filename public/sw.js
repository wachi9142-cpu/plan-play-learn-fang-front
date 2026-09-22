/* 💜 Little Purple Garden — Service Worker (PWA / เล่นเกมออฟไลน์)
 * กลยุทธ์: network-first ทุกอย่าง (ออนไลน์ได้ของใหม่เสมอ) · ออฟไลน์ใช้จากแคช
 * "ดาวน์โหลดเกม" = หน้าเว็บส่งรายการ URL ของหน้าเกม + ไฟล์ที่ต้องใช้มาให้แคชไว้ จนกว่าผู้ใช้จะกดลบ
 */
const CACHE = "lpg-offline-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("message", (e) => {
  const d = e.data || {};
  if (d.type === "CACHE_URLS") {
    e.waitUntil((async () => {
      const c = await caches.open(CACHE); let size = 0; let ok = 0;
      for (const u of d.urls) {
        try { const r = await fetch(u, { credentials: "same-origin", cache: "no-cache" }); if (r.ok) { size += (await r.clone().blob()).size; await c.put(u, r); ok++; } } catch { /* ข้าม */ }
      }
      e.source && e.source.postMessage({ type: "CACHED", id: d.id, size, ok, total: d.urls.length });
    })());
  }
  if (d.type === "UNCACHE_URLS") {
    e.waitUntil((async () => { const c = await caches.open(CACHE); for (const u of d.urls) await c.delete(u); e.source && e.source.postMessage({ type: "UNCACHED", id: d.id }); })());
  }
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;
  const font = /fonts\.(googleapis|gstatic)\.com$/.test(url.host);
  if (!same && !font) return;
  if (same && (url.pathname.startsWith("/_next/webpack-hmr") || url.pathname.includes("__nextjs") || url.pathname.startsWith("/api/"))) return;

  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    try {
      const r = await fetch(req);
      // เก็บหน้าที่เคยเปิด + ไฟล์ static + ฟอนต์ ไว้ใช้ตอนออฟไลน์
      if (r.ok && (req.mode === "navigate" || url.pathname.startsWith("/_next/static/") || font || /\.(png|jpg|jpeg|webp|svg|ico|woff2?|ttf|otf|json|webmanifest)$/.test(url.pathname))) c.put(req, r.clone());
      return r;
    } catch {
      const m = (await c.match(req)) || (await c.match(url.pathname)) || (req.mode === "navigate" ? await c.match("/offline") : undefined);
      return m || new Response(req.mode === "navigate" ? "<h1>ออฟไลน์อยู่ค่ะ</h1><p>หน้านี้ยังไม่ได้ดาวน์โหลดไว้ในเครื่อง</p>" : "", { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } });
    }
  })());
});
