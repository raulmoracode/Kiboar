import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { useCart } from "@/lib/cart-context";
import { formatMoney } from "@/lib/format";
import { colors, fonts, spacing } from "@/theme/tokens";

export default function Cart() {
  const router = useRouter();
  const cart = useCart();
  const currency = cart.lines[0]?.currency ?? "EUR";

  return (
    <Screen>
      <Text style={styles.eyebrow}>Cart</Text>
      <Text style={styles.title}>Current sale</Text>

      {cart.lines.length === 0 ? (
        <Text style={styles.body}>The cart is empty.</Text>
      ) : (
        cart.lines.map((line) => (
          <Card key={line.id}>
            <View style={styles.row}>
              <Text style={styles.product}>{line.title}</Text>
              <Text style={styles.price}>
                {formatMoney(line.unitAmount * line.quantity, line.currency)}
              </Text>
            </View>
            <View style={styles.controls}>
              <Button
                label="−"
                variant="ghost"
                onPress={() => cart.setQuantity(line.id, line.quantity - 1)}
              />
              <Text style={styles.quantity}>{line.quantity}</Text>
              <Button
                label="+"
                variant="ghost"
                onPress={() => cart.setQuantity(line.id, line.quantity + 1)}
              />
            </View>
          </Card>
        ))
      )}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.total}>{formatMoney(cart.total, currency)}</Text>
      </View>

      <Button
        label="Take payment"
        onPress={() => router.push("/payment")}
        disabled={cart.lines.length === 0}
      />
      <Button label="Back to catalogue" variant="ghost" onPress={() => router.push("/catalogue")} />
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
  body: { color: colors.muted, fontFamily: fonts.sans, fontSize: 13 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  product: { color: colors.text, fontFamily: fonts.sans, fontSize: 15, fontWeight: "500" },
  price: { color: colors.muted, fontFamily: fonts.mono, fontSize: 12 },
  controls: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  quantity: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 14,
    minWidth: 24,
    textAlign: "center",
  },
  totalRow: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.md,
  },
  totalLabel: { color: colors.muted, fontFamily: fonts.sans, fontSize: 13 },
  total: { color: colors.text, fontFamily: fonts.mono, fontSize: 18 },
});
