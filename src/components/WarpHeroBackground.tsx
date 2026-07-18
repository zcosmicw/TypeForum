"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Warp = dynamic(() => import("@/components/ui/warp"), { ssr: false });

export default function WarpHeroBackground() {
  const [mounted, setMounted] = useState(false);
  const [preset, setPreset] = useState<any>(null);

  useEffect(() => {
    import("@paper-design/shaders-react").then((mod) => {
      if (mod.warpPresets && mod.warpPresets.length > 0) {
        setPreset(mod.warpPresets[0].params);
      }
    });
    setMounted(true);
  }, []);

  if (!mounted || !preset) {
    return <div className="absolute inset-0 bg-bg-surface" />;
  }

  return (
    <Warp
      {...(preset as any)}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity: 0.45,
      }}
    />
  );
}
