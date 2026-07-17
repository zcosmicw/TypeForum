import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { CategoryCard } from "@/components/CategoryCard";
import { PageHero } from "@/components/PageHero";
import { ThreadRow } from "@/components/ThreadRow";
import { fetchCategories, fetchTrendingThreads } from "@/lib/forum/queries";

export const dynamic = "force-dynamic";

export default async function ForumsPage() {
  const [categories, trending] = await Promise.all([
    fetchCategories(),
    fetchTrendingThreads(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Forum hub"
        title="All categories"
        description="Browse every category — find your lane and jump in."
      />

      <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8 space-y-12">
        <section>
          <h2 className="mb-6 text-lg font-semibold text-text-primary">Categories</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>
        </section>

        <AdSlot variant="banner" />

        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">Pinned & Trending</h2>
            <Link href="/discover" className="text-sm font-medium text-accent hover:underline">
              View all trending →
            </Link>
          </div>

          <div className="card overflow-hidden">
            {trending.map((thread) => (
              <ThreadRow key={thread.id} thread={thread} />
            ))}
            {trending.length === 0 && (
              <div className="px-6 py-14 text-center text-sm text-text-muted">
                No trending threads yet. Be the first to start a conversation!
              </div>
            )}
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <AdSlot variant="in-feed" />
          <AdSlot variant="in-feed" label="Affiliate" />
        </div>
      </div>
    </>
  );
}
