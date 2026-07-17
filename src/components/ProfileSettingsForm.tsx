"use client";

import { useActionState, useState, useRef } from "react";
import { updateProfile, type ActionState } from "@/lib/actions/forum";
import type { DbProfile } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";

const initialState: ActionState = {};

export function ProfileSettingsForm({ profile }: { profile: DbProfile }) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);

  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [bannerUrl, setBannerUrl] = useState(profile.banner_url || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "banner") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB.");
      return;
    }

    const setUploading = type === "avatar" ? setUploadingAvatar : setUploadingBanner;
    const setUrl = type === "avatar" ? setAvatarUrl : setBannerUrl;
    const bucket = type === "avatar" ? "avatars" : "banners";

    setUploading(true);
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase is not configured.");

      const fileExt = file.name.split(".").pop();
      const filePath = `${profile.id}/${type}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
      setUrl(publicUrl);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form action={formAction} className="card p-6">
      <h2 className="mb-6 text-lg font-semibold text-text-primary">Profile settings</h2>

      <input type="hidden" name="avatarUrl" value={avatarUrl} />
      <input type="hidden" name="bannerUrl" value={bannerUrl} />

      <div className="space-y-6">
        <div>
          <label className="label-field">Profile banner</label>
          <div
            onClick={() => !uploadingBanner && bannerInputRef.current?.click()}
            className="relative h-36 w-full rounded-lg border border-dashed border-border-default bg-bg-root hover:border-accent transition-colors cursor-pointer flex items-center justify-center group overflow-hidden"
          >
            {bannerUrl ? (
              <img src={bannerUrl} alt="Banner Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="text-center p-4">
                <span className="text-2xl">🖼️</span>
                <p className="text-xs text-text-ghost mt-1.5">Click to upload</p>
              </div>
            )}
            {uploadingBanner && (
              <div className="absolute inset-0 bg-bg-root/90 flex items-center justify-center text-sm font-medium text-accent">
                Uploading...
              </div>
            )}
            <div className="absolute inset-0 bg-bg-root/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm font-medium text-accent">
              Change banner
            </div>
          </div>
          <input ref={bannerInputRef} type="file" accept="image/*" onChange={(e) => uploadFile(e, "banner")} className="hidden" />
        </div>

        <div className="flex items-center gap-5">
          <div>
            <label className="label-field">Avatar</label>
            <div
              onClick={() => !uploadingAvatar && avatarInputRef.current?.click()}
              className="relative h-20 w-20 rounded-full border border-dashed border-border-default bg-bg-root hover:border-accent transition-colors cursor-pointer flex items-center justify-center group shrink-0 overflow-hidden"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-text-ghost">
                  {profile.display_name.charAt(0).toUpperCase()}
                </span>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-bg-root/90 flex items-center justify-center text-xs font-medium text-accent">
                  ...
                </div>
              )}
              <div className="absolute inset-0 bg-bg-root/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-medium text-accent text-center p-1 leading-tight rounded-full">
                Change
              </div>
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" onChange={(e) => uploadFile(e, "avatar")} className="hidden" />
          </div>
          <div className="text-sm text-text-muted space-y-0.5">
            <p className="font-medium text-text-secondary">Avatar upload</p>
            <p>JPG, PNG, WEBP. Max 5MB.</p>
          </div>
        </div>

        <div>
          <label className="label-field">Username</label>
          <input value={profile.username} disabled className="input-field opacity-50" />
        </div>

        <div>
          <label htmlFor="displayName" className="label-field">Display name</label>
          <input id="displayName" name="displayName" defaultValue={profile.display_name} required className="input-field" />
        </div>

        <div>
          <label htmlFor="bio" className="label-field">Bio</label>
          <textarea id="bio" name="bio" defaultValue={profile.bio} rows={4} className="input-field" />
        </div>
      </div>

      {state.error && (
        <p className="mt-4 rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm font-medium text-coral">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending || uploadingAvatar || uploadingBanner}
        className="btn-primary mt-6 px-6 py-2.5"
      >
        {pending ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
