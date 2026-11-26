import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/theme/tokens";

export function AppBar({
  back = false,
  backTo,
  action,
}: {
  back?: boolean;
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
      ) : (
        <View />
      )}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  back: {
    alignItems: "center",
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  pressed: { opacity: 0.7 },
  backLabel: { color: colors.muted, fontFamily: fonts.sans, fontSize: 18 },
});
