import type { Activity } from "@/types";
import { ACTIVITY_META } from "@/data/plans";
import { Tag } from "@/components/ui";

const TYPE_TINT: Record<Activity["type"], string> = {
  circle: "bg-sky-soft",
  story: "bg-yellow-soft",
  creative: "bg-pink-soft",
  free: "bg-mint-soft",
  outdoor: "bg-[#e8f3d6]",
  game: "bg-purple-100",
};

export function ActivityCard({ activity, index }: { activity: Activity; index?: number }) {
  const meta = ACTIVITY_META[activity.type];
  return (
    <article className="card animate-rise overflow-hidden" style={index ? { animationDelay: `${index * 80}ms` } : undefined}>
      <header className="flex items-start gap-3 border-b border-line px-5 py-4 sm:px-6">
        <span className={`grid size-12 shrink-0 place-items-center rounded-xl text-2xl ${TYPE_TINT[activity.type]}`}>{meta.emoji}</span>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-purple-500">{meta.label}</p>
          <h3 className="text-lg sm:text-xl">“{activity.title}”</h3>
        </div>
      </header>

      <div className="grid gap-5 px-5 py-5 sm:px-6 md:grid-cols-2">
        <Block emoji="🎯" title="จุดประสงค์">
          <ul className="space-y-1.5">
            {activity.objectives.map((o, i) => (
              <li key={i} className="flex gap-2 text-[15px] sm:text-base"><span className="text-purple-400">•</span><span>{o}</span></li>
            ))}
          </ul>
        </Block>

        <Block emoji="🧺" title="อุปกรณ์">
          <div className="flex flex-wrap gap-1.5">
            {activity.materials.map((m, i) => <Tag key={i} tone="yellow">{m}</Tag>)}
          </div>
        </Block>

        <Block emoji="👣" title="ขั้นตอนกิจกรรม" className="md:col-span-2">
          <ol className="space-y-2">
            {activity.steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-[15px] sm:text-base">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-purple-600 text-sm font-medium text-white">{i + 1}</span>
                <span className="pt-0.5">{s}</span>
              </li>
            ))}
          </ol>
        </Block>

        {activity.assessment && activity.assessment.length > 0 && (
          <Block emoji="📋" title="การประเมิน" className="md:col-span-2">
            <ul className="space-y-1.5">
              {activity.assessment.map((a, i) => (
                <li key={i} className="flex gap-2 text-[15px] sm:text-base"><span className="text-purple-400">✓</span><span>{a}</span></li>
              ))}
            </ul>
          </Block>
        )}

        {activity.note && (
          <p className="rounded-xl bg-yellow-soft px-4 py-3 text-[15px] md:col-span-2">💡 {activity.note}</p>
        )}
      </div>
    </article>
  );
}

function Block({ emoji, title, children, className = "" }: { emoji: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-2 font-display text-base text-purple-700">{emoji} {title}</p>
      {children}
    </div>
  );
}
