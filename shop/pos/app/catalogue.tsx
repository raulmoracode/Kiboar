import { useRouter } from "expo-router";
import { StyleSheet, Text } from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { useCart } from "@/lib/cart-context";
import { formatMoney } from "@/lib/format";
import { colors, fonts, spacing } from "@/theme/tokens";

const demoProducts = [
  { id: "kb60", title: "Kiboar 60", unitAmount: 18900, currency: "EUR" },
  { id: "macropad-6", title: "Kiboar Macropad 6", unitAmount: 5900, currency: "EUR" },
  { id: "kb65", title: "Kiboar 65", unitAmount: 19900, currency: "EUR" },
] as const;

export default function Catalogue() {
  const router = useRouter();
  const cart = useCart();

  return (
    <Screen>
      <Text style={styles.eyebrow}>Catalogue</Text>
      <Text style={styles.title}>Products</Text>
      <Text style={styles.body}>
        Demo data. The next change replaces it with `GET /admin/products` scoped to the POS sales
        channel.
      </Text>

      {demoProducts.map((product) => (
        <Card key={product.id}>
          <Text style={styles.product}>{product.title}</Text>
          <Text style={styles.price}>{formatMoney(product.unitAmount, product.currency)}</Text>
          <Button label="Add to cart" onPress={() => cart.add(product)} />
        </Card>
      ))}

      <Button
        label={`Open cart (${cart.count})`}
        variant="ghost"
        onPress={() => router.push("/cart")}
      />
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
  product: { color: colors.text, fontFamily: fonts.sans, fontSize: 15, fontWeight: "500" },
  price: { color: colors.muted, fontFamily: fonts.mono, fontSize: 12, marginBottom: spacing.sm },
});
