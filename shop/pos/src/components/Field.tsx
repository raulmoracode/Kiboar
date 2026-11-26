import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors, fonts, radius, spacing, typography } from "@/theme/tokens";

interface Props {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "numeric" | "url";
}

export function Field({ label, value, onChangeText, ...input }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={typography.eyebrow}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        onBlur={() => setFocused(false)}
        onFocus={() => setFocused(true)}
        placeholderTextColor={colors.faint}
        selectionColor={colors.accent}
        style={[styles.input, focused ? styles.focused : null]}
        value={value}
        onChangeText={onChangeText}
        {...input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontFamily: fonts.sans,
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  focused: { borderColor: colors.borderStrong },
});
