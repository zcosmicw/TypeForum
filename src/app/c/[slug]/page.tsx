import Link from "next/link";
import { notFound } from "next/navigation";
import { ThreadRow } from "@/components/ThreadRow";
import { fetchCategory, fetchThreadsByCategory } from "@/lib/forum/queries";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sub?: string; sort?: string }>;
}) {
  const { slug } = await params;
  const { sub, sort = "recent" } = await searchParams;
  const category = await fetchCategory(slug);

  if (!category) {
    notFound();
  }

  const sortMode =
    sort === "top" || sort === "trending" ? sort : ("recent" as const);
  const categoryThreads = await fetchThreadsByCategory(slug, sub, sortMode);

  return (
    <div className="flex-1">
      <div className="border-b border-white/10 glass-panel">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Link
            href="/forums"
            className="mb-4 inline-block text-sm font-medium text-brand-blue hover:text-white"
          >
            ← Back to forums
          </Link>
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-800 text-2xl text-brand-blue">
              {category.icon}
            </span>
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {category.name}
              </h1>
              <p className="mt-1 max-w-2xl text-slate-300">
                {category.description}
              </p>
              <p className="mt-3 text-sm text-slate-400">
                {category.threadCount} threads ·{" "}
                {category.postCount.toLocaleString()} posts
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link
              href={`/c/${slug}`}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all duration-150 ${
                !sub
                  ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                  : "bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              All
            </Link>
            {category.subforums.map((s) => (
              <Link
                key={s.slug}
                href={`/c/${slug}?sub=${s.slug}`}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all duration-150 ${
                  sub === s.slug
                    ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                    : "bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {(["recent", "top", "trending"] as const).map((s) => (
              <Link
                key={s}
                href={`/c/${slug}${sub ? `?sub=${sub}&` : "?"}sort=${s}`}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize transition-all duration-150 ${
                  sortMode === s
                    ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                    : "bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {s}
              </Link>
            ))}
          </div>
          <Link
            href={`/c/${slug}/new${sub ? `?sub=${sub}` : ""}`}
            className="btn-premium-primary rounded-lg px-4.5 py-2 text-sm font-semibold text-white shadow-md transition-all"
          >
            New thread
          </Link>
        </div>

        {categoryThreads.length > 0 ? (
          <div className="neon-border overflow-hidden rounded-xl border border-white/10 glass-panel">
            {categoryThreads.map((thread) => (
              <ThreadRow key={thread.id} thread={thread} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 bg-slate-800/30 px-6 py-12 text-center">
            <p className="text-slate-300">No threads here yet.</p>
            <p className="mt-1 text-sm text-slate-400">
              Be the first to start the conversation.
            </p>
            <Link
              href={`/c/${slug}/new${sub ? `?sub=${sub}` : ""}`}
              className="mt-4 inline-block rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(191,0,255,0.4)]"
            >
              Create first thread
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
