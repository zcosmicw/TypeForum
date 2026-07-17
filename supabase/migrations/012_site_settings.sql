-- Migration v12: Editable Website Name, Hero and Footer Copy Configuration

CREATE TABLE IF NOT EXISTS public.site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  site_name text NOT NULL DEFAULT 'TypeForum',
  hero_eyebrow text NOT NULL DEFAULT 'Welcome to the town',
  hero_title text NOT NULL DEFAULT 'Welcome to the [ultimate discussion] platform.',
  hero_description text NOT NULL DEFAULT 'Topics, discussions, categories, rankings, and a store — all in one generic platform.',
  categories_description text NOT NULL DEFAULT 'Category 1, Category 2, Category 3, Category 4, and more.',
  footer_main text NOT NULL DEFAULT 'looks, health, and self-improvement.',
  footer_sub text NOT NULL DEFAULT 'Discuss. Share. Connect.',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT one_row CHECK (id = 1)
);

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read access for site_settings'
  ) THEN
    CREATE POLICY "Public read access for site_settings" ON public.site_settings FOR SELECT USING (true);
  END IF;
END
$$;

-- 2. Admin Insert Access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin insert access for site_settings'
  ) THEN
    CREATE POLICY "Admin insert access for site_settings" ON public.site_settings FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  END IF;
END
$$;

-- 3. Admin Update Access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin update access for site_settings'
  ) THEN
    CREATE POLICY "Admin update access for site_settings" ON public.site_settings FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  END IF;
END
$$;

-- Seed initial row
INSERT INTO public.site_settings (
  id,
  site_name,
  hero_eyebrow,
  hero_title,
  hero_description,
  categories_description,
  footer_main,
  footer_sub
)
VALUES (
  1,
  'TypeForum',
  'Welcome to the town',
  'Welcome to the [ultimate discussion] platform.',
  'Topics, discussions, categories, rankings, and a store — all in one generic platform.',
  'Category 1, Category 2, Category 3, Category 4, and more.',
  'looks, health, and self-improvement.',
  'Discuss. Share. Connect.'
)
ON CONFLICT (id) DO NOTHING;
