import { cn } from "@/lib/cn";

const tones = {
  purple: "bg-purple-100 text-purple-800",
  pink: "bg-pink-soft text-[#a8456c]",
  yellow: "bg-yellow-soft text-[#8a6a00]",
  mint: "bg-mint-soft text-[#2e6b4c]",
  sky: "bg-sky-soft text-[#2b5c8a]",
} as const;

export type TagTone = keyof typeof tones;

export function Tag({ children, tone = "purple", className }: { children: React.ReactNode; tone?: TagTone; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] font-medium leading-6", tones[tone], className)}>
      {children}
    </span>
  );
}
