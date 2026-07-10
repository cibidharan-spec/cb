import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { chronixel as C } from "./theme";

// Dark cinematic void + faint blueprint grid + slow orange horizon glow + vignette.
// The grid drifts very slowly and the glow breathes, so the frame never feels static.
export const Backdrop: React.FC<{ glow?: "orange" | "danger" | "success" }> = ({
  glow = "orange",
}) => {
  const frame = useCurrentFrame();

  const drift = interpolate(frame, [0, 300], [0, 44]);
  const breathe = interpolate(
    Math.sin(frame / 32),
    [-1, 1],
    [0.42, 0.72],
  );

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
      {/* Orange horizon glow, breathing */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(90% 60% at 50% 118%, ${glowColor} 0%, transparent 60%)`,
          opacity: breathe,
        }}
      />
      {/* Top-left key light */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(45% 45% at 22% 12%, rgba(255,255,255,0.05) 0%, transparent 70%)`,
        }}
      />
      {/* Cinematic vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(130% 100% at 50% 50%, transparent 55%, ${C.color.voidDeep} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
