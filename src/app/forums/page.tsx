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
    <div className="flex-1">
      <PageHero
        eyebrow="Forum hub"
        title="All categories & subforums"
        description="Category 1, Category 2, Category 3, Category 4, Category 5, and more — pick your lane."
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-10">
        
        {/* Categories Section (Full Width Responsive Grid) */}
        <section>
          <h2 className="mb-4 text-xl font-bold tracking-tight text-white">
            Categories
          </h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>
        </section>

        {/* Center Banner Advertisement Slot */}
        <AdSlot variant="banner" />

        {/* Pinned & Trending Threads Section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Pinned & trending
            </h2>
            <Link 
              href="/discover" 
              className="text-sm font-semibold text-brand-teal hover:text-white transition-colors"
            >
              View all trending →
            </Link>
          </div>
          
          <div className="panel-border overflow-hidden rounded-xl surface-panel">
            {trending.map((thread) => (
              <ThreadRow key={thread.id} thread={thread} />
            ))}
            {trending.length === 0 && (
              <div className="px-6 py-12 text-center text-sm text-slate-500 bg-slate-950/20">
                No trending threads yet. Be the first to start a conversation!
              </div>
            )}
          </div>
        </section>

        {/* Bottom Horizontal Ads Stack */}
        <div className="grid gap-4 md:grid-cols-2">
          <AdSlot variant="in-feed" />
          <AdSlot variant="in-feed" label="Affiliate" />
        </div>

      </div>
    </div>
  );
}
