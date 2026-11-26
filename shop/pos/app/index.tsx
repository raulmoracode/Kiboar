import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { colors, fonts, spacing } from "@/theme/tokens";

export default function Home() {
  const router = useRouter();

  return (
    <Screen>
      <Text style={styles.eyebrow}>Kiboar POS</Text>
      <Text style={styles.title}>Counter</Text>
      <Text style={styles.body}>
        Mobile till for the shop. This scaffold wires the screens and the Admin API contract; the
        Stripe QR is the next change.
      </Text>

      <Card>
        <Text style={styles.cardTitle}>What is wired</Text>
        <Text style={styles.cardBody}>
          Theme tokens, cart state, typed Admin API client and the checkout contract. The catalogue
          is demo data until the store has products.
        </Text>
      </Card>

      <View style={styles.actions}>
        <Button label="Open catalogue" onPress={() => router.push("/catalogue")} />
        <Button label="Orders" variant="ghost" onPress={() => router.push("/orders")} />
        <Button label="Settings" variant="ghost" onPress={() => router.push("/settings")} />
        <Button label="Sign in" variant="ghost" onPress={() => router.push("/login")} />
      </View>
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
  body: { color: colors.muted, fontFamily: fonts.sans, fontSize: 14, lineHeight: 21 },
  cardTitle: { color: colors.text, fontFamily: fonts.sans, fontSize: 14, fontWeight: "600" },
  cardBody: { color: colors.muted, fontFamily: fonts.sans, fontSize: 13, lineHeight: 20 },
  actions: { gap: spacing.sm, marginTop: spacing.md },
});
