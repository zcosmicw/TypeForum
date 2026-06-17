"use client";

import { useState } from "react";

export function NewMessageComposer({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    // In full implementation this would call a server action to insert into DMs table
    setSent(true);
    setTimeout(() => {
      setOpen(false);
      setSent(false);
      setTo("");
      setBody("");
    }, 1500);
  }

  if (!isLoggedIn) {
    return (
      <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-slate-800/30 px-6 py-8 text-center">
        <p className="text-sm text-slate-300">
          <a href="/login" className="font-medium text-brand-blue hover:text-white">
            Log in
          </a>{" "}
          to send direct messages.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-xl border border-dashed border-white/10 bg-slate-800/30 px-6 py-4 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          + New message
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">New message</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>
            {sent ? (
              <div className="py-6 text-center">
                <p className="text-2xl">✓</p>
                <p className="mt-2 text-sm font-medium text-green-700">Message sent!</p>
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">To</label>
                  <input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Username"
                    required
                    className="w-full rounded-lg border border-white/10 bg-slate-900 text-slate-100 px-3 py-2 text-sm focus:border-brand-purple-neon focus:outline-none focus:ring-2 focus:ring-brand-purple-neon"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">Message</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                    rows={5}
                    placeholder="Type your message..."
                    className="w-full rounded-lg border border-white/10 bg-slate-900 text-slate-100 px-3 py-2 text-sm focus:border-brand-purple-neon focus:outline-none focus:ring-2 focus:ring-brand-purple-neon"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-2.5 text-sm font-semibold text-white hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(191,0,255,0.4)]"
                >
                  Send
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
