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
  const maxVisualDepth = 5;
  const currentIndent = Math.min(depth, maxVisualDepth);
  const canDelete = isStaff || (currentUsername && currentUsername === post.author);

  return (
    <div
      id={post.id}
      className={currentIndent > 0 ? "border-l border-border-subtle pl-4 sm:pl-6 mt-4" : "w-full"}
      style={{ marginLeft: currentIndent > 0 ? "min(8px, 2vw)" : "0px" }}
    >
      <article className={`card p-4 sm:p-5 ${isOP ? "border-l-2 border-l-accent" : ""}`}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-ghost text-xs font-bold text-accent">
              {post.author.charAt(0).toUpperCase()}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Link
                  href={`/u/${post.author}`}
                  className="text-sm font-semibold text-text-primary hover:text-accent transition-colors"
                >
                  {post.author}
                </Link>
                {post.authorUserRank && (
                  <RankBadge rank={post.authorUserRank} size="sm" />
                )}
                {isOP && <span className="tag tag-accent">OP</span>}
              </div>
              <p className="mono text-[11px] text-text-ghost mt-0.5">{post.createdAt}</p>
            </div>
          </div>
          <VoteControl
            upvotes={post.upvotes}
            downvotes={post.downvotes}
            compact
            postId={isOP ? undefined : post.id}
            threadId={threadId}
            userVote={post.userVote}
          />
        </div>

        {post.quote && !isOP && (
          <blockquote className="mb-4 rounded-lg border-l-2 border-accent bg-accent-ghost px-4 py-2.5 text-sm italic text-text-muted">
            {post.quote}
          </blockquote>
        )}
        <div className="text-sm leading-relaxed text-text-secondary whitespace-pre-wrap">
          {post.body}
        </div>

        <div className="mt-4 flex items-center justify-end gap-1 border-t border-border-subtle pt-3">
          <ShareButton
            url={typeof window !== "undefined" ? `${window.location.origin}/t/${threadId}#${post.id}` : undefined}
            title={`Reply by @${post.author}`}
          />
          {isLoggedIn && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="btn-ghost text-xs"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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

      {showReplyForm && (
        <div className="ml-4 sm:ml-6 border-l border-dashed border-border-default pl-4 sm:pl-6">
          <InlineReplyForm
            threadId={threadId}
            parentId={post.id}
            onClose={() => setShowReplyForm(false)}
          />
        </div>
      )}

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
