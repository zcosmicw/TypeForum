export type DbProfile = {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  rank: string;
  post_count: number;
  follower_count: number;
  following_count: number;
  rank_votes: number;
  gym_streak: number;
  transformations: number;
  helpful_votes: number;
  created_at: string;
  role: string;
  is_banned: boolean;
};

export type DbCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
};

export type DbSubforum = {
  id: string;
  category_id: string;
  slug: string;
  name: string;
};

export type DbThread = {
  id: string;
  category_id: string;
  subforum_id: string | null;
  author_id: string;
  title: string;
  body: string;
  tags: string[];
  pinned: boolean;
  trending: boolean;
  sponsored: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type DbPost = {
  id: string;
  thread_id: string;
  author_id: string;
  body: string;
  quote: string | null;
  created_at: string;
  parent_id: string | null;
};

export type ThreadRow = DbThread & {
  category_slug: string;
  subforum_slug: string | null;
  author_username: string;
  reply_count: number;
  upvotes: number;
  downvotes: number;
};

export type PostRow = DbPost & {
  author_username: string;
  upvotes: number;
  downvotes: number;
};

export type Database = {
  public: {
    Tables: {
      profiles: { Row: DbProfile; Insert: Partial<DbProfile>; Update: Partial<DbProfile> };
      categories: { Row: DbCategory; Insert: Partial<DbCategory>; Update: Partial<DbCategory> };
      subforums: { Row: DbSubforum; Insert: Partial<DbSubforum>; Update: Partial<DbSubforum> };
      threads: { Row: DbThread; Insert: Partial<DbThread>; Update: Partial<DbThread> };
      posts: { Row: DbPost; Insert: Partial<DbPost>; Update: Partial<DbPost> };
      thread_votes: {
        Row: { user_id: string; thread_id: string; value: number };
        Insert: { user_id: string; thread_id: string; value: number };
        Update: { value: number };
      };
      post_votes: {
        Row: { user_id: string; post_id: string; value: number };
        Insert: { user_id: string; post_id: string; value: number };
        Update: { value: number };
      };
      thread_drafts: {
        Row: {
          id: string;
          author_id: string;
          category_id: string | null;
          subforum_id: string | null;
          title: string;
          body: string;
          tags: string[];
          updated_at: string;
        };
        Insert: Partial<{
          id: string;
          author_id: string;
          category_id: string | null;
          subforum_id: string | null;
          title: string;
          body: string;
          tags: string[];
          updated_at: string;
        }>;
        Update: Partial<{
          category_id: string | null;
          subforum_id: string | null;
          title: string;
          body: string;
          tags: string[];
          updated_at: string;
        }>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
