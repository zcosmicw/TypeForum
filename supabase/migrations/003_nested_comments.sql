-- Migration v3: Nested Comments
-- Adds parent_id to public.posts for Reddit-style threading

alter table public.posts
add column if not exists parent_id uuid references public.posts (id) on delete cascade;

-- Index for parent_id to speed up tree lookups
create index if not exists posts_parent_id_idx on public.posts (parent_id);
