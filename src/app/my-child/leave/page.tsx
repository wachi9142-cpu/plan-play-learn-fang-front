import type { Metadata } from "next";
import { LeaveParent } from "@/components/care/LeaveParent";

export const metadata: Metadata = {
  title: "แจ้งลาและคนมารับเด็ก",
  description: "แจ้งลาป่วย ลากิจ และบอกครูว่าวันไหนให้ใครมารับลูกแทน",
};

export default function Page() {
  return <LeaveParent />;
}
