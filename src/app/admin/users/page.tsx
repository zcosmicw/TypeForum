import { RankBadge } from "@/components/RankBadge";
import { UserModerationActions } from "@/components/UserModerationActions";
import { fetchAllUsers } from "@/lib/forum/queries";
import { getSessionProfile } from "@/lib/actions/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [users, sessionProfile] = await Promise.all([
    fetchAllUsers(),
    getSessionProfile(),
  ]);

  return (
    <div className="max-w-5xl">
      <h1 className="mb-2 text-xl font-semibold text-text-primary">User management</h1>
      <p className="mb-8 text-sm text-text-muted">
        View and manage all registered users.
      </p>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm text-text-primary">
          <thead>
            <tr className="border-b border-border-default bg-bg-surface">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">User</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Rank</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Role</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {users.map((user) => {
              const isSelf = sessionProfile?.id === user.id;

              return (
                <tr key={user.id} className="transition-colors hover:bg-bg-hover/50">
                  <td className="px-5 py-3.5">
                    <Link href={`/u/${user.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-ghost text-xs font-bold text-accent overflow-hidden">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          user.display_name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-medium hover:underline">{user.display_name}</div>
                        <div className="text-xs text-text-muted">@{user.username}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <RankBadge rank={user.rank as any} size="sm" />
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`mono text-[11px] font-medium px-2 py-0.5 rounded ${user.role === "admin" ? "bg-coral/15 text-coral" : "bg-bg-surface text-text-muted border border-border-default"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {!isSelf && (
                      <div className="flex justify-end">
                        <UserModerationActions
                          targetUserId={user.id}
                          targetUsername={user.username}
                          targetUserRole={user.role}
                          targetUserIsBanned={user.is_banned}
                          currentUserRole={sessionProfile?.role ?? null}
                          buttonSize="sm"
                        />
                      </div>
                    )}
                    {isSelf && <span className="text-xs text-text-ghost">You</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="px-6 py-14 text-center text-sm text-text-muted">
            No users found.
          </div>
        )}
      </div>
    </div>
  );
}
