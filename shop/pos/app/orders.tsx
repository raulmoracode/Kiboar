import { StyleSheet, Text } from "react-native";

import { Screen } from "@/components/Screen";
import { colors, fonts } from "@/theme/tokens";

export default function Orders() {
  return (
    <Screen>
      <Text style={styles.eyebrow}>Orders</Text>
      <Text style={styles.title}>Today</Text>
      <Text style={styles.body}>
        The history will read the draft orders and orders from the POS sales channel. It is empty
        until the Admin API client is wired to a store.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.faint,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  title: { color: colors.text, fontFamily: fonts.sans, fontSize: 32, fontWeight: "500" },
  body: { color: colors.muted, fontFamily: fonts.sans, fontSize: 13, lineHeight: 20 },
});
