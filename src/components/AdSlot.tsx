import { createClient } from "@/lib/supabase/server";

type AdSlotProps = {
  variant?: "banner" | "sidebar" | "in-feed";
  label?: string;
};

export async function AdSlot({ variant = "banner", label = "Sponsored" }: AdSlotProps) {
  const supabase = await createClient();
  if (!supabase) return null;

  // Fetch global ad config from database
  const { data: config } = await supabase
    .from("ad_config")
    .select("enabled, image_url")
    .eq("id", 1)
    .maybeSingle();

  // If configuration exists and enabled is false, do not display the ad slot
  if (config && !config.enabled) {
    return null;
  }

  const styles = {
    banner: "h-24 w-full",
    sidebar: "h-64 w-full",
    "in-feed": "h-32 w-full",
  };

  // If a custom banner image or gif has been uploaded for the banner ad, show it
  if (variant === "banner" && config?.image_url) {
    return (
      <div className={`relative overflow-hidden rounded-xl border border-white/10 ${styles.banner}`}>
        <img
          src={config.image_url}
          alt="Advertisement Banner"
          className="h-full w-full object-cover"
        />
        <div className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-300 pointer-events-none select-none">
          {label}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`panel-border flex items-center justify-center rounded-xl border border-dashed border-white/10 bg-gradient-to-br from-slate-800 to-teal-900/15 ${styles[variant]}`}
    >
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {variant === "banner" && "Banner ad placement"}
          {variant === "sidebar" && "Sidebar ad placement"}
          {variant === "in-feed" && "In-feed sponsored content"}
        </p>
      </div>
    </div>
  );
}
