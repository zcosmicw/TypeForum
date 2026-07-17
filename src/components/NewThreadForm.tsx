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
  const [createState, createAction, createPending] = useActionState(createThread, initialState);
  const [draftState, draftAction, draftPending] = useActionState(saveDraft, initialState);

  if (!isLoggedIn) {
    return (
      <div className="card border-dashed px-6 py-8 text-center">
        <p className="font-semibold text-text-primary">Log in to start a thread.</p>
        <Link href="/login" className="btn-primary mt-4 inline-flex px-5 py-2">Log in</Link>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-base font-semibold text-text-primary">New thread in {category.name}</h2>

      <form action={createAction} className="mt-4 space-y-4">
        <input type="hidden" name="categorySlug" value={category.slug} />
        {subforumSlug && <input type="hidden" name="subforumSlug" value={subforumSlug} />}

        <div>
          <label htmlFor="title" className="label-field">Title</label>
          <input id="title" name="title" required minLength={3} maxLength={200} className="input-field" />
        </div>

        <div>
          <label htmlFor="body" className="label-field">Body</label>
          <textarea id="body" name="body" required minLength={10} rows={8} className="input-field" />
        </div>

        <div>
          <label htmlFor="tags" className="label-field">Tags (comma-separated)</label>
          <input id="tags" name="tags" placeholder="beginner, protocol" className="input-field" />
        </div>

        {createState.error && (
          <p className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm font-medium text-coral">{createState.error}</p>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={createPending || draftPending} className="btn-primary px-6 py-2.5">
            {createPending ? "Publishing..." : "Publish thread"}
          </button>
          <button type="submit" formAction={draftAction} disabled={createPending || draftPending} className="btn-secondary px-6 py-2.5">
            {draftPending ? "Saving..." : "Save draft"}
          </button>
        </div>

        {draftState.error && (
          <p className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm font-medium text-coral">{draftState.error}</p>
        )}
        {!draftState.error && draftState.error === undefined && draftPending === false && draftState !== initialState && (
          <p className="rounded-lg border border-sage/30 bg-sage/10 px-3 py-2 text-sm font-medium text-sage">Draft saved.</p>
        )}
      </form>
    </div>
  );
}
