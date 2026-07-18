"use client";

import { useState, useTransition } from "react";
import { followUser, unfollowUser } from "@/lib/actions/forum";
import { UserModerationActions } from "@/components/UserModerationActions";

type ProfileActionsProps = {
  targetUserId: string;
  username: string;
  targetUserRole: string;
  targetUserRank: string;
  targetUserIsBanned: boolean;
  currentUserRole: string | null;
  isLoggedIn: boolean;
  initialIsFollowing: boolean;
  isOwnProfile: boolean;
};

export function ProfileActions({
  targetUserId,
  username,
  targetUserRole,
  targetUserRank,
  targetUserIsBanned,
  currentUserRole,
  isLoggedIn,
  initialIsFollowing,
  isOwnProfile,
}: ProfileActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

  const handleToggleFollow = () => {
    if (!isLoggedIn) {
      alert("Log in to follow users");
      return;
    }
    startTransition(async () => {
      const formData = new FormData();
      formData.set("targetId", targetUserId);
      if (isFollowing) {
        setIsFollowing(false);
        const res = await unfollowUser(formData);
        if (res.error) setIsFollowing(true);
      } else {
        setIsFollowing(true);
        const res = await followUser(formData);
        if (res.error) setIsFollowing(false);
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {!isOwnProfile ? (
        <button
          onClick={handleToggleFollow}
          disabled={isPending}
          className={isFollowing ? "btn-secondary px-5 py-2" : "btn-primary px-5 py-2"}
        >
          {isPending ? "..." : isFollowing ? "Unfollow" : "Follow"}
        </button>
      ) : (
        <a href="/settings" className="btn-secondary px-5 py-2">
          Edit profile
        </a>
      )}

      {!isOwnProfile && (
        <UserModerationActions
          targetUserId={targetUserId}
          targetUsername={username}
          targetUserRole={targetUserRole}
          targetUserRank={targetUserRank}
          targetUserIsBanned={targetUserIsBanned}
          currentUserRole={currentUserRole}
          buttonSize="md"
        />
      )}
    </div>
  );
}
