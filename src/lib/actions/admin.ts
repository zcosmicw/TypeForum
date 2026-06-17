"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/actions/auth";
import { getSupabaseEnvError } from "@/lib/supabase/config";

// Helper to check permissions
async function getAuthenticatedStaff() {
  const profile = await getSessionProfile();
  if (!profile) return null;
  const role = profile.role || "user";
  if (role === "admin" || role === "moderator") {
    return profile;
  }
  return null;
}

async function getAuthenticatedAdmin() {
  const profile = await getSessionProfile();
  if (!profile) return null;
  if (profile.role === "admin") {
    return profile;
  }
  return null;
}

export async function deleteThreadAction(threadId: string) {
  const profile = await getSessionProfile();
  if (!profile) throw new Error("Not logged in");

  const supabase = await createClient();
  if (!supabase) throw new Error("Database not connected");

  // Fetch thread details to check ownership and get category slug
  const { data: thread } = await supabase
    .from("threads")
    .select("*, categories(slug)")
    .eq("id", threadId)
    .single();

  if (!thread) throw new Error("Thread not found");

  const isAuthor = thread.author_id === profile.id;
  const isStaff = profile.role === "admin" || profile.role === "moderator";

  if (!isAuthor && !isStaff) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("threads")
    .delete()
    .eq("id", threadId);

  if (error) throw new Error(error.message);

  const categorySlug = (thread.categories as any)?.slug || "forums";
  revalidatePath(`/c/${categorySlug}`);
  revalidatePath("/forums");
  redirect(`/c/${categorySlug}`);
}

export async function deletePostAction(postId: string, threadId: string) {
  const profile = await getSessionProfile();
  if (!profile) throw new Error("Not logged in");

  const supabase = await createClient();
  if (!supabase) throw new Error("Database not connected");

  // Fetch post details to check ownership
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (!post) throw new Error("Post not found");

  const isAuthor = post.author_id === profile.id;
  const isStaff = profile.role === "admin" || profile.role === "moderator";

  if (!isAuthor && !isStaff) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId);

  if (error) throw new Error(error.message);

  revalidatePath(`/t/${threadId}`);
  return { success: true };
}

export async function updateUserRoleAction(targetUserId: string, targetUsername: string, role: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized: Only admins can manage roles");

  const supabase = await createClient();
  if (!supabase) throw new Error("Database not connected");

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", targetUserId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath(`/u/${targetUsername}`);
  return { success: true };
}

export async function toggleBanUserAction(targetUserId: string, targetUsername: string, currentBanStatus: boolean) {
  const staff = await getAuthenticatedStaff();
  if (!staff) throw new Error("Unauthorized: Only staff can ban users");

  const supabase = await createClient();
  if (!supabase) throw new Error(getSupabaseEnvError());

  // Prevent staff from banning other admins
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", targetUserId)
    .single();

  if (targetProfile?.role === "admin" && staff.role !== "admin") {
    throw new Error("Unauthorized: Only admins can ban other admins");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_banned: !currentBanStatus })
    .eq("id", targetUserId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath(`/u/${targetUsername}`);
  return { success: true };
}

export async function updateUserRankAction(targetUserId: string, targetUsername: string, rank: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized: Only admins can manage user ranks");

  const supabase = await createClient();
  if (!supabase) throw new Error("Database not connected");

  const { error } = await supabase
    .from("profiles")
    .update({ rank })
    .eq("id", targetUserId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath(`/u/${targetUsername}`);
  return { success: true };
}
