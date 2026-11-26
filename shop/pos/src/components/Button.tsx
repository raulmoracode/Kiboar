import { Pressable, StyleSheet, Text } from "react-native";

import { colors, fonts, radius, spacing } from "@/theme/tokens";

interface Props {
  label: string;
  onPress: () => void;
  variant?: "primary" | "ghost" | "danger";
  size?: "regular" | "compact";
  disabled?: boolean;
  accessibilityLabel?: string;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "regular",
  disabled = false,
  accessibilityLabel,
}: Props) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        size === "compact" ? styles.compact : styles.regular,
        variant === "primary" ? styles.primary : null,
        variant === "ghost" ? styles.ghost : null,
        variant === "danger" ? styles.danger : null,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
    >
      <Text
        style={[
          styles.label,
          size === "compact" ? styles.compactLabel : null,
          variant === "primary" ? styles.primaryLabel : null,
          variant === "ghost" ? styles.ghostLabel : null,
          variant === "danger" ? styles.dangerLabel : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: radius.md,
    justifyContent: "center",
  },
  regular: { minHeight: 52, paddingHorizontal: spacing.lg },
  compact: {
    borderRadius: radius.sm,
    minHeight: 40,
    minWidth: 44,
    paddingHorizontal: spacing.sm,
  },
  primary: { backgroundColor: colors.textStrong },
  ghost: { borderColor: colors.borderStrong, borderWidth: 1 },
  danger: { backgroundColor: colors.dangerSoft, borderColor: colors.danger, borderWidth: 1 },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.35 },
  label: { fontFamily: fonts.sans, fontSize: 14, fontWeight: "600" },
  compactLabel: { fontFamily: fonts.mono, fontSize: 16, fontWeight: "500" },
  primaryLabel: { color: colors.accentText },
  ghostLabel: { color: colors.text },
  dangerLabel: { color: colors.danger },
});
