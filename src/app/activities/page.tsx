import Link from "next/link";
import type { Metadata } from "next";
import { Clock, Baby } from "lucide-react";
import { LEARNING_ACTIVITIES } from "@/data/content";
import { PageHeader, Tag } from "@/components/ui";

export const metadata: Metadata = { title: "กิจกรรมการเรียนรู้" };

export default function ActivitiesPage() {
  return (
    <div className="container-page py-8 sm:py-12">
      <PageHeader emoji="🧸" title="กิจกรรมการเรียนรู้" description="ไอเดียกิจกรรมที่หยิบไปใช้ได้ทันที พร้อมจุดประสงค์ อุปกรณ์ และขั้นตอน" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LEARNING_ACTIVITIES.map((a, i) => (
          <Link
            key={a.id}
            href={`/activities/${a.id}`}
            className="card card-hover animate-rise flex flex-col p-5"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="flex items-start gap-3">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-pink-soft text-3xl">{a.emoji}</span>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-purple-500">{a.category}</p>
                <h2 className="text-lg sm:text-xl">{a.title}</h2>
              </div>
            </div>
            <p className="mt-3 flex-1 text-[15px] text-ink-soft">{a.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-soft">
              <span className="inline-flex items-center gap-1"><Baby size={14} /> {a.age}</span>
              <span className="inline-flex items-center gap-1"><Clock size={14} /> {a.duration}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {a.skills.map((s) => <Tag key={s} tone="mint">{s}</Tag>)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
