import Link from "next/link";
import type { Thread } from "@/lib/types";
import { TagList } from "@/components/TagList";
import { VoteControl } from "@/components/VoteControl";

export function ThreadRow({ thread }: { thread: Thread }) {
  return (
    <div className="group flex gap-4 border-b border-white/5 px-4 py-4.5 transition-all duration-200 last:border-0 hover:bg-slate-900/40 sm:px-5">
      <VoteControl upvotes={thread.upvotes} downvotes={thread.downvotes} compact threadId={thread.id} userVote={thread.userVote} />

      <Link href={`/t/${thread.id}`} className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {thread.pinned && (
            <span className="rounded-full bg-teal-500/10 border border-teal-500/15 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-teal-400">
              Pinned
            </span>
          )}
          {thread.trending && !thread.pinned && (
            <span className="rounded-full bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-orange-400">
              Trending
            </span>
          )}
          {thread.sponsored && (
            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
              Sponsored
            </span>
          )}
          <h3 className="truncate font-semibold text-slate-200 group-hover:text-white transition-colors text-base sm:text-lg">
            {thread.title}
          </h3>
        </div>
        <TagList tags={thread.tags} />
        <p className="mt-1.5 truncate text-sm text-slate-400 leading-relaxed">{thread.excerpt}</p>
        <p className="mt-2 text-xs text-slate-500">
          by{" "}
          <span className="font-semibold text-brand-teal hover:underline">@{thread.author}</span>
          {thread.subforumSlug && (
            <>
              {" "}
              in{" "}
              <span className="text-slate-400 hover:text-slate-300 font-medium">{thread.subforumSlug}</span>
            </>
          )}
        </p>
      </Link>

      <div className="hidden shrink-0 flex-col items-end justify-center gap-1.5 text-xs text-slate-500 sm:flex">
        <span>
          <span className="font-bold text-slate-300">{thread.replies}</span> replies
        </span>
        <span>
          <span className="font-bold text-slate-300">
            {thread.views.toLocaleString()}
          </span>{" "}
          views
        </span>
        <span className="text-brand-amber-soft font-medium">{thread.lastActive}</span>
      </div>
    </div>
  );
}
