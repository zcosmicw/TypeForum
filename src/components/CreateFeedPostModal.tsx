"use client";

import { useState } from "react";
import type { FeedPost } from "@/lib/types";

type PostType = FeedPost["type"];

export function CreateFeedPostButton({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<PostType>("photo");
  const [caption, setCaption] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In full implementation this would call a server action to insert into DB
    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
      setSubmitted(false);
      setCaption("");
      setType("photo");
    }, 1500);
  }

  if (!isLoggedIn) {
    return (
      <a
        href="/login"
        className="mt-4 block w-full rounded-lg border border-white/10 py-2 text-center text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
      >
        Log in to post
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 w-full rounded-lg border border-white/10 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
      >
        Create post
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Create post</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center">
                <p className="text-2xl">✓</p>
                <p className="mt-2 text-sm font-medium text-green-700">Post submitted!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-300">Post type</p>
                  <div className="flex gap-2">
                    {(["photo", "video", "before-after"] as PostType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`flex-1 rounded-lg border py-2 text-xs font-semibold capitalize ${
                          type === t
                            ? "border-blue-600 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            : "border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        {t === "before-after" ? "Before/After" : t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex aspect-video items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-slate-800/30">
                  <div className="text-center">
                    <p className="text-3xl opacity-30">
                      {type === "video" ? "▶" : type === "before-after" ? "⇄" : "◻"}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {type === "video" ? "Upload video" : "Upload image(s)"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    Caption
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    required
                    rows={3}
                    placeholder="Describe your post..."
                    className="w-full rounded-lg border border-white/10 bg-slate-900 text-slate-100 px-3 py-2 text-sm focus:border-brand-purple-neon focus:outline-none focus:ring-2 focus:ring-brand-purple-neon"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-2.5 text-sm font-semibold text-white hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(191,0,255,0.4)]"
                >
                  Post to feed
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
