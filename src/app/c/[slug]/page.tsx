import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { ThreadRow } from "@/components/ThreadRow";
import { NewThreadForm } from "@/components/NewThreadForm";
import { fetchCategory, fetchThreadsByCategory } from "@/lib/forum/queries";
import { getSessionUser } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sub?: string }>;
}) {
  const { slug } = await params;
  const { sub: subforumSlug } = await searchParams;

  const [category, sessionUser] = await Promise.all([
    fetchCategory(slug),
    getSessionUser(),
  ]);

  if (!category) {
    notFound();
  }

  const threads = await fetchThreadsByCategory(slug, subforumSlug);
  const activeSub = category.subforums.find((s) => s.slug === subforumSlug);
  const title = activeSub ? activeSub.name : category.name;
  const description = activeSub ? "" : category.description;

  return (
    <>
      <PageHero eyebrow={category.name} title={title} description={description}>
        {category.subforums.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href={`/c/${category.slug}`}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                !subforumSlug
                  ? "bg-accent text-bg-root"
                  : "bg-bg-elevated text-text-muted border border-border-default hover:text-text-primary hover:border-border-strong"
              }`}
            >
              All
            </Link>
            {category.subforums.map((sub) => (
              <Link
                key={sub.slug}
                href={`/c/${category.slug}?sub=${sub.slug}`}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  subforumSlug === sub.slug
                    ? "bg-accent text-bg-root"
                    : "bg-bg-elevated text-text-muted border border-border-default hover:text-text-primary hover:border-border-strong"
                }`}
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}
      </PageHero>

      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-6 text-lg font-semibold text-text-primary">Threads</h2>
          <div className="card overflow-hidden">
            {threads.map((thread) => (
              <ThreadRow key={thread.id} thread={thread} />
            ))}
            {threads.length === 0 && (
              <div className="px-6 py-14 text-center text-sm text-text-muted">
                No threads in this category yet.
              </div>
            )}
          </div>
        </div>

        <aside>
          <h2 className="mb-6 text-lg font-semibold text-text-primary">Start a topic</h2>
          <NewThreadForm
            category={category}
            subforumSlug={subforumSlug}
            isLoggedIn={!!sessionUser}
          />
        </aside>
      </div>
    </>
  );
}
