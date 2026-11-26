import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { CartButton } from "@/components/CartButton";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { apiUrl } from "@/lib/config";
import { colors, fonts, spacing, typography } from "@/theme/tokens";

export default function Home() {
  const router = useRouter();
  const { token } = useAuth();
  const cart = useCart();

  return (
    <Screen>
      <AppBar
        title="POS"
        action={<CartButton count={cart.count} onPress={() => router.push("/cart")} />}
      />

      <PageHeader
        eyebrow="Kiboar POS"
        size="display"
        subtitle="Start a sale, take payment and check the register."
        title="Counter"
      />

      <Card>
        <Text style={typography.eyebrow}>New sale</Text>
        <Text style={styles.cardTitle}>Open the catalogue</Text>
        <Text style={typography.body}>
          Tap a board, add it to the cart and take payment at the counter.
        </Text>
        <Button label="Start a sale" onPress={() => router.push("/catalogue")} />
      </Card>

      <View style={styles.actions}>
        <View style={styles.action}>
          <Button label="Sales register" variant="ghost" onPress={() => router.push("/orders")} />
          <Text style={typography.small}>Online and POS</Text>
        </View>
        <View style={styles.action}>
          <Button label="Settings" variant="ghost" onPress={() => router.push("/settings")} />
          <Text style={typography.small}>Till setup</Text>
        </View>
      </View>

      <Card>
        <View style={styles.row}>
          <Text style={typography.eyebrow}>Backend</Text>
          <Text style={styles.value}>{apiUrl}</Text>
        </View>
        <View style={styles.row}>
          <Text style={typography.eyebrow}>Session</Text>
          <Text style={styles.value}>{token ? "Signed in" : "Signed out"}</Text>
        </View>
        <Button
          label={token ? "Staff account" : "Sign in"}
          variant="ghost"
          onPress={() => router.push("/login")}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardTitle: { ...typography.title, fontSize: 20, lineHeight: 26 },
  actions: { flexDirection: "row", gap: spacing.md },
  action: { flex: 1, gap: spacing.sm },
  row: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  value: {
    color: colors.text,
    flexShrink: 1,
    fontFamily: fonts.mono,
    fontSize: 12,
    textAlign: "right",
  },
});
