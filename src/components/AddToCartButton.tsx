"use client";

import { useState } from "react";

export function AddToCartButton({ productName }: { productName: string }) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    // In full implementation this would update cart state (context/cookie/DB)
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${
        added
          ? "bg-green-600 text-white"
          : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(191,0,255,0.4)]"
      }`}
    >
      {added ? "Added to cart ✓" : "Add to cart"}
    </button>
  );
}

export function WriteReviewButton() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDone(true);
    setTimeout(() => {
      setOpen(false);
      setDone(false);
      setBody("");
      setRating(5);
    }, 1500);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-white/10 px-6 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
      >
        Write review
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Write a review</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>
            {done ? (
              <div className="py-6 text-center">
                <p className="text-2xl">✓</p>
                <p className="mt-2 text-sm font-medium text-green-700">Review submitted!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-300">Rating</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        className={`text-xl ${n <= rating ? "text-amber-400" : "text-slate-200"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">Review</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                    rows={4}
                    placeholder="Share your experience..."
                    className="w-full rounded-lg border border-white/10 bg-slate-900 text-slate-100 px-3 py-2 text-sm focus:border-brand-purple-neon focus:outline-none focus:ring-2 focus:ring-brand-purple-neon"
                  />
                </div>
                <button type="submit" className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-2.5 text-sm font-semibold text-white hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(191,0,255,0.4)]">
                  Submit review
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
