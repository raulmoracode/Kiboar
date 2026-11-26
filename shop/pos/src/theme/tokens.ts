import { kiboarColors } from "@kiboar/design/tokens";
import { Platform, type TextStyle } from "react-native";

export const colors = kiboarColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
} as const;

export const fonts = {
  sans: Platform.select({ ios: "System", android: "sans-serif", default: "System" }) ?? "System",
  mono:
    Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }) ?? "monospace",
} as const;

export const typography = {
  /** The mono label above a title, the same as `kiboar-eyebrow` on the web. */
  eyebrow: {
    color: colors.faint,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  display: {
    color: colors.textStrong,
    fontFamily: fonts.sans,
    fontSize: 34,
    fontWeight: "500",
    letterSpacing: -0.6,
    lineHeight: 40,
  },
  title: {
    color: colors.textStrong,
    fontFamily: fonts.sans,
    fontSize: 24,
    fontWeight: "500",
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  body: {
    color: colors.muted,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  small: {
    color: colors.faint,
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 18,
  },
  mono: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  amount: {
    color: colors.textStrong,
    fontFamily: fonts.mono,
    fontSize: 40,
    fontWeight: "500",
    letterSpacing: -1,
    lineHeight: 46,
  },
} satisfies Record<string, TextStyle>;

export const layout = {
  maxWidth: 1120,
  gutter: 20,
} as const;

export const theme = { colors, spacing, radius, fonts, typography, layout } as const;
