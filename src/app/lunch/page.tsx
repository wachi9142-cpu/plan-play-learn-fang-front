import type { Metadata } from "next";
import { LunchPublic } from "@/components/care/LunchPublic";

export const metadata: Metadata = {
  title: "เมนูอาหารประจำสัปดาห์",
  description: "อาหารกลางวันและอาหารว่างของเด็ก ๆ ที่ Little Purple Garden พร้อมข้อมูลเด็กที่แพ้อาหาร",
};

export default function Page() {
  return <LunchPublic />;
}
