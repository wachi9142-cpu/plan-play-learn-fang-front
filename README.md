# plan-play-learn-fang-front

💜 **แผนเล่นเรียน อนุบาล 1** — Play & Learn Plan | Kindergarten 1 — by Teacher Kaowfang

เว็บไซต์รวบรวมแผนการจัดประสบการณ์ กิจกรรม สื่อการสอน ใบงาน และแนวทางสำหรับครูปฐมวัย

## Stack

- Next.js 16.2.9 · React 19.2.7 · TypeScript 6 · Tailwind CSS 4.3 · lucide-react (เวอร์ชันล็อกแบบ exact ตาม house lockset)
- ฟอนต์: **Mitr** (หัวข้อ) + **Sarabun** (เนื้อหา) ผ่าน `next/font/google`
- ทุกหน้าเป็น static (SSG) ยังไม่ต่อ backend — ข้อมูลอยู่ใน `src/data/`

## รันโปรเจกต์

```bash
npm install
npm run dev      # http://localhost:3002
npm run build
```

> dev/start ตั้งพอร์ต **3002** ไว้ใน `package.json` เพื่อไม่ชนกับโปรเจกต์อื่นที่ใช้ 3000

## โครงสร้างข้อมูล (สัมพันธ์กันด้วย id)

```
📅 Schedule (กำหนดการสอน)          src/data/schedules.ts
   └─ rows[]: { week, dates, strand, planId ─┐, note, kind }
                                             │
📖 LessonPlan (เรื่อง / หน่วยการจัดประสบการณ์) ◄┘   src/data/plans.ts  ← หัวใจของระบบ
   ├─ gradeId → Grade,  unitId → Unit,  strand (สาระการเรียนรู้)
   ├─ objectives · content · materials · assessment
   ├─ weeks[] → days[] (จ.–ศ.) → activities[]
   └─ related: { mediaIds, worksheetIds, projectIds, activityIds }
📚 Project (โครงการ)                src/data/projects.ts   relatedPlanIds → LessonPlan
🎨 Media / 📝 Worksheet / 🧸 Activity  src/data/content.ts
```

## Routes

| หน้า | path |
|---|---|
| หน้าหลัก | `/` |
| โครงการ / รายละเอียด | `/projects`, `/projects/[id]` |
| กำหนดการสอน / ตาราง 20 สัปดาห์ | `/schedules`, `/schedules/[id]` |
| แผนการจัดประสบการณ์ (ค้นหา) / รายละเอียดแผน / สัปดาห์ | `/plans`, `/plans/[plan]`, `/plans/[plan]/[week]` |
| คลัง: กิจกรรม สื่อ ใบงาน แผนรายสัปดาห์ บันทึกครู | `/activities`, `/media`, `/worksheets`, `/weekly`, `/notes` |

## เพิ่มข้อมูลใหม่

- **แผนใหม่** → เพิ่ม `LessonPlan` ใน `PLANS` (`src/data/plans.ts`) — หน้า `/plans/[id]` และ `/plans/[id]/[week]` ถูกสร้างอัตโนมัติ
- **กำหนดการสอนชุดใหม่** → เพิ่ม `Schedule` ใน `SCHEDULES` ใส่ `planId` ในแต่ละแถว ชื่อหน่วย/สาระจะดึงจากแผนเอง (แถวที่ยังไม่มีแผนใช้ `title` แทน)
- **โครงการใหม่** → เพิ่ม `Project` ใน `PROJECTS` และใส่ `relatedPlanIds` ให้เชื่อมกับแผน
- **อนุบาล 2/3** → เพิ่ม `Grade` ใน `GRADES` แล้วตั้ง `gradeId` ของแผน/กำหนดการ/โครงการ
- เมนู header/หน้าแรก อ่านจาก `src/lib/site.ts` (โครงการและกำหนดการสอนใน dropdown ดึงจากข้อมูลอัตโนมัติ)

เมื่อมี backend ให้แทนที่การ import จาก `src/data/` ด้วย service/hook ตาม house pattern โดยใช้ type ใน `src/types/` ต่อได้เลย
