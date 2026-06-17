import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { FeedCard } from "@/components/FeedCard";
import { PageHero } from "@/components/PageHero";
import { CreateFeedPostButton } from "@/components/CreateFeedPostModal";
import { fetchFeedSorted } from "@/lib/data";
import { getSessionUser } from "@/lib/actions/auth";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort = "hot" } = await searchParams;
  const feedSort = sort === "new" || sort === "trending" ? sort : "hot";
  const posts = await fetchFeedSorted(feedSort);
  const user = await getSessionUser();

  return (
    <div className="flex-1">
      <PageHero
        eyebrow="Media feed"
        title="Transformations & progress"
        description="Photo and video posts, before/after logs, likes, comments, and shares."
      >
        <div className="flex flex-wrap gap-2">
          {(["hot", "new", "trending"] as const).map((tab) => (
            <Link
              key={tab}
              href={`/feed?sort=${tab}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${
                feedSort === tab
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "glass-panel text-slate-300 ring-1 ring-white/10 hover:bg-slate-800"
              }`}
            >
              {tab}
            </Link>
          ))}
        </div>
      </PageHero>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3">
        <div className="grid gap-6 sm:grid-cols-2 lg:col-span-2">
          {posts.map((post, i) => (
            <div key={post.id}>
              <FeedCard post={post} />
              {i === 1 && (
                <div className="mt-6">
                  <AdSlot variant="in-feed" />
                </div>
              )}
            </div>
          ))}
        </div>
        <aside className="space-y-6">
          <AdSlot variant="sidebar" />
          <div className="rounded-xl glass-panel p-5">
            <h3 className="font-semibold text-white">Post to feed</h3>
            <p className="mt-2 text-sm text-slate-500">
              Share photos, videos, or before/after transformations.
            </p>
            <CreateFeedPostButton isLoggedIn={!!user} />
          </div>
        </aside>
      </div>
    </div>
  );
}
