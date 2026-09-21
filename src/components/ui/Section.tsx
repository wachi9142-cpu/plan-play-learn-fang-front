import type { ReactNode } from "react";

export function Section({ title, emoji, children, className = "" }: { title: string; emoji?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`mb-10 sm:mb-14 ${className}`}>
      <h2 className="mb-4 flex items-center gap-2 text-xl sm:text-2xl">
        {emoji && <span aria-hidden>{emoji}</span>}
        {title}
      </h2>
      {children}
    </section>
  );
}
