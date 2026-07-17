import { createClient } from "@/lib/supabase/server";

type AdSlotProps = {
  variant?: "banner" | "sidebar" | "in-feed";
  label?: string;
};

export async function AdSlot({ variant = "banner", label = "Sponsored" }: AdSlotProps) {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: config } = await supabase
    .from("ad_config")
    .select("enabled, image_url")
    .eq("id", 1)
    .maybeSingle();

  if (config && !config.enabled) return null;

  const styles = {
    banner: "h-20 w-full",
    sidebar: "h-56 w-full",
    "in-feed": "h-28 w-full",
  };

  if (variant === "banner" && config?.image_url) {
    return (
      <div className={`relative overflow-hidden rounded-lg ${styles.banner}`}>
        <img src={config.image_url} alt="Advertisement" className="h-full w-full object-cover" />
        <div className="absolute right-2 top-2 rounded bg-bg-root/80 px-1.5 py-0.5 text-[10px] font-medium text-text-ghost">
          {label}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-border-default bg-bg-surface/50 ${styles[variant]}`}>
      <p className="text-[11px] font-medium text-text-ghost">{label}</p>
    </div>
  );
}
