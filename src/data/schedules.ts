import type { Schedule } from "@/types";

/**
 * กำหนดการสอน — ตารางรายสัปดาห์ (20 สัปดาห์/ภาคเรียน)
 * คอลัมน์: สัปดาห์ที่ | วัน เดือน ปี | สาระการเรียนรู้ | หน่วยการจัดประสบการณ์ | หมายเหตุ
 * ช่อง "หน่วยการจัดประสบการณ์" อ้างถึง planId → กดแล้วไปยังแผนการจัดประสบการณ์ที่ตรงกัน
 * แถวที่ยังไม่มีแผนใส่ title ไว้ก่อนได้ (แสดงเป็นข้อความ ไม่มีลิงก์)
 */
export const SCHEDULES: Schedule[] = [
  {
    id: "k1-2569-2",
    title: "กำหนดการสอนชุดที่ 1",
    gradeId: "k1",
    semester: "ภาคเรียนที่ 2",
    year: "ปีการศึกษา 2569",
    school: "โรงเรียน Little Purple Garden",
    teacher: "นางสาววชิรญาณ์ ใจหาญ",
    description: "กำหนดการสอนอนุบาลชั้นอนุบาล 1 ภาคเรียนที่ 2 ปีการศึกษา 2569 (20 สัปดาห์)",
    rows: [
      { week: 1, dates: "2-6 พ.ย. 69", strand: "เรื่องราวเกี่ยวกับตัวเด็ก", planId: "food" },
      { week: 2, dates: "9-13 พ.ย. 69", strand: "เรื่องราวเกี่ยวกับตัวเด็ก", planId: "rice" },
      { week: 3, dates: "16-20 พ.ย. 69", strand: "เรื่องราวเกี่ยวกับตัวเด็ก", planId: "loy-krathong" },
      { week: 4, dates: "23-27 พ.ย. 69", strand: "ธรรมชาติรอบตัว", planId: "insects" },
      { week: 5, dates: "30 พ.ย. - 4 ธ.ค. 69", strand: "เรื่องราวเกี่ยวกับตัวเด็ก", planId: "father" },
      // สัปดาห์ 6–13 ยังไม่มีข้อมูลจากต้นฉบับ — ใส่ชื่อหน่วยไว้ก่อน (แก้ได้เมื่อได้ข้อมูลจริง)
      { week: 6, dates: "7-11 ธ.ค. 69", strand: "ธรรมชาติรอบตัว", title: "(รอข้อมูล)", note: "รอข้อมูลจากต้นฉบับ" },
      { week: 7, dates: "14-18 ธ.ค. 69", strand: "ธรรมชาติรอบตัว", title: "(รอข้อมูล)", note: "รอข้อมูลจากต้นฉบับ" },
      { week: 8, dates: "21-25 ธ.ค. 69", strand: "สิ่งต่าง ๆ รอบตัวเด็ก", title: "(รอข้อมูล)", note: "รอข้อมูลจากต้นฉบับ" },
      { week: 9, dates: "28 ธ.ค. 69 - 1 ม.ค. 70", strand: "เรื่องราวเกี่ยวกับบุคคลและสถานที่แวดล้อมเด็ก", title: "(รอข้อมูล)", note: "รอข้อมูลจากต้นฉบับ" },
      { week: 10, dates: "4-8 ม.ค. 70", strand: "เรื่องราวเกี่ยวกับบุคคลและสถานที่แวดล้อมเด็ก", title: "(รอข้อมูล)", note: "รอข้อมูลจากต้นฉบับ" },
      { week: 11, dates: "11-15 ม.ค. 70", strand: "เรื่องราวเกี่ยวกับบุคคลและสถานที่แวดล้อมเด็ก", title: "(รอข้อมูล)", note: "รอข้อมูลจากต้นฉบับ" },
      { week: 12, dates: "18-22 ม.ค. 70", strand: "ธรรมชาติรอบตัว", title: "(รอข้อมูล)", note: "รอข้อมูลจากต้นฉบับ" },
      { week: 13, dates: "25-29 ม.ค. 70", strand: "สิ่งต่าง ๆ รอบตัวเด็ก", title: "(รอข้อมูล)", note: "รอข้อมูลจากต้นฉบับ" },
      { week: 14, dates: "1-5 ก.พ. 70", strand: "สิ่งต่าง ๆ รอบตัวเด็ก", planId: "shapes" },
      { week: 15, dates: "8-12 ก.พ. 70", strand: "ธรรมชาติรอบตัว", planId: "sounds" },
      { week: 16, dates: "15-19 ก.พ. 70", strand: "ธรรมชาติรอบตัว", planId: "happy-home" },
      { week: 17, dates: "22-26 ก.พ. 70", strand: "เรื่องราวเกี่ยวกับตัวเด็ก", planId: "senses" },
      { week: 18, dates: "1-5 มี.ค. 70", strand: "ธรรมชาติรอบตัว", planId: "summer" },
      { week: 19, dates: "8-12 มี.ค. 70", strand: "ธรรมชาติรอบตัว", planId: "vegetables" },
      { week: 20, dates: "15-19 มี.ค. 70", title: "ประเมินพัฒนาการ", kind: "assessment" },
    ],
    footer: "ปิดเทอม",
  },
];

export const getSchedule = (id: string) => SCHEDULES.find((s) => s.id === id);
export const getSchedulesForPlan = (planId: string) =>
  SCHEDULES.filter((s) => s.rows.some((r) => r.planId === planId));
