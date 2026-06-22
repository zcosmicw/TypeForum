import { createClient } from "@/lib/supabase/server";
import type { DbPost, DbProfile, DbThread, PostRow, ThreadRow } from "@/lib/supabase/types";
import type { Category, Post, Thread, ThreadTag, User, LeaderboardEntry, StoreProduct, Notification, Message } from "@/lib/types";

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function mapTags(tags: string[]): ThreadTag[] {
  const allowed: ThreadTag[] = [
    "beginner",
    "protocol",
    "transformation",
    "debate",
    "pinned",
    "sponsored",
  ];
  return tags.filter((t): t is ThreadTag => allowed.includes(t as ThreadTag));
}

async function enrichThreads(
  rows: Array<
    DbThread & {
      categories: { slug: string } | null;
      subforums: { slug: string } | null;
      profiles: { username: string } | null;
    }
  >,
): Promise<Array<ThreadRow & { userVote: number }>> {
  const supabase = await createClient();
  if (!supabase) return [];
  const threadIds = rows.map((r) => r.id);

  if (threadIds.length === 0) return [];

  const [{ data: postCounts }, { data: votes }, { data: { user } }] = await Promise.all([
    supabase.from("posts").select("thread_id").in("thread_id", threadIds),
    supabase.from("thread_votes").select("thread_id, value, user_id").in("thread_id", threadIds),
    supabase.auth.getUser(),
  ]);

  const replyMap = new Map<string, number>();
  postCounts?.forEach((p: { thread_id: string }) => {
    replyMap.set(p.thread_id, (replyMap.get(p.thread_id) ?? 0) + 1);
  });

  const userVoteMap = new Map<string, number>();
  const voteMap = new Map<string, { up: number; down: number }>();
  votes?.forEach((v: { thread_id: string; value: number; user_id: string }) => {
    const current = voteMap.get(v.thread_id) ?? { up: 0, down: 0 };
    if (v.value === 1) current.up += 1;
    else current.down += 1;
    voteMap.set(v.thread_id, current);

    if (user && v.user_id === user.id) {
      userVoteMap.set(v.thread_id, v.value);
    }
  });

  return rows.map((row) => {
    const voteStats = voteMap.get(row.id) ?? { up: 0, down: 0 };
    return {
      id: row.id,
      category_id: row.category_id,
      subforum_id: row.subforum_id,
      author_id: row.author_id,
      title: row.title,
      body: row.body,
      tags: row.tags,
      pinned: row.pinned,
      trending: row.trending,
      sponsored: row.sponsored,
      view_count: row.view_count,
      created_at: row.created_at,
      updated_at: row.updated_at,
      category_slug: row.categories?.slug ?? "",
      subforum_slug: row.subforums?.slug ?? null,
      author_username: row.profiles?.username ?? "unknown",
      reply_count: replyMap.get(row.id) ?? 0,
      upvotes: voteStats.up,
      downvotes: voteStats.down,
      userVote: userVoteMap.get(row.id) ?? 0,
    };
  });
}

export function toThread(row: ThreadRow & { userVote?: number }): Thread {
  return {
    id: row.id,
    categorySlug: row.category_slug,
    subforumSlug: row.subforum_slug ?? undefined,
    title: row.title,
    author: row.author_username,
    excerpt: row.body.slice(0, 160) + (row.body.length > 160 ? "…" : ""),
    replies: row.reply_count,
    views: row.view_count,
    upvotes: row.upvotes,
    downvotes: row.downvotes,
    lastActive: formatRelativeTime(row.updated_at),
    tags: mapTags(row.tags),
    pinned: row.pinned,
    trending: row.trending,
    sponsored: row.sponsored,
    userVote: row.userVote ?? 0,
  };
}

export function toPost(row: PostRow & { author_rank?: string; userVote?: number }): Post {
  return {
    id: row.id,
    threadId: row.thread_id,
    author: row.author_username,
    body: row.body,
    quote: row.quote ?? undefined,
    upvotes: row.upvotes,
    downvotes: row.downvotes,
    createdAt: formatRelativeTime(row.created_at),
    parentId: row.parent_id ?? undefined,
    authorUserRank: (row.author_rank || "rank1") as any,
    userVote: row.userVote ?? 0,
  };
}

const threadSelect = `
  *,
  categories ( slug ),
  subforums ( slug ),
  profiles!author_id ( username )
`;

