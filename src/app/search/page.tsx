import { PageHero } from "@/components/PageHero";
import { ThreadRow } from "@/components/ThreadRow";
import { searchThreads as searchThreadsQuery } from "@/lib/forum/queries";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";

export const dynamic = "force-dynamic";

const tagFilters = [
  "beginner",
  "protocol",
  "transformation",
  "debate",
  "sponsored",
] as const;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { q = "", tag } = await searchParams;
  const results = await searchThreadsQuery(q, tag);

  return (
    <div className="flex-1">
      <PageHero eyebrow="Search" title="Find threads & content">
        <SearchBar defaultValue={q} />
      </PageHero>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href={`/search${q ? `?q=${encodeURIComponent(q)}` : ""}`}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              !tag
                ? "bg-gradient-to-r from-teal-600 to-teal-400 text-white"
                : "bg-slate-800 text-teal-400 hover:bg-slate-700"
            }`}
          >
            All tags
          </Link>
          {tagFilters.map((t) => (
            <Link
              key={t}
              href={`/search?q=${encodeURIComponent(q)}&tag=${t}`}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                tag === t
                  ? "bg-gradient-to-r from-teal-600 to-teal-400 text-white"
                  : "bg-slate-800 text-teal-400 hover:bg-slate-700"
              }`}
            >
              {t}
            </Link>
          ))}
        </div>

        <p className="mb-4 text-sm text-slate-500">
          {results.length} result{results.length !== 1 && "s"}
          {q && ` for "${q}"`}
          {tag && ` tagged ${tag}`}
        </p>

        <div className="panel-border overflow-hidden rounded-xl surface-panel">
          {results.length > 0 ? (
            results.map((thread) => <ThreadRow key={thread.id} thread={thread} />)
          ) : (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              No threads found. Try a different search or tag filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
