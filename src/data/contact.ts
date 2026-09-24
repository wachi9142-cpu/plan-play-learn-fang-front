/** ข้อมูลติดต่อ — แก้ไขได้ที่ไฟล์นี้ไฟล์เดียว (ค่าที่ขึ้นต้น "ตัวอย่าง" คือยังรอข้อมูลจริง) */
export const CONTACT = {
  school: "Little Purple Garden",
  credit: "by Teacher Kaowfang",
  address: {
    lines: ["123/4 หมู่ 5 ถนนตัวอย่าง", "ตำบลตัวอย่าง อำเภอเมือง", "จังหวัดตัวอย่าง 10000"],
    note: "ที่อยู่เป็นตัวอย่าง — แก้ไขได้ใน src/data/contact.ts",
  },
  /** พิกัด/คำค้นสำหรับแผนที่ — ใส่ lat,lng หรือชื่อสถานที่ */
  map: {
    query: "Little Purple Garden",
    lat: 13.7563,
    lng: 100.5018,
  },
  hours: [
    { day: "จันทร์", time: "08:00 – 16:00 น." },
    { day: "อังคาร", time: "08:00 – 16:00 น." },
    { day: "พุธ", time: "08:00 – 16:00 น." },
    { day: "พฤหัสบดี", time: "08:00 – 16:00 น." },
    { day: "ศุกร์", time: "08:00 – 16:00 น." },
    { day: "เสาร์", time: "ปิด", closed: true },
    { day: "อาทิตย์", time: "ปิด", closed: true },
  ],
  hoursNote: "เวลาเป็นตัวอย่าง สามารถแก้ไขภายหลังได้",
  channels: [
    { id: "phone", emoji: "☎️", icon: "/nav/phone.webp", label: "โทรศัพท์", value: "091-756-051X", href: "tel:091756051X" },
    { id: "email", emoji: "📧", label: "Email", value: "littlepurplegardenkf@hotmail.com", href: "mailto:littlepurplegardenkf@hotmail.com" },
    { id: "line", emoji: "💬", label: "LINE", value: "@littlepurplegarden", href: "https://line.me/R/ti/p/@littlepurplegarden" },
    { id: "facebook", emoji: "📘", label: "Facebook", value: "Little Purple Garden", href: "https://www.facebook.com/" },
    { id: "instagram", emoji: "📷", label: "Instagram", value: "@teacher.kaowfang", href: "https://www.instagram.com/" },
  ],
};

export const mapEmbedUrl = () => `https://www.google.com/maps?q=${CONTACT.map.lat},${CONTACT.map.lng}&z=16&output=embed`;
export const mapDirectionsUrl = () => `https://www.google.com/maps/dir/?api=1&destination=${CONTACT.map.lat},${CONTACT.map.lng}`;
