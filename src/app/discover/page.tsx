import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { ThreadRow } from "@/components/ThreadRow";
import { RankBadge } from "@/components/RankBadge";
import {
  fetchRecommendedUsers,
  fetchRecentThreads,
  fetchThreadsByCategory,
  fetchTrendingThreads,
} from "@/lib/forum/queries";

export const dynamic = "force-dynamic";

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "trending" } = await searchParams;
  const tabs = ["trending", "hot", "new", "recommended"] as const;
  const activeTab = tabs.includes(tab as (typeof tabs)[number])
    ? (tab as (typeof tabs)[number])
    : "trending";

  const [trending, recent, progressThreads, recommendedUsers] = await Promise.all([
    fetchTrendingThreads(),
    fetchRecentThreads(20),
    fetchThreadsByCategory("progress"),
    fetchRecommendedUsers(3),
  ]);

  const hotThreads = [...recent].sort(
    (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes),
  );

  const tabThreads = {
    trending,
    hot: hotThreads,
    new: recent,
    recommended: progressThreads,
  };

  return (
    <>
      <PageHero
        eyebrow="Discovery"
        title="Find what's hot"
        description="Trending threads, recommended users, and hot posts."
      >
        <div className="flex flex-wrap gap-2 mt-4">
          {tabs.map((t) => (
            <Link
              key={t}
              href={`/discover?tab=${t}`}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeTab === t
                  ? "bg-accent text-bg-root"
                  : "bg-bg-elevated text-text-muted border border-border-default hover:text-text-primary hover:border-border-strong"
              }`}
            >
              {t}
            </Link>
          ))}
        </div>
      </PageHero>

      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-6 text-lg font-semibold text-text-primary capitalize">
            {activeTab} threads
          </h2>
          <div className="card overflow-hidden">
            {tabThreads[activeTab].map((thread) => (
              <ThreadRow key={thread.id} thread={thread} />
            ))}
            {tabThreads[activeTab].length === 0 && (
              <div className="px-6 py-14 text-center text-sm text-text-muted">
                Nothing here yet.
              </div>
            )}
          </div>
        </div>

        <aside>
          <h2 className="mb-6 text-lg font-semibold text-text-primary">Active users</h2>
          <div className="space-y-3">
            {recommendedUsers.map((user) => (
              <div key={user.username} className="card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/u/${user.username}`}
                      className="font-semibold text-accent hover:underline"
                    >
                      @{user.username}
                    </Link>
                    <p className="mt-1 line-clamp-2 text-sm text-text-muted">
                      {user.bio || "TypeForum member"}
                    </p>
                  </div>
                  <RankBadge rank={user.userRank} size="sm" />
                </div>
              </div>
            ))}
            {recommendedUsers.length === 0 && (
              <p className="text-sm text-text-muted">No users yet.</p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
