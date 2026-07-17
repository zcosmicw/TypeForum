import { AdminForumConfigForm } from "@/components/AdminForumConfigForm";
import { getForumConfig } from "@/lib/data";

export default async function AdminForumsPage() {
  const config = await getForumConfig();

  return (
    <div className="max-w-4xl">
      <div className="accent-bar border-volt mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-cream">
          Forum Configuration
        </h1>
      </div>
      <p className="mb-8 text-sm text-muted">
        Define the core category and subforum structure via JSON configuration.
      </p>

      <AdminForumConfigForm config={config} />
    </div>
  );
}
