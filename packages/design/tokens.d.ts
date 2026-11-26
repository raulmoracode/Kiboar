/**
 * The Kiboar palette as JavaScript values for surfaces that cannot read CSS,
 * such as the React Native POS. `tokens.css` mirrors these values for the web
 * apps; both live in this package so every product reads the same palette.
 */
export declare const kiboarColors: {
  readonly background: "#0a0b0d";
  readonly surface: "#0c0e11";
  readonly elevated: "#111318";
  readonly card: "rgba(255, 255, 255, 0.015)";
  readonly cardPressed: "rgba(255, 255, 255, 0.04)";
  readonly border: "rgba(255, 255, 255, 0.06)";
  readonly borderStrong: "rgba(255, 255, 255, 0.16)";
  readonly text: "#e4e4e7";
  readonly textStrong: "#f4f4f5";
  readonly muted: "#a1a1aa";
  readonly faint: "#71717a";
  readonly accent: "#bef264";
  readonly accentSoft: "rgba(190, 242, 100, 0.12)";
  readonly accentText: "#0a0b0d";
  readonly danger: "#f87171";
  readonly dangerSoft: "rgba(248, 113, 113, 0.12)";
};
export type KiboarColor = keyof typeof kiboarColors;