export async function fetchCategories(): Promise<Category[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const [{ data: categories }, { data: subforums }, { data: threads }, { data: posts }] =
    await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("subforums").select("*"),
      supabase.from("threads").select("id, category_id, subforum_id"),
      supabase.from("posts").select("id, thread_id"),
    ]);

  type ThreadCount = { id: string; category_id: string; subforum_id: string | null };
  type PostCount = { id: string; thread_id: string };
  type SubforumRow = { id: string; category_id: string; slug: string; name: string };
  type CategoryRow = {
    id: string;
    slug: string;
    name: string;
    description: string;
    icon: string;
  };

  const threadRows = (threads ?? []) as ThreadCount[];
  const postRows = (posts ?? []) as PostCount[];
  const subforumRows = (subforums ?? []) as SubforumRow[];
  const categoryRows = (categories ?? []) as CategoryRow[];

  const threadCategoryMap = new Map<string, string>();
  threadRows.forEach((t) => threadCategoryMap.set(t.id, t.category_id));

  const threadsByCategory = new Map<string, number>();
  threadRows.forEach((t) => {
    threadsByCategory.set(t.category_id, (threadsByCategory.get(t.category_id) ?? 0) + 1);
  });

  const postsByCategory = new Map<string, number>();
  postRows.forEach((p) => {
    const categoryId = threadCategoryMap.get(p.thread_id);
    if (categoryId) {
      postsByCategory.set(categoryId, (postsByCategory.get(categoryId) ?? 0) + 1);
    }
  });

  const subforumsByCategory = new Map<string, SubforumRow[]>();
  subforumRows.forEach((s) => {
    const list = subforumsByCategory.get(s.category_id) ?? [];
    list.push(s);
    subforumsByCategory.set(s.category_id, list);
  });

  const threadsBySubforum = new Map<string, number>();
  threadRows.forEach((t) => {
    if (t.subforum_id) {
      threadsBySubforum.set(
        t.subforum_id,
        (threadsBySubforum.get(t.subforum_id) ?? 0) + 1,
      );
    }
  });

  return categoryRows.map((cat) => ({
    slug: cat.slug,
    name: cat.name,
    description: cat.description,
    icon: cat.icon,
    threadCount: threadsByCategory.get(cat.id) ?? 0,
    postCount: postsByCategory.get(cat.id) ?? 0,
    subforums: (subforumsByCategory.get(cat.id) ?? []).map((s) => ({
      slug: s.slug,
      name: s.name,
      threadCount: threadsBySubforum.get(s.id) ?? 0,
    })),
  }));
}

export async function fetchCategory(slug: string) {
  const categories = await fetchCategories();
  return categories.find((c) => c.slug === slug);
}

export async function fetchThreadsByCategory(
  categorySlug: string,
  subforumSlug?: string,
  sort: "recent" | "top" | "trending" = "recent",
): Promise<Thread[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();

  if (!category) return [];

  let query = supabase
    .from(sort === "trending" ? "trending_threads" : "threads")
    .select(threadSelect)
    .eq("category_id", category.id);

  if (subforumSlug) {
    const { data: subforum } = await supabase
      .from("subforums")
      .select("id")
      .eq("category_id", category.id)
      .eq("slug", subforumSlug)
      .single();
    if (subforum) query = query.eq("subforum_id", subforum.id);
  }

  if (sort === "recent") {
    query = query.order("updated_at", { ascending: false });
  } else if (sort === "trending") {
    query = query.order("trending_score", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error("fetchThreadsByCategory query error:", error);
    return [];
  }

  const enriched = await enrichThreads(data ?? []);
  let threads = enriched.map(toThread);

  if (sort === "top") {
    threads = threads.sort(
      (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes),
    );
  }

  return threads;
}

export async function fetchThread(id: string): Promise<Thread | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("threads")
    .select(threadSelect)
    .eq("id", id)
    .single();

  if (error) {
    console.error("fetchThread database query error:", error);
    return null;
  }

  if (!data) return null;

  const [enriched] = await enrichThreads([data]);
  return toThread(enriched);
}

export async function fetchThreadBody(id: string) {
  const supabase = await createClient();
  if (!supabase) return "";
  const { data } = await supabase.from("threads").select("body").eq("id", id).single();
  return data?.body ?? "";
}

