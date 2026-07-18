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
    <>
      <div className="relative h-44 w-full overflow-hidden bg-bg-surface border-b border-border-subtle">
        {user.bannerUrl ? (
          <img src={user.bannerUrl} alt={`${user.displayName}'s banner`} className="h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-bg-elevated to-bg-surface" />
        )}
      </div>

      <div className="mx-auto max-w-4xl px-5 pb-10 sm:px-8">
        <div className="relative -mt-14 flex flex-col gap-5 sm:flex-row sm:items-end">
          <div className="relative h-28 w-28 shrink-0 rounded-2xl border-4 border-bg-root bg-accent-ghost flex items-center justify-center overflow-hidden">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={`${user.displayName}'s avatar`} className="h-full w-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-accent">
                {user.displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1 pb-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                {user.displayName}
              </h1>
              <RankBadge rank={user.userRank} />
            </div>
            <p className="mt-1 text-sm font-medium text-accent">@{user.username}</p>
          </div>
        </div>

        <div className="mt-8 border-t border-b border-border-subtle py-8">
          <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-text-secondary">
            {user.bio || "No bio yet."}
          </p>
          <div className="mt-6 flex flex-wrap gap-8 text-sm">
            <span className="text-text-muted">
              <strong className="text-text-primary text-base mr-1">{user.postCount}</strong> posts
            </span>
            <span className="text-text-muted">
              <strong className="text-text-primary text-base mr-1">{user.followerCount}</strong> followers
            </span>
            <span className="text-text-muted">
              <strong className="text-text-primary text-base mr-1">{user.followingCount}</strong> following
            </span>
          </div>
          <div className="mt-6">
            <ProfileActions
              targetUserId={user.id}
              username={user.username}
              targetUserRole={user.role}
              targetUserRank={user.userRank}
              targetUserIsBanned={user.isBanned}
              currentUserRole={sessionProfile?.role ?? null}
              isLoggedIn={!!sessionUser}
              initialIsFollowing={isFollowing}
              isOwnProfile={sessionUser?.id === user.id}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl gap-8 px-5 py-8 sm:px-8 md:grid-cols-3">
        <div className="space-y-8 md:col-span-2">
          <section>
            <h2 className="mb-6 text-lg font-semibold text-text-primary">Stats</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Upvotes", value: user.stats.upvotes },
                { label: "Comments", value: user.stats.comments },
                { label: "Threads", value: user.stats.threadsCreated },
              ].map((stat) => (
                <div key={stat.label} className="card p-4 text-center">
                  <p className="text-2xl font-bold text-accent">{stat.value}</p>
                  <p className="mt-1 text-xs text-text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside>
          <h2 className="mb-6 text-lg font-semibold text-text-primary">Badges</h2>
          {user.badges.length > 0 ? (
            <div className="space-y-2">
              {user.badges.map((badge) => (
                <div key={badge.id} className="card px-3 py-2.5 flex items-center justify-center">
                  <p className="text-sm font-medium text-text-primary">{badge.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">No badges yet.</p>
          )}
        </aside>
      </div>
    </>
  );
}
