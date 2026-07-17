import { PageHero } from "@/components/PageHero";
import { SearchBar } from "@/components/SearchBar";
import { ThreadRow } from "@/components/ThreadRow";
import { searchThreads } from "@/lib/forum/queries";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const threads = q ? await searchThreads(q) : [];

  return (
    <>
      <PageHero eyebrow="Explore" title="Search">
        <div className="mt-6 max-w-md">
          <SearchBar defaultValue={q} />
        </div>
      </PageHero>
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        {q && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-text-primary">
              Results for &ldquo;{q}&rdquo;
            </h2>
            <div className="card overflow-hidden">
              {threads.map((thread) => (
                <ThreadRow key={thread.id} thread={thread} />
              ))}
              {threads.length === 0 && (
                <div className="px-6 py-14 text-center text-sm text-text-muted">
                  No threads found matching your query.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
