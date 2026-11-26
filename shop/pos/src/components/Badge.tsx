import { StyleSheet, Text } from "react-native";

import { colors, fonts, radius, spacing } from "@/theme/tokens";

export function Badge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "accent" | "danger";
}) {
  return (
    <Text
      style={[
        styles.badge,
        tone === "accent" ? styles.accent : null,
        tone === "danger" ? styles.danger : null,
      ]}
    >
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.muted,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    textTransform: "uppercase",
  },
  accent: { borderColor: colors.accent, color: colors.accent },
  danger: { borderColor: colors.danger, color: colors.danger },
});
