"use client";

import { useActionState, useState, useRef } from "react";
import { updateProfile, type ActionState } from "@/lib/actions/forum";
import type { DbProfile } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";

const initialState: ActionState = {};

export function ProfileSettingsForm({ profile }: { profile: DbProfile }) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);

  // Profile Avatar and Banner upload state management
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [bannerUrl, setBannerUrl] = useState(profile.banner_url || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Directly upload chosen images to Supabase Storage client-side
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
      if (!supabase) {
        throw new Error("Supabase is not configured.");
      }

      // Safe filepath structure
      const fileExt = file.name.split(".").pop();
      const filePath = `${profile.id}/${type}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setUrl(publicUrl);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      action={formAction}
      className="panel-border rounded-xl border border-white/10 surface-panel p-5"
    >
      <h2 className="mb-4 font-semibold text-white">Profile Settings</h2>
      
      {/* Hidden input tags synchronizing state with standard Next.js form action */}
      <input type="hidden" name="avatarUrl" value={avatarUrl} />
      <input type="hidden" name="bannerUrl" value={bannerUrl} />

      <div className="space-y-5">
        {/* Banner Upload Section */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Profile Banner</label>
          <div 
            onClick={() => !uploadingBanner && bannerInputRef.current?.click()}
            className="relative h-36 w-full rounded-xl overflow-hidden border border-dashed border-white/20 bg-slate-950/40 hover:bg-slate-900/40 hover:border-brand-teal/50 transition-all cursor-pointer flex items-center justify-center group"
          >
            {bannerUrl ? (
              <img src={bannerUrl} alt="Banner Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="text-center p-4">
                <span className="text-3xl text-slate-500">🌅</span>
                <p className="text-xs text-slate-500 mt-1.5">Click to upload banner image</p>
              </div>
            )}
            {uploadingBanner && (
              <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-xs font-semibold text-white">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mb-1.5" />
                Uploading...
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-white uppercase tracking-wider backdrop-blur-[2px]">
              Change Banner
            </div>
          </div>
          <input 
            ref={bannerInputRef}
            type="file" 
            accept="image/*" 
            onChange={(e) => uploadFile(e, "banner")} 
            className="hidden" 
          />
        </div>

        {/* Avatar Upload Section */}
        <div className="flex items-center gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Profile Picture</label>
            <div 
              onClick={() => !uploadingAvatar && avatarInputRef.current?.click()}
              className="relative h-20 w-20 rounded-2xl overflow-hidden border border-dashed border-white/20 bg-slate-950/40 hover:bg-slate-900/40 hover:border-brand-teal/50 transition-all cursor-pointer flex items-center justify-center group shrink-0"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-slate-400">
                  {profile.display_name.charAt(0).toUpperCase()}
                </span>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-[10px] font-semibold text-white">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mb-1" />
                  Uploading
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-wider text-center p-1 leading-tight backdrop-blur-[2px]">
                Change
              </div>
            </div>
            <input 
              ref={avatarInputRef}
              type="file" 
              accept="image/*" 
              onChange={(e) => uploadFile(e, "avatar")} 
              className="hidden" 
            />
          </div>
          <div className="text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-400">Upload profile avatar</p>
            <p>JPG, PNG, or WEBP formats are supported.</p>
            <p>File size limit is 5MB.</p>
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Username
          </label>
          <input
            value={profile.username}
            disabled
            className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
          />
        </div>

        {/* Display Name */}
        <div>
          <label htmlFor="displayName" className="mb-1.5 block text-sm font-medium text-slate-300">
            Display name
          </label>
          <input
            id="displayName"
            name="displayName"
            defaultValue={profile.display_name}
            required
            className="w-full rounded-lg border border-white/10 bg-slate-900 text-slate-100 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/50"
          />
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-slate-300">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={profile.bio}
            rows={4}
            className="w-full rounded-lg border border-white/10 bg-slate-900 text-slate-100 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/50"
          />
        </div>
      </div>

      {state.error && <p className="mt-3 text-sm text-red-600 font-medium">{state.error}</p>}
      
      <button
        type="submit"
        disabled={pending || uploadingAvatar || uploadingBanner}
        className="mt-5 rounded-lg bg-gradient-to-r from-teal-600 to-teal-400 px-4 py-2 text-sm font-semibold text-white hover:scale-[1.02] hover:shadow-[0_0_12px_rgba(45,212,191,0.3)] transition-all disabled:opacity-60 disabled:scale-100 disabled:shadow-none cursor-pointer"
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
