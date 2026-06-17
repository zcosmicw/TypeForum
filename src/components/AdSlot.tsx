type AdSlotProps = {
  variant?: "banner" | "sidebar" | "in-feed";
  label?: string;
};

export function AdSlot({ variant = "banner", label = "Sponsored" }: AdSlotProps) {
  const styles = {
    banner: "h-24 w-full",
    sidebar: "h-64 w-full",
    "in-feed": "h-32 w-full",
  };

  return (
    <div
      className={`neon-border flex items-center justify-center rounded-xl border border-dashed border-white/10 bg-gradient-to-br from-slate-800 to-purple-900/20 ${styles[variant]}`}
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
        <p className="mt-2 text-xs text-brand-purple-soft">
          Premium members see fewer ads
        </p>
      </div>
    </div>
  );
}
