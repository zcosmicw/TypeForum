"use client";

import { useState, useTransition } from "react";
import { toggleFollowUserAction } from "@/lib/actions/forum";
import { updateUserRankAction } from "@/lib/actions/admin";
import type { UserRank } from "@/lib/types";

const TIERS: UserRank[] = ["rank1", "rank2", "rank3", "rank4", "rank5"];
const TIER_LABELS: Record<UserRank, string> = {
  rank1: "Rank 1",
  rank2: "Rank 2",
  rank3: "Rank 3",
  rank4: "Rank 4",
  rank5: "Rank 5",
};

interface ProfileActionsProps {
  targetUserId: string;
  username: string;
  currentRank: UserRank;
  currentUserRole: string | null;
  isLoggedIn: boolean;
  initialIsFollowing: boolean;
}

export function ProfileActions({
  targetUserId,
  username,
  currentRank,
  currentUserRole,
  isLoggedIn,
  initialIsFollowing,
}: ProfileActionsProps) {
  const [followed, setFollowed] = useState(initialIsFollowing);
  const [rank, setRank] = useState<UserRank>(currentRank);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleFollow() {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    startTransition(async () => {
      setError(null);
      const result = await toggleFollowUserAction(username);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setFollowed(!!result.isFollowing);
      }
    });
  }

  function handleRankChange(newRank: UserRank) {
    startTransition(async () => {
      try {
        setError(null);
        await updateUserRankAction(targetUserId, username, newRank);
        setRank(newRank);
      } catch (err: any) {
        setError(err.message || "Failed to update rank");
      }
    });
  }

  const isAdmin = currentUserRole === "admin";

  return (
    <div className="mt-4 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={handleFollow}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:opacity-60 ${
            followed
              ? "border border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
              : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(191,0,255,0.4)]"
          }`}
        >
          {followed ? "Following ✓" : "Follow"}
        </button>
        
        <a
          href="/messages"
          className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          Message
        </a>

        {/* Admin only rank assignment control */}
        {isAdmin && (
          <div className="flex items-center gap-2 rounded-lg border border-brand-purple-neon/30 bg-purple-900/20 px-3 py-1.5">
            <span className="text-xs font-semibold text-purple-300">Set Rank:</span>
            <select
              value={rank}
              onChange={(e) => handleRankChange(e.target.value as UserRank)}
              disabled={isPending}
              className="rounded bg-slate-900 px-2 py-0.5 text-xs font-semibold text-purple-400 outline-none focus:ring-1 focus:ring-brand-purple-neon disabled:opacity-50"
            >
              {TIERS.map((t) => (
                <option key={t} value={t}>
                  {TIER_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
