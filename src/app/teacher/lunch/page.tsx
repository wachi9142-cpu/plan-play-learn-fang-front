import type { Metadata } from "next";
import { LunchTeacher } from "@/components/care/LunchTeacher";

export const metadata: Metadata = { title: "เมนูอาหารและของแพ้ (ครู)" };

export default function Page() {
  return <LunchTeacher />;
}
