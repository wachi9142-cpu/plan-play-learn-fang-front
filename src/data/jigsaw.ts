/**
 * 🧩 เกมจิ๊กซอว์ — ภาพจริงจากในเว็บ ตัดเป็นชิ้นให้เด็กต่อ
 *
 * วิธีเล่น: ภาพใหญ่มีช่องว่างกลม ๆ เจาะไว้ เด็กลากชิ้นที่หายไปกลับเข้าที่
 * โครงสร้าง: หมวด → ภาพ → เลือกระดับ (ง่าย 3 ชิ้น · ปานกลาง 6 ชิ้น · ยาก 10 ชิ้น)
 * เพิ่มภาพใหม่ = วางไฟล์ใน public/ แล้วเพิ่ม 1 บรรทัดในหมวดที่ใช่
 */

export interface JigsawPicture {
  id: string;
  title: string;
  /** ไฟล์ภาพใน public/ */
  image: string;
}

export interface JigsawCategory {
  id: string;
  emoji: string;
  label: string;
  hint: string;
  tint: string;
  pictures: JigsawPicture[];
  /** ยังไม่มีภาพจริง — หน้าเว็บจะขึ้นว่า "รอภาพจากครู" แทนการเปิดเล่น */
  waitingImages?: boolean;
  /** ข้อความบอกว่าต้องการภาพแบบไหน */
  need?: string;
}

/** ระดับความยาก — ตัวเลขคือจำนวนชิ้นที่หายไปจากภาพ */
export const JIGSAW_LEVELS = [
  { id: "easy", emoji: "🟢", label: "ง่าย", who: "เนอสเซอรี่ – เตรียมอนุบาล", pieces: 3, note: "หาย 3 ชิ้น · ชิ้นใหญ่ จับง่าย" },
  { id: "medium", emoji: "🟡", label: "ปานกลาง", who: "อนุบาล 1 – 2", pieces: 6, note: "หาย 6 ชิ้น · ต้องสังเกตมากขึ้น" },
  { id: "hard", emoji: "🔴", label: "ยาก", who: "อนุบาล 3 – ประถมต้น", pieces: 10, note: "หาย 10 ชิ้น · ชิ้นเล็ก ท้าทายพี่โต" },
] as const;

export type JigsawLevelId = (typeof JIGSAW_LEVELS)[number]["id"];
export const findLevel = (id: JigsawLevelId) => JIGSAW_LEVELS.find((l) => l.id === id)!;

