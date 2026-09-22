# ④ Data Structure / ความสัมพันธ์ข้อมูล

ทุกตารางมี `id` · `createdAt` · `updatedAt` · ความสัมพันธ์ใช้ id (ไม่ฝังข้อมูลซ้ำ) · โค้ดปัจจุบันอยู่ที่ `src/types/*.ts` และ `src/data/*.ts` (ข้อมูลตั้งต้น) — เมื่อมีฐานข้อมูลจริงให้ย้ายตารางเหล่านี้ไปตรง ๆ

```
School
 └─ Grade (nursery · k0 · k1 · k2 · k3 · special)
     └─ ClassRoom  { code "อนุบาล 3/1", nickname "ห้องพี่สายรุ้ง", emoji, teacherId, status, inviteCode, liveTime }
         ├─ ClassMember { userId, role child|parent, childId?, approved, filterAllowed }
         │    └─ StarEntry { reason, at, by }
         ├─ ChatMessage { by, kind, text, attachment?, link? }
         ├─ ArchiveItem { kind image|video|file|other, title, date, unitId?, activity?, assetId|url, note }
         └─ LiveSession { startedAt, endedAt, attendees[], recordingId? }

Schedule { gradeId, semester, year, teacher, startDate, rows[] }
 └─ ScheduleRow { week, dates, strand?, planId?, title?, kind? }        → LessonPlan
Unit { name, emoji, gradeId }
 └─ LessonPlan { unitId, gradeId, strand, weeks[] → DayPlan[] → Activity[] , related{ mediaIds, worksheetIds, projectIds, activityIds } }
      └─ Activity { type (6 กิจกรรมหลัก), objectives, steps, materials, gameIds?, worksheetIds?, mediaIds? }
           ├─ Game { category, engine config }
           ├─ Worksheet { category, template, tags, planIds }
           └─ Media { type, planIds }
Project { title, planIds, activityIds }

Student { name, avatar, classRoomId, parentIds[], stars (คำนวณจาก StarEntry) }
Parent  { name, avatar, childIds[] }
Teacher { name, avatar, classRoomIds[] }
Avatar  { ownerId, emoji?, bg?, image? }            (ใช้ร่วมกันทุกระบบ)

Assignment { classRoomId, planId?, activityId?, title, due, attachments }   ← จากแชตประเภท "การบ้าน"
 └─ Submission { studentId, files, note, at, teacherComment?, stars? }
PortfolioItem { studentId, canvasId?|submissionId?|upload, title, category, date, image, teacherComment?, visibility private|gallery, planId? }
DevelopmentRecord { studentId, domain physical|emotional|social|cognitive, date, note, level?, by }

StudioDoc { type plan|schedule|worksheet|media|slides|sheet|other, blocks[], slides?, sheet?, links{planId?,scheduleId?,gradeId?}, status }
StudioAsset { docId, blob (IndexedDB) } · UserFont { family, blob }
CanvasDoc { title, template, ops[] (stroke|shape|fill|text|image), room?, childName?, planId? }
LibraryItem (Garden Library) = view รวมของ StudioAsset + ArchiveItem + PortfolioItem + Media + Worksheet
```

## เส้นทางข้อมูลหลัก (ห้ามตัด)
```
กำหนดการสอน → หน่วย/เรื่อง → แผนการจัดประสบการณ์ → กิจกรรม → เกม/ใบงาน/สื่อ → งานของเด็ก → ผลงาน/Portfolio
```
- คลิกสัปดาห์ในกำหนดการ → เปิดแผน → เห็นกิจกรรมทั้ง 6 → เปิดเกม/ใบงาน/สื่อที่ผูกไว้ → ครูมอบหมายเป็นงาน → เด็กส่ง → ครูเก็บเป็นผลงาน/ให้ดาว
- คลังย้อนหลังและ Portfolio อ้างอิง `unitId`/`planId` เพื่อกรองตามหน่วย/กิจกรรมได้

## ที่เก็บข้อมูลปัจจุบัน (ต่อเครื่อง) → ระบบจริง
| ข้อมูล | ตอนนี้ | ระบบจริง |
|---|---|---|
| ห้อง/สมาชิก/แชต/คลัง/ดาว/คาบสด | `localStorage: lpg-classroom-v1` | ตาราง ClassRoom … LiveSession |
| ไฟล์/คลิป/รูป | IndexedDB `lpg-studio` (assets, docId=`class:<roomId>`) | Object storage (S3/GCS) + signed URL |
| เอกสาร Studio | `lpg-studio-docs-v1` + IndexedDB | ตาราง StudioDoc + storage |
| กระดาษ Canvas / แฟ้มผลงาน | `lpg-canvas-v1`, `lpg-portfolio-v1` | CanvasDoc, PortfolioItem |
| Avatar | `lpg-avatars-v1` (key=ชื่อ) | Avatar (key=userId) |
| ตัวตน | `lpg-class-me`, `lpg-canvas-me` | บัญชีผู้ใช้ + บทบาท |
| Real-time | relay ws `server/canvas-ws.mjs` (ห้อง = `class-<roomId>` / รหัสห้องวาด) | WebSocket service + TURN / บริการวิดีโอ |
