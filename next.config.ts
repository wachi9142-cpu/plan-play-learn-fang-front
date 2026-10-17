import type { NextConfig } from "next";

/**
 * แยกโฟลเดอร์ผลลัพธ์ของ `next dev` กับ `next build` ออกจากกัน
 *
 * ถ้าใช้ .next ร่วมกัน เวลาสั่ง build ขณะที่เซิร์ฟเวอร์ dev เปิดอยู่
 * ตัว dev จะเห็นไฟล์เปลี่ยนแล้วคอมไพล์ใหม่รัว ๆ ทำให้หน้าเว็บที่เปิดค้างไว้ "กะพริบ"
 */
const cmd = process.argv.find((a) => a === "dev" || a === "build" || a === "start");
const distDir = process.env.NEXT_DIST_DIR ?? (cmd === "dev" ? ".next" : ".next-build");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir,
};

export default nextConfig;
