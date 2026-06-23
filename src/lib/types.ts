export type UserRank = "rank1" | "rank2" | "rank3" | "rank4" | "rank5";

export type UserRole = "user" | "moderator" | "admin";

export type Subforum = {
  slug: string;
  name: string;
  threadCount: number;
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  threadCount: number;
  postCount: number;
  subforums: Subforum[];
};

export type ThreadTag =
  | "beginner"
  | "protocol"
  | "transformation"
  | "debate"
  | "pinned"
  | "sponsored";

export type Thread = {
  id: string;
  categorySlug: string;
  subforumSlug?: string;
  title: string;
  author: string;
  excerpt: string;
  replies: number;
  views: number;
  upvotes: number;
  downvotes: number;
  lastActive: string;
  tags: ThreadTag[];
  pinned?: boolean;
  trending?: boolean;
  sponsored?: boolean;
  userVote?: number;
};

export type Post = {
  id: string;
  threadId: string;
  author: string;
  body: string;
  quote?: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  parentId?: string;
  replies?: Post[];
  authorUserRank?: UserRank;
  userVote?: number;
};

export type UserBadge = {
  id: string;
  label: string;
  rank?: UserRank;
};

export type User = {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  joinDate: string;
  postCount: number;
  followerCount: number;
  followingCount: number;
  userRank: UserRank;
  rankVotes: number;
  badges: UserBadge[];
  stats: {
    gymStreak: number;
    transformations: number;
    helpfulVotes: number;
  };
  role: UserRole;
  isBanned: boolean;
  avatarUrl?: string;
  bannerUrl?: string;
};




export type Notification = {
  id: string;
  type: "reply" | "follow" | "vote" | "dm" | "rank";
  message: string;
  read: boolean;
  createdAt: string;
};

export type Message = {
  id: string;
  from: string;
  preview: string;
  unread: boolean;
  createdAt: string;
};

export type DiscoverTab = "trending" | "hot" | "new" | "recommended";
