# TypeForum

A forum / community platform I built using Next.js, React, and Supabase.

It has the core stuff you'd expect from a forum — categories, threads, nested comments, voting — plus some extras like a real-time global chat, admin dashboard, notification system, and profile customization.

## what it does

- forum with categories + subforums, threads, nested comment trees
- upvote/downvote system (with milestone notification triggers so you dont get spammed)
- real-time global chat room on the homepage (supabase realtime)
- user profiles with avatars, banners, bios, stats, follow system
- trending algorithm that factors in votes, replies, views, and recency
- admin panel: manage users, roles, bans, edit categories/subforums, customize site name and hero text, upload ad banners, rename rank tiers
- search with tag filtering
- notifications for replies, follows, and vote milestones

## stack

- **Next.js 16** (app router, RSC, turbopack)
- **React 19** with `useActionState`, `useOptimistic`, server actions
- **Supabase** — postgres, auth, storage buckets, realtime subscriptions
- **Tailwind CSS v4**
- **TypeScript**

## setup

### 1. database

Make a project on [supabase.com](https://supabase.com) and run the migration files in `supabase/migrations/` in order (001 through 013) in the SQL editor.

You also need to create two **public** storage buckets: `ads` and `avatars`.

### 2. env

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. install + run

```bash
npm install
npm run dev
```

Open `localhost:3000`.

## building for prod

```bash
npm run build
npm start
```