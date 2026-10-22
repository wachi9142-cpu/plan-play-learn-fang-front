/**
 * 🖼️ เกมสร้างฉาก — ฉากพื้นหลัง + ถาดสติกเกอร์ให้เด็กเลือกมาวางเอง
 *
 * แทนใบงาน "ระบายสี ตัด แล้วแปะ" ให้เป็นแบบออนไลน์ — ไม่ต้องปริ้น ไม่ต้องใช้กรรไกรและกาว
 * ไม่มีผิดถูก เด็กจัดวางได้ตามใจ แล้วเล่าเรื่องจากภาพของตัวเอง
 *
 * เพิ่มฉากใหม่ = เพิ่ม 1 ก้อนใน SCENES · เพิ่มสติกเกอร์ = เพิ่ม 1 บรรทัดในกลุ่มที่ใช่
 */

export interface StickerGroup {
  emoji: string;
  label: string;
  /** สติกเกอร์ในกลุ่มนี้ — ใช้ emoji เพื่อให้ขึ้นทุกเครื่องโดยไม่ต้องรอภาพจริง */
  items: { emoji: string; label: string }[];
}

export interface Scene {
  id: string;
  emoji: string;
  label: string;
  labelEn: string;
  /** คำชวนก่อนเริ่มวาง */
  hint: string;
  tint: string;
  /** สีท้องฟ้าบน–ล่าง */
  sky: [string, string];
  /** สีพื้นบน–ล่าง */
  ground: [string, string];
  /** ส่วนสูงของพื้น คิดเป็น % ของฉาก */
  groundAt: number;
  /** ฉากหลังไกล ๆ ที่วาดไว้ให้แล้ว เด็กวางทับได้ */
  backdrop: string[];
  groups: StickerGroup[];
  /** คำถามชวนเล่าเรื่องหลังวางเสร็จ */
  tell: string[];
}

