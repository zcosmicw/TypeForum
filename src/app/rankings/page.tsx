import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { RankBadge } from "@/components/RankBadge";
import { achievementBadges } from "@/lib/data";
import { fetchLeaderboard } from "@/lib/forum/queries";
import { getSessionUser } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export default async function RankingsPage() {
  const [leaderboard, user] = await Promise.all([
    fetchLeaderboard(),
    getSessionUser(),
  ]);

  return (
    <div className="flex-1">
      <PageHero
        eyebrow="Ranking system"
        title="Rank 4 ranks & leaderboards"
        description="Community-voted rank ratings, progress tracking, and achievement badges."
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-lg font-bold text-white">
              Rank leaderboard
            </h2>
            <div className="premium-card overflow-hidden">
              {leaderboard.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-gray-900/50 text-left text-xs uppercase tracking-wider text-slate-400">
                      <th className="px-5 py-3.5 font-bold">Rank</th>
                      <th className="px-5 py-3.5 font-bold">User</th>
                      <th className="px-5 py-3.5 font-bold">Tier</th>
                      <th className="px-5 py-3.5 font-bold">Score</th>
                      <th className="px-5 py-3.5 font-bold">Δ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry) => (
                      <tr
                        key={entry.username}
                        className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors duration-150"
                      >
                        <td className="px-5 py-3.5 font-bold text-blue-400">
                          #{entry.rank}
                        </td>
                        <td className="px-5 py-3.5">
                          <Link
                            href={`/u/${entry.username}`}
                            className="font-bold text-slate-100 hover:text-purple-300 transition-colors"
                          >
                            @{entry.username}
                          </Link>
                        </td>
                        <td className="px-5 py-3.5">
                          <RankBadge rank={entry.userRank} size="sm" />
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-200">
                          {entry.score.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-emerald-400">
                          +{entry.progressDelta}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-6 py-10 text-center text-sm text-slate-500">
                  Leaderboard fills as members join and post.
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-xl border border-brand-purple-neon/30 bg-purple-900/20 p-5">
              <h3 className="font-semibold text-white">Platform Ranks</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Ranks are awarded manually by system administrators to recognize notable contributions and achievements within the community.
              </p>
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-white">Achievements</h3>
              <div className="space-y-2">
                {achievementBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="rounded-lg border border-white/10 glass-panel px-3 py-2"
                  >
                    <p className="text-sm font-medium text-white">
                      {badge.label}
                    </p>
                    <p className="text-xs text-slate-500">{badge.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
