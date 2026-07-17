import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getSessionProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "moderator")) {
    redirect("/forums");
  }

  const navLinks = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/forums", label: "Categories" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/ads", label: "Ads" },
    { href: "/admin/ranks", label: "Ranks" },
  ];

  return (
    <div className="flex-1 border-t-2 border-border">
      <div className="mx-auto flex max-w-6xl flex-col lg:flex-row">
        <aside className="w-full shrink-0 border-b-2 border-border lg:w-64 lg:border-b-0 lg:border-r-2">
          <div className="p-6">
            <h2 className="text-xl font-black uppercase tracking-tighter text-cream mb-6">Admin Panel</h2>
            <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="shrink-0 border-2 border-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted hover:border-volt hover:text-volt transition-colors bg-surface lg:w-full"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
