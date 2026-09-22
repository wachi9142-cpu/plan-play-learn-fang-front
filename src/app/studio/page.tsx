import type { Metadata } from "next";
import { Suspense } from "react";
import { StudioHome } from "@/components/studio";
import { StudioEntry } from "./StudioEntry";

export const metadata: Metadata = { title: "Garden Studio" };

export default function StudioPage() {
  return (
    <div className="container-page py-6 sm:py-10">
      <Suspense fallback={<StudioHome />}>
        <StudioEntry />
      </Suspense>
    </div>
  );
}
