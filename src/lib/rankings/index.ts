
export const rankLabels = {
  rank1: "Rank 1",
  "rank2": "Rank 2",
  rank3: "Rank 3",
  rank4: "Rank 4",
  rank5: "Rank 5",
} as const;

export const rankColors: Record<keyof typeof rankLabels, string> = {
  rank1: "bg-slate-100 text-slate-600",
  "rank2": "bg-blue-100 text-blue-700",
  rank3: "bg-purple-100 text-purple-700",
  rank4: "bg-purple-200 text-purple-900",
  rank5: "bg-brand-purple-neon/15 text-brand-purple-neon",
};

export const achievementBadges = [
  { id: "first-log", label: "First Progress Log", description: "Posted your first transformation" },
  { id: "100-upvotes", label: "Helpful Member", description: "Earned 100 upvotes on replies" },
  { id: "30-day-streak", label: "30-Day Streak", description: "Logged gym activity 30 days straight" },
  { id: "rank-rank3", label: "Rank 3 Certified", description: "Community voted you to Rank 3" },
  { id: "store-review", label: "Verified Buyer", description: "Left 5 store reviews" },
];
