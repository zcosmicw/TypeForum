import type { UserRank } from "@/lib/types";
import { rankColors, rankLabels } from "@/lib/rankings";

export function RankBadge({ rank, size = "md" }: { rank: UserRank; size?: "sm" | "md" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${rankColors[rank]} ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      {rankLabels[rank]}
    </span>
  );
}
