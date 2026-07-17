"use client";

import { useActionState, useEffect, useRef } from "react";
import { createReply, type ActionState } from "@/lib/actions/forum";

const initialState: ActionState = { success: false };

export function InlineReplyForm({
  threadId,
  parentId,
  onClose,
}: {
  threadId: string;
  parentId: string;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(createReply, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && state.success) {
      formRef.current?.reset();
      onClose();
    }
  }, [pending, state.success, onClose]);

  return (
    <form ref={formRef} action={formAction} className="mt-3">
      <input type="hidden" name="threadId" value={threadId} />
      <input type="hidden" name="parentId" value={parentId} />
      <textarea
        name="body"
        required
        autoFocus
        placeholder="Write a reply..."
        className="input-field text-sm"
        rows={3}
      />
      {state.error && <p className="mt-2 text-xs font-medium text-coral">{state.error}</p>}
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-secondary px-3 py-1.5 text-xs" disabled={pending}>
          Cancel
        </button>
        <button type="submit" disabled={pending} className="btn-primary px-3 py-1.5 text-xs">
          {pending ? "..." : "Reply"}
        </button>
      </div>
    </form>
  );
}
