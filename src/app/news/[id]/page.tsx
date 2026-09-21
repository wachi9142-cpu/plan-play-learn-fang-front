import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays } from "lucide-react";
import { NEWS, NEWS_CATEGORIES, getNews } from "@/data/news";
import { Breadcrumb, PageHeader, Tag } from "@/components/ui";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return NEWS.map((n) => ({ id: n.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return { title: getNews(id)?.title ?? "ไม่พบประกาศ" };
}

export default async function NewsDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const n = getNews(id);
  if (!n) notFound();
  const c = NEWS_CATEGORIES[n.category];
  return (
    <div className="container-page max-w-3xl py-8 sm:py-12">
      <Breadcrumb items={[{ label: "ประชาสัมพันธ์", href: "/news" }, { label: n.title }]} />
      <PageHeader emoji={c.emoji} title={n.title}>
        <div className="flex flex-wrap gap-2">
          <Tag tone={c.tone}>{c.label}</Tag>
          <Tag tone="sky"><CalendarDays size={13} className="mr-1" /> {n.dateLabel}</Tag>
        </div>
      </PageHeader>
      <article className="card animate-rise delay-1 p-5 sm:p-6">
        <p className="text-base leading-relaxed sm:text-lg">{n.summary}</p>
        {n.body?.map((p, i) => <p key={i} className="mt-3 text-[15px] leading-relaxed sm:text-base">{p}</p>)}
        {n.link && (
          <Link href={n.link.href} className="tap mt-5 inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700">
            {n.link.label} <ArrowRight size={16} />
          </Link>
        )}
      </article>
    </div>
  );
}
