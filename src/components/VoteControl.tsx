"use client";

import { useOptimistic, useTransition } from "react";
import { voteThread, votePost } from "@/lib/actions/forum";

type VoteControlProps = {
  upvotes: number;
  downvotes: number;
  compact?: boolean;
  threadId?: string;
  postId?: string;
  userVote?: number;
};

export function VoteControl({
  upvotes,
  downvotes,
  compact,
  threadId,
  postId,
  userVote = 0,
}: VoteControlProps) {
  const score = upvotes - downvotes;
  const [isPending, startTransition] = useTransition();

  const [optimisticState, setOptimisticState] = useOptimistic(
    { score, userVote },
    (state, voteType: "up" | "down" | "neutral") => {
      if (voteType === "up") {
        if (state.userVote === 1) return state;
        if (state.userVote === -1) return { score: state.score + 2, userVote: 1 };
        return { score: state.score + 1, userVote: 1 };
      } else if (voteType === "down") {
        if (state.userVote === -1) return state;
        if (state.userVote === 1) return { score: state.score - 2, userVote: -1 };
        return { score: state.score - 1, userVote: -1 };
      } else {
        if (state.userVote === 1) return { score: state.score - 1, userVote: 0 };
        if (state.userVote === -1) return { score: state.score + 1, userVote: 0 };
        return state;
      }
    }
  );

  function handleVote(value: 1 | -1) {
    if (!threadId && !postId) return;
    const targetValue = optimisticState.userVote === value ? 0 : value;
    startTransition(async () => {
      setOptimisticState(targetValue === 1 ? "up" : targetValue === -1 ? "down" : "neutral");
      const fd = new FormData();
      fd.set("value", String(targetValue));
      if (postId) {
        fd.set("postId", postId);
        if (threadId) fd.set("threadId", threadId);
        await votePost(fd);
      } else if (threadId) {
        fd.set("threadId", threadId);
        await voteThread(fd);
      }
    });
  }

  const canVote = Boolean(threadId || postId);

  return (
    <div
      className={`flex shrink-0 items-center gap-0.5 rounded-lg border border-border-default bg-bg-surface ${
        compact ? "px-1.5 py-0.5" : "px-2 py-1"
      } ${isPending ? "opacity-50" : ""}`}
    >
      <button
        type="button"
        aria-label="Upvote"
        disabled={!canVote || isPending}
        onClick={() => handleVote(1)}
        className={`rounded p-0.5 transition-colors ${
          optimisticState.userVote === 1
            ? "text-accent"
            : "text-text-ghost hover:text-accent"
        } disabled:cursor-default`}
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>
      <span
        className={`min-w-[2.5ch] text-center font-bold mono ${
          optimisticState.score > 0
            ? "text-accent"
            : optimisticState.score < 0
            ? "text-coral"
            : "text-text-ghost"
        } ${compact ? "text-xs" : "text-sm"}`}
      >
        {optimisticState.score}
      </span>
      <button
        type="button"
        aria-label="Downvote"
        disabled={!canVote || isPending}
        onClick={() => handleVote(-1)}
        className={`rounded p-0.5 transition-colors ${
          optimisticState.userVote === -1
            ? "text-coral"
            : "text-text-ghost hover:text-coral"
        } disabled:cursor-default`}
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
    </div>
  );
}
