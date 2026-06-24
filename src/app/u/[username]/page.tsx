import Link from "next/link";
import { notFound } from "next/navigation";
import { RankBadge } from "@/components/RankBadge";
import { ProfileActions } from "@/components/ProfileActions";
import { fetchProfile } from "@/lib/forum/queries";
import { getSessionUser, getSessionProfile } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

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

  let isFollowing = false;
  if (sessionUser) {
    const supabase = await createClient();
    if (supabase) {
      const { data: followRecord } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", sessionUser.id)
        .eq("following_id", user.id)
        .maybeSingle();
      isFollowing = !!followRecord;
    }
  }

  return (
    <div className="flex-1">
      {/* Banner Container */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900 border-b border-white/10">
        {user.bannerUrl ? (
          <img
            src={user.bannerUrl}
            alt={`${user.displayName}'s banner`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-pink-900/40 opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-10 sm:px-6">
        <div className="relative -mt-16 flex flex-col gap-6 sm:flex-row sm:items-end">
          {/* Avatar Picture */}
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-slate-950 bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl flex items-center justify-center">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.displayName}'s avatar`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-white">
                {user.displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {user.displayName}
              </h1>
              <RankBadge rank={user.userRank} />
            </div>
            <p className="mt-1 text-sm text-slate-400 font-medium">@{user.username}</p>
          </div>
        </div>

        {/* Profile Bio & Action row */}
        <div className="mt-6 border-b border-white/5 pb-6">
          <p className="max-w-2xl leading-relaxed text-slate-300">
            {user.bio || "No bio yet."}
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
            <span>
              <strong className="text-white">{user.postCount}</strong> posts
            </span>
            <span>
              <strong className="text-white">{user.followerCount}</strong> followers
            </span>
            <span>
              <strong className="text-white">{user.followingCount}</strong> following
            </span>
            <span>Joined {user.joinDate}</span>
          </div>
          <div className="mt-5">
            <ProfileActions
              targetUserId={user.id}
              username={user.username}
              currentRank={user.userRank}
              currentUserRole={sessionProfile?.role ?? null}
              isLoggedIn={!!sessionUser}
              initialIsFollowing={isFollowing}
              isOwnProfile={sessionUser?.id === user.id}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <section>
            <h2 className="mb-3 text-lg font-bold text-white">Stats</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Upvotes", value: user.stats.upvotes },
                { label: "Comments", value: user.stats.comments },
                { label: "Threads Created", value: user.stats.threadsCreated },
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
