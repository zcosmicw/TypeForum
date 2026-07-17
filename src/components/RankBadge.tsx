"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { rankColors, rankLabels as defaultRankLabels } from "@/lib/rankings";
import type { UserRank } from "@/lib/types";

let globalRankLabelsCache: Record<string, string> | null = null;
let globalRankLabelsPromise: Promise<Record<string, string>> | null = null;

async function getOrFetchRankLabels(): Promise<Record<string, string>> {
  if (globalRankLabelsCache) return globalRankLabelsCache;
  if (globalRankLabelsPromise) return globalRankLabelsPromise;

  globalRankLabelsPromise = (async () => {
    try {
      const supabase = createClient();
      if (!supabase) return defaultRankLabels;
      const { data, error } = await supabase.from("rank_config").select("rank_key, label");
      if (error) throw error;
      if (data && data.length > 0) {
        const cache: Record<string, string> = {};
        data.forEach((row) => { cache[row.rank_key] = row.label; });
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

const rankStyles: Record<string, string> = {
  admin: "bg-coral/15 text-coral border-coral/25",
  moderator: "bg-accent-ghost text-accent border-accent/20",
  veteran: "bg-steel/15 text-steel border-steel/25",
  member: "bg-bg-elevated text-text-secondary border-border-default",
  newbie: "bg-bg-surface text-text-muted border-border-subtle",
};

export function RankBadge({ rank, size = "md" }: { rank: UserRank; size?: "sm" | "md" }) {
  const [labels, setLabels] = useState<Record<string, string>>(globalRankLabelsCache || defaultRankLabels);

  useEffect(() => {
    if (!globalRankLabelsCache) {
      getOrFetchRankLabels().then(setLabels);
    }
  }, []);

  const label = labels[rank] || defaultRankLabels[rank] || rank;
  const style = rankStyles[rank] || rankStyles.member;

  return (
    <span
      className={`inline-flex items-center justify-center rounded border font-semibold mono ${style} ${
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]"
      }`}
    >
      {label}
    </span>
  );
}
