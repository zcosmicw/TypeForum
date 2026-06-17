export {
  fetchCategories,
  fetchCategory,
  fetchThreadsByCategory,
  fetchThread,
  fetchThreadBody,
  fetchPostsByThread,
  fetchRecentThreads,
  fetchTrendingThreads,
  searchThreads,
  fetchProfile,
  fetchRecommendedUsers,
  fetchLeaderboard,
  fetchFeedSorted,
  fetchProduct,
  fetchProducts,
  fetchFeaturedProducts,
  fetchNotifications,
  fetchUnreadNotificationCount,
  fetchUnreadMessageCount,
  fetchMessages,

  // Aliases for backward compatibility
  fetchFeedSorted as getFeedSorted,
  fetchProduct as getProduct,
  fetchFeaturedProducts as getFeaturedProducts,
  fetchUnreadNotificationCount as getUnreadNotificationCount,
  fetchUnreadMessageCount as getUnreadMessageCount,
} from "@/lib/forum/queries";

export { rankLabels, rankColors, achievementBadges } from "@/lib/rankings";