export async function fetchPostsByThread(threadId: string): Promise<Post[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data: threadData, error: threadError } = await supabase
    .from("threads")
    .select("*, profiles!author_id(username, rank)")
    .eq("id", threadId)
    .single();

  if (threadError) {
    console.error("fetchPostsByThread thread query error:", threadError);
  }

  type ThreadWithProfile = DbThread & { profiles: { username: string } | null };
  type PostWithProfile = DbPost & { profiles: { username: string } | null };

  const thread = threadData as ThreadWithProfile | null;

  if (!thread) return [];

  // Fetch actual votes for the thread to populate the OP post and check user vote
  const [{ data: threadVotes }, { data: { user } }] = await Promise.all([
    supabase.from("thread_votes").select("value, user_id").eq("thread_id", threadId),
    supabase.auth.getUser(),
  ]);

  let threadUp = 0;
  let threadDown = 0;
  let threadUserVote = 0;
  threadVotes?.forEach((v: { value: number; user_id: string }) => {
    if (v.value === 1) threadUp += 1;
    else threadDown += 1;

    if (user && v.user_id === user.id) {
      threadUserVote = v.value;
    }
  });

  const { data: postsData, error: postsError } = await supabase
    .from("posts")
    .select("*, profiles!author_id(username, rank)")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (postsError) {
    console.error("fetchPostsByThread posts query error:", postsError);
  }

  const posts = (postsData ?? []) as PostWithProfile[];

  const postIds = posts.map((p) => p.id);
  const { data: votes } = postIds.length
    ? await supabase.from("post_votes").select("post_id, value, user_id").in("post_id", postIds)
    : { data: [] as { post_id: string; value: number; user_id: string }[] };

  const userPostVoteMap = new Map<string, number>();
  const voteMap = new Map<string, { up: number; down: number }>();
  votes?.forEach((v: { post_id: string; value: number; user_id: string }) => {
    const current = voteMap.get(v.post_id) ?? { up: 0, down: 0 };
    if (v.value === 1) current.up += 1;
    else current.down += 1;
    voteMap.set(v.post_id, current);

    if (user && v.user_id === user.id) {
      userPostVoteMap.set(v.post_id, v.value);
    }
  });

  const opPost: Post = {
    id: `op-${thread.id}`,
    threadId: thread.id,
    author: (thread.profiles as any)?.username ?? "unknown",
    body: thread.body,
    upvotes: threadUp,
    downvotes: threadDown,
    createdAt: formatRelativeTime(thread.created_at),
    authorUserRank: (thread.profiles as any)?.rank as any,
    userVote: threadUserVote,
  };

  const replyPosts = posts.map((p) => {
    const stats = voteMap.get(p.id) ?? { up: 0, down: 0 };
    return toPost({
      id: p.id,
      thread_id: p.thread_id,
      author_id: p.author_id,
      body: p.body,
      quote: p.quote,
      created_at: p.created_at,
      author_username: (p.profiles as any)?.username ?? "unknown",
      upvotes: stats.up,
      downvotes: stats.down,
      parent_id: p.parent_id,
      author_rank: (p.profiles as any)?.rank ?? "rank1",
      userVote: userPostVoteMap.get(p.id) ?? 0,
    });
  });

  // Construct recursive reply tree
  const postMap = new Map<string, Post>();

  postMap.set(opPost.id, { ...opPost, replies: [] });
  replyPosts.forEach((p) => {
    postMap.set(p.id, { ...p, replies: [] });
  });

  const rootPosts: Post[] = [];
  rootPosts.push(postMap.get(opPost.id)!);

  replyPosts.forEach((p) => {
    const mappedPost = postMap.get(p.id)!;
    if (p.parentId && postMap.has(p.parentId)) {
      postMap.get(p.parentId)!.replies!.push(mappedPost);
    } else {
      rootPosts.push(mappedPost);
    }
  });

  return rootPosts;
}

export async function fetchRecentThreads(limit = 10): Promise<Thread[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("threads")
    .select(threadSelect)
    .order("updated_at", { ascending: false })
    .limit(limit);

  const enriched = await enrichThreads(data ?? []);
  return enriched.map(toThread);
}

export async function fetchTrendingThreads(): Promise<Thread[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("trending_threads")
    .select(threadSelect)
    .order("trending_score", { ascending: false })
    .limit(10);

  const enriched = await enrichThreads(data ?? []);
  return enriched.map(toThread);
}

