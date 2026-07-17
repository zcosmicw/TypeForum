import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { SignOutButton } from "@/components/SignOutButton";
import { getSessionProfile } from "@/lib/actions/auth";
import { getUnreadNotificationCount } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

const navLinks = [
  { href: "/forums", label: "Forums" },
  { href: "/discover", label: "Discover" },
];

export async function Header() {
  const profile = await getSessionProfile();
  const unreadNotifications = await getUnreadNotificationCount();

  const supabase = await createClient();
  const siteSettings = supabase
    ? await supabase.from("site_settings").select("site_name").eq("id", 1).maybeSingle().then((res) => res.data)
    : null;
  const siteName = siteSettings?.site_name || "TypeForum";

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-root/95 backdrop-blur-md">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="flex h-14 items-center justify-between gap-6">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-xs font-bold text-bg-root">
              T
            </span>
            <span className="text-[0.9375rem] font-bold tracking-tight text-text-primary">
              {siteName}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text-primary hover:bg-bg-hover"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden flex-1 justify-center md:flex">
            <SearchBar />
          </div>

          <div className="flex items-center gap-1">
            {profile && (
              <>
                <Link
                  href="/notifications"
                  className="relative rounded-md p-2 text-text-muted transition-colors hover:text-text-primary hover:bg-bg-hover"
                  aria-label="Notifications"
                >
                  <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  {unreadNotifications > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral text-[10px] font-bold text-white px-1">
                      {unreadNotifications}
                    </span>
                  )}
                </Link>

                {(profile.role === "admin" || profile.role === "moderator") && (
                  <Link
                    href="/admin"
                    className="hidden rounded-md px-2.5 py-1.5 text-xs font-semibold text-coral transition-colors hover:bg-bg-hover sm:block"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/settings"
                  className="hidden rounded-md p-2 text-text-muted transition-colors hover:text-text-primary hover:bg-bg-hover sm:block"
                  aria-label="Settings"
                >
                  <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
                <Link
                  href={`/u/${profile.username}`}
                  className="hidden items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary hover:bg-bg-hover sm:flex"
                >
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-bg-root">
                      {profile.display_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="font-medium">@{profile.username}</span>
                </Link>
                <SignOutButton />
              </>
            )}
            {!profile && (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-md px-3 py-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text-primary sm:block"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary px-4 py-1.5 text-sm"
                >
                  Join
                </Link>
              </>
            )}
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto py-2 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:text-text-primary hover:bg-bg-hover"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
