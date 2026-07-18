import { redirect } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { getSessionUser } from "@/lib/actions/auth";
import { fetchNotifications } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const notifications = await fetchNotifications();

  return (
    <>
      <PageHero eyebrow="Activity" title="Notifications" />
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <div className="card overflow-hidden">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`border-b border-border-subtle p-4 transition-colors last:border-0 ${
                notif.read ? "bg-bg-card" : "bg-accent-ghost"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-lg">
                  {notif.type === "vote" && "⭐"}
                  {notif.type === "follow" && "👀"}
                  {notif.type === "reply" && "💬"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">
                    {notif.message}
                  </p>
                  <p className="mt-1 mono text-[11px] text-text-ghost">
                    {notif.createdAt}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="px-6 py-14 text-center text-sm text-text-muted">
              No notifications yet.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
