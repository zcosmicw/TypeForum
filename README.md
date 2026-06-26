# 🌌 TypeForum

TypeForum is a state-of-the-art, high-performance community discussion platform. Designed with a gorgeous dark glassmorphism aesthetic, it is built on **Next.js 16**, **React 19**, **Tailwind CSS v4**, and **Supabase (PostgreSQL)**. 

Whether you are hosting a gaming guild, a creator community, a tech forum, or a self-improvement space, TypeForum provides all the features you need in a modern, lightweight, and self-hosted alternative to Discord or Reddit.

---

## ✨ Features

### 🏁 Core Forum Experience
- **Structured Categories & Subforums**: Nested forums that help organize community discussions logically, fully responsive and styled with custom border glows.
- **Smart Trending Algorithm**: Curates the main feed by ranking threads using an algorithm that factors in upvotes, downvotes, reply counts, views, and time decay to keep content fresh.
- **Milestone Upvote & Downvote System**: Fully integrated voting for threads and posts.

### 🖼️ Profile Customization & Real-time Stats
- **Avatars & Covers**: Upload custom profile pictures and cover banners directly from settings with live preview cropping.
- **Dynamic Stats Card**: Displays live community engagement scores including total **Upvotes received**, **Comments written**, and **Threads created**.

### 🛡️ Next-Gen Admin Control Suite
- **Interactive Site Customizer**: Modify the **Website Name**, **Homepage Copy** (Hero Eyebrow, Title, Description), and **Footer Paragraphs** instantly.
- **Initials Monogram Logo**: The header logo monogram automatically extracts and computes the initials of your custom website name (e.g. `TypeForum` -> `TF`, `Active Community` -> `AC`).
- **Hero Title Highlight Syntax**: Wrap words in square brackets like `[this]` in the admin panel to automatically highlight them with a premium purple gradient on the homepage.
- **Layout Configurator**: Edit category and subforum names, slugs, order, and customize titles for user ranks 1 to 5 directly in the dashboard.
- **Staff Control Center**: Manage roles, promote/demote admins or moderators, ban/unban users, and clear the global chat.

### 🔔 Automated Notifications
- **Smart Database Triggers**: Handled directly in PostgreSQL (PL/pgSQL triggers) for replies to threads, nested replies to comments, and follows.
- **Milestone Alerts**: Users are notified of upvotes *only* at milestone values (5, 10, 15, 20...) to prevent notifications inbox clutter, with duplication guards if score fluctuates.

### 💬 Real-time Global Chat
- Fully functional chat box on the home page powered by Supabase real-time subscriptions, complete with chat moderation capability for admins.

### 📺 Ad Space Monetization
- Optional global billboard ad banner slot (970x90 standard) on the main page. Admins can upload a banner (image/GIF) and toggle ad visibility.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React Server Components)
- **UI & Logic**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Supabase Auth, Storage Buckets, Realtime Subscriptions)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (custom HSL color palette, glassmorphic panels, gradient glows)

---

## ⚙️ Directory Structure

```
TypeForum/
├── src/
│   ├── app/                # Next.js page routes & layout templates
│   ├── components/         # Reusable React components (Header, Footer, Forms, etc.)
│   ├── lib/
│   │   ├── actions/        # Server actions (auth, forum, admin settings)
│   │   ├── forum/          # Database query helpers
│   │   ├── supabase/       # Client/server Supabase instances and TS types
│   │   └── types.ts        # Shared TypeScript interfaces
├── supabase/
│   ├── migrations/         # PostgreSQL migration files (001 to 013)
├── public/                 # Static asset folders
```

---

## 🚀 Setup & Installation

### 1. Database Setup
Create a new project on [Supabase](https://supabase.com) and run the migration files located in the `supabase/migrations/` directory in sequential order using the Supabase SQL editor:
1. `001_initial.sql` (Tables & Initial Seeds)
2. `002_admin.sql` (Admin Roles Setup)
3. `003_nested_comments.sql` (Reddit-style threading parent_id)
4. `004_media_store_social.sql` (Notifications & Storage Tables)
5. `005_global_chat.sql` (Global chat table & RLS)
6. `006_remove_feed.sql` (Decommissioning social media feed tab)
7. `007_follows_triggers.sql` (Followers tables triggers)
8. `008_trending_and_chat_reset.sql` (Trending calculation views)
9. `009_profile_pictures_and_banners.sql` (Profile media fields)
10. `010_ad_settings.sql` (Ad Configuration storage)
11. `011_admin_management_policies.sql` (Ranks and Category modification RLS)
12. `012_site_settings.sql` (Site customization configurations)
13. `013_notifications_triggers.sql` (Replies/Follows/Votes triggers)

*Note: Ensure you create a Storage bucket named `ads` (public) and `avatars` (public) inside the Supabase Storage panel to support banner ad and profile picture uploads.*

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install Dependencies
Run the following command to download dependencies:

```bash
npm install
```

### 4. Run the Application
Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Building for Production

To optimize and build TypeForum for production deployments:

```bash
npm run build
npm start
```