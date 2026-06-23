"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { rankColors, rankLabels as defaultRankLabels } from "@/lib/rankings";
import type { UserRank } from "@/lib/types";

// In-memory global cache to share rank labels across all badge instances instantly
let globalRankLabelsCache: Record<string, string> | null = null;
let globalRankLabelsPromise: Promise<Record<string, string>> | null = null;

async function getOrFetchRankLabels(): Promise<Record<string, string>> {
  if (globalRankLabelsCache) {
    return globalRankLabelsCache;
  }
  if (globalRankLabelsPromise) {
    return globalRankLabelsPromise;
  }

  globalRankLabelsPromise = (async () => {
    try {
      const supabase = createClient();
      if (!supabase) return defaultRankLabels;

      const { data, error } = await supabase.from("rank_config").select("rank_key, label");
      if (error) throw error;

      if (data && data.length > 0) {
        const cache: Record<string, string> = {};
        data.forEach((row) => {
          cache[row.rank_key] = row.label;
        });
        globalRankLabelsCache = cache;
        return cache;
      }
    } catch (err) {
      console.error("Failed to load rank configurations:", err);
    }
    return defaultRankLabels;
  })();

  return globalRankLabelsPromise;
}

export function RankBadge({ rank, size = "md" }: { rank: UserRank; size?: "sm" | "md" }) {
  const [labels, setLabels] = useState<Record<string, string>>(globalRankLabelsCache || defaultRankLabels);

  useEffect(() => {
    if (!globalRankLabelsCache) {
      getOrFetchRankLabels().then((fetched) => {
        setLabels(fetched);
      });
    }
  }, []);

  const label = labels[rank] || defaultRankLabels[rank] || rank;

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${rankColors[rank] || "bg-slate-800 text-slate-400"} ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      {label}
    </span>
  );
}
