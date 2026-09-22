import type { Worksheet, WorksheetTemplate } from "@/types";
import { SITE } from "@/lib/site";
import { VehicleIcon } from "./VehicleIcon";

/**
 * เรนเดอร์ใบงานเป็นหน้ากระดาษ A4 (ใช้ทั้งดูตัวอย่างและพิมพ์)
 * ใช้สีดำ/เทาเป็นหลักเพื่อประหยัดหมึกและให้เด็กระบายสีได้
 */
export function WorksheetSheet({ worksheet, compact = false }: { worksheet: Worksheet; compact?: boolean }) {
  return (
    <div className={`sheet mx-auto bg-white text-[#222] ${compact ? "sheet-compact" : ""}`}>
      <header className="sheet-header">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-lpg.webp" alt="" className="size-12 shrink-0 rounded-full object-cover" />
            <div>
            <p className="text-[11px] tracking-wide text-[#777]">{SITE.brand} · {SITE.name} · {SITE.credit}</p>
            <h1 className="mt-0.5 font-display text-[22px] leading-tight text-[#222]">{worksheet.emoji} {worksheet.title}</h1>
            </div>
          </div>
          <div className="shrink-0 text-[12px] text-[#555]">
            <p>วันที่ ______________</p>
          </div>
        </div>
        <p className="mt-3 flex gap-x-4 text-[14px] leading-8 text-[#333]">
          <span className="flex flex-[3] items-end gap-1">ชื่อ<span className="flex-1 border-b border-dotted border-[#555]" /></span>
          <span className="flex flex-[3] items-end gap-1">นามสกุล<span className="flex-1 border-b border-dotted border-[#555]" /></span>
          <span className="flex flex-[1.2] items-end gap-1">ห้อง<span className="flex-1 border-b border-dotted border-[#555]" /></span>
        </p>
        <p className="mt-2 rounded-lg border border-dashed border-[#bbb] px-3 py-1.5 text-[13px] text-[#444]">
          📌 {worksheet.instructions[0] ?? worksheet.description}
        </p>
      </header>

      <div className="sheet-body">
        {worksheet.template ? <Template t={worksheet.template} /> : (
          <p className="py-16 text-center text-[#888]">ใบงานนี้ใช้ไฟล์แนบ — กดปุ่มดูตัวอย่างเพื่อเปิดไฟล์</p>
        )}
      </div>

      <footer className="sheet-footer">
        <span>⭐ เก่งมาก!</span>
        <span>ครูตรวจ ________</span>
      </footer>
    </div>
  );
}

