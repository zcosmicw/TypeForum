"use client";

import { useState, useTransition } from "react";
import { updateUserRoleAction, toggleBanUserAction, updateUserRankAction } from "@/lib/actions/admin";

type AdminRowActionsProps = {
  targetUserId: string;
  targetUsername: string;
  currentRole: string;
  currentRank: string;
  isBanned: boolean;
  currentUserRole: string;
  currentUserId: string;
};

export function AdminRowActions({
  targetUserId,
  targetUsername,
  currentRole,
  currentRank,
  isBanned,
  currentUserRole,
  currentUserId,
}: AdminRowActionsProps) {
  const [role, setRole] = useState(currentRole);
  const [rank, setRank] = useState(currentRank);
  const [banned, setBanned] = useState(isBanned);
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    setRole(newRole);
    startTransition(async () => {
      try {
        await updateUserRoleAction(targetUserId, targetUsername, newRole);
      } catch (err: any) {
        alert(err.message || "Failed to update role");
        setRole(currentRole); // revert on error
      }
    });
  };

  const handleRankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRank = e.target.value;
    setRank(newRank);
    startTransition(async () => {
      try {
        await updateUserRankAction(targetUserId, targetUsername, newRank);
      } catch (err: any) {
        alert(err.message || "Failed to update rank");
        setRank(currentRank); // revert on error
      }
    });
  };

  const handleBanToggle = () => {
    const actionText = banned ? "unban" : "ban";
    if (window.confirm(`Are you sure you want to ${actionText} @${targetUsername}?`)) {
      setBanned(!banned);
      startTransition(async () => {
        try {
          await toggleBanUserAction(targetUserId, targetUsername, banned);
        } catch (err: any) {
          alert(err.message || "Failed to toggle ban status");
          setBanned(banned); // revert on error
        }
      });
    }
  };

  const isSelf = targetUserId === currentUserId;
  const isTargetAdmin = currentRole === "admin";
  const isAdminManger = currentUserRole === "admin";

  return (
    <div className="flex items-center gap-3">
      {/* Rank Manager (Admins only) */}
      {isAdminManger ? (
        <select
          value={rank}
          onChange={handleRankChange}
          disabled={isPending}
          className="rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-300 outline-none transition-colors focus:border-brand-teal disabled:opacity-50"
        >
          <option value="rank1">Rank 1</option>
          <option value="rank2">Rank 2</option>
          <option value="rank3">Rank 3</option>
          <option value="rank4">Rank 4</option>
          <option value="rank5">Rank 5</option>
        </select>
      ) : (
        <span className="text-xs font-medium capitalize text-slate-500">
          {rank}
        </span>
      )}

      {/* Role Manager (Admins only, cannot edit self) */}
      {isAdminManger ? (
        <select
          value={role}
          onChange={handleRoleChange}
          disabled={isPending || isSelf}
          className="rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-300 outline-none transition-colors focus:border-brand-teal disabled:opacity-50"
        >
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
      ) : (
        <span className="text-xs font-medium capitalize text-slate-500">
          {role}
        </span>
      )}

      {/* Ban / Unban Toggle */}
      <button
        onClick={handleBanToggle}
        disabled={isPending || isSelf || (isTargetAdmin && !isAdminManger)}
        className={`rounded-lg border px-3 py-1 text-xs font-semibold transition-all disabled:opacity-50 ${
          banned
            ? "border-green-500/30 bg-green-900/20 text-green-400 hover:bg-green-900/40"
            : "border-red-500/30 bg-red-900/20 text-red-400 hover:bg-red-900/40"
        }`}
      >
        {banned ? "Unban" : "Ban"}
      </button>
    </div>
  );
}
