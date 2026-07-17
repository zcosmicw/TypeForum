import { isSupabaseConfigured } from "@/lib/supabase/config";

export function SupabaseSetupBanner() {
  if (isSupabaseConfigured()) return null;

  return (
    <div className="bg-accent px-4 py-2.5 text-center text-sm font-semibold text-bg-root sticky top-0 z-[100]">
      <p className="flex items-center justify-center gap-2">
        <span>⚠️</span>
        Supabase environment variables are missing. Please connect your project to continue.
      </p>
    </div>
  );
}
