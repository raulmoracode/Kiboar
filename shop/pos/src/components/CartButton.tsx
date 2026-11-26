import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, radius, spacing } from "@/theme/tokens";

export function CartButton({ count, onPress }: { count: number; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={count > 0 ? `Open cart, ${count} items` : "Open cart, empty"}
      accessibilityRole="button"
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed ? styles.pressed : null]}
    >
      <Text style={styles.label}>Cart</Text>
      <View style={[styles.count, count > 0 ? styles.countActive : null]}>
        <Text style={[styles.countLabel, count > 0 ? styles.countLabelActive : null]}>{count}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderColor: colors.borderStrong,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 38,
    paddingHorizontal: spacing.md,
  },
  pressed: { backgroundColor: colors.cardPressed },
  label: { color: colors.text, fontFamily: fonts.sans, fontSize: 12 },
  count: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    justifyContent: "center",
    minWidth: 20,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  countActive: { backgroundColor: colors.accentSoft },
  countLabel: { color: colors.faint, fontFamily: fonts.mono, fontSize: 10 },
  countLabelActive: { color: colors.accent },
});
