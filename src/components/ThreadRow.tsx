import Link from "next/link";
import type { Thread } from "@/lib/types";
import { TagList } from "@/components/TagList";
import { VoteControl } from "@/components/VoteControl";

export function ThreadRow({ thread }: { thread: Thread }) {
  return (
    <div className="group flex gap-4 border-b border-border-subtle px-5 py-4 transition-colors last:border-0 hover:bg-bg-hover/50">
      <VoteControl upvotes={thread.upvotes} downvotes={thread.downvotes} compact threadId={thread.id} userVote={thread.userVote} />

      <Link href={`/t/${thread.id}`} className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          {thread.pinned && <span className="tag tag-accent">Pinned</span>}
          {thread.trending && !thread.pinned && <span className="tag tag-coral">Trending</span>}
          {thread.sponsored && <span className="tag tag-steel">Sponsored</span>}
          <h3 className="truncate text-[0.9375rem] font-semibold text-text-primary transition-colors group-hover:text-accent">
            {thread.title}
          </h3>
        </div>
        <TagList tags={thread.tags} />
        <p className="mt-1 truncate text-sm text-text-muted">{thread.excerpt}</p>
        <p className="mt-2 text-xs text-text-ghost">
          <span className="font-medium text-accent">@{thread.author}</span>
          {thread.subforumSlug && (
            <>
              {" "}in{" "}
              <span className="text-text-muted">{thread.subforumSlug}</span>
            </>
          )}
        </p>
      </Link>

      <div className="hidden shrink-0 flex-col items-end justify-center gap-1 sm:flex">
        <span className="text-xs text-text-muted">
          <span className="font-semibold text-text-primary">{thread.replies}</span> replies
        </span>
        <span className="text-xs text-text-muted">
          <span className="font-semibold text-text-primary">{thread.views.toLocaleString()}</span> views
        </span>
        <span className="mono text-[11px] text-text-ghost">{thread.lastActive}</span>
      </div>
    </div>
  );
}
