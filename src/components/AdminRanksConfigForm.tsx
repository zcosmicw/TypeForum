"use client";

import { useState, useTransition } from "react";
import { updateRankLabelsAction } from "@/lib/actions/admin";

interface RankConfigItem {
  rank_key: string;
  label: string;
}

interface AdminRanksConfigFormProps {
  initialRanks: RankConfigItem[];
}

export function AdminRanksConfigForm({ initialRanks }: AdminRanksConfigFormProps) {
  const [ranks, setRanks] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    initialRanks.forEach((r) => {
      map[r.rank_key] = r.label;
    });
    return map;
  });

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleLabelChange = (key: string, value: string) => {
    setRanks((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const values = Object.values(ranks);
    if (values.some((v) => !v.trim())) {
      alert("All rank titles must be defined.");
      return;
    }

    startTransition(async () => {
      setMessage(null);
      try {
        await updateRankLabelsAction(ranks);
        setMessage({ type: "success", text: "User rank titles updated successfully!" });
      } catch (err: any) {
        setMessage({ type: "error", text: err.message || "Failed to update rank labels." });
      }
    });
  };

  const rankKeys = ["rank1", "rank2", "rank3", "rank4", "rank5"];
  const originalNames: Record<string, string> = {
    rank1: "Rank 1 (Default)",
    rank2: "Rank 2 (Default)",
    rank3: "Rank 3 (Default)",
    rank4: "Rank 4 (Default)",
    rank5: "Rank 5 (Default)",
  };

  return (
    <div className="panel-border rounded-xl border border-white/10 surface-panel p-5 mb-8">
      <h2 className="mb-4 font-semibold text-white">Custom User Rank Titles</h2>
      <p className="text-xs text-slate-500 mb-6">
        Customize the display titles for the platform's user ranks. These labels reflect immediately on all badges across the site.
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

      <div className="space-y-4">
        {rankKeys.map((key) => (
          <div key={key} className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="w-36 shrink-0">
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                {originalNames[key]}
              </span>
            </div>
            
            <div className="flex-1">
              <input
                type="text"
                value={ranks[key] ?? ""}
                onChange={(e) => handleLabelChange(key, e.target.value)}
                placeholder={`Name for ${key}`}
                className="w-full rounded-lg border border-white/10 bg-slate-900 text-slate-100 px-3 py-1.5 text-xs focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={isPending}
        onClick={handleSave}
        className="mt-6 rounded-lg bg-gradient-to-r from-teal-600 to-teal-400 px-4 py-2 text-sm font-semibold text-white hover:scale-[1.02] hover:shadow-[0_0_12px_rgba(45,212,191,0.3)] transition-all disabled:opacity-60 disabled:scale-100 disabled:shadow-none cursor-pointer"
      >
        {isPending ? "Saving..." : "Save Rank Labels"}
      </button>
    </div>
  );
}
