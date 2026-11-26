import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, radius, spacing } from "@/theme/tokens";

export function AppBar({
  title = "POS",
  back = false,
  backTo,
  action,
}: {
  title?: string;
  back?: boolean;
  /** Where the back action goes. Falls back to the navigation history. */
  backTo?: string;
  action?: ReactNode;
}) {
  const router = useRouter();

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    if (backTo) {
      router.replace(backTo);
    }
  }

  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        {back ? (
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={8}
            onPress={goBack}
            style={({ pressed }) => [styles.back, pressed ? styles.pressed : null]}
          >
            <Text style={styles.backLabel}>←</Text>
          </Pressable>
        ) : null}
        <Text style={styles.brand}>Kiboar</Text>
        <Text style={styles.divider}>/</Text>
        <Text style={styles.context}>{title}</Text>
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: spacing.md,
  },
  left: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  back: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  pressed: { backgroundColor: colors.cardPressed },
  backLabel: { color: colors.muted, fontFamily: fonts.sans, fontSize: 15 },
  brand: { color: colors.textStrong, fontFamily: fonts.sans, fontSize: 13, fontWeight: "600" },
  divider: { color: colors.faint, fontFamily: fonts.sans, fontSize: 12 },
  context: { color: colors.muted, fontFamily: fonts.sans, fontSize: 12 },
});
