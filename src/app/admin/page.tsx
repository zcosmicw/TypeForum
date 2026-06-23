import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/actions/auth";
import { AdminRowActions } from "@/components/AdminRowActions";
import { AdminAdSettingsForm } from "@/components/AdminAdSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const currentProfile = await getSessionProfile();

  // Block non-staff from accessing the dashboard
  if (!currentProfile || (currentProfile.role !== "admin" && currentProfile.role !== "moderator")) {
    redirect("/login");
  }

  const supabase = await createClient();
  if (!supabase) throw new Error("Database not connected");

  // Fetch ad settings and profiles
  const [ { data: adConfig }, { data: dbProfiles } ] = await Promise.all([
    supabase.from("ad_config").select("enabled, image_url").eq("id", 1).maybeSingle(),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
  ]);

  const usersList = (dbProfiles || []).map((p) => ({
    id: p.id,
    username: p.username,
    displayName: p.display_name,
    role: p.role || "user",
    isBanned: p.is_banned || false,
    userRank: p.rank,
    postCount: p.post_count,
  }));

  return (
    <div className="flex-1 bg-slate-900/50 py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Dashboard Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Admin Panel
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Manage user roles, ban statuses, ad space configurations, and audit activities.
            </p>
          </div>
          <Link
            href="/forums"
            className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            ← Back to Forums
          </Link>
        </div>

        {/* Global Ad Banner Settings (Admins Only) */}
        {currentProfile.role === "admin" && (
          <AdminAdSettingsForm initialConfig={adConfig || null} />
        )}

        {/* User Management Table Card */}
        <div className="neon-border overflow-hidden rounded-xl border border-white/10 glass-panel shadow-sm">
          <div className="border-b border-white/5 bg-slate-900/40 px-6 py-4">
            <h2 className="text-sm font-bold text-slate-100">User Management</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-500">
              <thead className="bg-slate-900/50 text-xs font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th scope="col" className="px-6 py-3.5">User</th>
                  <th scope="col" className="px-6 py-3.5">Rank 4 Tier</th>
                  <th scope="col" className="px-6 py-3.5">Posts</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usersList.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-slate-800/40">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-brand-blue">
                          {userItem.username.charAt(0)}
                        </span>
                        <div>
                          <Link
                            href={`/u/${userItem.username}`}
                            className="font-semibold text-white hover:text-brand-blue"
                          >
                            {userItem.displayName}
                          </Link>
                          <div className="text-xs text-slate-400">
                            @{userItem.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium capitalize text-slate-300">
                      {userItem.userRank}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-300">
                      {userItem.postCount}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {userItem.isBanned ? (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                          Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <AdminRowActions
                        targetUserId={userItem.id}
                        targetUsername={userItem.username}
                        currentRole={userItem.role}
                        currentRank={userItem.userRank}
                        isBanned={userItem.isBanned}
                        currentUserRole={currentProfile.role || "user"}
                        currentUserId={currentProfile.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
