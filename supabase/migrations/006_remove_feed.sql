-- Migration v6: Remove Feed Section
-- Drops the feed_posts table from the database since it is no longer used in the UI.

DROP TABLE IF EXISTS public.feed_posts CASCADE;
