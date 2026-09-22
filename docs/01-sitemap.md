# ① Sitemap — Little Purple Garden

**Little Purple Garden** · Nursery & Kindergarten · by Teacher Kaowfang · *Play • Learn • Grow*
สีหลัก ม่วง `#6D3AA8` + ครีม/ขาว + สีอ่อน · ฟอนต์ Mitr (หัวข้อ) / Sarabun (เนื้อหา) · Mobile-first, responsive ทุกอุปกรณ์

## ส่วนสาธารณะ (ผู้เยี่ยมชม)

| หน้า | เส้นทาง | สถานะ |
|---|---|---|
| หน้าแรก | `/` | ✅ |
| เกี่ยวกับ — ประวัติ · แนวคิด · การเรียนรู้ · ปรัชญา · วิสัยทัศน์ · พันธกิจ · เป้าหมาย | `/about#…` | ✅ (รอข้อมูลจริงบางส่วน) |
| ระดับชั้น Nursery → เตรียมอนุบาล → อ.1 → อ.2 → อ.3 | `/about/[grade]` | ✅ |
| อาคาร/สถานที่ · นักเรียน · บุคลากร | `/about#facilities,#students,#staff` | ✅ (placeholder) |
| **เมนู** — กำหนดการสอน | `/schedules`, `/schedules/[id]` | ✅ (รอสัปดาห์ 6–13) |
| แผนการจัดประสบการณ์ | `/plans`, `/plans/[plan]`, `/plans/[plan]/[week]` | ✅ |
| โครงการ | `/projects`, `/projects/[id]` | ✅ |
| 6 กิจกรรมหลัก | `/core-activities`, `/core-activities/[type]` | ✅ |
| เกมการศึกษา (เล่นได้ · 3 ระดับทุกเกม) | `/games`, `/games/[id]`, `/games/progress` | ✅ 16 เกม |
| ใบงาน (พิมพ์ A4) | `/worksheets`, `/worksheets/[id]`, `/worksheets/[id]/print` | ✅ 34 ใบงาน |
| สื่อการเรียนการสอน | `/media` | ✅ |
| ปฏิทินโรงเรียน | `/calendar` | ✅ |
| กิจกรรมโรงเรียน | `/school-events`, `/school-events/[id]` | ✅ |
| ประชาสัมพันธ์ | `/news`, `/news/[id]` | ✅ |
| ติดต่อเรา | `/contact` | ✅ (รอที่อยู่/พิกัดจริง) |
| ผลงานเด็ก · ภาพกิจกรรม | `/gallery/works`, `/gallery/photos` | ✅ |
| ห้องเรียนของเรา (สัปดาห์นี้) | `/classroom` | ✅ |
| ค้นหา | `/search` | ✅ |
| เข้าสู่ระบบ (Google/Facebook/Instagram) | `/login` | 🟡 UI พร้อม รอ OAuth backend |

## ส่วนที่เข้าสู่ระบบ (ครู / นักเรียน / ผู้ปกครอง / Admin)

| ระบบ | เส้นทาง | สถานะ |
|---|---|---|
| 💻 ห้องเรียนออนไลน์ — hub ห้องแยกระดับ + ห้องพิเศษ | `/online-classroom` | ✅ |
| 🧑‍🏫 Teacher Dashboard | `/online-classroom/teacher` | ✅ |
| ห้องเรียน 1 ห้อง: เรียนสด · แชต · ย้อนหลัง · ดาว · สมาชิก · ตั้งค่า | `/online-classroom/[id]?tab=` | ✅ |
| เข้าห้องด้วยลิงก์/รหัสเชิญ | `/online-classroom/join/[code]` | ✅ |
| 🌱 Garden Studio (เอกสาร/สไลด์/สเปรดชีต/ตาราง/ส่งออก) | `/studio`, `/studio/[id]` | ✅ |
| 🎨 Garden Canvas (วาดคนเดียว / วาดร่วมกัน real-time) | `/canvas`, `/canvas/[id]`, `/canvas/room/[code]` | ✅ |
| 📚 Garden Library (คลังสื่อรวม) | `/library` | ⏳ ถัดไป |
| 📝 งาน/การบ้าน | ผ่านแชตห้อง (ประเภท "การบ้าน", "ส่งงาน") | 🟡 พื้นฐาน |
| 🏆 Portfolio (แฟ้มผลงานเด็ก) | `/canvas` (แฟ้ม) + `/gallery/works` (เผยแพร่) | 🟡 พื้นฐาน · รอความคิดเห็นครู/หมวดหมู่ |
| 📈 ติดตามพัฒนาการ 4 ด้าน | `/development` | ⏳ ถัดไป |
| ⭐ ระบบดาว | `/online-classroom/[id]?tab=stars` | ✅ |
| 💬 Chat | `/online-classroom/[id]?tab=chat` | ✅ |
| 👑 Admin / CMS | `/admin` | ⏳ ถัดไป |

## Navigation ตามขนาดจอ
- **มือถือ (≤ 767px)**: โลโก้ + ☰ (เมนูเต็มจอ) + แถบลอย (📢 📝 🎮 🏆 🔍)
- **แท็บเล็ต (768–1023px)**: หน้าแรก | เกี่ยวกับ▾ | เมนู▾ | ☰ ที่เหลือ
- **โน้ตบุ๊ก/เดสก์ท็อป (≥ 1024px)**: หน้าแรก | เกี่ยวกับ▾ | เมนู▾ | ปฏิทินโรงเรียน | กิจกรรมโรงเรียน | ประชาสัมพันธ์ | ติดต่อเรา | เข้าสู่ระบบ
