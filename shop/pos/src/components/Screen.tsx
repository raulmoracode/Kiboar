import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, layout, spacing } from "@/theme/tokens";

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[styles.scroll, styles.fill]}>
          <View style={styles.content}>{children}</View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
  scroll: { padding: layout.gutter },
  fill: { flex: 1 },
  content: {
    alignSelf: "center",
    gap: spacing.lg,
    maxWidth: layout.maxWidth,
    width: "100%",
  },
});
