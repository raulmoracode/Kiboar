import { Pressable, StyleSheet, Text } from "react-native";

import { colors, fonts, radius, spacing } from "@/theme/tokens";

interface Props {
  label: string;
  onPress: () => void;
  variant?: "primary" | "ghost";
  disabled?: boolean;
}

export function Button({ label, onPress, variant = "primary", disabled = false }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" ? styles.primary : styles.ghost,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
    >
      <Text style={[styles.label, variant === "primary" ? styles.primaryLabel : styles.ghostLabel]}>
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
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  primary: { backgroundColor: colors.accent },
  ghost: { borderColor: colors.borderStrong, borderWidth: 1 },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.4 },
  label: { fontFamily: fonts.sans, fontSize: 14, fontWeight: "600" },
  primaryLabel: { color: colors.accentText },
  ghostLabel: { color: colors.text },
});
