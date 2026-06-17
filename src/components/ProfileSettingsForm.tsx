"use client";

import { useActionState } from "react";
import { updateProfile, type ActionState } from "@/lib/actions/forum";
import type { DbProfile } from "@/lib/supabase/types";

const initialState: ActionState = {};

export function ProfileSettingsForm({ profile }: { profile: DbProfile }) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);

  return (
    <form
      action={formAction}
      className="neon-border rounded-xl border border-white/10 glass-panel p-5"
    >
      <h2 className="mb-4 font-semibold text-white">Profile</h2>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">
            Username
          </label>
          <input
            value={profile.username}
            disabled
            className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-slate-500"
          />
        </div>
        <div>
          <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-slate-300">
            Display name
          </label>
          <input
            id="displayName"
            name="displayName"
            defaultValue={profile.display_name}
            required
            className="w-full rounded-lg border border-white/10 bg-slate-900 text-slate-100 px-3 py-2 text-sm focus:border-brand-purple-neon focus:outline-none focus:ring-2 focus:ring-brand-purple-neon"
          />
        </div>
        <div>
          <label htmlFor="bio" className="mb-1 block text-sm font-medium text-slate-300">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={profile.bio}
            rows={4}
            className="w-full rounded-lg border border-white/10 bg-slate-900 text-slate-100 px-3 py-2 text-sm focus:border-brand-purple-neon focus:outline-none focus:ring-2 focus:ring-brand-purple-neon"
          />
        </div>
      </div>
      {state.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(191,0,255,0.4)] transition-all disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
