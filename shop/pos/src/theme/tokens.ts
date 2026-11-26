import { Platform } from "react-native";

export const colors = {
  background: "#0a0b0d",
  surface: "#0c0e11",
  elevated: "#111318",
  border: "rgba(255, 255, 255, 0.08)",
  borderStrong: "rgba(255, 255, 255, 0.16)",
  text: "#e4e4e7",
  muted: "#a1a1aa",
  faint: "#71717a",
  accent: "#bef264",
  accentText: "#0a0b0d",
  danger: "#f87171",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
} as const;

export const fonts = {
  sans: Platform.select({ ios: "System", android: "sans-serif", default: "System" }) ?? "System",
  mono:
    Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }) ?? "monospace",
} as const;

export const theme = { colors, spacing, radius, fonts } as const;
