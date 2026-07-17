import { AdminRanksConfigForm } from "@/components/AdminRanksConfigForm";
import { getRanksConfig } from "@/lib/data";

export default async function AdminRanksPage() {
  const ranksConfig = await getRanksConfig();

  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 text-xl font-semibold text-text-primary">Rank configuration</h1>
      <p className="mb-8 text-sm text-text-muted">
        Manage how the system ranks are labeled on user profiles.
      </p>
      <AdminRanksConfigForm ranksConfig={ranksConfig} />
    </div>
  );
}
