import React from "react";
import { chronixel as C } from "./theme";
import { poppins } from "./fonts";

// Frosted-glass panel — the core Chronixel surface.
export const Glass: React.FC<
  React.PropsWithChildren<{
    style?: React.CSSProperties;
    hot?: boolean; // orange-lit edge
    state?: "danger" | "success";
  }>
> = ({ children, style, hot, state }) => {
  const stroke =
    state === "danger"
      ? C.color.danger
      : state === "success"
        ? C.color.success
        : hot
          ? C.color.glassStrokeHot
          : C.color.glassStroke;

  const depth = "0 20px 46px rgba(24,20,16,0.14)";
  const edgeGlow =
    state === "danger"
      ? `0 0 30px ${C.color.dangerGlow}, ${depth}`
      : state === "success"
        ? `0 0 30px ${C.color.successGlow}, ${depth}`
        : hot
          ? `0 0 34px ${C.color.orangeGlow}, ${depth}`
          : depth;

  return (
    <div
      style={{
        background: C.color.glassFill,
        border: `1px solid ${stroke}`,
        borderRadius: C.radius.lg,
        boxShadow: `${edgeGlow}, inset 0 1px 0 rgba(255,255,255,0.85)`,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Poppins ExtraBold heading, very tight tracking (per Text Style doc).
export const Heading: React.FC<{
  children: React.ReactNode;
  size?: number;
  style?: React.CSSProperties;
  gradient?: boolean;
}> = ({ children, size = C.type.heading, style, gradient }) => {
  const grad: React.CSSProperties = gradient
    ? {
        background: C.gradient.text,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }
    : { color: C.color.text };
  return (
    <div
      style={{
        fontFamily: poppins,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 0.98,
        letterSpacing: C.tracking.tight,
        textTransform: "uppercase",
        ...grad,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Small-caps tag pill.
export const Tag: React.FC<
  React.PropsWithChildren<{ tone?: "orange" | "neutral"; style?: React.CSSProperties }>
> = ({ children, tone = "neutral", style }) => {
  const orange = tone === "orange";
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily: poppins,
        fontWeight: 600,
        fontSize: C.type.tag,
        letterSpacing: C.tracking.wide,
        textTransform: "uppercase",
        color: orange ? "#1A0E06" : C.color.textDim,
        background: orange ? C.gradient.orange : C.color.glassFillStrong,
        border: `1px solid ${orange ? "transparent" : C.color.glassStroke}`,
        borderRadius: C.radius.pill,
        padding: "10px 20px",
        boxShadow: orange ? `0 0 26px ${C.color.orangeGlow}` : "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// A glowing agent node (dot with a soft halo + optional ring).
export const Node: React.FC<{
  size?: number;
  color?: string;
  glow?: string;
  pulse?: number; // 0..1
  style?: React.CSSProperties;
}> = ({ size = 26, color = C.color.orange, glow = C.color.orangeGlow, pulse = 0, style }) => {
  return (
    <div style={{ position: "relative", width: size, height: size, ...style }}>
      <div
        style={{
          position: "absolute",
          inset: -size * (0.6 + pulse),
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
          opacity: 0.5 + pulse * 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 16px ${glow}, inset 0 0 6px rgba(255,255,255,0.6)`,
        }}
      />
    </div>
  );
};
