import { redirect } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { ProfileSettingsForm } from "@/components/ProfileSettingsForm";
import { getSessionProfile } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await getSessionProfile();
  if (!profile) {
    redirect("/login");
  }

  return (
    <>
      <PageHero
        eyebrow="Configuration"
        title="Settings"
        description="Manage your profile information and preferences."
      />
      <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
        <ProfileSettingsForm profile={profile} />
      </div>
    </>
  );
}
