"use client";

import { useState, useTransition } from "react";
import { updateSiteSettingsAction } from "@/lib/actions/admin";

interface SiteSettingsData {
  site_name: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_description: string;
  categories_description: string;
  footer_main: string;
  footer_sub: string;
}

interface AdminSiteSettingsFormProps {
  initialSettings: SiteSettingsData | null;
}

export function AdminSiteSettingsForm({ initialSettings }: AdminSiteSettingsFormProps) {
  const [settings, setSettings] = useState<SiteSettingsData>({
    site_name: initialSettings?.site_name ?? "TypeForum",
    hero_eyebrow: initialSettings?.hero_eyebrow ?? "Welcome to the town",
    hero_title: initialSettings?.hero_title ?? "Welcome to the [ultimate discussion] platform.",
    hero_description: initialSettings?.hero_description ?? "Topics, discussions, categories, rankings, and a store — all in one generic platform.",
    categories_description: initialSettings?.categories_description ?? "Category 1, Category 2, Category 3, Category 4, and more.",
    footer_main: initialSettings?.footer_main ?? "looks, health, and self-improvement.",
    footer_sub: initialSettings?.footer_sub ?? "Discuss. Share. Connect.",
  });

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (field: keyof SiteSettingsData, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!settings.site_name.trim()) {
      alert("Website name is required.");
      return;
    }

    startTransition(async () => {
      setMessage(null);
      try {
        await updateSiteSettingsAction(settings);
        setMessage({ type: "success", text: "Website settings saved successfully!" });
      } catch (err: any) {
        setMessage({ type: "error", text: err.message || "Failed to update website settings." });
      }
    });
  };

  return (
    <div className="panel-border rounded-xl border border-white/10 surface-panel p-5 mb-8">
      <h2 className="mb-4 font-semibold text-white">Website Content Settings</h2>
      <p className="text-xs text-slate-500 mb-6">
        Edit global copy and layouts across the main pages, navigation header, and footer. Use square brackets like <code className="text-brand-amber-soft font-mono">[word]</code> in the Hero Title field to apply a neon highlight gradient on specific words.
      </p>

      {message && (
        <p
          className={`mb-6 text-sm font-medium ${
            message.type === "success" ? "text-emerald-400" : "text-red-500"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="space-y-5">
        {/* Site Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Website Name
          </label>
          <input
            type="text"
            value={settings.site_name}
            onChange={(e) => handleChange("site_name", e.target.value)}
            placeholder="TypeForum"
            className="w-full rounded-lg border border-white/10 bg-slate-900 text-slate-100 px-3.5 py-2 text-xs focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          />
        </div>

        {/* Hero Eyebrow */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Hero Section Eyebrow Text
          </label>
          <input
            type="text"
            value={settings.hero_eyebrow}
            onChange={(e) => handleChange("hero_eyebrow", e.target.value)}
            placeholder="Welcome to the town"
            className="w-full rounded-lg border border-white/10 bg-slate-900 text-slate-100 px-3.5 py-2 text-xs focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          />
        </div>

        {/* Hero Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Hero Section Title
          </label>
          <input
            type="text"
            value={settings.hero_title}
            onChange={(e) => handleChange("hero_title", e.target.value)}
            placeholder="Welcome to the [ultimate discussion] platform."
            className="w-full rounded-lg border border-white/10 bg-slate-900 text-slate-100 px-3.5 py-2 text-xs focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          />
        </div>

        {/* Hero Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Hero Section Description
          </label>
          <textarea
            value={settings.hero_description}
            onChange={(e) => handleChange("hero_description", e.target.value)}
            placeholder="Topics, discussions, categories, rankings, and a store..."
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-slate-900 text-slate-100 px-3.5 py-2 text-xs focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal resize-none"
          />
        </div>

        {/* Categories description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Categories Subtitle Copy
          </label>
          <input
            type="text"
            value={settings.categories_description}
            onChange={(e) => handleChange("categories_description", e.target.value)}
            placeholder="Category 1, Category 2, Category 3, Category 4, and more."
            className="w-full rounded-lg border border-white/10 bg-slate-900 text-slate-100 px-3.5 py-2 text-xs focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          />
        </div>

        {/* Footer main */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Footer Main Description
          </label>
          <input
            type="text"
            value={settings.footer_main}
            onChange={(e) => handleChange("footer_main", e.target.value)}
            placeholder="looks, health, and self-improvement."
            className="w-full rounded-lg border border-white/10 bg-slate-900 text-slate-100 px-3.5 py-2 text-xs focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          />
        </div>

        {/* Footer sub */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Footer Sub/Motto Copy
          </label>
          <input
            type="text"
            value={settings.footer_sub}
            onChange={(e) => handleChange("footer_sub", e.target.value)}
            placeholder="Discuss. Share. Connect."
            className="w-full rounded-lg border border-white/10 bg-slate-900 text-slate-100 px-3.5 py-2 text-xs focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          />
        </div>
      </div>

      <button
        type="button"
        disabled={isPending}
        onClick={handleSave}
        className="mt-6 rounded-lg bg-gradient-to-r from-teal-600 to-teal-400 px-4 py-2 text-sm font-semibold text-white hover:scale-[1.02] hover:shadow-[0_0_12px_rgba(45,212,191,0.3)] transition-all disabled:opacity-60 disabled:scale-100 disabled:shadow-none cursor-pointer"
      >
        {isPending ? "Saving..." : "Save Content Settings"}
      </button>
    </div>
  );
}
