import { PLANS, getUnit } from "@/data/plans";
import { WORKSHEETS, WORKSHEET_CATEGORIES } from "@/data/worksheets";
import { GAMES, GAME_CATEGORIES } from "@/data/games";
import { PROJECTS } from "@/data/projects";
import { NEWS, NEWS_CATEGORIES } from "@/data/news";
import { SCHOOL_EVENTS, EVENT_CATEGORIES } from "@/data/school-events";
import { TEACHING_MEDIA, LEARNING_ACTIVITIES } from "@/data/content";
import { SCHEDULES } from "@/data/schedules";

export type SearchKind = "plan" | "worksheet" | "game" | "project" | "news" | "event" | "media" | "activity" | "schedule";

export interface SearchDoc {
  kind: SearchKind;
  href: string;
  emoji: string;
  title: string;
  subtitle?: string;
  text: string;   // ข้อความรวมสำหรับค้นหา (lowercase)
}

export const SEARCH_KINDS: Record<SearchKind, { emoji: string; label: string }> = {
  plan: { emoji: "📖", label: "แผนการจัดประสบการณ์" },
  worksheet: { emoji: "📝", label: "ใบงาน" },
  game: { emoji: "🎮", label: "เกมการศึกษา" },
  project: { emoji: "🌱", label: "โครงการ" },
  news: { emoji: "📣", label: "ประชาสัมพันธ์" },
  event: { emoji: "🎉", label: "กิจกรรมโรงเรียน" },
  media: { emoji: "🎨", label: "สื่อการเรียนการสอน" },
  activity: { emoji: "🧸", label: "กิจกรรมการเรียนรู้" },
  schedule: { emoji: "📅", label: "กำหนดการสอน" },
};

const j = (...parts: (string | string[] | undefined)[]) => parts.flat().filter(Boolean).join(" ").toLowerCase();

/** ดัชนีค้นหาทั้งเว็บ — สร้างครั้งเดียวตอนโหลด */
export const SEARCH_INDEX: SearchDoc[] = [
  ...PLANS.map((p) => ({ kind: "plan" as const, href: `/plans/${p.id}`, emoji: p.emoji, title: `เรื่อง ${p.title}`, subtitle: `หน่วย ${getUnit(p.unitId)?.name ?? ""}${p.strand ? ` · ${p.strand}` : ""}`, text: j(p.title, getUnit(p.unitId)?.name, p.strand, p.description, p.keywords, p.weeks.map((w) => w.title), p.weeks.flatMap((w) => w.days.flatMap((d) => d.activities.map((a) => a.title)))) })),
  ...WORKSHEETS.map((w) => ({ kind: "worksheet" as const, href: `/worksheets/${w.id}`, emoji: w.emoji, title: w.title, subtitle: WORKSHEET_CATEGORIES[w.category].label, text: j(w.title, w.description, w.skills, w.tags, WORKSHEET_CATEGORIES[w.category].label) })),
  ...GAMES.map((g) => ({ kind: "game" as const, href: `/games/${g.id}`, emoji: g.emoji, title: g.title, subtitle: GAME_CATEGORIES[g.category].label, text: j(g.title, g.description, g.skills, GAME_CATEGORIES[g.category].label) })),
  ...PROJECTS.map((p) => ({ kind: "project" as const, href: `/projects/${p.id}`, emoji: p.emoji, title: `โครงการ${p.title}`, subtitle: p.subtitle, text: j(p.title, p.subtitle, p.description, p.goals) })),
  ...NEWS.map((n) => ({ kind: "news" as const, href: `/news/${n.id}`, emoji: NEWS_CATEGORIES[n.category].emoji, title: n.title, subtitle: n.dateLabel, text: j(n.title, n.summary, n.body) })),
  ...SCHOOL_EVENTS.map((e) => ({ kind: "event" as const, href: `/school-events/${e.id}`, emoji: e.emoji, title: e.title, subtitle: `${EVENT_CATEGORIES[e.category].label} · ${e.dateLabel}`, text: j(e.title, e.description, e.highlights) })),
  ...TEACHING_MEDIA.map((m) => ({ kind: "media" as const, href: `/media#${m.id}`, emoji: m.emoji, title: m.title, subtitle: m.kind, text: j(m.title, m.kind, m.description, m.usage) })),
  ...LEARNING_ACTIVITIES.map((a) => ({ kind: "activity" as const, href: `/activities/${a.id}`, emoji: a.emoji, title: a.title, subtitle: a.category, text: j(a.title, a.category, a.description, a.skills) })),
  ...SCHEDULES.map((s) => ({ kind: "schedule" as const, href: `/schedules/${s.id}`, emoji: "📅", title: s.title, subtitle: `${s.semester} ${s.year}`, text: j(s.title, s.semester, s.year, s.description) })),
];

export function searchAll(query: string, kinds?: SearchKind[]) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  return SEARCH_INDEX
    .filter((d) => (!kinds || kinds.includes(d.kind)) && terms.every((t) => d.text.includes(t)))
    .map((d) => ({ ...d, score: (d.title.toLowerCase().includes(q) ? 2 : 0) + terms.filter((t) => d.title.toLowerCase().includes(t)).length }))
    .sort((a, b) => b.score - a.score);
}
