-- Migration v4: Media Feed, Supplement Store, Notifications and Messages
-- Create tables for previously hardcoded features.

-- 1. Feed Posts
create table if not exists public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  type text not null check (type in ('photo', 'video', 'before-after')),
  caption text not null,
  likes integer not null default 0,
  comments integer not null default 0,
  shares integer not null default 0,
  trending boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS for Feed Posts
alter table public.feed_posts enable row level security;
create policy "Feed posts are viewable by everyone" on public.feed_posts for select using (true);
create policy "Authenticated users can create feed posts" on public.feed_posts for insert with check (auth.uid() is not null);

-- 2. Products
create table if not exists public.products (
  slug text primary key,
  name text not null,
  category text not null check (category in ('category-1', 'category-2', 'category-3', 'category-4')),
  price numeric(10, 2) not null,
  rating numeric(3, 2) not null default 0,
  review_count integer not null default 0,
  description text not null,
  featured boolean not null default false,
  sponsored boolean not null default false,
  affiliate boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS for Products
alter table public.products enable row level security;
create policy "Products are viewable by everyone" on public.products for select using (true);

-- 3. Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('reply', 'follow', 'vote', 'dm', 'rank')),
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS for Notifications
alter table public.notifications enable row level security;
create policy "Users can see own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);

-- 4. Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  from_username text not null,
  to_username text not null,
  body text not null,
  unread boolean not null default true,
  created_at timestamptz not null default now()
);

-- RLS for Messages
alter table public.messages enable row level security;
create policy "Users can see messages they sent or received" on public.messages
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and (username = from_username or username = to_username)
    )
  );

-- Seed initial data
insert into public.feed_posts (author, type, caption, likes, comments, shares, trending) values
  ('User1', 'before-after', '6 months progress check.', 842, 56, 31, true),
  ('User2', 'video', 'Video update.', 412, 28, 12, true),
  ('User3', 'photo', 'Photo update.', 298, 44, 8, false),
  ('User4', 'before-after', '90-day progress log.', 567, 91, 45, true);

insert into public.products (slug, name, category, price, rating, review_count, description, featured, sponsored, affiliate) values
  ('product-1', 'Mock Product 1', 'category-1', 29.99, 4.8, 214, 'Description for mock product 1.', true, false, false),
  ('product-2', 'Mock Product 2', 'category-2', 44.99, 4.5, 89, 'Description for mock product 2.', true, false, true),
  ('product-3', 'Mock Product 3', 'category-3', 59.99, 4.7, 156, 'Description for mock product 3.', false, true, false),
  ('product-4', 'Mock Product 4', 'category-1', 54.99, 4.6, 342, 'Description for mock product 4.', false, false, false),
  ('product-5', 'Mock Product 5', 'category-3', 34.99, 4.4, 278, 'Description for mock product 5.', false, false, true),
  ('product-6', 'Mock Product 6', 'category-4', 19.99, 4.9, 67, 'Description for mock product 6.', false, false, false);
