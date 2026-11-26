import { useRouter } from "expo-router";
import { StyleSheet, Text } from "react-native";

import { Button } from "@/components/Button";
import { QrCode } from "@/components/QrCode";
import { Screen } from "@/components/Screen";
import { useCart } from "@/lib/cart-context";
import { formatMoney } from "@/lib/format";
import { colors, fonts, spacing } from "@/theme/tokens";

export default function Payment() {
  const router = useRouter();
  const cart = useCart();
  const currency = cart.lines[0]?.currency ?? "EUR";

  return (
    <Screen>
      <Text style={styles.eyebrow}>Payment</Text>
      <Text style={styles.title}>{formatMoney(cart.total, currency)}</Text>
      <Text style={styles.body}>
        The QR will encode the Stripe Checkout Session URL returned by `POST /admin/pos/checkout`.
        The app only completes the sale when the backend reports the session as paid.
      </Text>

      <QrCode value={null} />

      <Button label="Back to cart" variant="ghost" onPress={() => router.push("/cart")} />
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
  title: { color: colors.text, fontFamily: fonts.mono, fontSize: 36, fontWeight: "500" },
  body: {
    color: colors.muted,
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
});
