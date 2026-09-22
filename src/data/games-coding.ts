import type { Game } from "@/types";
import { SKILLS as S } from "./game-skills";

/**
 * 💻 Coding & Logic — หมวดที่เพิ่มเกมได้เรื่อย ๆ (เพิ่ม object ใหม่ที่นี่)
 * ปฐมวัย → ประถม → มัธยม ใช้ engine ร่วมกัน: grid-path · direction · pattern · condition · sort · quiz
 * ทุกเกมได้ 🟢🟡🔴 · ออนไลน์/ออฟไลน์ · บันทึกผล · แยกโปรไฟล์ อัตโนมัติจากระบบเดิม
 */
const base = { category: "coding" as const, activityType: "game" as const, planIds: [] as string[] };
const kinder = { ...base, gradeId: "k1", ages: "4–6 ปี" };
const primary = { ...base, gradeId: "primary", ages: "7–12 ปี" };
const secondary = { ...base, gradeId: "secondary", ages: "13–18 ปี" };

export const CODING_GAMES: Game[] = [
  /* 🌱 ปฐมวัย */
  { id: "code-rabbit-home", ...kinder, title: "พากระต่ายกลับบ้าน", emoji: "🐰", cover: "bg-mint-soft", description: "เรียงคำสั่ง ⬆️➡️ ให้กระต่ายเดินกลับบ้าน คิดก่อน แล้วค่อยกด ▶️ เริ่ม", skills: [S.sequence, S.ct, S.solve],
    config: { engine: "grid-path", actor: "🐰", goal: "🏠", levels: { easy: { size: 3, start: [0, 2], target: [2, 0] }, medium: { size: 4, start: [0, 3], target: [3, 0], obstacles: [[1, 2], [2, 1]] }, hard: { size: 5, start: [0, 4], target: [4, 0], obstacles: [[1, 3], [2, 2], [3, 1], [1, 1]], repeat: true, maxCmds: 6 } } } },
  { id: "code-bee-flower", ...kinder, title: "พาผึ้งไปหาดอกไม้", emoji: "🐝", cover: "bg-yellow-soft", description: "ผึ้งน้อยอยากไปเก็บน้ำหวาน ช่วยบอกทางให้ผึ้งบินไปถึงดอกไม้", skills: [S.sequence, S.ct, S.plan],
    config: { engine: "grid-path", actor: "🐝", goal: "🌸", levels: { easy: { size: 3, start: [0, 0], target: [2, 2] }, medium: { size: 4, start: [0, 0], target: [3, 3], obstacles: [[1, 1], [2, 2]] }, hard: { size: 5, start: [0, 0], target: [4, 4], obstacles: [[1, 0], [1, 1], [3, 3], [3, 4], [2, 2]], repeat: true, maxCmds: 6 } } } },
  { id: "code-car-goal", ...kinder, title: "รถน้อยไปถึงจุดหมาย", emoji: "🚗", cover: "bg-sky-soft", description: "ขับรถไปให้ถึงธง 🏁 ระวังต้นไม้ขวางทางนะ", skills: [S.sequence, S.solve, S.plan],
    config: { engine: "grid-path", actor: "🚗", goal: "🏁", levels: { easy: { size: 3, start: [0, 1], target: [2, 1] }, medium: { size: 4, start: [0, 2], target: [3, 1], obstacles: [[1, 1], [2, 2]] }, hard: { size: 5, start: [0, 2], target: [4, 2], obstacles: [[1, 2], [2, 2], [3, 2], [2, 0]], repeat: true, maxCmds: 7 } } } },
  { id: "code-order-commands", ...kinder, title: "เรียงคำสั่งให้ถูกต้อง", emoji: "🧩", cover: "bg-purple-100", description: "ดูเส้นทางจุด ๆ แล้วเรียงคำสั่งให้ตรงกับเส้นทาง", skills: [S.sequence, S.observe, S.ct],
    config: { engine: "grid-path", actor: "🐱", goal: "🐟", levels: { easy: { size: 3, start: [0, 2], target: [2, 1], mode: "trace" }, medium: { size: 4, start: [0, 3], target: [3, 0], obstacles: [[1, 2], [2, 1]], mode: "trace" }, hard: { size: 5, start: [0, 4], target: [4, 0], obstacles: [[1, 3], [2, 2], [3, 1], [3, 3]], mode: "trace", repeat: true, maxCmds: 6 } } } },
  { id: "code-direction", ...kinder, title: "เลือกทิศทาง ซ้าย / ขวา / ขึ้น / ลง", emoji: "➡️", cover: "bg-pink-soft", description: "สัตว์น้อยต้องไปทางไหนถึงจะเจอของที่อยากได้? แตะลูกศรให้ถูก", skills: [S.observe, S.logic],
    config: { engine: "direction", rounds: [{ actor: "🐰", goal: "🥕", dir: "right" }, { actor: "🐱", goal: "🐟", dir: "up" }, { actor: "🐶", goal: "🦴", dir: "left" }, { actor: "🐸", goal: "🪷", dir: "down" }, { actor: "🐻", goal: "🍯", dir: "up" }, { actor: "🐵", goal: "🍌", dir: "right" }, { actor: "🐧", goal: "🐟", dir: "down" }, { actor: "🐥", goal: "🌾", dir: "left" }] } },
  { id: "code-sequence-steps", ...kinder, title: "เรียงลำดับขั้นตอน", emoji: "🔢", cover: "bg-mint-soft", description: "ขั้นตอนไหนมาก่อน-หลัง? เรียงการปลูกต้นไม้และการล้างมือให้ถูก", skills: [S.sequence, S.logic],
    config: { engine: "sort", rounds: [{ title: "ปลูกต้นไม้ ทำอะไรก่อน?", items: [{ emoji: "🕳️", value: 1, label: "ขุดหลุม" }, { emoji: "🌱", value: 2, label: "ใส่เมล็ด" }, { emoji: "🪣", value: 3, label: "กลบดิน" }, { emoji: "💧", value: 4, label: "รดน้ำ" }, { emoji: "🌻", value: 5, label: "ดอกบาน" }] }, { title: "ล้างมือให้สะอาด", items: [{ emoji: "🚰", value: 1, label: "เปิดน้ำ" }, { emoji: "🧼", value: 2, label: "ถูสบู่" }, { emoji: "🙌", value: 3, label: "ถูมือ" }, { emoji: "💦", value: 4, label: "ล้างฟอง" }, { emoji: "🧻", value: 5, label: "เช็ดมือ" }] }, { title: "ไปโรงเรียน", items: [{ emoji: "⏰", value: 1, label: "ตื่นนอน" }, { emoji: "🪥", value: 2, label: "แปรงฟัน" }, { emoji: "👕", value: 3, label: "แต่งตัว" }, { emoji: "🍳", value: 4, label: "กินข้าว" }, { emoji: "🏫", value: 5, label: "ถึงโรงเรียน" }] }] } },
  { id: "code-pattern", ...kinder, title: "ฝึก Pattern และการทำซ้ำ", emoji: "🔁", cover: "bg-yellow-soft", description: "แบบแผน 🔴🔵🔴🔵 ต่อไปคืออะไร? ฝึกสังเกตสิ่งที่ซ้ำ ๆ", skills: [S.pattern, S.observe, S.ct],
    config: { engine: "pattern", rounds: [
      { seq: ["🔴", "🔵", "🔴", "🔵", "🔴"], options: ["🔵", "🔴", "🟢"], answer: "🔵", level: "easy" }, { seq: ["🐱", "🐶", "🐱", "🐶"], options: ["🐱", "🐶", "🐰"], answer: "🐱", level: "easy" }, { seq: ["⭐", "🌙", "⭐", "🌙", "⭐"], options: ["🌙", "⭐", "☀️"], answer: "🌙", level: "easy" }, { seq: ["🍎", "🍌", "🍎", "🍌"], options: ["🍎", "🍌", "🍇"], answer: "🍎", level: "easy" },
      { seq: ["🔴", "🔵", "🔵", "🔴", "🔵", "🔵", "🔴"], options: ["🔵", "🔴", "🟢"], answer: "🔵", level: "medium" }, { seq: ["🐸", "🐸", "🦋", "🐸", "🐸"], options: ["🦋", "🐸", "🐝"], answer: "🦋", level: "medium" }, { seq: ["🟥", "🟨", "🟦", "🟥", "🟨"], options: ["🟦", "🟥", "🟨"], answer: "🟦", level: "medium" }, { seq: ["1", "2", "3", "1", "2"], options: ["3", "1", "2"], answer: "3", level: "medium" },
      { seq: ["🔴", "🔵", "🟢", "🟢", "🔴", "🔵", "🟢", "🟢", "🔴"], options: ["🔵", "🟢", "🔴"], answer: "🔵", level: "hard" }, { seq: ["🐝", "🌸", "🌸", "🐝", "🐝", "🌸", "🌸", "🐝", "🐝", "🌸"], options: ["🌸", "🐝", "🦋"], answer: "🌸", level: "hard" }, { seq: ["2", "4", "6", "8"], options: ["10", "9", "12"], answer: "10", level: "hard" }, { seq: ["⬆️", "➡️", "⬇️", "⬅️", "⬆️", "➡️"], options: ["⬇️", "⬆️", "➡️"], answer: "⬇️", level: "hard" },
    ] } },

  /* 📚 ประถม */
  { id: "code-block-coding", ...primary, title: "Block Coding: พาหุ่นยนต์ไปชาร์จไฟ", emoji: "🤖", cover: "bg-sky-soft", description: "ต่อบล็อกคำสั่งพร้อม 🔁 ทำซ้ำ ให้หุ่นยนต์เดินไปถึงแท่นชาร์จด้วยคำสั่งที่น้อยที่สุด", skills: [S.coding, S.ct, S.plan],
    config: { engine: "grid-path", actor: "🤖", goal: "🔋", levels: { easy: { size: 4, start: [0, 3], target: [3, 0], repeat: true }, medium: { size: 5, start: [0, 4], target: [4, 0], obstacles: [[2, 3], [2, 1], [1, 1]], repeat: true, maxCmds: 6 }, hard: { size: 6, start: [0, 5], target: [5, 0], obstacles: [[1, 4], [1, 3], [3, 3], [3, 2], [4, 1], [2, 0]], repeat: true, maxCmds: 6 } } } },
  { id: "code-loop", ...primary, title: "Loop: ทำซ้ำให้สั้นที่สุด", emoji: "🔁", cover: "bg-mint-soft", description: "เส้นทางยาว แต่ช่องคำสั่งมีจำกัด ต้องใช้ 🔁 ทำซ้ำให้เป็น", skills: [S.coding, S.ct, S.logic],
    config: { engine: "grid-path", actor: "🐢", goal: "🥬", hint: "ช่องคำสั่งมีจำกัด — กดทิศเดิมซ้ำเพื่อสร้าง 🔁 ทำซ้ำ", levels: { easy: { size: 4, start: [0, 3], target: [3, 3], repeat: true, maxCmds: 2 }, medium: { size: 5, start: [0, 4], target: [4, 0], repeat: true, maxCmds: 4 }, hard: { size: 6, start: [0, 5], target: [5, 0], obstacles: [[3, 5], [3, 4], [1, 2], [2, 2]], repeat: true, maxCmds: 5 } } } },
  { id: "code-debug", ...primary, title: "Debugging: หาคำสั่งที่ผิด", emoji: "🐞", cover: "bg-pink-soft", description: "มีคำสั่ง 1 อันทำให้เดินไม่ถึง แตะคำสั่งเพื่อเปลี่ยนทิศแล้วลองรันใหม่", skills: [S.solve, S.logic, S.coding],
    config: { engine: "grid-path", actor: "🐧", goal: "🐟", levels: { easy: { size: 3, start: [0, 2], target: [2, 0], mode: "debug", preset: [{ dir: "up", times: 1 }, { dir: "down", times: 1 }, { dir: "right", times: 1 }, { dir: "right", times: 1 }] }, medium: { size: 4, start: [0, 3], target: [3, 0], obstacles: [[1, 2], [2, 1]], mode: "debug", preset: [{ dir: "up", times: 1 }, { dir: "up", times: 1 }, { dir: "right", times: 1 }, { dir: "up", times: 1 }, { dir: "right", times: 1 }, { dir: "right", times: 1 }] }, hard: { size: 5, start: [0, 4], target: [4, 0], obstacles: [[1, 3], [2, 2], [3, 1]], mode: "debug", preset: [{ dir: "up", times: 1 }, { dir: "up", times: 1 }, { dir: "right", times: 1 }, { dir: "up", times: 1 }, { dir: "right", times: 1 }, { dir: "left", times: 1 }, { dir: "right", times: 1 }, { dir: "right", times: 1 }] } } } },
  { id: "code-maze", ...primary, title: "เขาวงกต", emoji: "🌀", cover: "bg-yellow-soft", description: "วางแผนเส้นทางในเขาวงกตให้หนูน้อยไปถึงชีส", skills: [S.plan, S.solve, S.ct],
    config: { engine: "grid-path", actor: "🐭", goal: "🧀", levels: { easy: { size: 4, start: [0, 0], target: [3, 3], obstacles: [[1, 0], [1, 1], [3, 1], [3, 2], [1, 3]] }, medium: { size: 5, start: [0, 0], target: [4, 4], obstacles: [[1, 0], [1, 1], [1, 2], [3, 1], [3, 2], [3, 3], [3, 4], [1, 4]], repeat: true }, hard: { size: 6, start: [0, 0], target: [5, 5], obstacles: [[1, 0], [1, 1], [1, 2], [1, 3], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [5, 1], [5, 2], [5, 3], [4, 3]], repeat: true, maxCmds: 10 } } } },
  { id: "code-condition", ...primary, title: "If / Then: ถ้า…ให้…", emoji: "🔀", cover: "bg-purple-100", description: "ฝึกเงื่อนไข: ถ้าเจอผลไม้ให้ใส่ตะกร้า ถ้าเจอขยะให้ทิ้งถัง", skills: [S.logic, S.ct, S.coding],
    config: { engine: "condition", rounds: [
      { rule: "ถ้าเป็นผลไม้ → ใส่ตะกร้า · ถ้าไม่ใช่ → ทิ้งถังขยะ", item: "🍎", branches: [{ label: "ใส่ตะกร้า", emoji: "🧺" }, { label: "ทิ้งถังขยะ", emoji: "🗑️" }], answer: 0 },
      { rule: "ถ้าเป็นผลไม้ → ใส่ตะกร้า · ถ้าไม่ใช่ → ทิ้งถังขยะ", item: "🥤", branches: [{ label: "ใส่ตะกร้า", emoji: "🧺" }, { label: "ทิ้งถังขยะ", emoji: "🗑️" }], answer: 1 },
      { rule: "ถ้าฝนตก → กางร่ม · ถ้าแดดออก → ใส่หมวก", item: "🌧️", branches: [{ label: "กางร่ม", emoji: "☂️" }, { label: "ใส่หมวก", emoji: "🧢" }], answer: 0 },
      { rule: "ถ้าฝนตก → กางร่ม · ถ้าแดดออก → ใส่หมวก", item: "☀️", branches: [{ label: "กางร่ม", emoji: "☂️" }, { label: "ใส่หมวก", emoji: "🧢" }], answer: 1 },
      { rule: "ถ้าไฟเขียว → ไป · ถ้าไฟแดง → หยุด · ถ้าไฟเหลือง → ชะลอ", item: "🔴", branches: [{ label: "ไป", emoji: "🚶" }, { label: "หยุด", emoji: "✋" }, { label: "ชะลอ", emoji: "🐢" }], answer: 1 },
      { rule: "ถ้าไฟเขียว → ไป · ถ้าไฟแดง → หยุด · ถ้าไฟเหลือง → ชะลอ", item: "🟡", branches: [{ label: "ไป", emoji: "🚶" }, { label: "หยุด", emoji: "✋" }, { label: "ชะลอ", emoji: "🐢" }], answer: 2 },
      { rule: "ถ้าเลขคู่ → กล่องน้ำเงิน · ถ้าเลขคี่ → กล่องแดง", item: "7", branches: [{ label: "กล่องน้ำเงิน", emoji: "🟦" }, { label: "กล่องแดง", emoji: "🟥" }], answer: 1 },
      { rule: "ถ้าเลขคู่ → กล่องน้ำเงิน · ถ้าเลขคี่ → กล่องแดง", item: "12", branches: [{ label: "กล่องน้ำเงิน", emoji: "🟦" }, { label: "กล่องแดง", emoji: "🟥" }], answer: 0 },
    ] } },
  { id: "code-sequence", ...primary, title: "Sequence: เรียงขั้นตอนโปรแกรม", emoji: "📋", cover: "bg-sky-soft", description: "โปรแกรมทำงานทีละขั้น เรียงลำดับให้ถูกต้อง", skills: [S.sequence, S.ct],
    config: { engine: "sort", rounds: [{ title: "ต้มบะหมี่กึ่งสำเร็จรูป", items: [{ emoji: "🔥", value: 1, label: "ต้มน้ำ" }, { emoji: "🍜", value: 2, label: "ใส่เส้น" }, { emoji: "🧂", value: 3, label: "ใส่เครื่องปรุง" }, { emoji: "⏱️", value: 4, label: "รอ 3 นาที" }, { emoji: "🥣", value: 5, label: "ตักใส่ชาม" }] }, { title: "ส่งอีเมล", items: [{ emoji: "📧", value: 1, label: "เปิดอีเมล" }, { emoji: "✍️", value: 2, label: "พิมพ์ข้อความ" }, { emoji: "👤", value: 3, label: "ใส่ผู้รับ" }, { emoji: "📎", value: 4, label: "แนบไฟล์" }, { emoji: "📤", value: 5, label: "กดส่ง" }] }, { title: "โปรแกรมทักทาย", items: [{ emoji: "▶️", value: 1, label: "เริ่ม" }, { emoji: "⌨️", value: 2, label: "รับชื่อ" }, { emoji: "🧮", value: 3, label: "ต่อคำ สวัสดี+ชื่อ" }, { emoji: "🖥️", value: 4, label: "แสดงผล" }, { emoji: "⏹️", value: 5, label: "จบ" }] }] } },
  { id: "code-algorithm-easy", ...primary, title: "Algorithm ง่าย ๆ", emoji: "🧮", cover: "bg-mint-soft", description: "อัลกอริทึมคือขั้นตอนแก้ปัญหา — ทายผลลัพธ์และเรียงความคิด", skills: [S.logic, S.ct, S.solve],
    config: { engine: "quiz", title: "อัลกอริทึมง่าย ๆ", rounds: [
      { q: "ทำซ้ำ 3 ครั้ง: เดินหน้า 2 ก้าว — รวมเดินกี่ก้าว?", options: ["5", "6", "3", "2"], answer: 1, explain: "3 รอบ × 2 ก้าว = 6 ก้าว", level: "easy" },
      { q: "x = 5 แล้ว x = x + 3 — x เป็นเท่าไร?", code: "x = 5\nx = x + 3", options: ["5", "3", "8", "53"], answer: 2, level: "easy" },
      { q: "ถ้าอยากหาเลขที่มากที่สุดในกล่อง ควรทำอย่างไร?", options: ["ดูทีละตัว จำตัวที่มากที่สุดไว้", "หยิบตัวแรกมาเลย", "เดาสุ่ม", "หยิบตัวสุดท้าย"], answer: 0, level: "medium" },
      { q: "โค้ดนี้แสดงอะไร?", code: "for i in 1..3:\n  print(i * 2)", options: ["1 2 3", "2 4 6", "2 2 2", "3 6 9"], answer: 1, level: "medium" },
      { q: "ขั้นตอนที่ 'ทำซ้ำจนกว่าเงื่อนไขจะเป็นจริง' เรียกว่าอะไร?", options: ["Loop", "Variable", "Function", "Output"], answer: 0, level: "medium" },
      { q: "โค้ดนี้ได้ผลลัพธ์อะไร?", code: "total = 0\nfor n in [1, 2, 3, 4]:\n  if n % 2 == 0:\n    total = total + n\nprint(total)", options: ["10", "6", "4", "3"], answer: 1, explain: "รวมเฉพาะเลขคู่ 2 + 4 = 6", level: "hard" },
      { q: "เรียง 3 หนังสือจากบางไปหนา วิธีไหนแน่นอนที่สุด?", options: ["เปรียบเทียบทีละคู่แล้วสลับ", "วางสุ่ม", "เลือกเล่มที่ชอบก่อน", "ไม่ต้องเปรียบเทียบ"], answer: 0, level: "hard" },
    ] } },

  /* 🔎 มัธยมต้น–ปลาย */
  { id: "code-logic", ...secondary, title: "Logic: ตรรกะ", emoji: "🧠", cover: "bg-purple-100", description: "และ / หรือ / ไม่ · ตารางค่าความจริง · การอนุมาน", skills: [S.logic, S.ct],
    config: { engine: "quiz", title: "ตรรกะ", rounds: [
      { q: "A = จริง, B = เท็จ → (A และ B) เป็น?", options: ["จริง", "เท็จ"], answer: 1, level: "easy" },
      { q: "A = จริง, B = เท็จ → (A หรือ B) เป็น?", options: ["จริง", "เท็จ"], answer: 0, level: "easy" },
      { q: "ไม่(ไม่ A) เท่ากับ?", options: ["A", "ไม่ A", "จริงเสมอ", "เท็จเสมอ"], answer: 0, level: "medium" },
      { q: "ถ้า x > 5 และ x < 8 และ x เป็นจำนวนเต็ม x เป็นได้กี่ค่า?", options: ["1", "2", "3", "4"], answer: 1, explain: "x = 6 หรือ 7", level: "medium" },
      { q: "(A และ ไม่B) หรือ (ไม่A และ B) คือ?", options: ["XOR", "AND", "OR", "NAND"], answer: 0, level: "hard" },
      { q: "ประโยค 'ถ้าฝนตก ถนนเปียก' — ถนนเปียก สรุปได้ว่าฝนตกหรือไม่?", options: ["ได้", "ไม่ได้ (อาจมีสาเหตุอื่น)", "ได้ถ้าเป็นกลางคืน", "ได้เสมอ"], answer: 1, level: "hard" },
    ] } },
  { id: "code-algorithm", ...secondary, title: "Algorithm", emoji: "📐", cover: "bg-sky-soft", description: "Big-O เบื้องต้น · Binary search · Sorting · การเลือกอัลกอริทึม", skills: [S.logic, S.ct, S.solve],
    config: { engine: "quiz", title: "อัลกอริทึม", rounds: [
      { q: "ค้นหาชื่อในสมุดโทรศัพท์ที่เรียงตามตัวอักษร วิธีไหนเร็วที่สุด?", options: ["เปิดตรงกลางแล้วตัดครึ่ง (Binary search)", "ไล่ทีละหน้า", "สุ่มเปิด", "เริ่มจากหน้าสุดท้าย"], answer: 0, level: "easy" },
      { q: "Binary search กับข้อมูล 1,024 รายการ ต้องเปรียบเทียบอย่างมากกี่ครั้ง?", options: ["10", "1024", "512", "32"], answer: 0, explain: "log2(1024) = 10", level: "medium" },
      { q: "Bubble sort จำนวน n รายการ ใช้เวลาประมาณ?", options: ["O(n²)", "O(n)", "O(log n)", "O(1)"], answer: 0, level: "medium" },
      { q: "ฟังก์ชันนี้คืนค่าอะไรเมื่อ n = 5?", code: "def f(n):\n  if n <= 1: return 1\n  return n * f(n - 1)", options: ["120", "15", "5", "25"], answer: 0, explain: "5! = 120 (recursion)", level: "hard" },
      { q: "อัลกอริทึมใดเหมาะกับการหาเส้นทางสั้นที่สุดในกราฟที่น้ำหนักไม่ติดลบ?", options: ["Dijkstra", "Bubble sort", "Binary search", "Linear search"], answer: 0, level: "hard" },
    ] } },
  { id: "code-debug-code", ...secondary, title: "Debug Code", emoji: "🔧", cover: "bg-pink-soft", description: "อ่านโค้ดแล้วหาว่าบรรทัดไหนทำให้ผลผิด", skills: [S.solve, S.logic, S.coding],
    config: { engine: "quiz", title: "หาบั๊ก", rounds: [
      { q: "โค้ดนี้ตั้งใจพิมพ์ 1 ถึง 5 แต่พิมพ์ 1 ถึง 4 — แก้ตรงไหน?", code: "for i in range(1, 5):\n  print(i)", options: ["range(1, 6)", "range(0, 5)", "print(i + 1)", "ไม่ต้องแก้"], answer: 0, level: "easy" },
      { q: "ตั้งใจให้เช็คว่า x เท่ากับ 10 แต่โค้ดกำหนดค่าแทน", code: "if x = 10:\n  print('ten')", options: ["x == 10", "x := 10", "x = 10", "x => 10"], answer: 0, level: "easy" },
      { q: "ฟังก์ชันหาค่าเฉลี่ยคืนค่าผิด — บรรทัดไหนผิด?", code: "def avg(xs):\n  total = 0\n  for x in xs:\n    total = x\n  return total / len(xs)", options: ["total = x ควรเป็น total += x", "return ควรอยู่ใน loop", "len(xs) ผิด", "total = 0 ผิด"], answer: 0, level: "medium" },
      { q: "ลูปนี้ไม่มีวันจบ เพราะอะไร?", code: "i = 0\nwhile i < 5:\n  print(i)", options: ["ไม่ได้เพิ่มค่า i", "ใช้ while ไม่ได้", "print ผิด", "i ต้องเริ่มที่ 1"], answer: 0, level: "medium" },
      { q: "ต้องการนับจำนวนสระในคำ แต่ได้ 0 เสมอ", code: "count = 0\nfor ch in word:\n  if ch in 'aeiou':\n    count == count + 1\nprint(count)", options: ["count == count + 1 ต้องเป็น count += 1", "'aeiou' ผิด", "for ผิด", "print ผิด"], answer: 0, level: "hard" },
    ] } },
  { id: "code-flowchart", ...secondary, title: "Flowchart", emoji: "📊", cover: "bg-yellow-soft", description: "เรียงสัญลักษณ์ผังงานให้เป็นโปรแกรมที่ถูกต้อง", skills: [S.sequence, S.logic, S.ct],
    config: { engine: "sort", rounds: [{ title: "ผังงาน: ตรวจว่าเลขคู่หรือคี่", items: [{ emoji: "⏺️", value: 1, label: "เริ่ม" }, { emoji: "📥", value: 2, label: "รับค่า n" }, { emoji: "🔷", value: 3, label: "n หาร 2 ลงตัว?" }, { emoji: "📤", value: 4, label: "แสดง คู่/คี่" }, { emoji: "⏹️", value: 5, label: "จบ" }] }, { title: "ผังงาน: หาค่ามากสุดของ a, b", items: [{ emoji: "⏺️", value: 1, label: "เริ่ม" }, { emoji: "📥", value: 2, label: "รับ a, b" }, { emoji: "🔷", value: 3, label: "a > b ?" }, { emoji: "🟰", value: 4, label: "max = a หรือ b" }, { emoji: "📤", value: 5, label: "แสดง max" }, { emoji: "⏹️", value: 6, label: "จบ" }] }, { title: "ผังงาน: นับ 1 ถึง 10", items: [{ emoji: "⏺️", value: 1, label: "เริ่ม" }, { emoji: "🟰", value: 2, label: "i = 1" }, { emoji: "🔷", value: 3, label: "i ≤ 10 ?" }, { emoji: "📤", value: 4, label: "แสดง i" }, { emoji: "➕", value: 5, label: "i = i + 1" }, { emoji: "⏹️", value: 6, label: "จบ" }] }] } },
  { id: "code-block-advanced", ...secondary, title: "Block Coding ขั้นสูง", emoji: "🛸", cover: "bg-mint-soft", description: "กระดานใหญ่ สิ่งกีดขวางเยอะ ช่องคำสั่งจำกัด — ต้องใช้ 🔁 อย่างฉลาด", skills: [S.coding, S.ct, S.plan],
    config: { engine: "grid-path", actor: "🛸", goal: "🪐", levels: { easy: { size: 5, start: [0, 4], target: [4, 0], obstacles: [[1, 3], [3, 1]], repeat: true, maxCmds: 5 }, medium: { size: 6, start: [0, 5], target: [5, 0], obstacles: [[1, 5], [1, 4], [2, 2], [3, 2], [4, 1], [4, 0]], repeat: true, maxCmds: 6 }, hard: { size: 7, start: [0, 6], target: [6, 0], obstacles: [[1, 6], [1, 5], [1, 4], [3, 4], [3, 3], [3, 2], [5, 2], [5, 1], [5, 0], [2, 1]], repeat: true, maxCmds: 7 } } } },
  { id: "code-challenge", ...secondary, title: "Coding Challenge: ทายผลลัพธ์", emoji: "🏆", cover: "bg-purple-100", description: "อ่านโค้ดสั้น ๆ แล้วทายว่าจะได้ผลลัพธ์อะไร", skills: [S.coding, S.logic],
    config: { engine: "quiz", title: "ทายผลลัพธ์", rounds: [
      { q: "ผลลัพธ์คือ?", code: "print(len('purple'))", options: ["6", "5", "7", "purple"], answer: 0, level: "easy" },
      { q: "ผลลัพธ์คือ?", code: "print(7 // 2, 7 % 2)", options: ["3 1", "3.5 1", "3 0", "4 1"], answer: 0, level: "easy" },
      { q: "ผลลัพธ์คือ?", code: "xs = [1, 2, 3]\nxs.append(4)\nprint(xs[-1])", options: ["4", "3", "1", "[1,2,3,4]"], answer: 0, level: "medium" },
      { q: "ผลลัพธ์คือ?", code: "s = 0\nfor i in range(1, 4):\n  s += i * i\nprint(s)", options: ["14", "6", "9", "36"], answer: 0, explain: "1 + 4 + 9 = 14", level: "medium" },
      { q: "ผลลัพธ์คือ?", code: "def g(n):\n  return n if n < 2 else g(n-1) + g(n-2)\nprint(g(6))", options: ["8", "6", "13", "5"], answer: 0, explain: "Fibonacci: 0 1 1 2 3 5 8", level: "hard" },
      { q: "ผลลัพธ์คือ?", code: "print(sorted('cab')[0] + str(2 ** 3))", options: ["a8", "c8", "a6", "b8"], answer: 0, level: "hard" },
    ] } },
  { id: "code-problems", ...secondary, title: "โจทย์เขียนโปรแกรม", emoji: "📝", cover: "bg-sky-soft", description: "เลือกวิธีแก้ที่ถูกต้องสำหรับโจทย์โปรแกรมมิ่ง", skills: [S.solve, S.coding, S.ct],
    config: { engine: "quiz", title: "โจทย์โปรแกรม", rounds: [
      { q: "ต้องการกลับด้านสตริง 'abc' → 'cba' ใน Python", options: ["s[::-1]", "s.reverse()", "reverse(s)", "s[-1]"], answer: 0, level: "easy" },
      { q: "ต้องการนับว่ามีเลข 3 กี่ตัวใน list", options: ["xs.count(3)", "len(xs) == 3", "xs.index(3)", "xs[3]"], answer: 0, level: "easy" },
      { q: "ต้องการเก็บคะแนนของนักเรียนหลายคนโดยค้นด้วยชื่อ ควรใช้โครงสร้างข้อมูลใด?", options: ["dict (ชื่อ → คะแนน)", "list", "int", "set"], answer: 0, level: "medium" },
      { q: "ต้องการตรวจว่าปี y เป็นปีอธิกสุรทิน (leap year)", options: ["y % 4 == 0 and (y % 100 != 0 or y % 400 == 0)", "y % 4 == 0", "y % 100 == 0", "y % 400 != 0"], answer: 0, level: "medium" },
      { q: "หาผลรวมของเลขคี่ตั้งแต่ 1 ถึง n อย่างมีประสิทธิภาพ (n ใหญ่มาก)", options: ["ใช้สูตร k² เมื่อ k = จำนวนเลขคี่", "loop ทุกตัวแล้วเช็ค", "recursion", "สุ่ม"], answer: 0, explain: "1+3+…+(2k−1) = k²", level: "hard" },
      { q: "ตรวจว่าวงเล็บในสตริงจับคู่ถูกต้อง เช่น '(()[])' ควรใช้?", options: ["Stack", "Queue", "Binary search", "Sorting"], answer: 0, level: "hard" },
    ] } },
];
