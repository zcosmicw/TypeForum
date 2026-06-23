import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { CategoryCard } from "@/components/CategoryCard";
import { ThreadRow } from "@/components/ThreadRow";
import { GlobalChat } from "@/components/GlobalChat";
import { getSessionProfile } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import {
  fetchCategories,
  fetchRecentThreads,
  fetchTrendingThreads,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const [categories, trending, recentThreads, profile, siteSettingsResult] = await Promise.all([
    fetchCategories(),
    fetchTrendingThreads(),
    fetchRecentThreads(5),
    getSessionProfile(),
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
  ]);

  const siteSettings = siteSettingsResult?.data;
  const siteName = siteSettings?.site_name || "TypeForum";
  const heroEyebrow = siteSettings?.hero_eyebrow || "Welcome to the town";
  const heroTitle = siteSettings?.hero_title || "Welcome to the [ultimate discussion] platform.";
  const heroDescription = siteSettings?.hero_description || "Topics, discussions, categories, rankings, and a store — all in one generic platform.";
  const categoriesDescription = siteSettings?.categories_description || "Category 1, Category 2, Category 3, Category 4, and more.";

  const renderHeroTitle = (title: string) => {
    const parts = title.split(/(\[[^\]]+\])/g);
    return parts.map((part, idx) => {
      if (part.startsWith("[") && part.endsWith("]")) {
        const cleanText = part.slice(1, -1);
        return (
          <span key={idx} className="neon-purple">
            {cleanText}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex-1">
      <section className="hero-gradient border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-blue">
            {heroEyebrow}
          </p>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {renderHeroTitle(heroTitle)}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-300">
            {heroDescription}
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <Link
              href="/forums"
              className="btn-premium-primary rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all"
            >
              Browse forums
            </Link>
            <Link
              href="/signup"
              className="btn-premium-secondary rounded-lg px-6 py-3 text-sm font-semibold text-slate-100 transition-all"
            >
              Join {siteName}
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <AdSlot variant="banner" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
        <GlobalChat currentUserProfile={profile} />
      </div>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Categories</h2>
            <p className="mt-1 text-sm text-slate-400">
              {categoriesDescription}
            </p>
          </div>
          <Link href="/forums" className="text-sm font-medium text-brand-blue hover:text-white">
            View all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 3).map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Trending</h2>
          <Link href="/discover" className="text-sm font-medium text-brand-blue hover:text-white">
            Discover →
          </Link>
        </div>
        <div className="neon-border overflow-hidden rounded-xl glass-panel">
          {trending.slice(0, 4).map((thread) => (
            <ThreadRow key={thread.id} thread={thread} />
          ))}
          {trending.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              No trending threads yet. Be the first to post.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="mb-4 text-xl font-bold text-white">Recent threads</h2>
        <div className="neon-border overflow-hidden rounded-xl glass-panel">
          {recentThreads.map((thread) => (
            <ThreadRow key={thread.id} thread={thread} />
          ))}
          {recentThreads.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-slate-400">
              No threads yet.{" "}
              <Link href="/signup" className="font-medium text-brand-blue hover:text-white">
                Sign up
              </Link>{" "}
              and start the conversation.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
