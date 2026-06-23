import { createClient } from "@/lib/supabase/server";

export async function Footer() {
  const supabase = await createClient();
  const { data: siteSettings } = supabase
    ? await supabase.from("site_settings").select("site_name, footer_main, footer_sub").eq("id", 1).maybeSingle()
    : { data: null };

  const siteName = siteSettings?.site_name || "TypeForum";
  const footerMain = siteSettings?.footer_main || "looks, health, and self-improvement.";
  const footerSub = siteSettings?.footer_sub || "Discuss. Share. Connect.";

  return (
    <footer className="mt-auto border-t border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <p className="text-sm text-slate-400">
          <span className="font-semibold text-white">{siteName}</span> — {footerMain}
        </p>
        <p className="text-xs text-slate-500">
          {footerSub}
        </p>
      </div>
    </footer>
  );
}
