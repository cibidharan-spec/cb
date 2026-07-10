import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { Stage } from "../chronixel/Stage";
import { Heading } from "../chronixel/ui";
import { Kicker, KeyLine, Numeral, Rise } from "../chronixel/editorial";
import { chronixel as C, EASE } from "../chronixel/theme";
import { poppins } from "../chronixel/fonts";

// Scene 5 — What We'll Cover
// "using Launch Your Agent skill from Anthropic, connect with managed agents,
//  and a real use case with the agent."
// Kinetic editorial agenda: big outlined numerals stack, the spotlight walks the list.

const ROWS = [
  { n: "01", title: "Launch your agent", note: "the skill from Anthropic" },
  { n: "02", title: "Managed agents", note: "connect & run in the cloud" },
  { n: "03", title: "Real use case", note: "put the agent to work" },
];

export const Scene05Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const e = (a: number, b: number) =>
    interpolate(frame, [a, b], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(...EASE),
    });

  const kickerIn = e(2, 22);
  // spotlight walks down as rows reveal
  const rowStart = [34, 80, 126];
  const activeIdx = frame < 78 ? 0 : frame < 124 ? 1 : 2;
  const focusY = interpolate(
    frame,
    [34, 80, 126, 190],
    [40, 50, 60, 56],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill>
      <Stage focusX={44} focusY={focusY} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          padding: "120px 150px",
        }}
      >
        <div style={{ opacity: kickerIn, translate: `0px ${(1 - kickerIn) * 12}px`, marginBottom: 40 }}>
          <Kicker>What we'll cover</Kicker>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          {ROWS.map((r, i) => {
            const start = rowStart[i];
            const active = i === activeIdx;
            const dim = interpolate(
              activeIdx - i,
              [-2, 0, 2],
              [0.55, 1, 0.55],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            return (
              <div key={r.n}>
                <Rise from={start} y={34}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 44,
                      opacity: dim,
                    }}
                  >
                    <Numeral n={r.n} active={active} size={140} style={{ width: 200 }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <Heading size={86} gradient={active}>
                        {r.title}
                      </Heading>
                      <div
                        style={{
                          fontFamily: poppins,
                          fontWeight: 500,
                          fontSize: C.type.tag,
                          letterSpacing: C.tracking.wide,
                          textTransform: "uppercase",
                          color: C.color.textDim,
                        }}
                      >
                        {r.note}
                      </div>
                    </div>
                  </div>
                </Rise>
                {i < ROWS.length - 1 && (
                  <KeyLine
                    from={start + 8}
                    width="88%"
                    thickness={2}
                    style={{ marginTop: 30, opacity: 0.5 }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
