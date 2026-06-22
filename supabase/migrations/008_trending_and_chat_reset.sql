-- Migration v8: Trending Thread View and Chat Reset Policy

-- 1. Create a view for trending threads with Hacker News time-decay popularity score
CREATE OR REPLACE VIEW public.trending_threads AS
  SELECT 
    t.*,
    (
      t.view_count * 0.1 + 
      (SELECT count(*) FROM public.posts p WHERE p.thread_id = t.id) * 2.0 + 
      COALESCE((SELECT sum(value) FROM public.thread_votes v WHERE v.thread_id = t.id), 0) * 1.5
    ) / 
    POWER(
      EXTRACT(EPOCH FROM (now() - t.created_at)) / 3600 + 2.0, 
      1.8
    ) AS trending_score
  FROM public.threads t;

-- 2. Allow admins to delete rows in global_chat_messages
CREATE POLICY "Admins can delete chat messages" ON public.global_chat_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
