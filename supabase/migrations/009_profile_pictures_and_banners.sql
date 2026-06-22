-- Migration v9: Profile Pictures and Banner Images Support

-- 1. Add avatar_url and banner_url to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url text;

-- 2. Create storage buckets for profile assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up RLS policies for storage buckets
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read access for avatars'
  ) THEN
    CREATE POLICY "Public read access for avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read access for banners'
  ) THEN
    CREATE POLICY "Public read access for banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated upload for avatars'
  ) THEN
    CREATE POLICY "Authenticated upload for avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated upload for banners'
  ) THEN
    CREATE POLICY "Authenticated upload for banners" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'banners');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Owner update for avatars'
  ) THEN
    CREATE POLICY "Owner update for avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Owner delete for avatars'
  ) THEN
    CREATE POLICY "Owner delete for avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Owner update for banners'
  ) THEN
    CREATE POLICY "Owner update for banners" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'banners');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Owner delete for banners'
  ) THEN
    CREATE POLICY "Owner delete for banners" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'banners');
  END IF;
END
$$;
