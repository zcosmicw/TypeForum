"use client";

import { useTransition } from "react";
import { updateUserRole, deleteUserAction } from "@/lib/actions/admin";

export function AdminRowActions({ targetId, currentRole }: { targetId: string; currentRole: string }) {
  const [isPending, startTransition] = useTransition();

  const handleToggleAdmin = () => {
    startTransition(async () => {
      const newRole = currentRole === "admin" ? "member" : "admin";
      await updateUserRole(targetId, newRole);
    });
  };

  const handleDelete = () => {
    if (confirm("Delete this user permanently?")) {
      startTransition(async () => {
        await deleteUserAction(targetId);
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={handleToggleAdmin} disabled={isPending} className="btn-secondary px-2.5 py-1 text-[11px]">
        {currentRole === "admin" ? "Revoke" : "Make admin"}
      </button>
      <button onClick={handleDelete} disabled={isPending} className="btn-danger px-2.5 py-1 text-[11px]">
        Delete
      </button>
    </div>
  );
}
