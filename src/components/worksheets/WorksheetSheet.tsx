import type { Worksheet, WorksheetTemplate } from "@/types";
import { SITE } from "@/lib/site";

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
            <img src="/logo.webp" alt="" className="size-12 shrink-0 rounded-full object-cover" />
            <div>
            <p className="text-[11px] tracking-wide text-[#777]">{SITE.brand} · {SITE.name} · {SITE.credit}</p>
            <h1 className="mt-0.5 font-display text-[22px] leading-tight text-[#222]">{worksheet.emoji} {worksheet.title}</h1>
            </div>
          </div>
          <div className="shrink-0 text-[12px] text-[#555]">
            <p>ชื่อ ________________________</p>
            <p className="mt-1.5">วันที่ ______________</p>
          </div>
        </div>
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
        <div>
          {t.hint && <p className="mb-2 text-[13px] text-[#666]">{t.hint}</p>}
          <div className="grid grid-cols-2 gap-x-6">
            {t.rows.map((ch, i) => (
              <div key={i} className="trace-row">
                <span className="trace-solid">{ch}</span>
                {Array.from({ length: rep }, (_, j) => <span key={j} className="trace-ghost">{ch}</span>)}
                <span className="trace-blank" />
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "count":
      return (
        <div className="grid gap-3">
          {t.groups.map((g, i) => (
            <div key={i} className="flex items-center justify-between gap-4 rounded-xl border border-[#ccc] px-4 py-3">
              <span className="text-[34px] leading-none tracking-wide">{g.emoji.repeat(g.count)}</span>
              <span className="flex gap-2">
                {t.choices.map((c) => (
                  <span key={c} className="grid size-10 place-items-center rounded-full border-2 border-[#999] font-display text-[20px]">{c}</span>
                ))}
              </span>
            </div>
          ))}
        </div>
      );
    case "match":
      return (
        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-x-4">
          <div className="grid gap-3">
            {t.left.map((l, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-[#ccc] px-4 py-3">
                <span className="text-[34px] leading-none">{l}</span>
                <span className="size-3 rounded-full bg-[#333]" />
              </div>
            ))}
          </div>
          <div className="w-16" />
          <div className="grid gap-3">
            {t.right.map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-[#ccc] px-4 py-3">
                <span className="size-3 rounded-full bg-[#333]" />
                <span className="text-[34px] leading-none">{r}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case "color":
      return (
        <div>
          <p className="mb-3 text-[13px] text-[#666]">🎨 {t.prompt}</p>
          <div className="grid grid-cols-2 gap-4">
            {t.items.map((it, i) => (
              <div key={i} className="flex flex-col items-center rounded-2xl border-2 border-[#ddd] py-5">
                <span className="emoji-outline text-[96px] leading-none">{it.emoji}</span>
                <span className="mt-2 text-[14px] text-[#555]">{it.label}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case "odd":
      return (
        <div className="grid gap-4">
          {t.rows.map((row, i) => (
            <div key={i} className="flex items-center justify-around rounded-xl border border-[#ccc] px-3 py-4">
              {row.map((c, j) => <span key={j} className="text-[40px] leading-none tracking-wide">{c}</span>)}
            </div>
          ))}
        </div>
      );
    case "sequence":
      return (
        <div className="grid grid-cols-5 gap-3">
          {t.scenes.map((s, i) => (
            <div key={i} className="flex flex-col items-center rounded-xl border border-[#ccc] p-3">
              <span className="text-[38px] leading-tight">{s.emoji}</span>
              {s.label && <span className="mt-1 text-[12px] text-[#555]">{s.label}</span>}
              <span className="mt-2 size-10 rounded-lg border-2 border-[#999]" />
            </div>
          ))}
        </div>
      );
    case "blank":
      return (
        <div>
          <p className="font-display text-[18px]">{t.prompt}</p>
          <div className="mt-4 h-64 rounded-2xl border-2 border-dashed border-[#bbb]" />
          <div className="mt-4 grid gap-6">
            {Array.from({ length: t.lines ?? 3 }, (_, i) => <div key={i} className="h-px bg-[#999]" />)}
          </div>
        </div>
      );
    case "grid-copy":
      return (
        <div className="mx-auto grid w-fit gap-1 rounded-xl border-2 border-[#ccc] p-2" style={{ gridTemplateColumns: `repeat(${t.size}, 1fr)` }}>
          {t.source.map((c, i) => (
            <span key={i} className="grid size-16 place-items-center rounded-md border border-[#e5e5e5] text-[34px] leading-none">
              {c === "⬜" ? "" : c === "⬛" ? <span className="block size-full rounded-md bg-[#333]" /> : c}
            </span>
          ))}
        </div>
      );
  }
}
