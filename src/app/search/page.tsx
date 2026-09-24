import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui";
import { SiteSearch } from "./SiteSearch";

export const metadata: Metadata = { title: "ค้นหา" };

export default function SearchPage() {
  return (
    <div className="container-page max-w-3xl py-8 sm:py-12">
      <PageHeader emoji="🔍" image="/nav/search.webp" title="ค้นหา" description="ค้นหาใบงาน แผน เกม โครงการ สื่อ ข่าว หรือกิจกรรมต่าง ๆ ในเว็บ" />
      <Suspense fallback={null}>
        <SiteSearch />
      </Suspense>
    </div>
  );
}
