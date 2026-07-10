import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { Stage } from "../chronixel/Stage";
import { Heading } from "../chronixel/ui";
import { Kicker, KeyLine, GhostWord } from "../chronixel/editorial";
import { chronixel as C, EASE } from "../chronixel/theme";

// Scene 4 — That Ends Today
// "If you are opening Claude Code every morning to manage your agents by hand,
//  that ends today."
// Kinetic editorial: "BY HAND" gets struck through and swept away; "THAT ENDS
// TODAY" rises under the spotlight.

export const Scene04EndsToday: React.FC = () => {
  const frame = useCurrentFrame();
  const e = (a: number, b: number, from = 0, to = 1) =>
    interpolate(frame, [a, b], [from, to], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(...EASE),
    });

  const kickerIn = e(2, 20);
  const byHandIn = e(10, 34);
  const strike = e(40, 62); // strike-through slashes across
  const byHandOut = e(66, 84); // BY HAND drops away + fades
  const endsIn = e(80, 108);
  const tighten = e(78, 120);

  const byHandOpacity = (0.2 + byHandIn * 0.8) * (1 - byHandOut);
  const ghostFade = 1 - e(50, 78);

  return (
    <AbsoluteFill>
      <Stage focusY={48} tighten={tighten} />

      {/* manual-clutter ghost words drifting behind */}
      <AbsoluteFill style={{ opacity: ghostFade }}>
        <GhostWord top="4%" drift={1}>
          by hand · by hand
        </GhostWord>
        <GhostWord top="70%" drift={-1.4} opacity={0.03}>
          every morning
        </GhostWord>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: C.space.md,
          padding: 120,
        }}
      >
        <div
          style={{
            opacity: kickerIn * (1 - endsIn),
            translate: `0px ${(1 - kickerIn) * 12}px`,
          }}
        >
          <Kicker>Managing agents by hand?</Kicker>
        </div>

        {/* BY HAND with strike-through */}
        <div
          style={{
            position: "relative",
            opacity: byHandOpacity,
            translate: `0px ${byHandOut * 40}px`,
          }}
        >
          <Heading size={150} style={{ color: C.color.textDim }}>
            By hand
          </Heading>
          <div
            style={{
              position: "absolute",
              top: "52%",
              left: -20,
              right: -20,
              height: 10,
              borderRadius: 8,
              background: C.gradient.orange,
              boxShadow: `0 0 24px ${C.color.orangeGlow}`,
              transformOrigin: "left center",
              scale: `${strike} 1`,
            }}
          />
        </div>

        {/* THAT ENDS TODAY */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 26,
            opacity: endsIn,
            translate: `0px ${(1 - endsIn) * 46}px`,
            clipPath: `inset(${(1 - endsIn) * 100}% 0% 0% 0%)`,
          }}
        >
          <Heading size={168} gradient>
            That ends today
          </Heading>
          <KeyLine from={104} width={520} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
