import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { chronixel as C } from "./theme";

// LIGHT studio backdrop + faint blueprint grid + soft warm floor glow + gentle edge
// vignette. The grid drifts slowly and the glow breathes, so the frame is never static.
export const Backdrop: React.FC<{ glow?: "orange" | "danger" | "success" }> = ({
  glow = "orange",
}) => {
  const frame = useCurrentFrame();

  const drift = interpolate(frame, [0, 300], [0, 44]);
  const breathe = interpolate(Math.sin(frame / 32), [-1, 1], [0.3, 0.55]);

  const glowColor =
    glow === "danger"
      ? C.color.dangerGlow
      : glow === "success"
        ? C.color.successGlow
        : C.color.orangeGlow;

  return (
    <AbsoluteFill style={{ backgroundColor: C.color.void }}>
      {/* Blueprint grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.color.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.color.grid} 1px, transparent 1px)`,
          backgroundSize: "88px 88px",
          backgroundPosition: `${drift}px ${drift * 0.6}px`,
          maskImage:
            "radial-gradient(120% 90% at 50% 45%, black 40%, transparent 92%)",
          WebkitMaskImage:
            "radial-gradient(120% 90% at 50% 45%, black 40%, transparent 92%)",
        }}
      />
      {/* Warm floor glow, breathing */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(90% 60% at 50% 118%, ${glowColor} 0%, transparent 60%)`,
          opacity: breathe,
        }}
      />
      {/* Soft top key light (warm white) */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 55% at 50% 6%, rgba(255,255,255,0.7) 0%, transparent 70%)`,
        }}
      />
      {/* Gentle edge vignette (warm) */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(135% 105% at 50% 46%, transparent 52%, ${C.color.voidDeep} 100%)`,
          opacity: 0.9,
        }}
      />
    </AbsoluteFill>
  );
};
