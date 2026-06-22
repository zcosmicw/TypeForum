import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { SignOutButton } from "@/components/SignOutButton";
import { getSessionProfile } from "@/lib/actions/auth";
import { getUnreadMessageCount, getUnreadNotificationCount } from "@/lib/data";

const navLinks = [
  { href: "/forums", label: "Forums" },
  { href: "/discover", label: "Discover" },
  { href: "/rankings", label: "Rankings" },
  { href: "/store", label: "Store" },
];

export async function Header() {
  const profile = await getSessionProfile();
  const unreadNotifications = await getUnreadNotificationCount();
  const unreadMessages = await getUnreadMessageCount();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-gray-950/70 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-sm font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_22px_rgba(168,85,247,0.5)]">
              MT
            </span>
            <div>
              <span className="text-lg font-bold tracking-tight text-white transition-colors group-hover:text-purple-300">
                TypeForum
              </span>
              <span className="neon-purple ml-1.5 hidden text-xs font-semibold tracking-wider uppercase lg:inline">
                ranking
              </span>
            </div>
          </Link>

          <div className="hidden flex-1 justify-center md:flex">
            <SearchBar />
          </div>

          <nav className="hidden items-center gap-1.5 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {profile && (
              <>
                <Link
                  href="/notifications"
                  className="relative rounded-lg p-2 text-slate-400 transition-all hover:bg-white/5 hover:text-white"
                  aria-label="Notifications"
                >
                  🔔
                  {unreadNotifications > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-purple-neon text-[10px] font-bold text-white animate-pulse">
                      {unreadNotifications}
                    </span>
                  )}
                </Link>
                <Link
                  href="/messages"
                  className="relative rounded-lg p-2 text-slate-400 transition-all hover:bg-white/5 hover:text-white"
                  aria-label="Messages"
                >
                  ✉
                  {unreadMessages > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                      {unreadMessages}
                    </span>
                  )}
                </Link>
                {(profile.role === "admin" || profile.role === "moderator") && (
                  <Link
                    href="/admin"
                    className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-brand-purple-soft hover:bg-white/5 sm:block"
                  >
                    🛡️ Admin
                  </Link>
                )}
                <Link
                  href="/settings"
                  className="hidden rounded-lg p-2 text-slate-400 transition-all hover:bg-white/5 hover:text-white sm:block"
                  aria-label="Settings"
                >
                  ⚙
                </Link>
                <Link
                  href={`/u/${profile.username}`}
                  className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-white/5 hover:text-white sm:flex"
                >
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="h-5 w-5 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-[9px] font-bold text-white uppercase">
                      {profile.display_name.charAt(0)}
                    </span>
                  )}
                  <span>@{profile.username}</span>
                </Link>
                <SignOutButton />
              </>
            )}
            {!profile && (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-white/5 hover:text-white sm:block"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="btn-premium-primary rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md transition-all sm:px-4.5"
                >
                  Join
                </Link>
              </>
            )}
          </div>
        </div>

        <nav className="flex gap-1.5 overflow-x-auto border-t border-white/5 py-2.5 lg:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-full bg-slate-900 border border-white/5 px-3 py-1 text-xs font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
