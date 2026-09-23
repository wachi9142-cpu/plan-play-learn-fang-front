import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

/** 📚 ห้องสมุด — ทางเข้า 2 พื้นที่: ชั้นหนังสือ (ผู้ใหญ่) · มุมหนังสือ (เด็ก) */
export function LibraryHub() {
  return (
    <div className="container-page py-6 sm:py-10">
      <section className="rounded-3xl bg-gradient-to-br from-purple-100 via-cream to-pink-soft px-4 py-10 text-center sm:px-6 sm:py-14">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-[13px] font-medium text-purple-700 shadow-soft">📚 ห้องสมุด · Little Purple Garden</p>
        <h1 className="mt-4 text-3xl sm:text-5xl">ห้องสมุดของสวนสีม่วง</h1>
        <p className="mx-auto mt-2 max-w-2xl text-[15px] text-ink-soft sm:text-base">สองพื้นที่ที่มีหน้าที่ต่างกัน — ชั้นหนังสือสำหรับครูและผู้ใหญ่ · มุมหนังสือสำหรับเด็ก ๆ 💜</p>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Link href="/library/shelf" className="card card-hover group flex flex-col overflow-hidden">
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-100 to-sky-soft sm:h-56">
            <Image src="/library/shelf.webp" alt="" fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-[center_58%] transition-transform duration-300 group-hover:scale-105" />
          </div>
          <div className="flex flex-1 flex-col p-5">
            <h2 className="text-2xl">📚 ชั้นหนังสือ</h2>
            <p className="mt-1 text-[15px] text-ink-soft">พื้นที่แห่งความรู้สำหรับครูและผู้ใหญ่</p>
            <p className="mt-2 flex-1 text-[14px] text-ink-soft">หลักสูตรและเอกสารทางการ · หนังสือสำหรับครู · พัฒนาการและจิตวิทยาเด็ก · การจัดประสบการณ์และการสอน · คู่มือ/แนวทาง · คู่มือสำหรับผู้ปกครอง · หนังสือความรู้ · คลังหนังสือของครูข้าวฟ่าง</p>
            <span className="tap mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-base font-medium text-white shadow-soft">เปิดชั้นหนังสือ <ArrowRight size={18} /></span>
          </div>
        </Link>

        <Link href="/library/kids" className="card card-hover group flex flex-col overflow-hidden">
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-pink-soft to-yellow-soft sm:h-56">
            <Image src="/library/kids.webp" alt="" fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-[center_52%] transition-transform duration-300 group-hover:scale-105" />
          </div>
          <div className="flex flex-1 flex-col p-5">
            <h2 className="text-2xl">🧸 มุมหนังสือ</h2>
            <p className="mt-1 text-[15px] text-ink-soft">พื้นที่เล็ก ๆ สำหรับเด็ก ๆ ได้อ่าน ฟัง และจินตนาการ</p>
            <p className="mt-2 flex-1 text-[14px] text-ink-soft">นิทาน · นิทานสัตว์ · ธรรมชาติรอบตัว · การผจญภัยและจินตนาการ · ครอบครัวและเพื่อน · อารมณ์และความรู้สึก · ตัวเลข · ภาษา · วิทยาศาสตร์น่ารู้ · ศิลปะ · โลกของเรา</p>
            <span className="tap mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-base font-medium text-white shadow-soft">เข้ามุมหนังสือ <ArrowRight size={18} /></span>
          </div>
        </Link>
      </div>

      <div className="card mt-4 flex flex-wrap items-center gap-3 p-4 text-[14px]">
        <span className="text-2xl">🗂️</span>
        <span className="min-w-0 flex-1 text-ink-soft">กำลังหาไฟล์สื่อ รูป คลิป หรือเอกสารจากทุกระบบ (Studio · ห้องเรียน · หลักสูตร · Canvas) อยู่ใช่ไหมคะ</span>
        <Link href="/library/media" className="tap rounded-full border border-purple-200 bg-white px-4 py-1.5 text-purple-700 hover:bg-purple-50">เปิดคลังสื่อรวม →</Link>
      </div>
    </div>
  );
}
