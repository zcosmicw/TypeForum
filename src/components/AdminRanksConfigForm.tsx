"use client";

import { useActionState } from "react";
import { updateRanksConfig, type ActionState } from "@/lib/actions/admin";

const initialState: ActionState = {};

export function AdminRanksConfigForm({ ranksConfig }: { ranksConfig: any[] }) {
  const [state, formAction, pending] = useActionState(updateRanksConfig, initialState);

  const getLabel = (key: string) => {
    const found = ranksConfig?.find((r) => r.rank_key === key);
    return found ? found.label : "";
  };

  const ranks = [
    { key: "admin", defaultLabel: "Admin" },
    { key: "moderator", defaultLabel: "Moderator" },
    { key: "veteran", defaultLabel: "Veteran" },
    { key: "member", defaultLabel: "Member" },
    { key: "newbie", defaultLabel: "Newbie" },
  ];

  return (
    <form action={formAction} className="card p-6">
      <h2 className="mb-6 text-lg font-semibold text-text-primary">Rank labels</h2>
      <p className="mb-6 text-sm text-text-muted">
        Customize the display names for user ranks. The underlying keys cannot be changed.
      </p>

      <div className="space-y-4">
        {ranks.map((rank) => (
          <div key={rank.key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <div className="w-32">
              <span className="mono text-[11px] font-medium text-accent bg-accent-ghost px-2 py-1 rounded">
                {rank.key}
              </span>
            </div>
            <div className="flex-1">
              <input
                type="text"
                name={`rank_${rank.key}`}
                defaultValue={getLabel(rank.key) || rank.defaultLabel}
                placeholder={rank.defaultLabel}
                className="input-field w-full"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-border-subtle pt-6">
        {state.error && <p className="mb-4 rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm font-medium text-coral">{state.error}</p>}
        {state.success && <p className="mb-4 rounded-lg border border-sage/30 bg-sage/10 px-3 py-2 text-sm font-medium text-sage">Rank labels updated.</p>}

        <button type="submit" disabled={pending} className="btn-primary px-6 py-2.5">
          {pending ? "Saving..." : "Save rank labels"}
        </button>
      </div>
    </form>
  );
}
