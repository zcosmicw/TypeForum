"use client";

import { useEffect, useState } from "react";
import Warp, { warpPresets } from "@/components/ui/warp";

export default function WarpHeroBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="absolute inset-0 bg-bg-surface" />;
  }

  const preset = warpPresets?.[0]?.params || {};

  return (
    <Warp
      {...(preset as any)}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity: 0.35,
      }}
    />
  );
}
