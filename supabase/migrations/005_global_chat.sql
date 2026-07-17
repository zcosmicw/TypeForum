-- Migration v5: Global Chat Messages Table
-- This table stores global chat messages sent by authenticated users.

CREATE TABLE IF NOT EXISTS public.global_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  body text NOT NULL CHECK (char_length(trim(body)) > 0 AND char_length(body) <= 500),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexing for performance when fetching recent chat history
CREATE INDEX IF NOT EXISTS global_chat_messages_created_at_idx ON public.global_chat_messages (created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.global_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view chat messages
CREATE POLICY "Anyone can view chat messages" ON public.global_chat_messages
  FOR SELECT USING (true);

-- Policy 2: Authenticated users can insert their own chat messages
CREATE POLICY "Signed in users can post chat messages" ON public.global_chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = profile_id
  );

-- Enable Realtime for the global_chat_messages table
-- Note: If you have an existing publication named 'supabase_realtime', this adds the table to it.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.global_chat_messages;
  END IF;
END $$;
