"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnvError, isSupabaseConfigured } from "@/lib/supabase/config";
import type { DbProfile } from "@/lib/supabase/types";

export type AuthState = {
  error?: string;
  success?: string;
};

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return { error: getSupabaseEnvError() };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!email || !password || !username) {
    return { error: "Email, username, and password are required." };
  }

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return {
      error: "Username must be 3–20 characters (letters, numbers, underscore).",
    };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  if (!supabase) return { error: getSupabaseEnvError() };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: displayName || username,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session) {
    redirect("/forums");
  }

  return {
    success: "Account created. Check your email to confirm, then log in.",
  };
}

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return { error: getSupabaseEnvError() };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  if (!supabase) return { error: getSupabaseEnvError() };

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/forums");
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function getSessionUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getSessionProfile(): Promise<DbProfile | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}
