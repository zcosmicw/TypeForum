-- Migration v10: Global Ad Settings Configuration

-- 1. Create table to store global ad config
CREATE TABLE IF NOT EXISTS public.ad_config (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled boolean NOT NULL DEFAULT true,
  image_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security on the table
ALTER TABLE public.ad_config ENABLE ROW LEVEL SECURITY;

-- Set up table policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read access for ad_config'
  ) THEN
    CREATE POLICY "Public read access for ad_config" ON public.ad_config FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin update access for ad_config'
  ) THEN
    CREATE POLICY "Admin update access for ad_config" ON public.ad_config FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin insert access for ad_config'
  ) THEN
    CREATE POLICY "Admin insert access for ad_config" ON public.ad_config FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  END IF;
END
$$;

-- Seed the initial config row
INSERT INTO public.ad_config (id, enabled, image_url)
VALUES (1, true, null)
ON CONFLICT (id) DO NOTHING;

-- 2. Create the ads storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('ads', 'ads', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies on storage.objects for the ads bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read access for ads'
  ) THEN
    CREATE POLICY "Public read access for ads" ON storage.objects FOR SELECT USING (bucket_id = 'ads');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin insert for ads'
  ) THEN
    CREATE POLICY "Admin insert for ads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
      bucket_id = 'ads' AND
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin update for ads'
  ) THEN
    CREATE POLICY "Admin update for ads" ON storage.objects FOR UPDATE TO authenticated USING (
      bucket_id = 'ads' AND
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin delete for ads'
  ) THEN
    CREATE POLICY "Admin delete for ads" ON storage.objects FOR DELETE TO authenticated USING (
      bucket_id = 'ads' AND
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  END IF;
END
$$;
