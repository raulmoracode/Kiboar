import { Pressable, StyleSheet, Text } from "react-native";
import Svg, { Path } from "react-native-svg";

import { colors, fonts, spacing } from "@/theme/tokens";

function BagIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6.5 8.5h11l1 12h-13l1-12Z"
        stroke={colors.muted}
        strokeLinejoin="round"
        strokeWidth={1.4}
      />
      <Path
        d="M9 8.5V7a3 3 0 0 1 6 0v1.5"
        stroke={colors.muted}
        strokeLinecap="round"
        strokeWidth={1.4}
      />
    </Svg>
  );
}

export function CartButton({ count, onPress }: { count: number; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={count > 0 ? `Open cart, ${count} items` : "Open cart, empty"}
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed ? styles.pressed : null]}
    >
      <BagIcon />
      <Text style={styles.label}>Cart</Text>
      {count > 0 ? <Text style={styles.count}>{count}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  pressed: { opacity: 0.7 },
  label: { color: colors.muted, fontFamily: fonts.sans, fontSize: 12 },
  count: { color: colors.accent, fontFamily: fonts.mono, fontSize: 11 },
});
