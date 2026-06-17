import type { ThreadTag } from "@/lib/types";

const tagStyles: Record<ThreadTag, string> = {
  beginner: "bg-green-900/20 text-green-400",
  protocol: "bg-slate-800 text-blue-400",
  transformation: "bg-purple-900/20 text-brand-purple-soft",
  debate: "bg-orange-900/20 text-orange-400",
  pinned: "bg-brand-purple-neon/10 text-brand-purple-neon",
  sponsored: "bg-amber-900/20 text-amber-400",
};

export function TagList({ tags }: { tags: ThreadTag[] }) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tagStyles[tag]}`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
