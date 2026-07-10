import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { chronixel as C, EASE } from "./theme";
import { poppins } from "./fonts";

const easeAt = (frame: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(frame, [a, b], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASE),
  });

// Rise + clip-reveal: text wipes up from a baseline, the editorial workhorse.
export const Rise: React.FC<
  React.PropsWithChildren<{
    from: number;
    dur?: number;
    y?: number;
    clip?: boolean;
    style?: React.CSSProperties;
  }>
> = ({ children, from, dur = 20, y = 40, clip = true, style }) => {
  const frame = useCurrentFrame();
  const p = easeAt(frame, from, from + dur);
  return (
    <div
      style={{
        opacity: p,
        translate: `0px ${(1 - p) * y}px`,
        clipPath: clip
          ? `inset(${(1 - p) * 108}% 0% 0% 0%)`
          : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Orange keyline rule that draws out from the left.
export const KeyLine: React.FC<{
  from: number;
  width?: number | string;
  thickness?: number;
  dur?: number;
  style?: React.CSSProperties;
}> = ({ from, width = "100%", thickness = 4, dur = 22, style }) => {
  const frame = useCurrentFrame();
  const p = easeAt(frame, from, from + dur);
  return (
    <div
      style={{
        width,
        height: thickness,
        borderRadius: thickness,
        background: C.gradient.orange,
        boxShadow: `0 0 20px ${C.color.orangeGlow}`,
        transformOrigin: "left center",
        scale: `${p} 1`,
        ...style,
      }}
    />
  );
};

// Oversized display numeral (01 / 02 / 03).
export const Numeral: React.FC<{
  n: string;
  active?: boolean;
  size?: number;
  style?: React.CSSProperties;
}> = ({ n, active, size = 150, style }) => (
  <div
    style={{
      fontFamily: poppins,
      fontWeight: 800,
      fontSize: size,
      lineHeight: 0.9,
      letterSpacing: C.tracking.tighter,
      color: "transparent",
      WebkitTextStroke: `2px ${active ? C.color.orange : C.color.textFaint}`,
      textShadow: active ? `0 0 30px ${C.color.orangeGlow}` : "none",
      ...style,
    }}
  >
    {n}
  </div>
);

// Small-caps kicker line above a headline.
export const Kicker: React.FC<
  React.PropsWithChildren<{ style?: React.CSSProperties }>
> = ({ children, style }) => (
  <div
    style={{
      fontFamily: poppins,
      fontWeight: 600,
      fontSize: C.type.tag,
      letterSpacing: C.tracking.wide,
      textTransform: "uppercase",
      color: C.color.orange,
      display: "flex",
      alignItems: "center",
      gap: 14,
      ...style,
    }}
  >
    <span
      style={{
        width: 34,
        height: 2,
        background: C.color.orange,
        boxShadow: `0 0 10px ${C.color.orangeGlow}`,
      }}
    />
    {children}
  </div>
);

// Faint oversized background word that parallaxes for depth.
export const GhostWord: React.FC<{
  children: React.ReactNode;
  top: string | number;
  drift?: number;
  size?: number;
  opacity?: number;
}> = ({ children, top, drift = 1, size = 300, opacity = 0.04 }) => {
  const frame = useCurrentFrame();
  const x = Math.sin(frame / 60) * 30 * drift;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: poppins,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 0.9,
        letterSpacing: C.tracking.tighter,
        textTransform: "uppercase",
        color: C.color.text,
        opacity,
        translate: `${x}px 0px`,
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
};
