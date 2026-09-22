// 🎨 Garden Canvas — relay server สำหรับห้องวาดร่วมกัน (real-time)
// รัน: npm run canvas-server  (พอร์ต 3003)  · เด็ก/ผู้ปกครองเปิดเว็บด้วย IP ของเครื่องครูใน Wi-Fi เดียวกัน
// เก็บ ops ล่าสุดของแต่ละห้องในหน่วยความจำ เพื่อให้คนเข้าใหม่เห็นภาพเดิม
import { WebSocketServer } from "ws";

const PORT = Number(process.env.CANVAS_WS_PORT || 3003);
const wss = new WebSocketServer({ port: PORT });
/** room → { clients:Set<ws>, ops:[], title, template } */
const rooms = new Map();

const roomOf = (req) => new URL(req.url, "http://x").searchParams.get("room") || "lobby";
const get = (room) => { if (!rooms.has(room)) rooms.set(room, { clients: new Set(), ops: [], title: undefined, template: undefined }); return rooms.get(room); };

wss.on("connection", (ws, req) => {
  const room = roomOf(req); const R = get(room); R.clients.add(ws); let who = null;
  const bcast = (msg) => { const s = JSON.stringify(msg); for (const c of R.clients) if (c !== ws && c.readyState === 1) c.send(s); };

  ws.on("message", (raw) => {
    let m; try { m = JSON.parse(raw.toString()); } catch { return; }
    switch (m.t) {
      case "hello": who = m.who?.id; if (R.ops.length === 0 && m.ops?.length) R.ops = m.ops; ws.send(JSON.stringify({ t: "state", room, ops: R.ops, title: R.title, template: R.template })); bcast(m); break;
      case "op": { const i = R.ops.findIndex((o) => o.id === m.op.id); if (i >= 0) R.ops[i] = m.op; else R.ops.push(m.op); bcast(m); break; }
      case "undo": R.ops = R.ops.filter((o) => o.id !== m.opId); bcast(m); break;
      case "clear": R.ops = []; bcast(m); break;
      case "meta": if (m.title) R.title = m.title; if (m.template) R.template = m.template; bcast(m); break;
      case "state": R.ops = m.ops; bcast(m); break;
      default: bcast(m);
    }
  });
  ws.on("close", () => { R.clients.delete(ws); if (who) bcast({ t: "bye", room, who }); if (R.clients.size === 0) setTimeout(() => { if (R.clients.size === 0) rooms.delete(room); }, 30 * 60 * 1000); });
});

console.log(`🎨 Garden Canvas relay: ws://0.0.0.0:${PORT}  (ห้องจะถูกล้างหลังว่าง 30 นาที)`);
