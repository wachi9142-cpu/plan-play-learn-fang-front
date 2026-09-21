export function EmptyState({ emoji = "🌱", title, hint }: { emoji?: string; title: string; hint?: string }) {
  return (
    <div className="card flex flex-col items-center gap-2 px-6 py-10 text-center">
      <span className="text-4xl">{emoji}</span>
      <p className="font-display text-lg text-purple-800">{title}</p>
      {hint && <p className="text-[15px] text-ink-soft">{hint}</p>}
    </div>
  );
}
