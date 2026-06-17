import Link from "next/link";
import { notFound } from "next/navigation";
import { RankBadge } from "@/components/RankBadge";
import { ProfileActions } from "@/components/ProfileActions";
import { fetchProfile } from "@/lib/forum/queries";
import { getSessionUser, getSessionProfile } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const [user, sessionUser, sessionProfile] = await Promise.all([
    fetchProfile(username),
    getSessionUser(),
    getSessionProfile(),
  ]);

  if (!user) {
    notFound();
  }

  return (
    <div className="flex-1">
      <div className="hero-gradient border-b border-white/10">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <span className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-3xl font-bold text-white shadow-lg">
              {user.displayName.charAt(0)}
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  {user.displayName}
                </h1>
                <RankBadge rank={user.userRank} />
              </div>
              <p className="mt-1 text-sm text-slate-500">@{user.username}</p>
              <p className="mt-3 max-w-xl leading-relaxed text-slate-300">
                {user.bio || "No bio yet."}
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                <span>
                  <strong className="text-white">{user.postCount}</strong> posts
                </span>
                <span>
                  <strong className="text-white">{user.followerCount}</strong>{" "}
                  followers
                </span>
                <span>
                  <strong className="text-white">{user.followingCount}</strong>{" "}
                  following
                </span>
                <span>Joined {user.joinDate}</span>
              </div>
              <ProfileActions
                targetUserId={user.id}
                username={user.username}
                currentRank={user.userRank}
                currentUserRole={sessionProfile?.role ?? null}
                isLoggedIn={!!sessionUser}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <section>
            <h2 className="mb-3 text-lg font-bold text-white">Stats</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Gym streak", value: user.stats.gymStreak },
                { label: "Transformations", value: user.stats.transformations },
                { label: "Helpful votes", value: user.stats.helpfulVotes },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/10 glass-panel p-4 text-center"
                >
                  <p className="text-2xl font-bold text-brand-blue">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside>
          <h2 className="mb-3 text-lg font-bold text-white">Badges</h2>
          {user.badges.length > 0 ? (
            <div className="space-y-2">
              {user.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="rounded-lg border border-white/10 glass-panel px-3 py-2"
                >
                  <p className="text-sm font-medium text-white">{badge.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No badges yet.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
