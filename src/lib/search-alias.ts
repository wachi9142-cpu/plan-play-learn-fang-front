/**
 * 🔎 คำค้นภาษาไทยของศัพท์อังกฤษ — พิมพ์ "โค้ด" ก็เจอ Coding, พิมพ์ "ลูป" ก็เจอ Loop
 * ใช้เติมท้ายข้อความที่ใช้ค้น (ข้อความต้องเป็นตัวพิมพ์เล็กแล้ว)
 */
const ALIASES: [string, string][] = [
  ["coding", "โค้ด โค้ดดิ้ง โค้ดดิง โคดดิ้ง เขียนโค้ด เขียนโปรแกรม"],
  ["computational thinking", "วิทยาการคำนวณ คิดเชิงคำนวณ การคิดเชิงคำนวณ"],
  ["algorithm", "อัลกอริทึม อัลกอริธึม ขั้นตอนวิธี"],
  ["debugging", "ดีบัก ดีบั๊ก แก้บั๊ก หาจุดผิด"],
  ["loop", "ลูป วนซ้ำ ทำซ้ำ"],
  ["pattern", "แพทเทิร์น แพตเทิร์น รูปแบบ"],
  ["logic", "ลอจิก ตรรกะ"],
  ["flowchart", "โฟลว์ชาร์ต โฟลชาร์ต ผังงาน"],
  ["condition", "เงื่อนไข ถ้า…แล้ว"],
  ["pseudocode", "ซูโดโค้ด รหัสเทียม"],
  ["sequence", "ลำดับ เรียงลำดับ"],
];

export function withThaiAliases(text: string): string {
  const extra = ALIASES.filter(([en]) => text.includes(en)).map(([, th]) => th);
  return extra.length ? `${text} ${extra.join(" ")}` : text;
}
