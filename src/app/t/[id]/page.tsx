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
    <div className="pb-20">
      <section className="border-b border-border-subtle bg-bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-text-muted">
            <Link href="/forums" className="hover:text-accent transition-colors">
              Forums
            </Link>
            <span className="text-text-ghost">/</span>
            {category && (
              <>
                <Link href={`/c/${category.slug}`} className="hover:text-accent transition-colors">
                  {category.name}
                </Link>
                <span className="text-text-ghost">/</span>
              </>
            )}
            <span className="text-text-primary">Thread</span>
          </div>

          <div className="flex gap-5 sm:gap-6">
            <VoteControl upvotes={thread.upvotes} downvotes={thread.downvotes} threadId={id} userVote={thread.userVote} />
            <div className="flex-1 min-w-0">
              <TagList tags={thread.tags} />
              <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-text-primary sm:text-3xl lg:text-4xl">
                {thread.title}
              </h1>
              <p className="mt-4 text-sm text-text-muted">
                by{" "}
                <Link href={`/u/${thread.author}`} className="font-semibold text-accent hover:underline">
                  @{thread.author}
                </Link>
                {" "}· {thread.replies} replies · {thread.views.toLocaleString()} views
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <ShareButton />
                {canDeleteThread && <DeleteThreadButton threadId={id} />}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <div className="space-y-8">
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

          <div className="mt-16 pt-12 border-t border-border-subtle">
            <h2 className="mb-8 flex items-center gap-3 text-sm font-semibold text-text-muted">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Discussion ({thread.replies})
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
                <div className="card border-dashed px-6 py-16 text-center">
                  <p className="text-lg font-semibold text-text-primary">No comments yet</p>
                  <p className="mt-2 text-sm text-text-muted">
                    Be the first to share your thoughts.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16" id="reply">
          <ReplyForm threadId={id} isLoggedIn={!!profile} />
        </div>
      </div>
    </div>
  );
}
