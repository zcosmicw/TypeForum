"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createThread, saveDraft, type ActionState } from "@/lib/actions/forum";
import type { Category } from "@/lib/types";

const initialState: ActionState = {};

export function NewThreadForm({
  category,
  subforumSlug,
  isLoggedIn,
}: {
  category: Category;
  subforumSlug?: string;
  isLoggedIn: boolean;
}) {
  const [createState, createAction, createPending] = useActionState(
    createThread,
    initialState,
  );
  const [draftState, draftAction, draftPending] = useActionState(
    saveDraft,
    initialState,
  );

  if (!isLoggedIn) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 glass-panel px-6 py-8 text-center">
        <p className="text-slate-300">Log in to start a thread.</p>
        <Link
          href="/login"
          className="mt-3 inline-block rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(191,0,255,0.4)]"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="neon-border rounded-xl glass-panel p-6">
      <h2 className="text-lg font-bold text-white">New thread in {category.name}</h2>

      <form action={createAction} className="mt-4 space-y-4">
        <input type="hidden" name="categorySlug" value={category.slug} />
        {subforumSlug && (
          <input type="hidden" name="subforumSlug" value={subforumSlug} />
        )}

        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-300">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            minLength={3}
            maxLength={200}
            className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand-purple-neon focus:outline-none focus:ring-1 focus:ring-brand-purple-neon"
          />
        </div>

        <div>
          <label htmlFor="body" className="mb-1 block text-sm font-medium text-slate-300">
            Body
          </label>
          <textarea
            id="body"
            name="body"
            required
            minLength={10}
            rows={8}
            className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand-purple-neon focus:outline-none focus:ring-1 focus:ring-brand-purple-neon"
          />
        </div>

        <div>
          <label htmlFor="tags" className="mb-1 block text-sm font-medium text-slate-300">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            name="tags"
            placeholder="beginner, protocol"
            className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand-purple-neon focus:outline-none focus:ring-1 focus:ring-brand-purple-neon"
          />
        </div>

        {createState.error && (
          <p className="text-sm text-red-600">{createState.error}</p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={createPending || draftPending}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(191,0,255,0.4)] disabled:opacity-60"
          >
            {createPending ? "Publishing…" : "Publish thread"}
          </button>
          <button
            type="submit"
            formAction={draftAction}
            disabled={createPending || draftPending}
            className="rounded-lg border border-white/10 bg-slate-800/50 px-5 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-60"
          >
            {draftPending ? "Saving…" : "Save draft"}
          </button>
        </div>

        {draftState.error && (
          <p className="text-sm text-red-600">{draftState.error}</p>
        )}
        {!draftState.error && draftState.error === undefined && draftPending === false && draftState !== initialState && (
          <p className="text-sm text-green-600">Draft saved.</p>
        )}
      </form>
    </div>
  );
}
