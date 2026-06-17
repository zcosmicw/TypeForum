"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnvError, isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionProfile } from "@/lib/actions/auth";

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function createThread(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) {
    return { error: getSupabaseEnvError() };
  }

  const profile = await getSessionProfile();
  if (!profile) return { error: "You must be logged in to create a thread." };
  if (profile.is_banned) return { error: "Your account is banned." };

  const categorySlug = String(formData.get("categorySlug") ?? "");
  const subforumSlug = String(formData.get("subforumSlug") ?? "") || null;
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const tagsRaw = String(formData.get("tags") ?? "");
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (!categorySlug || !title || !body) {
    return { error: "Category, title, and body are required." };
  }

  const supabase = await createClient();
  if (!supabase) return { error: getSupabaseEnvError() };

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();

  if (!category) return { error: "Category not found." };

  let subforumId: string | null = null;
  if (subforumSlug) {
    const { data: subforum } = await supabase
      .from("subforums")
      .select("id")
      .eq("category_id", category.id)
      .eq("slug", subforumSlug)
      .single();
    subforumId = subforum?.id ?? null;
  }

  const { data: thread, error } = await supabase
    .from("threads")
    .insert({
      category_id: category.id,
      subforum_id: subforumId,
      author_id: profile.id,
      title,
      body,
      tags,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/c/${categorySlug}`);
  revalidatePath("/forums");
  redirect(`/t/${thread.id}`);
}

export async function createReply(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) {
    return { error: getSupabaseEnvError() };
  }

  const profile = await getSessionProfile();
  if (!profile) return { error: "You must be logged in to reply." };
  if (profile.is_banned) return { error: "Your account is banned." };

  const threadId = String(formData.get("threadId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const quote = String(formData.get("quote") ?? "").trim() || null;
  let parentId = String(formData.get("parentId") ?? "").trim() || null;

  // If parentId references the simulated OP post id, map it to null (database root reply)
  if (parentId && parentId.startsWith("op-")) {
    parentId = null;
  }

  if (!threadId || !body) {
    return { error: "Reply body is required." };
  }

  const supabase = await createClient();
  if (!supabase) return { error: getSupabaseEnvError() };

  const { error } = await supabase.from("posts").insert({
    thread_id: threadId,
    author_id: profile.id,
    body,
    quote,
    parent_id: parentId,
  });

  if (error) return { error: error.message };

  revalidatePath(`/t/${threadId}`);
  return { success: true };
}

export async function saveDraft(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) {
    return { error: getSupabaseEnvError() };
  }

  const profile = await getSessionProfile();
  if (!profile) return { error: "You must be logged in to save drafts." };
  if (profile.is_banned) return { error: "Your account is banned." };

  const categorySlug = String(formData.get("categorySlug") ?? "") || null;
  const subforumSlug = String(formData.get("subforumSlug") ?? "") || null;
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const tagsRaw = String(formData.get("tags") ?? "");
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const supabase = await createClient();
  if (!supabase) return { error: getSupabaseEnvError() };

  let categoryId: string | null = null;
  let subforumId: string | null = null;

  if (categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    categoryId = category?.id ?? null;

    if (categoryId && subforumSlug) {
      const { data: subforum } = await supabase
        .from("subforums")
        .select("id")
        .eq("category_id", categoryId)
        .eq("slug", subforumSlug)
        .single();
      subforumId = subforum?.id ?? null;
    }
  }

  const { data: existing } = await supabase
    .from("thread_drafts")
    .select("id")
    .eq("author_id", profile.id)
    .maybeSingle();

  const payload = {
    author_id: profile.id,
    category_id: categoryId,
    subforum_id: subforumId,
    title,
    body,
    tags,
    updated_at: new Date().toISOString(),
  };

  const { error } = existing
    ? await supabase.from("thread_drafts").update(payload).eq("id", existing.id)
    : await supabase.from("thread_drafts").insert(payload);

  if (error) return { error: error.message };

  return { error: undefined };
}

export async function updateProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) {
    return { error: getSupabaseEnvError() };
  }

  const profile = await getSessionProfile();
  if (!profile) return { error: "You must be logged in." };
  if (profile.is_banned) return { error: "Your account is banned." };

  const displayName = String(formData.get("displayName") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (!displayName) return { error: "Display name is required." };

  const supabase = await createClient();
  if (!supabase) return { error: getSupabaseEnvError() };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, bio })
    .eq("id", profile.id);

  if (error) return { error: error.message };

  const { data: userProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", profile.id)
    .single();

  revalidatePath("/settings");
  if (userProfile?.username) {
    revalidatePath(`/u/${userProfile.username}`);
  }
  return {};
}

export async function votePost(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: getSupabaseEnvError() };
  }

  const profile = await getSessionProfile();
  if (!profile) return { error: "Login required." };
  if (profile.is_banned) return { error: "Your account is banned." };

  const postId = String(formData.get("postId") ?? "");
  const threadId = String(formData.get("threadId") ?? "");
  const value = Number(formData.get("value"));

  if (!postId || (value !== 1 && value !== -1 && value !== 0)) {
    return { error: "Invalid vote." };
  }

  const supabase = await createClient();
  if (!supabase) return { error: getSupabaseEnvError() };

  let error;
  if (value === 0) {
    const res = await supabase
      .from("post_votes")
      .delete()
      .eq("user_id", profile.id)
      .eq("post_id", postId);
    error = res.error;
  } else {
    const res = await supabase.from("post_votes").upsert(
      { user_id: profile.id, post_id: postId, value },
      { onConflict: "user_id,post_id" },
    );
    error = res.error;
  }

  if (error) return { error: error.message };

  if (threadId) revalidatePath(`/t/${threadId}`);
  return {};
}

export async function followUser(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: getSupabaseEnvError() };
  }

  const profile = await getSessionProfile();
  if (!profile) return { error: "Login required." };
  if (profile.is_banned) return { error: "Your account is banned." };

  const targetUsername = String(formData.get("username") ?? "");
  if (!targetUsername) return { error: "Username required." };

  const supabase = await createClient();
  if (!supabase) return { error: getSupabaseEnvError() };

  // Get the target user's profile id
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", targetUsername)
    .single();

  if (!targetProfile) return { error: "User not found." };

  const { error } = await supabase.from("follows").upsert(
    { follower_id: profile.id, following_id: targetProfile.id },
    { onConflict: "follower_id,following_id" },
  );

  if (error) return { error: error.message };

  revalidatePath(`/u/${targetUsername}`);
  return {};
}



export async function voteThread(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: getSupabaseEnvError() };
  }

  const profile = await getSessionProfile();
  if (!profile) return { error: "Login required." };
  if (profile.is_banned) return { error: "Your account is banned." };

  const threadId = String(formData.get("threadId") ?? "");
  const value = Number(formData.get("value"));

  if (!threadId || (value !== 1 && value !== -1 && value !== 0)) {
    return { error: "Invalid vote." };
  }

  const supabase = await createClient();
  if (!supabase) return { error: getSupabaseEnvError() };

  let error;
  if (value === 0) {
    const res = await supabase
      .from("thread_votes")
      .delete()
      .eq("user_id", profile.id)
      .eq("thread_id", threadId);
    error = res.error;
  } else {
    const res = await supabase.from("thread_votes").upsert(
      { user_id: profile.id, thread_id: threadId, value },
      { onConflict: "user_id,thread_id" },
    );
    error = res.error;
  }

  if (error) return { error: error.message };

  revalidatePath(`/t/${threadId}`);
  return {};
}
