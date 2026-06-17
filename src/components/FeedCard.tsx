import Link from "next/link";
import type { FeedPost } from "@/lib/types";

export function FeedCard({ post }: { post: FeedPost }) {
  return (
    <article className="neon-border overflow-hidden rounded-xl border border-white/10 glass-panel">
      <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-slate-800 to-purple-900/30">
        <span className="text-4xl opacity-40">
          {post.type === "video" ? "▶" : post.type === "before-after" ? "⇄" : "◻"}
        </span>
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <Link
            href={`/u/${post.author}`}
            className="text-sm font-semibold text-brand-blue hover:text-white"
          >
            @{post.author}
          </Link>
          {post.trending && (
            <span className="neon-purple text-[10px] font-bold uppercase">Trending</span>
          )}
        </div>
        <p className="text-sm leading-relaxed text-slate-300">{post.caption}</p>
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
          <button type="button" className="hover:text-brand-purple-neon">
            ♥ {post.likes}
          </button>
          <button type="button" className="hover:text-brand-blue">
            💬 {post.comments}
          </button>
          <button type="button" className="hover:text-brand-blue">
            ↗ {post.shares}
          </button>
          <span className="ml-auto">{post.createdAt}</span>
        </div>
      </div>
    </article>
  );
}
