import type { ActivityType } from "@/types";
import { PLANS } from "./plans";

export interface CoreActivity {
  type: ActivityType;
  order: number;
  emoji: string;
  title: string;
  short: string;
  nature: string;   // ลักษณะ
  goal: string;     // เป้าหมาย
  tint: string;
}

/** 🎈 6 กิจกรรมหลัก — หมวดของกิจกรรมการจัดประสบการณ์ (ไม่ใช่คลังเกมออนไลน์) */
export const CORE_ACTIVITIES: CoreActivity[] = [
  {
    type: "circle", order: 1, emoji: "🎵", title: "กิจกรรมเคลื่อนไหวและจังหวะ", short: "เคลื่อนไหว", tint: "bg-sky-soft",
    nature: "ให้เด็กได้เคลื่อนไหวส่วนต่าง ๆ ของร่างกายอย่างอิสระตามจังหวะ เสียงเพลง คำคล้องจอง หรือเครื่องเคาะจังหวะ เช่น กลองและกรับ",
    goal: "พัฒนาการประสานงานของอวัยวะ การทรงตัว และการแสดงออกทางอารมณ์",
  },
  {
    type: "story", order: 2, emoji: "💬", title: "กิจกรรมเสริมประสบการณ์", short: "เสริมประสบการณ์", tint: "bg-yellow-soft",
    nature: "ครูและเด็กนั่งล้อมวงพูดคุย เล่าเรื่องราว ร้องเพลง ทดลอง หรือสนทนาเกี่ยวกับสิ่งรอบตัว เช่น ธรรมชาติและบุคคลอื่น",
    goal: "ฝึกทักษะการฟัง การพูด การคิดแก้ปัญหา และการอยู่ร่วมกันในกลุ่ม",
  },
  {
    type: "creative", order: 3, emoji: "🎨", title: "กิจกรรมสร้างสรรค์ (ศิลปะสร้างสรรค์)", short: "สร้างสรรค์", tint: "bg-pink-soft",
    nature: "กิจกรรมศิลปะ เช่น การวาดภาพระบายสี การปั้น การพับ ฉีก ตัด ปะ และประดิษฐ์เศษวัสดุ",
    goal: "ส่งเสริมจินตนาการ ความคิดสร้างสรรค์ และกล้ามเนื้อมัดเล็กของเด็ก",
  },
  {
    type: "free", order: 4, emoji: "🧸", title: "กิจกรรมเสรี (เล่นตามมุม)", short: "เสรี", tint: "bg-mint-soft",
    nature: "เด็กเลือกเล่นในมุมประสบการณ์ต่าง ๆ ในห้องเรียน เช่น มุมบล็อก มุมบ้านจำลอง หรือมุมหนังสือตามความสนใจ",
    goal: "ให้เด็กได้เรียนรู้การตัดสินใจด้วยตนเอง ฝึกวินัย และสร้างปฏิสัมพันธ์กับเพื่อน",
  },
  {
    type: "outdoor", order: 5, emoji: "🌳", title: "กิจกรรมกลางแจ้ง", short: "กลางแจ้ง", tint: "bg-[#e8f3d6]",
    nature: "พาเด็กออกไปเล่นนอกห้องเรียน เช่น เล่นเครื่องเล่นสนาม เล่นน้ำ เล่นทราย หรือวิ่งเล่นกีฬา",
    goal: "ออกกำลังกาย พัฒนากล้ามเนื้อมัดใหญ่ และให้เด็กได้ผ่อนคลาย",
  },
  {
    type: "game", order: 6, emoji: "🧩", title: "กิจกรรมเกมการศึกษา", short: "เกมการศึกษา", tint: "bg-purple-100",
    nature: "เล่นเกมที่มีกติกาง่าย ๆ เช่น เกมจับคู่ ภาพตัดต่อ หรือเกมเรียงลำดับ",
    goal: "ฝึกการสังเกต การคิดวิเคราะห์ และสร้างความคิดรวบยอดเกี่ยวกับสิ่งที่เรียนรู้",
  },
];

export const getCoreActivity = (type: string) => CORE_ACTIVITIES.find((c) => c.type === type);

/** รวมกิจกรรมจากทุกแผนที่เป็นประเภทนี้ พร้อมบอกว่ามาจากแผน/สัปดาห์/วันไหน */
export function getActivitiesByType(type: ActivityType) {
  return PLANS.flatMap((plan) =>
    plan.weeks.flatMap((week) =>
      week.days.flatMap((day) =>
        day.activities.filter((a) => a.type === type).map((activity) => ({ plan, week, day, activity })),
      ),
    ),
  );
}
