import type { ReactNode } from "react";

interface PageHeaderProps {
  emoji: string;
  /** ภาพประกอบแทนอีโมจิ (พื้นหลังโปร่งใส) */
  image?: string;
  /** true = ภาพถ่ายเต็มกรอบ (ครอป) */
  imageCover?: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ emoji, image, imageCover, title, description, children }: PageHeaderProps) {
  return (
    <div className="animate-rise mb-8 sm:mb-10">
      <div className="flex items-start gap-3 sm:gap-4">
        <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-purple-100 text-3xl shadow-soft sm:size-16 sm:text-4xl">
          {image
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={image} alt="" className={imageCover ? "h-full! w-full! object-cover" : "h-[82%]! w-auto object-contain"} />
            : emoji}
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
