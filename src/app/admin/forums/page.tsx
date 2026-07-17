import { AdminForumConfigForm } from "@/components/AdminForumConfigForm";
import { getForumConfig } from "@/lib/data";

export default async function AdminForumsPage() {
  const config = await getForumConfig();

  return (
    <div className="max-w-4xl">
      <h1 className="mb-2 text-xl font-semibold text-text-primary">Forum configuration</h1>
      <p className="mb-8 text-sm text-text-muted">
        Define the core category and subforum structure via JSON.
      </p>
      <AdminForumConfigForm config={config} />
    </div>
  );
}
