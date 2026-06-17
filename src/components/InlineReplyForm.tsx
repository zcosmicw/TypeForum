"use client";

import { useActionState, useEffect, useRef } from "react";
import { createReply, type ActionState } from "@/lib/actions/forum";

const initialState: ActionState = { success: false };

type InlineReplyFormProps = {
  threadId: string;
  parentId: string;
  onClose: () => void;
};

export function InlineReplyForm({
  threadId,
  parentId,
  onClose,
}: InlineReplyFormProps) {
  const [state, formAction, pending] = useActionState(createReply, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Auto-focus the textarea on mount
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Check if transition completed successfully
    if (!pending && state && state.success && formRef.current) {
      formRef.current.reset();
      onClose();
    }
  }, [pending, state, onClose]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-3 space-y-3 rounded-lg border border-white/10 bg-slate-800/50 p-4 transition-all duration-200"
    >
      <input type="hidden" name="threadId" value={threadId} />
      <input type="hidden" name="parentId" value={parentId} />

      <textarea
        ref={textareaRef}
        name="body"
        required
        placeholder="Reply to this comment..."
        className="w-full rounded-xl border border-white/5 bg-gray-950/60 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-200"
        rows={3}
      />

      {state.error && (
        <p className="text-xs text-red-500 font-semibold">{state.error}</p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="btn-premium-secondary rounded-lg px-3.5 py-1.5 text-xs font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="btn-premium-primary rounded-lg px-4.5 py-1.5 text-xs font-semibold text-white transition-all disabled:opacity-60"
        >
          {pending ? "Replying..." : "Post Reply"}
        </button>
      </div>
    </form>
  );
}
