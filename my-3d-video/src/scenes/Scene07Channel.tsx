import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { Stage } from "../chronixel/Stage";
import { Heading, Tag } from "../chronixel/ui";
import { EASE } from "../chronixel/theme";

// Scene 7 — Channel & Go
// "And this is Baskaran Builds. Let's get started."
// The channel lockup stamps in; a quick "let's go" beat closes the intro.

export const Scene07Channel: React.FC = () => {
  const frame = useCurrentFrame();
  const e = (a: number, b: number, from = 0, to = 1) =>
    interpolate(frame, [a, b], [from, to], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(...EASE),
    });

  const line1 = e(2, 24);
  const line2 = e(12, 34);
  const go = e(34, 48);
  const settle = 1 - e(52, 60) * 0.04; // tiny push at the end

  return (
    <AbsoluteFill>
      <Stage focusY={46} tighten={0.6} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 22,
          scale: String(settle),
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
          <Heading
            size={150}
            style={{
              opacity: line1,
              translate: `0px ${(1 - line1) * 40}px`,
              clipPath: `inset(${(1 - line1) * 100}% 0 0 0)`,
            }}
          >
            Baskaran
          </Heading>
          <Heading
            size={150}
            gradient
            style={{
              opacity: line2,
              translate: `0px ${(1 - line2) * 40}px`,
              clipPath: `inset(${(1 - line2) * 100}% 0 0 0)`,
            }}
          >
            Builds
          </Heading>
        </div>

        <div style={{ opacity: go, scale: String(0.8 + go * 0.2) }}>
          <Tag tone="orange">Let's get started →</Tag>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
