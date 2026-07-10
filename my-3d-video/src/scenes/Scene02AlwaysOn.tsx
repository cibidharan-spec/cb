import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { Backdrop } from "../chronixel/Backdrop";
import { Glass, Heading, Tag, Node } from "../chronixel/ui";
import { chronixel as C, EASE } from "../chronixel/theme";
import { poppins } from "../chronixel/fonts";

// Scene 2 — Always On
// "Then it hosts this in the cloud, so it's still running even with your laptop off."
// The agent lifts off the laptop into a pulsing cloud panel; the laptop powers off,
// the cloud keeps running.

const ORBIT = [0, 120, 240];

export const Scene02AlwaysOn: React.FC = () => {
  const frame = useCurrentFrame();
  const ease = (a: number, b: number, from = 0, to = 1) =>
    interpolate(frame, [a, b], [from, to], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(...EASE),
    });

  const laptopIn = ease(2, 24);
  const cloudIn = ease(10, 34);
  const linkGrow = ease(30, 52);

  // Agent lift: travels from laptop (bottom) up the filament to the cloud.
  const lift = ease(46, 78);
  // Laptop powers off.
  const powerOff = ease(84, 108); // 0 = on, 1 = off
  const screenLit = 1 - powerOff;

  const headIn = ease(96, 116);
  const subIn = ease(108, 128);

  const runningPulse = 0.5 + 0.5 * Math.sin(frame / 9);

  // Cloud position (center-top), laptop (center-bottom)
  return (
    <AbsoluteFill>
      <Backdrop glow="orange" />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: 120,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 760,
            height: 560,
            display: "flex",
            justifyContent: "center",
          }}
        >
          {/* vertical link laptop -> cloud */}
          <svg
            width={760}
            height={560}
            style={{ position: "absolute", inset: 0, overflow: "visible" }}
          >
            <line
              x1={380}
              y1={430}
              x2={380}
              y2={170}
              stroke={C.color.orange}
              strokeWidth={2}
              strokeOpacity={0.5 * linkGrow}
              strokeDasharray="6 10"
              style={{ filter: `drop-shadow(0 0 5px ${C.color.orangeGlow})` }}
            />
          </svg>

          {/* Cloud panel */}
          <div
            style={{
              position: "absolute",
              top: 40,
              opacity: cloudIn,
              scale: String(0.9 + cloudIn * 0.1),
            }}
          >
            <Glass
              hot
              style={{
                width: 440,
                height: 264,
                position: "relative",
              }}
            >
              {/* header row: Cloud (left) · Running (right) — never overlap */}
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  left: 22,
                  right: 22,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Tag tone="neutral">☁ Cloud</Tag>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontFamily: poppins,
                    fontWeight: 600,
                    fontSize: C.type.tiny,
                    letterSpacing: C.tracking.wide,
                    textTransform: "uppercase",
                    color: C.color.success,
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: C.color.success,
                      boxShadow: `0 0 ${8 + runningPulse * 10}px ${C.color.successGlow}`,
                      opacity: 0.55 + runningPulse * 0.45,
                    }}
                  />
                  Running
                </div>
              </div>

              {/* orbit + core, centered at (220, 162) below the header */}
              {ORBIT.map((base, i) => {
                const a = ((base + frame * 1.6) * Math.PI) / 180;
                const rx = 122;
                const ry = 52;
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: 220 + Math.cos(a) * rx,
                      top: 162 + Math.sin(a) * ry,
                      translate: "-50% -50%",
                    }}
                  >
                    <Node size={14} pulse={0.2 + 0.15 * Math.sin(frame / 8 + i)} />
                  </div>
                );
              })}
              {/* core (agent, once lifted) */}
              <div
                style={{
                  position: "absolute",
                  left: 220,
                  top: 162,
                  translate: "-50% -50%",
                  opacity: lift,
                }}
              >
                <Node
                  size={44}
                  color={C.color.orangeHot}
                  pulse={0.3 + 0.2 * Math.sin(frame / 7)}
                />
              </div>
            </Glass>
          </div>

          {/* Traveling agent node (laptop -> cloud) */}
          {lift > 0 && lift < 1 && (
            <div
              style={{
                position: "absolute",
                left: 380,
                top: interpolate(lift, [0, 1], [430, 165]),
                translate: "-50% -50%",
              }}
            >
              <Node size={30} color={C.color.orangeHot} pulse={0.5} />
            </div>
          )}

          {/* Laptop */}
          <div
            style={{
              position: "absolute",
              bottom: 30,
              opacity: laptopIn,
              scale: String(0.94 + laptopIn * 0.06),
            }}
          >
            {/* screen */}
            <Glass
              style={{
                width: 300,
                height: 180,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `rgba(23,19,16,${0.04 + (1 - screenLit) * 0.06})`,
                borderColor: powerOff > 0.5 ? C.color.glassStroke : C.color.glassStrokeHot,
              }}
            >
              {/* screen glow that dies out */}
              <AbsoluteFill
                style={{
                  borderRadius: C.radius.lg,
                  background: `radial-gradient(60% 60% at 50% 45%, ${C.color.orangeGlow} 0%, transparent 70%)`,
                  opacity: screenLit * 0.5,
                }}
              />
              <div
                style={{
                  fontFamily: poppins,
                  fontWeight: 800,
                  fontSize: 30,
                  letterSpacing: C.tracking.wide,
                  textTransform: "uppercase",
                  color: powerOff > 0.5 ? C.color.textFaint : C.color.text,
                  zIndex: 1,
                }}
              >
                {powerOff > 0.5 ? "Off" : "You"}
              </div>
            </Glass>
            {/* base */}
            <div
              style={{
                width: 360,
                height: 16,
                marginLeft: -30,
                marginTop: 6,
                borderRadius: "0 0 16px 16px",
                background: C.color.glassFillStrong,
                border: `1px solid ${C.color.glassStroke}`,
              }}
            />
            {/* power dot */}
            <div
              style={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                translate: "-50% 0",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: powerOff > 0.5 ? C.color.textFaint : C.color.success,
                boxShadow:
                  powerOff > 0.5 ? "none" : `0 0 12px ${C.color.successGlow}`,
              }}
            />
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            textAlign: "center",
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
          }}
        >
          <Heading
            size={C.type.hero}
            gradient
            style={{
              opacity: headIn,
              translate: `0px ${(1 - headIn) * 20}px`,
              wordSpacing: 24,
            }}
          >
            Always On
          </Heading>
          <Tag
            tone="neutral"
            style={{ opacity: subIn, translate: `0px ${(1 - subIn) * 14}px` }}
          >
            Laptop off · still running
          </Tag>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
