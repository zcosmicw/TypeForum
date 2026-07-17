import { AdminSiteSettingsForm } from "@/components/AdminSiteSettingsForm";
import { getSiteSettings } from "@/lib/data";

export default async function AdminDashboardPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 text-xl font-semibold text-text-primary">Site settings</h1>
      <p className="mb-8 text-sm text-text-muted">
        Configure the global appearance, copy, and branding.
      </p>
      <AdminSiteSettingsForm settings={settings} />
    </div>
  );
}
