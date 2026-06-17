"use client";

import { useState, useTransition } from "react";
import { followUser, voteTier } from "@/lib/actions/forum";
import type { UserRank } from "@/lib/types";

const TIERS: UserRank[] = ["rank1", "rank2", "rank3", "rank4", "rank5"];
const TIER_LABELS: Record<UserRank, string> = {
  rank1: "Rank 1",
  "rank2": "Rank 2",
  rank3: "Rank 3",
  rank4: "Rank 4",
  rank5: "Rank 5",
};

export function ProfileActions({
  username,
  rankVotes,
  isLoggedIn,
}: {
  username: string;
  rankVotes: number;
  isLoggedIn: boolean;
}) {
  const [followed, setFollowed] = useState(false);
  const [showTierPicker, setShowTierPicker] = useState(false);
  const [votedRank, setVotedTier] = useState<UserRank | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleFollow() {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("username", username);
      const result = await followUser(fd);
      if (result?.error) setError(result.error);
      else setFollowed(true);
    });
  }

  function handleVoteTier(rank: UserRank) {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("username", username);
      fd.set("rank", rank);
      const result = await voteTier(fd);
      if (result?.error) setError(result.error);
      else {
        setVotedTier(rank);
        setShowTierPicker(false);
      }
    });
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button
        type="button"
        disabled={isPending || followed}
        onClick={handleFollow}
        className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(191,0,255,0.4)] disabled:opacity-60"
      >
        {followed ? "Following ✓" : "Follow"}
      </button>
      <a
        href="/messages"
        className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
      >
        Message
      </a>

      {showTierPicker ? (
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-brand-purple-neon/30 bg-purple-900/20 px-3 py-1.5">
          <span className="text-xs font-medium text-slate-300">Rate:</span>
          {TIERS.map((t) => (
            <button
              key={t}
              type="button"
              disabled={isPending}
              onClick={() => handleVoteTier(t)}
              className="rounded px-2 py-0.5 text-xs font-semibold text-purple-400 hover:bg-purple-900/40 disabled:opacity-60"
            >
              {TIER_LABELS[t]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowTierPicker(false)}
            className="ml-1 text-xs text-slate-400 hover:text-slate-200"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={!!votedRank}
          onClick={() => setShowTierPicker(true)}
          className="rounded-lg border border-brand-purple-neon/30 px-4 py-2 text-sm font-semibold text-brand-purple-soft hover:bg-purple-900/30 disabled:opacity-60"
        >
          {votedRank
            ? `Voted: ${TIER_LABELS[votedRank]} ✓`
            : `Vote rank (${rankVotes})`}
        </button>
      )}

      {error && (
        <p className="w-full text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
