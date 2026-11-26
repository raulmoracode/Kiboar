import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text } from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { useCart } from "@/lib/cart-context";
import { type CatalogueItem, imageUrl, listCatalogue, NotConfiguredError } from "@/lib/catalogue";
import { formatMoney } from "@/lib/format";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; items: CatalogueItem[] };

export default function Catalogue() {
  const router = useRouter();
  const cart = useCart();
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    listCatalogue()
      .then((items) => {
        if (!cancelled) {
          setState({ status: "ready", items });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message:
              error instanceof NotConfiguredError
                ? error.message
                : "The catalogue cannot be reached right now.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  if (state.status === "loading") {
    return (
      <Screen>
        <Text style={styles.eyebrow}>Catalogue</Text>
        <Text style={styles.title}>Products</Text>
        <Text style={styles.body}>Loading the catalogue…</Text>
      </Screen>
    );
  }

  if (state.status === "error") {
    return (
      <Screen>
        <Text style={styles.eyebrow}>Catalogue</Text>
        <Text style={styles.title}>Products</Text>
        <Text style={styles.body}>{state.message}</Text>
        <Button label="Try again" onPress={() => setAttempt((current) => current + 1)} />
        <Button label="Back home" variant="ghost" onPress={() => router.push("/")} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.eyebrow}>Catalogue</Text>
      <Text style={styles.title}>Products</Text>

      {state.items.length === 0 ? (
        <Text style={styles.body}>
          The POS sales channel has no published products yet. Run the shop seed and check the
          channel in Medusa.
        </Text>
      ) : (
        state.items.map((item) => {
          const photo = imageUrl(item.thumbnail);

          return (
            <Card key={item.variantId}>
              {photo ? (
                <Image
                  source={{ uri: photo }}
                  accessibilityLabel={`${item.title} photo`}
                  resizeMode="contain"
                  style={styles.photo}
                />
              ) : null}
              <Text style={styles.product}>{item.title}</Text>
              <Text style={styles.price}>{formatMoney(item.unitAmount, item.currency)}</Text>
              <Button
                label="Add to cart"
                onPress={() =>
                  cart.add({
                    id: item.variantId,
                    title: item.title,
                    unitAmount: item.unitAmount,
                    currency: item.currency,
                  })
                }
              />
            </Card>
          );
        })
      )}

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
  photo: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    height: 160,
    width: "100%",
  },
  product: { color: colors.text, fontFamily: fonts.sans, fontSize: 15, fontWeight: "500" },
  price: { color: colors.muted, fontFamily: fonts.mono, fontSize: 12, marginBottom: spacing.sm },
});
