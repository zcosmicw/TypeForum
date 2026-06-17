import { isSupabaseConfigured } from "@/lib/supabase/config";

export function SupabaseSetupBanner() {
  if (isSupabaseConfigured() || process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
      <strong>Demo mode:</strong> Supabase is not configured. Copy{" "}
      <code className="rounded bg-amber-100 px-1.5 py-0.5">.env.local.example</code> to{" "}
      <code className="rounded bg-amber-100 px-1.5 py-0.5">.env.local</code> and add your
      project URL + anon key from{" "}
      <a
        href="https://supabase.com/dashboard/project/_/settings/api"
        className="font-medium underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        Supabase API settings
      </a>
      . Then run the SQL migration in{" "}
      <code className="rounded bg-amber-100 px-1.5 py-0.5">supabase/migrations/001_initial.sql</code>.
    </div>
  );
}
