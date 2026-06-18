-- Migration v7: Follows count synchronization triggers
-- Automatically updates follower_count and following_count in public.profiles when follows table changes.

create or replace function public.handle_follow_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (TG_OP = 'INSERT') then
    -- Increment follower_count for the user who is being followed
    update public.profiles
    set follower_count = follower_count + 1
    where id = new.following_id;

    -- Increment following_count for the user who followed
    update public.profiles
    set following_count = following_count + 1
    where id = new.follower_id;
    
    return new;
  elsif (TG_OP = 'DELETE') then
    -- Decrement follower_count for the user who is being followed
    update public.profiles
    set follower_count = greatest(0, follower_count - 1)
    where id = old.following_id;

    -- Decrement following_count for the user who followed
    update public.profiles
    set following_count = greatest(0, following_count - 1)
    where id = old.follower_id;
    
    return old;
  end if;
  return null;
end;
$$;

-- Drop trigger if it already exists
drop trigger if exists on_follow_change on public.follows;

-- Bind the trigger function to the follows table
create trigger on_follow_change
  after insert or delete on public.follows
  for each row execute function public.handle_follow_change();

-- Prevent self-following via a check constraint
alter table public.follows drop constraint if exists check_not_self_follow;
alter table public.follows add constraint check_not_self_follow check (follower_id <> following_id);
