"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/actions/auth";
import { getSupabaseEnvError } from "@/lib/supabase/config";


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

export async function resetChatAction() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized: Only admins can reset the chat");

  const supabase = await createClient();
  if (!supabase) throw new Error("Database not connected");

  
  const { error } = await supabase
    .from("global_chat_messages")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) throw new Error(error.message);

  revalidatePath("/");
  return { success: true };
}

export async function updateAdConfigAction(enabled: boolean, imageUrl: string | null) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized: Only admins can manage ad settings");

  const supabase = await createClient();
  if (!supabase) throw new Error("Database not connected");

  const { error } = await supabase
    .from("ad_config")
    .upsert({
      id: 1,
      enabled,
      image_url: imageUrl,
      updated_at: new Date().toISOString(),
    });

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/forums");
  revalidatePath("/admin");
  return { success: true };
}

export async function updateCategoryAction(id: string, name: string, slug: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized: Only admins can manage categories");

  const supabase = await createClient();
  if (!supabase) throw new Error("Database not connected");

  const { error } = await supabase
    .from("categories")
    .update({ name, slug })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/forums");
  revalidatePath("/admin");
  return { success: true };
}

export async function updateSubforumAction(id: string, name: string, slug: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized: Only admins can manage subforums");

  const supabase = await createClient();
  if (!supabase) throw new Error("Database not connected");

  const { error } = await supabase
    .from("subforums")
    .update({ name, slug })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/forums");
  revalidatePath("/admin");
  return { success: true };
}

export async function updateRankLabelsAction(labels: Record<string, string>) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized: Only admins can manage rank labels");

  const supabase = await createClient();
  if (!supabase) throw new Error("Database not connected");

  const updates = Object.entries(labels).map(([key, label]) => {
    return supabase
      .from("rank_config")
      .upsert({
        rank_key: key,
        label,
        updated_at: new Date().toISOString(),
      });
  });

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed) throw new Error(failed.error?.message || "Failed to update one or more rank labels");

  revalidatePath("/");
  revalidatePath("/forums");
  revalidatePath("/admin");
  return { success: true };
}

export async function updateSiteSettingsAction(settings: {
  site_name: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_description: string;
  categories_description: string;
  footer_main: string;
  footer_sub: string;
}) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized: Only admins can manage site settings");

  const supabase = await createClient();
  if (!supabase) throw new Error("Database not connected");

  const { error } = await supabase
    .from("site_settings")
    .upsert({
      id: 1,
      site_name: settings.site_name,
      hero_eyebrow: settings.hero_eyebrow,
      hero_title: settings.hero_title,
      hero_description: settings.hero_description,
      categories_description: settings.categories_description,
      footer_main: settings.footer_main,
      footer_sub: settings.footer_sub,
      updated_at: new Date().toISOString(),
    });

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/forums");
  revalidatePath("/admin");
  return { success: true };
}

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function updateSiteSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await updateSiteSettingsAction({
      site_name: String(formData.get("siteName") ?? ""),
      hero_eyebrow: String(formData.get("heroEyebrow") ?? ""),
      hero_title: String(formData.get("heroTitle") ?? ""),
      hero_description: String(formData.get("heroDescription") ?? ""),
      categories_description: String(formData.get("categoriesDescription") ?? ""),
      footer_main: String(formData.get("footerMain") ?? ""),
      footer_sub: String(formData.get("footerSub") ?? ""),
    });
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to save settings." };
  }
}

export async function updateForumConfig(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const categoriesJson = String(formData.get("categoriesJson") ?? "[]");
    const categories = JSON.parse(categoriesJson);

    const admin = await getAuthenticatedAdmin();
    if (!admin) return { error: "Unauthorized" };

    const supabase = await createClient();
    if (!supabase) return { error: "Database not connected" };

    for (const cat of categories) {
      if (cat.id) {
        await supabase.from("categories").update({
          name: cat.name,
          slug: cat.slug,
          description: cat.description || "",
          icon: cat.icon || "📁",
        }).eq("id", cat.id);
      }
    }

    revalidatePath("/");
    revalidatePath("/forums");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to save forum config." };
  }
}

export async function updateAdSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const enabled = formData.get("enabled") === "on";
    const imageUrl = String(formData.get("imageUrl") ?? "") || null;
    await updateAdConfigAction(enabled, imageUrl);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to save ad settings." };
  }
}

export async function updateRanksConfig(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const labels: Record<string, string> = {};
    const rankKeys = ["admin", "moderator", "veteran", "member", "newbie"];
    for (const key of rankKeys) {
      const val = formData.get(`rank_${key}`);
      if (val) labels[key] = String(val);
    }
    await updateRankLabelsAction(labels);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to save rank labels." };
  }
}

export async function updateUserRole(targetId: string, role: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized");

  const supabase = await createClient();
  if (!supabase) throw new Error("Database not connected");

  const { error } = await supabase.from("profiles").update({ role }).eq("id", targetId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
}

export async function deleteUserAction(targetId: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized");

  const supabase = await createClient();
  if (!supabase) throw new Error("Database not connected");

  const { error } = await supabase.from("profiles").delete().eq("id", targetId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
}
