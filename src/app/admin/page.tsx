import { AdminSiteSettingsForm } from "@/components/AdminSiteSettingsForm";
import { getSiteSettings } from "@/lib/data";

export default async function AdminDashboardPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-3xl">
      <div className="accent-bar mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-cream">
          Site Settings
        </h1>
      </div>
      <p className="mb-8 text-sm text-muted">
        Configure the global appearance, copy, and branding of the application.
      </p>

      <AdminSiteSettingsForm settings={settings} />
    </div>
  );
}
