-- Migration v13: Automated Notification Triggers for Replies, Follows, and Milestone Upvotes

-- 1. Triggers for comment and thread replies
CREATE OR REPLACE FUNCTION public.handle_post_notification()
RETURNS TRIGGER AS $$
DECLARE
  commenter_username text;
  parent_author_id uuid;
  thread_author_id uuid;
  thread_title text;
  truncated_body text;
BEGIN
  -- Get commenter username
  SELECT username FROM public.profiles WHERE id = NEW.author_id INTO commenter_username;
  IF commenter_username IS NULL THEN
    commenter_username := 'Someone';
  END IF;

  IF NEW.parent_id IS NOT NULL THEN
    -- Reply to a comment
    SELECT author_id, substring(body from 1 for 30) FROM public.posts WHERE id = NEW.parent_id INTO parent_author_id, truncated_body;
    IF parent_author_id IS NOT NULL AND parent_author_id != NEW.author_id THEN
      INSERT INTO public.notifications (user_id, type, message)
      VALUES (
        parent_author_id,
        'reply',
        '@' || commenter_username || ' replied to your comment: "' || truncated_body || '..."'
      );
    END IF;
  ELSE
    -- Reply to a thread (top-level comment)
    SELECT author_id, title FROM public.threads WHERE id = NEW.thread_id INTO thread_author_id, thread_title;
    IF thread_author_id IS NOT NULL AND thread_author_id != NEW.author_id THEN
      INSERT INTO public.notifications (user_id, type, message)
      VALUES (
        thread_author_id,
        'reply',
        '@' || commenter_username || ' replied to your thread: "' || thread_title || '"'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for posts
DROP TRIGGER IF EXISTS on_post_created ON public.posts;
CREATE TRIGGER on_post_created
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_post_notification();


-- 2. Triggers for follows
CREATE OR REPLACE FUNCTION public.handle_follow_notification()
RETURNS TRIGGER AS $$
DECLARE
  follower_username text;
  target_user_exists boolean;
BEGIN
  SELECT username FROM public.profiles WHERE id = NEW.follower_id INTO follower_username;
  IF follower_username IS NULL THEN
    follower_username := 'Someone';
  END IF;

  IF NEW.following_id != NEW.follower_id THEN
    -- Check if target user exists to avoid foreign key/references error
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = NEW.following_id) INTO target_user_exists;
    IF target_user_exists THEN
      INSERT INTO public.notifications (user_id, type, message)
      VALUES (
        NEW.following_id,
        'follow',
        '@' || follower_username || ' started following you'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for follows
DROP TRIGGER IF EXISTS on_follow_created ON public.follows;
CREATE TRIGGER on_follow_created
  AFTER INSERT ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_follow_notification();


-- 3. Triggers for thread upvotes (milestones: 5, 10, 15...)
CREATE OR REPLACE FUNCTION public.handle_thread_vote_notification()
RETURNS TRIGGER AS $$
DECLARE
  upvote_count integer;
  thread_author_id uuid;
  thread_title text;
  notification_msg text;
BEGIN
  -- We only care about upvotes (value = 1)
  IF NEW.value = 1 THEN
    -- Count total upvotes for the thread
    SELECT COUNT(*) FROM public.thread_votes WHERE thread_id = NEW.thread_id AND value = 1 INTO upvote_count;

    -- Check if it matches 5, 10, 15, 20...
    IF upvote_count > 0 AND upvote_count % 5 = 0 THEN
      SELECT author_id, title FROM public.threads WHERE id = NEW.thread_id INTO thread_author_id, thread_title;
      
      -- Don't notify if the voter is the author (self-upvotes aren't typical, but just in case)
      IF thread_author_id IS NOT NULL AND thread_author_id != NEW.user_id THEN
        notification_msg := 'Your thread "' || thread_title || '" has received ' || upvote_count || ' upvotes!';
        
        -- Avoid duplicate notifications for the exact same count
        IF NOT EXISTS (
          SELECT 1 FROM public.notifications 
          WHERE user_id = thread_author_id AND type = 'vote' AND message = notification_msg
        ) THEN
          INSERT INTO public.notifications (user_id, type, message)
          VALUES (thread_author_id, 'vote', notification_msg);
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for thread votes
DROP TRIGGER IF EXISTS on_thread_vote_updated ON public.thread_votes;
CREATE TRIGGER on_thread_vote_updated
  AFTER INSERT OR UPDATE ON public.thread_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_thread_vote_notification();


-- 4. Triggers for post upvotes (milestones: 5, 10, 15...)
CREATE OR REPLACE FUNCTION public.handle_post_vote_notification()
RETURNS TRIGGER AS $$
DECLARE
  upvote_count integer;
  post_author_id uuid;
  truncated_post text;
  notification_msg text;
BEGIN
  -- We only care about upvotes (value = 1)
  IF NEW.value = 1 THEN
    -- Count total upvotes for the post
    SELECT COUNT(*) FROM public.post_votes WHERE post_id = NEW.post_id AND value = 1 INTO upvote_count;

    -- Check if it matches 5, 10, 15, 20...
    IF upvote_count > 0 AND upvote_count % 5 = 0 THEN
      SELECT author_id, substring(body from 1 for 30) FROM public.posts WHERE id = NEW.post_id INTO post_author_id, truncated_post;
      
      -- Don't notify if the voter is the author
      IF post_author_id IS NOT NULL AND post_author_id != NEW.user_id THEN
        notification_msg := 'Your comment "' || truncated_post || '..." has received ' || upvote_count || ' upvotes!';
        
        -- Avoid duplicate notifications for the exact same count
        IF NOT EXISTS (
          SELECT 1 FROM public.notifications 
          WHERE user_id = post_author_id AND type = 'vote' AND message = notification_msg
        ) THEN
          INSERT INTO public.notifications (user_id, type, message)
          VALUES (post_author_id, 'vote', notification_msg);
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for post votes;
DROP TRIGGER IF EXISTS on_post_vote_updated ON public.post_votes;
CREATE TRIGGER on_post_vote_updated
  AFTER INSERT OR UPDATE ON public.post_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_post_vote_notification();
