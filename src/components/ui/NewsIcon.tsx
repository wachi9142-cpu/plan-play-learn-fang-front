import { cn } from "@/lib/cn";

/** ไอคอนหมวดประชาสัมพันธ์ — ถ้าหมวดมีภาพประกอบจะใช้ภาพแทนอีโมจิ */
export function NewsIcon({ emoji, image, label, className }: { emoji: string; image?: string; label?: string; className?: string }) {
  return (
    <span className={cn("grid shrink-0 place-items-center overflow-hidden bg-purple-100", className)}>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={label ?? ""} loading="lazy" className="h-full! w-full! object-cover object-[center_22%]" />
      ) : (
        emoji
      )}
    </span>
  );
}