export const JIGSAW_CATEGORIES: JigsawCategory[] = [
  {
    id: "zoo",
    emoji: "🦁",
    label: "สวนสัตว์",
    hint: "สิงโต ช้าง ยีราฟ ม้าลาย และเพื่อน ๆ ในสวนสัตว์",
    tint: "bg-yellow-soft",
    pictures: [],
    waitingImages: true,
    need: "ภาพสัตว์ในสวนสัตว์ สีสดใส เห็นตัวสัตว์ชัด ๆ 5–6 ภาพ",
  },
  {
    id: "sea",
    emoji: "🐠",
    label: "สัตว์น้ำในทะเล",
    hint: "ปลาการ์ตูน เต่าทะเล ปะการัง และโลกใต้ทะเล",
    tint: "bg-sky-soft",
    pictures: [],
    waitingImages: true,
    need: "ภาพใต้ทะเล ปลาหลากสี ปะการัง 5–6 ภาพ",
  },
  {
    id: "temple",
    emoji: "🛕",
    label: "วัดและวันสำคัญ",
    hint: "วัด โบสถ์ เจดีย์ และบรรยากาศวันสำคัญทางศาสนา",
    tint: "bg-purple-100",
    pictures: [],
    waitingImages: true,
    need: "ภาพวัด เจดีย์ ตักบาตร ลอยกระทง 5–6 ภาพ",
  },
  {
    id: "nature",
    emoji: "🏞️",
    label: "น้ำตกและธรรมชาติ",
    hint: "น้ำตก ภูเขา ทุ่งดอกไม้ และธรรมชาติรอบตัว",
    tint: "bg-mint-soft",
    pictures: [],
    waitingImages: true,
    need: "ภาพน้ำตก ภูเขา ทุ่งดอกไม้ สีเขียวสดใส 5–6 ภาพ",
  },
  {
    id: "cartoon",
    emoji: "🎨",
    label: "การ์ตูนน่ารัก",
    hint: "ตัวการ์ตูนสีสันสดใสที่เด็ก ๆ ชอบ",
    tint: "bg-pink-soft",
    pictures: [],
    waitingImages: true,
    need: "⚠️ การ์ตูนดัง (เช่น ชินจัง โดราเอมอน) มีลิขสิทธิ์ ใช้ในเว็บสาธารณะไม่ได้ — ใช้ภาพการ์ตูนฟรีลิขสิทธิ์ หรือภาพที่ครู/เด็กวาดเองแทนได้ค่ะ",
  },
  {
    id: "school",
    emoji: "🏫",
    label: "โรงเรียนของเรา",
    hint: "บ้านโรงเรียน มุมหนังสือ และกิจกรรมในห้องเรียน",
    tint: "bg-mint-soft",
    pictures: [
      { id: "house", title: "บ้านโรงเรียน", image: "/school/house.webp" },
      { id: "kids-corner", title: "มุมหนังสือเด็ก", image: "/library/kids.webp" },
      { id: "shelf", title: "ชั้นหนังสือ", image: "/library/shelf.webp" },
      { id: "worksheet", title: "ใบงานของหนู", image: "/worksheets/cover.webp" },
      { id: "classroom", title: "ห้องเรียนออนไลน์", image: "/menu/online-classroom.webp" },
      { id: "studio", title: "ห้องสร้างสื่อ", image: "/menu/studio.webp" },
    ],
  },
  {
    id: "activities",
    emoji: "🎈",
    label: "6 กิจกรรมหลัก",
    hint: "กิจกรรมที่เด็ก ๆ ทำทุกวันที่โรงเรียน",
    tint: "bg-pink-soft",
    pictures: [
      { id: "circle", title: "กิจกรรมวงกลม", image: "/activities/circle.webp" },
      { id: "creative", title: "กิจกรรมสร้างสรรค์", image: "/activities/creative.webp" },
      { id: "free", title: "เล่นตามมุม", image: "/activities/free.webp" },
      { id: "game", title: "เกมการศึกษา", image: "/activities/game.webp" },
      { id: "outdoor", title: "เล่นกลางแจ้ง", image: "/activities/outdoor.webp" },
      { id: "story", title: "ฟังนิทาน", image: "/activities/story.webp" },
    ],
  },
  {
    id: "projects",
    emoji: "🌱",
    label: "โครงการของเด็ก ๆ",
    hint: "มะพร้าว มะม่วง และไข่ — เรื่องที่เด็กเคยเรียน",
    tint: "bg-yellow-soft",
    pictures: [
      { id: "coconut", title: "มะพร้าวของเรา", image: "/projects/coconut.webp" },
      { id: "coconut-b", title: "ต้นมะพร้าว", image: "/projects/coconut-banner.webp" },
      { id: "mango", title: "ห้องทดลองมะม่วง", image: "/projects/mango-lab.webp" },
      { id: "mango-b", title: "สวนมะม่วง", image: "/projects/mango-banner.webp" },
      { id: "egg", title: "นักสำรวจไข่", image: "/projects/egg-explorer.webp" },
    ],
  },
  {
    id: "events",
    emoji: "🎉",
    label: "กิจกรรมและเทศกาล",
    hint: "วันกีฬาสี ลอยกระทง และวันพิเศษของโรงเรียน",
    tint: "bg-sky-soft",
    pictures: [
      { id: "sports", title: "วันกีฬาสี", image: "/events/sports.webp" },
      { id: "krathong", title: "ลอยกระทงน้อย", image: "/news/krathong.webp" },
      { id: "egg-nest", title: "รังไข่", image: "/events/egg-nest.webp" },
      { id: "egg-hatch", title: "ลูกเจี๊ยบฟักไข่", image: "/events/egg-hatch-1.webp" },
      { id: "mango-day", title: "วันมะม่วง", image: "/events/mango.webp" },
      { id: "holiday", title: "วันหยุดโรงเรียน", image: "/news/holiday.webp" },
    ],
  },
  {
    id: "art",
    emoji: "🎨",
    label: "ผลงานและศิลปะ",
    hint: "ผลงานของเด็ก ๆ และมุมศิลปะ",
    tint: "bg-purple-100",
    pictures: [
      { id: "clay", title: "งานปั้นดินน้ำมัน", image: "/gallery/clay.webp" },
      { id: "fruit-print", title: "ภาพพิมพ์จากผลไม้", image: "/gallery/fruit-print.webp" },
      { id: "works", title: "ผลงานเด็ก ๆ", image: "/gallery/works.webp" },
      { id: "palette", title: "จานสี", image: "/art/palette.webp" },
      { id: "canvas", title: "กระดาษสร้างสรรค์", image: "/menu/canvas.webp" },
    ],
  },
  {
    id: "grades",
    emoji: "👧",
    label: "พี่ ๆ น้อง ๆ ในโรงเรียน",
    hint: "ภาพประจำระดับชั้น ตั้งแต่เนอสเซอรี่ถึงอนุบาล 3",
    tint: "bg-mint-soft",
    pictures: [
      { id: "nursery", title: "เนอสเซอรี่", image: "/grades/nursery.webp" },
      { id: "k0", title: "เตรียมอนุบาล", image: "/grades/k0.webp" },
      { id: "k1", title: "อนุบาล 1", image: "/grades/k1.webp" },
      { id: "k2", title: "อนุบาล 2", image: "/grades/k2.webp" },
      { id: "k3", title: "อนุบาล 3", image: "/grades/k3.webp" },
    ],
  },
];

export const findJigsawCategory = (id: string) => JIGSAW_CATEGORIES.find((c) => c.id === id);
export const jigsawPictureCount = () => JIGSAW_CATEGORIES.reduce((n, c) => n + c.pictures.length, 0);
/** หมวดที่เล่นได้จริงตอนนี้ (มีภาพแล้ว) */
export const playableCategories = () => JIGSAW_CATEGORIES.filter((c) => c.pictures.length > 0);
/** หมวดที่รอภาพจากครู */
export const waitingCategories = () => JIGSAW_CATEGORIES.filter((c) => c.pictures.length === 0);
