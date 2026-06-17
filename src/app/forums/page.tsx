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

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-white">Categories</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {categories.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>

          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                Pinned & trending
              </h2>
              <Link href="/discover" className="text-sm font-medium text-brand-blue">
                View all →
              </Link>
            </div>
            <div className="neon-border overflow-hidden rounded-xl glass-panel">
              {trending.map((thread) => (
                <ThreadRow key={thread.id} thread={thread} />
              ))}
              {trending.length === 0 && (
                <div className="px-6 py-10 text-center text-sm text-slate-400">
                  No trending threads yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <AdSlot variant="sidebar" />
          <div className="rounded-xl border border-brand-purple-neon/30 bg-purple-900/20 glass-panel p-5">
            <h3 className="font-semibold text-white">Premium membership</h3>
            <p className="mt-2 text-sm text-slate-300">
              Ad-free browsing, exclusive badges, and priority thread placement.
            </p>
            <button
              type="button"
              className="btn-premium-primary mt-4 w-full rounded-lg py-2.5 text-sm font-semibold text-white shadow-md transition-all"
            >
              Upgrade — $9.99/mo
            </button>
          </div>
          <AdSlot variant="sidebar" label="Affiliate" />
        </aside>
      </div>
    </div>
  );
}
