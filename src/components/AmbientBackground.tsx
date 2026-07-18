"use client";

import { useEffect, useState } from "react";

export default function AmbientBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="absolute inset-0 bg-[#09090b]" />;
  }

  return (
    <div className="absolute inset-0 bg-[#09090b] overflow-hidden">
      {/* Fine Editorial Dot Grid */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
      
      {/* Soft Ambient Shifting Gradients */}
      <div 
        className="absolute w-[60%] h-[60%] rounded-full bg-accent/8 blur-[100px] pointer-events-none animate-ambient-1"
        style={{
          top: "-15%",
          left: "-10%",
        }}
      />
      <div 
        className="absolute w-[50%] h-[50%] rounded-full bg-[#6b9bd2]/6 blur-[120px] pointer-events-none animate-ambient-2"
        style={{
          bottom: "-10%",
          right: "-10%",
        }}
      />

      {/* Dark Blending Overlay */}
      <div className="absolute inset-0 bg-[#09090b]/35 pointer-events-none" />
    </div>
  );
}
