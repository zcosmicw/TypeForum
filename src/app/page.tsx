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
  const [categories, trending, recentThreads, profile, siteSettings] = await Promise.all([
    fetchCategories(),
    fetchTrendingThreads(),
    fetchRecentThreads(5),
    getSessionProfile(),
    supabase
      ? supabase.from("site_settings").select("*").eq("id", 1).maybeSingle().then((res) => res.data)
      : Promise.resolve(null),
  ]);

  const siteName = siteSettings?.site_name || "TypeForum";
  const heroTitle = siteSettings?.hero_title || "Where conversations [find their depth].";
  const heroDescription = siteSettings?.hero_description || "A community platform for meaningful discussions, curated categories, and real-time conversations.";

  const renderHeroTitle = (title: string) => {
    const parts = title.split(/(\[[^\]]+\])/g);
    return parts.map((part, idx) => {
      if (part.startsWith("[") && part.endsWith("]")) {
        return (
          <span key={idx} className="text-accent">
            {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <>
      <section className="border-b border-border-subtle bg-bg-surface">
        <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 sm:py-28">
          <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-text-primary sm:text-5xl sm:leading-[1.15]">
            {renderHeroTitle(heroTitle)}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-text-muted sm:text-lg">
            {heroDescription}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/forums" className="btn-primary px-7 py-3 text-sm">
              Browse forums
            </Link>
            <Link href="/signup" className="btn-secondary px-7 py-3 text-sm">
              Join {siteName}
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8">
        <AdSlot variant="banner" />
      </div>

      <div className="mx-auto max-w-[1200px] px-5 pb-10 sm:px-8">
        <GlobalChat currentUserProfile={profile} />
      </div>

      <section className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="section-label mb-1">Explore</p>
            <h2 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">Categories</h2>
          </div>
          <Link href="/forums" className="text-sm font-medium text-accent hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 3).map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 pb-10 sm:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">Trending</h2>
          <Link href="/discover" className="text-sm font-medium text-accent hover:underline">
            Discover →
          </Link>
        </div>
        <div className="card overflow-hidden">
          {trending.slice(0, 4).map((thread) => (
            <ThreadRow key={thread.id} thread={thread} />
          ))}
          {trending.length === 0 && (
            <div className="px-6 py-14 text-center text-sm text-text-muted">
              No trending threads yet. Be the first to post.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 pb-20 sm:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">Recent threads</h2>
        </div>
        <div className="card overflow-hidden">
          {recentThreads.map((thread) => (
            <ThreadRow key={thread.id} thread={thread} />
          ))}
          {recentThreads.length === 0 && (
            <div className="px-6 py-14 text-center text-sm text-text-muted">
              No threads yet.{" "}
              <Link href="/signup" className="font-medium text-accent hover:underline">
                Sign up
              </Link>{" "}
              and start the conversation.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
