import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { Backdrop } from "../chronixel/Backdrop";
import { Glass, Heading, Tag, Node } from "../chronixel/ui";
import { chronixel as C, EASE } from "../chronixel/theme";
import { poppins } from "../chronixel/fonts";

// Scene 1 — The Drop
// "Anthropic just dropped a free tool that builds your AI agent for you."
// One prompt sentence types out, then an agent assembles itself from nodes.

const PROMPT = "build me an agent that runs my morning ops";

const SATELLITES = [
  { angle: -150, label: "deploy" },
  { angle: -50, label: "monitor" },
  { angle: 40, label: "fix" },
  { angle: 130, label: "report" },
];

export const Scene01Drop: React.FC = () => {
  const frame = useCurrentFrame();
  const ease = (a: number, b: number, from = 0, to = 1) =>
    interpolate(frame, [a, b], [from, to], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(...EASE),
    });

  // Prompt card in
  const cardIn = ease(2, 24);
  // Typing
  const typed = Math.round(interpolate(frame, [12, 46], [0, PROMPT.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const caretOn = frame % 16 < 8 && frame < 60;

  // Central node + satellites assemble
  const coreIn = ease(44, 66);
  const heading1In = ease(74, 92);
  const heading2In = ease(86, 104);
  const tagIn = ease(96, 116);

  const R = 190;

  return (
    <AbsoluteFill>
      <Backdrop glow="orange" />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: C.space.lg,
          padding: 120,
        }}
      >
        {/* Prompt card */}
        <Glass
          hot
          style={{
            padding: "34px 44px",
            width: 980,
            opacity: cardIn,
            scale: String(0.94 + cardIn * 0.06),
            translate: `0px ${(1 - cardIn) * 24}px`,
            display: "flex",
            alignItems: "center",
            gap: 22,
          }}
        >
          <Tag tone="orange">prompt</Tag>
          <div
            style={{
              fontFamily: poppins,
              fontWeight: 500,
              fontSize: 40,
              color: C.color.text,
              letterSpacing: "-0.01em",
              whiteSpace: "pre",
            }}
          >
            {PROMPT.slice(0, typed)}
            <span
              style={{
                opacity: caretOn ? 1 : 0,
                color: C.color.orangeHot,
                fontWeight: 800,
              }}
            >
              |
            </span>
          </div>
        </Glass>

        {/* Agent graph */}
        <div
          style={{
            position: "relative",
            width: 560,
            height: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* filaments */}
          <svg
            width={560}
            height={400}
            style={{ position: "absolute", inset: 0, overflow: "visible" }}
          >
            {SATELLITES.map((s, i) => {
              const rad = (s.angle * Math.PI) / 180;
              const x = 280 + Math.cos(rad) * R;
              const y = 200 + Math.sin(rad) * R;
              const grow = ease(60 + i * 6, 84 + i * 6);
              const ex = 280 + (x - 280) * grow;
              const ey = 200 + (y - 200) * grow;
              return (
                <line
                  key={i}
                  x1={280}
                  y1={200}
                  x2={ex}
                  y2={ey}
                  stroke={C.color.orange}
                  strokeWidth={2}
                  strokeOpacity={0.65 * grow}
                  style={{ filter: `drop-shadow(0 0 6px ${C.color.orangeGlow})` }}
                />
              );
            })}
          </svg>

          {/* satellite nodes */}
          {SATELLITES.map((s, i) => {
            const rad = (s.angle * Math.PI) / 180;
            const x = Math.cos(rad) * R;
            const y = Math.sin(rad) * R;
            const pop = ease(66 + i * 6, 88 + i * 6);
            const pulse = 0.2 + 0.15 * Math.sin(frame / 10 + i);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 280 + x,
                  top: 200 + y,
                  translate: "-50% -50%",
                  scale: String(pop),
                  opacity: pop,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Node size={20} pulse={pulse} />
                <div
                  style={{
                    fontFamily: poppins,
                    fontWeight: 600,
                    fontSize: C.type.tiny,
                    letterSpacing: C.tracking.wide,
                    textTransform: "uppercase",
                    color: C.color.textFaint,
                  }}
                >
                  {s.label}
                </div>
              </div>
            );
          })}

          {/* core agent node */}
          <div
            style={{
              position: "absolute",
              scale: String(0.4 + coreIn * 0.6),
              opacity: coreIn,
            }}
          >
            <Node
              size={64}
              color={C.color.orangeHot}
              pulse={0.35 + 0.2 * Math.sin(frame / 8)}
            />
          </div>
        </div>

        {/* Headline */}
        <div style={{ textAlign: "center", marginTop: -10 }}>
          <div style={{ display: "flex", gap: 26, alignItems: "center" }}>
            <Heading
              size={C.type.hero}
              style={{
                opacity: heading1In,
                translate: `0px ${(1 - heading1In) * 20}px`,
              }}
            >
              One sentence
            </Heading>
            <Heading
              size={C.type.hero}
              gradient
              style={{
                opacity: heading2In,
                translate: `0px ${(1 - heading2In) * 20}px`,
                color: C.color.orange,
              }}
            >
              → Agent
            </Heading>
          </div>
        </div>

        {/* FREE tag */}
        <div style={{ opacity: tagIn, scale: String(0.8 + tagIn * 0.2) }}>
          <Tag tone="orange">✦ Free · from Anthropic</Tag>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
