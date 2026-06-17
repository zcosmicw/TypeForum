"use client";

import { useState } from "react";

type ShareButtonProps = {
  url?: string;
  title?: string;
};

export function ShareButton({ url, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // If url is not provided, use current page URL (safe to use in browser)
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    const shareTitle = title || "Check out this post on TypeForum";

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Fallback to clipboard if share sheets fail or are cancelled
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Failed to copy
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
        copied
          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
          : "bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
      }`}
    >
      <svg
        className={`h-3.5 w-3.5 ${copied ? "text-emerald-400 animate-scale-up" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
      >
        {copied ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
          />
        )}
      </svg>
      <span>{copied ? "Copied!" : "Share"}</span>
    </button>
  );
}
