"use client";

import { useActionState, useEffect, useState } from "react";
import { createDirectMessage, type ActionState } from "@/lib/actions/forum";
import { createClient } from "@/lib/supabase/client";

const initialState: ActionState = {};

export function NewMessageComposer() {
  const [state, formAction, pending] = useActionState(createDirectMessage, initialState);
  const [recipientQuery, setRecipientQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!recipientQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      const supabase = createClient();
      if (!supabase) return;
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .ilike("username", `${recipientQuery}%`)
        .limit(5);

      if (data) {
        setSuggestions(data.map((d) => d.username));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [recipientQuery]);

  return (
    <div className="card p-6">
      <h2 className="mb-4 text-base font-semibold text-text-primary">New message</h2>
      <form action={formAction} className="space-y-4">
        <div className="relative">
          <label htmlFor="recipient" className="label-field">To (username)</label>
          <input
            id="recipient"
            name="recipient"
            required
            value={recipientQuery}
            onChange={(e) => {
              setRecipientQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="input-field"
            placeholder="Search users..."
            autoComplete="off"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-border-default bg-bg-card shadow-lg overflow-hidden">
              {suggestions.map((username) => (
                <button
                  key={username}
                  type="button"
                  onClick={() => {
                    setRecipientQuery(username);
                    setShowSuggestions(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-text-primary hover:bg-bg-hover transition-colors"
                >
                  @{username}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label htmlFor="body" className="label-field">Message</label>
          <textarea id="body" name="body" required rows={5} className="input-field" placeholder="Write your message..." />
        </div>
        {state.error && (
          <p className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm font-medium text-coral">{state.error}</p>
        )}
        <button type="submit" disabled={pending} className="btn-primary w-full py-2.5">
          {pending ? "Sending..." : "Send message"}
        </button>
      </form>
    </div>
  );
}
