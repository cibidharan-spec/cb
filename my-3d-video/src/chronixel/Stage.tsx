import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { chronixel as C } from "./theme";

// LIGHT "editorial studio" stage — a warm paper backdrop lit by a soft spotlight that
// gently brightens the focal area, with a faint dot grid, a warm floor glow, and an
// edge vignette that keeps the type crisp. No glass, no nodes — the type is the subject.
export const Stage: React.FC<{
  focusX?: number;
  focusY?: number;
  tighten?: number; // 0..1, narrows the spotlight
}> = ({ focusX = 50, focusY = 46, tighten = 0 }) => {
  const frame = useCurrentFrame();
  const driftX = focusX + Math.sin(frame / 70) * 2.5;
  const driftY = focusY + Math.cos(frame / 90) * 1.8;
  const spread = interpolate(tighten, [0, 1], [80, 55]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.color.void }}>
      {/* faint dot grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${C.color.grid} 1.5px, transparent 1.5px)`,
          backgroundSize: "46px 46px",
          opacity: 0.6,
          maskImage:
            "radial-gradient(100% 80% at 50% 50%, black 30%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(100% 80% at 50% 50%, black 30%, transparent 85%)",
        }}
      />
      {/* soft spotlight — brightens the focal area */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(${spread}% ${spread}% at ${driftX}% ${driftY}%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.35) 38%, transparent 72%)`,
        }}
      />
      {/* warm floor glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 45% at 50% 116%, ${C.color.orangeGlow} 0%, transparent 62%)`,
          opacity: 0.6,
        }}
      />
      {/* edge vignette (warm) */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(135% 108% at 50% 45%, transparent 46%, ${C.color.voidDeep} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
