import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { typography } from "@/theme/tokens";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  size = "title",
  right,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  size?: "display" | "title" | "amount";
  right?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.text}>
        <Text style={typography.eyebrow}>{eyebrow}</Text>
        <Text
          accessibilityRole="header"
          style={
            size === "display"
              ? typography.display
              : size === "amount"
                ? typography.amount
                : typography.title
          }
        >
          {title}
        </Text>
        {subtitle ? <Text style={typography.body}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 16,
    justifyContent: "space-between",
  },
  text: { flexShrink: 1, gap: 6 },
});
