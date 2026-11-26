import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { QuantityStepper } from "@/components/QuantityStepper";
import { Screen } from "@/components/Screen";
import { useCart } from "@/lib/cart-context";
import { imageUrl } from "@/lib/catalogue";
import { formatMoney } from "@/lib/format";
import { colors, fonts, radius, spacing, typography } from "@/theme/tokens";

function TrashIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 7h16M10 7V5.5A1.5 1.5 0 0 1 11.5 4h1A1.5 1.5 0 0 1 14 5.5V7M6.5 7l.8 11.2A2 2 0 0 0 9.3 20h5.4a2 2 0 0 0 2-1.8L17.5 7M10 11v5M14 11v5"
        stroke={colors.danger}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.4}
      />
    </Svg>
  );
}

export default function Cart() {
  const router = useRouter();
  const cart = useCart();
  const currency = cart.lines[0]?.currency ?? "EUR";

  return (
    <Screen>
      <AppBar back backTo="/catalogue" />

      {cart.lines.length === 0 ? (
        <View style={styles.stack}>
          <Text style={typography.body}>Cart is empty.</Text>
          <Button label="Start sale" onPress={() => router.push("/catalogue")} />
        </View>
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
                <Pressable
                  accessibilityLabel={`Remove ${line.title} from the cart`}
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => cart.setQuantity(line.id, 0)}
                  style={({ pressed }) => [styles.remove, pressed ? styles.removePressed : null]}
                >
                  <TrashIcon />
                </Pressable>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
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
  remove: {
    alignItems: "center",
    borderRadius: radius.sm,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  removePressed: { backgroundColor: colors.dangerSoft },
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
