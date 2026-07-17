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
  fetchNotifications,
  fetchUnreadNotificationCount,
  fetchUnreadMessageCount,
  fetchMessages,

  // Aliases for backward compatibility
  fetchUnreadNotificationCount as getUnreadNotificationCount,
  fetchUnreadMessageCount as getUnreadMessageCount,
} from "@/lib/forum/queries";

export { rankLabels, rankColors, achievementBadges } from "@/lib/rankings";
