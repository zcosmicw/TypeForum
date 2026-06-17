import Link from "next/link";
import { notFound } from "next/navigation";
import { ReplyForm } from "@/components/ReplyForm";
import { TagList } from "@/components/TagList";
import { VoteControl } from "@/components/VoteControl";
import { CommentNode } from "@/components/CommentNode";
import { ShareButton } from "@/components/ShareButton";
import { DeleteThreadButton } from "@/components/DeleteThreadButton";
import { getSessionProfile } from "@/lib/actions/auth";
import {
  fetchCategory,
  fetchPostsByThread,
  fetchThread,
} from "@/lib/forum/queries";

export const dynamic = "force-dynamic";

type ThreadPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { id } = await params;
  const [thread, profile] = await Promise.all([fetchThread(id), getSessionProfile()]);

  if (!thread) {
    notFound();
  }

  const category = await fetchCategory(thread.categorySlug);
  const threadPosts = await fetchPostsByThread(id);

  const isStaff = profile?.role === "admin" || profile?.role === "moderator";
  const canDeleteThread = !!(profile && (profile.username === thread.author || isStaff));


  return (
    <div className="flex-1 pb-20">
      {/* Thread Page Hero Header */}
      <section className="hero-gradient border-b border-white/10">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          {/* Breadcrumbs */}
          <div className="mb-4 flex flex-wrap items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Link href="/forums" className="hover:text-white transition-colors">
              Forums
            </Link>
            <span className="text-slate-300">/</span>
            {category && (
              <>
                <Link
                  href={`/c/${category.slug}`}
                  className="hover:text-white transition-colors"
                >
                  {category.name}
                </Link>
                <span className="text-slate-300">/</span>
              </>
            )}
            <span className="text-slate-500">Thread Details</span>
          </div>

          {/* Main Title & Vote Control */}
          <div className="flex gap-4 sm:gap-5">
            <VoteControl upvotes={thread.upvotes} downvotes={thread.downvotes} threadId={id} userVote={thread.userVote} />
            <div className="flex-1">
              <TagList tags={thread.tags} />
              <h1 className="mt-2.5 text-2xl font-bold leading-snug tracking-tight text-white sm:text-3xl lg:text-4xl">
                {thread.title}
              </h1>
              <p className="mt-4 text-xs sm:text-sm text-slate-400">
                Started by{" "}
                <Link
                  href={`/u/${thread.author}`}
                  className="font-bold text-brand-blue hover:text-white transition-colors"
                >
                  @{thread.author}
                </Link>{" "}
                · {thread.replies} replies · {thread.views.toLocaleString()} views
              </p>
              <div className="mt-4.5 flex flex-wrap items-center gap-2">
                <ShareButton />
                {canDeleteThread && (
                  <DeleteThreadButton threadId={id} />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Discussion Container */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="space-y-6">
          {/* 1. OP (Original Post) Node */}
          {threadPosts.length > 0 && (
            <div>
              <CommentNode
                post={threadPosts[0]}
                threadId={id}
                depth={0}
                isLoggedIn={!!profile}
                isStaff={isStaff}
                currentUsername={profile?.username}
              />
            </div>
          )}

          {/* 2. Replies (Comments) Tree */}
          <div className="mt-12 pt-8 border-t border-white/5">
            <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
              Discussion ({thread.replies} Comments)
            </h2>
            
            <div className="space-y-6">
              {threadPosts.slice(1).map((post) => (
                <CommentNode
                  key={post.id}
                  post={post}
                  threadId={id}
                  depth={0}
                  isLoggedIn={!!profile}
                  isStaff={isStaff}
                  currentUsername={profile?.username}
                />
              ))}

              {threadPosts.length <= 1 && (
                <div className="rounded-xl border border-dashed border-white/5 bg-slate-950/20 px-6 py-12 text-center">
                  <span className="text-2xl">💬</span>
                  <p className="mt-2 text-sm font-bold text-slate-200">No comments here yet</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Be the first to share your thoughts.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Global Thread Reply Composer */}
        <div className="mt-12" id="reply">
          <ReplyForm threadId={id} isLoggedIn={!!profile} />
        </div>
      </div>
    </div>
  );
}
