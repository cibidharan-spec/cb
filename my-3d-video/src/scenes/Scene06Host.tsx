import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { Stage } from "../chronixel/Stage";
import { Heading } from "../chronixel/ui";
import { Kicker, KeyLine, Rise } from "../chronixel/editorial";
import { chronixel as C, EASE } from "../chronixel/theme";
import { poppins } from "../chronixel/fonts";

// Scene 6 — Host
// "I'm Baskaran. I build with AI tools like this every single day."
// Editorial name card: oversized name, drawn underline, quiet supporting line.

export const Scene06Host: React.FC = () => {
  const frame = useCurrentFrame();
  const tighten = interpolate(frame, [0, 50], [0.2, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASE),
  });

  return (
    <AbsoluteFill>
      <Stage focusY={47} tighten={tighten} />
      <AbsoluteFill
        style={{
          alignItems: "flex-start",
          justifyContent: "center",
          flexDirection: "column",
          gap: 26,
          padding: "120px 160px",
        }}
      >
        <Rise from={4} y={16} clip={false}>
          <Kicker>Your host</Kicker>
        </Rise>

        <Rise from={16} y={54} dur={26}>
          <Heading size={200} gradient style={{ lineHeight: 0.92 }}>
            Baskaran
          </Heading>
        </Rise>

        <KeyLine from={44} width={620} style={{ marginTop: 4, marginBottom: 8 }} />

        <Rise from={56} y={26} clip={false}>
          <div
            style={{
              fontFamily: poppins,
              fontWeight: 500,
              fontSize: 46,
              letterSpacing: "-0.01em",
              color: C.color.text,
            }}
          >
            Builds with AI tools like this —{" "}
            <span style={{ color: C.color.orange, fontWeight: 700 }}>every single day</span>.
          </div>
        </Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
