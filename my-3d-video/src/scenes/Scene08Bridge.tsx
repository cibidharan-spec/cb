import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { Stage } from "../chronixel/Stage";
import { Heading } from "../chronixel/ui";
import { Kicker, Numeral, Rise } from "../chronixel/editorial";
import { chronixel as C, EASE, EASE_IO } from "../chronixel/theme";

// Scene 8 — Bridge (bonus, beyond the 7-scene breakdown)
// Hands off from the intro into the tutorial body: an orange bar wipes across and
// reveals the first topic, so the video "enters" the content.

export const Scene08Bridge: React.FC = () => {
  const frame = useCurrentFrame();

  // Orange wipe sweeps left -> right, then off, revealing content behind it.
  const wipe = interpolate(frame, [0, 12, 24], [-40, 55, 130], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASE_IO),
  });
  // Content becomes visible after the leading edge passes center.
  const reveal = interpolate(frame, [10, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASE),
  });
  const push = interpolate(frame, [40, 66], [0, -30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Stage focusX={52} focusY={48} />

      {/* revealed content */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 30,
          opacity: reveal,
          translate: `0px ${push}px`,
        }}
      >
        <Rise from={16} y={20} clip={false}>
          <Kicker>First up</Kicker>
        </Rise>
        <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
          <Numeral n="01" active size={200} />
          <Rise from={22} y={44}>
            <Heading size={128} gradient>
              Launch your agent
            </Heading>
          </Rise>
        </div>
        <Rise from={34} y={18} clip={false}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              color: C.color.textDim,
              fontSize: 40,
            }}
          >
            <span style={{ color: C.color.orange, fontSize: 52 }}>→</span> the skill from
            Anthropic
          </div>
        </Rise>
      </AbsoluteFill>

      {/* orange wipe bar (skewed for motion) */}
      <AbsoluteFill
        style={{
          left: `${wipe}%`,
          background: C.gradient.orange,
          transform: "skewX(-9deg) scale(1.4)",
          boxShadow: `0 0 80px ${C.color.orangeGlow}`,
        }}
      />
    </AbsoluteFill>
  );
};
