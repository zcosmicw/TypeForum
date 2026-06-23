-- Migration v11: Custom Categories, Subforums and User Rank Labels

-- 1. Create table to store custom user rank titles
CREATE TABLE IF NOT EXISTS public.rank_config (
  rank_key text PRIMARY KEY,
  label text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on rank config
ALTER TABLE public.rank_config ENABLE ROW LEVEL SECURITY;

-- 2. Define policies for rank config
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read access for rank_config'
  ) THEN
    CREATE POLICY "Public read access for rank_config" ON public.rank_config FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin update access for rank_config'
  ) THEN
    CREATE POLICY "Admin update access for rank_config" ON public.rank_config FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin insert access for rank_config'
  ) THEN
    CREATE POLICY "Admin insert access for rank_config" ON public.rank_config FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  END IF;
END
$$;

-- Seed default user rank titles
INSERT INTO public.rank_config (rank_key, label) VALUES
  ('rank1', 'Rank 1'),
  ('rank2', 'Rank 2'),
  ('rank3', 'Rank 3'),
  ('rank4', 'Rank 4'),
  ('rank5', 'Rank 5')
ON CONFLICT (rank_key) DO UPDATE SET label = EXCLUDED.label;

-- 3. Define admin management policies for categories and subforums
DO $$
BEGIN
  -- Category Policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update categories') THEN
    CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can insert categories') THEN
    CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete categories') THEN
    CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;

  -- Subforum Policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update subforums') THEN
    CREATE POLICY "Admins can update subforums" ON public.subforums FOR UPDATE USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can insert subforums') THEN
    CREATE POLICY "Admins can insert subforums" ON public.subforums FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete subforums') THEN
    CREATE POLICY "Admins can delete subforums" ON public.subforums FOR DELETE USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END
$$;
