-- TypeForum v1 schema for Supabase

create extension if not exists "pgcrypto";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  display_name text not null,
  bio text not null default '',
  rank text not null default 'rank1'
    check (rank in ('rank1', 'rank2', 'rank3', 'rank4', 'rank5')),
  post_count integer not null default 0,
  follower_count integer not null default 0,
  following_count integer not null default 0,
  tier_votes integer not null default 0,
  gym_streak integer not null default 0,
  transformations integer not null default 0,
  helpful_votes integer not null default 0,
  created_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-zA-Z0-9_]{3,20}$')
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  icon text not null default '✦',
  sort_order integer not null default 0
);

create table public.subforums (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  slug text not null,
  name text not null,
  unique (category_id, slug)
);

create table public.threads (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  subforum_id uuid references public.subforums (id) on delete set null,
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 200),
  body text not null check (char_length(body) >= 10),
  tags text[] not null default '{}',
  pinned boolean not null default false,
  trending boolean not null default false,
  sponsored boolean not null default false,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) >= 1),
  quote text,
  created_at timestamptz not null default now()
);

create table public.thread_votes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  thread_id uuid not null references public.threads (id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  primary key (user_id, thread_id)
);

create table public.post_votes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  primary key (user_id, post_id)
);

create table public.thread_drafts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  subforum_id uuid references public.subforums (id) on delete set null,
  title text not null default '',
  body text not null default '',
  tags text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create index threads_category_id_idx on public.threads (category_id);
create index threads_subforum_id_idx on public.threads (subforum_id);
create index threads_created_at_idx on public.threads (created_at desc);
create index posts_thread_id_idx on public.posts (thread_id);
create index profiles_username_idx on public.profiles (username);
create unique index thread_drafts_author_id_idx on public.thread_drafts (author_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_username text;
  final_username text;
  suffix integer := 0;
begin
  raw_username := lower(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)));
  raw_username := regexp_replace(raw_username, '[^a-zA-Z0-9_]', '', 'g');

  if char_length(raw_username) < 3 then
    raw_username := 'user';
  end if;

  raw_username := left(raw_username, 20);
  final_username := raw_username;

  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := left(raw_username, 20 - char_length(suffix::text)) || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data ->> 'display_name', final_username)
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Bump thread updated_at on new reply
create or replace function public.bump_thread_on_reply()
returns trigger
language plpgsql
as $$
begin
  update public.threads
  set updated_at = now()
  where id = new.thread_id;
  return new;
end;
$$;

create trigger on_post_created
  after insert on public.posts
  for each row execute function public.bump_thread_on_reply();

-- RLS
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.subforums enable row level security;
alter table public.threads enable row level security;
alter table public.posts enable row level security;
alter table public.thread_votes enable row level security;
alter table public.post_votes enable row level security;
alter table public.thread_drafts enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Categories are viewable by everyone"
  on public.categories for select using (true);

create policy "Subforums are viewable by everyone"
  on public.subforums for select using (true);

create policy "Threads are viewable by everyone"
  on public.threads for select using (true);

create policy "Authenticated users can create threads"
  on public.threads for insert with check (auth.uid() = author_id);

create policy "Authors can update own threads"
  on public.threads for update using (auth.uid() = author_id);

create policy "Authors can delete own threads"
  on public.threads for delete using (auth.uid() = author_id);

create policy "Posts are viewable by everyone"
  on public.posts for select using (true);

create policy "Authenticated users can create posts"
  on public.posts for insert with check (auth.uid() = author_id);

create policy "Authors can update own posts"
  on public.posts for update using (auth.uid() = author_id);

create policy "Authors can delete own posts"
  on public.posts for delete using (auth.uid() = author_id);

create policy "Thread votes are viewable by everyone"
  on public.thread_votes for select using (true);

create policy "Users manage own thread votes"
  on public.thread_votes for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Post votes are viewable by everyone"
  on public.post_votes for select using (true);

create policy "Users manage own post votes"
  on public.post_votes for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own drafts"
  on public.thread_drafts for all using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- Seed categories & subforums
insert into public.categories (slug, name, description, icon, sort_order) values
  ('category-1', 'Category 1', 'Description for category 1.', '✦', 1),
  ('category-2', 'Category 2', 'Description for category 2.', '⚡', 2),
  ('category-3', 'Category 3', 'Description for category 3.', '◈', 3);

insert into public.subforums (category_id, slug, name)
select c.id, s.slug, s.name
from public.categories c
join (
  values
    ('category-1', 'subforum-1', 'Subforum 1'),
    ('category-1', 'subforum-2', 'Subforum 2'),
    ('category-2', 'subforum-3', 'Subforum 3'),
    ('category-2', 'subforum-4', 'Subforum 4'),
    ('category-3', 'subforum-5', 'Subforum 5'),
    ('category-3', 'subforum-6', 'Subforum 6')
) as s(cat_slug, slug, name) on c.slug = s.cat_slug;

-- Mock Users and Threads
-- Since we cannot insert into auth.users easily without bypassing Supabase Auth logic safely,
-- we'll rely on users signing up and creating threads. 
-- The user requested mock data for threads too: we will insert dummy profiles if needed, but it's safer to leave threads for actual signed-up users. 
-- Wait, the user specifically requested "thread 1, thread 2 not hardcoded but mock in the supabase database".
-- Let's insert a dummy user into auth.users and public.profiles for this.
insert into auth.users (id, email) values ('00000000-0000-0000-0000-000000000000', 'mock@typeforum.com') on conflict do nothing;
insert into public.profiles (id, username, display_name) values ('00000000-0000-0000-0000-000000000000', 'mockuser', 'Mock User') on conflict do nothing;

insert into public.threads (category_id, subforum_id, author_id, title, body)
select c.id, s.id, '00000000-0000-0000-0000-000000000000', 'Mock Thread 1', 'This is a mock thread body.'
from public.categories c
join public.subforums s on s.category_id = c.id
where c.slug = 'category-1' and s.slug = 'subforum-1'
limit 1;

insert into public.threads (category_id, subforum_id, author_id, title, body)
select c.id, s.id, '00000000-0000-0000-0000-000000000000', 'Mock Thread 2', 'This is another mock thread body.'
from public.categories c
join public.subforums s on s.category_id = c.id
where c.slug = 'category-2' and s.slug = 'subforum-3'
limit 1;

-- Follows table (added in v1.1)
create table if not exists public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id)
);

alter table public.follows enable row level security;

create policy "Users can see follows"
  on public.follows for select using (true);

create policy "Users manage own follows"
  on public.follows for all using (auth.uid() = follower_id)
  with check (auth.uid() = follower_id);
