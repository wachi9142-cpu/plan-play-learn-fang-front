import type { ReactNode } from "react";

interface PageHeaderProps {
  emoji: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ emoji, title, description, children }: PageHeaderProps) {
  return (
    <div className="animate-rise mb-8 sm:mb-10">
      <div className="flex items-start gap-3 sm:gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-purple-100 text-3xl shadow-soft sm:size-16 sm:text-4xl">
          {emoji}
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl">{title}</h1>
          {description && <p className="mt-1 text-[15px] text-ink-soft sm:text-base">{description}</p>}
        </div>
      </div>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
