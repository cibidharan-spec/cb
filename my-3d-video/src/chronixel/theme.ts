// Chronixel design tokens — "Glass Command Deck"
// Dark cinematic background, subtle grid, glass UI, orange gradient highlights,
// off-white text, premium spacing, smooth motion, no clutter.

export const chronixel = {
  color: {
    // Backgrounds
    void: "#07080B", // near-black cinematic base
    voidDeep: "#040406",
    grid: "rgba(120, 140, 180, 0.06)", // faint blueprint grid lines
    gridStrong: "rgba(130, 150, 190, 0.10)",

    // Text
    text: "#F4F1EA", // off-white
    textDim: "rgba(244, 241, 234, 0.55)",
    textFaint: "rgba(244, 241, 234, 0.32)",

    // Orange highlight system
    orange: "#FF7A18",
    orangeHot: "#FF9D3C",
    orangeDeep: "#E8590C",
    orangeGlow: "rgba(255, 122, 24, 0.55)",

    // States
    danger: "#FF4D4D",
    dangerGlow: "rgba(255, 77, 77, 0.5)",
    success: "#3DDC84",
    successGlow: "rgba(61, 220, 132, 0.5)",

    // Glass
    glassFill: "rgba(255, 255, 255, 0.045)",
    glassFillStrong: "rgba(255, 255, 255, 0.07)",
    glassStroke: "rgba(255, 255, 255, 0.12)",
    glassStrokeHot: "rgba(255, 122, 24, 0.45)",
  },

  // Gradients
  gradient: {
    orange: "linear-gradient(100deg, #FF9D3C 0%, #FF7A18 45%, #E8590C 100%)",
    text: "linear-gradient(180deg, #FFFFFF 0%, #E7C9A6 120%)",
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
