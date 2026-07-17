import { AdminRanksConfigForm } from "@/components/AdminRanksConfigForm";
import { getRanksConfig } from "@/lib/data";

export default async function AdminRanksPage() {
  const ranksConfig = await getRanksConfig();

  return (
    <div className="max-w-3xl">
      <div className="accent-bar border-frost mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-cream">
          Rank Configuration
        </h1>
      </div>
      <p className="mb-8 text-sm text-muted">
        Manage how the system ranks are labeled on user profiles.
      </p>

      <AdminRanksConfigForm ranksConfig={ranksConfig} />
    </div>
  );
}
