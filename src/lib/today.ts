/**
 * 📅 วันที่ของ "วันนี้" ตามเวลาในเครื่อง (ไม่ใช่ UTC)
 *
 * ห้ามใช้ `new Date().toISOString().slice(0, 10)` กับวันที่ที่เอาไปเทียบหรือแสดงผล
 * เพราะไทยเร็วกว่า UTC 7 ชั่วโมง ช่วงเที่ยงคืนถึงตี 7 จะได้ "เมื่อวาน" เสมอ
 * (ใช้กับชื่อไฟล์ดาวน์โหลดได้ ไม่มีผลอะไร)
 */
const pad = (n: number) => String(n).padStart(2, "0");

/** แปลง Date เป็น YYYY-MM-DD ตามเวลาท้องถิ่น */
export const toLocalISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** วันนี้ในรูปแบบ YYYY-MM-DD ตามเวลาท้องถิ่น */
export const todayLocalISO = () => toLocalISODate(new Date());
