"use client";

import { useActionState, useRef, useState } from "react";
import { updateAdSettings, type ActionState } from "@/lib/actions/admin";
import { createClient } from "@/lib/supabase/client";

const initialState: ActionState = {};

export function AdminAdSettingsForm({ config }: { config: any }) {
  const [state, formAction, pending] = useActionState(updateAdSettings, initialState);

  const [imageUrl, setImageUrl] = useState(config?.image_url || "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [enabled, setEnabled] = useState(config?.enabled ?? false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB.");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase is not configured.");

      const fileExt = file.name.split(".").pop();
      const filePath = `ads/banner-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("assets")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from("assets").getPublicUrl(filePath);
      setImageUrl(publicUrl);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to upload ad image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form action={formAction} className="card p-6">
      <div className="mb-6 flex items-center justify-between border-b border-border-subtle pb-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Billboard settings</h2>
          <p className="mt-1 text-sm text-text-muted">Manage global ad placements</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-text-secondary">Enabled</label>
          <input
            type="checkbox"
            name="enabled"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-border-default accent-accent cursor-pointer"
          />
        </div>
      </div>

      <input type="hidden" name="imageUrl" value={imageUrl} />

      <div className="space-y-6">
        <div>
          <label className="label-field">Banner image / GIF</label>
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="relative h-32 w-full max-w-2xl rounded-lg border border-dashed border-border-default bg-bg-root hover:border-accent transition-colors cursor-pointer flex items-center justify-center group overflow-hidden"
          >
            {imageUrl ? (
              <img src={imageUrl} alt="Ad Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="text-center p-4">
                <span className="text-2xl">🖼️</span>
                <p className="text-xs text-text-ghost mt-1.5">Click to upload ad banner</p>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-bg-root/90 flex items-center justify-center text-sm font-medium text-accent">
                Uploading...
              </div>
            )}
            <div className="absolute inset-0 bg-bg-root/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm font-medium text-accent">
              Change banner
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </div>

        <div>
          <label htmlFor="adLink" className="label-field">Target URL</label>
          <input id="adLink" name="adLink" defaultValue={config?.target_url || ""} placeholder="https:
        </div>
      </div>

      <div className="mt-8 border-t border-border-subtle pt-6">
        {state.error && <p className="mb-4 rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm font-medium text-coral">{state.error}</p>}
        {state.success && <p className="mb-4 rounded-lg border border-sage/30 bg-sage/10 px-3 py-2 text-sm font-medium text-sage">Ad settings saved.</p>}

        <button type="submit" disabled={pending || uploading} className="btn-primary px-6 py-2.5">
          {pending ? "Saving..." : "Save ad settings"}
        </button>
      </div>
    </form>
  );
}
