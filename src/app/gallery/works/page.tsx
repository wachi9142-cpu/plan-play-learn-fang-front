import type { Metadata } from "next";
import { getGalleryByKind } from "@/data/gallery";
import { PageHeader, Tag } from "@/components/ui";
import { GalleryGrid } from "@/components/partials/GalleryGrid";

export const metadata: Metadata = { title: "ผลงานเด็ก" };

export default function WorksPage() {
  const items = getGalleryByKind("work");
  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader emoji="🖼️" title="ผลงานเด็ก" description="ผลงานศิลปะ งานปั้น และชิ้นงานจากกิจกรรมของเด็ก ๆ เชื่อมกับแผนที่ทำกิจกรรมนั้น">
        <Tag tone="purple">{items.length} ผลงาน</Tag>
      </PageHeader>
      <GalleryGrid items={items} emptyTitle="ยังไม่มีผลงานเด็ก" />
    </div>
  );
}
