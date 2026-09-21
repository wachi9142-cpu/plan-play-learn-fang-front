import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

export interface Crumb { label: string; href?: string }

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="เส้นทาง" className="no-scrollbar mb-5 overflow-x-auto">
      <ol className="flex min-w-max items-center gap-1 text-[14px] text-ink-soft sm:text-[15px]">
        <li><Link href="/" className="rounded-md px-1 py-0.5 hover:text-purple-700">หน้าแรก</Link></li>
        {items.map((c, i) => (
          <Fragment key={i}>
            <li aria-hidden><ChevronRight size={15} className="text-purple-300" /></li>
            <li>
              {c.href ? (
                <Link href={c.href} className="rounded-md px-1 py-0.5 hover:text-purple-700">{c.label}</Link>
              ) : (
                <span className="px-1 font-medium text-purple-800">{c.label}</span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
