import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing, random } from "remotion";
import { Backdrop } from "../chronixel/Backdrop";
import { Glass, Heading, Tag } from "../chronixel/ui";
import { chronixel as C, EASE } from "../chronixel/theme";
import { poppins } from "../chronixel/fonts";

// Scene 3 — Self-Deploy, Self-Heal
// "I gave it one sentence. Ten minutes later it deployed itself, then broke and
//  fixed itself without me."
// A deploy pipeline fills, an error flares red, and the agent repairs itself to green.

const STAGES = ["Build", "Deploy", "Live"];

// phase glow for the backdrop: orange -> danger -> success
const glowFor = (frame: number): "orange" | "danger" | "success" =>
  frame < 96 ? "orange" : frame < 128 ? "danger" : "success";

export const Scene03SelfHeal: React.FC = () => {
  const frame = useCurrentFrame();
  const ease = (a: number, b: number, from = 0, to = 1) =>
    interpolate(frame, [a, b], [from, to], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(...EASE),
    });

  // Countdown 10:00 -> 00:00, compressing fast
  const t = interpolate(frame, [6, 58], [600, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.9, 0, 0.9, 1),
  });
  const mm = String(Math.floor(Math.max(0, t) / 60)).padStart(2, "0");
  const ss = String(Math.floor(Math.max(0, t) % 60)).padStart(2, "0");

  const timerIn = ease(2, 20);
  // Pipeline fill 0..1
  const fill = ease(34, 92);

  // Error window
  const errorIn = ease(96, 108);
  const healed = ease(128, 162); // 0 broken -> 1 fixed
  const broken = errorIn * (1 - healed);

  // glitch shake during error, before heal
  const shakeAmt = broken * (frame < 130 ? 1 : 0);
  const shake = shakeAmt * (random(`s${Math.floor(frame)}`) - 0.5) * 16;

  const w1 = ease(60, 78); // DEPLOYS
  const w2 = ease(100, 112); // BREAKS
  const w3 = ease(132, 150); // FIXES ITSELF

  const liveColor = broken > 0.5 ? C.color.danger : healed > 0.5 ? C.color.success : C.color.orange;
  const liveGlow = broken > 0.5 ? C.color.dangerGlow : healed > 0.5 ? C.color.successGlow : C.color.orangeGlow;
  const liveLabel = broken > 0.5 ? "Error" : healed > 0.5 ? "Fixed" : "Live";

  return (
    <AbsoluteFill>
      <Backdrop glow={glowFor(frame)} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: C.space.lg,
          padding: 120,
          translate: `${shake}px 0px`,
        }}
      >
        {/* Prompt + timer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            opacity: timerIn,
          }}
        >
          <Tag tone="orange">1 sentence</Tag>
          <Glass style={{ padding: "16px 30px", display: "flex", gap: 14, alignItems: "center" }}>
            <span
              style={{
                fontFamily: poppins,
                fontWeight: 600,
                fontSize: C.type.tag,
                letterSpacing: C.tracking.wide,
                textTransform: "uppercase",
                color: C.color.textDim,
              }}
            >
              ⏱ elapsed
            </span>
            <span
              style={{
                fontFamily: poppins,
                fontWeight: 800,
                fontSize: 44,
                letterSpacing: C.tracking.tight,
                color: C.color.text,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {mm}:{ss}
            </span>
          </Glass>
        </div>

        {/* Pipeline */}
        <div
          style={{
            position: "relative",
            width: 1180,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* track */}
          <div
            style={{
              position: "absolute",
              left: 120,
              right: 120,
              top: "50%",
              height: 4,
              borderRadius: 4,
              background: C.color.glassStroke,
            }}
          />
          {/* fill */}
          <div
            style={{
              position: "absolute",
              left: 120,
              top: "50%",
              height: 4,
              borderRadius: 4,
              width: `calc((100% - 240px) * ${fill})`,
              background:
                broken > 0.5
                  ? `linear-gradient(90deg, ${C.color.orange}, ${C.color.danger})`
                  : healed > 0.5
                    ? `linear-gradient(90deg, ${C.color.orange}, ${C.color.success})`
                    : C.gradient.orange,
              boxShadow: `0 0 16px ${liveGlow}`,
            }}
          />

          {STAGES.map((stage, i) => {
            const reach = i / (STAGES.length - 1);
            const on = fill >= reach - 0.02;
            const isLive = i === STAGES.length - 1;
            const color = isLive ? liveColor : on ? C.color.orange : C.color.textFaint;
            const glow = isLive ? liveGlow : C.color.orangeGlow;
            const label = isLive ? liveLabel : stage;
            const state = isLive && broken > 0.5 ? "danger" : isLive && healed > 0.5 ? "success" : undefined;
            const pop = ease(34 + i * 20, 52 + i * 20);
            return (
              <div
                key={i}
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                  opacity: pop,
                  scale: String(0.85 + pop * 0.15),
                }}
              >
                <Glass
                  state={state}
                  hot={!isLive && on}
                  style={{
                    width: 116,
                    height: 116,
                    borderRadius: C.radius.md,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: color,
                      boxShadow: `0 0 20px ${glow}`,
                      opacity: on ? 1 : 0.4,
                    }}
                  />
                </Glass>
                <div
                  style={{
                    fontFamily: poppins,
                    fontWeight: 700,
                    fontSize: C.type.tiny,
                    letterSpacing: C.tracking.wide,
                    textTransform: "uppercase",
                    color,
                  }}
                >
                  {label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Headline: three words light in sync with the beats */}
        <div
          style={{
            display: "flex",
            gap: 26,
            alignItems: "baseline",
            marginTop: 8,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Heading size={78} style={{ opacity: 0.25 + w1 * 0.75, color: C.color.orange }}>
            Deploys
          </Heading>
          <span style={{ color: C.color.textFaint, fontSize: 48 }}>·</span>
          <Heading size={78} style={{ opacity: 0.25 + w2 * 0.75, color: broken > 0.3 ? C.color.danger : C.color.textDim }}>
            Breaks
          </Heading>
          <span style={{ color: C.color.textFaint, fontSize: 48 }}>·</span>
          <Heading size={78} style={{ opacity: 0.25 + w3 * 0.75, color: healed > 0.3 ? C.color.success : C.color.textDim }}>
            Fixes itself
          </Heading>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
