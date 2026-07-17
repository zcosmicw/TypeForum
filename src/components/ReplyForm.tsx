"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { createReply, type ActionState } from "@/lib/actions/forum";

const initialState: ActionState = { success: false };

export function ReplyForm({ threadId, isLoggedIn }: { threadId: string; isLoggedIn: boolean }) {
  const [state, formAction, pending] = useActionState(createReply, initialState);
  const [quote, setQuote] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    function handleQuoteEvent(e: Event) {
      const detail = (e as CustomEvent).detail as { text: string; author: string };
      setQuote(`${detail.author}: ${detail.text}`);
    }
    window.addEventListener("quote-reply", handleQuoteEvent);
    return () => window.removeEventListener("quote-reply", handleQuoteEvent);
  }, []);

  useEffect(() => {
    if (!pending && state && state.success && formRef.current) {
      formRef.current.reset();
      setQuote("");
    }
  }, [pending, state]);

  if (!isLoggedIn) {
    return (
      <div className="card border-dashed p-8 text-center">
        <p className="text-[0.9375rem] font-semibold text-text-primary">Want to reply?</p>
        <p className="mt-2 text-sm text-text-muted">
          <a href="/login" className="font-medium text-accent hover:underline">Log in</a>
          {" "}or{" "}
          <a href="/signup" className="font-medium text-accent hover:underline">create an account</a>
          {" "}to join the conversation.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="card p-6">
      <input type="hidden" name="threadId" value={threadId} />
      <p className="text-base font-semibold text-text-primary mb-4">Write a reply</p>

      {quote && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border-l-2 border-accent bg-accent-ghost px-4 py-3">
          <input type="hidden" name="quote" value={quote} />
          <blockquote className="flex-1 text-sm italic text-text-muted">{quote}</blockquote>
          <button
            type="button"
            onClick={() => setQuote("")}
            className="text-xs font-medium text-text-ghost hover:text-coral transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      <textarea
        name="body"
        required
        placeholder="Share your thoughts..."
        className="input-field"
        rows={4}
      />
      {state.error && (
        <p className="mt-3 rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm font-medium text-coral">{state.error}</p>
      )}
      <button type="submit" disabled={pending} className="btn-primary mt-4 px-6 py-2.5">
        {pending ? "Posting..." : "Post reply"}
      </button>
    </form>
  );
}
