import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-20 text-center">
      <span className="animate-float text-6xl">🧸</span>
      <h1 className="mt-5 text-2xl sm:text-3xl">ไม่พบหน้าที่ต้องการ</h1>
      <p className="mt-2 text-ink-soft">หน้านี้อาจถูกย้ายหรือยังไม่ได้สร้างค่ะ</p>
      <Link href="/" className="tap mt-6 inline-flex items-center rounded-full bg-purple-600 px-6 py-3 font-medium text-white hover:bg-purple-700">
        กลับหน้าแรก
      </Link>
    </div>
  );
}
