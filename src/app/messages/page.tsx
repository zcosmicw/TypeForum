import { PageHero } from "@/components/PageHero";
import { NewMessageComposer } from "@/components/NewMessageComposer";
import { fetchMessages } from "@/lib/data";
import { getSessionUser } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const user = await getSessionUser();
  const messages = await fetchMessages();

  return (
    <div className="flex-1">
      <PageHero
        eyebrow="Private messaging"
        title="Direct messages"
        description="DM other members about protocols, form checks, and progress."
      />

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="neon-border overflow-hidden rounded-xl glass-panel">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex cursor-pointer gap-4 border-b border-white/5 px-4 py-4 last:border-0 hover:bg-slate-800/30 ${
                msg.unread ? "bg-purple-900/20" : ""
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-blue-400">
                {msg.from.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">{msg.from}</p>
                  <span className="text-xs text-slate-400">{msg.createdAt}</span>
                </div>
                <p className="mt-0.5 truncate text-sm text-slate-500">
                  {msg.preview}
                </p>
              </div>
              {msg.unread && (
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-purple-neon" />
              )}
            </div>
          ))}
          {messages.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              No messages yet.
            </div>
          )}
        </div>

        <NewMessageComposer isLoggedIn={!!user} />
      </div>
    </div>
  );
}
