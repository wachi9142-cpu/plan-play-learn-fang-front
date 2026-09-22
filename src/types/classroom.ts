/** 💜 ห้องเรียนออนไลน์ — Little Purple Garden Online Classroom */

export type ClassGradeId = "nursery" | "k0" | "k1" | "k2" | "k3" | "special";
export type ClassRole = "teacher" | "child" | "parent";
export type RoomStatus = "open" | "closed";

export interface ClassRoom {
  id: string;
  gradeId: ClassGradeId;
  /** รหัสห้องจริง เช่น "อนุบาล 3/1" · "Nursery / ห้อง 1" · ห้องพิเศษเป็นชื่อที่ครูตั้ง */
  code: string;
  roomNo?: number;
  /** ชื่อเล่นที่แสดง เช่น "ห้องพี่สายรุ้ง" (แก้ได้ภายหลัง) */
  nickname: string;
  emoji: string;
  description?: string;
  teacher: string;
  status: RoomStatus;
  inviteCode: string;
  /** ตารางเรียนสด เช่น "จ–ศ 09:00–09:40" */
  liveTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StarEntry { id: string; reason: string; at: string; by: string }

/** สมาชิกห้อง (เด็ก/ผู้ปกครอง ที่ครูเชิญหรืออนุมัติแล้ว) */
export interface ClassMember {
  id: string;
  roomId: string;
  name: string;
  role: ClassRole;
  /** ผู้ปกครองของเด็กชื่ออะไร */
  childName?: string;
  approved: boolean;
  stars: StarEntry[];
  filterAllowed: boolean;
  joinedAt: string;
  note?: string;
}

export type ChatKind = "text" | "announce" | "homework" | "file" | "link" | "activity" | "schedule";
export interface ChatMessage {
  id: string;
  roomId: string;
  by: { id: string; name: string; role: ClassRole };
  kind: ChatKind;
  text: string;
  at: string;
  attachment?: { name: string; mime: string; size: number; data?: string; assetId?: string };
  link?: string;
}

export type ArchiveKind = "image" | "video" | "file" | "other";
export interface ArchiveItem {
  id: string;
  roomId: string;
  kind: ArchiveKind;
  title: string;
  date: string;         // ISO
  unitId?: string;
  activity?: string;
  note?: string;
  /** ไฟล์ใน IndexedDB (assets, docId = `class:<roomId>`) */
  assetId?: string;
  mime?: string;
  size?: number;
  url?: string;         // ลิงก์ภายนอก (YouTube ฯลฯ)
  thumb?: string;
  by: string;
  sessionId?: string;
}

export interface LiveSession { id: string; roomId: string; title: string; startedAt: string; endedAt?: string; attendees: string[]; recordingId?: string }

export type ConnStatus = "green" | "orange" | "red";
export type PartStatus = "green" | "yellow" | "red";

export type StickerId = "none" | "cat" | "dog" | "crown" | "bunny" | "star" | "flower" | "happy" | "sleepy" | "sad" | "love";

/** สถานะผู้ร่วมเรียนสด (ส่งผ่าน relay) */
export interface LiveParticipant {
  id: string;
  name: string;
  role: ClassRole;
  childName?: string;
  color: string;
  approved: boolean;
  mic: boolean;
  cam: boolean;
  sticker: StickerId;
  filterAllowed: boolean;
  hand: boolean;
  conn: ConnStatus;
  lastActive: number;
  lastSeen: number;
  sharing?: boolean;
}

export type LiveMessage =
  | { t: "hello"; room: string; who: LiveParticipant }
  | { t: "presence"; room: string; who: LiveParticipant }
  | { t: "bye"; room: string; who: string }
  | { t: "admit"; room: string; to: string; ok: boolean; by: string }
  | { t: "kick"; room: string; to: string }
  | { t: "control"; room: string; to: string; mic?: boolean; cam?: boolean; filterAllowed?: boolean }
  | { t: "star"; room: string; to: string; toName: string; reason: string; by: string }
  | { t: "ping"; room: string; by: string }
  | { t: "pong"; room: string; who: string }
  | { t: "chat"; room: string; msg: ChatMessage }
  | { t: "rtc"; room: string; from: string; to: string; kind: "offer" | "answer" | "ice"; data: unknown }
  | { t: "live"; room: string; on: boolean; by: string; sessionId?: string }
  | { t: "archive"; room: string; item: ArchiveItem };
