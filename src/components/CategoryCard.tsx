import Link from "next/link";
import type { Category } from "@/lib/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/c/${category.slug}`}
      className="card-elevated group flex flex-col p-5"
    >
      <div className="mb-4 flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 border border-white/5 text-lg text-brand-teal transition-colors group-hover:bg-teal-500/10 group-hover:text-brand-amber-soft">
          {category.icon}
        </span>
        <span className="rounded-full bg-teal-500/10 border border-teal-500/15 px-2.5 py-0.5 text-xs font-medium text-teal-400">
          {category.threadCount} threads
        </span>
      </div>
      <h3 className="mb-1 text-base font-semibold text-slate-100 group-hover:text-white transition-colors">
        {category.name}
      </h3>
      <p className="mb-3 flex-1 text-sm leading-relaxed text-slate-400">
        {category.description}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {category.subforums.slice(0, 4).map((sub) => (
          <span
            key={sub.slug}
            className="rounded-full bg-slate-900 border border-white/5 px-2.5 py-0.5 text-[10px] font-medium text-slate-400"
          >
            {sub.name}
          </span>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-500">
        {category.postCount.toLocaleString()} posts
      </p>
    </Link>
  );
}
