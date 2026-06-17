-- Migration v2: Admin and Moderation Roles
-- Adds role and ban status to profiles, and updates deletion policies.

-- 1. Add columns to profiles table
alter table public.profiles
add column if not exists role text not null default 'user'
  check (role in ('user', 'moderator', 'admin')),
add column if not exists is_banned boolean not null default false;

-- 2. Helper functions to check roles
create or replace function public.is_staff(user_id uuid)
returns boolean
security definer
set search_path = public
language plpgsql as $$
begin
  return exists (
    select 1 from public.profiles
    where id = user_id and role in ('admin', 'moderator')
  );
end;
$$;

create or replace function public.is_admin(user_id uuid)
returns boolean
security definer
set search_path = public
language plpgsql as $$
begin
  return exists (
    select 1 from public.profiles
    where id = user_id and role = 'admin'
  );
end;
$$;

-- 3. Update thread RLS policies
drop policy if exists "Authors can delete own threads" on public.threads;

create policy "Authors and staff can delete threads"
  on public.threads for delete
  using (auth.uid() = author_id or public.is_staff(auth.uid()));

-- 4. Update post RLS policies
drop policy if exists "Authors can delete own posts" on public.posts;

create policy "Authors and staff can delete posts"
  on public.posts for delete
  using (auth.uid() = author_id or public.is_staff(auth.uid()));

-- 5. Update profiles update policy to allow admin modification
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin(auth.uid()))
  with check (auth.uid() = id or public.is_admin(auth.uid()));
