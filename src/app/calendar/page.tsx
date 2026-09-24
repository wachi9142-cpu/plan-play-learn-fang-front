import type { Metadata } from "next";
import { CALENDAR_EVENTS } from "@/data/calendar";
import { PageHeader, Tag } from "@/components/ui";
import { SchoolCalendar } from "@/components/partials/SchoolCalendar";

export const metadata: Metadata = { title: "ปฏิทินโรงเรียน" };

export default function CalendarPage() {
  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader emoji="📅" image="/nav/calendar.webp" title="ปฏิทินโรงเรียน" description="เปิด–ปิดภาคเรียน วันหยุด วันสำคัญ กิจกรรมประจำเดือน ประชุมผู้ปกครอง และกิจกรรมพิเศษ — กดวันที่เพื่อดูรายละเอียด">
        <Tag tone="purple">{CALENDAR_EVENTS.length} รายการ</Tag>
      </PageHeader>
      <SchoolCalendar />
    </div>
  );
}
