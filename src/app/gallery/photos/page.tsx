import type { Metadata } from "next";
import { getGalleryByKind } from "@/data/gallery";
import { PageHeader, Tag } from "@/components/ui";
import { GalleryGrid } from "@/components/partials/GalleryGrid";

export const metadata: Metadata = { title: "ภาพกิจกรรม" };

export default function PhotosPage() {
  const items = getGalleryByKind("photo");
  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader emoji="📷" title="ภาพกิจกรรม" description="ภาพบรรยากาศกิจกรรมในห้องเรียน กลางแจ้ง และโครงการต่าง ๆ">
        <Tag tone="purple">{items.length} ภาพ</Tag>
      </PageHeader>
      <GalleryGrid items={items} emptyTitle="ยังไม่มีภาพกิจกรรม" />
    </div>
  );
}
