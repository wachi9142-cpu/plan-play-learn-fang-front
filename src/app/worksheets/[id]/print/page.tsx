import { notFound } from "next/navigation";
import { WORKSHEETS, getWorksheet } from "@/data/worksheets";
import { PrintTrigger, WorksheetSheet } from "@/components/worksheets";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return WORKSHEETS.map((w) => ({ id: w.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return { title: `พิมพ์ · ${getWorksheet(id)?.title ?? "ใบงาน"}` };
}

/** หน้าพิมพ์ใบงาน — ไม่มี header/footer ของเว็บ (ดู layout.tsx ในโฟลเดอร์นี้) */
export default async function WorksheetPrintPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const w = getWorksheet(id);
  if (!w) notFound();
  return (
    <div className="min-h-dvh bg-[#eee] px-2 py-4 print:bg-white print:p-0">
      <PrintTrigger />
      <div className="sheet-viewport">
        <WorksheetSheet worksheet={w} />
      </div>
    </div>
  );
}
