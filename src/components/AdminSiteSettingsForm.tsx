"use client";

import { useActionState, useRef, useState } from "react";
import { updateSiteSettings, type ActionState } from "@/lib/actions/admin";
import { createClient } from "@/lib/supabase/client";

const initialState: ActionState = {};

export function AdminSiteSettingsForm({ settings }: { settings: any }) {
  const [state, formAction, pending] = useActionState(updateSiteSettings, initialState);

  const [heroImage, setHeroImage] = useState(settings?.hero_image || "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Max 5MB");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase is not configured.");

      const fileExt = file.name.split(".").pop();
      const filePath = `site_settings/hero-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("assets")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from("assets").getPublicUrl(filePath);
      setHeroImage(publicUrl);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form action={formAction} className="card p-6">
      <h2 className="mb-6 text-lg font-semibold text-text-primary">Site identity & content</h2>

      <div className="space-y-6">
        <div>
          <label htmlFor="siteName" className="label-field">Site name</label>
          <input id="siteName" name="siteName" defaultValue={settings?.site_name} className="input-field" />
        </div>

        <div className="border-t border-border-subtle pt-6">
          <h3 className="mb-4 section-label text-accent">Hero Section</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="heroEyebrow" className="label-field">Eyebrow text</label>
              <input id="heroEyebrow" name="heroEyebrow" defaultValue={settings?.hero_eyebrow} placeholder="e.g. Welcome to the town" className="input-field" />
            </div>
            <div>
              <label htmlFor="heroTitle" className="label-field">Main title (use [brackets] for accent highlight)</label>
              <input id="heroTitle" name="heroTitle" defaultValue={settings?.hero_title} placeholder="e.g. Welcome to the [ultimate discussion] platform." className="input-field" />
            </div>
            <div>
              <label htmlFor="heroDescription" className="label-field">Description</label>
              <textarea id="heroDescription" name="heroDescription" defaultValue={settings?.hero_description} rows={3} className="input-field" />
            </div>
          </div>
        </div>

        <div className="border-t border-border-subtle pt-6">
          <h3 className="mb-4 section-label text-accent">Categories Section</h3>
          <div>
            <label htmlFor="categoriesDescription" className="label-field">Section description</label>
            <input id="categoriesDescription" name="categoriesDescription" defaultValue={settings?.categories_description} className="input-field" />
          </div>
        </div>

        <div className="border-t border-border-subtle pt-6">
          <h3 className="mb-4 section-label text-accent">Footer Content</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="footerMain" className="label-field">Main text</label>
              <input id="footerMain" name="footerMain" defaultValue={settings?.footer_main} className="input-field" />
            </div>
            <div>
              <label htmlFor="footerSub" className="label-field">Sub text</label>
              <input id="footerSub" name="footerSub" defaultValue={settings?.footer_sub} className="input-field" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-border-subtle pt-6">
        {state.error && <p className="mb-4 rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm font-medium text-coral">{state.error}</p>}
        {state.success && <p className="mb-4 rounded-lg border border-sage/30 bg-sage/10 px-3 py-2 text-sm font-medium text-sage">Settings saved successfully.</p>}

        <button type="submit" disabled={pending || uploading} className="btn-primary px-6 py-2.5">
          {pending ? "Saving..." : "Save site settings"}
        </button>
      </div>
    </form>
  );
}
