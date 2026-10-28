import { redirect } from "next/navigation";

/** /gallery ไม่มีหน้ารวมของตัวเอง — พาไปหน้าภาพกิจกรรม (ผลงานเด็กอยู่ที่ /gallery/works) */
export default function GalleryPage() {
  redirect("/gallery/photos");
}