export async function searchThreads(query: string, tag?: string): Promise<Thread[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  let dbQuery = supabase.from("threads").select(threadSelect).order("updated_at", {
    ascending: false,
  });

  if (query.trim()) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,body.ilike.%${query}%`);
  }

  if (tag) {
    dbQuery = dbQuery.contains("tags", [tag]);
  }

  const { data } = await dbQuery.limit(50);
  const enriched = await enrichThreads(data ?? []);
  return enriched.map(toThread);
}

export async function fetchProfile(username: string): Promise<User | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.display_name,
    bio: profile.bio,
    joinDate: new Date(profile.created_at).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    }),
    postCount: profile.post_count,
    followerCount: profile.follower_count,
    followingCount: profile.following_count,
    userRank: profile.rank as User["userRank"],
    rankVotes: profile.rank_votes,
    badges: [],
    stats: {
      gymStreak: profile.gym_streak,
      transformations: profile.transformations,
      helpfulVotes: profile.helpful_votes,
    },
    role: (profile.role ?? "user") as User["role"],
    isBanned: profile.is_banned ?? false,
    avatarUrl: profile.avatar_url ?? undefined,
    bannerUrl: profile.banner_url ?? undefined,
  };
}

export async function fetchRecommendedUsers(limit = 3): Promise<User[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("post_count", { ascending: false })
    .limit(limit);

  return ((data ?? []) as DbProfile[]).map((profile) => ({
    id: profile.id,
    username: profile.username,
    displayName: profile.display_name,
    bio: profile.bio,
    joinDate: new Date(profile.created_at).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    }),
    postCount: profile.post_count,
    followerCount: profile.follower_count,
    followingCount: profile.following_count,
    userRank: profile.rank as User["userRank"],
    rankVotes: profile.rank_votes,
    badges: [],
    stats: {
      gymStreak: profile.gym_streak,
      transformations: profile.transformations,
      helpfulVotes: profile.helpful_votes,
    },
    role: (profile.role ?? "user") as User["role"],
    isBanned: profile.is_banned ?? false,
    avatarUrl: profile.avatar_url ?? undefined,
    bannerUrl: profile.banner_url ?? undefined,
  }));
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("profiles")
    .select("username, rank, post_count, helpful_votes, rank_votes")
    .order("helpful_votes", { ascending: false })
    .limit(10);

  type LeaderboardRow = Pick<
    DbProfile,
    "username" | "rank" | "post_count" | "helpful_votes" | "rank_votes"
  >;

  return ((data ?? []) as LeaderboardRow[]).map((p, i) => ({
    rank: i + 1,
    username: p.username,
    userRank: p.rank as User["userRank"],
    score: p.helpful_votes * 10 + p.post_count + p.rank_votes * 5,
    progressDelta: (i % 7) + 2,
  }));
}



export async function fetchProduct(slug: string): Promise<StoreProduct | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) return null;

  return {
    slug: data.slug,
    name: data.name,
    category: data.category as any,
    price: Number(data.price),
    rating: Number(data.rating),
    reviewCount: data.review_count,
    description: data.description,
    featured: data.featured,
    sponsored: data.sponsored,
    affiliate: data.affiliate,
  };
}

export async function fetchProducts(): Promise<StoreProduct[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (data ?? []).map((p) => ({
    slug: p.slug,
    name: p.name,
    category: p.category as any,
    price: Number(p.price),
    rating: Number(p.rating),
    reviewCount: p.review_count,
    description: p.description,
    featured: p.featured,
    sponsored: p.sponsored,
    affiliate: p.affiliate,
  }));
}

export async function fetchFeaturedProducts(): Promise<StoreProduct[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("products")
    .select("*")
    .or("featured.eq.true,sponsored.eq.true");

  return (data ?? []).map((p) => ({
    slug: p.slug,
    name: p.name,
    category: p.category as any,
    price: Number(p.price),
    rating: Number(p.rating),
    reviewCount: p.review_count,
    description: p.description,
    featured: p.featured,
    sponsored: p.sponsored,
    affiliate: p.affiliate,
  }));
}

export async function fetchNotifications(): Promise<Notification[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data ?? []).map((n) => ({
    id: n.id,
    type: n.type as any,
    message: n.message,
    read: n.read,
    createdAt: formatRelativeTime(n.created_at),
  }));
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient();
  if (!supabase) return 0;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false);

  return count ?? 0;
}

export async function fetchMessages(): Promise<Message[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (!profile) return [];

  const { data } = await supabase
    .from("messages")
    .select("*")
    .or(`from_username.eq.${profile.username},to_username.eq.${profile.username}`)
    .order("created_at", { ascending: false });

  return (data ?? []).map((m) => ({
    id: m.id,
    from: m.from_username,
    preview: m.body,
    unread: m.unread && m.to_username === profile.username,
    createdAt: formatRelativeTime(m.created_at),
  }));
}

export async function fetchUnreadMessageCount(): Promise<number> {
  const supabase = await createClient();
  if (!supabase) return 0;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (!profile) return 0;

  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("to_username", profile.username)
    .eq("unread", true);

  return count ?? 0;
}
