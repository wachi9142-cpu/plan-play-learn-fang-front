import type { Metadata } from "next";
import { AdminPage } from "@/components/admin/AdminPage";

export const metadata: Metadata = { title: "ผู้ดูแลระบบ" };

export default function Page() {
  return <AdminPage />;
}
