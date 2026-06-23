"use client";

import { useState, useRef, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateAdConfigAction } from "@/lib/actions/admin";

interface AdminAdSettingsFormProps {
  initialConfig: {
    enabled: boolean;
    image_url: string | null;
  } | null;
}

export function AdminAdSettingsForm({ initialConfig }: AdminAdSettingsFormProps) {
  const [enabled, setEnabled] = useState(initialConfig?.enabled ?? true);
  const [imageUrl, setImageUrl] = useState<string | null>(initialConfig?.image_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image or GIF file.");
      return;
    }

    setUploading(true);
    setMessage(null);

    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = async () => {
      // Dimension verification check: 970x90 Billboard standard
      if (img.width !== 970 || img.height !== 90) {
        const proceed = window.confirm(
          `The selected file has dimensions of ${img.width}x${img.height}px. The recommended billboard ad dimension is exactly 970x90px. Do you want to upload it anyway?`
        );
        if (!proceed) {
          setUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
      }

      // Proceed with storage upload
      try {
        const supabase = createClient();
        if (!supabase) throw new Error("Supabase is not configured.");

        const fileExt = file.name.split(".").pop();
        const filePath = `ad-${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from("ads")
          .upload(filePath, file, { cacheControl: "3600", upsert: true });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from("ads")
          .getPublicUrl(filePath);

        setImageUrl(publicUrl);
        setMessage({ type: "success", text: "Banner uploaded successfully! Make sure to click Save Settings." });
      } catch (err: any) {
        console.error(err);
        setMessage({ type: "error", text: err.message || "Failed to upload file." });
      } finally {
        setUploading(false);
      }
    };

    img.onerror = () => {
      alert("Failed to load the image. Please verify it is a valid image or GIF.");
      setUploading(false);
    };
  };

  const handleSave = () => {
    startTransition(async () => {
      setMessage(null);
      try {
        await updateAdConfigAction(enabled, imageUrl);
        setMessage({ type: "success", text: "Ad configurations updated successfully!" });
      } catch (err: any) {
        setMessage({ type: "error", text: err.message || "Failed to save settings." });
      }
    });
  };

  return (
    <div className="neon-border rounded-xl border border-white/10 glass-panel p-5 mb-8">
      <h2 className="mb-4 font-semibold text-white">Ad Space Settings</h2>
      
      <div className="space-y-6">
        {/* Toggle ad config */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-semibold text-slate-200">Enable Ad Space globally</label>
            <p className="text-xs text-slate-500 mt-1">
              Toggle this option to display or hide ads across the platform.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              enabled ? "bg-brand-purple-neon" : "bg-slate-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Upload ad banner */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Ad Banner Image / GIF
          </label>
          
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="relative h-28 w-full rounded-xl overflow-hidden border border-dashed border-white/20 bg-slate-950/40 hover:bg-slate-900/40 hover:border-brand-purple-neon/50 transition-all cursor-pointer flex flex-col items-center justify-center group"
          >
            {imageUrl ? (
              <img src={imageUrl} alt="Ad Banner Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="text-center p-4">
                <span className="text-3xl text-slate-500">📺</span>
                <p className="text-xs text-slate-400 mt-2 font-medium">Click to upload ad banner</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Recommended size: 970x90px (GIF, PNG, JPG)</p>
              </div>
            )}
            
            {uploading && (
              <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-xs font-semibold text-white">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mb-1.5" />
                Uploading Banner...
              </div>
            )}

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-white uppercase tracking-wider backdrop-blur-[2px]">
              Change Ad Banner
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {imageUrl && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setImageUrl(null)}
              className="text-xs font-semibold text-red-400 hover:text-red-300 hover:underline transition-all cursor-pointer"
            >
              Remove ad banner asset
            </button>
          </div>
        )}
      </div>

      {message && (
        <p
          className={`mt-4 text-sm font-medium ${
            message.type === "success" ? "text-emerald-400" : "text-red-500"
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="button"
        disabled={isPending || uploading}
        onClick={handleSave}
        className="mt-6 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(191,0,255,0.4)] transition-all disabled:opacity-60 disabled:scale-100 disabled:shadow-none cursor-pointer"
      >
        {isPending ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
