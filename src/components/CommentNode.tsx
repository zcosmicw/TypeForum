"use client";

import { useState } from "react";
import Link from "next/link";
import { VoteControl } from "@/components/VoteControl";
import { DeletePostButton } from "@/components/DeletePostButton";
import { RankBadge } from "@/components/RankBadge";
import { InlineReplyForm } from "@/components/InlineReplyForm";
import { ShareButton } from "@/components/ShareButton";
import type { Post } from "@/lib/types";

type CommentNodeProps = {
  post: Post;
  threadId: string;
  depth: number;
  isLoggedIn: boolean;
  isStaff: boolean;
  currentUsername?: string;
};

export function CommentNode({
  post,
  threadId,
  depth,
  isLoggedIn,
  isStaff,
  currentUsername,
}: CommentNodeProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const isOP = post.id.startsWith("op-");
  const hasReplies = post.replies && post.replies.length > 0;
  
  // Cap visual indentation level to avoid squishing on small screens
  const maxVisualDepth = 5;
  const currentIndent = Math.min(depth, maxVisualDepth);
  
  // Custom margin classes based on depth
  const marginClasses = currentIndent === 0 
    ? "w-full" 
    : "pl-3 sm:pl-5 border-l border-white/10 hover:border-purple-500/40 transition-colors mt-3.5";

  // Check if current user is allowed to delete this specific comment
  const canDelete = isStaff || (currentUsername && currentUsername === post.author);

  return (
    <div id={post.id} className={marginClasses} style={{ marginLeft: currentIndent > 0 ? "min(12px, 3vw)" : "0px" }}>
      {/* Comment Card */}
      <article className={`premium-card p-4 sm:p-5 ${isOP ? "ring-1 ring-blue-500/30 border-blue-500/20" : ""}`}>
        {/* Card Header */}
        <div className="mb-3.5 flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/15 via-indigo-500/15 to-purple-500/15 border border-purple-500/20 text-xs sm:text-sm font-bold text-slate-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              {post.author.charAt(0).toUpperCase()}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Link
                  href={`/u/${post.author}`}
                  className="text-xs sm:text-sm font-semibold text-slate-100 hover:text-white transition-colors"
                >
                  {post.author}
                </Link>
                {post.authorUserRank && (
                  <RankBadge rank={post.authorUserRank} size="sm" />
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">{post.createdAt}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOP && (
              <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-400">
                OP
              </span>
            )}
            <VoteControl
              upvotes={post.upvotes}
              downvotes={post.downvotes}
              compact
              postId={isOP ? undefined : post.id}
              threadId={threadId}
              userVote={post.userVote}
            />
          </div>
        </div>

        {/* Card Body */}
        {post.quote && !isOP && (
          <blockquote className="mb-4 border-l-2 border-purple-500/50 bg-purple-950/15 rounded-r-lg px-3.5 py-2.5 text-xs sm:text-sm italic text-slate-400">
            {post.quote}
          </blockquote>
        )}
        <p className="leading-relaxed text-xs sm:text-sm text-slate-300 whitespace-pre-wrap">
          {post.body}
        </p>

        {/* Card Actions Footer */}
        <div className="mt-4 flex items-center justify-end gap-3 border-t border-white/5 pt-3">
          <ShareButton 
            url={typeof window !== "undefined" ? `${window.location.origin}/t/${threadId}#${post.id}` : undefined} 
            title={`Reply by @${post.author} on TypeForum`} 
          />
          {isLoggedIn && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.92 1.78 4.75 4.75 0 002.77-.872c.516-.351 1.096-.449 1.723-.255a9.03 9.03 0 002.568.378z" />
              </svg>
              {showReplyForm ? "Cancel" : "Reply"}
            </button>
          )}

          {!isOP && canDelete && (
            <DeletePostButton postId={post.id} threadId={threadId} />
          )}
        </div>
      </article>

      {/* Inline Reply Form (If Toggled) */}
      {showReplyForm && (
        <div className="ml-3 sm:ml-5 border-l-2 border-dashed border-white/10 pl-3 sm:pl-5">
          <InlineReplyForm
            threadId={threadId}
            parentId={post.id}
            onClose={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* Render Recursive Child Replies */}
      {hasReplies && (
        <div className="space-y-1 mt-1">
          {post.replies!.map((reply) => (
            <CommentNode
              key={reply.id}
              post={reply}
              threadId={threadId}
              depth={depth + 1}
              isLoggedIn={isLoggedIn}
              isStaff={isStaff}
              currentUsername={currentUsername}
            />
          ))}
        </div>
      )}
    </div>
  );
}
