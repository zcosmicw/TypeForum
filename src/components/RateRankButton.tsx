"use client";

import { useState, useTransition } from "react";

const TIERS = ["rank1", "rank2", "rank3", "rank4", "rank5"] as const;
const TIER_LABELS = {
  rank1: "Rank 1",
  "rank2": "Rank 2",
  rank3: "Rank 3",
  rank4: "Rank 4",
  rank5: "Rank 5",
};

export function RateRankButton({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !selectedTier) return;
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    startTransition(async () => {
      const { voteTier } = await import("@/lib/actions/forum");
      const fd = new FormData();
      fd.set("username", username);
      fd.set("rank", selectedTier);
      await voteTier(fd);
      setDone(true);
      setTimeout(() => {
        setOpen(false);
        setDone(false);
        setUsername("");
        setSelectedTier("");
      }, 1500);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-2 text-sm font-semibold text-white hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(191,0,255,0.4)]"
      >
        Rate a user
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Vote rank</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            {done ? (
              <div className="py-6 text-center">
                <p className="text-2xl">✓</p>
                <p className="mt-2 text-sm font-medium text-green-700">Tier vote submitted!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    Username
                  </label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. User3"
                    required
                    className="w-full rounded-lg border border-white/10 bg-slate-900 text-slate-100 px-3 py-2 text-sm focus:border-brand-purple-neon focus:outline-none focus:ring-2 focus:ring-brand-purple-neon"
                  />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-300">Assign rank</p>
                  <div className="grid grid-cols-3 gap-2">
                    {TIERS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTier(t)}
                        className={`rounded-lg border py-2 text-xs font-semibold ${
                          selectedTier === t
                            ? "border-purple-500 bg-purple-900/40 text-purple-300"
                            : "border-white/10 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        {TIER_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isPending || !username || !selectedTier}
                  className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-2.5 text-sm font-semibold text-white hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(191,0,255,0.4)] disabled:opacity-60"
                >
                  {isPending ? "Submitting…" : "Submit vote"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
