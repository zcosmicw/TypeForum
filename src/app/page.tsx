import Link from "next/link";
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
      <div className="mx-auto max-w-[1200px] px-5 pb-20 pt-10 sm:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          
          {}
          <div className="flex flex-col justify-center py-6 lg:col-span-8 lg:py-10">
            <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-6xl sm:leading-[1.12]">
              {renderHeroTitle(heroTitle)}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-muted">
              {heroDescription}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/forums" className="btn-primary px-8 py-3 text-[0.9375rem]">
                Browse forums
              </Link>
              {!profile ? (
                <Link href="/signup" className="btn-secondary px-8 py-3 text-[0.9375rem]">
                  Join {siteName}
                </Link>
              ) : (
                <Link href={`/u/${profile.username}`} className="btn-secondary px-8 py-3 text-[0.9375rem]">
                  My Profile
                </Link>
              )}
            </div>
          </div>

          {}
          <div className="lg:col-span-4 lg:row-span-2">
            <div className="h-[400px] lg:h-full lg:min-h-[500px]">
              <GlobalChat currentUserProfile={profile} />
            </div>
          </div>

          {}
          <div className="lg:col-span-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-text-primary">Trending Discussions</h2>
              <Link href="/discover" className="text-sm font-medium text-accent hover:underline">
                Discover →
              </Link>
            </div>
            <div className="card overflow-hidden">
              {trending.slice(0, 3).map((thread) => (
                <ThreadRow key={thread.id} thread={thread} />
              ))}
              {trending.length === 0 && (
                <div className="px-6 py-14 text-center text-sm text-text-muted">
                  No trending threads yet. Be the first to post.
                </div>
              )}
            </div>
          </div>

          {}
          <div className="mt-6 lg:col-span-12 lg:mt-8">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="section-label mb-1">Explore</p>
                <h2 className="text-xl font-bold tracking-tight text-text-primary">Categories</h2>
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
          </div>

          {}
          <div className="mt-6 lg:col-span-12 lg:mt-8">
            <div className="mb-5">
              <h2 className="text-xl font-bold tracking-tight text-text-primary">Recent threads</h2>
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
          </div>
          
        </div>
      </div>
    </>
  );
}
