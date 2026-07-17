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
    <div className="border-t border-border-subtle">
      <div className="mx-auto flex max-w-[1200px] flex-col lg:flex-row">
        <aside className="w-full shrink-0 border-b border-border-subtle lg:w-56 lg:border-b-0 lg:border-r lg:border-border-subtle">
          <div className="p-6">
            <h2 className="text-base font-semibold text-text-primary mb-5">Admin panel</h2>
            <nav className="flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="shrink-0 rounded-md px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text-primary hover:bg-bg-hover lg:w-full"
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
