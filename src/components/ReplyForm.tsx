"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { createReply, type ActionState } from "@/lib/actions/forum";

const initialState: ActionState = { success: false };

export function ReplyForm({
  threadId,
  isLoggedIn,
}: {
  threadId: string;
  isLoggedIn: boolean;
}) {
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
    <div className="rounded-xl border border-dashed border-white/10 glass-panel p-6 text-center">
        <p className="text-sm font-medium text-slate-200">Want to reply?</p>
        <p className="mt-1 text-sm text-slate-400">
          <a href="/login" className="font-medium text-brand-blue hover:text-blue-400">
            Log in
          </a>{" "}
          or{" "}
          <a href="/signup" className="font-medium text-brand-blue hover:text-blue-400">
            create an account
          </a>{" "}
          to join the conversation.
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-xl border border-dashed border-white/10 glass-panel p-6"
    >
      <input type="hidden" name="threadId" value={threadId} />
      <p className="text-sm font-medium text-slate-200">Write a reply</p>

      {quote && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-purple-900/20 px-3 py-2">
          <input type="hidden" name="quote" value={quote} />
          <blockquote className="flex-1 border-l-2 border-brand-purple-neon/50 pl-3 text-sm italic text-slate-400">
            {quote}
          </blockquote>
          <button
            type="button"
            onClick={() => setQuote("")}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
      )}

      <textarea
        name="body"
        required
        placeholder="Share your experience or advice..."
        className="mt-3 w-full rounded-xl border border-white/5 bg-gray-950/60 p-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-200"
        rows={4}
      />
      {state.error && (
        <p className="mt-2.5 text-xs font-semibold text-red-500">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="btn-premium-primary mt-3 rounded-lg px-5.5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60"
      >
        {pending ? "Posting…" : "Post reply"}
      </button>
    </form>
  );
}
