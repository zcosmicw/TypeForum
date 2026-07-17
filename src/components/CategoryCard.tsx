import Link from "next/link";
import type { Category } from "@/lib/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/c/${category.slug}`}
      className="group card card-hover flex flex-col p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-ghost text-base">
          {category.icon}
        </span>
        <span className="mono text-xs font-medium text-text-muted">
          {category.threadCount} threads
        </span>
      </div>
      <h3 className="mb-1.5 text-[0.9375rem] font-semibold text-text-primary transition-colors group-hover:text-accent">
        {category.name}
      </h3>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-text-muted">
        {category.description}
      </p>
      {category.subforums.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {category.subforums.slice(0, 4).map((sub) => (
            <span key={sub.slug} className="tag tag-default">{sub.name}</span>
          ))}
        </div>
      )}
      <p className="mt-4 mono text-xs text-text-ghost">
        {category.postCount.toLocaleString()} posts
      </p>
    </Link>
  );
}
