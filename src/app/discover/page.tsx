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
    <div className="flex-1">
      <PageHero
        eyebrow="Discovery & algorithm"
        title="Find what's hot"
        description="Trending threads, recommended users, hot posts, and category-based sorting."
      >
        <div className="flex flex-wrap gap-2.5">
          {tabs.map((t) => (
            <Link
              key={t}
              href={`/discover?tab=${t}`}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-all duration-200 ${
                activeTab === t
                  ? "bg-gradient-to-r from-teal-500 to-cyan-400 text-white shadow-[0_0_12px_rgba(45,212,191,0.25)]"
                  : "bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {t}
            </Link>
          ))}
        </div>
      </PageHero>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold capitalize text-white">
            {activeTab} threads
          </h2>
          <div className="panel-border overflow-hidden rounded-xl surface-panel">
            {tabThreads[activeTab].map((thread) => (
              <ThreadRow key={thread.id} thread={thread} />
            ))}
            {tabThreads[activeTab].length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-slate-500">
                Nothing here yet.
              </div>
            )}
          </div>
        </div>

        <aside>
          <h2 className="mb-4 text-lg font-bold text-white">
            Recommended users
          </h2>
          <div className="space-y-3">
            {recommendedUsers.map((user) => (
              <div
                key={user.username}
                className="panel-border rounded-xl surface-panel p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/u/${user.username}`}
                      className="font-semibold text-brand-teal hover:text-white"
                    >
                      @{user.username}
                    </Link>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {user.bio || "TypeForum member"}
                    </p>
                  </div>
                  <RankBadge rank={user.userRank} size="sm" />
                </div>
              </div>
            ))}
            {recommendedUsers.length === 0 && (
              <p className="text-sm text-slate-500">No users yet.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
