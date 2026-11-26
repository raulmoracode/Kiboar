import { StyleSheet, Text } from "react-native";

import { AppBar } from "@/components/AppBar";
import { QrCode } from "@/components/QrCode";
import { Screen } from "@/components/Screen";
import { useCart } from "@/lib/cart-context";
import { formatMoney } from "@/lib/format";
import { colors, fonts, typography } from "@/theme/tokens";

export default function Payment() {
  const cart = useCart();
  const currency = cart.lines[0]?.currency ?? "EUR";

  return (
    <Screen>
      <AppBar back backTo="/cart" />

      <Text style={typography.amount}>{formatMoney(cart.total, currency)}</Text>

      <QrCode value={null} />

      <Text accessibilityLiveRegion="polite" style={styles.status}>
        Waiting for the backend
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  status: {
    color: colors.accent,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.4,
    textAlign: "center",
    textTransform: "uppercase",
  },
});
