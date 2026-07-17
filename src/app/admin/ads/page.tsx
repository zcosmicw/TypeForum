import { AdminAdSettingsForm } from "@/components/AdminAdSettingsForm";
import { getAdConfig } from "@/lib/data";

export default async function AdminAdsPage() {
  const config = await getAdConfig();

  return (
    <div className="max-w-3xl">
      <div className="accent-bar border-coral mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-cream">
          Ad Management
        </h1>
      </div>
      <p className="mb-8 text-sm text-muted">
        Configure the global banner advertisement placement.
      </p>
      
      <AdminAdSettingsForm config={config} />
    </div>
  );
}
