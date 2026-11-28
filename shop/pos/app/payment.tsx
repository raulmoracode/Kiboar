import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { QrCode } from "@/components/QrCode";
import { Screen } from "@/components/Screen";
import { type CashSale, MedusaAdminClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { isValidBuyer } from "@/lib/buyer";
import { useCart } from "@/lib/cart-context";
import { apiUrl } from "@/lib/config";
import { formatMoney } from "@/lib/format";
import { colors, fonts, spacing, typography } from "@/theme/tokens";

type Method = "qr" | "cash";

export default function Payment() {
  const router = useRouter();
  const cart = useCart();
  const { token } = useAuth();
  const [method, setMethod] = useState<Method | null>(null);
  const [sale, setSale] = useState<CashSale | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currency = cart.lines[0]?.currency ?? "EUR";
  const buyerReady = isValidBuyer(cart.buyer);

  async function completeCash() {
    if (!token || !buyerReady) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const completed = await new MedusaAdminClient(apiUrl, token).createCashSale({
        items: cart.lines.map((line) => ({ variantId: line.id, quantity: line.quantity })),
        buyer: cart.buyer,
      });
      cart.clear();
      setSale(completed);
    } catch {
      setError("The cash sale could not be completed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sale) {
    return (
      <Screen>
        <View style={styles.success}>
          <Text accessibilityLiveRegion="polite" style={styles.successLabel}>
            Sale complete
          </Text>
          <Text style={[typography.amount, styles.amount]}>
            {formatMoney(sale.total, sale.currency_code)}
          </Text>
          <Text style={styles.saleId}>{sale.display_id ? `#${sale.display_id}` : sale.id}</Text>
          <Text style={styles.cashLabel}>Cash</Text>
        </View>

        <Button label="New sale" onPress={() => router.replace("/")} />
        <Button label="Sales register" variant="ghost" onPress={() => router.replace("/orders")} />
      </Screen>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <Screen>
        <AppBar back backTo="/catalogue" />
        <Text style={typography.body}>Cart is empty.</Text>
        <Button label="Start sale" onPress={() => router.push("/catalogue")} />
      </Screen>
    );
  }

  if (method === "qr") {
    return (
      <Screen>
        <AppBar back backTo="/cart" />
        <View style={styles.hero}>
          <Text style={[typography.amount, styles.amount]}>
            {formatMoney(cart.total, currency)}
          </Text>
          <QrCode value={null} />
        </View>
        <Text accessibilityLiveRegion="polite" style={styles.status}>
          Waiting for the backend
        </Text>
        <Button label="Change method" variant="ghost" onPress={() => setMethod(null)} />
      </Screen>
    );
  }

  if (method === "cash") {
    return (
      <Screen>
        <AppBar back backTo="/cart" />
        <View style={styles.hero}>
          <Text style={[typography.amount, styles.amount]}>
            {formatMoney(cart.total, currency)}
          </Text>
          <Text style={styles.cashLabel}>Cash</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          disabled={submitting}
          label={submitting ? "Completing…" : "Complete cash sale"}
          onPress={() => void completeCash()}
        />

        <Button label="Change method" variant="ghost" onPress={() => setMethod(null)} />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppBar back backTo="/cart" />
      <View style={styles.hero}>
        <Text style={[typography.amount, styles.amount]}>{formatMoney(cart.total, currency)}</Text>
      </View>
      <View style={styles.buyer}>
        <Field
          label="First name"
          onChangeText={(firstName) => cart.setBuyer({ firstName })}
          value={cart.buyer.firstName}
        />
        <Field
          label="Last name"
          onChangeText={(lastName) => cart.setBuyer({ lastName })}
          value={cart.buyer.lastName}
        />
        <Field
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          onChangeText={(email) => cart.setBuyer({ email })}
          value={cart.buyer.email}
        />
      </View>

      <View style={styles.methods}>
        <Button disabled={!buyerReady} label="Stripe link (QR)" onPress={() => setMethod("qr")} />
        <Button
          disabled={!buyerReady}
          label="Cash"
          variant="ghost"
          onPress={() => setMethod("cash")}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", gap: spacing.md },
  amount: { textAlign: "center" },
  buyer: { gap: spacing.sm, marginBottom: spacing.lg },
  methods: { gap: spacing.md },
  status: {
    color: colors.accent,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.4,
    textAlign: "center",
    textTransform: "uppercase",
  },
  cashLabel: {
    color: colors.accent,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  error: {
    color: colors.danger,
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    textAlign: "center",
  },
  success: { alignItems: "center", gap: spacing.md, paddingTop: spacing.xxl },
  successLabel: {
    color: colors.accent,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  saleId: { color: colors.muted, fontFamily: fonts.mono, fontSize: 13 },
});
