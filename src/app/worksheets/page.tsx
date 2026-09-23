import type { Metadata } from "next";
import { Suspense } from "react";
import { WORKSHEETS, WORKSHEET_CATEGORIES, allWorksheetTags } from "@/data/worksheets";
import { PageHeader, Tag } from "@/components/ui";
import { WorksheetLibrary } from "@/components/worksheets";

export const metadata: Metadata = { title: "ใบงาน" };

export default function WorksheetsPage() {
  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader emoji="📝" image="/worksheets/cover.webp" title="คลังใบงาน" description="ใบงานสำหรับอนุบาล 1 แยกหมวด ค้นหาได้ กรองด้วยแท็ก และพิมพ์ได้ทันทีจากเว็บ">
        <div className="flex flex-wrap gap-2">
          <Tag tone="purple">{WORKSHEETS.length} ใบงาน</Tag>
          <Tag tone="pink">{Object.keys(WORKSHEET_CATEGORIES).length} หมวด</Tag>
          <Tag tone="mint">🖨️ พิมพ์ได้ / บันทึก PDF</Tag>
        </div>
      </PageHeader>
      <Suspense fallback={null}>
        <WorksheetLibrary worksheets={WORKSHEETS} tags={allWorksheetTags()} />
      </Suspense>
    </div>
  );
}
