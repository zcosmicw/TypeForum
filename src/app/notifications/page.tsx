import { PageHero } from "@/components/PageHero";
import { fetchNotifications } from "@/lib/data";

export default async function NotificationsPage() {
  const notifications = await fetchNotifications();
  return (
    <div className="flex-1">
      <PageHero
        eyebrow="Notification center"
        title="Your alerts"
        description="Replies, follows, votes, rank changes, and new messages."
      />

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            className="text-sm font-medium text-brand-blue hover:text-white"
          >
            Mark all read
          </button>
        </div>
        <div className="neon-border overflow-hidden rounded-xl glass-panel">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex gap-4 border-b border-white/5 px-4 py-4 last:border-0 ${
                !n.read ? "bg-slate-800/30" : "hover:bg-slate-800/30"
              }`}
            >
              <span className="text-lg">
                {n.type === "reply" && "💬"}
                {n.type === "follow" && "👤"}
                {n.type === "vote" && "▲"}
                {n.type === "rank" && "✦"}
                {n.type === "dm" && "✉"}
              </span>
              <div className="flex-1">
                <p className="text-sm text-slate-300">{n.message}</p>
                <p className="mt-1 text-xs text-slate-400">{n.createdAt}</p>
              </div>
              {!n.read && (
                <span className="h-2 w-2 shrink-0 rounded-full bg-brand-purple-neon" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
