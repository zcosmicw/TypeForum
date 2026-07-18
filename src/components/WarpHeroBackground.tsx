"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Warp = dynamic(() => import("@/components/ui/warp"), { ssr: false });

const preset = {
  fit: "none",
  scale: 1.2,
  rotation: 45,
  offsetX: 0,
  offsetY: 0,
  originX: 0.5,
  originY: 0.5,
  worldWidth: 0,
  worldHeight: 0,
  speed: 0.5,
  frame: 0,
  colors: ["#09090b", "#18181b", "#f0c000", "#1e1e22"],
  proportion: 0.4,
  softness: 0.8,
  distortion: 0.2,
  swirl: 0.6,
  swirlIterations: 8,
  shapeScale: 0.15,
  shape: "checks",
};

export default function WarpHeroBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
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
