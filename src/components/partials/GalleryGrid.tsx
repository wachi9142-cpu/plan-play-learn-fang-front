import Link from "next/link";
import type { GalleryItem } from "@/data/gallery";
import { getPlan } from "@/data/plans";
import { getProject } from "@/data/projects";
import { EmptyState, Tag } from "@/components/ui";

const TINTS = ["bg-purple-100", "bg-pink-soft", "bg-yellow-soft", "bg-mint-soft", "bg-sky-soft"];

/** ตารางแกลเลอรี — ถ้ามี image ใช้รูปจริง ไม่มีแสดง emoji */
export function GalleryGrid({ items, emptyTitle }: { items: GalleryItem[]; emptyTitle: string }) {
  if (items.length === 0) return <EmptyState emoji="📷" title={emptyTitle} hint="เพิ่มรายการใน src/data/gallery.ts และวางรูปใน public/gallery/" />;
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {items.map((g, i) => {
        const plan = g.planId ? getPlan(g.planId) : undefined;
        const project = g.projectId ? getProject(g.projectId) : undefined;
        const link = plan ? { href: `/plans/${plan.id}`, label: `📖 ${plan.title}` } : project ? { href: `/projects/${project.id}`, label: `🌱 ${project.title}` } : null;
        return (
          <figure key={g.id} className="card card-hover animate-rise flex flex-col overflow-hidden" style={{ animationDelay: `${Math.min(i, 7) * 60}ms` }}>
            {g.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={g.image} alt={g.title} className="aspect-square w-full object-cover" loading="lazy" />
            ) : (
              <div className={`grid aspect-square place-items-center overflow-hidden text-6xl sm:text-7xl ${TINTS[i % TINTS.length]}`} aria-hidden>
                {g.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={g.icon} alt="" className="h-[58%]! w-auto object-contain" />
                ) : (
                  g.emoji
                )}
              </div>
            )}
            <figcaption className="flex flex-1 flex-col p-3 sm:p-4">
              <p className="text-[12px] text-ink-soft">{g.date}</p>
              <h3 className="text-base leading-snug sm:text-lg">{g.title}</h3>
              {g.description && <p className="mt-1 flex-1 text-[13px] text-ink-soft sm:text-[14px]">{g.description}</p>}
              {g.tags && <div className="mt-2 flex flex-wrap gap-1">{g.tags.map((t) => <Tag key={t} tone="yellow" className="text-[11px]">{t}</Tag>)}</div>}
              {link && <Link href={link.href} className="mt-2 truncate text-[13px] font-medium text-purple-600 hover:underline">{link.label}</Link>}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
