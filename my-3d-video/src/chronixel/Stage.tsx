import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { chronixel as C } from "./theme";

// "Kinetic Editorial" stage — a dark cinematic void lit by a single soft spotlight
// that drifts, plus a faint dot grid and a low orange floor glow. No blueprint grid,
// no glass — the type is the subject; this only lights the stage.
export const Stage: React.FC<{
  // spotlight focus in %, can drift over the scene
  focusX?: number;
  focusY?: number;
  tighten?: number; // 0..1, narrows the spotlight
}> = ({ focusX = 50, focusY = 46, tighten = 0 }) => {
  const frame = useCurrentFrame();
  const driftX = focusX + Math.sin(frame / 70) * 2.5;
  const driftY = focusY + Math.cos(frame / 90) * 1.8;
  const spread = interpolate(tighten, [0, 1], [78, 52]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.color.void }}>
      {/* faint dot grid (subtle nod to the Chronixel grid) */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${C.color.grid} 1.5px, transparent 1.5px)`,
          backgroundSize: "46px 46px",
          opacity: 0.5,
          maskImage:
            "radial-gradient(100% 80% at 50% 50%, black 30%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(100% 80% at 50% 50%, black 30%, transparent 85%)",
        }}
      />
      {/* soft spotlight */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(${spread}% ${spread}% at ${driftX}% ${driftY}%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.035) 35%, transparent 70%)`,
        }}
      />
      {/* low orange floor glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 45% at 50% 116%, ${C.color.orangeGlow} 0%, transparent 62%)`,
          opacity: 0.5,
        }}
      />
      {/* cinematic vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(135% 105% at 50% 45%, transparent 48%, ${C.color.voidDeep} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
