import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";

import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { QuantityStepper } from "@/components/QuantityStepper";
import { Screen } from "@/components/Screen";
import { useCart } from "@/lib/cart-context";
import { imageUrl } from "@/lib/catalogue";
import { formatMoney } from "@/lib/format";
import { colors, fonts, radius, spacing, typography } from "@/theme/tokens";

export default function Cart() {
  const router = useRouter();
  const cart = useCart();
  const currency = cart.lines[0]?.currency ?? "EUR";
  const count = cart.count;

  return (
    <Screen>
      <AppBar back backTo="/catalogue" title="Cart" />

      <PageHeader
        eyebrow="Cart"
        subtitle={count === 1 ? "1 item" : `${count} items`}
        title="Current sale"
      />

      {cart.lines.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>The cart is empty</Text>
          <Text style={typography.body}>Open the catalogue and tap a board to start a sale.</Text>
          <Button label="Browse boards" onPress={() => router.push("/catalogue")} />
        </Card>
      ) : (
        cart.lines.map((line) => {
          const photo = imageUrl(line.thumbnail ?? null);

          return (
            <Card key={line.id}>
              <View style={styles.line}>
                {photo ? (
                  <Image
                    accessibilityLabel={`${line.title} photo`}
                    resizeMode="contain"
                    source={{ uri: photo }}
                    style={styles.thumb}
                  />
                ) : (
                  <View style={[styles.thumb, styles.thumbEmpty]}>
                    <Text style={styles.noPhoto}>No photo</Text>
                  </View>
                )}
                <View style={styles.info}>
                  <Text numberOfLines={1} style={styles.product}>
                    {line.title}
                  </Text>
                  <Text style={styles.unit}>
                    {formatMoney(line.unitAmount, line.currency)} each
                  </Text>
                </View>
                <Text style={styles.lineTotal}>
                  {formatMoney(line.unitAmount * line.quantity, line.currency)}
                </Text>
              </View>

              <View style={styles.controls}>
                <QuantityStepper
                  quantity={line.quantity}
                  onChange={(quantity) => cart.setQuantity(line.id, quantity)}
                />
                <Text style={typography.small}>
                  {line.quantity === 1 ? "1 unit" : `${line.quantity} units`}
                </Text>
              </View>
            </Card>
          );
        })
      )}

      <View style={styles.totalRow}>
        <Text style={typography.eyebrow}>Total</Text>
        <Text style={styles.total}>{formatMoney(cart.total, currency)}</Text>
      </View>

      <Button
        disabled={cart.lines.length === 0}
        label="Take payment"
        onPress={() => router.push("/payment")}
      />
      <Button label="Keep selling" variant="ghost" onPress={() => router.push("/catalogue")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyTitle: { ...typography.title, fontSize: 20, lineHeight: 26 },
  line: { alignItems: "center", flexDirection: "row", gap: spacing.md },
  thumb: {
    backgroundColor: colors.elevated,
    borderRadius: radius.sm,
    height: 48,
    padding: spacing.xs,
    width: 62,
  },
  thumbEmpty: {
    alignItems: "center",
    justifyContent: "center",
  },
  noPhoto: {
    color: colors.faint,
    fontFamily: fonts.mono,
    fontSize: 7,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  info: { flex: 1, gap: 2 },
  product: { color: colors.text, fontFamily: fonts.sans, fontSize: 15, fontWeight: "500" },
  unit: { color: colors.faint, fontFamily: fonts.mono, fontSize: 11 },
  lineTotal: { color: colors.text, fontFamily: fonts.mono, fontSize: 14 },
  controls: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalRow: {
    alignItems: "baseline",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.lg,
  },
  total: { color: colors.textStrong, fontFamily: fonts.mono, fontSize: 28, letterSpacing: -0.8 },
});
