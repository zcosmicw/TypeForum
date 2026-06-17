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
        if (state.userVote === 1) {
          return state;
        } else if (state.userVote === -1) {
          return { score: state.score + 2, userVote: 1 };
        } else {
          return { score: state.score + 1, userVote: 1 };
        }
      } else if (voteType === "down") {
        if (state.userVote === -1) {
          return state;
        } else if (state.userVote === 1) {
          return { score: state.score - 2, userVote: -1 };
        } else {
          return { score: state.score - 1, userVote: -1 };
        }
      } else {
        if (state.userVote === 1) {
          return { score: state.score - 1, userVote: 0 };
        } else if (state.userVote === -1) {
          return { score: state.score + 1, userVote: 0 };
        } else {
          return state;
        }
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
        if (threadId) {
          fd.set("threadId", threadId);
        }
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
      className={`flex shrink-0 items-center gap-1.5 rounded-full border border-white/5 bg-gray-900/60 backdrop-blur-sm ${
        compact ? "px-1.5 py-1" : "px-2.5 py-1.5"
      } ${isPending ? "opacity-60" : ""} shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]`}
    >
      <button
        type="button"
        aria-label="Upvote"
        disabled={!canVote || isPending}
        onClick={() => handleVote(1)}
        className={`group rounded-full p-1 transition-all duration-200 ${
          optimisticState.userVote === 1
            ? "text-blue-400 bg-blue-600/15"
            : "text-slate-400 hover:bg-blue-600/15 hover:text-blue-400"
        } disabled:cursor-default`}
      >
        <svg
          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>
      <span
        className={`min-w-[2.5ch] text-center font-bold tracking-tight ${
          optimisticState.score > 0
            ? "text-blue-400"
            : optimisticState.score < 0
            ? "text-red-400"
            : "text-slate-400"
        } ${compact ? "text-xs" : "text-sm"}`}
      >
        {optimisticState.score}
      </span>
      <button
        type="button"
        aria-label="Downvote"
        disabled={!canVote || isPending}
        onClick={() => handleVote(-1)}
        className={`group rounded-full p-1 transition-all duration-200 ${
          optimisticState.userVote === -1
            ? "text-red-400 bg-red-600/15"
            : "text-slate-400 hover:bg-red-600/15 hover:text-red-400"
        } disabled:cursor-default`}
      >
        <svg
          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-y-0.5"
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