function Template({ t }: { t: WorksheetTemplate }) {
  switch (t.kind) {
    case "trace": {
      const rep = t.repeat ?? 3;
      return (
        <div className="fill-col">
          {t.hint && <p className="mb-2 text-[13px] text-[#666]">{t.hint}</p>}
          <div className="fill grid grid-cols-1" style={{ gridAutoRows: "1fr" }}>
            {t.rows.map((ch, i) => (
              <div key={i} className="trace-row">
                <span className="trace-solid">{ch}</span>
                {Array.from({ length: Math.max(rep, 4) }, (_, j) => <span key={j} className="trace-ghost">{ch}</span>)}
                <span className="trace-blank" />
                <span className="trace-blank" />
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "count":
      return (
        <div className="fill grid gap-4" style={{ gridAutoRows: "1fr" }}>
          {t.groups.map((g, i) => (
            <div key={i} className="flex items-center justify-between gap-4 rounded-2xl border-2 border-[#ccc] px-6 py-3">
              <span className={g.count >= 5 ? "text-[42px] leading-none tracking-wide" : g.count === 4 ? "text-[50px] leading-none tracking-wide" : "text-[56px] leading-none tracking-wider"}>{g.emoji.repeat(g.count)}</span>
              <span className="flex gap-3">
                {t.choices.map((c) => (
                  <span key={c} className="grid size-14 place-items-center rounded-full border-[3px] border-[#999] font-display text-[28px]">{c}</span>
                ))}
              </span>
            </div>
          ))}
        </div>
      );
    case "match":
      return (
        <div className="fill grid grid-cols-[1fr_auto_1fr] items-stretch gap-x-4">
          <div className="grid gap-4" style={{ gridAutoRows: "1fr" }}>
            {t.left.map((l, i) => (
              <div key={i} className="flex items-center justify-between rounded-2xl border-2 border-[#ccc] px-6 py-3">
                <span className="text-[56px] leading-none">{l}</span>
                <span className="size-4 rounded-full bg-[#333]" />
              </div>
            ))}
          </div>
          <div className="w-24" />
          <div className="grid gap-4" style={{ gridAutoRows: "1fr" }}>
            {t.right.map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-2xl border-2 border-[#ccc] px-6 py-3">
                <span className="size-4 rounded-full bg-[#333]" />
                <span className="text-[56px] leading-none">{r}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case "color":
      return (
        <div className="fill-col">
          <p className="mb-3 text-[13px] text-[#666]">🎨 {t.prompt}</p>
          <div className="fill grid grid-cols-2 gap-4" style={{ gridAutoRows: "1fr" }}>
            {t.items.map((it, i) => (
              <div key={i} className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#ddd] py-5">
                <span className="emoji-outline text-[140px] leading-none">{it.emoji}</span>
                <span className="mt-2 text-[16px] text-[#555]">{it.label}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case "odd":
      return (
        <div className="fill grid gap-4" style={{ gridAutoRows: "1fr" }}>
          {t.rows.map((row, i) => (
            <div key={i} className="flex items-center justify-around rounded-2xl border-2 border-[#ccc] px-3 py-4">
              {row.map((c, j) => <span key={j} className="text-[64px] leading-none tracking-wide">{c}</span>)}
            </div>
          ))}
        </div>
      );
    case "sequence":
      return (
        <div className="fill grid grid-cols-5 gap-3">
          {t.scenes.map((s, i) => (
            <div key={i} className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#ccc] p-3">
              <span className="text-[64px] leading-tight">{s.emoji}</span>
              {s.label && <span className="mt-2 text-[14px] text-[#555]">{s.label}</span>}
              <span className="mt-4 size-16 rounded-xl border-[3px] border-[#999]" />
            </div>
          ))}
        </div>
      );
    case "blank":
      return (
        <div className="fill-col">
          <p className="font-display text-[20px]">{t.prompt}</p>
          <div className="mt-4 flex-1 rounded-2xl border-2 border-dashed border-[#bbb]" />
          <div className="mt-6 grid gap-10">
            {Array.from({ length: t.lines ?? 3 }, (_, i) => <div key={i} className="h-px bg-[#999]" />)}
          </div>
        </div>
      );
    case "match-color":
      return (
        <div className="fill grid grid-cols-[1fr_auto_1fr] items-stretch">
          <div className="grid" style={{ gridAutoRows: "1fr" }}>
            {t.colors.map((c, i) => (
              <div key={i} className="flex items-center justify-between pr-2">
                <VehicleIcon kind={t.icon} color={c.hex} size={112} />
                <span className="size-4 rounded-full bg-[#222]" />
              </div>
            ))}
          </div>
          <div className="w-36" />
          <div className="grid" style={{ gridAutoRows: "1fr" }}>
            {t.order.map((idx, i) => (
              <div key={i} className="flex items-center justify-between pl-2">
                <span className="size-4 rounded-full bg-[#222]" />
                <span className="size-16 rounded-full" style={{ background: t.colors[idx].hex }} aria-label={t.colors[idx].name} />
              </div>
            ))}
          </div>
        </div>
      );
    case "path": {
      const cells = Array.from({ length: t.size * t.size }, (_, i) => [i % t.size, Math.floor(i / t.size)] as const);
      return (
        <div>
          <p className="mb-3 text-[15px] text-[#333]">✏️ {t.prompt}</p>
          <div className="mx-auto grid w-full max-w-[120mm] gap-1 rounded-2xl border-2 border-[#333] p-2" style={{ gridTemplateColumns: `repeat(${t.size}, 1fr)` }}>
            {cells.map(([c, r], i) => { const ob = (t.obstacles ?? []).some(([oc, or]) => oc === c && or === r); const isA = t.start[0] === c && t.start[1] === r; const isG = t.target[0] === c && t.target[1] === r; return <span key={i} className="grid aspect-square place-items-center rounded-lg border border-[#999] text-[40px] leading-none">{ob ? "🌳" : isA ? t.actor : isG ? t.goal : ""}</span>; })}
          </div>
          <p className="mt-4 text-[14px] text-[#333]">🔘 วงกลมคำสั่งที่ใช้ (เรียงตามลำดับ) / ✂️ ตัดเป็นบัตรคำสั่งได้</p>
          <div className="mt-2 flex flex-wrap gap-2">{t.commands.map((c, i) => <span key={i} className="grid h-14 min-w-14 place-items-center rounded-xl border-2 border-dashed border-[#666] px-2 text-[28px]">{c}</span>)}</div>
          <p className="mt-4 text-[14px] text-[#333]">📝 เขียนคำสั่งเรียงตามลำดับ:</p>
          <div className="mt-2 flex flex-wrap gap-2">{Array.from({ length: Math.max(6, t.commands.length) }, (_, i) => <span key={i} className="grid size-14 place-items-center rounded-xl border-2 border-[#333] text-[12px] text-[#999]">{i + 1}</span>)}</div>
        </div>
      );
    }
    case "commands": {
      const cells = Array.from({ length: t.size * t.size }, (_, i) => [i % t.size, Math.floor(i / t.size)] as const);
      return (
        <div>
          <p className="mb-3 text-[15px] text-[#333]">✏️ {t.prompt}</p>
          <div className="flex flex-col items-start gap-6 sm:flex-row">
            <div className="grid w-full max-w-[90mm] shrink-0 gap-1 rounded-2xl border-2 border-[#333] p-2" style={{ gridTemplateColumns: `repeat(${t.size}, 1fr)` }}>
              {cells.map(([c, r], i) => { const ob = (t.obstacles ?? []).some(([oc, or]) => oc === c && or === r); const isA = t.start[0] === c && t.start[1] === r; const isG = t.target[0] === c && t.target[1] === r; return <span key={i} className="grid aspect-square place-items-center rounded-lg border border-[#999] text-[36px] leading-none">{ob ? "🌳" : isA ? t.actor : isG ? t.goal : ""}</span>; })}
            </div>
            <div className="flex-1">
              <p className="text-[14px] text-[#333]">คำสั่ง:</p>
              <div className="mt-2 flex flex-wrap gap-2">{t.sequence.map((c, i) => <span key={i} className={`grid size-16 place-items-center rounded-xl border-2 text-[30px] ${c === "❓" ? "border-dashed border-[#333] bg-[#f5f5f5]" : "border-[#666]"}`}>{c}</span>)}</div>
              <p className="mt-4 text-[14px] text-[#333]">ตัวเลือก (วงกลมคำตอบ):</p>
              <div className="mt-2 flex flex-wrap gap-3">{t.choices.map((c, i) => <span key={i} className="grid size-14 place-items-center rounded-full border-2 border-[#333] text-[28px]">{c}</span>)}</div>
            </div>
          </div>
        </div>
      );
    }
    case "pattern-sheet":
      return (
        <div className="space-y-3">
          <p className="text-[15px] text-[#333]">✏️ ดูแบบแผน แล้ววาด/เขียนช่องว่างให้ต่อกัน</p>
          {t.rows.map((row, i) => <div key={i} className="flex flex-wrap gap-2">{row.map((c, j) => <span key={j} className={`grid size-16 place-items-center rounded-xl border-2 text-[30px] ${c ? "border-[#999]" : "border-dashed border-[#333] bg-[#fafafa]"}`}>{c}</span>)}</div>)}
        </div>
      );
    case "qa":
      return (
        <ol className="space-y-5">
          {t.items.map((it, i) => (
            <li key={i} className="text-[15px] text-[#222]">
              <p className="font-medium">{i + 1}. {it.q}</p>
              {it.code && <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-[#bbb] bg-[#f7f7f7] p-3 font-mono text-[13px] leading-relaxed">{it.code}</pre>}
              <div className="mt-2 space-y-3">{Array.from({ length: it.lines }, (_, k) => <div key={k} className="h-7 border-b border-dotted border-[#666]" />)}</div>
            </li>
          ))}
        </ol>
      );
    case "grid-copy":
      return (
        <div className="mx-auto grid w-full max-w-[150mm] gap-1.5 rounded-2xl border-2 border-[#ccc] p-3" style={{ gridTemplateColumns: `repeat(${t.size}, 1fr)` }}>
          {t.source.map((c, i) => (
            <span key={i} className="grid aspect-square place-items-center rounded-lg border border-[#e5e5e5] text-[56px] leading-none">
              {c === "⬜" ? "" : c === "⬛" ? <span className="block size-full rounded-md bg-[#333]" /> : c}
            </span>
          ))}
        </div>
      );
  }
}
