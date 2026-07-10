// Chronixel design tokens — LIGHT mode ("Studio Light").
// Warm paper background, soft light glass, dark text, orange highlight accent.
// (Token names like `void` are kept for compatibility but now hold light values.)

export const chronixel = {
  color: {
    // Backgrounds (light)
    void: "#F4F1EA", // warm paper base
    voidDeep: "#E4DED2", // slightly darker warm — used for edge vignette
    grid: "rgba(24, 20, 16, 0.06)", // faint dark grid lines
    gridStrong: "rgba(24, 20, 16, 0.10)",

    // Text (dark on light)
    text: "#171310", // near-black warm
    textDim: "rgba(23, 19, 16, 0.60)",
    textFaint: "rgba(23, 19, 16, 0.30)",

    // Orange highlight system
    orange: "#F26811",
    orangeHot: "#FF7A18",
    orangeDeep: "#D14D06",
    orangeGlow: "rgba(242, 104, 17, 0.30)",

    // States
    danger: "#DC2626",
    dangerGlow: "rgba(220, 38, 38, 0.28)",
    success: "#15A34A",
    successGlow: "rgba(21, 163, 74, 0.28)",

    // Glass (soft white cards on light)
    glassFill: "rgba(255, 255, 255, 0.62)",
    glassFillStrong: "rgba(255, 255, 255, 0.82)",
    glassStroke: "rgba(24, 20, 16, 0.12)",
    glassStrokeHot: "rgba(242, 104, 17, 0.55)",
  },

  // Gradients
  gradient: {
    orange: "linear-gradient(100deg, #FF9D3C 0%, #F26811 48%, #D14D06 100%)",
    // heading emphasis reads as a warm orange gradient on light
    text: "linear-gradient(180deg, #FF8A2A 0%, #E8590C 115%)",
  },

  // Radii & spacing
  radius: { sm: 14, md: 22, lg: 34, pill: 999 },
  space: { xs: 10, sm: 18, md: 28, lg: 48, xl: 80 },

  // Type scale (for 1920×1080 comps)
  type: {
    hero: 120,
    heading: 88,
    label: 40,
    tag: 26,
    tiny: 22,
  },
  tracking: {
    tight: "-0.04em", // headings, per Text Style doc
    tighter: "-0.055em",
    wide: "0.18em", // small caps tags
  },
} as const;

// Shared soft-ease bezier for weightless motion.
export const EASE = [0.16, 1, 0.3, 1] as const;
export const EASE_IO = [0.65, 0, 0.35, 1] as const;
