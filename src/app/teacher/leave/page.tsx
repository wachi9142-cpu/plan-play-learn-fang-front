import type { Metadata } from "next";
import { LeaveTeacher } from "@/components/care/LeaveTeacher";

export const metadata: Metadata = { title: "แจ้งลาและคนมารับเด็ก (ครู)" };

export default function Page() {
  return <LeaveTeacher />;
}
