"use client";

import { useState, useTransition } from "react";
import { updateCategoryAction, updateSubforumAction } from "@/lib/actions/admin";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Subforum {
  id: string;
  category_id: string;
  name: string;
  slug: string;
}

interface AdminForumConfigFormProps {
  categories: Category[];
  subforums: Subforum[];
}

export function AdminForumConfigForm({ categories: initialCategories, subforums: initialSubforums }: AdminForumConfigFormProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [subforums, setSubforums] = useState(initialSubforums);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleCategoryFieldChange = (id: string, field: "name" | "slug", value: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleSubforumFieldChange = (id: string, field: "name" | "slug", value: string) => {
    setSubforums((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSaveCategory = (id: string, name: string, slug: string) => {
    if (!name.trim() || !slug.trim()) {
      alert("Category Name and Slug are required.");
      return;
    }
    startTransition(async () => {
      setMessage(null);
      try {
        await updateCategoryAction(id, name.trim(), slug.trim());
        setMessage({ type: "success", text: `Category "${name}" updated successfully!` });
      } catch (err: any) {
        setMessage({ type: "error", text: err.message || "Failed to update category." });
      }
    });
  };

  const handleSaveSubforum = (id: string, name: string, slug: string) => {
    if (!name.trim() || !slug.trim()) {
      alert("Subforum Name and Slug are required.");
      return;
    }
    startTransition(async () => {
      setMessage(null);
      try {
        await updateSubforumAction(id, name.trim(), slug.trim());
        setMessage({ type: "success", text: `Subforum "${name}" updated successfully!` });
      } catch (err: any) {
        setMessage({ type: "error", text: err.message || "Failed to update subforum." });
      }
    });
  };

  return (
    <div className="neon-border rounded-xl border border-white/10 glass-panel p-5 mb-8">
      <h2 className="mb-4 font-semibold text-white">Forums Layout Editor</h2>
      <p className="text-xs text-slate-500 mb-6">
        Edit the names and slugs of categories and subforums. Changing slugs will update URL routes instantly.
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

      <div className="space-y-6">
        {categories.map((category) => {
          const categorySubforums = subforums.filter((s) => s.category_id === category.id);
          
          return (
            <div key={category.id} className="border border-white/5 bg-slate-950/20 rounded-xl p-4.5 space-y-4">
              {/* Category Info Form row */}
              <div className="flex flex-col gap-3 md:flex-row md:items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-xs font-bold text-brand-purple-soft uppercase tracking-wider block mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => handleCategoryFieldChange(category.id, "name", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-900 text-slate-100 px-3 py-1.5 text-xs focus:border-brand-purple-neon focus:outline-none focus:ring-1 focus:ring-brand-purple-neon"
                  />
                </div>

                <div className="flex-1 min-w-[150px]">
                  <label className="text-xs font-bold text-brand-purple-soft uppercase tracking-wider block mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={category.slug}
                    onChange={(e) => handleCategoryFieldChange(category.id, "slug", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-900 text-slate-100 px-3 py-1.5 text-xs focus:border-brand-purple-neon focus:outline-none focus:ring-1 focus:ring-brand-purple-neon"
                  />
                </div>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSaveCategory(category.id, category.name, category.slug)}
                  className="rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-1.5 text-xs font-semibold text-white transition-all disabled:opacity-50 shrink-0 cursor-pointer h-[30px]"
                >
                  Save Category
                </button>
              </div>

              {/* Subforums inside this category */}
              {categorySubforums.length > 0 && (
                <div className="pl-4 border-l border-white/10 space-y-3.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                    Subforums
                  </span>
                  
                  {categorySubforums.map((subforum) => (
                    <div key={subforum.id} className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
                      <div className="flex-1 min-w-[150px]">
                        <input
                          type="text"
                          value={subforum.name}
                          onChange={(e) => handleSubforumFieldChange(subforum.id, "name", e.target.value)}
                          placeholder="Subforum Name"
                          className="w-full rounded-lg border border-white/10 bg-slate-900/50 text-slate-300 px-3 py-1 text-xs focus:border-brand-purple-neon focus:outline-none"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-[120px]">
                        <input
                          type="text"
                          value={subforum.slug}
                          onChange={(e) => handleSubforumFieldChange(subforum.id, "slug", e.target.value)}
                          placeholder="subforum-slug"
                          className="w-full rounded-lg border border-white/10 bg-slate-900/50 text-slate-300 px-3 py-1 text-xs focus:border-brand-purple-neon focus:outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleSaveSubforum(subforum.id, subforum.name, subforum.slug)}
                        className="rounded bg-slate-800/80 hover:bg-slate-700/80 px-3 py-1 text-[11px] font-medium text-slate-300 border border-white/5 transition-all disabled:opacity-50 shrink-0 cursor-pointer h-[26px]"
                      >
                        Save Subforum
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
