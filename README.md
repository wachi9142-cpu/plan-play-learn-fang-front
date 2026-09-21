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

## โครงสร้าง

```
src/
├── app/                      # routes (App Router)
│   ├── page.tsx              # หน้าแรก (Hero + เมนู Card)
│   ├── plans/                # ภาคเรียน → เดือน → หน่วย → สัปดาห์ → วัน
│   │   └── [grade]/[semester]/[unit]/[week]/page.tsx
│   ├── activities/, media/, worksheets/, weekly/, notes/
│   └── globals.css           # design tokens (สีม่วง/ครีม), utilities, animations
├── components/
│   ├── layout/               # Header (responsive + เมนูมือถือ), Footer
│   ├── ui/                   # PageHeader, Breadcrumb, Tag, EmptyState, Section
│   └── partials/             # ActivityCard, DayTabs (จันทร์–ศุกร์)
├── data/
│   ├── plans.ts              # GRADES → semesters → months → units → weeks → days → activities
│   └── content.ts            # กิจกรรม / สื่อ / ใบงาน / บันทึกครู
├── types/                    # Grade, Semester, Month, Unit, Week, DayPlan, Activity …
└── lib/                      # site config (ชื่อเว็บ, เมนู), cn()
```

## เพิ่มแผนชุดใหม่

1. เพิ่ม `Unit` ใหม่ใน `src/data/plans.ts` แล้วใส่ไว้ในเดือนที่ต้องการ
2. แต่ละ `Week` มี `days` 5 วัน (`mon`–`fri`) แต่ละวันมีรายการ `Activity`
3. ต้องการเพิ่มระดับชั้น (เช่น อนุบาล 2) → เพิ่ม `Grade` ใหม่ใน `GRADES` เส้นทาง `/plans/k2/...` จะถูกสร้างอัตโนมัติ
4. ประเภทกิจกรรม (`ActivityType`) และ emoji/ชื่อ อยู่ที่ `ACTIVITY_META` ใน `plans.ts`

เมื่อมี backend ให้แทนที่การ import จาก `src/data/` ด้วย service/hook ตาม house pattern (`lib/api → services → hooks`) โดย type ใน `src/types/` ใช้ต่อได้เลย
