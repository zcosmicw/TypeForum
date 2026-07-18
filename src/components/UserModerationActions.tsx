"use client";

import { useTransition } from "react";
import { updateUserRoleAction, deleteUserAction, toggleBanUserAction } from "@/lib/actions/admin";

type UserModerationActionsProps = {
  targetUserId: string;
  targetUsername: string;
  targetUserRole: string;
  targetUserIsBanned: boolean;
  currentUserRole: string | null;
  buttonSize?: "sm" | "md";
};

export function UserModerationActions({
  targetUserId,
  targetUsername,
  targetUserRole,
  targetUserIsBanned,
  currentUserRole,
  buttonSize = "sm",
}: UserModerationActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (newRole: string) => {
    startTransition(async () => {
      try {
        await updateUserRoleAction(targetUserId, targetUsername, newRole);
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  const handleToggleBan = () => {
    startTransition(async () => {
      try {
        await toggleBanUserAction(targetUserId, targetUsername, targetUserIsBanned);
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  const handleDelete = () => {
    if (confirm("Delete this user permanently? This action cannot be undone.")) {
      startTransition(async () => {
        try {
          await deleteUserAction(targetUserId);
        } catch (err: any) {
          alert(err.message);
        }
      });
    }
  };

  const isCurrentUserAdmin = currentUserRole === "admin";
  const isCurrentUserMod = currentUserRole === "moderator";
  const isStaff = isCurrentUserAdmin || isCurrentUserMod;

  if (!isStaff) return null;

  const btnClass = buttonSize === "sm" ? "px-2.5 py-1 text-[11px]" : "px-4 py-2 text-sm";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Role Changes (Admins only, cannot change roles of other admins) */}
      {isCurrentUserAdmin && targetUserRole !== "admin" && (
        <>
          {targetUserRole !== "moderator" && (
            <button
              onClick={() => handleRoleChange("moderator")}
              disabled={isPending}
              className={`btn-secondary ${btnClass}`}
            >
              Make Mod
            </button>
          )}
          {targetUserRole !== "user" && targetUserRole !== "member" && (
            <button
              onClick={() => handleRoleChange("user")}
              disabled={isPending}
              className={`btn-secondary ${btnClass}`}
            >
              Make User
            </button>
          )}
        </>
      )}

      {/* Ban & Delete (Admins & Mods) */}
      {(isCurrentUserAdmin || (isCurrentUserMod && targetUserRole !== "admin")) && (
        <>
          <button
            onClick={handleToggleBan}
            disabled={isPending}
            className={`btn-danger ${btnClass} ${targetUserIsBanned ? "bg-coral/20 border-coral/50 text-coral" : ""}`}
          >
            {targetUserIsBanned ? "Unban" : "Ban"}
          </button>

          <button
            onClick={handleDelete}
            disabled={isPending}
            className={`btn-danger ${btnClass}`}
          >
            Delete
          </button>
        </>
      )}
    </div>
  );
}
