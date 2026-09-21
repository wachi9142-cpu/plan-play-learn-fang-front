import type { Schedule } from "@/types";

/**
 * กำหนดการสอน — ตารางรายสัปดาห์ (20 สัปดาห์/ภาคเรียน)
 * คอลัมน์: สัปดาห์ที่ | วัน เดือน ปี | สาระการเรียนรู้ | หน่วยการจัดประสบการณ์ | หมายเหตุ
 * ช่อง "หน่วยการจัดประสบการณ์" อ้างถึง planId → กดแล้วไปยังแผนการจัดประสบการณ์ที่ตรงกัน
 * แถวที่ยังไม่มีแผนใส่ title ไว้ก่อนได้ (แสดงเป็นข้อความ ไม่มีลิงก์)
 */
export const SCHEDULES: Schedule[] = [
  {
    id: "k1-2564-2",
    title: "กำหนดการสอนชุดที่ 1",
    gradeId: "k1",
    semester: "ภาคเรียนที่ 2",
    year: "ปีการศึกษา 2564",
    school: "โรงเรียนไทยรัฐวิทยา ๗๕ เฉลิมพระเกียรติ",
    teacher: "นางสาววชิรญาณ์ ใจหาญ",
    description: "กำหนดการสอนอนุบาลชั้นอนุบาล 1 ภาคเรียนที่ 2 ปีการศึกษา 2564 (20 สัปดาห์)",
    rows: [
      { week: 1, dates: "1-5 พ.ย. 64", strand: "เรื่องราวเกี่ยวกับตัวเด็ก", planId: "food" },
      { week: 2, dates: "8-12 พ.ย. 64", strand: "เรื่องราวเกี่ยวกับตัวเด็ก", planId: "rice" },
      { week: 3, dates: "15-19 พ.ย. 64", strand: "เรื่องราวเกี่ยวกับตัวเด็ก", planId: "loy-krathong" },
      { week: 4, dates: "22-26 พ.ย. 64", strand: "ธรรมชาติรอบตัว", planId: "insects" },
      { week: 5, dates: "29 พ.ย. - 3 ธ.ค. 64", strand: "เรื่องราวเกี่ยวกับตัวเด็ก", planId: "father" },
      // สัปดาห์ 6–13 ยังไม่มีข้อมูลจากต้นฉบับ — ใส่ชื่อหน่วยไว้ก่อน (แก้ได้เมื่อได้ข้อมูลจริง)
      { week: 6, dates: "6-10 ธ.ค. 64", strand: "ธรรมชาติรอบตัว", title: "(รอข้อมูล)", note: "รอข้อมูลจากต้นฉบับ" },
      { week: 7, dates: "13-17 ธ.ค. 64", strand: "ธรรมชาติรอบตัว", title: "(รอข้อมูล)", note: "รอข้อมูลจากต้นฉบับ" },
      { week: 8, dates: "20-24 ธ.ค. 64", strand: "สิ่งต่าง ๆ รอบตัวเด็ก", title: "(รอข้อมูล)", note: "รอข้อมูลจากต้นฉบับ" },
      { week: 9, dates: "27-31 ธ.ค. 64", strand: "เรื่องราวเกี่ยวกับบุคคลและสถานที่แวดล้อมเด็ก", title: "(รอข้อมูล)", note: "รอข้อมูลจากต้นฉบับ" },
      { week: 10, dates: "3-7 ม.ค. 65", strand: "เรื่องราวเกี่ยวกับบุคคลและสถานที่แวดล้อมเด็ก", title: "(รอข้อมูล)", note: "รอข้อมูลจากต้นฉบับ" },
      { week: 11, dates: "10-14 ม.ค. 65", strand: "เรื่องราวเกี่ยวกับบุคคลและสถานที่แวดล้อมเด็ก", title: "(รอข้อมูล)", note: "รอข้อมูลจากต้นฉบับ" },
      { week: 12, dates: "17-21 ม.ค. 65", strand: "ธรรมชาติรอบตัว", title: "(รอข้อมูล)", note: "รอข้อมูลจากต้นฉบับ" },
      { week: 13, dates: "24-28 ม.ค. 65", strand: "สิ่งต่าง ๆ รอบตัวเด็ก", title: "(รอข้อมูล)", note: "รอข้อมูลจากต้นฉบับ" },
      { week: 14, dates: "31 ม.ค. - 4 ก.พ. 65", strand: "สิ่งต่าง ๆ รอบตัวเด็ก", planId: "shapes" },
      { week: 15, dates: "7-11 ก.พ. 65", strand: "ธรรมชาติรอบตัว", planId: "sounds" },
      { week: 16, dates: "14-18 ก.พ. 65", strand: "ธรรมชาติรอบตัว", planId: "happy-home" },
      { week: 17, dates: "21-25 ก.พ. 65", strand: "เรื่องราวเกี่ยวกับตัวเด็ก", planId: "senses" },
      { week: 18, dates: "28 ก.พ. - 4 มี.ค. 65", strand: "ธรรมชาติรอบตัว", planId: "summer" },
      { week: 19, dates: "7-11 มี.ค. 65", strand: "ธรรมชาติรอบตัว", planId: "vegetables" },
      { week: 20, dates: "14-18 มี.ค. 65", title: "ประเมินพัฒนาการ", kind: "assessment" },
    ],
    footer: "ปิดเทอม",
  },
  {
    id: "k1-2569-1",
    title: "กำหนดการสอนชุดที่ 2",
    gradeId: "k1",
    semester: "ภาคเรียนที่ 1",
    year: "ปีการศึกษา 2569",
    description: "ตัวอย่างกำหนดการสอน ภาคเรียนที่ 1 (โครงร่าง — ปรับได้ตามจริง)",
    rows: [
      { week: 1, dates: "18-22 พ.ค. 69", planId: "school" },
      { week: 2, dates: "25-29 พ.ค. 69", planId: "school", note: "สัปดาห์ที่ 2 ของหน่วย" },
      { week: 3, dates: "1-5 มิ.ย. 69", planId: "myself" },
      { week: 4, dates: "8-12 มิ.ย. 69", planId: "myself", note: "สัปดาห์ที่ 2 ของหน่วย" },
      { week: 5, dates: "15-19 มิ.ย. 69", planId: "family" },
      { week: 6, dates: "22-26 มิ.ย. 69", planId: "animals" },
      { week: 7, dates: "29 มิ.ย. - 3 ก.ค. 69", planId: "nature" },
      { week: 8, dates: "6-10 ก.ค. 69", title: "ประเมินพัฒนาการ", kind: "assessment" },
    ],
    footer: "ปิดเทอม",
  },
];

export const getSchedule = (id: string) => SCHEDULES.find((s) => s.id === id);
export const getSchedulesForPlan = (planId: string) =>
  SCHEDULES.filter((s) => s.rows.some((r) => r.planId === planId));
