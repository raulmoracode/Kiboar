import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { QrCode } from "@/components/QrCode";
import { Screen } from "@/components/Screen";
import { useCart } from "@/lib/cart-context";
import { formatMoney } from "@/lib/format";
import { colors, fonts, typography } from "@/theme/tokens";

export default function Payment() {
  const router = useRouter();
  const cart = useCart();
  const currency = cart.lines[0]?.currency ?? "EUR";

  return (
    <Screen>
      <AppBar back backTo="/cart" title="Payment" />

      <PageHeader
        eyebrow="Payment"
        size="amount"
        subtitle="Ask the customer to scan the Stripe Checkout QR with their phone."
        title={formatMoney(cart.total, currency)}
      />

      <QrCode value={null} />

      <Card>
        <View style={styles.row}>
          <Text style={typography.eyebrow}>Status</Text>
          <Text style={styles.status}>Waiting for the backend</Text>
        </View>
        <Text style={typography.small}>
          The sale completes only when the backend reports the Checkout Session as paid. Never treat
          the QR or the customer's screen as proof of payment.
        </Text>
      </Card>

      <Button label="Back to cart" variant="ghost" onPress={() => router.push("/cart")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: "baseline", flexDirection: "row", justifyContent: "space-between" },
  status: {
    color: colors.accent,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});
