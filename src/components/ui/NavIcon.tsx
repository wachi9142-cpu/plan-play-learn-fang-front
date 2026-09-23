import { cn } from "@/lib/cn";

/**
 * ไอคอนของการ์ดเมนู — ถ้ามีภาพประกอบ (image) จะใช้ภาพแทนอีโมจิ
 * ภาพพื้นหลังโปร่งใส จึงวางบนสีพื้น (tint) ได้ทุกสี และใช้ได้ทั้งโหมดสว่าง/มืด
 */
export function NavIcon({ emoji, image, label, tint, className, imgClassName }: {
  emoji: string;
  image?: string;
  label?: string;
  tint?: string;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <span className={cn("grid shrink-0 place-items-center overflow-hidden rounded-2xl", tint, className)}>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={label ?? ""} loading="lazy" className={cn("h-[82%]! w-auto object-contain", imgClassName)} />
      ) : (
        emoji
      )}
    </span>
  );
}
