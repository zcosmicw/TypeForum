import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/actions/auth";

export async function Footer() {
  const [supabase, profile] = await Promise.all([
    createClient(),
    getSessionProfile(),
  ]);
  const siteSettings = supabase
    ? await supabase.from("site_settings").select("site_name, footer_main, footer_sub").eq("id", 1).maybeSingle().then((res) => res.data)
    : null;

  const siteName = siteSettings?.site_name || "TypeForum";
  const footerMain = siteSettings?.footer_main || "Community-driven discussions.";
  const footerSub = siteSettings?.footer_sub || "Built for real conversations.";

  return (
    <footer className="border-t border-border-subtle bg-bg-root">
      <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-xs font-bold text-bg-root">
                T
              </span>
              <span className="text-[0.9375rem] font-bold tracking-tight text-text-primary">
                {siteName}
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-muted">
              {footerMain}
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <p className="section-label mb-3">Navigate</p>
              <div className="flex flex-col gap-2">
                <Link href="/forums" className="text-sm text-text-muted transition-colors hover:text-text-primary">Forums</Link>
                <Link href="/discover" className="text-sm text-text-muted transition-colors hover:text-text-primary">Discover</Link>
                <Link href="/search" className="text-sm text-text-muted transition-colors hover:text-text-primary">Search</Link>
              </div>
            </div>
            <div>
              <p className="section-label mb-3">Account</p>
              <div className="flex flex-col gap-2">
                {profile ? (
                  <>
                    <Link href={`/u/${profile.username}`} className="text-sm text-text-muted transition-colors hover:text-text-primary">Profile</Link>
                    <Link href="/settings" className="text-sm text-text-muted transition-colors hover:text-text-primary">Settings</Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-sm text-text-muted transition-colors hover:text-text-primary">Log in</Link>
                    <Link href="/signup" className="text-sm text-text-muted transition-colors hover:text-text-primary">Sign up</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-border-subtle pt-6">
          <p className="text-xs text-text-ghost">{footerSub}</p>
        </div>
      </div>
    </footer>
  );
}
