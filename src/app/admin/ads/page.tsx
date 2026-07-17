import { AdminAdSettingsForm } from "@/components/AdminAdSettingsForm";
import { getAdConfig } from "@/lib/data";

export default async function AdminAdsPage() {
  const config = await getAdConfig();

  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 text-xl font-semibold text-text-primary">Ad management</h1>
      <p className="mb-8 text-sm text-text-muted">
        Configure the global banner advertisement placement.
      </p>
      <AdminAdSettingsForm config={config} />
    </div>
  );
}
