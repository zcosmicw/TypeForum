import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { ProfileSettingsForm } from "@/components/ProfileSettingsForm";
import { SignOutButton } from "@/components/SignOutButton";
import { getSessionProfile } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await getSessionProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex-1">
      <PageHero
        eyebrow="Account settings"
        title="Settings"
        description="Manage your profile, privacy, notifications, premium, and saved drafts."
      />

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:px-6">
        <ProfileSettingsForm profile={profile} />

        <section className="neon-border rounded-xl glass-panel p-5">
          <h2 className="font-semibold text-white">Account</h2>
          <p className="mt-2 text-sm text-slate-500">
            Signed in as @{profile.username}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/u/${profile.username}`}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              View profile
            </Link>
            <SignOutButton />
          </div>
        </section>

        <section className="neon-border rounded-xl glass-panel p-5">
          <h2 className="font-semibold text-white">Coming soon</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li>Privacy & DM permissions</li>
            <li>Notification preferences</li>
            <li>Premium membership & billing</li>
            <li>Saved thread drafts</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
