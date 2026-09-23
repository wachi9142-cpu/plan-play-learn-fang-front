import Link from "next/link";
import { NavIcon } from "@/components/ui/NavIcon";
import type { Metadata } from "next";
import { ArrowRight, Clock } from "lucide-react";
import { PROJECTS } from "@/data/projects";
import { getPlan } from "@/data/plans";
import { PageHeader, Tag } from "@/components/ui";

export const metadata: Metadata = { title: "โครงการ" };

export default function ProjectsPage() {
  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader emoji="📚" image="/menu/projects.webp" title="โครงการ" description="โครงการเรียนรู้แบบ Project Approach ที่เด็ก ๆ ได้สำรวจ ทดลอง และลงมือทำจริง" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((p, i) => (
          <Link key={p.id} href={`/projects/${p.id}`} className="card card-hover animate-rise group flex flex-col p-5" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="flex items-start gap-3">
              <NavIcon emoji={p.emoji} image={p.image} label={p.title} tint="bg-yellow-soft" className="size-14 text-3xl transition-transform group-hover:-rotate-6" />
              <div className="min-w-0">
                <h2 className="text-lg leading-snug sm:text-xl">{p.title}</h2>
                {p.subtitle && <p className="text-[13px] text-purple-500">{p.subtitle}</p>}
              </div>
            </div>
            <p className="mt-3 flex-1 text-[15px] text-ink-soft">{p.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <Tag tone="sky"><Clock size={13} className="mr-1" /> {p.duration}</Tag>
              {p.relatedPlanIds?.map((id) => {
                const plan = getPlan(id);
                return plan ? <Tag key={id} tone="purple">{plan.emoji} {plan.title}</Tag> : null;
              })}
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-[15px] font-medium text-purple-600">
              ดูรายละเอียดโครงการ <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
