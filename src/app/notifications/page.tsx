import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { getSessionUser } from "@/lib/actions/auth";
import { fetchNotifications, markAllNotificationsRead } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const notifications = await fetchNotifications();
  if (notifications.some((n) => !n.is_read)) {
    await markAllNotificationsRead();
  }

  return (
    <div className="flex-1">
      <PageHero eyebrow="Activity" title="NOTIFICATIONS" />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="card-brutal-static overflow-hidden">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`border-b-2 border-border p-4 transition-colors last:border-0 ${
                notif.is_read ? "bg-surface" : "bg-volt/10"
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-1">
                  {notif.type === "upvote" && "⭐"}
                  {notif.type === "follow" && "👀"}
                  {notif.type === "reply" && "💬"}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-cream">
                    {notif.type === "follow" && (
                      <>
                        <Link href={`/u/${notif.actor_username}`} className="text-volt hover:underline">
                          @{notif.actor_username}
                        </Link>{" "}
                        followed you
                      </>
                    )}
                    {notif.type === "upvote" && (
                      <>
                        Your post received an upvote milestone in{" "}
                        {notif.thread_id ? (
                          <Link href={`/t/${notif.thread_id}`} className="text-volt hover:underline">
                            this thread
                          </Link>
                        ) : (
                          "a thread"
                        )}
                      </>
                    )}
                    {notif.type === "reply" && (
                      <>
                        <Link href={`/u/${notif.actor_username}`} className="text-volt hover:underline">
                          @{notif.actor_username}
                        </Link>{" "}
                        replied to your thread/comment
                        {notif.thread_id && (
                          <>
                            {" in "}
                            <Link href={`/t/${notif.thread_id}`} className="text-volt hover:underline">
                              this thread
                            </Link>
                          </>
                        )}
                      </>
                    )}
                  </p>
                  <p className="mt-1 mono text-[10px] uppercase tracking-wider text-muted">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="px-6 py-12 text-center text-sm font-bold text-muted uppercase tracking-wider">
              No notifications yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