export const SCENES: Scene[] = [
  {
    id: "forest",
    emoji: "🌲",
    label: "ป่าไม้",
    labelEn: "Forest",
    hint: "ป่าใหญ่มีสัตว์อะไรอยู่บ้างนะ ลองจัดป่าของหนูเอง",
    tint: "bg-mint-soft",
    sky: ["#d9efff", "#f3fbff"],
    ground: ["#a8d08d", "#7fb96a"],
    groundAt: 62,
    backdrop: ["🌲", "🌳", "🌲", "🌳", "🌲"],
    groups: [
      {
        emoji: "🦊",
        label: "สัตว์ป่า",
        items: [
          { emoji: "🦊", label: "สุนัขจิ้งจอก" }, { emoji: "🦌", label: "กวาง" }, { emoji: "🐰", label: "กระต่าย" },
          { emoji: "🦔", label: "เม่น" }, { emoji: "🐿️", label: "กระรอก" }, { emoji: "🦉", label: "นกฮูก" },
          { emoji: "🐻", label: "หมี" }, { emoji: "🐗", label: "หมูป่า" }, { emoji: "🦅", label: "นกอินทรี" },
          { emoji: "🦋", label: "ผีเสื้อ" }, { emoji: "🐝", label: "ผึ้ง" }, { emoji: "🐛", label: "หนอน" },
        ],
      },
      {
        emoji: "🌳",
        label: "ต้นไม้และพุ่มไม้",
        items: [
          { emoji: "🌲", label: "ต้นสน" }, { emoji: "🌳", label: "ต้นไม้ใหญ่" }, { emoji: "🌴", label: "ต้นปาล์ม" },
          { emoji: "🪴", label: "ต้นไม้กระถาง" }, { emoji: "🌿", label: "พุ่มไม้" }, { emoji: "☘️", label: "ใบโคลเวอร์" },
        ],
      },
      {
        emoji: "🍄",
        label: "พื้นป่า",
        items: [
          { emoji: "🍄", label: "เห็ด" }, { emoji: "🪨", label: "ก้อนหิน" }, { emoji: "🪵", label: "ท่อนไม้" },
          { emoji: "🌼", label: "ดอกไม้เล็ก" }, { emoji: "🌻", label: "ทานตะวัน" }, { emoji: "🍂", label: "ใบไม้ร่วง" },
        ],
      },
      {
        emoji: "☀️",
        label: "ท้องฟ้า",
        items: [
          { emoji: "☀️", label: "ดวงอาทิตย์" }, { emoji: "☁️", label: "ก้อนเมฆ" }, { emoji: "🌈", label: "รุ้ง" },
          { emoji: "🐦", label: "นก" }, { emoji: "🌙", label: "ดวงจันทร์" }, { emoji: "⭐", label: "ดาว" },
        ],
      },
    ],
    tell: ["ในป่าของหนูมีสัตว์อะไรบ้าง", "สัตว์ตัวไหนอยู่ใกล้ต้นไม้ที่สุด", "ถ้าหนูเข้าไปในป่านี้ หนูจะไปเล่นตรงไหน"],
  },
  {
    id: "sea",
    emoji: "🐠",
    label: "ใต้ทะเล",
    labelEn: "Under the Sea",
    hint: "ใต้ทะเลลึกมีใครอยู่บ้าง จัดโลกใต้น้ำของหนูได้เลย",
    tint: "bg-sky-soft",
    sky: ["#7fd2f0", "#2e9fd0"],
    ground: ["#f3e2b8", "#e2c98f"],
    groundAt: 78,
    backdrop: ["🪸", "🌊", "🪸", "🐚", "🪸"],
    groups: [
      {
        emoji: "🐠",
        label: "สัตว์น้ำ",
        items: [
          { emoji: "🐠", label: "ปลาสวยงาม" }, { emoji: "🐟", label: "ปลา" }, { emoji: "🐡", label: "ปลาปักเป้า" },
          { emoji: "🐢", label: "เต่าทะเล" }, { emoji: "🐙", label: "ปลาหมึกยักษ์" }, { emoji: "🦑", label: "ปลาหมึก" },
          { emoji: "🦈", label: "ฉลาม" }, { emoji: "🐬", label: "โลมา" }, { emoji: "🐋", label: "วาฬ" },
          { emoji: "🦐", label: "กุ้ง" }, { emoji: "🦀", label: "ปู" }, { emoji: "🐚", label: "หอย" },
        ],
      },
      {
        emoji: "🪸",
        label: "พื้นทะเล",
        items: [
          { emoji: "🪸", label: "ปะการัง" }, { emoji: "🌿", label: "สาหร่าย" }, { emoji: "🪨", label: "ก้อนหิน" },
          { emoji: "⭐", label: "ปลาดาว" }, { emoji: "🏖️", label: "หาดทราย" }, { emoji: "🫧", label: "ฟองอากาศ" },
        ],
      },
      {
        emoji: "⛵",
        label: "ของในทะเล",
        items: [
          { emoji: "⛵", label: "เรือใบ" }, { emoji: "🚤", label: "เรือเร็ว" }, { emoji: "⚓", label: "สมอเรือ" },
          { emoji: "🏴‍☠️", label: "ธงโจรสลัด" }, { emoji: "🗝️", label: "กุญแจ" }, { emoji: "💎", label: "อัญมณี" },
        ],
      },
    ],
    tell: ["ใต้ทะเลของหนูมีปลาอะไรบ้าง", "ตัวไหนใหญ่ที่สุด ตัวไหนเล็กที่สุด", "ปลาตัวนี้กำลังจะว่ายไปไหนนะ"],
  },
  {
    id: "farm",
    emoji: "🚜",
    label: "ฟาร์มของเรา",
    labelEn: "Our Farm",
    hint: "ในฟาร์มมีสัตว์และพืชผักอะไร ลองจัดฟาร์มของหนู",
    tint: "bg-yellow-soft",
    sky: ["#cfe9ff", "#fdf6e3"],
    ground: ["#bcd98a", "#94bd63"],
    groundAt: 58,
    backdrop: ["🌾", "🏡", "🌾", "🌳", "🌾"],
    groups: [
      {
        emoji: "🐄",
        label: "สัตว์ในฟาร์ม",
        items: [
          { emoji: "🐄", label: "วัว" }, { emoji: "🐖", label: "หมู" }, { emoji: "🐑", label: "แกะ" },
          { emoji: "🐓", label: "ไก่" }, { emoji: "🐥", label: "ลูกเจี๊ยบ" }, { emoji: "🦆", label: "เป็ด" },
          { emoji: "🐴", label: "ม้า" }, { emoji: "🐐", label: "แพะ" }, { emoji: "🐇", label: "กระต่าย" },
          { emoji: "🐕", label: "สุนัข" }, { emoji: "🐈", label: "แมว" }, { emoji: "🦃", label: "ไก่งวง" },
        ],
      },
      {
        emoji: "🥕",
        label: "พืชผัก",
        items: [
          { emoji: "🌾", label: "ต้นข้าว" }, { emoji: "🌽", label: "ข้าวโพด" }, { emoji: "🥕", label: "แครอท" },
          { emoji: "🍅", label: "มะเขือเทศ" }, { emoji: "🎃", label: "ฟักทอง" }, { emoji: "🍎", label: "แอปเปิล" },
          { emoji: "🌻", label: "ทานตะวัน" }, { emoji: "🪴", label: "ต้นกล้า" },
        ],
      },
      {
        emoji: "🏡",
        label: "สิ่งก่อสร้าง",
        items: [
          { emoji: "🏡", label: "บ้าน" }, { emoji: "🚜", label: "รถแทรกเตอร์" }, { emoji: "🧺", label: "ตะกร้า" },
          { emoji: "🪣", label: "ถัง" }, { emoji: "🚧", label: "รั้ว" }, { emoji: "💧", label: "น้ำ" },
        ],
      },
    ],
    tell: ["ในฟาร์มของหนูมีสัตว์กี่ตัว", "สัตว์ตัวไหนให้นมเราได้", "ถ้าหนูเป็นชาวนา หนูจะทำอะไรก่อน"],
  },
  {
    id: "school",
    emoji: "🏫",
    label: "โรงเรียนของเรา",
    labelEn: "Our School",
    hint: "จัดสนามเด็กเล่นและโรงเรียนในแบบที่หนูอยากให้เป็น",
    tint: "bg-pink-soft",
    sky: ["#dbeaff", "#fbf4ff"],
    ground: ["#b9e3a6", "#8ec97a"],
    groundAt: 60,
    backdrop: ["🏫", "🌳", "🚩", "🌳", "🏫"],
    groups: [
      {
        emoji: "🧒",
        label: "คนในโรงเรียน",
        items: [
          { emoji: "🧒", label: "เด็ก" }, { emoji: "👧", label: "เด็กหญิง" }, { emoji: "👦", label: "เด็กชาย" },
          { emoji: "👩‍🏫", label: "คุณครู" }, { emoji: "👨‍🍳", label: "แม่ครัว" }, { emoji: "🧑‍⚕️", label: "พยาบาล" },
          { emoji: "👮", label: "ตำรวจ" }, { emoji: "👨‍👩‍👧", label: "ผู้ปกครอง" },
        ],
      },
      {
        emoji: "🛝",
        label: "สนามเด็กเล่น",
        items: [
          { emoji: "🛝", label: "สไลเดอร์" }, { emoji: "⚽", label: "ลูกบอล" }, { emoji: "🪁", label: "ว่าว" },
          { emoji: "🧸", label: "ตุ๊กตาหมี" }, { emoji: "🏀", label: "บาสเกตบอล" }, { emoji: "🤸", label: "เด็กเล่น" },
          { emoji: "🪀", label: "ลูกข่าง" }, { emoji: "🎈", label: "ลูกโป่ง" },
        ],
      },
      {
        emoji: "🏫",
        label: "อาคารและของใช้",
        items: [
          { emoji: "🏫", label: "อาคารเรียน" }, { emoji: "🚌", label: "รถโรงเรียน" }, { emoji: "🚩", label: "เสาธง" },
          { emoji: "🪑", label: "เก้าอี้" }, { emoji: "📚", label: "หนังสือ" }, { emoji: "🎒", label: "กระเป๋า" },
          { emoji: "🌳", label: "ต้นไม้" }, { emoji: "🌷", label: "ดอกไม้" },
        ],
      },
    ],
    tell: ["ในโรงเรียนของหนูมีอะไรบ้าง", "หนูชอบเล่นตรงไหนมากที่สุด", "ใครอยู่ในภาพของหนูบ้าง"],
  },
  {
    id: "garden",
    emoji: "🌷",
    label: "สวนดอกไม้",
    labelEn: "Flower Garden",
    hint: "ปลูกดอกไม้ให้สวนของหนูสวยที่สุด",
    tint: "bg-purple-100",
    sky: ["#ffe9f4", "#fff8fb"],
    ground: ["#c5e8a8", "#9ad17c"],
    groundAt: 55,
    backdrop: ["🌳", "🏡", "🌳", "🌲", "🌳"],
    groups: [
      {
        emoji: "🌻",
        label: "ดอกไม้",
        items: [
          { emoji: "🌻", label: "ทานตะวัน" }, { emoji: "🌹", label: "กุหลาบ" }, { emoji: "🌷", label: "ทิวลิป" },
          { emoji: "🌼", label: "เดซี่" }, { emoji: "🌺", label: "ชบา" }, { emoji: "🪷", label: "บัว" },
          { emoji: "💐", label: "ช่อดอกไม้" }, { emoji: "🏵️", label: "ดอกไม้ประดับ" },
        ],
      },
      {
        emoji: "🦋",
        label: "แมลงและสัตว์เล็ก",
        items: [
          { emoji: "🦋", label: "ผีเสื้อ" }, { emoji: "🐝", label: "ผึ้ง" }, { emoji: "🐞", label: "เต่าทอง" },
          { emoji: "🐛", label: "หนอน" }, { emoji: "🐌", label: "หอยทาก" }, { emoji: "🐜", label: "มด" },
          { emoji: "🕊️", label: "นกพิราบ" }, { emoji: "🐸", label: "กบ" },
        ],
      },
      {
        emoji: "🪴",
        label: "ของในสวน",
        items: [
          { emoji: "🪴", label: "กระถางต้นไม้" }, { emoji: "🪣", label: "บัวรดน้ำ" }, { emoji: "🪨", label: "ก้อนหิน" },
          { emoji: "🧺", label: "ตะกร้า" }, { emoji: "🪑", label: "เก้าอี้" }, { emoji: "⛲", label: "น้ำพุ" },
          { emoji: "🌿", label: "พุ่มไม้" }, { emoji: "🍄", label: "เห็ด" },
        ],
      },
    ],
    tell: ["สวนของหนูมีดอกไม้สีอะไรบ้าง", "ผีเสื้อชอบเกาะดอกไหน", "ถ้าหนูปลูกดอกไม้จริง หนูจะดูแลมันอย่างไร"],
  },
  {
    id: "space",
    emoji: "🚀",
    label: "อวกาศ",
    labelEn: "Outer Space",
    hint: "สร้างจักรวาลของหนูเอง จะมีกี่ดาวก็ได้",
    tint: "bg-purple-100",
    sky: ["#2b2150", "#5b4591"],
    ground: ["#9b8bbd", "#6f619a"],
    groundAt: 80,
    backdrop: ["⭐", "✨", "🌟", "✨", "⭐"],
    groups: [
      {
        emoji: "🪐",
        label: "ดวงดาว",
        items: [
          { emoji: "🪐", label: "ดาวเสาร์" }, { emoji: "🌍", label: "โลก" }, { emoji: "🌕", label: "ดวงจันทร์" },
          { emoji: "☀️", label: "ดวงอาทิตย์" }, { emoji: "⭐", label: "ดาว" }, { emoji: "🌟", label: "ดาวส่องแสง" },
          { emoji: "💫", label: "ดาวตก" }, { emoji: "☄️", label: "ดาวหาง" },
        ],
      },
      {
        emoji: "🚀",
        label: "ยานและนักบิน",
        items: [
          { emoji: "🚀", label: "จรวด" }, { emoji: "🛸", label: "จานบิน" }, { emoji: "🛰️", label: "ดาวเทียม" },
          { emoji: "👨‍🚀", label: "นักบินอวกาศ" }, { emoji: "👽", label: "มนุษย์ต่างดาว" }, { emoji: "🤖", label: "หุ่นยนต์" },
          { emoji: "🔭", label: "กล้องดูดาว" }, { emoji: "🚩", label: "ธง" },
        ],
      },
    ],
    tell: ["ในอวกาศของหนูมีดาวกี่ดวง", "จรวดลำนี้จะไปดาวไหน", "ถ้าหนูไปอวกาศ หนูจะเอาอะไรไปด้วย"],
  },
];

export const findScene = (id: string) => SCENES.find((s) => s.id === id);
