"use client";

import { useActionState, useState } from "react";
import { updateForumConfig, type ActionState } from "@/lib/actions/admin";

const initialState: ActionState = {};

export function AdminForumConfigForm({ config }: { config: any }) {
  const [state, formAction, pending] = useActionState(updateForumConfig, initialState);

  const [categoriesStr, setCategoriesStr] = useState(
    config?.categories ? JSON.stringify(config.categories, null, 2) : "[]"
  );
  const [jsonError, setJsonError] = useState("");

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCategoriesStr(val);
    try {
      JSON.parse(val);
      setJsonError("");
    } catch {
      setJsonError("Invalid JSON format");
    }
  };

  return (
    <form action={formAction} className="card p-6">
      <h2 className="mb-6 text-lg font-semibold text-text-primary">Forum structure</h2>

      <div className="space-y-4">
        <p className="text-sm text-text-muted">
          Configure the categories and subforums. This must be a valid JSON array matching the Categories schema.
        </p>

        <input type="hidden" name="categoriesJson" value={categoriesStr} />

        <div className="relative">
          <label className="label-field">Categories configuration (JSON)</label>
          <textarea
            value={categoriesStr}
            onChange={handleJsonChange}
            rows={15}
            className="input-field font-mono text-xs leading-relaxed"
            spellCheck={false}
          />
          {jsonError && (
            <div className="absolute right-2 top-8 rounded-md bg-coral px-2 py-1 text-[11px] font-medium text-white">
              {jsonError}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 border-t border-border-subtle pt-6">
        {state.error && <p className="mb-4 rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm font-medium text-coral">{state.error}</p>}
        {state.success && <p className="mb-4 rounded-lg border border-sage/30 bg-sage/10 px-3 py-2 text-sm font-medium text-sage">Forum structure saved.</p>}

        <button type="submit" disabled={pending || !!jsonError} className="btn-primary px-6 py-2.5">
          {pending ? "Saving..." : "Save structure"}
        </button>
      </div>
    </form>
  );
}
