import { RankBadge } from "@/components/RankBadge";
import { AdminRowActions } from "@/components/AdminRowActions";
import { fetchAllUsers } from "@/lib/forum/queries";
import { getSessionProfile } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [users, sessionProfile] = await Promise.all([
    fetchAllUsers(),
    getSessionProfile(),
  ]);

  return (
    <div className="max-w-6xl">
      <div className="accent-bar mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-cream">
          User Management
        </h1>
      </div>
      
      <div className="card-brutal-static overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm text-cream">
          <thead>
            <tr className="border-b-2 border-border bg-ink">
              <th className="px-6 py-4 font-black uppercase tracking-wider text-muted">User</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-muted">Rank</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-muted">Role</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-muted text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-border">
            {users.map((user) => {
              const isSelf = sessionProfile?.id === user.id;

              return (
                <tr key={user.id} className="transition-colors hover:bg-surface">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 shrink-0 border-2 border-ink bg-volt flex items-center justify-center font-black text-ink shadow-[2px_2px_0_#0c0c0c]">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          user.display_name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-bold">{user.display_name}</div>
                        <div className="mono text-[10px] text-muted font-bold tracking-wider uppercase">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RankBadge rank={user.rank as any} size="sm" />
                  </td>
                  <td className="px-6 py-4">
                    <span className={`mono text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${user.role === "admin" ? "bg-coral/20 text-coral" : "bg-ink text-muted border border-border"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!isSelf && (
                      <div className="flex justify-end">
                        <AdminRowActions
                          targetId={user.id}
                          currentRole={user.role}
                        />
                      </div>
                    )}
                    {isSelf && <span className="mono text-[10px] font-bold uppercase text-muted">It's you</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-8 text-center text-sm font-bold text-muted uppercase tracking-wider">
            No users found.
          </div>
        )}
      </div>
    </div>
  );
}
